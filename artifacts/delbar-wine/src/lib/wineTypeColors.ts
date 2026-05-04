import { WINE_TYPES, WINE_TYPE_LABELS, type WineTypeKey } from "@shared/wineTypes";

export const wineTypeColors: Record<string, string> = {
  red: "bg-accent text-accent-foreground",
  white: "bg-secondary text-secondary-foreground",
  rose: "bg-blush/40 text-terracotta dark:bg-blush dark:text-terracotta",
  sparkling: "bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold",
  orange: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  fortified: "bg-red-900/10 text-red-900 dark:bg-red-900/20 dark:text-red-300",
  dessert: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  nonAlcoholic: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function wineTypeLabel(key: string): string {
  return WINE_TYPE_LABELS[key as WineTypeKey] || key;
}

export { WINE_TYPES, WINE_TYPE_LABELS, type WineTypeKey };
