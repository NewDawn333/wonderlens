export const PARK_CENTER = { lat: 33.8097, lng: -117.9190 };
export const PRACTICE_KM = 4;

export const PARKS = {
  dl: {
    id: "dl",
    name: "Disneyland Park",
    short: "Disneyland",
    hint: "Castle, lands, and the original magic",
  },
  dca: {
    id: "dca",
    name: "California Adventure",
    short: "DCA",
    hint: "Pier, cars, peaks, and superheroes",
  },
};

export const SPOTS = [
  {
    id: "main-street",
    park: "dl",
    land: "Main Street",
    name: "Front Gate Glow",
    short: "Gates",
    lat: 33.80995,
    lng: -117.91897,
    radiusM: 120,
    x: 50,
    y: 88,
    color: "#f0c36a",
    icon: "lamp",
    stamp: "Arrival",
    mission: "Stand just inside the gates, facing the flower beds and the street. Get every kid in the first photo of the day.",
    clue: "The day starts where the flowers spell the park.",
    extras:
      "Add warm golden hour sparkle, drifting gold dust motes, vintage street-lamp glow, and a soft confetti of tiny paper pennants in the air. Keep the real street and people unchanged.",
  },
  {
    id: "castle",
    park: "dl",
    land: "Fantasyland",
    name: "Castle Heart",
    short: "Castle",
    lat: 33.81285,
    lng: -117.91897,
    radiusM: 130,
    x: 50,
    y: 38,
    color: "#ffd27a",
    icon: "castle",
    stamp: "Castle Light",
    mission: "Shoot from the hub looking at the castle. Kids in front, turrets behind. This is the postcard.",
    clue: "The park's compass. Everyone photographs it. Make yours the one that shimmers.",
    extras:
      "Add cinematic gold-and-teal fireworks blooming softly behind the castle turrets, a faint ribbon of aurora in the sky, and floating spark motes around the family. Keep every person exactly as they appear.",
  },
  {
    id: "jungle",
    park: "dl",
    land: "Adventureland",
    name: "River Canopy",
    short: "Jungle",
    lat: 33.81145,
    lng: -117.91995,
    radiusM: 110,
    x: 32,
    y: 58,
    color: "#5bd38a",
    icon: "leaf",
    stamp: "Canopy",
    mission: "Find hanging vines, carved wood, or the river boats. Kids looking like explorers.",
    clue: "Listen for water, drums, and bad jokes about hippos.",
    extras:
      "Add fireflies, a lush overgrown jungle canopy leaking golden shafts of light, and a distant misty river. A colorful tropical bird may perch nearby. Keep every person exactly as they appear.",
  },
  {
    id: "temple",
    park: "dl",
    land: "Adventureland",
    name: "Temple Trail",
    short: "Temple",
    lat: 33.81125,
    lng: -117.92045,
    radiusM: 100,
    x: 24,
    y: 62,
    color: "#d4a25a",
    icon: "temple",
    stamp: "Relic",
    mission: "Use the weathered stone, bamboo, or queue carvings as the backdrop. One dramatic explorer pose.",
    clue: "Boulders, torches, and a temple that wants your hat.",
    extras:
      "Add cinematic dust motes, warm torchlight, ancient carved stone catching gold light, and a hint of vine-covered ruins. Keep every person exactly as they appear.",
  },
  {
    id: "pirates",
    park: "dl",
    land: "New Orleans Square",
    name: "Lantern Landing",
    short: "Pirates",
    lat: 33.81115,
    lng: -117.92075,
    radiusM: 100,
    x: 20,
    y: 54,
    color: "#e0b15a",
    icon: "ship",
    stamp: "Lantern",
    mission: "Brick, iron lace, or the blue-and-white building. Kids as a tiny crew.",
    clue: "Wrought iron, jazz in the air, and a bay that hides a ship.",
    extras:
      "Add hanging warm lanterns, soft sea mist, gold doubloon sparkles, and a ghostly tall-ship silhouette far in the fog. Keep every person exactly as they appear.",
  },
  {
    id: "mansion",
    park: "dl",
    land: "New Orleans Square",
    name: "Moonlit Manor",
    short: "Manor",
    lat: 33.81165,
    lng: -117.92245,
    radiusM: 110,
    x: 14,
    y: 46,
    color: "#b8c4ff",
    icon: "gate",
    stamp: "Moonveil",
    mission: "Iron gates, the white manor, or the stretching lawn. Slightly spooky, still smiling.",
    clue: "A house on the hill that is dying to meet you.",
    extras:
      "Add moonlight, pale blue ghostly wisps, drifting fog, and tiny friendly glowing orbs. Keep the mood whimsical, not scary. Keep every person exactly as they appear.",
  },
  {
    id: "bayou",
    park: "dl",
    land: "Bayou Country",
    name: "Bayou Fireflies",
    short: "Bayou",
    lat: 33.81245,
    lng: -117.92265,
    radiusM: 120,
    x: 16,
    y: 36,
    color: "#7be0a6",
    icon: "firefly",
    stamp: "Firefly",
    mission: "Trees, water, or the bayou ride plaza. Soft smiles, like a lullaby.",
    clue: "Cypress, water, and a hundred little lights.",
    extras:
      "Add hundreds of warm fireflies, willow reflections on dark water, and a honey-gold dusk glow. Keep every person exactly as they appear.",
  },
  {
    id: "thunder",
    park: "dl",
    land: "Frontierland",
    name: "Thunder Mesa",
    short: "Thunder",
    lat: 33.81265,
    lng: -117.92035,
    radiusM: 120,
    x: 28,
    y: 40,
    color: "#e39a4a",
    icon: "mesa",
    stamp: "Mesa",
    mission: "Red rock, mine trains, or the canyon. Kids as prospectors.",
    clue: "A mountain that growls and a town that never struck it rich.",
    extras:
      "Add a painted-desert sunset, blowing gold dust, and dramatic canyon light behind the family. Keep every person exactly as they appear.",
  },
  {
    id: "spire",
    park: "dl",
    land: "Galaxy's Edge",
    name: "Black Spire Outpost",
    short: "Outpost",
    lat: 33.81435,
    lng: -117.92095,
    radiusM: 140,
    x: 22,
    y: 22,
    color: "#7ec8ff",
    icon: "spire",
    stamp: "Outpost",
    mission: "Stone market, strange ships, or the tall rock spires. Look like you live here.",
    clue: "Two suns' worth of attitude. A galaxy in a canyon.",
    extras:
      "Add two moons in a deep twilight sky, distant starfighters as tiny lights, and cool blue-orange alien market glow. No logos. Keep every person exactly as they appear.",
  },
  {
    id: "small-world",
    park: "dl",
    land: "Fantasyland",
    name: "Clockwork Canal",
    short: "Canal",
    lat: 33.81472,
    lng: -117.91783,
    radiusM: 110,
    x: 64,
    y: 18,
    color: "#8fd4ff",
    icon: "clock",
    stamp: "Clockwork",
    mission: "The white facade, gold trim, or the canal. Big wave at the camera.",
    clue: "A little clock, a long song, a whole world in a boat.",
    extras:
      "Add bright paper-craft flags, floating colorful balloons, and a joyful confetti of tiny flowers. Keep every person exactly as they appear.",
  },
  {
    id: "toontown",
    park: "dl",
    land: "Toontown",
    name: "Ink & Paint Square",
    short: "Toontown",
    lat: 33.81539,
    lng: -117.91867,
    radiusM: 120,
    x: 54,
    y: 10,
    color: "#ff8ba7",
    icon: "balloon",
    stamp: "Inkblot",
    mission: "Crooked houses, bright paint, or the fountain. Kids extra goofy.",
    clue: "Nothing is straight, and that is the point.",
    extras:
      "Add bouncy cartoon clouds, oversized candy-colored props, and playful ink-splash sparkles. Keep the people photoreal and unchanged.",
  },
  {
    id: "matterhorn",
    park: "dl",
    land: "Fantasyland",
    name: "Matterhorn Meadow",
    short: "Matterhorn",
    lat: 33.81306,
    lng: -117.91778,
    radiusM: 120,
    x: 66,
    y: 32,
    color: "#c5d4e8",
    icon: "peak",
    stamp: "Summit",
    mission: "Get the mountain in the shot. Kids pointing at the peak.",
    clue: "The park's only alp. It honks. It snows. It watches.",
    extras:
      "Add a dusting of magical snowfall, a soft alpine glow on the peak, and tiny sparkles like ice crystals. Keep every person exactly as they appear.",
  },
  {
    id: "tomorrow",
    park: "dl",
    land: "Tomorrowland",
    name: "Tomorrow Plaza",
    short: "Tomorrow",
    lat: 33.8117,
    lng: -117.91805,
    radiusM: 110,
    x: 70,
    y: 52,
    color: "#5ad0d0",
    icon: "orbit",
    stamp: "Orbit",
    mission: "Rockets, neon, or the spinning machine. Future-family energy.",
    clue: "The future that still looks like 1959, and that is a compliment.",
    extras:
      "Add neon orbit rings, a starfield sky, and sleek retro-future light trails. Keep every person exactly as they appear.",
  },
  {
    id: "space",
    park: "dl",
    land: "Tomorrowland",
    name: "Star Mountain",
    short: "Space",
    lat: 33.81122,
    lng: -117.9173,
    radiusM: 110,
    x: 80,
    y: 48,
    color: "#8aa7ff",
    icon: "star",
    stamp: "Starfield",
    mission: "White mountain, rockets, or the courtyard. Kids as astronauts.",
    clue: "The white cone that launches you through the dark.",
    extras:
      "Add a dense starfield, faint nebula color, and tiny comet streaks in the sky above the real scene. Keep every person exactly as they appear.",
  },
  {
    id: "buena",
    park: "dca",
    land: "Buena Vista Street",
    name: "Red Car Welcome",
    short: "Buena Vista",
    lat: 33.80785,
    lng: -117.91805,
    radiusM: 120,
    x: 62,
    y: 18,
    color: "#f0c36a",
    icon: "trolley",
    stamp: "Red Car",
    mission: "The boulevard, the trolley, or the theater-like entrance. Old Hollywood smiles.",
    clue: "1920s Los Angeles with better snacks.",
    extras:
      "Add warm tungsten street glow, vintage bokeh lights, and a hint of golden-age Hollywood sparkle. Keep every person exactly as they appear.",
  },
  {
    id: "carthay",
    park: "dca",
    land: "Buena Vista Street",
    name: "Carthay Circle",
    short: "Carthay",
    lat: 33.80735,
    lng: -117.91865,
    radiusM: 100,
    x: 50,
    y: 28,
    color: "#e8c27a",
    icon: "theater",
    stamp: "Circle",
    mission: "The round plaza and the grand theater. One elegant family portrait.",
    clue: "The park's living room. Gold, palms, and a fountain.",
    extras:
      "Add soft golden hour, climbing roses, and elegant film-premiere sparkles in the air. Keep every person exactly as they appear.",
  },
  {
    id: "avengers",
    park: "dca",
    land: "Avengers Campus",
    name: "Campus Yard",
    short: "Campus",
    lat: 33.80675,
    lng: -117.91695,
    radiusM: 130,
    x: 78,
    y: 36,
    color: "#ff6b6b",
    icon: "shield",
    stamp: "Recruit",
    mission: "Industrial campus, murals, or the big yard. Superhero stance optional. Cool is required.",
    clue: "A campus that trains heroes. You already brought some.",
    extras:
      "Add subtle comic-book energy cracks of gold and crimson light, floating embers, and a heroic sky. No logos or costumes copied onto people. Keep every person exactly as they appear.",
  },
  {
    id: "cars",
    park: "dca",
    land: "Cars Land",
    name: "Route 66 Neon",
    short: "Route 66",
    lat: 33.80545,
    lng: -117.91855,
    radiusM: 130,
    x: 52,
    y: 68,
    color: "#ff9a4a",
    icon: "neon",
    stamp: "Neon",
    mission: "Neon motel, mountain backdrop, or the main street of Radiator Springs. Sunset energy even at noon.",
    clue: "A whole town built from taillights and desert sky.",
    extras:
      "Add glowing Route 66 neon, a huge painted sunset, and warm desert dust in the light. Keep every person exactly as they appear.",
  },
  {
    id: "grizzly",
    park: "dca",
    land: "Grizzly Peak",
    name: "Grizzly Peak",
    short: "Peak",
    lat: 33.80705,
    lng: -117.92105,
    radiusM: 120,
    x: 22,
    y: 40,
    color: "#7dcea0",
    icon: "bear",
    stamp: "Trail",
    mission: "Pines, the peak, or the rapids plaza. National-park family photo.",
    clue: "California wilderness, with a gift shop.",
    extras:
      "Add tall golden-hour pines, a hawk in the distance, and sunbeams through mountain mist. Keep every person exactly as they appear.",
  },
  {
    id: "pier",
    park: "dca",
    land: "Pixar Pier",
    name: "Boardwalk Brights",
    short: "Pier",
    lat: 33.80465,
    lng: -117.92115,
    radiusM: 120,
    x: 28,
    y: 78,
    color: "#ff7eb6",
    icon: "wheel",
    stamp: "Boardwalk",
    mission: "Ferris wheel color, midway lights, or the boardwalk. Carnival grins.",
    clue: "A pier that stole every color in the crayon box.",
    extras:
      "Add carnival bokeh lights, a pastel dusk sky, and reflections on the water. Keep every person exactly as they appear.",
  },
  {
    id: "bay",
    park: "dca",
    land: "Paradise Gardens",
    name: "Paradise Bay",
    short: "Bay",
    lat: 33.80525,
    lng: -117.92145,
    radiusM: 120,
    x: 34,
    y: 64,
    color: "#7ecbff",
    icon: "wave",
    stamp: "Tide",
    mission: "The lagoon, the bridge, or the gardens. Save one for evening if you can.",
    clue: "A bowl of water that turns into a show after dark.",
    extras:
      "Add luminous water-fountain color, floating lantern-like lights, and a mirror-smooth bay reflecting the family. Keep every person exactly as they appear.",
  },
  {
    id: "hollywood",
    park: "dca",
    land: "Hollywood Land",
    name: "Backlot Glow",
    short: "Hollywood",
    lat: 33.8079,
    lng: -117.9173,
    radiusM: 110,
    x: 76,
    y: 22,
    color: "#e8b86d",
    icon: "clap",
    stamp: "Backlot",
    mission: "Soundstage streets, posters, or the tower plaza. Movie-premiere faces.",
    clue: "The part of the park that knows it is on camera.",
    extras:
      "Add dramatic movie-set lighting, warm spotlight cones, and a dusting of gold spark. Keep every person exactly as they appear.",
  },
];

