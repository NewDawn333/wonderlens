import fs from "node:fs";
import {
  formatCoords,
  formatRidePlace,
  rideEnchantPrompt,
  rideHeading,
} from "../public/js/data.js";
import { dataUrlToBlob, loadState, saveState } from "../public/js/store.js";

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
assert("prompt keep people", prompt.includes("Keep every person exactly as they appear"));

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

const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`\n${failed.length} check(s) failed`);
  process.exit(1);
}
console.log(`\n${checks.length} checks passed`);
