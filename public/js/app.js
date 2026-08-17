import {
  BUDDY_KINDS,
  GAMES,
  PARKS,
  PARK_CENTER,
  PRACTICE_KM,
  SPOTS,
  TRAIL,
  enchantPrompt,
  formatCoords,
  formatDistance,
  formatRidePlace,
  haversineM,
  RIDE_PRESETS,
  cleanPolishedExtras,
  extrasForRideLook,
  gpsMovedEnough,
  lineBuddyPrompt,
  polishRideIdeaPrompt,
  rideEnchantPrompt,
  rideHeading,
  ridePresetById,
} from "./data.js";
import {
  blobToDataUrl,
  compressImage,
  dataUrlToBlob,
  deletePhoto,
  getPhoto,
  loadApiKey,
  loadState,
  maskedApiKey,
  normalizeApiKey,
  putPhoto,
  saveApiKey,
  saveState,
} from "./store.js";
import { destroyParkMap, mountParkMap, parkMapHint, saveParkMapCamera, updateParkMapYou } from "./park-map.js";
import {
  APP_NEWS,
  installedBuildLabel,
  installedVsLatest,
  latestBuildLabel,
} from "./news.js";
import {
  GUESSTURE_SECONDS,
  GUESSTURE_WORDS,
  createTiltGate,
  shuffleWords,
  tiltZone,
  betaFromGravity,
} from "./guesstures.js";

const GITHUB_REPO = "NewDawn333/wonderlens";
const RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases/latest`;
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

const app = document.querySelector("#app");
const state = loadState();
const loc = { lat: null, lng: null, acc: null, err: "" };
let view = state.onboarded ? "map" : "splash";
let park = state.parks.dl ? "dl" : "dca";
let activeSpot = null;
let draft = { original: "", enchanted: "", note: "" };
let rideLook = { style: "opening-day", idea: "", polished: "" };
let keepScroll = false;
let split = 52;
let game = { kind: null, index: 0, land: "Main Street" };
let guess = blankGuess();
let guessTick = 0;
let guessGate = createTiltGate();
let guessWake = null;
let guessListening = false;
let hasKey = Boolean(loadApiKey());
let toast = "";
let busy = "";
let keyProbe = "";
let appInfo = { version: "web", build: "0" };
let latestRelease = null;
let releaseStatus = "idle";
let releaseError = "";

function isNative() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

function nativePlugin(name) {
  return window.Capacitor?.Plugins?.[name] || null;
}

function persist() {
  saveState(state);
}

function blankGuess() {
  return {
    phase: "intro",
    words: [],
    index: 0,
    remaining: GUESSTURE_SECONDS,
    countdown: 3,
    got: [],
    passed: [],
    flash: "",
    flashUntil: 0,
    endsAt: 0,
    countAt: 0,
    tilt: "unknown",
    sensor: false,
  };
}

function setView(next) {
  if (view === "guess" && next !== "guess") stopGuess();
  if (next !== "shoot" && next !== "result") busy = "";
  view = next;
  if (next === "settings") loadLatestRelease();
  render();
}

function newsList(items, empty = "No notes for this build yet.") {
  if (!items?.length) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return `<ul class="news">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function enabledSpots() {
  return SPOTS.filter((spot) => state.parks[spot.park]);
}

function spotById(id) {
  const parkSpot = SPOTS.find((spot) => spot.id === id);
  if (parkSpot) return parkSpot;
  const ride = rideList().find((item) => item.id === id);
  return ride ? rideSpotFrom(ride) : null;
}

function rideList() {
  return Array.isArray(state.rides) ? state.rides : [];
}

function isRide(spot) {
  return Boolean(spot) && (spot.kind === "ride" || String(spot.id || "").startsWith("ride-"));
}

function isShotSaved(spot) {
  if (!spot) return false;
  if (isRide(spot)) return rideList().some((item) => item.id === spot.id);
  return Boolean(state.shots[spot.id]);
}

function rideSpotFrom(record) {
  const place = record.place || record.heading || "On the road";
  return {
    id: record.id,
    kind: "ride",
    park: "ride",
    land: "Car ride",
    name: place,
    short: "Ride",
    stamp: record.stamp || "Road light",
    mission: `Catch ${pairLabel()} in the car — window light, snacks, sleepy smiles, the stretch of road.`,
    clue: [record.heading, record.place].filter(Boolean).join(" · ") || "Wherever you are on the drive.",
    lat: record.lat ?? null,
    lng: record.lng ?? null,
    place: record.place || "",
    heading: record.heading || "On the road",
    at: record.at || Date.now(),
    radiusM: 1e9,
  };
}

