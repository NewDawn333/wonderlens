/** What’s in the source that ships with this APK. Keep newest first. */
export const APP_NEWS = [
  "Line lounge: forehead acting — kids act the word, you guess, tilt down for got it and tilt up to pass.",
  "Setup shows this phone’s version next to the newest GitHub APK and a short what’s-new.",
  "Time machine: send park and car-ride photos back to opening day, 1955.",
];

export function parseAppVersion(text) {
  const match = String(text || "").match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

export function formatReleaseDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function briefReleaseNotes(body, max = 5) {
  const skip =
    /^(sideload|download the apk|open the download|allow chrome|same signing|full changelog|what'?s changed|new contributors)\b/i;
  const items = [];
  for (const raw of String(body || "").split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || /^#+\s/.test(line) || /^\*\*full changelog\*\*/i.test(line)) continue;
    if (/^\d+\.\s/.test(line) && /download|install|allow chrome/i.test(line)) continue;
    line = line.replace(/^[-*]\s+/, "");
    if (skip.test(line) || /sideload `wonderlens|unknown apps/i.test(line)) continue;
    line = line
      .replace(/\s+by @[\w-]+ in https?:\/\/\S+/gi, "")
      .replace(/\s+\(#\d+\)\s*$/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (line.length < 12) continue;
    if (!items.includes(line)) items.push(line);
    if (items.length >= max) break;
  }
  return items;
}

export function installedBuildLabel(info, native = false) {
  if (!native || !info?.version || info.version === "web") {
    return {
      title: "Web preview",
      meta: "No APK version until this is installed on the phone.",
      version: info?.version || "web",
      build: String(info?.build ?? "0"),
    };
  }
  return {
    title: `Wonderlens ${info.version}`,
    meta: `Android versionCode ${info.build}`,
    version: info.version,
    build: String(info.build),
  };
}

export function latestBuildLabel(release) {
  if (!release) return null;
  return {
    title: release.name || release.tag_name || "GitHub release",
    tag: release.tag_name || "",
    when: formatReleaseDate(release.published_at),
    notes: briefReleaseNotes(release.body),
  };
}

export function installedVsLatest(info, release) {
  const mine = parseAppVersion(info?.version);
  const theirs = parseAppVersion(release?.name || release?.tag_name);
  if (!mine || !theirs) return "unknown";
  const left = mine[0] * 10000 + mine[1] * 100 + mine[2];
  const right = theirs[0] * 10000 + theirs[1] * 100 + theirs[2];
  if (left === right) return "latest";
  if (left < right) return "behind";
  return "ahead";
}
