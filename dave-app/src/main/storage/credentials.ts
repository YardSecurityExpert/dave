import { safeStorage } from "electron";
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import type { AIProvider } from "../../shared/ai";
export function credentialFilename(provider: AIProvider) {
  return provider === "featherless" ? "featherless-credentials.bin" : "credentials.bin";
}
export function loadKey(directory: string, provider: AIProvider = "openai"): string | undefined {
  const file = join(directory, credentialFilename(provider));
  if (!existsSync(file)) return provider === "openai" ? process.env.OPENAI_API_KEY : undefined;
  if (!safeStorage.isEncryptionAvailable())
    throw new Error("macOS credential storage is unavailable.");
  return safeStorage.decryptString(readFileSync(file)) || undefined;
}
export function storeKey(directory: string, key: string, provider: AIProvider = "openai") {
  const file = join(directory, credentialFilename(provider));
  // An encrypted empty value also disables a legacy .env key on the next launch.
  if (!safeStorage.isEncryptionAvailable())
    throw new Error("macOS credential storage is unavailable.");
  writeFileSync(file + ".tmp", safeStorage.encryptString(key), { mode: 0o600 });
  renameSync(file + ".tmp", file);
}
export function loadAmbiguousKey(directory: string): string | undefined {
  const file = join(directory, "ambiguous-credentials.bin");
  if (!existsSync(file)) return undefined;
  if (!safeStorage.isEncryptionAvailable())
    throw new Error("macOS credential storage is unavailable.");
  return safeStorage.decryptString(readFileSync(file)) || undefined;
}
export function storeAmbiguousKey(directory: string, key: string) {
  if (!safeStorage.isEncryptionAvailable())
    throw new Error("macOS credential storage is unavailable.");
  const file = join(directory, "ambiguous-credentials.bin");
  writeFileSync(file + ".tmp", safeStorage.encryptString(key), { mode: 0o600 });
  renameSync(file + ".tmp", file);
}
