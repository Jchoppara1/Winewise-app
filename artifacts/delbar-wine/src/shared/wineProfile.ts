import type { Wine } from "./schema";

export type BodyLevel = "light" | "medium" | "full";
export type AcidityLevel = "low" | "medium" | "high";
export type TanninLevel = "none" | "low" | "medium" | "high";
export type SweetnessLevel = "dry" | "off-dry" | "sweet";
export type OakLevel = "none" | "light" | "medium" | "heavy";

export interface WineProfile {
  color: string;
  body: BodyLevel;
  acidity: AcidityLevel;
  tannin: TanninLevel;
  sweetness: SweetnessLevel;
  oak: OakLevel;
  flavorNotes: string[];
  regionCues: string[];
  grapes: string[];
}

export interface WineDescription {
  headline: string;
  aromas: [string, string, string];
  palate: [string, string, string];
  structure: {
    body: BodyLevel;
    acidity: AcidityLevel;
    tannin: TanninLevel;
    oak: OakLevel;
    sweetness: SweetnessLevel;
  };
  bestPairings: string[];
  servingSuggestions: string[];
}

const grapeProfiles: Record<string, Partial<WineProfile>> = {
  "cabernet sauvignon": { body: "full", acidity: "medium", tannin: "high", oak: "medium", flavorNotes: ["blackcurrant", "cedar", "dark cherry"] },
  "merlot": { body: "medium", acidity: "medium", tannin: "medium", oak: "medium", flavorNotes: ["plum", "black cherry", "chocolate"] },
  "pinot noir": { body: "light", acidity: "high", tannin: "low", oak: "light", flavorNotes: ["red cherry", "raspberry", "earth"] },
  "syrah": { body: "full", acidity: "medium", tannin: "high", oak: "medium", flavorNotes: ["blackberry", "pepper", "smoke"] },
  "shiraz": { body: "full", acidity: "medium", tannin: "high", oak: "heavy", flavorNotes: ["blackberry", "pepper", "chocolate"] },
  "malbec": { body: "full", acidity: "medium", tannin: "medium", oak: "medium", flavorNotes: ["dark plum", "violet", "cocoa"] },
  "tempranillo": { body: "medium", acidity: "medium", tannin: "medium", oak: "medium", flavorNotes: ["cherry", "leather", "vanilla"] },
  "grenache": { body: "medium", acidity: "medium", tannin: "low", oak: "light", flavorNotes: ["strawberry", "white pepper", "herbs"] },
  "cabernet franc": { body: "medium", acidity: "high", tannin: "medium", oak: "light", flavorNotes: ["red currant", "herbs", "green pepper"] },
  "monastrell": { body: "full", acidity: "medium", tannin: "high", oak: "medium", flavorNotes: ["dark fruit", "earth", "spice"] },
  "mourvedre": { body: "full", acidity: "medium", tannin: "high", oak: "medium", flavorNotes: ["dark fruit", "earth", "spice"] },
  "zweigelt": { body: "light", acidity: "medium", tannin: "low", oak: "none", flavorNotes: ["sour cherry", "red berry", "fresh acidity"] },
  "agiorgitiko": { body: "medium", acidity: "medium", tannin: "medium", oak: "light", flavorNotes: ["cherry", "plum", "spice"] },
  "zinfandel": { body: "full", acidity: "medium", tannin: "medium", oak: "medium", flavorNotes: ["blackberry", "jam", "pepper"] },
  "gamay": { body: "light", acidity: "high", tannin: "low", oak: "none", flavorNotes: ["raspberry", "cranberry", "banana"] },
  "chardonnay": { body: "medium", acidity: "medium", tannin: "none", oak: "medium", flavorNotes: ["apple", "pear", "butter"] },
  "sauvignon blanc": { body: "light", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["citrus", "grass", "gooseberry"] },
  "riesling": { body: "light", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["lime", "green apple", "petrol"] },
  "pinot grigio": { body: "light", acidity: "medium", tannin: "none", oak: "none", flavorNotes: ["lemon", "pear", "mineral"] },
  "albarino": { body: "light", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["peach", "citrus", "saline"] },
  "albariño": { body: "light", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["peach", "citrus", "saline"] },
  "gewurztraminer": { body: "medium", acidity: "low", tannin: "none", oak: "none", flavorNotes: ["lychee", "rose", "ginger"] },
  "gewürztraminer": { body: "medium", acidity: "low", tannin: "none", oak: "none", flavorNotes: ["lychee", "rose", "ginger"] },
  "viognier": { body: "full", acidity: "low", tannin: "none", oak: "light", flavorNotes: ["apricot", "peach", "honeysuckle"] },
  "moschofilero": { body: "light", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["rose petal", "citrus", "mineral"] },
  "assyrtiko": { body: "medium", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["lemon", "mineral", "saline"] },
  "insolia": { body: "light", acidity: "medium", tannin: "none", oak: "none", flavorNotes: ["white peach", "citrus", "almond"] },
  "glera": { body: "light", acidity: "medium", tannin: "none", oak: "none", flavorNotes: ["pear", "apple", "white flowers"] },
  "prosecco": { body: "light", acidity: "medium", tannin: "none", oak: "none", flavorNotes: ["pear", "apple", "white flowers"] },
  "cava": { body: "light", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["lemon", "apple", "toast"] },
  "champagne": { body: "medium", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["brioche", "citrus", "mineral"] },
  "cinsault": { body: "light", acidity: "medium", tannin: "low", oak: "none", flavorNotes: ["strawberry", "cherry", "herbs"] },
  "sancerre": { body: "light", acidity: "high", tannin: "none", oak: "none", flavorNotes: ["lemon", "flinty mineral", "white flowers"] },
};

