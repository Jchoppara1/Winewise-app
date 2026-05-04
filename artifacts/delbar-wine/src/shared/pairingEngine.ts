import type { Wine } from "./schema";
import type { Food } from "./foodSchema";
import type { WineProfile } from "./wineProfile";
import { inferWineProfile } from "./wineProfile";
import { calibrateScores, type ConfidenceTier, type ConfidenceLevel } from "./calibrateMatch";

export interface DishProfile {
  protein: "beef" | "lamb" | "chicken" | "seafood" | "shellfish" | "fish" | "vegetarian" | "vegan" | "none";
  cookingMethod: "grilled" | "fried" | "roasted" | "raw" | "braised" | "stewed" | "baked" | "other";
  dominantSauce: "cream" | "tomato" | "butter" | "citrus" | "soy" | "chili" | "herb" | "tahini" | "yogurt" | "none";
  spiceLevel: number;
  richness: number;
  saltLevel: number;
  sweetness: number;
  acidity: number;
  isVegetarian: boolean;
}

export interface ScoreBreakdown {
  intensityMatch: number;
  acidFat: number;
  tanninProtein: number;
  spiceHandling: number;
  sauceMatch: number;
  regionalBonus: number;
  total: number;
}

export interface PairingResult {
  wine: Wine;
  score: number;
  matchScore: number;
  confidenceTier: ConfidenceTier;
  confidenceLevel?: ConfidenceLevel;
  breakdown: ScoreBreakdown;
  explanation: string;
  whyItWorks: string[];
  reasonHighlights?: { positive: string[]; negative?: string };
  avoidNote?: string;
}

const proteinKeywords: Record<string, DishProfile["protein"]> = {
  "beef": "beef", "hanger steak": "beef", "koobideh": "beef", "barg": "beef",
  "lamb": "lamb",
  // REMOVED: pork items for Middle Eastern restaurant
  "chicken": "chicken", "joojeh": "chicken", "kofta": "chicken",
  "shrimp": "shellfish", "omani shrimp": "shellfish", "prawn": "shellfish", "crab": "shellfish", "lobster": "shellfish", "mussel": "shellfish", "clam": "shellfish", "oyster": "shellfish",
  // EXPANDED: Added more fish keywords including seabass variations
  "seabass": "fish", "sea bass": "fish", "branzino": "fish", "salmon": "fish", "fish": "fish", "trout": "fish", "cod": "fish", "halibut": "fish", "snapper": "fish", "tuna": "fish", "mahi": "fish", "tilapia": "fish", "sole": "fish", "flounder": "fish",
  "falafel": "vegetarian", "cauliflower": "vegetarian", "beet": "vegetarian",
  "vegetarian": "vegetarian",
};

const cookingKeywords: Record<string, DishProfile["cookingMethod"]> = {
  "grilled": "grilled", "kabob": "grilled", "charred": "grilled",
  "fried": "fried", "fries": "fried", "wings": "fried",
  "roasted": "roasted", "whole roasted": "roasted",
  "braised": "braised", "stewed": "stewed",
  "raw": "raw", "carpaccio": "raw", "salad": "raw",
};

const sauceKeywords: Record<string, DishProfile["dominantSauce"]> = {
  "harissa": "chili", "spicy": "chili",
  "tahini": "tahini",
  "yogurt": "yogurt", "mast": "yogurt", "labneh": "yogurt",
  "herb": "herb", "sabzi": "herb", "za'taar": "herb",
  "citrus": "citrus", "lemon": "citrus",
  "cream": "cream", "butter": "butter",
  "hummus": "tahini",
};