export const TRAIL = {
  dl: [
    "main-street",
    "jungle",
    "temple",
    "pirates",
    "mansion",
    "bayou",
    "thunder",
    "spire",
    "castle",
    "small-world",
    "toontown",
    "matterhorn",
    "tomorrow",
    "space",
  ],
  dca: ["buena", "hollywood", "avengers", "carthay", "grizzly", "cars", "bay", "pier"],
};

export const GAMES = {
  spy: {
    title: "I Spy",
    blurb: "One person spies. Everyone else hunts.",
    items: {
      "Main Street": ["something gold", "a window that looks like a shop from 1910", "a flower that is not a flower", "a flag", "someone in a hat"],
      Fantasyland: ["a turret", "something that spins", "a storybook color", "a tiny door", "a horse"],
      Adventureland: ["a carving", "something that could hide a snake", "bamboo", "a mask", "water"],
      "New Orleans Square": ["iron lace", "a lantern", "brick", "something blue and white", "a balcony"],
      "Bayou Country": ["a firefly-looking light", "a tree with character", "water", "green on green", "a wooden detail"],
      Frontierland: ["red rock", "something western", "a cactus shape", "a wagon vibe", "dust-colored paint"],
      "Galaxy's Edge": ["a spire", "something that looks built, not bought", "a crate", "blue light", "a ship shape"],
      Toontown: ["something crooked on purpose", "a giant prop", "a face in a building", "a bright pink", "a fountain"],
      Tomorrowland: ["a planet", "chrome", "something that looks like 1959's future", "a rocket", "neon"],
      "Buena Vista Street": ["a trolley clue", "gold lettering", "a palm", "a theater shape", "a lamp"],
      "Avengers Campus": ["a mural", "something industrial", "red", "a badge shape", "a hangar vibe"],
      "Cars Land": ["neon", "a mountain wall", "a cone", "something chrome", "a motel clue"],
      "Grizzly Peak": ["a pine", "a trail sign", "wood", "a peak", "something ranger"],
      "Pixar Pier": ["a giant color", "a wheel", "stripes", "a midway light", "something silly"],
      "Paradise Gardens": ["water", "a garden detail", "a bridge", "a color in the bay", "a banner"],
      "Hollywood Land": ["a poster", "a spotlight shape", "a stage door", "gold", "something that wants an autograph"],
    },
  },
  rather: {
    title: "Would You Rather",
    blurb: "No maybe. Pick a side. Defend it.",
    items: [
      "Ride in the front row forever, or skip every line forever?",
      "Be three inches tall for one ride, or thirty feet tall for one parade?",
      "Eat only churros today, or never eat a churro again?",
      "Have a map that talks, or shoes that never get tired?",
      "A secret tunnel under the park, or a balloon that can actually fly you over it?",
      "Meet a dragon, or captain a ship for one night?",
      "It rains gold glitter for ten minutes, or the whole park is empty just for you for ten minutes?",
      "A pocket that makes snacks appear, or a hat that makes lines think you already rode?",
      "Sleep overnight in a treehouse, or in a spaceship?",
      "Swap voices with a parent for one hour, or swap heights with a sibling?",
      "A photo that moves, or a souvenir that tells jokes?",
      "Be the parade, or watch the parade from the castle roof?",
    ],
  },
  riddle: {
    title: "Ride Riddles",
    blurb: "Guess the attraction. No phones. Smugness allowed.",
    items: [
      { q: "I am a house that is not done being a house.", a: "The haunted manor" },
      { q: "I promise a small trip and then keep singing.", a: "The little canal boat around the world" },
      { q: "I am a mountain that learned how to launch.", a: "The white space mountain" },
      { q: "I am a mountain that learned how to growl.", a: "The runaway mine train" },
      { q: "I am wet, wooden, and bad at geography on purpose.", a: "The jungle river boats" },
      { q: "I am a city that thinks it is a car commercial.", a: "The desert town with neon" },
      { q: "I am a wheel that borrowed every crayon.", a: "The giant pier wheel" },
      { q: "I am a temple with opinions about hats.", a: "The adventure temple" },
      { q: "I am a bayou that learned to drop.", a: "The bayou log ride" },
      { q: "I am the park's compass and everyone photographs my face.", a: "The castle" },
    ],
  },
  story: {
    title: "One-Line Story",
    blurb: "Each person adds one sentence. No take-backs.",
    items: [
      "We found a key in the flower bed, and it opened...",
      "The popcorn bucket whispered a map to...",
      "A balloon slipped its string and led us to...",
      "Under the next bench was a door labeled...",
      "The castle clock struck thirteen and then...",
      "A raccoon in a very small vest offered us...",
      "The trolley rang twice, then turned down a street that is not on any map...",
    ],
  },
  voice: {
    title: "Voice Swap",
    blurb: "Say the line in the requested voice.",
    items: [
      "A pirate announcing the snack menu",
      "A knight who is afraid of ducks",
      "A robot trying to understand cotton candy",
      "A mountain that is tired of being climbed",
      "A very fancy teapot giving directions",
      "A spaceship computer that only speaks in snack names",
      "A ghost who is extremely polite about personal space",
      "A street magician selling invisible maps",
    ],
  },
  hunt: {
    title: "Queue Hunt",
    blurb: "First one to spot it wins the next snack negotiation.",
    items: [
      "A hidden face in the architecture",
      "Someone with a birthday pin or badge",
      "A cast member who does a tiny bit of extra theater",
      "A shoe that has already lived a full life today",
      "The same color in three different places",
      "A kid doing a better pose than the statue",
      "A detail you would miss if you were looking at your phone",
    ],
  },
};