function formatWhen(at) {
  if (!at) return "";
  try {
    return new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function distanceTo(spot) {
  if (loc.lat == null) return null;
  return haversineM(loc, spot);
}

function isNear(spot) {
  const meters = distanceTo(spot);
  return meters != null && meters <= spot.radiusM;
}

function isDone(spot) {
  return Boolean(state.shots[spot.id]);
}

function nextSpot() {
  const trail = [
    ...(state.parks.dl ? TRAIL.dl : []),
    ...(state.parks.dca ? TRAIL.dca : []),
  ];
  const open = trail.map(spotById).filter((spot) => spot && !isDone(spot));
  if (!open.length) return null;
  if (loc.lat == null) return open[0];
  return open.slice().sort((a, b) => distanceTo(a) - distanceTo(b))[0];
}

function crewLabel() {
  return state.crew.length ? state.crew.join(" & ") : "the crew";
}

function pairLabel() {
  return state.crew.length ? state.crew.join(" & ") : "the two of you";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function syncRideLook() {
  const el = app.querySelector("#ride-idea");
  if (el) rideLook.idea = el.value;
  return String(rideLook.idea || "").trim();
}

function rideStyleNote() {
  if (rideLook.style === "custom") {
    return rideLook.polished
      ? "Using your polished prompt. Faces stay. Clothes and year go to 1955."
      : "Your short idea is wrapped so faces stay and the year becomes 1955.";
  }
  return ridePresetById(rideLook.style)?.blurb || "Pick a 1955 look.";
}

function kmFromPark() {
  if (loc.lat == null) return null;
  return haversineM(loc, PARK_CENTER) / 1000;
}

function inPractice() {
  const km = kmFromPark();
  return km != null && km > PRACTICE_KM;
}

function icon(name) {
  const icons = {
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>`,
    album: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m8 13 2.2-2.2a1 1 0 0 1 1.4 0L16 15"/><circle cx="9" cy="9" r="1"/></svg>`,
    line: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h14M5 12h10M5 17h7"/></svg>`,
    gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  };
  return icons[name];
}

function tabbar(active) {
  const tabs = [
    ["map", "Map", "map"],
    ["album", "Album", "album"],
    ["line", "Line", "line"],
    ["settings", "Setup", "gear"],
  ];
  return `<nav class="tabbar">${tabs
    .map(
      ([id, label, svg]) =>
        `<button class="tab ${active === id ? "on" : ""}" data-go="${id}">${icon(svg)}<span>${label}</span></button>`
    )
    .join("")}</nav>`;
}

function openSpot(id) {
  const next = spotById(id);
  if (!next) return;
  activeSpot = next;
  if (isRide(activeSpot)) {
    setView("shoot");
    return;
  }
  setView("spot");
}

function banner() {
  if (toast) return `<div class="banner ${toast.kind || ""}">${toast.text}</div>`;
  if (inPractice()) {
    return `<div class="banner warn">Practice mode. You are outside the resort, so every spot is open. GPS unlocks for real in the park.</div>`;
  }
  if (loc.err) return `<div class="banner warn">${loc.err}</div>`;
  return "";
}

function renderSplash() {
  return `<section class="view splash">
    <div class="hero">
      <p class="kicker">Time machine</p>
      <h1>Wonderlens</h1>
      <p class="lede">A time machine for the park day. Photograph the trip, then send every frame back to opening day, 1955.</p>
      <button class="btn full" data-go="onboard">Start today’s hunt</button>
    </div>
  </section>`;
}

function renderOnboard() {
  return `<section class="view">
    <p class="kicker">Crew setup</p>
    <h2>Who is hunting?</h2>
    <p class="muted">Names go on the missions. Photos stay on this phone.</p>
    <div class="stack" style="margin-top:16px">
      <div class="card stack">
        <label class="field">Add a kid or grown-up
          <div class="row">
            <input id="crew-name" type="text" placeholder="Maya" maxlength="24">
            <button class="btn tiny" id="add-crew">Add</button>
          </div>
        </label>
        <div class="chips" id="crew-chips">${
          state.crew.map((name, i) => `<span class="chip"><b>${name}</b><button data-remove="${i}">×</button></span>`).join("") ||
          `<span class="muted">No names yet — you can skip.</span>`
        }</div>
      </div>
      <div class="card stack">
        <p class="muted">Which parks today?</p>
        <div class="row">
          ${Object.values(PARKS)
            .map(
              (item) => `<button class="seg ${state.parks[item.id] ? "on" : ""}" data-park="${item.id}">
                <b>${item.short}</b><small>${item.hint}</small>
              </button>`
            )
            .join("")}
        </div>
      </div>
      <button class="btn full" id="finish-onboard">Let’s walk</button>
    </div>
  </section>`;
}

function renderMap() {
  const done = enabledSpots().filter(isDone).length;
  const total = enabledSpots().length;
  const nxt = nextSpot();
  return `<section class="view">
    ${banner()}
    <div class="top">
      <div>
        <p class="kicker">Wonderlens</p>
        <h2>${PARKS[park].short}</h2>
        <p class="muted">${crewLabel()} · <span class="status-dot ${loc.lat ? "on" : ""}"></span> ${
          loc.lat ? "live GPS" : "finding you"
        }</p>
      </div>
      <div class="progress"><strong>${done}/${total}</strong><span class="muted">wonders</span></div>
    </div>
    <div class="park-switch">
      ${Object.values(PARKS)
        .filter((item) => state.parks[item.id])
        .map(
          (item) =>
            `<button class="seg ${park === item.id ? "on" : ""}" data-show-park="${item.id}"><b>${item.short}</b><small>${item.hint}</small></button>`
        )
        .join("")}
    </div>
    <div class="map-shell">
      <div id="park-map" role="application" aria-label="${PARKS[park].name} map"></div>
      <div class="map-tools">
        <button type="button" class="map-tool" data-map-recenter>My spot</button>
        <button type="button" class="map-tool" data-map-layer>Map</button>
      </div>
      <p class="map-hint">${parkMapHint(park)}</p>
    </div>
    <button class="card next-card ride-card" id="start-ride">
      <p class="kicker">Car ride</p>
      <h3>Photos on the road</h3>
      <p class="muted">Drive down or ride home. GPS notes the place. Send photos back to 1955 from anywhere — you do not need to be at the park.</p>
    </button>
    ${
      nxt
        ? `<button class="card next-card" data-spot="${nxt.id}">
            <p class="kicker">Next wonder</p>
            <h3>${nxt.name}</h3>
            <p class="muted">${nxt.land} · ${inPractice() ? "open in practice" : formatDistance(distanceTo(nxt))}</p>
          </button>`
        : `<div class="card"><h3>Album complete</h3><p class="muted">You hunted the whole map. Open the album and gloat a little.</p></div>`
    }
    <div class="stack" style="margin-top:12px">
      ${enabledSpots()
        .filter((spot) => spot.park === park)
        .slice()
        .sort((a, b) => (distanceTo(a) ?? 9e9) - (distanceTo(b) ?? 9e9))
        .map((spot) => {
          const done = isDone(spot);
          const near = isNear(spot) || inPractice();
          return `<button class="card next-card" data-spot="${spot.id}">
            <p class="kicker">${spot.land}${done ? " · stamped" : near ? " · open" : ""}</p>
            <h3>${spot.name}</h3>
            <p class="muted">${inPractice() ? "practice" : formatDistance(distanceTo(spot))} · ${spot.clue}</p>
          </button>`;
        })
        .join("")}
    </div>
    ${tabbar("map")}
  </section>`;
}

function renderSpot() {
  const spot = activeSpot;
  if (!spot || isRide(spot)) return isRide(spot) ? renderShoot() : renderMap();
  const near = isNear(spot) || inPractice() || state.checkins[spot.id];
  return `<section class="view">
    <button class="back" data-go="map">← Map</button>
    <div class="spot-hero">
      <span class="pill">${spot.land} · ${inPractice() ? "practice" : formatDistance(distanceTo(spot))}</span>
      <h2>${spot.name}</h2>
      <p class="muted">${spot.clue}</p>
    </div>
    <div class="card stack">
      <p class="kicker">Mission</p>
      <p class="mission">${spot.mission}</p>
      <p class="muted">Get ${crewLabel()} in the frame. Then send them back to 1955.</p>
      ${
        near
          ? `<button class="btn full" data-shoot="${spot.id}">Open camera</button>`
          : `<button class="btn ghost full" data-checkin="${spot.id}">GPS is shy — we’re here</button>
             <p class="muted">Park GPS gets weird near buildings. If you can see the landmark, override it.</p>`
      }
    </div>
    ${tabbar("map")}
  </section>`;
}

function renderShoot() {
  const spot = activeSpot;
  if (!spot) return renderMap();
  const ride = isRide(spot);
  const placeLine = ride
    ? [...new Set([spot.heading, spot.place].filter((part) => part && part !== "Finding this place…"))].join(" · ") ||
      "GPS will note this stop"
    : "";
  return `<section class="view">
    <button class="back" ${ride ? `data-go="album"` : `data-spot="${spot.id}"`}>← ${ride ? "Album" : spot.short}</button>
    <p class="kicker">${ride ? "Car ride" : spot.land}</p>
    <h2>${ride ? "Shot for the road" : "Make the shot"}</h2>
    <p class="muted">${
      ride
        ? `A page in the history of ${pairLabel()}. ${placeLine}. Time travel works on the road — no park GPS needed.`
        : spot.mission
    }</p>
    ${
      ride
        ? `<div class="ride-look">
        <p class="kicker">Time look</p>
        <div class="chips ride-styles">
          ${RIDE_PRESETS.map(
            (item) =>
              `<button type="button" class="chip ${rideLook.style === item.id ? "on" : ""}" data-ride-style="${item.id}">${escapeHtml(item.label)}</button>`
          ).join("")}
          <button type="button" class="chip ${rideLook.style === "custom" ? "on" : ""}" data-ride-style="custom">My idea</button>
        </div>
        <p class="muted" id="ride-style-note">${escapeHtml(rideStyleNote())}</p>
        <label class="field">Short idea
          <textarea id="ride-idea" rows="2" placeholder="e.g. chrome bumper, Sunday best">${escapeHtml(rideLook.idea || "")}</textarea>
        </label>
        <button class="btn ghost full" type="button" id="polish-prompt" ${busy === "Polishing…" ? "disabled" : ""}>${
          busy === "Polishing…" ? "Polishing…" : "Turn this into a full prompt"
        }</button>
        ${
          rideLook.style === "custom" && rideLook.polished
            ? `<p class="muted polished-preview">${escapeHtml(rideLook.polished.slice(0, 180))}${rideLook.polished.length > 180 ? "…" : ""}</p>`
            : ""
        }
      </div>`
        : ""
    }
    <div class="camera-box" style="margin:14px 0">${
      draft.original
        ? `<img src="${draft.original}" alt="Captured photo">`
        : `<div class="busy"><p class="muted">${
            ride
              ? "Window light, back seat, a rest stop — wherever you are."
              : "Take the shot here, or pick one you already took at this landmark."
          }</p></div>`
    }</div>
    <div class="stack">
      ${isNative() ? `<button class="btn full" id="native-camera">Open camera</button>` : ""}
      <label class="btn ${isNative() ? "ghost" : ""} full">Choose from camera roll
        <input class="hidden-file" id="photo-input" type="file" accept="image/*"${isNative() ? "" : " capture=\"environment\""}>
      </label>
      <button class="btn full" id="save-shot" ${draft.original && !busy ? "" : "disabled"}>${
        isShotSaved(spot) ? "See in album" : "Save to album"
      }</button>
      <button class="btn ghost full" id="enchant" ${draft.original && !busy ? "" : "disabled"}>${
        busy || "Send back to 1955"
      }</button>
    </div>
    ${tabbar(ride ? "album" : "map")}
  </section>`;
}

function renderResult() {
  const spot = activeSpot;
  if (!spot) return renderAlbum();
  const ride = isRide(spot);
  const placeBits = [];
  if (ride && spot.heading) placeBits.push(spot.heading);
  if (ride && spot.place && spot.place !== spot.heading) placeBits.push(spot.place);
  if (ride && spot.lat != null && spot.lng != null && !spot.place) placeBits.push(formatCoords(spot.lat, spot.lng));
  return `<section class="view">
    <button class="back" data-go="album">← Album</button>
    <p class="kicker">${ride ? "Road light" : `${spot.stamp} stamp earned`}</p>
    <h2>${spot.name}</h2>
    ${ride && placeBits.length ? `<p class="muted">${placeBits.join(" · ")}</p>` : ""}
    ${
      draft.enchanted && draft.enchanted !== draft.original
        ? `<div class="camera-box compare" style="margin:14px 0; --split:${split}%">
      <img src="${draft.original}" alt="Original">
      <img class="after" src="${draft.enchanted}" alt="1955 souvenir">
      <input id="split" type="range" min="0" max="100" value="${split}">
    </div>
    <p class="muted">Slide to compare. Original stays yours. 1955 is the souvenir.</p>`
        : `<div class="camera-box" style="margin:14px 0">
      <img src="${draft.original}" alt="Saved photo">
    </div>
    <p class="muted">${isShotSaved(spot) ? "Saved in the album." : "This shot is ready for the album."}</p>`
    }
    <div class="stack" style="margin-top:12px">
      <button class="btn full" id="save-shot">${isShotSaved(spot) ? "See in album" : "Keep in album"}</button>
      <button class="btn ghost full" id="share-shot">Share</button>
      <button class="btn ghost full" data-shoot="${spot.id}">Try another take</button>
    </div>
    ${tabbar("album")}
  </section>`;
}

function renderAlbum() {
  const shots = enabledSpots().filter(isDone);
  const rides = rideList().slice().sort((a, b) => (a.at || 0) - (b.at || 0));
  const total = shots.length + rides.length;
  return `<section class="view">
    ${banner()}
    <div class="top">
      <div>
        <p class="kicker">Family album</p>
        <h2>${total ? "Today’s wonders" : "No stamps yet"}</h2>
      </div>
      <div class="progress"><strong>${total}</strong><span class="muted">saved</span></div>
    </div>
    ${
      shots.length
        ? `<div class="album">${shots
            .map(
              (spot) => `<button class="shot" data-open="${spot.id}">
                <img data-photo="${spot.id}" alt="${spot.name}">
                <span>${spot.name}</span>
              </button>`
            )
            .join("")}</div>`
        : total
          ? ""
          : `<div class="card empty">Hunt a landmark or snap a car-ride photo. The album lives on this phone.</div>`
    }
    <div class="album-block">
      <p class="kicker">Car ride</p>
      <h3>History of ${pairLabel()}</h3>
      <p class="muted">GPS notes each stop on the drive down and the ride home.</p>
      ${
        rides.length
          ? `<div class="album">${rides
              .map((item) => {
                const spot = rideSpotFrom(item);
                const when = formatWhen(item.at);
                return `<button class="shot" data-open="${spot.id}">
                  <img data-photo="${spot.id}" alt="${spot.name}">
                  <span>${spot.name}</span>
                  <span class="place">${[spot.heading, when].filter(Boolean).join(" · ")}</span>
                </button>`;
              })
              .join("")}</div>`
          : `<div class="card empty">No road photos yet. Take one and it saves here, even before the 1955 look.</div>`
      }
      <button class="btn full" id="start-ride" style="margin-top:12px">Add a car-ride photo</button>
    </div>
    ${tabbar("album")}
  </section>`;
}

function renderLine() {
  const land = game.land;
  const kinds = Object.entries(GAMES);
  const current = game.kind && GAMES[game.kind]?.items ? GAMES[game.kind] : null;
  let prompt = "";
  if (current) {
    const pool = Array.isArray(current.items) ? current.items : current.items[land] || Object.values(current.items).flat();
    const item = pool[game.index % pool.length];
    prompt = typeof item === "string" ? item : `${item.q}<br><span class="muted">Answer when you give up: ${item.a}</span>`;
  }
  return `<section class="view">
    <p class="kicker">Line lounge</p>
    <h2>Wait like it's 1955</h2>
    <p class="muted">No signal required for these. Line Buddy needs a key if you want a custom opening-day story.</p>
    <div class="card stack" style="margin:14px 0">
      <label class="field">We are in
        <select id="line-land">${[...new Set(SPOTS.map((spot) => spot.land))]
          .map((name) => `<option ${name === land ? "selected" : ""}>${name}</option>`)
          .join("")}</select>
      </label>
    </div>
    <div class="game-grid">
      ${kinds
        .map(
          ([id, item]) =>
            `<button class="game ${id === "act" ? "featured" : ""}" data-game="${id}"><b>${item.title}</b><span class="muted">${item.blurb}</span></button>`
        )
        .join("")}
    </div>
    ${
      current
        ? `<div class="card stack" style="margin-top:14px">
            <p class="kicker">${current.title}</p>
            <p class="prompt">${prompt}</p>
            <button class="btn full" id="next-game">Another</button>
          </div>`
        : ""
    }
    <div class="card stack" style="margin-top:14px">
      <p class="kicker">Line Buddy</p>
      <p class="muted">Grok tells a short, kid-safe 1955 story or game for this land.</p>
      <div class="chips">${BUDDY_KINDS.map((item) => `<button class="chip" data-buddy="${item.id}">${item.label}</button>`).join("")}</div>
      <div id="buddy-out" class="muted">${busy || ""}</div>
    </div>
    ${tabbar("line")}
  </section>`;
}

function guessWord() {
  return guess.words[guess.index] || "";
}

function renderGuess() {
  const flashClass = guess.phase === "flash" ? guess.flash : "";
  if (guess.phase === "intro") {
    return `<section class="view guess">
      <button class="back" data-go="line">← Line</button>
      <p class="kicker">Forehead acting</p>
      <h2>Kids act. You guess.</h2>
      <div class="card stack" style="margin-top:14px">
        <p>Hold the phone to your forehead so the kids can read the word.</p>
        <p class="muted">They act it out. You guess out loud.</p>
        <p class="muted">Tilt the word toward the ground when you get it. Tilt it toward the sky to pass. Then bring it back to your forehead for the next word.</p>
        <p class="muted">${GUESSTURE_SECONDS} seconds. No signal needed.</p>
      </div>
      <div class="stack" style="margin-top:16px">
        <button class="btn full" id="guess-start">Start a round</button>
      </div>
      ${tabbar("line")}
    </section>`;
  }
  if (guess.phase === "done") {
    const got = guess.got.length;
    const passed = guess.passed.length;
    return `<section class="view guess">
      <button class="back" data-go="line">← Line</button>
      <p class="kicker">Time’s up</p>
      <h2>You got ${got}</h2>
      <p class="muted">${passed ? `${passed} passed` : "No passes"} · ${got + passed} cards</p>
      ${
        got
          ? `<ul class="news" style="margin-top:14px">${guess.got.map((word) => `<li>${escapeHtml(word)}</li>`).join("")}</ul>`
          : `<p class="muted" style="margin-top:14px">Nobody got one that round. Try bigger acting.</p>`
      }
      <div class="stack" style="margin-top:16px">
        <button class="btn full" id="guess-start">Play again</button>
        <button class="btn ghost full" data-go="line">Back to Line</button>
      </div>
      ${tabbar("line")}
    </section>`;
  }
  const word = guessWord();
  const title =
    guess.phase === "countdown"
      ? String(guess.countdown)
      : guess.phase === "flash"
        ? guess.flash === "got"
          ? "Got it!"
          : "Pass"
        : word;
  const hint =
    guess.phase === "countdown"
      ? "Hold it to your forehead"
      : guess.sensor
        ? "Tilt down = got it · tilt up = pass"
        : "Tilt isn’t reading yet — tap Got it or Pass";
  return `<section class="view guess play ${flashClass}">
            <div class="guess-top">
      <p class="guess-time">${guess.phase === "countdown" ? "Get ready" : `${guess.remaining}s`}</p>
      <button class="guess-end" id="guess-end" type="button">End</button>
    </div>
    <p class="guess-word">${escapeHtml(title)}</p>
    <p class="muted guess-hint">${
      guess.phase === "countdown"
        ? "Hold it to your forehead"
        : guess.phase === "flash"
          ? "Now back to your forehead"
          : "Act this out"
    }</p>
    ${
      guess.phase !== "countdown"
        ? `<div class="guess-actions">
            <button class="btn ghost" id="guess-pass" type="button">Pass ↑</button>
            <button class="btn" id="guess-got" type="button">Got it ↓</button>
          </div>
          <p class="muted guess-hint">${escapeHtml(hint)}</p>`
        : ""
    }
  </section>`;
}

function openGuess() {
  stopGuess();
  guess = blankGuess();
  game.kind = "act";
  setView("guess");
}

function startGuessRound() {
  stopGuess(false);
  guess = {
    ...blankGuess(),
    phase: "countdown",
    words: shuffleWords(GUESSTURE_WORDS),
    countdown: 3,
    remaining: GUESSTURE_SECONDS,
    countAt: Date.now() + 3000,
    endsAt: Date.now() + 3000 + GUESSTURE_SECONDS * 1000,
  };
  guessGate = createTiltGate();
  holdGuessScreen();
  void listenGuessSensors();
  if (view !== "guess") setView("guess");
  else render();
  guessTick = window.setInterval(tickGuess, 200);
}

function stopGuess(reset = true) {
  if (guessTick) {
    window.clearInterval(guessTick);
    guessTick = 0;
  }
  unlistenGuessSensors();
  releaseGuessScreen();
  if (reset) guess = blankGuess();
}

function endGuessRound() {
  if (guessTick) {
    window.clearInterval(guessTick);
    guessTick = 0;
  }
  unlistenGuessSensors();
  releaseGuessScreen();
  guess.phase = "done";
  guess.flash = "";
  render();
}

function paintGuessClock() {
  const time = app.querySelector(".guess-time");
  const word = app.querySelector(".guess-word");
  if (guess.phase === "countdown") {
    if (word) word.textContent = String(Math.max(1, guess.countdown));
    return;
  }
  if (time && (guess.phase === "play" || guess.phase === "flash")) {
    time.textContent = `${guess.remaining}s`;
  }
}

function tickGuess() {
  if (view !== "guess") {
    stopGuess();
    return;
  }
  const now = Date.now();
  if (guess.phase === "countdown") {
    const left = Math.max(0, Math.ceil((guess.countAt - now) / 1000));
    guess.countdown = left;
    if (now >= guess.countAt) {
      guess.phase = "play";
      guess.countdown = 0;
      guessGate = createTiltGate();
      render();
      return;
    }
    paintGuessClock();
    return;
  }
  if (guess.phase === "play" || guess.phase === "flash") {
    const left = Math.max(0, Math.ceil((guess.endsAt - now) / 1000));
    guess.remaining = left;
    if (left <= 0) {
      endGuessRound();
      return;
    }
    paintGuessClock();
    if (guess.phase === "flash" && now >= guess.flashUntil) {
      if (guess.tilt === "neutral" || guess.tilt === "unknown" || now >= guess.flashUntil + 1200) {
        advanceGuessWord();
      }
    }
  }
}

function applyGuessAction(action) {
  if (view !== "guess" || (guess.phase !== "play" && guess.phase !== "flash")) return;
  if (guess.phase === "flash") return;
  const word = guessWord();
  if (!word) return;
  if (action === "got") guess.got.push(word);
  else guess.passed.push(word);
  guess.phase = "flash";
  guess.flash = action;
  guess.flashUntil = Date.now() + 550;
  try {
    navigator.vibrate?.(action === "got" ? 35 : [18, 40, 18]);
  } catch {
    // Some WebViews ignore vibrate.
  }
  render();
}

function advanceGuessWord() {
  guess.index += 1;
  if (guess.index >= guess.words.length) {
    guess.words = shuffleWords(GUESSTURE_WORDS);
    guess.index = 0;
  }
  guess.phase = "play";
  guess.flash = "";
  guessGate = createTiltGate();
  render();
}

function onGuessTilt(beta) {
  const zone = tiltZone(beta);
  if (zone === "unknown") return;
  guess.sensor = true;
  guess.tilt = zone;
  if (guess.phase === "play") {
    const action = guessGate.feed(zone);
    if (action) applyGuessAction(action);
  }
}

function onGuessOrient(event) {
  if (view !== "guess") return;
  onGuessTilt(event.beta);
}

function onGuessMotion(event) {
  if (view !== "guess" || guess.sensor) return;
  const beta = betaFromGravity(event.accelerationIncludingGravity);
  if (beta == null) return;
  onGuessTilt(beta);
}

async function listenGuessSensors() {
  if (guessListening) return;
  try {
    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
      await DeviceOrientationEvent.requestPermission();
    }
  } catch {
    // Android WebView does not need this; iOS might deny it.
  }
  if (guessListening) return;
  guessListening = true;
  window.addEventListener("deviceorientation", onGuessOrient);
  window.addEventListener("devicemotion", onGuessMotion);
}

function unlistenGuessSensors() {
  if (!guessListening) return;
  guessListening = false;
  window.removeEventListener("deviceorientation", onGuessOrient);
  window.removeEventListener("devicemotion", onGuessMotion);
}

async function holdGuessScreen() {
  try {
    guessWake = await navigator.wakeLock?.request("screen");
  } catch {
    guessWake = null;
  }
}

function releaseGuessScreen() {
  try {
    guessWake?.release?.();
  } catch {
    // Wake lock can already be gone.
  }
  guessWake = null;
}

function renderBuildCards() {
  const mine = installedBuildLabel(appInfo, isNative());
  const latest = latestBuildLabel(latestRelease);
  const vs = installedVsLatest(appInfo, latestRelease);
  const status =
    vs === "latest"
      ? `<p class="build-status ok">You’re on this build.</p>`
      : vs === "behind"
        ? `<p class="build-status next">Newer APK available — tap below to install.</p>`
        : vs === "ahead"
          ? `<p class="muted">This install is newer than GitHub latest.</p>`
          : "";
  const latestMeta = [latest?.tag, latest?.when].filter(Boolean).join(" · ");
  let latestBody = `<p class="muted">Looking up GitHub…</p>`;
  if (releaseStatus === "error") {
    latestBody = `<p class="muted">${escapeHtml(releaseError || "Could not reach GitHub.")}</p>`;
  } else if (latest) {
    latestBody = `
      <p class="build-ver">${escapeHtml(latest.title)}</p>
      ${latestMeta ? `<p class="muted">${escapeHtml(latestMeta)}</p>` : ""}
      ${status}
      ${newsList(latest.notes, "GitHub did not include a what’s-new yet.")}`;
  } else if (releaseStatus === "idle") {
    latestBody = `<p class="muted">GitHub latest will show here in a moment.</p>`;
  }
  return `
      <div class="card stack">
        <p class="kicker">This phone</p>
        <p class="build-ver">${escapeHtml(mine.title)}</p>
        <p class="muted">${escapeHtml(mine.meta)}</p>
        ${newsList(APP_NEWS)}
      </div>
      <div class="card stack">
        <p class="kicker">Newest GitHub build</p>
        ${latestBody}
        <button class="btn full" id="check-update">Check GitHub for a new build</button>
        <a class="btn ghost full" id="open-releases" href="${RELEASES_URL}" target="_blank" rel="noopener">Open releases in Chrome</a>
      </div>`;
}

function renderSettings() {
  const masked = maskedApiKey();
  return `<section class="view">
    <p class="kicker">Setup</p>
    <h2>Phone + 1955</h2>
    <div class="stack" style="margin-top:16px">
      <div class="card stack">
        <p class="muted">${
          hasKey
            ? `Key saved on this phone${masked ? ` (${masked})` : ""}. Time travel works on cell data, including car-ride photos.`
            : "Paste an xAI key so 1955 looks and Line Buddy work on this phone."
        }</p>
        <label class="field">XAI_API_KEY
          <input id="api-key" type="password" placeholder="xai-..." autocomplete="off">
        </label>
        <button class="btn full" id="save-key">Save key on this phone</button>
        <button class="btn ghost full" id="test-key" ${busy === "Testing key…" ? "disabled" : ""}>${
          busy === "Testing key…" ? "Testing…" : "Test this key"
        }</button>
        ${keyProbe ? `<p class="muted">${keyProbe}</p>` : ""}
      </div>
      ${renderBuildCards()}
      <div class="card stack">
        <p class="muted">${
          isNative()
            ? "This is the installed Android app. Photos stay on the phone except for the 1955 Imagine request."
            : "Web preview. For the park, install the Android app so you do not need the Mac tunnel."
        }</p>
        <p class="muted">Cursor on the road: open cursor.com/agents, pick ${GITHUB_REPO}, ask for a change. When it merges to main, GitHub builds a new APK.</p>
      </div>
      <button class="btn ghost full" id="reset-day">Reset today’s hunt</button>
    </div>
    ${tabbar("settings")}
  </section>`;
}

function render() {
  const scroller = document.querySelector(".view");
  const y = keepScroll && scroller ? scroller.scrollTop : 0;
  keepScroll = false;
  saveParkMapCamera();
  destroyParkMap();
  const screens = {
    splash: renderSplash,
    onboard: renderOnboard,
    map: renderMap,
    spot: renderSpot,
    shoot: renderShoot,
    result: renderResult,
    album: renderAlbum,
    line: renderLine,
    guess: renderGuess,
    settings: renderSettings,
  };
  app.innerHTML = (screens[view] || renderMap)();
  bind();
  if (view === "album") hydrateAlbum();
  if (view === "map") {
    mountParkMap({
      el: document.getElementById("park-map"),
      park,
      spots: enabledSpots().filter((spot) => spot.park === park),
      loc,
      onOpen: openSpot,
      isNear,
      isDone,
      inPractice: inPractice(),
    });
  }
  if (y) {
    const next = document.querySelector(".view");
    if (next) next.scrollTop = y;
  }
}

function bind() {
  app.querySelectorAll("[data-go]").forEach((el) =>
    el.addEventListener("click", async () => {
      toast = "";
      if (draft.original && (view === "shoot" || view === "result")) {
        await saveShot({ stay: true, silent: true });
      }
      setView(el.dataset.go);
    })
  );
  app.querySelectorAll("[data-spot]").forEach((el) =>
    el.addEventListener("click", async () => {
      if (draft.original && view === "shoot") {
        await saveShot({ stay: true, silent: true });
      }
      openSpot(el.dataset.spot);
    })
  );
  app.querySelectorAll("[data-show-park]").forEach((el) =>
    el.addEventListener("click", () => {
      park = el.dataset.showPark;
      render();
    })
  );
  app.querySelectorAll("[data-park]").forEach((el) =>
    el.addEventListener("click", () => {
      const id = el.dataset.park;
      state.parks[id] = !state.parks[id];
      if (!state.parks.dl && !state.parks.dca) state.parks[id] = true;
      persist();
      render();
    })
  );
  app.querySelector("#add-crew")?.addEventListener("click", addCrew);
  app.querySelector("#crew-name")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addCrew();
  });
  app.querySelectorAll("[data-remove]").forEach((el) =>
    el.addEventListener("click", () => {
      state.crew.splice(Number(el.dataset.remove), 1);
      persist();
      render();
    })
  );
  app.querySelector("#finish-onboard")?.addEventListener("click", () => {
    state.onboarded = true;
    persist();
    startGeo();
    setView("map");
  });
  app.querySelectorAll("[data-checkin]").forEach((el) =>
    el.addEventListener("click", () => {
      state.checkins[el.dataset.checkin] = Date.now();
      persist();
      render();
    })
  );
  app.querySelectorAll("[data-shoot]").forEach((el) =>
    el.addEventListener("click", () => {
      if (isRide(activeSpot) && view === "result") {
        startRideShoot();
        return;
      }
      const next = spotById(el.dataset.shoot);
      if (next) activeSpot = next;
      draft = { original: "", enchanted: "", note: "" };
      setView("shoot");
    })
  );
  app.querySelector("#start-ride")?.addEventListener("click", startRideShoot);
  app.querySelectorAll("[data-ride-style]").forEach((el) =>
    el.addEventListener("click", () => {
      syncRideLook();
      rideLook.style = el.dataset.rideStyle;
      render();
    })
  );
  app.querySelector("#ride-idea")?.addEventListener("input", (event) => {
    rideLook.idea = event.target.value;
    if (rideLook.polished) {
      rideLook.polished = "";
      app.querySelector(".polished-preview")?.remove();
    }
    if (rideLook.idea.trim() && rideLook.style !== "custom") {
      rideLook.style = "custom";
      app.querySelectorAll("[data-ride-style]").forEach((btn) => {
        btn.classList.toggle("on", btn.dataset.rideStyle === "custom");
      });
    }
    const note = app.querySelector("#ride-style-note");
    if (note) note.textContent = rideStyleNote();
  });
  app.querySelector("#polish-prompt")?.addEventListener("click", polishRidePrompt);
  app.querySelector("#photo-input")?.addEventListener("change", onPickPhoto);
  app.querySelector("#native-camera")?.addEventListener("click", nativeCamera);
  app.querySelector("#enchant")?.addEventListener("click", enchant);
  app.querySelector("#split")?.addEventListener("input", (event) => {
    split = Number(event.target.value);
    app.querySelector(".compare").style.setProperty("--split", `${split}%`);
  });
  app.querySelector("#save-shot")?.addEventListener("click", saveShot);
  app.querySelector("#share-shot")?.addEventListener("click", shareShot);
  app.querySelectorAll("[data-open]").forEach((el) =>
    el.addEventListener("click", async () => {
      const spot = spotById(el.dataset.open);
      if (!spot) return;
      activeSpot = spot;
      const original = await getPhoto(`${spot.id}-original`);
      const enchanted = await getPhoto(`${spot.id}-enchanted`);
      draft.original = original ? await blobToDataUrl(original) : "";
      draft.enchanted = enchanted ? await blobToDataUrl(enchanted) : draft.original;
      setView("result");
    })
  );
  app.querySelector("#line-land")?.addEventListener("change", (event) => {
    game.land = event.target.value;
    render();
  });
  app.querySelectorAll("[data-game]").forEach((el) =>
    el.addEventListener("click", () => {
      if (el.dataset.game === "act") {
        openGuess();
        return;
      }
      game.kind = el.dataset.game;
      game.index = Math.floor(Math.random() * 20);
      render();
    })
  );
  app.querySelector("#guess-start")?.addEventListener("click", startGuessRound);
  app.querySelector("#guess-end")?.addEventListener("click", endGuessRound);
  app.querySelector("#guess-got")?.addEventListener("click", () => applyGuessAction("got"));
  app.querySelector("#guess-pass")?.addEventListener("click", () => applyGuessAction("pass"));
  app.querySelector("#next-game")?.addEventListener("click", () => {
    game.index += 1;
    render();
  });
  app.querySelectorAll("[data-buddy]").forEach((el) =>
    el.addEventListener("click", () => askBuddy(el.dataset.buddy))
  );
  app.querySelector("#save-key")?.addEventListener("click", saveKey);
  app.querySelector("#test-key")?.addEventListener("click", testKey);
  app.querySelector("#check-update")?.addEventListener("click", checkUpdate);
  app.querySelector("#open-releases")?.addEventListener("click", (event) => {
    event.preventDefault();
    openExternal(RELEASES_URL);
  });
  app.querySelector("#reset-day")?.addEventListener("click", () => {
    if (!confirm("Clear stamps and photos from this phone?")) return;
    Object.keys(state.shots).forEach((id) => {
      deletePhoto(`${id}-original`);
      deletePhoto(`${id}-enchanted`);
    });
    rideList().forEach((item) => {
      deletePhoto(`${item.id}-original`);
      deletePhoto(`${item.id}-enchanted`);
    });
    state.shots = {};
    state.checkins = {};
    state.rides = [];
    persist();
    toast = { text: "Day reset. Go hunt again.", kind: "" };
    render();
  });
}