const regionDefaults: Record<string, Partial<WineProfile>> = {
  "napa": { body: "full", oak: "medium" },
  "sonoma": { body: "medium", oak: "light" },
  "bordeaux": { body: "full", tannin: "high", oak: "medium" },
  "burgundy": { body: "light", acidity: "high", oak: "light" },
  "champagne": { acidity: "high", body: "light" },
  "tuscany": { body: "medium", acidity: "high", tannin: "medium" },
  "rioja": { body: "medium", oak: "medium", tannin: "medium" },
  "rhone": { body: "full", tannin: "medium" },
  "loire": { acidity: "high", body: "light" },
  "alsace": { acidity: "high", body: "light" },
  "bekaa": { body: "medium", tannin: "medium" },
  "paso robles": { body: "full", oak: "medium" },
  "willamette": { body: "light", acidity: "high" },
  "provence": { body: "light", acidity: "medium" },
  "greece": { acidity: "high" },
  "ribera del duero": { body: "medium", oak: "medium", tannin: "medium" },
};

function extractGrapes(varietal: string): string[] {
  return varietal.split(/[,&\/]/).map(g => g.trim()).filter(Boolean);
}

function findGrapeProfile(grape: string): Partial<WineProfile> | undefined {
  const lower = grape.toLowerCase().trim();
  for (const [key, profile] of Object.entries(grapeProfiles)) {
    if (lower.includes(key) || key.includes(lower)) {
      return profile;
    }
  }
  return undefined;
}

function extractFlavorNotesFromDescription(description: string): string[] {
  const notes: string[] = [];
  const flavorKeywords = [
    "blackberry", "blackcurrant", "blueberry", "cherry", "raspberry", "strawberry",
    "cranberry", "plum", "fig", "date", "currant", "mulberry", "cassis",
    "apple", "pear", "peach", "apricot", "lemon", "lime", "citrus", "orange",
    "grapefruit", "mango", "pineapple", "tropical", "melon", "papaya",
    "vanilla", "oak", "cedar", "tobacco", "leather", "smoke", "toast",
    "chocolate", "cocoa", "mocha", "coffee", "caramel",
    "pepper", "spice", "cinnamon", "clove", "nutmeg", "licorice",
    "floral", "rose", "violet", "lavender", "honeysuckle", "jasmine",
    "mineral", "flinty", "chalky", "saline", "earthy", "earth",
    "herbs", "herbal", "thyme", "rosemary", "basil", "mint",
    "butter", "cream", "brioche", "biscuit", "almond",
    "honey", "acacia", "beeswax",
  ];

  const lower = description.toLowerCase();
  for (const keyword of flavorKeywords) {
    if (lower.includes(keyword)) {
      notes.push(keyword);
    }
  }
  return notes.slice(0, 6);
}

