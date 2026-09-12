import { execFileSync } from "node:child_process";
if (
  !process.env.CSC_NAME?.startsWith("Developer ID Application:") &&
  !process.env.CSC_LINK
)
  throw new Error(
    "Set CSC_NAME to a Developer ID Application identity, or supply CSC_LINK and CSC_KEY_PASSWORD. Use npm run package:mac for a local build.",
  );
if (
  !(
    process.env.APPLE_API_KEY &&
    process.env.APPLE_API_KEY_ID &&
    process.env.APPLE_API_ISSUER
  ) &&
  !(
    process.env.APPLE_ID &&
    process.env.APPLE_APP_SPECIFIC_PASSWORD &&
    process.env.APPLE_TEAM_ID
  )
)
  throw new Error(
    "Configure Apple notarization credentials before creating a distribution build.",
  );
execFileSync(process.execPath, ["scripts/package.mjs", "--release"], { stdio: "inherit" });
