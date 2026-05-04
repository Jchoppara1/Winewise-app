import type { WineType, FoodPairing, PriceCategory } from "./schema";

const wineTypePairings: Record<WineType, FoodPairing[]> = {
  red: ["Beef", "Lamb", "Pasta", "Cheese"],
  white: ["Seafood", "Fish", "Poultry", "Salads"],
  rose: ["Salads", "Appetizers", "Seafood", "Spicy Food"],
  sparkling: ["Appetizers", "Desserts", "Seafood", "Cheese"],
  orange: ["Seafood", "Spicy Food", "Cheese", "Appetizers"],
  fortified: ["Cheese", "Desserts", "Appetizers"],
  dessert: ["Desserts", "Cheese", "Appetizers"],
  nonAlcoholic: ["Salads", "Appetizers", "Seafood", "Spicy Food"],
};

const varietalOverrides: Record<string, FoodPairing[]> = {
  "Pinot Noir": ["Poultry", "Pork", "Pasta", "Cheese"],
  "Cabernet Sauvignon": ["Beef", "Lamb", "Cheese"],
  "Merlot": ["Beef", "Lamb", "Pasta"],
  "Syrah": ["Beef", "Lamb", "Spicy Food"],
  "Shiraz": ["Beef", "Lamb", "Spicy Food"],
  "Malbec": ["Beef", "Lamb", "Pork"],
  "Chardonnay": ["Poultry", "Seafood", "Fish", "Pasta"],
  "Sauvignon Blanc": ["Seafood", "Fish", "Salads", "Appetizers"],
  "Riesling": ["Spicy Food", "Seafood", "Pork", "Desserts"],
  "Pinot Grigio": ["Seafood", "Fish", "Salads", "Appetizers"],
  "Gewürztraminer": ["Spicy Food", "Pork", "Appetizers"],
  "Champagne": ["Appetizers", "Seafood", "Desserts"],
  "Prosecco": ["Appetizers", "Salads", "Desserts"],
  "Cava": ["Appetizers", "Seafood", "Tapas" as FoodPairing],
  "Zinfandel": ["Beef", "Pork", "Spicy Food"],
  "Tempranillo": ["Beef", "Lamb", "Pork"],
};

export function deriveFoodPairings(wineType: WineType, varietal: string): FoodPairing[] {
  const normalizedVarietal = varietal.trim();
  
  for (const [key, pairings] of Object.entries(varietalOverrides)) {
    if (normalizedVarietal.toLowerCase().includes(key.toLowerCase())) {
      return pairings.filter((p): p is FoodPairing => 
        ["Beef", "Lamb", "Poultry", "Pork", "Seafood", "Fish", "Pasta", "Cheese", "Salads", "Desserts", "Spicy Food", "Appetizers"].includes(p)
      );
    }
  }
  
  return wineTypePairings[wineType] || ["Cheese", "Appetizers"];
}

export function derivePriceCategory(priceCents: number): PriceCategory {
  if (priceCents <= 2000) return "$";
  if (priceCents <= 4000) return "$$";
  if (priceCents <= 8000) return "$$$";
  return "$$$$";
}

export function applyComputedFields(wine: {
  wineType: WineType;
  varietal: string;
  priceCents: number;
}): { priceCategory: PriceCategory; foodPairings: FoodPairing[] } {
  return {
    priceCategory: derivePriceCategory(wine.priceCents),
    foodPairings: deriveFoodPairings(wine.wineType, wine.varietal),
  };
}

export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}