function inferRegionCues(description: string, name: string): string[] {
  const combined = `${name} ${description}`.toLowerCase();
  const cues: string[] = [];
  const regionPatterns: [string, string][] = [
    ["napa", "Napa Valley"],
    ["sonoma", "Sonoma"],
    ["paso robles", "Paso Robles"],
    ["willamette", "Willamette Valley"],
    ["bordeaux", "Bordeaux"],
    ["burgundy", "Burgundy"],
    ["champagne", "Champagne"],
    ["tuscany", "Tuscany"],
    ["piedmont", "Piedmont"],
    ["rioja", "Rioja"],
    ["ribera del duero", "Ribera del Duero"],
    ["rhone", "Rhone"],
    ["loire", "Loire"],
    ["sancerre", "Sancerre"],
    ["alsace", "Alsace"],
    ["provence", "Provence"],
    ["bekaa", "Bekaa Valley"],
    ["greece", "Greece"],
    ["nemea", "Nemea"],
    ["sicily", "Sicily"],
    ["veneto", "Veneto"],
    ["abruzzo", "Abruzzo"],
    ["california", "California"],
    ["oregon", "Oregon"],
    ["australia", "Australia"],
    ["spain", "Spain"],
    ["italy", "Italy"],
    ["france", "France"],
    ["lebanon", "Lebanon"],
    ["morocco", "Morocco"],
    ["germany", "Germany"],
    ["austria", "Austria"],
  ];

  for (const [pattern, label] of regionPatterns) {
    if (combined.includes(pattern)) {
      cues.push(label);
    }
  }
  return cues.slice(0, 3);
}

export function inferWineProfile(wine: { wineType: string; varietal: string; description?: string | null; name?: string; priceCents?: number }): WineProfile {
  const grapes = extractGrapes(wine.varietal);
  const grapeNames = grapes.map(g => g.toLowerCase());
  const description = wine.description || "";
  const name = wine.name || "";

  let profile: WineProfile = {
    color: wine.wineType.toLowerCase(),
    body: "medium",
    acidity: "medium",
    tannin: wine.wineType === "red" ? "medium" : "none",
    sweetness: "dry",
    oak: "none",
    flavorNotes: [],
    regionCues: inferRegionCues(description, name),
    grapes: grapes,
  };

  for (const grape of grapeNames) {
    const gp = findGrapeProfile(grape);
    if (gp) {
      if (gp.body) profile.body = gp.body;
      if (gp.acidity) profile.acidity = gp.acidity;
      if (gp.tannin) profile.tannin = gp.tannin;
      if (gp.oak) profile.oak = gp.oak;
      if (gp.flavorNotes && profile.flavorNotes.length === 0) {
        profile.flavorNotes = [...gp.flavorNotes];
      }
      break;
    }
  }

  for (const regionCue of profile.regionCues) {
    const lower = regionCue.toLowerCase();
    for (const [key, rd] of Object.entries(regionDefaults)) {
      if (lower.includes(key)) {
        if (rd.body && !grapeNames.some(g => findGrapeProfile(g)?.body)) profile.body = rd.body;
        if (rd.oak && rd.oak !== "none") profile.oak = rd.oak;
        break;
      }
    }
  }

  if (description) {
    const descNotes = extractFlavorNotesFromDescription(description);
    if (descNotes.length > 0) {
      const combined = new Set([...profile.flavorNotes, ...descNotes]);
      profile.flavorNotes = Array.from(combined).slice(0, 6);
    }

    const lower = description.toLowerCase();
    if (lower.includes("rich") || lower.includes("full") || lower.includes("bold") || lower.includes("concentrated") || lower.includes("powerful")) {
      profile.body = "full";
    }
    if (lower.includes("light") || lower.includes("delicate") || lower.includes("elegant") || lower.includes("crisp")) {
      if (!lower.includes("full")) profile.body = "light";
    }
    if (lower.includes("crisp") || lower.includes("bright") || lower.includes("zesty") || lower.includes("refreshing acidity") || lower.includes("lively")) {
      profile.acidity = "high";
    }
    if (lower.includes("creamy") || lower.includes("round") || lower.includes("soft")) {
      if (profile.acidity === "high") profile.acidity = "medium";
    }
    if (lower.includes("oaky") || lower.includes("toasted oak") || lower.includes("heavy oak") || lower.includes("vanilla") || lower.includes("cedar")) {
      profile.oak = profile.oak === "none" ? "light" : "medium";
    }
    if (lower.includes("off-dry") || lower.includes("semi-sweet")) {
      profile.sweetness = "off-dry";
    }
    if (lower.includes("sweet") && !lower.includes("off-dry") && !lower.includes("semi")) {
      profile.sweetness = "sweet";
    }
    if (lower.includes("firm tannin") || lower.includes("structured") || lower.includes("firm structure") || lower.includes("grippy")) {
      profile.tannin = "high";
    }
    if (lower.includes("soft tannin") || lower.includes("silky") || lower.includes("smooth") || lower.includes("polished")) {
      if (profile.tannin === "high") profile.tannin = "medium";
    }
  }

  if (wine.wineType === "sparkling") {
    profile.tannin = "none";
    if (profile.acidity === "low") profile.acidity = "medium";
  }
  if (wine.wineType === "rose") {
    profile.tannin = profile.tannin === "high" ? "low" : profile.tannin === "medium" ? "low" : "none";
  }
  if (wine.wineType === "white" || wine.wineType === "orange") {
    profile.tannin = wine.wineType === "orange" ? (profile.tannin === "none" ? "low" : profile.tannin) : "none";
  }

  if (profile.flavorNotes.length === 0) {
    switch (wine.wineType) {
      case "red": profile.flavorNotes = ["red fruit", "spice", "earth"]; break;
      case "white": profile.flavorNotes = ["citrus", "stone fruit", "mineral"]; break;
      case "rose": profile.flavorNotes = ["strawberry", "citrus", "herbs"]; break;
      case "sparkling": profile.flavorNotes = ["citrus", "toast", "apple"]; break;
      case "orange": profile.flavorNotes = ["dried fruit", "honey", "nuts"]; break;
      case "fortified": profile.flavorNotes = ["dried fruit", "caramel", "nuts"]; break;
      case "dessert": profile.flavorNotes = ["honey", "stone fruit", "floral"]; break;
      case "nonAlcoholic": profile.flavorNotes = ["fruit", "herbs", "citrus"]; break;
    }
  }

  return profile;
}

