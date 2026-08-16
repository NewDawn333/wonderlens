import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");
const port = 8787;

function readEnv() {
  if (!fs.existsSync(envFile)) return {};
  const out = {};
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

function askKey() {
  return new Promise((resolve) => {
    const child = spawn("osascript", [
      "-e",
      'display dialog "Paste your xAI API key so Wonderlens can enchant photos in the park. Get one at console.x.ai" default answer "" with hidden answer with title "Wonderlens"',
    ]);
    let out = "";
    child.stdout.on("data", (chunk) => {
      out += chunk;
    });
    child.on("close", () => {
      const match = /text returned:(.*)$/s.exec(out);
      resolve(match ? match[1].trim() : "");
    });
  });
}

const env = readEnv();
if (!process.env.XAI_API_KEY && !env.XAI_API_KEY) {
  const key = await askKey();
  if (key) fs.writeFileSync(envFile, `XAI_API_KEY=${key}\nPORT=${port}\n`);
}

const server = spawn("node", ["server.mjs"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

await new Promise((resolve) => setTimeout(resolve, 600));

const lan = Object.values(os.networkInterfaces())
  .flat()
  .find((item) => item && item.family === "IPv4" && !item.internal)?.address;
console.log(`Local:  http://localhost:${port}`);
if (lan) console.log(`Wi-Fi:  http://${lan}:${port}`);
spawn("open", [`http://localhost:${port}`]);

const tunnel = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
});

function grab(text) {
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (!match) return;
  const url = match[0];
  fs.writeFileSync(path.join(root, ".tunnel-url"), `${url}\n`);
  spawn("pbcopy", { stdio: ["pipe", "ignore", "ignore"] }).stdin.end(url);
  console.log("\nWonderlens phone URL (copied):\n" + url + "\n");
  spawn("open", [url]);
}

tunnel.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  grab(chunk.toString());
});
tunnel.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  grab(chunk.toString());
});

const stop = () => {
  server.kill("SIGTERM");
  tunnel.kill("SIGTERM");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
