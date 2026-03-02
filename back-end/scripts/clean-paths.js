const fs = require("fs");

const paths = process.argv.slice(2);

if (paths.length === 0) {
  console.error("Usage: node ./scripts/clean-paths.js <path> [more-paths...]");
  process.exit(1);
}

for (const targetPath of paths) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}
