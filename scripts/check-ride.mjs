import fs from "node:fs";
import {
  LAND_ERA,
  PARK_MAPS,
  RIDE_PRESETS,
  SPOTS,
  cleanPolishedExtras,
  enchantPrompt,
  extrasForRideLook,
  formatCoords,
  formatRidePlace,
  gpsMovedEnough,
  haversineM,
  lineBuddyPrompt,
  parkContains,
  polishRideIdeaPrompt,
  rideEnchantPrompt,
  rideHeading,
  GAMES,
} from "../public/js/data.js";
import { dataUrlToBlob, loadState, maskedApiKey, normalizeApiKey, saveApiKey, saveState } from "../public/js/store.js";
import {
  APP_NEWS,
  briefReleaseNotes,
  formatReleaseDate,
  installedBuildLabel,
  installedVsLatest,
  latestBuildLabel,
  parseAppVersion,
} from "../public/js/news.js";
import {
  GUESSTURE_SECONDS,
  GUESSTURE_WORDS,
  betaFromGravity,
  createTiltGate,
  shuffleWords,
  tiltZone,
} from "../public/js/guesstures.js";

const checks = [];
function assert(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
  if (!ok) console.error(`FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  else console.log(`ok   ${name}${detail ? ` — ${detail}` : ""}`);
}

if (typeof globalThis.localStorage === "undefined") {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (key) => (mem.has(key) ? mem.get(key) : null),
    setItem: (key, value) => mem.set(key, String(value)),
    removeItem: (key) => mem.delete(key),
  };
}

assert("gates heading", rideHeading(0.4) === "At the gates");
assert("leaving heading", rideHeading(3) === "Leaving town");
assert("road heading", rideHeading(22) === "On the road");
assert("unknown heading", rideHeading(null) === "On the road");

assert(
  "city + region",
  formatRidePlace({ city: "Irvine", principalSubdivisionCode: "US-CA" }) === "Irvine, CA"
);
assert(
  "metro prefers locality",
  formatRidePlace({
    city: "Anaheim-Santa Ana-Garden Grove",
    locality: "Anaheim",
    principalSubdivisionCode: "US-CA",
  }) === "Anaheim, CA"
);
assert(
  "admin city beats region",
  formatRidePlace({
    city: "Central Coast",
    locality: "Irvine",
    principalSubdivisionCode: "US-CA",
    localityInfo: { administrative: [{ name: "Irvine", adminLevel: 8 }] },
  }) === "Irvine, CA"
);
assert(
  "locality beats bulky city",
  formatRidePlace({
    city: "Central Coast",
    locality: "Irvine",
    principalSubdivisionCode: "US-CA",
  }) === "Irvine, CA"
);
assert("empty geo", formatRidePlace({}) === "");
assert("coords", formatCoords(33.8097, -117.919) === "33.810°N, 117.919°W");

const prompt = rideEnchantPrompt("Irvine, CA", ["Maya", "Sam"]);
assert("prompt names", prompt.includes("Maya, Sam"));
assert("prompt place", prompt.includes("Irvine, CA"));
assert("prompt no mascots", prompt.includes("Do not add recognizable copyrighted mascots"));
assert("prompt is 1955", prompt.includes("1955"));
assert("prompt keeps faces", /same recognizable people|same face/i.test(prompt));
assert("prompt restyles clothes", /restyle every person/i.test(prompt) && /clothing|dress|hair/i.test(prompt));
assert("prompt not freeze clothes", !/Keep every person exactly as they appear/.test(prompt));
assert("prompt photoreal film", /photoreal/i.test(prompt));

const parkPrompt = enchantPrompt(SPOTS[0], ["Maya"]);
assert("park prompt names", parkPrompt.includes("Maya"));
assert("park prompt 1955", parkPrompt.includes("1955"));
assert("park prompt restyle", /restyle every person/i.test(parkPrompt));
assert("park prompt era land", parkPrompt.includes("opening-day Main Street"));
assert("park prompt no modern land ip", !/\b(pixar|avengers|galaxy's edge)\b/i.test(parkPrompt));

assert("twelve ride presets", RIDE_PRESETS.length === 12);
const banned = /\b(mickey|minnie|disney|pixar|goofy|donald|tinker|elsa|frozen|marvel)\b/i;
for (const item of RIDE_PRESETS) {
  const blob = `${item.id} ${item.label} ${item.blurb} ${item.extras}`;
  assert(`preset ${item.id} has label`, Boolean(item.label));
  assert(`preset ${item.id} face lock`, /face/i.test(item.extras));
  assert(`preset ${item.id} photoreal`, /photoreal/i.test(item.extras));
  assert(`preset ${item.id} restyle`, /restyle|1955|1950s/i.test(item.extras));
  assert(`preset ${item.id} no marks`, !banned.test(blob));
}
assert(
  "preset extras used",
  rideEnchantPrompt("Irvine, CA", ["Maya"], RIDE_PRESETS[0].extras).includes("opening day")
);
assert("first preset is opening day", RIDE_PRESETS[0].id === "opening-day");
assert(
  "custom look uses idea",
  extrasForRideLook({ style: "custom", idea: "quiet moonlit road", polished: "" }).includes("quiet moonlit road")
);
assert(
  "custom look prefers polished",
  extrasForRideLook({ style: "custom", idea: "sparkles", polished: "Keep faces. Add window sparkle only." }).includes(
    "window sparkle"
  )
);
assert("named look uses extras", extrasForRideLook({ style: "kodachrome" }).includes("Kodachrome"));
const polishAsk = polishRideIdeaPrompt("chrome bumper, Sunday best");
assert("polish includes idea", polishAsk.includes("chrome bumper, Sunday best"));
assert("polish bans mascots", /no copyrighted character names/i.test(polishAsk));
assert("polish is 1955", polishAsk.includes("1955"));
assert("polish restyles clothes", /restyle clothing/i.test(polishAsk));
const buddyAsk = lineBuddyPrompt({ kind: "story", land: "Main Street", crew: "Maya & Sam", wait: "Main Street queue" });
assert("buddy is 1955", buddyAsk.includes("1955"));
assert("buddy bans mascots", /no copyrighted character names/i.test(buddyAsk));
assert("buddy recasts later lands", !banned.test(lineBuddyPrompt({ kind: "story", land: "Pixar Pier", crew: "Maya" })));
assert("clean fences", cleanPolishedExtras("```\nKeep faces. Add lanterns.\n```") === "Keep faces. Add lanterns.");
assert("gps missing prev", gpsMovedEnough(null, { lat: 33.64, lng: -117.84 }));
assert("gps tiny stay", !gpsMovedEnough({ lat: 33.64, lng: -117.84 }, { lat: 33.64001, lng: -117.84 }));
assert("gps far move", gpsMovedEnough({ lat: 33.64, lng: -117.84 }, { lat: 33.65, lng: -117.84 }));

const fresh = loadState();
assert("new state has rides array", Array.isArray(fresh.rides) && fresh.rides.length === 0);
saveState({
  ...fresh,
  onboarded: true,
  crew: ["Maya", "Sam"],
  rides: [
    {
      id: "ride-1",
      at: 1,
      lat: 33.64,
      lng: -117.84,
      place: "Irvine, CA",
      heading: "On the road",
      stamp: "Road light",
    },
  ],
});
const reloaded = loadState();
assert("persists ride place", reloaded.rides[0]?.place === "Irvine, CA");
assert("persists ride heading", reloaded.rides[0]?.heading === "On the road");
assert("keeps crew", reloaded.crew.join(" & ") === "Maya & Sam");

const pixel =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const blob = dataUrlToBlob(pixel);
assert("dataUrlToBlob type", blob.type.startsWith("image/"));
assert("dataUrlToBlob size", blob.size > 0);
let threw = false;
try {
  dataUrlToBlob("not-a-photo");
} catch {
  threw = true;
}
assert("dataUrlToBlob rejects junk", threw);

const src = fs.readFileSync(new URL("../public/js/app.js", import.meta.url), "utf8");
assert("save no longer requires enchanted", !/if \(!activeSpot \|\| !draft\.enchanted\) return;/.test(src));
assert("save requires original", src.includes("if (!activeSpot || !draft.original) return false;"));
assert("auto-save after capture", src.includes("await saveShot({ stay: true })"));
assert("splash is a time machine", src.includes("A time machine for the park day"));
assert("splash has opening day 1955", src.includes("opening day, 1955"));
assert("splash dropped shoot the kids", !/Shoot the kids/i.test(src));
assert("send back button", src.includes("Send back to 1955"));
assert("traveling busy", src.includes("Traveling…"));
assert("default ride look", src.includes('style: "opening-day"'));
assert("key test button", src.includes("Test this key"));
assert("key test hits api-key", src.includes('"/api-key"'));
assert("ride enchant anywhere", src.includes("no park GPS needed") || src.includes("you do not need to be at the park"));
assert("ride style chips", src.includes("data-ride-style"));
assert("custom idea box", src.includes('id="ride-idea"'));
assert("polish button", src.includes('id="polish-prompt"'));
assert("gps skip tiny moves", src.includes("gpsMovedEnough"));
assert("restore map scroll", src.includes("keepScroll"));
assert("polish uses grok", src.includes("polishRideIdeaPrompt"));
assert("buddy uses helper", src.includes("lineBuddyPrompt"));
assert("live park map mount", src.includes("mountParkMap"));
assert("park map container", src.includes('id="park-map"'));
assert("leaflet vendored js", fs.existsSync(new URL("../public/vendor/leaflet/leaflet.js", import.meta.url)));
assert("leaflet vendored css", fs.existsSync(new URL("../public/vendor/leaflet/leaflet.css", import.meta.url)));
assert("no schematic mapSvg", !src.includes("function mapSvg"));
assert("setup this phone card", src.includes("This phone"));
assert("setup newest github card", src.includes("Newest GitHub build"));
assert("setup loads latest on boot", src.includes("void loadLatestRelease()"));
assert("setup news list", src.includes("APP_NEWS"));
assert("forehead game in line", src.includes("openGuess") && src.includes('id === "act"'));
assert("forehead guess view", src.includes("function renderGuess"));
assert("forehead tilt down got", src.includes('id="guess-got"'));
assert("forehead tilt up pass", src.includes('id="guess-pass"'));

const dlSpots = SPOTS.filter((spot) => spot.park === "dl");
const dcaSpots = SPOTS.filter((spot) => spot.park === "dca");
assert("dl has fourteen hunts", dlSpots.length === 14);
assert("dca has eight hunts", dcaSpots.length === 8);
for (const spot of SPOTS) {
  assert(`${spot.id} in ${spot.park} bounds`, parkContains(spot.park, spot));
  assert(`${spot.id} extras 1955`, /1955|1950s/.test(spot.extras));
  assert(`${spot.id} extras clothes`, /dress|clothes|Family in/i.test(spot.extras));
  assert(`${spot.id} extras not freeze`, !/unchanged|exactly as they appear/i.test(spot.extras));
  assert(`${spot.id} era land`, Boolean(LAND_ERA[spot.land]));
  const imagine = enchantPrompt(spot, ["Maya"]);
  assert(`${spot.id} imagine 1955`, imagine.includes("1955"));
  assert(`${spot.id} imagine no marks`, !banned.test(imagine));
}
assert("two park frames", Boolean(PARK_MAPS.dl && PARK_MAPS.dca));
assert(
  "castle on the real castle",
  haversineM(
    SPOTS.find((spot) => spot.id === "castle"),
    { lat: 33.812806, lng: -117.918956 }
  ) < 20
);
assert(
  "space mountain on the real mountain",
  haversineM(
    SPOTS.find((spot) => spot.id === "space"),
    { lat: 33.810969, lng: -117.917501 }
  ) < 25
);
assert(
  "grizzly on the rapids",
  haversineM(
    SPOTS.find((spot) => spot.id === "grizzly"),
    { lat: 33.807193, lng: -117.920639 }
  ) < 40
);

assert("normalize trims", normalizeApiKey("  xai-abcDEF123  ") === "xai-abcDEF123");
assert("normalize bearer", normalizeApiKey("Bearer xai-abcDEF123") === "xai-abcDEF123");
assert("normalize env line", normalizeApiKey("XAI_API_KEY=xai-abcDEF123") === "xai-abcDEF123");
saveApiKey("xai-testkey9999");
assert("masked key", maskedApiKey() === "xai-…9999");

assert("parse version from release name", parseAppVersion("Wonderlens 1.0.7")?.join(".") === "1.0.7");
assert("parse version ignores junk", parseAppVersion("web") === null);
assert("release date utc", formatReleaseDate("2026-08-16T22:20:14Z") === "Aug 16, 2026");
const sampleNotes = briefReleaseNotes(`Sideload \`wonderlens.apk\` over the existing Wonderlens install. Same signing key, so you do not uninstall.

1. Download the APK below in Chrome
2. Open the download and Install
3. Allow Chrome to install unknown apps if Android asks

## What's Changed
* Send every photo back to opening day, 1955 by @NewDawn333 in https://github.com/NewDawn333/wonderlens/pull/4

**Full Changelog**: https://github.com/NewDawn333/wonderlens/compare/build-6...build-7`);
assert("notes skip sideload", !sampleNotes.some((item) => /sideload|download the apk/i.test(item)));
assert("notes keep pr title", sampleNotes.some((item) => /opening day, 1955/i.test(item)));
assert(
  "phone on latest",
  installedVsLatest({ version: "1.0.7", build: "17" }, { name: "Wonderlens 1.0.7", tag_name: "build-7" }) === "latest"
);
assert(
  "phone behind latest",
  installedVsLatest({ version: "1.0.6", build: "16" }, { name: "Wonderlens 1.0.7", tag_name: "build-7" }) === "behind"
);
assert("web vs latest unknown", installedVsLatest({ version: "web", build: "0" }, { name: "Wonderlens 1.0.7" }) === "unknown");
assert("installed web label", installedBuildLabel({ version: "web", build: "0" }, false).title === "Web preview");
assert("installed apk label", installedBuildLabel({ version: "1.0.7", build: "17" }, true).title === "Wonderlens 1.0.7");
assert(
  "latest label uses name",
  latestBuildLabel({ name: "Wonderlens 1.0.7", tag_name: "build-7", published_at: "2026-08-16T22:20:14Z", body: "" }).title ===
    "Wonderlens 1.0.7"
);
assert("app news has items", APP_NEWS.length >= 3);
assert("app news no disney marks", !/\b(mickey|minnie|disney|pixar)\b/i.test(APP_NEWS.join(" ")));
const workflow = fs.readFileSync(new URL("../.github/workflows/android-release.yml", import.meta.url), "utf8");
assert("release notes from app news", workflow.includes("APP_NEWS") && workflow.includes("body_path: release-body.md"));

assert("forehead game listed", GAMES.act?.title === "Forehead acting");
assert("guessture seconds", GUESSTURE_SECONDS === 60);
assert("guessture word count", GUESSTURE_WORDS.length >= 40);
assert(
  "guessture words unique",
  new Set(GUESSTURE_WORDS).size === GUESSTURE_WORDS.length
);
assert(
  "guessture words short",
  GUESSTURE_WORDS.every((word) => word.length >= 2 && word.length <= 18)
);
assert(
  "guessture no marks",
  !/\b(mickey|minnie|disney|pixar|goofy|donald|tinker|elsa|frozen|marvel)\b/i.test(GUESSTURE_WORDS.join(" "))
);
assert("tilt upright is ready", tiltZone(90) === "neutral");
assert("tilt to ground is got", tiltZone(165) === "down");
assert("tilt to sky is pass", tiltZone(15) === "up");
assert("tilt unknown", tiltZone(null) === "unknown");
const gate = createTiltGate();
assert("gate waits for forehead", gate("down") === null);
assert("gate arms on forehead", gate("neutral") === null);
assert("gate got after down", gate("down") === "got");
assert("gate needs forehead again", gate("up") === null);
assert("gate pass after up", gate("neutral") === null && gate("up") === "pass");
assert("shuffle keeps length", shuffleWords(GUESSTURE_WORDS).length === GUESSTURE_WORDS.length);
assert("gravity upright ~90", Math.abs(betaFromGravity({ x: 0, y: 9.8, z: 0 }) - 90) < 2);
assert("gravity sky is pass", tiltZone(betaFromGravity({ x: 0, y: 0, z: 9.8 })) === "up");
assert("gravity ground is got", tiltZone(betaFromGravity({ x: 0, y: 0, z: -9.8 })) === "down");

const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`\n${failed.length} check(s) failed`);
  process.exit(1);
}
console.log(`\n${checks.length} checks passed`);