function addCrew() {
  const input = app.querySelector("#crew-name");
  const name = input.value.trim();
  if (!name) return;
  state.crew.push(name);
  persist();
  render();
}

async function lookupPlace(lat, lng) {
  if (lat == null || lng == null) return "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error("geocode");
    const label = formatRidePlace(await res.json());
    if (label) return label;
  } catch {
    // Offline or blocked: keep coordinates.
  } finally {
    clearTimeout(timer);
  }
  return formatCoords(lat, lng);
}

async function refreshPosition() {
  const Geo = nativePlugin("Geolocation");
  try {
    if (Geo) {
      const current = await Geo.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
      applyPosition(current);
      return;
    }
  } catch {
    // Keep the last watch position.
  }
  if (!navigator.geolocation) return;
  await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyPosition(pos);
        resolve();
      },
      () => resolve(),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
    );
  });
}

async function stampRideLocation() {
  if (!isRide(activeSpot)) return;
  await refreshPosition();
  if (loc.lat == null) {
    activeSpot.heading = rideHeading(null);
    if (!activeSpot.place || activeSpot.place === "Finding this place…") {
      activeSpot.place = "On the road";
    }
    activeSpot.name = activeSpot.place;
    activeSpot.clue = activeSpot.heading;
    return;
  }
  activeSpot.lat = loc.lat;
  activeSpot.lng = loc.lng;
  activeSpot.heading = rideHeading(kmFromPark());
  activeSpot.place = await lookupPlace(loc.lat, loc.lng);
  activeSpot.name = activeSpot.place || activeSpot.heading;
  activeSpot.clue = [activeSpot.heading, activeSpot.place].filter(Boolean).join(" · ");
}

