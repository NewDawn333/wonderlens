export const PARK_CENTER = { lat: 33.8097, lng: -117.9190 };
export const PRACTICE_KM = 4;

export const PARKS = {
  dl: {
    id: "dl",
    name: "Disneyland Park",
    short: "Disneyland",
    hint: "Opening day, 1955",
  },
  dca: {
    id: "dca",
    name: "California Adventure",
    short: "DCA",
    hint: "1955 California — pier, highway, Hollywood",
  },
};

/** Real-world frames for the live park maps (OSM / satellite). */
export const PARK_MAPS = {
  dl: {
    center: { lat: 33.81255, lng: -117.91895 },
    zoom: 17,
    minZoom: 16,
    maxZoom: 20,
    bounds: [
      [33.80885, -117.92405],
      [33.81655, -117.91535],
    ],
  },
  dca: {
    center: { lat: 33.80645, lng: -117.91915 },
    zoom: 17,
    minZoom: 16,
    maxZoom: 20,
    bounds: [
      [33.80355, -117.92355],
      [33.80915, -117.91575],
    ],
  },
};

export function parkContains(parkId, point) {
  const frame = PARK_MAPS[parkId];
  if (!frame || point?.lat == null || point?.lng == null) return false;
  const [[south, west], [north, east]] = frame.bounds;
  return point.lat >= south && point.lat <= north && point.lng >= west && point.lng <= east;
}

