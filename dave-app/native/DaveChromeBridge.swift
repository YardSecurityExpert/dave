import Foundation
import Darwin

func fail() -> Never { exit(1) }
func writeAll(_ fd:Int32,_ data:Data) {
    data.withUnsafeBytes { raw in
        var offset=0
        while offset<raw.count {
            let n=Darwin.write(fd,raw.baseAddress!.advanced(by:offset),raw.count-offset)
            if n<=0 { fail() }; offset+=n
        }
    }
}
signal(SIGPIPE,SIG_IGN)
let args=CommandLine.arguments
guard args.count>1 else { fail() }
let origin=args[1]
let directory=FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support/dave-app")
let configURL:URL
if args.count==4 && args[2]=="--config" { configURL=URL(fileURLWithPath:args[3]) }
else { configURL=directory.appendingPathComponent("chrome-bridge.json") }
guard let data=try? Data(contentsOf:configURL),
      let config=(try? JSONSerialization.jsonObject(with:data)) as? [String:String],
      let path=config["socketPath"],let token=config["token"],let extensionId=config["extensionId"],
      origin=="chrome-extension://\(extensionId)/" else { fail() }
var address=sockaddr_un()
address.sun_family=sa_family_t(AF_UNIX)
let bytes=Array(path.utf8)+[UInt8(0)]
guard bytes.count<=MemoryLayout.size(ofValue:address.sun_path) else { fail() }
withUnsafeMutableBytes(of:&address.sun_path) { dest in dest.copyBytes(from:bytes) }
let fd=socket(AF_UNIX,SOCK_STREAM,0)
guard fd>=0 else { fail() }
let result=withUnsafePointer(to:&address) { ptr in
    ptr.withMemoryRebound(to:sockaddr.self,capacity:1) { Darwin.connect(fd,$0,socklen_t(MemoryLayout<sockaddr_un>.size)) }
}
guard result==0,let auth=try? JSONSerialization.data(withJSONObject:["type":"auth","token":token,"origin":origin]) else { fail() }
var length=UInt32(auth.count).littleEndian
writeAll(fd,Data(bytes:&length,count:4));writeAll(fd,auth)
DispatchQueue.global().async {
    var buffer=[UInt8](repeating:0,count:8192)
    while true {
        let n=Darwin.read(fd,&buffer,buffer.count)
        if n<=0 { exit(0) }
        writeAll(STDOUT_FILENO,Data(buffer.prefix(n)))
    }
}
var buffer=[UInt8](repeating:0,count:8192)
while true {
    let n=Darwin.read(STDIN_FILENO,&buffer,buffer.count)
    if n<=0 { close(fd);exit(0) }
    writeAll(fd,Data(buffer.prefix(n)))
}
