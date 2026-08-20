const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const release = path.join(root, "release");
const targets = [
  { name: "chrome", manifest: "chrome.json" },
  { name: "firefox", manifest: "firefox.json" }
];

function copyRecursive(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function buildTarget(target) {
  const outDir = path.join(dist, target.name);
  emptyDir(outDir);

  copyRecursive(path.join(root, "src"), path.join(outDir, "src"));
  copyRecursive(path.join(root, "assets", "icons"), path.join(outDir, "assets", "icons"));
  fs.copyFileSync(path.join(root, "manifests", target.manifest), path.join(outDir, "manifest.json"));

  const zipPath = path.join(release, `reddit-upsell-blocker-${target.name}.zip`);
  fs.rmSync(zipPath, { force: true });
  execFileSync("zip", ["-qr", zipPath, "."], { cwd: outDir, stdio: "inherit" });
  console.log(`Built ${target.name}: ${path.relative(root, outDir)} and ${path.relative(root, zipPath)}`);
}

emptyDir(dist);
emptyDir(release);
targets.forEach(buildTarget);
