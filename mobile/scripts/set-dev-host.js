/**
 * Detects the current machine's LAN IP and writes EXPO_PUBLIC_DEV_HOST to
 * mobile/.env so the app connects to the correct dev server on any network.
 *
 * Run automatically via the "prestart", "preandroid", and "preios" npm hooks.
 */

const os = require("os");
const fs = require("fs");
const path = require("path");

const ENV_PATH = path.resolve(__dirname, "../.env");

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const entry of iface ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }
  return "localhost";
}

const ip = getLocalIp();

// Read existing .env (if any), replace or append EXPO_PUBLIC_DEV_HOST
let envContent = "";
if (fs.existsSync(ENV_PATH)) {
  envContent = fs.readFileSync(ENV_PATH, "utf8");
}

if (/^EXPO_PUBLIC_DEV_HOST=/m.test(envContent)) {
  envContent = envContent.replace(
    /^EXPO_PUBLIC_DEV_HOST=.*/m,
    `EXPO_PUBLIC_DEV_HOST=${ip}`,
  );
} else {
  envContent = envContent
    ? `${envContent.trimEnd()}\nEXPO_PUBLIC_DEV_HOST=${ip}\n`
    : `EXPO_PUBLIC_DEV_HOST=${ip}\n`;
}

fs.writeFileSync(ENV_PATH, envContent, "utf8");
console.log(`[set-dev-host] EXPO_PUBLIC_DEV_HOST set to ${ip}`);