async function startRideShoot() {
  toast = "";
  syncRideLook();
  activeSpot = rideSpotFrom({
    id: `ride-${Date.now()}`,
    heading: rideHeading(kmFromPark()),
    stamp: "Road light",
    at: Date.now(),
    lat: loc.lat,
    lng: loc.lng,
    place: loc.lat != null ? "Finding this place…" : "On the road",
  });
  draft = { original: "", enchanted: "", note: "" };
  setView("shoot");
  await stampRideLocation();
  if (view === "shoot" && isRide(activeSpot) && !draft.original) render();
}

async function onPickPhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    draft.original = await compressImage(file);
    draft.enchanted = "";
    if (isRide(activeSpot)) await stampRideLocation();
    await saveShot({ stay: true });
  } catch {
    toast = { text: "Could not read that photo.", kind: "bad" };
    render();
  }
}

async function nativeCamera() {
  const Camera = nativePlugin("Camera");
  if (!Camera) {
    app.querySelector("#photo-input")?.click();
    return;
  }
  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: "dataUrl",
      source: "CAMERA",
      correctOrientation: true,
      width: 1600,
    });
    const src =
      photo.dataUrl ||
      (photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : "") ||
      photo.webPath ||
      photo.path ||
      "";
    if (!src) throw new Error("No photo");
    draft.original = await compressImage(await (await fetch(src)).blob());
    draft.enchanted = "";
    if (isRide(activeSpot)) await stampRideLocation();
    await saveShot({ stay: true });
  } catch (err) {
    if (String(err?.message || err).toLowerCase().includes("cancel")) return;
    toast = { text: err.message || "Camera did not open.", kind: "bad" };
    render();
  }
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

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function imageFromXai(payload) {
  const image = payload?.data?.[0] || payload;
  if (image?.b64_json) {
    return `data:${image.mime_type || "image/jpeg"};base64,${image.b64_json}`;
  }
  if (image?.url) {
    const res = await fetch(image.url);
    if (!res.ok) throw new Error("Could not download the enchanted photo.");
    const mime = res.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${bufferToBase64(await res.arrayBuffer())}`;
  }
  return null;
}

async function xai(pathname, payload, options = {}) {
  const key = loadApiKey();
  if (!key) throw new Error("Add your xAI key in Setup so this phone can send photos back to 1955.");
  const method = options.method || (payload == null ? "GET" : "POST");
  let res;
  try {
    res = await fetch(`https://api.x.ai/v1${pathname}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        ...(payload != null ? { "Content-Type": "application/json" } : {}),
      },
      ...(payload != null ? { body: JSON.stringify(payload) } : {}),
    });
  } catch {
    throw new Error("Could not reach xAI. Check cell data, then tap Test this key in Setup.");
  }
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 240) };
  }
  if (!res.ok) {
    const message =
      data?.error?.message || data?.error || data?.message || data?.raw || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

async function enchantImage(prompt, original) {
  const apiImage = await compressImage(dataUrlToBlob(original), 1024, 0.8);
  const payload = {
    model: "grok-imagine-image-2.0",
    prompt,
    image: { url: apiImage, type: "image_url" },
    response_format: "b64_json",
  };
  try {
    return await imageFromXai(await xai("/images/edits", payload));
  } catch (err) {
    const msg = String(err?.message || err);
    if (!/response_format|b64|400/.test(msg)) throw err;
    const retry = { ...payload };
    delete retry.response_format;
    return await imageFromXai(await xai("/images/edits", retry));
  }
}

async function polishRidePrompt() {
  const idea = syncRideLook();
  if (!idea) {
    toast = { text: "Type a short idea first.", kind: "bad" };
    render();
    return;
  }
  busy = "Polishing…";
  toast = "";
  render();
  try {
    let text = "";
    if (loadApiKey()) {
      const data = await xai("/responses", {
        model: "grok-4.5",
        input: polishRideIdeaPrompt(idea),
      });
      text = extractText(data);
    } else {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not polish that idea.");
      text = data.text;
    }
    const polished = cleanPolishedExtras(text);
    if (!polished) throw new Error("Grok returned an empty prompt. Try again.");
    rideLook.style = "custom";
    rideLook.polished = polished;
    busy = "";
    toast = { text: "Full prompt is ready. Send it back to 1955 when you like.", kind: "" };
    render();
  } catch (err) {
    busy = "";
    toast = { text: err.message || "Could not polish that idea.", kind: "bad" };
    render();
  }
}

async function enchant() {
  if (!activeSpot || !draft.original) return;
  syncRideLook();
  busy = "Traveling…";
  render();
  try {
    const ridePrompt = rideEnchantPrompt(
      activeSpot.place || activeSpot.heading,
      state.crew,
      extrasForRideLook(rideLook)
    );
    let image = null;
    if (loadApiKey()) {
      image = await enchantImage(
        isRide(activeSpot) ? ridePrompt : enchantPrompt(activeSpot, state.crew),
        draft.original
      );
    } else {
      const res = await fetch("/api/enchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: draft.original,
          prompt: isRide(activeSpot) ? ridePrompt : enchantPrompt(activeSpot, state.crew),
          spotId: activeSpot.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send this back to 1955.");
      image = data.image;
    }
    if (!image) throw new Error("Imagine returned no image. Try again.");
    draft.enchanted = image;
    busy = "";
    await saveShot({ stay: true });
    setView("result");
  } catch (err) {
    busy = "";
    toast = { text: err.message || "Could not send this back to 1955.", kind: "bad" };
    render();
  }
}

async function saveShot({ stay = false, silent = false } = {}) {
  if (!activeSpot || !draft.original) return false;
  try {
    await putPhoto(`${activeSpot.id}-original`, dataUrlToBlob(draft.original));
    if (draft.enchanted) {
      await putPhoto(`${activeSpot.id}-enchanted`, dataUrlToBlob(draft.enchanted));
    }
    if (isRide(activeSpot)) {
      const record = {
        id: activeSpot.id,
        at: Date.now(),
        lat: activeSpot.lat ?? loc.lat,
        lng: activeSpot.lng ?? loc.lng,
        place: activeSpot.place || "",
        heading: activeSpot.heading || "On the road",
        stamp: "Road light",
      };
      const rides = rideList();
      const idx = rides.findIndex((item) => item.id === record.id);
      if (idx >= 0) rides[idx] = record;
      else rides.push(record);
      state.rides = rides;
    } else {
      state.shots[activeSpot.id] = { at: Date.now(), stamp: activeSpot.stamp };
    }
    persist();
    if (!silent) {
      const label = isRide(activeSpot)
        ? activeSpot.place || activeSpot.heading || "Road light"
        : activeSpot.stamp;
      toast = { text: `${label} saved to the album.`, kind: "" };
    }
    if (stay) render();
    else setView("album");
    return true;
  } catch (err) {
    toast = { text: err.message || "Could not save that photo.", kind: "bad" };
    render();
    return false;
  }
}

async function shareShot() {
  const blob = dataUrlToBlob(draft.enchanted || draft.original);
  const file = new File([blob], `${activeSpot.id}.jpg`, { type: blob.type || "image/jpeg" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: activeSpot.name, text: activeSpot.stamp });
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${activeSpot.id}.jpg`;
  link.click();
  URL.revokeObjectURL(url);
}

async function hydrateAlbum() {
  for (const img of app.querySelectorAll("[data-photo]")) {
    const blob = (await getPhoto(`${img.dataset.photo}-enchanted`)) || (await getPhoto(`${img.dataset.photo}-original`));
    if (blob) img.src = URL.createObjectURL(blob);
  }
}

async function askBuddy(kind) {
  const box = app.querySelector("#buddy-out");
  if (box) box.textContent = "Line Buddy is thinking…";
  try {
    let text = "";
    if (loadApiKey()) {
      const data = await xai("/responses", {
        model: "grok-4.5",
        input: lineBuddyPrompt({
          kind,
          land: game.land,
          crew: crewLabel(),
          wait: `${game.land} queue`,
        }),
      });
      text = extractText(data);
    } else {
      const res = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          land: game.land,
          crew: crewLabel(),
          wait: `${game.land} queue`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Buddy failed");
      text = data.text;
    }
    if (!text) throw new Error("Line Buddy is quiet. Try again.");
    if (box) box.textContent = text;
  } catch (err) {
    if (box) box.textContent = err.message;
  }
}

async function saveKey() {
  const typed = app.querySelector("#api-key")?.value || "";
  const key = normalizeApiKey(typed);
  if (!key) return;
  if (!key.startsWith("xai-") && key.length < 24) {
    toast = { text: "That does not look like an xAI key.", kind: "bad" };
    render();
    return;
  }
  saveApiKey(key);
  hasKey = true;
  keyProbe = `Saved ${maskedApiKey()}. Tap Test this key next.`;
  if (!isNative()) {
    try {
      await fetch("/api/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
    } catch {
      // Phone-local key is enough for the Android app.
    }
  }
  toast = { text: "Key saved on this phone.", kind: "" };
  render();
}

async function testKey() {
  const typed = app.querySelector("#api-key")?.value;
  if (typed && typed.trim()) {
    const key = normalizeApiKey(typed);
    if (key) {
      saveApiKey(key);
      hasKey = true;
    }
  }
  if (!loadApiKey()) {
    toast = { text: "Paste a key first.", kind: "bad" };
    render();
    return;
  }
  busy = "Testing key…";
  keyProbe = "Calling xAI…";
  toast = "";
  render();
  try {
    const info = await xai("/api-key", null, { method: "GET" });
    if (info.api_key_blocked || info.api_key_disabled || info.team_blocked) {
      throw new Error("This key is blocked or disabled in the xAI console.");
    }
    const ping = await xai("/responses", {
      model: "grok-4.5",
      input: "Reply with the single word ready.",
    });
    const reply = extractText(ping) || "ok";
    busy = "";
    keyProbe = `Key works${info.name ? ` (${info.name})` : ""} · ${maskedApiKey()}. Grok said “${reply.slice(0, 48)}”. Send a car-ride photo back to 1955 next — no park GPS needed.`;
    toast = { text: "xAI key is live on this phone.", kind: "" };
    render();
  } catch (err) {
    busy = "";
    keyProbe = err.message || "Key test failed.";
    toast = { text: keyProbe, kind: "bad" };
    render();
  }
}

function applyPosition(pos) {
  const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  const prev = loc.lat != null ? { lat: loc.lat, lng: loc.lng } : null;
  const tiny = prev && !gpsMovedEnough(prev, next);
  loc.lat = next.lat;
  loc.lng = next.lng;
  loc.acc = pos.coords.accuracy;
  loc.err = "";
  if (tiny) {
    updateParkMapYou(loc);
    return;
  }
  if (view === "map" || view === "spot") {
    keepScroll = true;
    render();
  }
}

async function startGeo() {
  const Geo = nativePlugin("Geolocation");
  if (Geo) {
    try {
      await Geo.requestPermissions();
    } catch {
      // Permission prompt can be denied; fallback copy below.
    }
    try {
      const current = await Geo.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 });
      applyPosition(current);
    } catch {
      loc.err = "Location is off. Enable it, or tap We’re here at each landmark.";
    }
    Geo.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
      if (err || !pos) {
        loc.err = "Location is off. Enable it, or tap We’re here at each landmark.";
        if (view === "map") {
          keepScroll = true;
          render();
        }
        return;
      }
      applyPosition(pos);
    });
    return;
  }
  if (!navigator.geolocation) {
    loc.err = "This phone has no geolocation. Use We’re here on each spot.";
    return;
  }
  navigator.geolocation.watchPosition(
    applyPosition,
    () => {
      loc.err = "Location is off. Enable it, or tap We’re here at each landmark.";
      if (view === "map") {
        keepScroll = true;
        render();
      }
    },
    { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 }
  );
}

async function ping() {
  hasKey = Boolean(loadApiKey());
  if (hasKey || isNative()) return;
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    hasKey = Boolean(data.hasKey);
  } catch {
    hasKey = false;
  }
}

if (!isNative() && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

async function setupNativeChrome() {
  const StatusBar = nativePlugin("StatusBar");
  if (StatusBar) {
    try {
      await StatusBar.setBackgroundColor({ color: "#070b16" });
      await StatusBar.setStyle({ style: "LIGHT" });
    } catch {
      // Older WebViews can ignore status bar styling.
    }
  }
  const App = nativePlugin("App");
  if (App?.getInfo) {
    try {
      const info = await App.getInfo();
      appInfo = { version: info.version || "1.0.0", build: String(info.build || "2") };
    } catch {
      // Keep the web fallback.
    }
  }
}

function openExternal(url) {
  const Browser = nativePlugin("Browser");
  if (Browser?.open) {
    Browser.open({ url });
    return;
  }
  window.open(url, "_blank", "noopener");
}

async function loadLatestRelease({ force = false } = {}) {
  if (releaseStatus === "loading") return;
  if (latestRelease && !force && releaseStatus === "ready") return;
  releaseStatus = "loading";
  if (view === "settings") render();
  try {
    const res = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error("Could not reach GitHub releases.");
    latestRelease = await res.json();
    releaseStatus = "ready";
    releaseError = "";
  } catch (err) {
    releaseStatus = "error";
    releaseError = err.message || "Could not reach GitHub.";
  }
  if (view === "settings") render();
}

async function checkUpdate() {
  toast = { text: "Checking GitHub…", kind: "" };
  render();
  await loadLatestRelease({ force: true });
  if (releaseStatus === "error") {
    toast = { text: releaseError || "Update check failed.", kind: "bad" };
    render();
    return;
  }
  const apk = (latestRelease?.assets || []).find((asset) => asset.name.endsWith(".apk"));
  if (apk?.browser_download_url) {
    toast = { text: `${latestRelease.name || latestRelease.tag_name} is ready. Opening the APK…`, kind: "" };
    render();
    openExternal(apk.browser_download_url);
    return;
  }
  toast = { text: "Release found, but no APK yet. Open releases and wait for Actions.", kind: "warn" };
  render();
}

await setupNativeChrome();
await ping();
void loadLatestRelease();
if (state.onboarded) startGeo();
render();
