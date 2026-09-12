import AppKit
import ApplicationServices

// JSON-lines over inherited pipes. No listening socket or ambient commands.
func emit(_ value: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: value),
          let line = String(data: data, encoding: .utf8) else { return }
    FileHandle.standardOutput.write((line + "\n").data(using: .utf8)!)
}
func appleString(_ value: String) -> String {
    return "\"" + value.replacingOccurrences(of: "\\", with: "\\\\")
        .replacingOccurrences(of: "\"", with: "\\\"")
        .replacingOccurrences(of: "\n", with: "\\n")
        .replacingOccurrences(of: "\r", with: "\\r") + "\""
}
func runScript(_ source: String) -> NSAppleEventDescriptor? {
    var error: NSDictionary?
    let result = NSAppleScript(source: "with timeout of 1 seconds\n" + source + "\nend timeout")?.executeAndReturnError(&error)
    return error == nil ? result : nil
}
func axString(_ element: AXUIElement, _ attribute: String) -> String {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, attribute as CFString, &value) == .success else { return "" }
    return String((value as? String ?? "").prefix(4000))
}
func observe(_ request: [String: Any], id: String) {
    guard let app = NSWorkspace.shared.frontmostApplication else { emit(["id": id, "status": "unavailable"]); return }
    let name = app.localizedName ?? ""
    let bundle = app.bundleIdentifier ?? ""
    let excluded = request["excludedApps"] as? [String] ?? []
    if excluded.contains(where: { $0.lowercased() == name.lowercased() || $0.lowercased() == bundle.lowercased() }) {
        emit(["id": id, "status": "excluded"]); return
    }
    if bundle.hasPrefix("app.thedave.") || name == "Electron" || name == "Dave" {
        emit(["id": id, "status": "self"]); return
    }
    let chrome = bundle == "com.google.Chrome"
    let safari = bundle == "com.apple.Safari"
    let otherBrowser = ["company.thebrowser.Browser", "com.brave.Browser", "com.microsoft.edgemac", "org.mozilla.firefox"].contains(bundle)
    if (chrome && request["chromeEnabled"] as? Bool != true) || (safari && request["safariEnabled"] as? Bool != true) || otherBrowser {
        emit(["id": id, "status": "browser-disabled"]); return
    }
    guard AXIsProcessTrusted() else { emit(["id": id, "status": "permission"]); return }
    var result: [String: Any] = ["id": id, "status": "ready", "app": name, "bundleId": bundle]
    if chrome || safari {
        let source = chrome
          ? "tell application id \"com.google.Chrome\"\nif (count of windows) is 0 then return {\"\", \"\", \"empty\"}\nreturn {URL of active tab of front window, title of active tab of front window, mode of front window}\nend tell"
          : "tell application id \"com.apple.Safari\"\nif (count of windows) is 0 then return {\"\", \"\", \"empty\"}\nreturn {URL of current tab of front window, name of current tab of front window, \"normal\"}\nend tell"
        guard let tab = runScript(source) else { emit(["id": id, "status": "automation"]); return }
        let mode = tab.atIndex(3)?.stringValue ?? ""
        if mode == "incognito" || mode == "empty" { emit(["id": id, "status": "private-or-empty"]); return }
        result["url"] = String((tab.atIndex(1)?.stringValue ?? "").prefix(8192))
        result["title"] = String((tab.atIndex(2)?.stringValue ?? "").prefix(4000))
    } else {
        let axApp = AXUIElementCreateApplication(app.processIdentifier)
        AXUIElementSetMessagingTimeout(axApp, 0.5)
        var window: CFTypeRef?
        if AXUIElementCopyAttributeValue(axApp, kAXFocusedWindowAttribute as CFString, &window) == .success,
           let window = window, CFGetTypeID(window) == AXUIElementGetTypeID() {
            result["title"] = axString(window as! AXUIElement, kAXTitleAttribute)
        } else { result["title"] = "" }
    }
    emit(result)
}
func recover(_ request: [String: Any], id: String) {
    guard let bundle = request["bundleId"] as? String, !bundle.isEmpty,
          let appURL = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundle) else {
        emit(["id": id, "error": "The saved app is no longer installed."]); return
    }
    let urlText = request["url"] as? String
    if let urlText = urlText, let url = URL(string: urlText), ["http", "https"].contains(url.scheme ?? ""), url.user == nil, url.password == nil {
        // Find one exact existing tab before opening one fallback URL in its recorded browser.
        if bundle == "com.google.Chrome" || bundle == "com.apple.Safari" {
            let select = bundle == "com.google.Chrome"
              ? "set active tab index of w to i"
              : "set current tab of w to tab i of w"
            let source = "tell application id " + appleString(bundle) + "\nrepeat with w in windows\nrepeat with i from 1 to count of tabs of w\nif URL of tab i of w is " + appleString(urlText) + " then\n" + select + "\nset index of w to 1\nactivate\nreturn true\nend if\nend repeat\nend repeat\nreturn false\nend tell"
            if runScript(source)?.booleanValue == true { emit(["id": id, "ok": true]); return }
        }
        let config = NSWorkspace.OpenConfiguration()
        config.activates = true
        NSWorkspace.shared.open([url], withApplicationAt: appURL, configuration: config) { _, error in
            emit(error == nil ? ["id": id, "ok": true] : ["id": id, "error": "The saved page could not be opened."])
        }
        return
    }
    guard let running = NSRunningApplication.runningApplications(withBundleIdentifier: bundle).first else {
        emit(["id": id, "error": "Open your saved work app, then try Return to work again."]); return
    }
    let wantedTitle = request["title"] as? String ?? ""
    if !wantedTitle.isEmpty && AXIsProcessTrusted() {
        let axApp = AXUIElementCreateApplication(running.processIdentifier)
        AXUIElementSetMessagingTimeout(axApp, 0.5)
        var value: CFTypeRef?
        if AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute as CFString, &value) == .success,
           let windows = value as? [AXUIElement],
           let window = windows.first(where: { axString($0, kAXTitleAttribute) == wantedTitle }) {
            AXUIElementPerformAction(window, kAXRaiseAction as CFString)
        } else { emit(["id": id, "error": "The saved window is closed. Your next action is still in Dave."]); return }
    }
    if running.activate(options: []) { emit(["id": id, "ok": true]) }
    else { emit(["id": id, "error": "The saved app could not be activated."]) }
}
func handle(_ request: [String: Any]) {
    guard let id = request["id"] as? String else { return }
    switch request["op"] as? String {
    case "ping": emit(["id": id, "ok": true, "protocolVersion": 1])
    case "observe": observe(request, id: id)
    case "recover": recover(request, id: id)
    default: emit(["id": id, "error": "Unknown command"])
    }
}
let application = NSApplication.shared
application.setActivationPolicy(.prohibited)
DispatchQueue.global(qos: .utility).async {
    while let line = readLine() {
        guard line.utf8.count <= 32768, let data = line.data(using: .utf8),
              let request = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else { continue }
        DispatchQueue.main.async { handle(request) }
    }
    exit(0)
}
RunLoop.main.run()
