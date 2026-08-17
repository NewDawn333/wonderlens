/** Simple act-it-out words for a forehead flash-card round. No official mascots. */
export const GUESSTURE_WORDS = [
  "dog",
  "cat",
  "horse",
  "duck",
  "frog",
  "fish",
  "bird",
  "bee",
  "snake",
  "mouse",
  "elephant",
  "lion",
  "bear",
  "pig",
  "cow",
  "chicken",
  "monkey",
  "dinosaur",
  "butterfly",
  "penguin",
  "turtle",
  "rabbit",
  "owl",
  "shark",
  "goat",
  "sleep",
  "dance",
  "swim",
  "fly",
  "sneeze",
  "laugh",
  "cry",
  "eat",
  "drink",
  "run",
  "jump",
  "wave",
  "clap",
  "yawn",
  "tiptoe",
  "cook",
  "drive",
  "rain",
  "snow",
  "ice cream",
  "popcorn",
  "balloon",
  "parade",
  "castle",
  "rocket",
  "train",
  "boat",
  "camera",
  "map",
  "hat",
  "cowboy",
  "pirate",
  "robot",
  "wizard",
  "knight",
  "trumpet",
  "drum",
  "picnic",
  "suitcase",
  "telephone",
  "newspaper",
  "carousel",
  "ferris wheel",
  "cotton candy",
  "streetcar",
  "fireworks",
  "umbrella",
  "toothbrush",
  "scissors",
  "airplane",
  "tractor",
  "lighthouse",
  "campfire",
  "fishing",
  "baseball",
  "hopscotch",
];

export const GUESSTURE_SECONDS = 60;

export function shuffleWords(list, rng = Math.random) {
  const out = Array.isArray(list) ? list.slice() : [];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function tiltZone(beta) {
  if (beta == null || beta === "") return "unknown";
  const angle = Number(beta);
  if (!Number.isFinite(angle)) return "unknown";
  // Forehead hold is ~upright (90). Tilt toward the ground (~180) = got it.
  // Tilt toward the sky (~0) = pass.
  if (angle < 35) return "up";
  if (angle > 140) return "down";
  if (angle > 55 && angle < 120) return "neutral";
  return "tween";
}

export function betaFromGravity(gravity) {
  if (!gravity || typeof gravity !== "object") return null;
  const z = Number(gravity.z);
  const mag = Math.hypot(Number(gravity.x) || 0, Number(gravity.y) || 0, z);
  if (!mag) return null;
  const clamped = Math.min(1, Math.max(-1, z / mag));
  return (Math.acos(clamped) * 180) / Math.PI;
}

export function createTiltGate() {
  let armed = false;
  return function feed(zone) {
    if (zone === "neutral") {
      armed = true;
      return null;
    }
    if (!armed) return null;
    if (zone === "down") {
      armed = false;
      return "got";
    }
    if (zone === "up") {
      armed = false;
      return "pass";
    }
    return null;
  };
}
