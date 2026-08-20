const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifests = [
  path.join(root, "manifests", "chrome.json"),
  path.join(root, "manifests", "firefox.json")
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const manifestPath of manifests) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const name = path.basename(manifestPath);

  assert(manifest.manifest_version === 3, `${name}: expected Manifest V3`);
  assert(manifest.version === "1.0.3", `${name}: expected version 1.0.3`);

  if (name === "firefox.json") {
    assert(
      manifest.browser_specific_settings.gecko.data_collection_permissions.required.includes("none"),
      `${name}: expected no-data-collection declaration`
    );
    assert(!manifest.browser_specific_settings.gecko_android, `${name}: should not declare Android compatibility yet`);
  }
  assert(!manifest.permissions, `${name}: should not request extension API permissions`);
  assert(!manifest.host_permissions, `${name}: should not request separate host_permissions`);
  assert(Array.isArray(manifest.content_scripts), `${name}: expected content_scripts`);

  const script = manifest.content_scripts[0];
  assert(script.run_at === "document_start", `${name}: content script should run at document_start`);
  assert(script.matches.includes("https://www.reddit.com/*"), `${name}: missing www.reddit.com match`);
  assert(script.matches.includes("https://reddit.com/*"), `${name}: missing reddit.com match`);
  assert(script.js.includes("src/blocker.js"), `${name}: missing shared blocker source`);
  assert(script.js.includes("src/content.js"), `${name}: missing content entrypoint`);
  assert(script.css.includes("src/content.css"), `${name}: missing anti-flash CSS`);

  for (const iconPath of Object.values(manifest.icons)) {
    assert(fs.existsSync(path.join(root, iconPath)), `${name}: missing icon ${iconPath}`);
  }
}

console.log("Manifest validation passed.");