export const BUDDY_KINDS = [
  { id: "story", label: "90-second story" },
  { id: "game", label: "Playable game" },
  { id: "riddle", label: "Land riddle" },
  { id: "cast", label: "Silly cast list" },
];

export function haversineM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

export function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return "—";
  if (meters < 18) return "here";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function enchantPrompt(spot, crew) {
  const names = crew.length ? crew.join(", ") : "this family";
  return [
    `This is a real family photograph of ${names} taken at a theme-park landmark called ${spot.name} in ${spot.land}.`,
    "Keep every person exactly as they appear, including faces, ages, bodies, hair, clothing, poses, and expressions.",
    "Do not replace, beautify, age-shift, cartoonify, or redraw any person. Do not add recognizable copyrighted mascots, logos, or wordmarks.",
    `Only add photographic, family-friendly magical extras around them: ${spot.extras}`,
    "Match the original photo's lighting, time of day, and camera angle. The result must still look like a real photograph the family took, with the extras composited naturally.",
  ].join(" ");
}

export const RIDE_EXTRAS =
  "Warm golden-hour or twilight light through the windows, a soft cinematic glow on the seats, gentle lens flare, a few floating memory sparkles, and a painterly sky over the real road. Keep the real car, windows, landscape, and people unchanged.";

export function rideHeading(kmFromPark) {
  if (kmFromPark == null || Number.isNaN(kmFromPark)) return "On the road";
  if (kmFromPark < 1.5) return "At the gates";
  if (kmFromPark < 8) return "Leaving town";
  return "On the road";
}

