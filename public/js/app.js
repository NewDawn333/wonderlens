import {
  BUDDY_KINDS,
  GAMES,
  PARKS,
  PARK_CENTER,
  PRACTICE_KM,
  SPOTS,
  TRAIL,
  enchantPrompt,
  formatDistance,
  haversineM,
} from "./data.js";
import {
  blobToDataUrl,
  compressImage,
  dataUrlToBlob,
  deletePhoto,
  getPhoto,
  loadApiKey,
  loadState,
  putPhoto,
  saveApiKey,
  saveState,
} from "./store.js";

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
let split = 52;
let game = { kind: null, index: 0, land: "Main Street" };
let hasKey = Boolean(loadApiKey());
let toast = "";
let busy = "";
let appInfo = { version: "web", build: "0" };
let latestRelease = null;

function isNative() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

function nativePlugin(name) {
  return window.Capacitor?.Plugins?.[name] || null;
}

function persist() {
  saveState(state);
}

function setView(next) {
  view = next;
  render();
}

function enabledSpots() {
  return SPOTS.filter((spot) => state.parks[spot.park]);
}

function spotById(id) {
  return SPOTS.find((spot) => spot.id === id);
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

function banner() {
  if (toast) return `<div class="banner ${toast.kind || ""}">${toast.text}</div>`;
  if (inPractice()) {
    return `<div class="banner warn">Practice mode. You are outside the resort, so every spot is open. GPS unlocks for real in the park.</div>`;
  }
  if (loc.err) return `<div class="banner warn">${loc.err}</div>`;
  return "";
}

function mapSvg() {
  const spots = enabledSpots().filter((spot) => spot.park === park);
  const you = projectYou();
  const paths =
    park === "dl"
      ? `<path d="M50 96 L50 42" stroke="rgba(240,195,106,.35)" stroke-width="3.2" fill="none"/>
         <path d="M50 42 C50 28 62 24 64 16" stroke="rgba(240,195,106,.22)" stroke-width="2" fill="none"/>
         <path d="M50 58 C34 58 26 50 18 44" stroke="rgba(240,195,106,.22)" stroke-width="2" fill="none"/>
         <ellipse cx="50" cy="42" rx="10" ry="6" fill="rgba(240,195,106,.08)" stroke="rgba(240,195,106,.2)"/>
         <text x="50" y="94" text-anchor="middle" fill="#9aa6c3" font-size="4">Main Street</text>
         <text x="72" y="58" fill="#9aa6c3" font-size="3.6">Tomorrow</text>
         <text x="14" y="58" fill="#9aa6c3" font-size="3.6">Adventure</text>
         <text x="16" y="16" fill="#9aa6c3" font-size="3.6">Galaxy</text>
         <text x="50" y="28" text-anchor="middle" fill="#9aa6c3" font-size="3.6">Fantasy</text>`
      : `<path d="M70 12 L48 30 L52 70 L30 80" stroke="rgba(240,195,106,.28)" stroke-width="2.4" fill="none"/>
         <text x="68" y="14" fill="#9aa6c3" font-size="3.6">Entrance</text>
         <text x="74" y="40" fill="#9aa6c3" font-size="3.6">Campus</text>
         <text x="50" y="74" text-anchor="middle" fill="#9aa6c3" font-size="3.6">Cars</text>
         <text x="22" y="82" fill="#9aa6c3" font-size="3.6">Pier</text>`;

  return `<svg class="map-art" viewBox="0 0 100 100" role="img" aria-label="${PARKS[park].name} quest map">
    <defs>
      <radialGradient id="glow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#1a2744"/>
        <stop offset="100%" stop-color="#0b1220"/>
      </radialGradient>
    </defs>
    <rect width="100" height="100" fill="url(#glow)"/>
    <path d="M8 12 C22 6 78 6 92 14 C96 40 94 86 50 94 C10 86 4 40 8 12Z" fill="rgba(62,224,198,0.05)" stroke="rgba(240,195,106,0.16)"/>
    ${paths}
    ${spots
      .map((spot) => {
        const near = isNear(spot) || inPractice();
        const done = isDone(spot);
        const cls = `spot ${done ? "done" : near ? "near" : ""}`;
        return `<g class="${cls}" data-spot="${spot.id}" style="color:${spot.color}">
          ${near && !done ? `<circle class="pulse" cx="${spot.x}" cy="${spot.y}" r="8"/>` : ""}
          <circle cx="${spot.x}" cy="${spot.y}" r="7" fill="transparent"/>
          <circle class="core" cx="${spot.x}" cy="${spot.y}" r="3.2" fill="${done ? "#6ee7b7" : spot.color}"/>
          <text class="label" x="${spot.x}" y="${spot.y - 5}" text-anchor="middle">${spot.short}</text>
        </g>`;
      })
      .join("")}
    ${you ? `<circle class="you-dot" cx="${you.x}" cy="${you.y}" r="2.3"/>` : ""}
  </svg>`;
}

function projectYou() {
  if (loc.lat == null) return null;
  const spots = enabledSpots().filter((spot) => spot.park === park);
  if (!spots.length) return null;
  let best = spots[0];
  let bestD = distanceTo(best);
  for (const spot of spots) {
    const d = distanceTo(spot);
    if (d < bestD) {
      best = spot;
      bestD = d;
    }
  }
  if (bestD > 900) return null;
  return { x: best.x, y: best.y + 4 };
}

function renderSplash() {
  return `<section class="view splash">
    <div class="hero">
      <p class="kicker">Family quest · Parks day</p>
      <h1>Wonderlens</h1>
      <p class="lede">Walk the lands. Shoot the kids. Grok Imagine paints magic onto the real photo.</p>
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
    <div class="map-shell">${mapSvg()}</div>
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
  if (!spot) return renderMap();
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
      <p class="muted">Get ${crewLabel()} in the frame. Then let Imagine add the extras.</p>
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
  return `<section class="view">
    <button class="back" data-spot="${spot.id}">← ${spot.short}</button>
    <p class="kicker">${spot.land}</p>
    <h2>Make the shot</h2>
    <p class="muted">${spot.mission}</p>
    <div class="camera-box" style="margin:14px 0">${
      draft.original
        ? `<img src="${draft.original}" alt="Captured photo">`
        : `<div class="busy"><p class="muted">Take the shot here, or pick one you already took at this landmark.</p></div>`
    }</div>
    <div class="stack">
      ${isNative() ? `<button class="btn full" id="native-camera">Open camera</button>` : ""}
      <label class="btn ${isNative() ? "ghost" : ""} full">Choose from camera roll
        <input class="hidden-file" id="photo-input" type="file" accept="image/*" capture="environment">
      </label>
      <button class="btn ghost full" id="enchant" ${draft.original && !busy ? "" : "disabled"}>${
        busy || "Enchant with Imagine"
      }</button>
    </div>
    ${tabbar("map")}
  </section>`;
}

function renderResult() {
  const spot = activeSpot;
  return `<section class="view">
    <button class="back" data-go="album">← Album</button>
    <p class="kicker">${spot.stamp} stamp earned</p>
    <h2>${spot.name}</h2>
    <div class="camera-box compare" style="margin:14px 0; --split:${split}%">
      <img src="${draft.original}" alt="Original">
      <img class="after" src="${draft.enchanted}" alt="Enchanted">
      <input id="split" type="range" min="0" max="100" value="${split}">
    </div>
    <p class="muted">Slide to compare. Original stays yours. Enchanted is the souvenir.</p>
    <div class="stack" style="margin-top:12px">
      <button class="btn full" id="save-shot">Keep in album</button>
      <button class="btn ghost full" id="share-shot">Share</button>
      <button class="btn ghost full" data-shoot="${spot.id}">Try another take</button>
    </div>
    ${tabbar("album")}
  </section>`;
}

function renderAlbum() {
  const shots = enabledSpots().filter(isDone);
  return `<section class="view">
    ${banner()}
    <div class="top">
      <div>
        <p class="kicker">Family album</p>
        <h2>${shots.length ? "Today’s wonders" : "No stamps yet"}</h2>
      </div>
      <div class="progress"><strong>${shots.length}</strong><span class="muted">saved</span></div>
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
        : `<div class="card empty">Hunt a landmark, take the photo, enchant it. The album lives on this phone.</div>`
    }
    ${tabbar("album")}
  </section>`;
}

function renderLine() {
  const land = game.land;
  const kinds = Object.entries(GAMES);
  const current = game.kind ? GAMES[game.kind] : null;
  let prompt = "";
  if (current) {
    const pool = Array.isArray(current.items) ? current.items : current.items[land] || Object.values(current.items).flat();
    const item = pool[game.index % pool.length];
    prompt = typeof item === "string" ? item : `${item.q}<br><span class="muted">Answer when you give up: ${item.a}</span>`;
  }
  return `<section class="view">
    <p class="kicker">Line lounge</p>
    <h2>Wait like a legend</h2>
    <p class="muted">No signal required for these. Line Buddy needs a key if you want a custom story.</p>
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
            `<button class="game" data-game="${id}"><b>${item.title}</b><span class="muted">${item.blurb}</span></button>`
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
      <p class="muted">Grok tells a short, kid-safe story or game for this land.</p>
      <div class="chips">${BUDDY_KINDS.map((item) => `<button class="chip" data-buddy="${item.id}">${item.label}</button>`).join("")}</div>
      <div id="buddy-out" class="muted">${busy || ""}</div>
    </div>
    ${tabbar("line")}
  </section>`;
}

function renderSettings() {
  return `<section class="view">
    <p class="kicker">Setup</p>
    <h2>Phone + Imagine</h2>
    <div class="stack" style="margin-top:16px">
      <div class="card stack">
        <p class="muted">${
          hasKey
            ? "Imagine key is saved on this phone. Enchant will work with cell data in the park."
            : "Paste an xAI key so Enchant and Line Buddy work without the Mac."
        }</p>
        <label class="field">XAI_API_KEY
          <input id="api-key" type="password" placeholder="xai-..." autocomplete="off">
        </label>
        <button class="btn full" id="save-key">Save key on this phone</button>
      </div>
      <div class="card stack">
        <p class="kicker">Updates</p>
        <p class="muted">This phone is on ${appInfo.version} (${appInfo.build}). ${
          latestRelease
            ? `GitHub latest is ${latestRelease.name || latestRelease.tag_name}.`
            : "Check GitHub for a newer APK you can install in Chrome."
        }</p>
        <button class="btn full" id="check-update">Check GitHub for a new build</button>
        <a class="btn ghost full" id="open-releases" href="${RELEASES_URL}" target="_blank" rel="noopener">Open releases in Chrome</a>
      </div>
      <div class="card stack">
        <p class="muted">${
          isNative()
            ? "This is the installed Android app. Photos stay on the phone except for the Imagine request."
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
  const screens = {
    splash: renderSplash,
    onboard: renderOnboard,
    map: renderMap,
    spot: renderSpot,
    shoot: renderShoot,
    result: renderResult,
    album: renderAlbum,
    line: renderLine,
    settings: renderSettings,
  };
  app.innerHTML = (screens[view] || renderMap)();
  bind();
  if (view === "album") hydrateAlbum();
}

function bind() {
  app.querySelectorAll("[data-go]").forEach((el) =>
    el.addEventListener("click", () => {
      toast = "";
      setView(el.dataset.go);
    })
  );
  app.querySelectorAll("[data-spot]").forEach((el) =>
    el.addEventListener("click", () => {
      activeSpot = spotById(el.dataset.spot);
      setView("spot");
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
      activeSpot = spotById(el.dataset.shoot);
      draft = { original: "", enchanted: "", note: "" };
      setView("shoot");
    })
  );
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
      game.kind = el.dataset.game;
      game.index = Math.floor(Math.random() * 20);
      render();
    })
  );
  app.querySelector("#next-game")?.addEventListener("click", () => {
    game.index += 1;
    render();
  });
  app.querySelectorAll("[data-buddy]").forEach((el) =>
    el.addEventListener("click", () => askBuddy(el.dataset.buddy))
  );
  app.querySelector("#save-key")?.addEventListener("click", saveKey);
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
    state.shots = {};
    state.checkins = {};
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

