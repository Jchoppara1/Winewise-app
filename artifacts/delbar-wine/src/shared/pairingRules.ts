import type { Wine } from "./schema";
import type { Food, FoodCategory } from "./foodSchema";

export interface WinePairingResult {
  wine: Wine;
  note: string;
}

export interface FoodPairingResult {
  food: Food;
  note: string;
}

// Varietal weight classification for red wines
const lightMediumRedVarietals = [
  "Pinot Noir", "Gamay", "Zweigelt", "Grenache", "Tempranillo", "Agiorgitiko"
];

const boldRedVarietals = [
  "Cabernet Sauvignon", "Shiraz", "Syrah", "Malbec", "Monastrell", "Cabernet Franc"
];

// Dishes that pair with specific wine types
const sparklingDishes = [
  "Smoked Chilean Bass", "Omani Shrimp", "Wings (GF)", "Falafel Plate (GF)", 
  "Hummus (GF)", "Labneh (GF)", "Dill Labneh (GF)", "Mast Khiyar (GF)"
];

const whiteDishes = [
  "Seabass", "Whole Stuffed Branzino (GF)", "Salmon Kabob", "Joojeh Kabob (GF)",
  "Chicken Barg", "Sabzi Polo (GF)", "Mixed Green Salad (GF)", "Pear and Kale (GF)",
  "Hummus (GF)", "Labneh (GF)", "Heirloom Tomato Salad"
];

const roseDishes = [
  "Joojeh Kabob (GF)", "Lamb & Baghali Tachin (GF)", "Adas Polo (GF)", 
  "Adana Bite", "Beet Carpaccio (GF)", "Za'taar Fries (GF)", "Polo Sefid (GF)"
];

const lightRedDishes = [
  "Chicken Kofta (GF)", "Adana Bite", "Falafel Plate (GF)", 
  "Gheimeh Bademjoon Vegetarian", "Honey Harissa Chicken (GF)"
];

const mediumRedDishes = [
  "Lamb Kabob", "Chinjeh", "Beef Barg", "Koobideh Kabob", 
  "Gheimeh Bademjoon (GF)", "Chicken Barg"
];

const boldRedDishes = [
  "Lamb Neck (GF)", "Hanger Steak (GF)", "Beef Barg", "Chinjeh", "Koobideh Kabob"
];

const amberDishes = [
  "Kasha Bademjoon", "Whole Roasted Cauliflower", "Dill Labneh (GF)", 
  "Gheimeh Bademjoon Vegetarian", "Beet Carpaccio (GF)"
];

// Special dish characteristics for wine matching
const spicyDishes = ["Honey Harissa Chicken (GF)", "Adana Bite"];
const herbDishes = ["Sabzi Polo (GF)"];
const dairyDishes = ["Mast Khiyar (GF)", "Labneh (GF)", "Dill Labneh (GF)"];
const grilledDishes = [
  "Lamb Kabob", "Joojeh Kabob (GF)", "Koobideh Kabob", "Salmon Kabob",
  "Hanger Steak (GF)", "Beef Barg", "Chicken Barg", "Lamb Neck (GF)"
];

function isLightMediumRed(varietal: string): boolean {
  return lightMediumRedVarietals.some(v => 
    varietal.toLowerCase().includes(v.toLowerCase())
  );
}

function isBoldRed(varietal: string): boolean {
  return boldRedVarietals.some(v => 
    varietal.toLowerCase().includes(v.toLowerCase())
  );
}

function isHerbaceousWhite(varietal: string): boolean {
  return varietal.toLowerCase().includes("sauvignon blanc");
}