export function inferDishProfile(food: Food): DishProfile {
  const nameLower = food.name.toLowerCase();
  const categoryLower = food.category.toLowerCase();

  let protein: DishProfile["protein"] = "none";
  for (const [keyword, type] of Object.entries(proteinKeywords)) {
    if (nameLower.includes(keyword)) {
      protein = type;
      break;
    }
  }
  // IMPROVED: Better category fallback logic
  if (protein === "none" && (categoryLower.includes("meat") && !categoryLower.includes("seafood"))) protein = "beef";
  if (protein === "none" && categoryLower.includes("seafood")) protein = "fish";

  let cookingMethod: DishProfile["cookingMethod"] = "other";
  for (const [keyword, method] of Object.entries(cookingKeywords)) {
    if (nameLower.includes(keyword)) {
      cookingMethod = method;
      break;
    }
  }

  let dominantSauce: DishProfile["dominantSauce"] = "none";
  for (const [keyword, sauce] of Object.entries(sauceKeywords)) {
    if (nameLower.includes(keyword)) {
      dominantSauce = sauce;
      break;
    }
  }

  const spicyDishes = ["harissa", "adana", "spicy"];
  const spiceLevel = spicyDishes.some(s => nameLower.includes(s)) ? 0.8 : 0.2;

  let richness = 0.5;
  if (["beef", "lamb"].includes(protein)) richness = 0.8;
  if (cookingMethod === "braised" || cookingMethod === "fried") richness += 0.1;
  if (protein === "fish" || protein === "seafood") richness = 0.3;
  if (protein === "vegetarian") richness = 0.3;
  if (categoryLower.includes("spreads")) richness = 0.4;
  if (categoryLower.includes("mazzes")) richness = 0.3;

  let saltLevel = 0.4;
  if (cookingMethod === "grilled" || cookingMethod === "fried") saltLevel = 0.6;
  if (dominantSauce === "soy") saltLevel = 0.8;

  let sweetness = 0.1;
  if (nameLower.includes("honey")) sweetness = 0.4;

  let acidity = 0.3;
  if (dominantSauce === "citrus" || dominantSauce === "yogurt") acidity = 0.6;
  if (nameLower.includes("tomato") || nameLower.includes("heirloom")) acidity = 0.5;

  const isVegetarian = protein === "vegetarian" || protein === "vegan" || protein === "none";

  return {
    protein,
    cookingMethod,
    dominantSauce,
    spiceLevel: Math.min(1, spiceLevel),
    richness: Math.min(1, richness),
    saltLevel: Math.min(1, saltLevel),
    sweetness: Math.min(1, sweetness),
    acidity: Math.min(1, acidity),
    isVegetarian,
  };
}

function bodyToIntensity(body: string): number {
  if (body === "light") return 0.3;
  if (body === "medium") return 0.6;
  return 0.9;
}

function tanninToScore(tannin: string): number {
  if (tannin === "none") return 0;
  if (tannin === "low") return 0.3;
  if (tannin === "medium") return 0.6;
  return 0.9;
}

function acidToScore(acidity: string): number {
  if (acidity === "low") return 0.3;
  if (acidity === "medium") return 0.6;
  return 0.9;
}

function sweetnessToScore(sweetness: string): number {
  if (sweetness === "dry") return 0.1;
  if (sweetness === "off-dry") return 0.5;
  return 0.9;
}

