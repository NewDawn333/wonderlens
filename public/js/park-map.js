import { PARK_MAPS, PARKS } from "./data.js";

const CAM_KEY = "wonderlens-map-cam";
let leafletPromise = null;
let live = null;
let layerMode = "photo";
let mountGen = 0;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "/vendor/leaflet/leaflet.css";
      css.dataset.leaflet = "1";
      document.head.appendChild(css);
    }
    const script = document.createElement("script");
    script.src = "/vendor/leaflet/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Map tiles library failed to load."));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

function readCam() {
  try {
    return JSON.parse(sessionStorage.getItem(CAM_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCam(parkId, cam) {
  const all = readCam();
  all[parkId] = cam;
  sessionStorage.setItem(CAM_KEY, JSON.stringify(all));
}

export function saveParkMapCamera() {
  if (!live?.map || !live.park) return;
  const center = live.map.getCenter();
  writeCam(live.park, { lat: center.lat, lng: center.lng, zoom: live.map.getZoom(), layer: layerMode });
}

export function destroyParkMap() {
  saveParkMapCamera();
  if (live?.map) {
    live.map.remove();
  }
  live = null;
}

function pinIcon(L, spot, { near, done }) {
  const cls = ["map-pin", done ? "done" : "", near ? "near" : ""].filter(Boolean).join(" ");
  return L.divIcon({
    className: "map-pin-wrap",
    iconSize: [86, 36],
    iconAnchor: [12, 28],
    html: `<button type="button" class="${cls}" style="--pin:${spot.color}" data-spot="${spot.id}">
      <span class="map-pin-dot"></span>
      <span class="map-pin-label">${spot.short}</span>
    </button>`,
  });
}

function youIcon(L) {
  return L.divIcon({
    className: "map-you-wrap",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<span class="map-you" aria-label="You are here"></span>`,
  });
}

function addTiles(L, map) {
  const photo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri",
    maxZoom: 20,
    maxNativeZoom: 19,
  });
  const labels = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {
    attribution: "© OSM © CARTO",
    maxZoom: 20,
    subdomains: "abcd",
    pane: "overlayPane",
  });
  const streets = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap © CARTO",
    maxZoom: 20,
    subdomains: "abcd",
  });
  const show = () => {
    map.removeLayer(photo);
    map.removeLayer(labels);
    map.removeLayer(streets);
    if (layerMode === "map") {
      streets.addTo(map);
    } else {
      photo.addTo(map);
      labels.addTo(map);
    }
  };
  show();
  return { show };
}

export function updateParkMapYou(loc) {
  if (!live?.map || !window.L) return;
  if (loc?.lat == null) {
    if (live.you) {
      live.map.removeLayer(live.you);
      live.you = null;
    }
    return;
  }
  const latlng = [loc.lat, loc.lng];
  if (live.you) live.you.setLatLng(latlng);
  else live.you = window.L.marker(latlng, { icon: youIcon(window.L), interactive: false, zIndexOffset: 600 }).addTo(live.map);
}

export async function mountParkMap({
  el,
  park,
  spots,
  loc,
  onOpen,
  isNear,
  isDone,
  inPractice,
}) {
  if (!el) return;
  const frame = PARK_MAPS[park];
  if (!frame) return;
  const gen = ++mountGen;
  const L = await loadLeaflet();
  if (gen !== mountGen || !el.isConnected) return;
  destroyParkMap();

  const saved = readCam()[park] || {};
  if (saved.layer === "photo" || saved.layer === "map") layerMode = saved.layer;
  const start = saved.lat != null ? [saved.lat, saved.lng] : [frame.center.lat, frame.center.lng];
  const zoom = saved.zoom || frame.zoom;

  const map = L.map(el, {
    zoomControl: true,
    attributionControl: true,
    tap: true,
    touchZoom: true,
    dragging: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: false,
    keyboard: true,
    minZoom: frame.minZoom,
    maxZoom: frame.maxZoom,
    maxBounds: frame.bounds,
    maxBoundsViscosity: 0.85,
    zoomSnap: 0.25,
  });
  map.setView(start, zoom);
  map.attributionControl?.setPrefix("");
  L.DomEvent.disableScrollPropagation(el);
  const tiles = addTiles(L, map);

  const markers = [];
  for (const spot of spots) {
    const near = Boolean(isNear(spot) || inPractice);
    const done = Boolean(isDone(spot));
    const marker = L.marker([spot.lat, spot.lng], {
      icon: pinIcon(L, spot, { near, done }),
      keyboard: true,
      title: spot.name,
      riseOnHover: true,
    }).addTo(map);
    marker.on("click", () => onOpen(spot.id));
    markers.push(marker);
  }

  live = { map, park, you: null, markers, tiles };
  updateParkMapYou(loc);
  map.on("moveend", saveParkMapCamera);
  map.on("zoomend", saveParkMapCamera);
  requestAnimationFrame(() => map.invalidateSize());

  const tools = el.parentElement?.querySelector(".map-tools");
  tools?.querySelector("[data-map-layer]")?.addEventListener("click", () => {
    layerMode = layerMode === "photo" ? "map" : "photo";
    tiles.show();
    saveParkMapCamera();
    const btn = tools.querySelector("[data-map-layer]");
    if (btn) btn.textContent = layerMode === "photo" ? "Map" : "Photo";
  });
  tools?.querySelector("[data-map-recenter]")?.addEventListener("click", () => {
    if (loc?.lat != null) map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 18), { duration: 0.6 });
    else map.flyTo([frame.center.lat, frame.center.lng], frame.zoom, { duration: 0.6 });
  });
  const layerBtn = tools?.querySelector("[data-map-layer]");
  if (layerBtn) layerBtn.textContent = layerMode === "photo" ? "Map" : "Photo";
}

export function parkMapHint(park) {
  return `Live ${PARKS[park]?.short || "park"} map. Drag to pan, pinch to zoom. Pins sit on the real GPS spots.`;
}
