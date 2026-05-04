export const WINE_TYPES = [
  { key: "red", label: "Red" },
  { key: "white", label: "White" },
  { key: "rose", label: "Rosé" },
  { key: "sparkling", label: "Sparkling" },
  { key: "orange", label: "Orange / Skin-contact" },
  { key: "fortified", label: "Fortified" },
  { key: "dessert", label: "Dessert / Sweet" },
  { key: "nonAlcoholic", label: "Non-alcoholic" },
  { key: "malbec", label: "Malbec" },
  { key: "cabernetSauvignon", label: "Cabernet Sauvignon" },
  { key: "pinotGrigio", label: "Pinot Grigio" },
  { key: "pinotNoir", label: "Pinot Noir" },
  { key: "chardonnay", label: "Chardonnay" },
  { key: "sauvignonBlanc", label: "Sauvignon Blanc" },
  { key: "syrah", label: "Syrah / Shiraz" },
  { key: "riesling", label: "Riesling" },
] as const;

export type WineTypeKey = typeof WINE_TYPES[number]["key"];

export const WINE_TYPE_KEYS = [
  "red", "white", "rose", "sparkling", "orange", "fortified", "dessert", "nonAlcoholic",
  "malbec", "cabernetSauvignon", "pinotGrigio", "pinotNoir", "chardonnay", "sauvignonBlanc", "syrah", "riesling"
] as const satisfies readonly WineTypeKey[];

export const WINE_TYPE_LABELS: Record<WineTypeKey, string> = Object.fromEntries(
  WINE_TYPES.map(t => [t.key, t.label])
) as Record<WineTypeKey, string>;

export interface WineInput {
  name: string;
  producer?: string;
  vintage?: string | number;
  region?: string;
  grapes?: string[] | string;
  style?: string;
  notes?: string;
  varietal?: string;
  description?: string;
  wineType?: string;
}

export interface WineClassification {
  typePrimary: WineTypeKey;
  typeSecondary: WineTypeKey[];
  confidence: number;
  reasons: string[];
}

const SPARKLING_KEYWORDS = [
  "champagne",
  "cava",
  "prosecco",
  "franciacorta",
  "sekt",
  "cremant",
  "spumante",
  "pet-nat",
  "pet nat",
  "metodo classico",
  "traditional method",
  "moscato d'asti",
  "moscato d asti",
  "d'asti",
];

const ROSE_KEYWORDS = ["rosé", "rose"];
const ORANGE_KEYWORDS = ["orange", "skin-contact", "skin contact", "ramato"];

const FORTIFIED_KEYWORDS = [
  "port",
  "porto",
  "sherry",
  "madeira",
  "marsala",
  "vermouth",
  "vin doux naturel",
  "banyuls",
  "rivesaltes",
];

const DESSERT_KEYWORDS = [
  "late harvest",
  "icewine",
  "sauternes",
  "tokaji",
  "beerenauslese",
  "trockenbeerenauslese",
  "passito",
  "vin santo",
  "demi-sec",
  "doux",
  "sweet",
  "dessert",
];

const NON_ALCOHOLIC_KEYWORDS = [
  "non-alcoholic",
  "dealcoholized",
  "0.0",
];

const SPARKLING_REGIONS = [
  "champagne",
  "conegliano",
  "valdobbiadene",
  "penedes",
];

const DESSERT_REGIONS = ["sauternes", "tokaj"];
const FORTIFIED_REGIONS = ["jerez", "montilla-moriles", "madeira"];

const RED_GRAPES = [
  "cabernet sauvignon",
  "merlot",
  "pinot noir",
  "syrah",
  "shiraz",
  "grenache",
  "tempranillo",
  "sangiovese",
  "nebbiolo",
  "malbec",
  "zinfandel",
  "barbera",
  "mourvedre",
  "gamay",
  "carmenere",
  "cabernet franc",
  "monastrell",
  "zweigelt",
  "agiorgitiko",
  "carignan",
  "cinsault",
  "red blend",
];

const WHITE_GRAPES = [
  "chardonnay",
  "sauvignon blanc",
  "riesling",
  "pinot grigio",
  "pinot gris",
  "chenin blanc",
  "albarino",
  "gruner veltliner",
  "viognier",
  "semillon",
  "gewurztraminer",
  "muscadet",
  "vermentino",
  "torrontes",
  "garganega",
  "arneis",
  "trebbiano",
  "fiano",
  "assyrtiko",
  "malagousia",
  "insolia",
  "glera",
  "moschofilero",
  "clairette",
  "bordeaux blanc",
  "white blend",
  "sancerre",
  "mauzac",
  "obediah",
];

