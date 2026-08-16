import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = path.join(root, "public");
const to = path.join(root, "www");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const nextFrom = path.join(src, entry.name);
    const nextTo = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(nextFrom, nextTo);
    else fs.copyFileSync(nextFrom, nextTo);
  }
}

fs.rmSync(to, { recursive: true, force: true });
copyDir(from, to);
console.log("Copied public/ -> www/");