export const SPOTS = [
  {
    id: "main-street",
    park: "dl",
    land: "Main Street",
    name: "Front Gate Glow",
    short: "Gates",
    lat: 33.8102,
    lng: -117.91896,
    radiusM: 120,
    x: 50,
    y: 88,
    color: "#f0c36a",
    icon: "lamp",
    stamp: "Arrival",
    mission: "Stand just inside the gates. This is the first frame of opening day.",
    clue: "The day starts where the flowers spell the park.",
    extras:
      "Turn the gates and street into brand-new 1955 opening-day Main Street: horse-drawn streetcar rails, globe lamps, fresh paint, floral beds, and a crowd in Sunday-best. Dress the family in mid-1950s park clothes. Kodachrome snapshot, mild grain, warm daylight.",
  },
  {
    id: "castle",
    park: "dl",
    land: "Fantasyland",
    name: "Castle Heart",
    short: "Castle",
    lat: 33.81281,
    lng: -117.91896,
    radiusM: 130,
    x: 50,
    y: 38,
    color: "#ffd27a",
    icon: "castle",
    stamp: "Castle Light",
    mission: "Shoot from the hub looking at the castle. Opening-day postcard.",
    clue: "The park's compass. Everyone photographs it. Make yours the 1955 one.",
    extras:
      "Render the castle and hub as they would on opening day 1955: new stonework, pennants, a modest crowd in period dress, Kodachrome sky. Restyle the family into 1950s postcard clothes. Soft film grain, not modern fireworks CGI.",
  },
  {
    id: "jungle",
    park: "dl",
    land: "Adventureland",
    name: "River Canopy",
    short: "Jungle",
    lat: 33.81141,
    lng: -117.92005,
    radiusM: 110,
    x: 32,
    y: 58,
    color: "#5bd38a",
    icon: "leaf",
    stamp: "Canopy",
    mission: "Find hanging vines, carved wood, or the river boats. 1955 explorers.",
    clue: "Listen for water, drums, and bad jokes about hippos.",
    extras:
      "Make Adventureland a brand-new 1955 tropical river landing: thatched roofs, wooden boats, dense jungle as a 1950s set. Dress the family in khaki, cotton, and explorer hats of the era. Warm Kodachrome greens, not modern LED lighting.",
  },
  {
    id: "temple",
    park: "dl",
    land: "Adventureland",
    name: "Temple Trail",
    short: "Temple",
    lat: 33.8103,
    lng: -117.92117,
    radiusM: 100,
    x: 24,
    y: 62,
    color: "#d4a25a",
    icon: "temple",
    stamp: "Relic",
    mission: "Use the weathered stone or bamboo as the backdrop. 1955 pulp adventure.",
    clue: "Boulders, torches, and a temple that wants your hat.",
    extras:
      "Turn the temple trail into a 1955 pulp-adventure ruin: torchlight, carved stone, bamboo, dust in the air. Period safari-casual clothes on the family. Ektachrome warmth, visible film grain, no modern themed plastic.",
  },
  {
    id: "pirates",
    park: "dl",
    land: "New Orleans Square",
    name: "Lantern Landing",
    short: "Pirates",
    lat: 33.8108,
    lng: -117.9215,
    radiusM: 100,
    x: 20,
    y: 54,
    color: "#e0b15a",
    icon: "ship",
    stamp: "Lantern",
    mission: "Brick, iron lace, or the waterfront. A 1955 river street.",
    clue: "Wrought iron, jazz in the air, and a bay that hides a ship.",
    extras:
      "Recast the waterfront as a newly opened 1955 river street: brick, iron lace, hanging oil lanterns, a tall-ship silhouette. Family in 1950s summer clothes. Warm tungsten film, slight haze, no modern signage.",
  },
  {
    id: "mansion",
    park: "dl",
    land: "New Orleans Square",
    name: "Moonlit Manor",
    short: "Manor",
    lat: 33.81149,
    lng: -117.92256,
    radiusM: 110,
    x: 14,
    y: 46,
    color: "#b8c4ff",
    icon: "gate",
    stamp: "Moonveil",
    mission: "Iron gates, the white manor, or the lawn. 1955 haunted-house snapshot.",
    clue: "A house on the hill that is dying to meet you.",
    extras:
      "Make the manor a 1955 park haunted house: iron gates, white facade, moonlit lawn, a little theatrical fog. Family in neat 1950s evening or Sunday clothes. Cool moonlight on warm film, whimsical not gory.",
  },
  {
    id: "bayou",
    park: "dl",
    land: "Bayou Country",
    name: "Bayou Fireflies",
    short: "Bayou",
    lat: 33.81205,
    lng: -117.92275,
    radiusM: 120,
    x: 16,
    y: 36,
    color: "#7be0a6",
    icon: "firefly",
    stamp: "Firefly",
    mission: "Trees, water, or the river plaza. A 1955 picnic by the woods.",
    clue: "Cypress, water, and a hundred little lights.",
    extras:
      "Turn the bayou into 1955 wooded river country: cypress, wooden docks, fireflies as real dusk insects. Family in casual 1950s picnic clothes. Honey-gold dusk on film, no modern water-ride plastic.",
  },
  {
    id: "thunder",
    park: "dl",
    land: "Frontierland",
    name: "Thunder Mesa",
    short: "Thunder",
    lat: 33.81267,
    lng: -117.92036,
    radiusM: 120,
    x: 28,
    y: 40,
    color: "#e39a4a",
    icon: "mesa",
    stamp: "Mesa",
    mission: "Red rock, mine trains, or the canyon. 1955 Frontierland.",
    clue: "A mountain that growls and a town that never struck it rich.",
    extras:
      "Render Frontierland as opening-day 1955: painted desert rock, a new mine train, dust in the sun. Family in western-tinged 1950s clothes — denim, cotton, maybe a cowboy hat. Warm Kodachrome, not digital HDR.",
  },
  {
    id: "spire",
    park: "dl",
    land: "Galaxy's Edge",
    name: "Black Spire Outpost",
    short: "Outpost",
    lat: 33.81475,
    lng: -117.9212,
    radiusM: 140,
    x: 22,
    y: 22,
    color: "#7ec8ff",
    icon: "spire",
    stamp: "Outpost",
    mission: "Rocks, ships, or the plaza. 1955 rocket-age canyon.",
    clue: "The future as a 1955 pulp magazine imagined it.",
    extras:
      "Replace later-era sci-fi with a 1955 rocket-age canyon expo: chrome rockets, painted spires, World's Fair pulp-future, no franchise armor. Dress the family in 1950s space-age casual. Film still looks like 1955 Kodachrome, not CGI.",
  },
  {
    id: "small-world",
    park: "dl",
    land: "Fantasyland",
    name: "Clockwork Canal",
    short: "Canal",
    lat: 33.81455,
    lng: -117.91785,
    radiusM: 110,
    x: 64,
    y: 18,
    color: "#8fd4ff",
    icon: "clock",
    stamp: "Clockwork",
    mission: "The facade, gold trim, or the canal. A 1955 storybook garden.",
    clue: "A little clock, a long song, a whole world in a boat.",
    extras:
      "Turn the canal into a 1955 storybook boat garden: painted facades, paper flags, a clock tower, toy-like boats. Family in bright 1950s day clothes. Cheerful Kodachrome, no modern overlay graphics.",
  },
  {
    id: "toontown",
    park: "dl",
    land: "Toontown",
    name: "Ink & Paint Square",
    short: "Toontown",
    lat: 33.81525,
    lng: -117.91855,
    radiusM: 120,
    x: 54,
    y: 10,
    color: "#ff8ba7",
    icon: "balloon",
    stamp: "Inkblot",
    mission: "Bright paint or the fountain. 1955 kiddieland.",
    clue: "Nothing is straight, and that is the point.",
    extras:
      "Recast the square as 1955 kiddieland: candy-colored cottages, a fountain, carnival props, no copyrighted cartoon faces. Family in playful 1950s kids' clothes. Slightly faded snapshot, photoreal people.",
  },
  {
    id: "matterhorn",
    park: "dl",
    land: "Fantasyland",
    name: "Matterhorn Meadow",
    short: "Matterhorn",
    lat: 33.81307,
    lng: -117.91785,
    radiusM: 120,
    x: 66,
    y: 32,
    color: "#c5d4e8",
    icon: "peak",
    stamp: "Summit",
    mission: "Get the mountain in the shot. A 1950s alpine postcard.",
    clue: "The park's only alp. It honks. It snows. It watches.",
    extras:
      "Make the peak a 1950s painted alp over the park: snow, bobsled-era mountain, Kodachrome sky. Family in 1950s sweaters or day clothes. Light film grain, no modern CGI snow overlays.",
  },
  {
    id: "tomorrow",
    park: "dl",
    land: "Tomorrowland",
    name: "Tomorrow Plaza",
    short: "Tomorrow",
    lat: 33.81185,
    lng: -117.91772,
    radiusM: 110,
    x: 70,
    y: 52,
    color: "#5ad0d0",
    icon: "orbit",
    stamp: "Orbit",
    mission: "Rockets or the spinning machine. The future, as 1955 saw it.",
    clue: "The future that still looks like 1955, and that is the point.",
    extras:
      "Rebuild Tomorrowland as 1955 World of Tomorrow: a moon rocket, pastel concrete, atomic-age signs, no later white-mountain coaster. Family in 1950s space-age casual. Color film of the era, not neon nightclub lighting.",
  },
  {
    id: "space",
    park: "dl",
    land: "Tomorrowland",
    name: "Star Mountain",
    short: "Space",
    lat: 33.81097,
    lng: -117.9175,
    radiusM: 110,
    x: 80,
    y: 48,
    color: "#8aa7ff",
    icon: "star",
    stamp: "Starfield",
    mission: "The courtyard or a rocket. 1955 moon-shot photo.",
    clue: "The gleaming rocket that launches you through the dark.",
    extras:
      "Replace later space-mountain architecture with a 1955 moon-shot courtyard: a silver rocket, concrete pads, optimistic crowd. Family dressed for a 1950s science-fair outing. Night or dusk on 1950s color film, grainy stars, not digital nebula.",
  },
  {
    id: "buena",
    park: "dca",
    land: "Buena Vista Street",
    name: "Red Car Welcome",
    short: "Buena Vista",
    lat: 33.8084,
    lng: -117.91895,
    radiusM: 120,
    x: 62,
    y: 18,
    color: "#f0c36a",
    icon: "trolley",
    stamp: "Red Car",
    mission: "The boulevard or the trolley. 1955 Hollywood arrival.",
    clue: "Southern California, opening week, better snacks.",
    extras:
      "Turn the entrance street into 1955 Los Angeles: red streetcar, palms, gold lettering, sunshine. Family in 1950s California day clothes. Warm Kodachrome, no modern cars or phones.",
  },
  {
    id: "carthay",
    park: "dca",
    land: "Buena Vista Street",
    name: "Carthay Circle",
    short: "Carthay",
    lat: 33.8076,
    lng: -117.91918,
    radiusM: 100,
    x: 50,
    y: 28,
    color: "#e8c27a",
    icon: "theater",
    stamp: "Circle",
    mission: "The round plaza and the grand theater. 1955 premiere portrait.",
    clue: "The park's living room. Gold, palms, and a fountain.",
    extras:
      "Make the circle a 1955 movie-palace plaza: fountain, climbing roses, a grand theater, evening tungsten. Family in dressy 1950s outing clothes. Soft film bokeh, premiere-night snapshot.",
  },
  {
    id: "avengers",
    park: "dca",
    land: "Avengers Campus",
    name: "Campus Yard",
    short: "Campus",
    lat: 33.80662,
    lng: -117.91715,
    radiusM: 130,
    x: 78,
    y: 36,
    color: "#ff6b6b",
    icon: "shield",
    stamp: "Recruit",
    mission: "The industrial yard. A 1955 science-and-aircraft expo.",
    clue: "A campus of hangars and big ideas, opening day.",
    extras:
      "Recast the yard as a 1955 aircraft-and-science exposition: hangars, riveted metal, World's Fair exhibits, no superhero costumes or logos. Family in 1950s day clothes, maybe a paper expo badge. Daylight Kodachrome.",
  },
  {
    id: "cars",
    park: "dca",
    land: "Cars Land",
    name: "Route 66 Neon",
    short: "Route 66",
    lat: 33.8055,
    lng: -117.9185,
    radiusM: 130,
    x: 52,
    y: 68,
    color: "#ff9a4a",
    icon: "neon",
    stamp: "Neon",
    mission: "Neon motel or desert main street. Real 1955 Route 66.",
    clue: "A highway town of taillights and desert sky.",
    extras:
      "Turn the street into a real 1955 Route 66 town: neon motel, chrome bumpers, desert mountains, period cars. Family in road-trip 1950s clothes. Sunset on Kodachrome, dust in the light, no later cartoon-car styling.",
  },
  {
    id: "grizzly",
    park: "dca",
    land: "Grizzly Peak",
    name: "Grizzly Peak",
    short: "Peak",
    lat: 33.8071,
    lng: -117.92065,
    radiusM: 120,
    x: 22,
    y: 40,
    color: "#7dcea0",
    icon: "bear",
    stamp: "Trail",
    mission: "Pines, the peak, or the rapids. A 1955 park vacation.",
    clue: "California wilderness, with a gift shop.",
    extras:
      "Make the peak a 1955 national-park outing: tall pines, a stone-and-timber plaza, mountain light. Family in 1950s camping or day-hike clothes. Golden-hour film, not modern GoPro contrast.",
  },
  {
    id: "pier",
    park: "dca",
    land: "Pixar Pier",
    name: "Boardwalk Brights",
    short: "Pier",
    lat: 33.80475,
    lng: -117.9215,
    radiusM: 120,
    x: 28,
    y: 78,
    color: "#ff7eb6",
    icon: "wheel",
    stamp: "Boardwalk",
    mission: "Ferris wheel, midway, or the boards. 1955 Pacific pier.",
    clue: "A pier that borrowed every color in the crayon box.",
    extras:
      "Rebuild the pier as a 1955 Pacific boardwalk: wooden planks, a ferris wheel, midway bulbs, ocean air. Family in 1950s carnival clothes. Night or dusk tungsten on grainy color film, not LED pixels.",
  },
  {
    id: "bay",
    park: "dca",
    land: "Paradise Gardens",
    name: "Paradise Bay",
    short: "Bay",
    lat: 33.80537,
    lng: -117.92184,
    radiusM: 120,
    x: 34,
    y: 64,
    color: "#7ecbff",
    icon: "wave",
    stamp: "Tide",
    mission: "The lagoon, the bridge, or the gardens. 1955 evening by the water.",
    clue: "A bowl of water that turns gold after dark.",
    extras:
      "Turn the bay into a 1955 garden lagoon: a wooden bridge, lawn, still water, string lights not lasers. Family in 1950s evening clothes. Soft Ektachrome dusk, reflections, no modern fountain show.",
  },
  {
    id: "hollywood",
    park: "dca",
    land: "Hollywood Land",
    name: "Backlot Glow",
    short: "Hollywood",
    lat: 33.8079,
    lng: -117.91718,
    radiusM: 110,
    x: 76,
    y: 22,
    color: "#e8b86d",
    icon: "clap",
    stamp: "Backlot",
    mission: "Soundstage streets or the plaza. 1955 studio snapshot.",
    clue: "The part of the park that knows it is on camera.",
    extras:
      "Make the backlot a 1955 Hollywood studio street: soundstage doors, posters in period type, a tall drop-tower as a 1950s movie set facade. Family in premiere-night 1950s clothes. Dramatic tungsten film lighting, no modern LED.",
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

/** Imagine never sees modern land IP; UI can still name the real parks. */
export const LAND_ERA = {
  "Main Street": "opening-day Main Street, 1955",
  Fantasyland: "a 1955 storybook courtyard",
  Adventureland: "a 1955 tropical river landing",
  "New Orleans Square": "a 1955 riverfront street",
  "Bayou Country": "1955 wooded river country",
  Frontierland: "opening-day 1955 frontier town",
  "Galaxy's Edge": "a 1955 rocket-age World's Fair canyon",
  Toontown: "a 1955 kiddieland square",
  Tomorrowland: "the 1955 World of Tomorrow",
  "Buena Vista Street": "a 1955 Los Angeles boulevard",
  "Avengers Campus": "a 1955 aircraft-and-science exposition",
  "Cars Land": "a real 1955 Route 66 town",
  "Grizzly Peak": "a 1955 California mountain park",
  "Pixar Pier": "a 1955 Pacific boardwalk",
  "Paradise Gardens": "a 1955 garden lagoon",
  "Hollywood Land": "a 1955 Hollywood studio street",
};

export const TIME_MACHINE_RULES = [
  "Send the entire scene back to July 17, 1955, opening day of a brand-new American storybook theme park in Southern California.",
  "Keep the same recognizable people: the same face structure, the same kids and adults as the same individuals, the same poses, expressions, and head count.",
  "Do restyle every person to fit mid-1950s American park-day dress: clothing, hair, hats, glasses, shoes, and accessories of 1955.",
  "Remove phones, smartwatches, athleisure, modern logos, LED glow, later architecture, and later vehicles.",
  "Change the surroundings to period-correct 1955: architecture, cars, crowds, signs, and materials of that year. Recast later lands as 1955 analogues — rocket-age World's Fair, kiddieland, California highway and pier, aircraft expo — never later franchises.",
  "Change the photograph itself: Kodachrome or Ektachrome color film, visible grain, slightly soft focus, warm daylight or tungsten, photoreal, not modern HDR, not cartoon, not CGI.",
  "Do not replace people with different people. Do not cartoonify anyone or turn anyone into a mascot.",
  "Do not add recognizable copyrighted mascots, character portraits, logos, or wordmarks.",
].join(" ");

export function eraWhere(spot) {
  const land = LAND_ERA[spot?.land] || "a brand-new 1955 American storybook park";
  const label = spot?.short || spot?.name || "this landmark";
  return `the ${label} landmark in ${land}`;
}

export function timeMachinePrompt({ names, where, extras }) {
  const extra = String(extras || "").trim();
  return [
    `This is a real family photograph of ${names} taken at ${where}.`,
    TIME_MACHINE_RULES,
    extra ? `Period extras for this frame: ${extra}` : "",
    "Match the original camera angle and grouping. The result should look like a 1955 souvenir photograph of this same family, not a modern filter.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function enchantPrompt(spot, crew) {
  const names = crew.length ? crew.join(", ") : "this family";
  return timeMachinePrompt({
    names,
    where: eraWhere(spot),
    extras: spot?.extras,
  });
}

export const RIDE_EXTRAS =
  "July 17, 1955 opening-day light on a family car trip: restyle every person into mid-1950s road clothes, keep the same faces, Kodachrome grain, period cars and roadside, photoreal film not modern HDR.";

/** Simple chips in the app; extras flavor the 1955 time-machine wrap. No official mascots or wordmarks. */
export const RIDE_PRESETS = [
  {
    id: "opening-day",
    label: "Opening day",
    blurb: "Packed 1955 park-day light",
    extras:
      "July 17, 1955 opening day: bunting, fresh paint, a packed Main Street crowd in Sunday best. Restyle every person into 1955 park clothes. Keep the same faces. Photoreal Kodachrome, mild grain. No mascots, no logos, no text.",
  },
  {
    id: "kodachrome",
    label: "Kodachrome",
    blurb: "Saturated 1955 color film",
    extras:
      "Saturated 1955 Kodachrome: reds and greens pop, slight cyan sky, warm skin, visible film grain. Restyle clothes and hair to mid-1950s. Keep the same faces. Photoreal, not digital HDR. No mascots, no logos, no text.",
  },
  {
    id: "newsreel",
    label: "Newsreel",
    blurb: "Black-and-white 1955 still",
    extras:
      "Black-and-white 1955 newsreel still: high contrast, slight motion blur, silver grain. Restyle every person into 1955 street clothes. Keep the same faces. Photoreal documentary still, not illustrated. No mascots, no logos, no captions.",
  },
  {
    id: "sunday-best",
    label: "Sunday best",
    blurb: "Church-to-park outfits",
    extras:
      "Church-to-park Sunday best: men in ties, women in full skirts and gloves, children in pressed outfits. Keep the same faces. Photoreal 1955 color film. No mascots, no logos, no text.",
  },
  {
    id: "roadster",
    label: "Roadster",
    blurb: "Chrome bumpers and whitewalls",
    extras:
      "Chrome bumpers, two-tone 1955 automobiles, whitewalls, a real roadside. Restyle clothes to 1955 driving-day outfits. Keep the same faces. Photoreal Kodachrome. No mascots, no logos, no text.",
  },
  {
    id: "postcard",
    label: "Postcard",
    blurb: "Hand-tinted souvenir card",
    extras:
      "Hand-tinted linen postcard: slightly oversaturated, a white border feel, 1955 souvenir look. Restyle every person for the era. Keep the same faces. Photoreal printed postcard, not a cartoon. No mascots, no logos, no captions.",
  },
  {
    id: "snapshot",
    label: "Snapshot",
    blurb: "Family Brownie flash",
    extras:
      "Family Brownie snapshot: on-camera flash, square-crop feel, slight blur, amateur 1955 film. Restyle clothes. Keep the same faces. Photoreal snapshot, not a phone HDR shot. No mascots, no logos, no text.",
  },
  {
    id: "home-movie",
    label: "Home movie",
    blurb: "Paused 8mm frame",
    extras:
      "Paused 8mm home movie: warm, a little soft, a light leak, 1955 color. Restyle hair and dress. Keep the same faces. Photoreal film frame, not video CGI. No mascots, no logos, no text.",
  },
  {
    id: "boardwalk-55",
    label: "Boardwalk '55",
    blurb: "Pacific pier, 1955",
    extras:
      "1955 Pacific boardwalk: neon script, cotton candy, wooden pier, ocean air. Restyle to summer 1955 beach-town clothes. Keep the same faces. Photoreal Ektachrome. No mascots, no logos, no text.",
  },
  {
    id: "highway-66",
    label: "Highway 66",
    blurb: "Route 66 road trip",
    extras:
      "1955 Route 66: gas pumps, desert light, chrome, dust in the sun. Restyle to road-trip clothes of the year. Keep the same faces. Photoreal Kodachrome. No mascots, no logos, no text.",
  },
  {
    id: "rocket-age",
    label: "Rocket age",
    blurb: "World's Fair fins and chrome",
    extras:
      "1955 rocket-age World's Fair: fins, chrome, atom motifs, optimistic crowd. Restyle to futurist 1955 visitor clothes. Keep the same faces. Photoreal color film of the year, not sci-fi CGI. No mascots, no logos, no text.",
  },
  {
    id: "porch-light",
    label: "Porch light",
    blurb: "Warm 1955 evening film",
    extras:
      "Warm 1955 evening porch light, fireflies as real dusk insects, moths at the lamp. Restyle to 1955 evening dress. Keep the same faces. Photoreal night film, tungsten, grain. No mascots, no logos, no text.",
  },
];

export function gpsMovedEnough(prev, next, meters = 18) {
  if (!prev || !next || prev.lat == null || next.lat == null) return true;
  return haversineM(prev, next) >= meters;
}

export function ridePresetById(id) {
  return RIDE_PRESETS.find((item) => item.id === id) || null;
}

export function extrasForRideLook(look) {
  if (look?.style === "custom") {
    return String(look.polished || look.idea || "").trim() || RIDE_EXTRAS;
  }
  return ridePresetById(look?.style)?.extras || RIDE_EXTRAS;
}

export function polishRideIdeaPrompt(idea) {
  return `A parent typed this short idea for a family car-ride photo sent back to 1955: ${JSON.stringify(String(idea || "").trim())}

Rewrite it as ONE detailed Imagine extras paragraph (80-160 words) used to edit a real photograph into opening day, July 17, 1955.
Rules:
- Keep the same recognizable faces, ages as the same individuals, poses, expressions, and head count
- Do restyle clothing, hair, hats, glasses, and shoes to authentic mid-1950s American dress
- Change surroundings, cars, and crowds to 1955; remove phones, LEDs, athleisure, and later buildings
- Change the photo to Kodachrome/Ektachrome: grain, slightly soft, warm, photoreal, not modern HDR
- No copyrighted character names, official mascots, logos, or wordmarks
- Return ONLY the extras paragraph, no quotes, labels, or markdown`;
}

export function lineBuddyPrompt({ kind, land, crew, wait } = {}) {
  const place = land || "the park";
  const era = LAND_ERA[place] || "a brand-new 1955 American storybook park";
  const who = crew || "a family";
  const beat = kind || "story";
  return `You are Line Buddy, a warm, funny opening-day companion from July 17, 1955, talking to kids and parents waiting in line at ${era}. The crew is: ${who}.
Give one ${beat} now. Rules:
- Kid-safe, kind, and specific to this place as it felt in 1955
- 80-140 words max
- No copyrighted character names, songs, or official mascots
- No brand logos
- Make it playable or tellable out loud right now
- End with one tiny follow-up the kids can answer`;
}

export function cleanPolishedExtras(text) {
  let out = String(text || "").trim();
  out = out.replace(/^```(?:\w+)?\s*/i, "").replace(/\s*```$/i, "").trim();
  out = out.replace(/^["“]+|["”]+$/g, "").trim();
  return out;
}

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

export function rideEnchantPrompt(place, crew, extras = RIDE_EXTRAS) {
  const names = crew.length ? crew.join(", ") : "this family";
  const where = place ? `a car ride near ${place}` : "a car ride on the road";
  const extra = String(extras || RIDE_EXTRAS).trim() || RIDE_EXTRAS;
  return timeMachinePrompt({ names, where, extras: extra });
}