// Get food pairings for a wine
export function getFoodPairingsForWine(wine: Wine, foods: Food[]): FoodPairingResult[] {
  const results: FoodPairingResult[] = [];
  const matchedFoods = new Set<string>();

  const addPairing = (food: Food, note: string) => {
    if (!matchedFoods.has(food.id) && results.length < 4) {
      matchedFoods.add(food.id);
      results.push({ food, note });
    }
  };

  // Check if wine is amber (mapped to White with specific varietal indicators)
  const isAmber = wine.varietal.toLowerCase().includes("orange") || 
                  wine.varietal.toLowerCase().includes("muscat") ||
                  wine.name.toLowerCase().includes("bonny doon");

  if (isAmber) {
    foods.filter(f => amberDishes.includes(f.name))
      .forEach(f => addPairing(f, "Textured complexity complements earthy vegetables"));
    return results;
  }

  switch (wine.wineType) {
    case "sparkling":
      foods.filter(f => sparklingDishes.includes(f.name))
        .forEach(f => addPairing(f, "Bubbles cut through richness"));
      foods.filter(f => f.category === "Mazzes" && !matchedFoods.has(f.id))
        .slice(0, 2).forEach(f => addPairing(f, "Effervescence lifts appetizers"));
      break;

    case "white":
    case "orange":
      if (isHerbaceousWhite(wine.varietal)) {
        foods.filter(f => herbDishes.includes(f.name))
          .forEach(f => addPairing(f, "Herbaceous notes echo Persian herbs"));
      }
      foods.filter(f => dairyDishes.includes(f.name))
        .forEach(f => addPairing(f, "Crisp acidity balances creamy richness"));
      foods.filter(f => whiteDishes.includes(f.name))
        .forEach(f => addPairing(f, "Bright acidity complements delicate flavors"));
      break;

    case "rose":
      foods.filter(f => roseDishes.includes(f.name))
        .forEach(f => addPairing(f, "Versatile bridge between delicate and bold"));
      foods.filter(f => f.category === "Greens & Grains" && !matchedFoods.has(f.id))
        .slice(0, 2).forEach(f => addPairing(f, "Fresh and food-friendly"));
      break;

    case "fortified":
    case "dessert":
      foods.filter(f => f.category === "Spreads" && !matchedFoods.has(f.id))
        .slice(0, 2).forEach(f => addPairing(f, "Sweet complexity matches rich spreads"));
      foods.filter(f => f.category === "Mazzes" && !matchedFoods.has(f.id))
        .slice(0, 2).forEach(f => addPairing(f, "Contrast of sweet and savory"));
      break;

    case "red":
      if (isLightMediumRed(wine.varietal)) {
        // Light-medium reds
        foods.filter(f => lightRedDishes.includes(f.name))
          .forEach(f => addPairing(f, "Soft tannins complement lighter proteins"));
        // Spicy dishes with fruit-forward wines
        if (wine.description?.toLowerCase().includes("fruit") || 
            wine.description?.toLowerCase().includes("cherry") ||
            wine.description?.toLowerCase().includes("berry")) {
          foods.filter(f => spicyDishes.includes(f.name))
            .forEach(f => addPairing(f, "Fruit-forward character tames spice"));
        }
      } else if (isBoldRed(wine.varietal)) {
        // Bold reds for grilled/charred meats
        foods.filter(f => boldRedDishes.includes(f.name))
          .forEach(f => addPairing(f, "Bold structure matches charred richness"));
        foods.filter(f => grilledDishes.includes(f.name) && !matchedFoods.has(f.id))
          .slice(0, 2).forEach(f => addPairing(f, "Tannins stand up to grilled meats"));
      } else {
        // Medium reds (default)
        foods.filter(f => mediumRedDishes.includes(f.name))
          .forEach(f => addPairing(f, "Balanced tannins pair with savory meats"));
      }
      break;
  }

  // If we don't have enough pairings, add category-based suggestions
  if (results.length < 3) {
    if (wine.wineType === "white" || wine.wineType === "sparkling" || wine.wineType === "orange") {
      foods.filter(f => f.category === "Spreads" && !matchedFoods.has(f.id))
        .slice(0, 3 - results.length)
        .forEach(f => addPairing(f, "Classic pairing with mezze"));
    } else {
      foods.filter(f => f.category === "Meats & Seafood" && !matchedFoods.has(f.id))
        .slice(0, 3 - results.length)
        .forEach(f => addPairing(f, "Rich flavors complement each other"));
    }
  }

  return results.slice(0, 4);
}