export function scorePairing(
  wineProfile: WineProfile,
  dishProfile: DishProfile,
  wine: Wine,
  mode: "classic" | "adventurous" = "classic"
): ScoreBreakdown {
  const wineIntensity = bodyToIntensity(wineProfile.body);
  const wineTannin = tanninToScore(wineProfile.tannin);
  const wineAcid = acidToScore(wineProfile.acidity);
  const wineSweetness = sweetnessToScore(wineProfile.sweetness);

  // RULE: Match intensity - light dishes get light wines, rich dishes get fuller wines
  const intensityDiff = Math.abs(wineIntensity - dishProfile.richness);
  let intensityMatch = Math.max(0, 1 - intensityDiff * 2);

  // RULE: Acid cuts fat - high-acid wines score higher for creamy/fatty dishes
  let acidFat = 0.5;
  if (dishProfile.richness > 0.6 && wineAcid > 0.6) {
    acidFat = 0.9;
  } else if (dishProfile.richness > 0.6 && wineAcid < 0.4) {
    acidFat = 0.2;
  } else if (dishProfile.richness < 0.4 && wineAcid > 0.7) {
    acidFat = 0.6;
  }

  // RULE: Tannin vs protein - higher tannin works with red meat and grilled proteins; penalize with delicate fish
  // REMOVED: pork-specific logic since this is a Middle Eastern restaurant
  let tanninProtein = 0.5;
  if (["beef", "lamb"].includes(dishProfile.protein) && wineTannin > 0.5) {
    tanninProtein = 0.9;
  } else if (["fish", "seafood", "shellfish"].includes(dishProfile.protein) && wineTannin > 0.5) {
    tanninProtein = 0.1;
  } else if (dishProfile.protein === "chicken" && wineTannin < 0.5) {
    tanninProtein = 0.7;
  } else if (dishProfile.isVegetarian && wineTannin < 0.4) {
    tanninProtein = 0.7;
  } else if (dishProfile.isVegetarian && wineTannin > 0.7) {
    tanninProtein = 0.3;
  }
  if (dishProfile.cookingMethod === "grilled" && wineTannin > 0.4) {
    tanninProtein = Math.min(1, tanninProtein + 0.15);
  }

  // RULE: Heat/spice - penalize high tannin; reward off-dry/fruity for spicy dishes
  let spiceHandling = 0.5;
  if (dishProfile.spiceLevel > 0.5) {
    if (wineSweetness > 0.3) spiceHandling = 0.9;
    else if (wineTannin > 0.6) spiceHandling = 0.1;
    else if (wineAcid > 0.6 && wineTannin < 0.5) spiceHandling = 0.7;
    else spiceHandling = 0.4;

    const descLower = (wine.description || "").toLowerCase();
    if (descLower.includes("fruit") || descLower.includes("berry") || descLower.includes("cherry")) {
      spiceHandling = Math.min(1, spiceHandling + 0.2);
    }
  }

  // RULE: Sauce match - specific wine styles complement specific sauces
  let sauceMatch = 0.5;
  switch (dishProfile.dominantSauce) {
    case "cream":
    case "butter":
      if (wineProfile.body === "medium" && wineProfile.oak !== "none") sauceMatch = 0.9;
      else if (wineAcid > 0.6) sauceMatch = 0.7;
      break;
    case "citrus":
      if (wineAcid > 0.6 && wine.wineType === "white") sauceMatch = 0.9;
      break;
    case "chili":
      if (wineSweetness > 0.3 || (wineAcid > 0.6 && wineTannin < 0.4)) sauceMatch = 0.8;
      else if (wineTannin > 0.6) sauceMatch = 0.2;
      break;
    case "tahini":
    case "yogurt":
      if (wineAcid > 0.5 && (wine.wineType === "white" || wine.wineType === "sparkling")) sauceMatch = 0.8;
      else if (wine.wineType === "rose") sauceMatch = 0.7;
      break;
    case "herb":
      if (wineProfile.flavorNotes.some(n => ["herbs", "herbal", "grass", "green"].includes(n))) sauceMatch = 0.9;
      else if (wine.wineType === "white" && wineAcid > 0.5) sauceMatch = 0.7;
      break;
    case "tomato":
      if (wineAcid > 0.6) sauceMatch = 0.8;
      if (wineTannin > 0.3 && wine.wineType === "red") sauceMatch = 0.85;
      break;
  }

  // RULE: Regional/typical pairings bonus
  let regionalBonus = 0;
  const regionStr = wineProfile.regionCues.join(" ").toLowerCase();
  const varietalLower = wine.varietal.toLowerCase();
  if (regionStr.includes("champagne") && dishProfile.cookingMethod === "fried") regionalBonus = 0.3;
  if (regionStr.includes("sancerre") && dishProfile.dominantSauce === "yogurt") regionalBonus = 0.25;
  if (regionStr.includes("loire") && dishProfile.dominantSauce === "herb") regionalBonus = 0.2;
  if (varietalLower.includes("riesling") && dishProfile.spiceLevel > 0.5) regionalBonus = 0.25;
  if (regionStr.includes("bekaa") && ["lamb", "beef"].includes(dishProfile.protein)) regionalBonus = 0.2;
  if (regionStr.includes("greece") && dishProfile.dominantSauce === "yogurt") regionalBonus = 0.2;
  if (regionStr.includes("provence") && wine.wineType === "rose" && dishProfile.dominantSauce === "herb") regionalBonus = 0.2;
  if (wine.wineType === "sparkling" && (dishProfile.dominantSauce === "tahini" || dishProfile.dominantSauce === "yogurt")) {
    regionalBonus = Math.max(regionalBonus, 0.15);
  }

  // Adventurous mode widens thresholds and adds novelty
  if (mode === "adventurous") {
    intensityMatch = Math.min(1, intensityMatch + 0.15);
    if (tanninProtein < 0.5 && tanninProtein > 0.2) tanninProtein += 0.1;
    const unconventional = Math.abs(wineIntensity - dishProfile.richness) > 0.3 ? 0.1 : 0;
    regionalBonus += unconventional;
  }

  // Weighted total
  const weights = { intensity: 0.25, acidFat: 0.2, tanninProtein: 0.2, spice: 0.15, sauce: 0.1, regional: 0.1 };
  const total = 
    intensityMatch * weights.intensity +
    acidFat * weights.acidFat +
    tanninProtein * weights.tanninProtein +
    spiceHandling * weights.spice +
    sauceMatch * weights.sauce +
    regionalBonus * weights.regional;

  return {
    intensityMatch: Math.round(intensityMatch * 100) / 100,
    acidFat: Math.round(acidFat * 100) / 100,
    tanninProtein: Math.round(tanninProtein * 100) / 100,
    spiceHandling: Math.round(spiceHandling * 100) / 100,
    sauceMatch: Math.round(sauceMatch * 100) / 100,
    regionalBonus: Math.round(regionalBonus * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

function generateExplanation(
  breakdown: ScoreBreakdown,
  wineProfile: WineProfile,
  dishProfile: DishProfile,
  wine: Wine
): { explanation: string; whyItWorks: string[]; avoidNote?: string } {
  const reasons: string[] = [];
  let avoidNote: string | undefined;

  if (breakdown.intensityMatch > 0.7) {
    reasons.push(`Intensity match: ${wineProfile.body}-bodied wine balances the dish's richness`);
  }
  if (breakdown.acidFat > 0.7) {
    reasons.push(`${wineProfile.acidity === "high" ? "Bright" : "Balanced"} acidity cuts through richness`);
  }
  if (breakdown.tanninProtein > 0.7 && wineProfile.tannin !== "none") {
    reasons.push(`Tannins complement the ${dishProfile.protein} protein`);
  }
  if (breakdown.spiceHandling > 0.7 && dishProfile.spiceLevel > 0.5) {
    reasons.push("Handles the dish's spice level well");
  }
  if (breakdown.sauceMatch > 0.7) {
    reasons.push(`Complements the ${dishProfile.dominantSauce} sauce profile`);
  }
  if (breakdown.regionalBonus > 0.1) {
    reasons.push("Classic regional pairing tradition");
  }

  if (reasons.length === 0) {
    reasons.push("A versatile pairing that works across multiple dimensions");
  }

  if (breakdown.tanninProtein < 0.2 && ["fish", "seafood"].includes(dishProfile.protein)) {
    avoidNote = "High tannins can overwhelm delicate seafood";
  }
  if (breakdown.spiceHandling < 0.2 && dishProfile.spiceLevel > 0.5) {
    avoidNote = "High tannin and alcohol can amplify heat from spicy dishes";
  }

  const topReasons = reasons.slice(0, 2);
  const explanation = topReasons.join(". ") + ".";

  return { explanation, whyItWorks: reasons, avoidNote };
}

export function rankWinesForFood(
  food: Food,
  wines: Wine[],
  mode: "classic" | "adventurous" = "classic",
  topN: number = 3
): PairingResult[] {
  const dishProfile = inferDishProfile(food);

  const rawResults = wines.map(wine => {
    const wineProfile = inferWineProfile(wine);
    const breakdown = scorePairing(wineProfile, dishProfile, wine, mode);
    const { explanation, whyItWorks, avoidNote } = generateExplanation(breakdown, wineProfile, dishProfile, wine);

    return {
      wine,
      score: breakdown.total,
      breakdown,
      explanation,
      whyItWorks,
      avoidNote,
    };
  });

  const rawScores = rawResults.map(r => r.score);
  const avoidFlags = rawResults.map(r => !!r.avoidNote);
  const calibrated = calibrateScores(rawScores, avoidFlags);

  const results: PairingResult[] = rawResults.map((r, i) => ({
    ...r,
    matchScore: calibrated[i].matchScore,
    confidenceTier: calibrated[i].confidenceTier,
    confidenceLevel: calibrated[i].confidenceLevel,
    reasonHighlights: {
      positive: r.whyItWorks.slice(0, 2),
      negative: r.avoidNote,
    },
  }));

  results.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const diverse: PairingResult[] = [];

  for (const r of results) {
    if (diverse.length >= topN) break;
    const typeKey = r.wine.wineType;
    if (diverse.length >= 2 && diverse.every(d => d.wine.wineType === typeKey)) {
      continue;
    }
    if (!seen.has(r.wine.id)) {
      seen.add(r.wine.id);
      diverse.push(r);
    }
  }

  return diverse;
}

export interface FoodPairingResult {
  food: Food;
  score: number;
  matchScore: number;
  confidenceTier: ConfidenceTier;
  confidenceLevel?: ConfidenceLevel;
  explanation: string;
  whyItWorks: string[];
}

export function rankFoodsForWine(
  wine: Wine,
  foods: Food[],
  mode: "classic" | "adventurous" = "classic",
  topN: number = 4
): FoodPairingResult[] {
  const wineProfile = inferWineProfile(wine);

  const rawResults = foods.map(food => {
    const dishProfile = inferDishProfile(food);
    const breakdown = scorePairing(wineProfile, dishProfile, wine, mode);
    const { explanation, whyItWorks } = generateExplanation(breakdown, wineProfile, dishProfile, wine);

    return { food, score: breakdown.total, explanation, whyItWorks };
  });

  const rawScores = rawResults.map(r => r.score);
  const calibrated = calibrateScores(rawScores);

  const results: FoodPairingResult[] = rawResults.map((r, i) => ({
    ...r,
    matchScore: calibrated[i].matchScore,
    confidenceTier: calibrated[i].confidenceTier,
    confidenceLevel: calibrated[i].confidenceLevel,
  }));

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}