async function onPickPhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    draft.original = await compressImage(file);
    render();
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
    const src = photo.dataUrl || (photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : "");
    if (!src) throw new Error("No photo");
    draft.original = await compressImage(await (await fetch(src)).blob());
    render();
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

async function xai(pathname, payload) {
  const key = loadApiKey();
  if (!key) throw new Error("Add your xAI key in Setup so Imagine can run on this phone.");
  const res = await fetch(`https://api.x.ai/v1${pathname}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

async function enchant() {
  if (!activeSpot || !draft.original) return;
  busy = "Enchanting…";
  render();
  try {
    let image = null;
    if (loadApiKey()) {
      const data = await xai("/images/edits", {
        model: "grok-imagine-image-2.0",
        prompt: enchantPrompt(activeSpot, state.crew),
        image: { url: draft.original, type: "image_url" },
        response_format: "b64_json",
      });
      image = await imageFromXai(data);
    } else {
      const res = await fetch("/api/enchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: draft.original,
          prompt: enchantPrompt(activeSpot, state.crew),
          spotId: activeSpot.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enchant failed");
      image = data.image;
    }
    if (!image) throw new Error("Imagine returned no image. Try again.");
    draft.enchanted = image;
    busy = "";
    setView("result");
  } catch (err) {
    busy = "";
    toast = { text: err.message || "Enchant failed.", kind: "bad" };
    render();
  }
}

async function saveShot() {
  if (!activeSpot || !draft.enchanted) return;
  await putPhoto(`${activeSpot.id}-original`, dataUrlToBlob(draft.original));
  await putPhoto(`${activeSpot.id}-enchanted`, dataUrlToBlob(draft.enchanted));
  state.shots[activeSpot.id] = { at: Date.now(), stamp: activeSpot.stamp };
  persist();
  toast = { text: `${activeSpot.stamp} saved to the album.`, kind: "" };
  setView("album");
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
        input: `You are Line Buddy, a warm, funny park companion for kids and parents waiting in ${game.land} queue. The crew is: ${crewLabel()}.
Give one ${kind} now. Rules:
- Kid-safe, kind, and specific to this land
- 80-140 words max
- No copyrighted character names, songs, or official mascots
- No brand logos
- Make it playable or tellable out loud right now
- End with one tiny follow-up the kids can answer`,
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
  const key = app.querySelector("#api-key")?.value.trim();
  if (!key) return;
  if (!key.startsWith("xai-") && key.length < 20) {
    toast = { text: "That does not look like an xAI key.", kind: "bad" };
    render();
    return;
  }
  saveApiKey(key);
  hasKey = true;
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
  toast = { text: "Key saved on this phone. Enchant is live.", kind: "" };
  render();
}

function applyPosition(pos) {
  loc.lat = pos.coords.latitude;
  loc.lng = pos.coords.longitude;
  loc.acc = pos.coords.accuracy;
  loc.err = "";
  if (view === "map" || view === "spot") render();
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
        if (view === "map") render();
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
      if (view === "map") render();
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

async function checkUpdate() {
  toast = { text: "Checking GitHub…", kind: "" };
  render();
  try {
    const res = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error("Could not reach GitHub releases.");
    latestRelease = await res.json();
    const apk = (latestRelease.assets || []).find((asset) => asset.name.endsWith(".apk"));
    if (apk?.browser_download_url) {
      toast = { text: `${latestRelease.name || latestRelease.tag_name} is ready. Opening the APK…`, kind: "" };
      render();
      openExternal(apk.browser_download_url);
      return;
    }
    toast = { text: "Release found, but no APK yet. Open releases and wait for Actions.", kind: "warn" };
    render();
  } catch (err) {
    toast = { text: err.message || "Update check failed.", kind: "bad" };
    render();
  }
}

await setupNativeChrome();
await ping();
if (state.onboarded) startGeo();
render();