// Get wine pairings for a food item
export function getWinePairingsForFood(food: Food, wines: Wine[]): WinePairingResult[] {
  const results: WinePairingResult[] = [];
  const matchedWines = new Set<string>();
  const priceRangesUsed = new Set<string>();

  const addPairing = (wine: Wine, note: string) => {
    // Try to include wines across different price ranges
    if (!matchedWines.has(wine.id) && results.length < 4) {
      // Prefer variety in price ranges
      if (priceRangesUsed.has(wine.priceCategory) && results.length >= 2) {
        return; // Skip if we already have this price range and have 2+ wines
      }
      matchedWines.add(wine.id);
      priceRangesUsed.add(wine.priceCategory);
      results.push({ wine, note });
    }
  };

  const isSpicy = spicyDishes.includes(food.name);
  const isHerby = herbDishes.includes(food.name);
  const isDairy = dairyDishes.includes(food.name);
  const isGrilled = grilledDishes.includes(food.name);
  const isAmberFood = amberDishes.includes(food.name);

  // Special cases first
  if (isAmberFood) {
    wines.filter(w => w.name.toLowerCase().includes("bonny doon"))
      .forEach(w => addPairing(w, "Amber wine's texture matches earthy complexity"));
    wines.filter(w => w.wineType === "white" && w.varietal.toLowerCase().includes("chardonnay"))
      .slice(0, 2).forEach(w => addPairing(w, "Rich white complements roasted vegetables"));
  }

  if (isHerby) {
    wines.filter(w => w.varietal.toLowerCase().includes("sauvignon blanc"))
      .slice(0, 3).forEach(w => addPairing(w, "Herbaceous notes echo Persian herbs"));
  }

  if (isDairy) {
    wines.filter(w => w.wineType === "sparkling")
      .slice(0, 2).forEach(w => addPairing(w, "Bubbles cut through creamy richness"));
    wines.filter(w => w.wineType === "white")
      .slice(0, 2).forEach(w => addPairing(w, "Crisp acidity balances dairy"));
  }

  if (isSpicy) {
    wines.filter(w => 
      w.description?.toLowerCase().includes("fruit") ||
      w.description?.toLowerCase().includes("berry") ||
      w.description?.toLowerCase().includes("cherry")
    ).slice(0, 3).forEach(w => addPairing(w, "Fruit-forward character tames spice"));
  }

  // Category-based pairings
  switch (food.category) {
    case "Mazzes":
      wines.filter(w => w.wineType === "sparkling")
        .slice(0, 2).forEach(w => addPairing(w, "Effervescence lifts appetizers"));
      wines.filter(w => w.wineType === "rose")
        .slice(0, 2).forEach(w => addPairing(w, "Versatile and refreshing"));
      break;

    case "Spreads":
      wines.filter(w => w.wineType === "white")
        .slice(0, 2).forEach(w => addPairing(w, "Bright acidity complements creamy spreads"));
      wines.filter(w => w.wineType === "sparkling")
        .slice(0, 2).forEach(w => addPairing(w, "Bubbles cleanse the palate"));
      break;

    case "Greens & Grains":
      wines.filter(w => w.wineType === "white")
        .slice(0, 2).forEach(w => addPairing(w, "Fresh and complementary"));
      wines.filter(w => w.wineType === "rose")
        .slice(0, 2).forEach(w => addPairing(w, "Light body matches grain dishes"));
      break;

    case "Meats & Seafood":
      // Check if it's seafood
      const isSeafood = ["Seabass", "Branzino", "Salmon", "Shrimp"].some(s => 
        food.name.toLowerCase().includes(s.toLowerCase())
      );
      const isChicken = food.name.toLowerCase().includes("chicken") || 
                        food.name.toLowerCase().includes("joojeh");
      const isLamb = food.name.toLowerCase().includes("lamb");
      const isBeef = food.name.toLowerCase().includes("beef") || 
                     food.name.toLowerCase().includes("hanger") ||
                     food.name.toLowerCase().includes("koobideh");

      if (isSeafood) {
        wines.filter(w => w.wineType === "white")
          .slice(0, 3).forEach(w => addPairing(w, "Bright acidity complements seafood"));
      } else if (isChicken) {
        wines.filter(w => w.wineType === "white" || w.wineType === "rose")
          .slice(0, 2).forEach(w => addPairing(w, "Light wine for lighter protein"));
        wines.filter(w => w.wineType === "red" && isLightMediumRed(w.varietal))
          .slice(0, 2).forEach(w => addPairing(w, "Soft tannins complement poultry"));
      } else if (isLamb || isBeef || isGrilled) {
        wines.filter(w => w.wineType === "red" && isBoldRed(w.varietal))
          .slice(0, 3).forEach(w => addPairing(w, "Bold tannins match rich meats"));
        wines.filter(w => w.wineType === "red" && !isBoldRed(w.varietal))
          .slice(0, 2).forEach(w => addPairing(w, "Balanced structure for grilled dishes"));
      } else {
        wines.filter(w => w.wineType === "red")
          .slice(0, 3).forEach(w => addPairing(w, "Red wine complements savory proteins"));
      }
      break;
  }

  // Ensure variety in price ranges if we have room
  if (results.length < 4) {
    const missingRanges = ["$", "$$", "$$$", "$$$$"].filter(r => !priceRangesUsed.has(r));
    for (const range of missingRanges) {
      if (results.length >= 4) break;
      const wine = wines.find(w => w.priceCategory === range && !matchedWines.has(w.id));
      if (wine) {
        addPairing(wine, "Great value pairing");
      }
    }
  }

  return results.slice(0, 4);
}