export function computePercentilePriceTiers(prices: number[]): Map<number, string> {
  if (prices.length === 0) return new Map();
  
  const sorted = [...prices].sort((a, b) => a - b);
  const p25 = sorted[Math.floor(sorted.length * 0.25)];
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p75 = sorted[Math.floor(sorted.length * 0.75)];

  const tierMap = new Map<number, string>();
  for (const price of prices) {
    if (price <= p25) tierMap.set(price, "$");
    else if (price <= p50) tierMap.set(price, "$$");
    else if (price <= p75) tierMap.set(price, "$$$");
    else tierMap.set(price, "$$$$");
  }
  return tierMap;
}

export function getPriceTierFromPercentile(price: number, allPrices: number[]): string {
  if (allPrices.length === 0) return "$$";
  const sorted = [...allPrices].sort((a, b) => a - b);
  const p25 = sorted[Math.floor(sorted.length * 0.25)];
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p75 = sorted[Math.floor(sorted.length * 0.75)];
  if (price <= p25) return "$";
  if (price <= p50) return "$$";
  if (price <= p75) return "$$$";
  return "$$$$";
}

const bodyDescriptors: Record<BodyLevel, string[]> = {
  light: ["light-bodied", "delicate", "ethereal"],
  medium: ["medium-bodied", "balanced", "versatile"],
  full: ["full-bodied", "rich", "powerful"],
};

const acidDescriptors: Record<AcidityLevel, string[]> = {
  low: ["soft", "round"],
  medium: ["balanced", "fresh"],
  high: ["crisp", "vibrant", "zesty"],
};

const tanninDescriptors: Record<TanninLevel, string[]> = {
  none: [],
  low: ["silky", "gentle"],
  medium: ["structured", "firm"],
  high: ["bold", "grippy", "powerful"],
};

