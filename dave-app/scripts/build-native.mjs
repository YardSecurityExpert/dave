import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
if (process.platform !== "darwin")
  throw new Error("Build the macOS helper on a Mac.");
mkdirSync(root + "out/native", { recursive: true });
execFileSync(
  "xcrun",
  [
    "swiftc",
    "-O",
    "-target",
    "arm64-apple-macos14.0",
    "-framework",
    "AppKit",
    "-framework",
    "ApplicationServices",
    root + "native/DaveHelper.swift",
    "-o",
    root + "out/native/dave-helper",
  ],
  { stdio: "inherit" },
);
execFileSync(
  "xcrun",
  [
    "swiftc",
    "-O",
    "-target",
    "arm64-apple-macos14.0",
    root + "native/DaveChromeBridge.swift",
    "-o",
    root + "out/native/dave-chrome-bridge",
  ],
  { stdio: "inherit" },
);
