const KEY = "wonderlens-v1";
const API_KEY = "wonderlens-xai-key";

export function loadApiKey() {
  return normalizeApiKey(localStorage.getItem(API_KEY) || "");
}

export function normalizeApiKey(raw) {
  let value = String(raw || "").trim();
  value = value.replace(/^["']+|["']+$/g, "");
  value = value.replace(/^Bearer\s+/i, "").trim();
  const env = /(?:XAI_API_KEY\s*=\s*)?(xai-[A-Za-z0-9._~+/-]+)/i.exec(value);
  if (env) return env[1];
  return value.replace(/\s+/g, "");
}

export function maskedApiKey() {
  const key = loadApiKey();
  if (!key) return "";
  if (key.length < 8) return "saved";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export function saveApiKey(key) {
  const value = normalizeApiKey(key);
  if (value) localStorage.setItem(API_KEY, value);
  else localStorage.removeItem(API_KEY);
  return value;
}

const empty = () => ({
  onboarded: false,
  crew: [],
  parks: { dl: true, dca: true },
  shots: {},
  checkins: {},
  rides: [],
  practice: false,
});

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const state = { ...empty(), ...JSON.parse(raw) };
    if (!Array.isArray(state.rides)) state.rides = [];
    return state;
  } catch {
    return empty();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify({
    onboarded: state.onboarded,
    crew: state.crew,
    parks: state.parks,
    shots: state.shots,
    checkins: state.checkins,
    rides: Array.isArray(state.rides) ? state.rides : [],
    practice: state.practice,
  }));
}

const DB = "wonderlens";
const STORE = "photos";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putPhoto(id, blob) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getPhoto(id) {
  const db = await openDb();
  const value = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return value;
}

export async function deletePhoto(id) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.includes(",")) {
    throw new Error("That photo could not be saved.");
  }
  const [head, data] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(head)?.[1] || "image/jpeg";
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function compressImage(file, maxEdge = 1400, quality = 0.84) {
  const raw = file instanceof Blob ? file : await fetch(file).then((r) => r.blob());
  const bitmap = await createImageBitmap(raw);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Could not process that photo.");
  return blobToDataUrl(blob);
}