export function buildWineDescription(
  wine: { name: string; wineType: string; varietal: string; description?: string | null },
  profile: WineProfile
): WineDescription {
  const bodyWord = bodyDescriptors[profile.body][0];
  const acidWord = acidDescriptors[profile.acidity][0];
  const notes = profile.flavorNotes.slice(0, 3);
  const notesStr = notes.length > 0 ? notes.join(", ") : "classic flavors";

  const grapeDisplay = profile.grapes.length > 0 ? profile.grapes[0] : wine.varietal;
  const regionDisplay = profile.regionCues.length > 0 ? profile.regionCues[0] : "";

  const headline = regionDisplay
    ? `${bodyWord.charAt(0).toUpperCase() + bodyWord.slice(1)} ${grapeDisplay} from ${regionDisplay}`
    : `${bodyWord.charAt(0).toUpperCase() + bodyWord.slice(1)} and ${acidWord} ${grapeDisplay}`;

  const trimmedHeadline = headline.length > 80 ? headline.substring(0, 77) + "..." : headline;

  const aromas: [string, string, string] = [
    notes[0] ? `${notes[0].charAt(0).toUpperCase() + notes[0].slice(1)} on the nose` : "Inviting aromatics",
    notes[1] ? `Hints of ${notes[1]}` : "Subtle complexity",
    profile.oak !== "none" ? `${profile.oak === "heavy" ? "Rich" : "Touch of"} oak influence` : (notes[2] ? `Notes of ${notes[2]}` : "Clean and fresh"),
  ];

  const palateEntry = acidWord.charAt(0).toUpperCase() + acidWord.slice(1) + " entry";
  const palateBody = `${bodyWord.charAt(0).toUpperCase() + bodyWord.slice(1)} weight on the palate`;
  let palateTannin: string;
  if (profile.tannin === "high") palateTannin = "Firm tannins provide structure";
  else if (profile.tannin === "medium") palateTannin = "Well-integrated tannins";
  else if (profile.tannin === "low") palateTannin = "Silky smooth tannins";
  else palateTannin = "Clean and refreshing finish";

  const palate: [string, string, string] = [palateEntry, palateBody, palateTannin];

  const pairingTags = derivePairingTagsFromProfile(profile, wine.wineType);

  const servingSuggestions: string[] = [];
  if (["sparkling", "white", "rose", "orange"].includes(wine.wineType)) {
    servingSuggestions.push("Serve chilled (45-50°F)");
  } else if (wine.wineType === "fortified" || wine.wineType === "dessert") {
    servingSuggestions.push("Serve slightly chilled (55-60°F)");
  } else if (profile.body === "light") {
    servingSuggestions.push("Serve slightly chilled (55-60°F)");
  } else {
    servingSuggestions.push("Serve at room temperature (60-65°F)");
  }

  if (wine.wineType === "sparkling") servingSuggestions.push("Flute or tulip glass");
  else if (["white", "rose", "orange"].includes(wine.wineType)) servingSuggestions.push("White wine glass");
  else if (wine.wineType === "fortified") servingSuggestions.push("Small tulip or copita glass");
  else if (profile.body === "full") servingSuggestions.push("Large Bordeaux glass");
  else servingSuggestions.push("Burgundy glass");

  return {
    headline: trimmedHeadline,
    aromas,
    palate,
    structure: {
      body: profile.body,
      acidity: profile.acidity,
      tannin: profile.tannin,
      oak: profile.oak,
      sweetness: profile.sweetness,
    },
    bestPairings: pairingTags,
    servingSuggestions,
  };
}

function derivePairingTagsFromProfile(profile: WineProfile, wineType: string): string[] {
  const tags: string[] = [];
  
  if (profile.body === "full" && profile.tannin === "high") {
    tags.push("Grilled Red Meat", "Aged Cheese", "Braised Dishes");
  } else if (profile.body === "full" && profile.tannin !== "high") {
    tags.push("Roasted Meats", "Rich Sauces", "Hard Cheese");
  } else if (profile.body === "medium" && wineType === "red") {
    tags.push("Lamb", "Poultry", "Mushroom Dishes");
  } else if (profile.body === "light" && wineType === "red") {
    tags.push("Salmon", "Poultry", "Charcuterie");
  } else if (wineType === "sparkling") {
    tags.push("Appetizers", "Fried Foods", "Fresh Seafood");
  } else if (wineType === "rose") {
    tags.push("Mediterranean Cuisine", "Light Salads", "Grilled Vegetables");
  } else if (wineType === "orange") {
    tags.push("Spiced Dishes", "Aged Cheese", "Charcuterie");
  } else if (wineType === "fortified") {
    tags.push("Blue Cheese", "Chocolate Desserts", "Nuts");
  } else if (wineType === "dessert") {
    tags.push("Fruit Desserts", "Foie Gras", "Soft Cheese");
  } else if (profile.acidity === "high" && wineType === "white") {
    tags.push("Seafood", "Salads", "Goat Cheese");
  } else if (profile.body === "medium" && wineType === "white") {
    tags.push("Poultry", "Creamy Pasta", "Soft Cheese");
  } else {
    tags.push("Light Appetizers", "Fresh Fish", "Salads");
  }

  return tags.slice(0, 3);
}
