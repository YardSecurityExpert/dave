import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
// iCloud adds Finder metadata to bundles in Documents, which codesign rejects.
const release = process.argv.includes("--release");
const output = join(
  homedir(),
  "Downloads",
  release ? "Dave-macOS-release" : "Dave-macOS-alpha",
);
mkdirSync(output, { recursive: true });
execFileSync(
  "npx",
  [
    "electron-builder",
    "--mac",
    "--arm64",
    "--publish",
    "never",
    "--config",
    release ? "electron-builder.yml" : "electron-builder.local.yml",
    "--config.directories.output=" + output,
  ],
  { cwd: root, stdio: "inherit" },
);
const appPath = join(output, "mac-arm64", "Dave.app");
execFileSync("codesign", ["--verify", "--deep", "--strict", appPath], {
  stdio: "inherit",
});
const artifacts = join(root, "dist");
mkdirSync(artifacts, { recursive: true });
writeFileSync(
  join(artifacts, "last-build.json"),
  JSON.stringify({ appPath, localOnly: !release }, null, 2),
);
console.log("Dave app: " + appPath);
const extensionOutput = join(output, "Dave-Chrome-helper");
rmSync(extensionOutput, { recursive: true, force: true });
cpSync(join(root, "../dave-extension"), extensionOutput, { recursive: true });
execFileSync("ditto", [
  "-c",
  "-k",
  "--sequesterRsrc",
  "--keepParent",
  extensionOutput,
  join(output, "Dave-Chrome-helper.zip"),
]);
console.log("Chrome helper: " + extensionOutput);
console.log("Installer: " + output);