function normalize(text?: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(haystack: string, needles: string[]): string | null {
  for (const needle of needles) {
    if (haystack.includes(needle)) return needle;
  }
  return null;
}

export function classifyWine(wine: WineInput): WineClassification {
  const reasons: string[] = [];
  const secondary: WineTypeKey[] = [];

  const grapeStr = Array.isArray(wine.grapes)
    ? wine.grapes.join(" ")
    : wine.grapes || wine.varietal || "";

  const searchable = normalize(
    [
      wine.name,
      wine.region,
      wine.style,
      wine.notes,
      wine.description,
      wine.producer,
      grapeStr,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const nonAlcoholicMatch = containsAny(searchable, NON_ALCOHOLIC_KEYWORDS);
  if (nonAlcoholicMatch) {
    reasons.push(`keyword:${nonAlcoholicMatch}`);
    return { typePrimary: "nonAlcoholic", typeSecondary: [], confidence: 1, reasons };
  }

  const fortifiedMatch = containsAny(searchable, FORTIFIED_KEYWORDS);
  const dessertMatch = containsAny(searchable, DESSERT_KEYWORDS);
  const orangeMatch = containsAny(searchable, ORANGE_KEYWORDS);
  const sparklingMatch = containsAny(searchable, SPARKLING_KEYWORDS);
  const roseMatch = containsAny(searchable, ROSE_KEYWORDS);

  if (fortifiedMatch) {
    reasons.push(`keyword:${fortifiedMatch}`);
    if (dessertMatch) {
      secondary.push("dessert");
      reasons.push(`keyword:${dessertMatch}`);
    }
    return { typePrimary: "fortified", typeSecondary: secondary, confidence: 0.98, reasons };
  }

  if (orangeMatch) {
    reasons.push(`keyword:${orangeMatch}`);
    return { typePrimary: "orange", typeSecondary: [], confidence: 0.98, reasons };
  }

  if (sparklingMatch) {
    reasons.push(`keyword:${sparklingMatch}`);
    if (roseMatch) {
      secondary.push("rose");
      reasons.push(`keyword:${roseMatch}`);
    }
    if (dessertMatch || searchable.includes("d'asti") || searchable.includes("dasti") || searchable.includes("asti spumante")) {
      if (!secondary.includes("dessert")) secondary.push("dessert");
      if (dessertMatch) reasons.push(`keyword:${dessertMatch}`);
      else reasons.push("keyword:asti");
    }
    return { typePrimary: "sparkling", typeSecondary: secondary, confidence: 0.98, reasons };
  }

  if (roseMatch) {
    reasons.push(`keyword:${roseMatch}`);
    return { typePrimary: "rose", typeSecondary: [], confidence: 0.98, reasons };
  }

  if (dessertMatch) {
    reasons.push(`keyword:${dessertMatch}`);
    return { typePrimary: "dessert", typeSecondary: [], confidence: 0.92, reasons };
  }

  const sparklingRegion = containsAny(searchable, SPARKLING_REGIONS);
  if (sparklingRegion) {
    reasons.push(`region:${sparklingRegion}`);
    const regionSecondary: WineTypeKey[] = [];
    if (dessertMatch) {
      regionSecondary.push("dessert");
      reasons.push(`keyword:${dessertMatch}`);
    }
    if (roseMatch) {
      regionSecondary.push("rose");
      reasons.push(`keyword:${roseMatch}`);
    }
    return { typePrimary: "sparkling", typeSecondary: regionSecondary, confidence: 0.95, reasons };
  }

  const dessertRegion = containsAny(searchable, DESSERT_REGIONS);
  if (dessertRegion) {
    reasons.push(`region:${dessertRegion}`);
    return { typePrimary: "dessert", typeSecondary: [], confidence: 0.90, reasons };
  }

  const fortifiedRegion = containsAny(searchable, FORTIFIED_REGIONS);
  if (fortifiedRegion) {
    reasons.push(`region:${fortifiedRegion}`);
    return { typePrimary: "fortified", typeSecondary: [], confidence: 0.90, reasons };
  }

  const grapeNormalized = normalize(grapeStr);
  if (grapeNormalized) {
    const grapeList = grapeNormalized.split(/,\s*/).map(g => g.trim()).filter(Boolean);
    let redCount = 0;
    let whiteCount = 0;
    let firstRed = "";
    let firstWhite = "";

    for (const grape of grapeList) {
      const rMatch = containsAny(grape, RED_GRAPES);
      if (rMatch) { redCount++; if (!firstRed) firstRed = rMatch; }
      const wMatch = containsAny(grape, WHITE_GRAPES);
      if (wMatch) { whiteCount++; if (!firstWhite) firstWhite = wMatch; }
    }

    if (redCount > 0 && whiteCount === 0) {
      reasons.push(`grape:${firstRed}`);
      return { typePrimary: "red", typeSecondary: [], confidence: 0.88, reasons };
    }
    if (whiteCount > 0 && redCount === 0) {
      reasons.push(`grape:${firstWhite}`);
      return { typePrimary: "white", typeSecondary: [], confidence: 0.88, reasons };
    }
    if (redCount > 0 && whiteCount > 0) {
      if (redCount > whiteCount) {
        reasons.push(`grape:${firstRed}(mixed)`);
        return { typePrimary: "red", typeSecondary: [], confidence: 0.65, reasons };
      }
      if (whiteCount > redCount) {
        reasons.push(`grape:${firstWhite}(mixed)`);
        return { typePrimary: "white", typeSecondary: [], confidence: 0.65, reasons };
      }
      reasons.push(`grape:mixed(${firstRed}+${firstWhite})`);
      return { typePrimary: "red", typeSecondary: ["white"], confidence: 0.50, reasons };
    }
  }

  if (searchable.includes("rouge") || searchable.includes("rosso")) {
    reasons.push("language:red");
    return { typePrimary: "red", typeSecondary: [], confidence: 0.70, reasons };
  }

  if (searchable.includes("blanc") || searchable.includes("bianco")) {
    reasons.push("language:white");
    return { typePrimary: "white", typeSecondary: [], confidence: 0.70, reasons };
  }

  if (wine.wineType) {
    const wt = normalize(wine.wineType);
    const fallbackMap: Record<string, WineTypeKey> = {
      red: "red", white: "white", rose: "rose",
      sparkling: "sparkling", amber: "orange",
    };
    const mapped = fallbackMap[wt];
    if (mapped) {
      reasons.push(`fallback:wineType=${wine.wineType}`);
      return { typePrimary: mapped, typeSecondary: [], confidence: 0.50, reasons };
    }
  }

  return {
    typePrimary: "white",
    typeSecondary: [],
    confidence: 0.40,
    reasons: ["fallback:default_white"],
  };
}