export function formatRidePlace(geo) {
  if (!geo || typeof geo !== "object") return "";
  const admins = Array.isArray(geo.localityInfo?.administrative) ? geo.localityInfo.administrative : [];
  const cityAdmin = admins.find((item) => Number(item.adminLevel) === 8);
  const regionRaw = String(geo.principalSubdivisionCode || geo.principalSubdivision || "").trim();
  const region = regionRaw.replace(/^[A-Z]{2}-/, "");
  const locality = String(geo.locality || "").trim();
  const city = String(geo.city || "").trim();
  const bulky = (name) => Boolean(name) && (/[-/]/.test(name) || /coast|metro|area/i.test(name));
  const town =
    String(cityAdmin?.name || "").trim() ||
    locality ||
    (!bulky(city) && city) ||
    city.split(/[-/]/)[0].trim();
  if (town && region && !town.includes(region)) return `${town}, ${region}`;
  return town;
}

export function formatCoords(lat, lng) {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return "";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}

export function rideEnchantPrompt(place, crew) {
  const names = crew.length ? crew.join(", ") : "this family";
  const where = place || "the car on the road";
  return [
    `This is a real family photograph of ${names} taken during a car ride near ${where}.`,
    "Keep every person exactly as they appear, including faces, ages, bodies, hair, clothing, poses, and expressions.",
    "Do not replace, beautify, age-shift, cartoonify, or redraw any person. Do not add recognizable copyrighted mascots, logos, or wordmarks.",
    `Only add photographic, family-friendly extras around them: ${RIDE_EXTRAS}`,
    "Match the original photo's lighting, time of day, and camera angle. The result must still look like a real photograph the family took, with the extras composited naturally.",
  ].join(" ");
}
