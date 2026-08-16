import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 8787);
const PUBLIC_DIR = path.join(__dirname, "public");
const MODEL_IMAGE = "grok-imagine-image-2.0";
const MODEL_TEXT = "grok-4.5";
const MAX_BODY = 18 * 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function apiKey() {
  return (process.env.XAI_API_KEY || "").trim();
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Cache-Control": "no-store",
    ...headers,
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendJson(res, status, obj) {
  send(res, status, obj, { "Content-Type": "application/json; charset=utf-8" });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("Photo is too large. Try a smaller shot."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  let filePath = decodeURIComponent(url.pathname);
  if (filePath === "/") filePath = "/index.html";
  const safe = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(PUBLIC_DIR, safe);
  if (!full.startsWith(PUBLIC_DIR)) {
    send(res, 403, "Forbidden", { "Content-Type": "text/plain" });
    return;
  }
  fs.readFile(full, (err, data) => {
    if (err) {
      send(res, 404, "Not found", { "Content-Type": "text/plain" });
      return;
    }
    const ext = path.extname(full).toLowerCase();
    send(res, 200, data, { "Content-Type": MIME[ext] || "application/octet-stream" });
  });
}

async function xai(pathname, payload) {
  const key = apiKey();
  if (!key) {
    const err = new Error("Missing XAI_API_KEY. Add it in Settings or the .env file.");
    err.status = 400;
    throw err;
  }
  const res = await fetch(`https://api.x.ai/v1${pathname}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      `Imagine request failed (${res.status})`;
    const err = new Error(typeof message === "string" ? message : JSON.stringify(message));
    err.status = res.status;
    throw err;
  }
  return data;
}

async function toDataUrl(image) {
  if (!image) return null;
  if (image.b64_json) {
    const mime = image.mime_type || "image/jpeg";
    return `data:${mime};base64,${image.b64_json}`;
  }
  if (image.url) {
    const res = await fetch(image.url);
    if (!res.ok) throw new Error("Could not download the enchanted photo.");
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  }
  return null;
}

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const item of data?.output || []) {
    for (const part of item?.content || []) {
      if (typeof part?.text === "string") chunks.push(part.text);
    }
  }
  if (chunks.length) return chunks.join("\n").trim();
  const choice = data?.choices?.[0]?.message?.content;
  if (typeof choice === "string") return choice.trim();
  return "";
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, "http://localhost");

  try {
    if (req.method === "GET" && url.pathname === "/api/status") {
      sendJson(res, 200, { ok: true, hasKey: Boolean(apiKey()) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/key") {
      const body = JSON.parse((await readBody(req)).toString("utf8") || "{}");
      const key = String(body.key || "").trim();
      if (!key.startsWith("xai-") && key.length < 20) {
        sendJson(res, 400, { error: "That does not look like an xAI key." });
        return;
      }
      process.env.XAI_API_KEY = key;
      fs.writeFileSync(path.join(__dirname, ".env"), `XAI_API_KEY=${key}\nPORT=${PORT}\n`, "utf8");
      sendJson(res, 200, { ok: true, hasKey: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/enchant") {
      const body = JSON.parse((await readBody(req)).toString("utf8") || "{}");
      const image = String(body.image || "");
      const prompt = String(body.prompt || "").trim();
      if (!image.startsWith("data:image/")) {
        sendJson(res, 400, { error: "Send a photo first." });
        return;
      }
      if (!prompt) {
        sendJson(res, 400, { error: "Missing enchant prompt." });
        return;
      }
      const data = await xai("/images/edits", {
        model: MODEL_IMAGE,
        prompt,
        image: { url: image, type: "image_url" },
        response_format: "b64_json",
      });
      const out = await toDataUrl(data?.data?.[0] || data);
      if (!out) {
        sendJson(res, 502, { error: "Imagine returned no image. Try again." });
        return;
      }
      sendJson(res, 200, { image: out });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/buddy") {
      const body = JSON.parse((await readBody(req)).toString("utf8") || "{}");
      const land = String(body.land || "the park");
      const crew = String(body.crew || "a family");
      const kind = String(body.kind || "story");
      const wait = String(body.wait || "a ride line");
      const prompt = `You are Line Buddy, a warm, funny park companion for kids and parents waiting in ${wait} at ${land}. The crew is: ${crew}.
Give one ${kind} now. Rules:
- Kid-safe, kind, and specific to this land
- 80-140 words max
- No copyrighted character names, songs, or official mascots
- No brand logos
- Make it playable or tellable out loud right now
- End with one tiny follow-up the kids can answer`;
      const data = await xai("/responses", {
        model: MODEL_TEXT,
        input: prompt,
      });
      const text = extractText(data);
      if (!text) {
        sendJson(res, 502, { error: "Line Buddy is quiet. Try again." });
        return;
      }
      sendJson(res, 200, { text });
      return;
    }

    if (req.method === "GET") {
      serveStatic(req, res);
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    const status = err.status && Number(err.status) < 600 ? Number(err.status) : 500;
    sendJson(res, status, { error: err.message || "Server error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Wonderlens ready on http://localhost:${PORT}`);
});
