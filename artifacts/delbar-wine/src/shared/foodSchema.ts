import { z } from "zod";

export const foodCategories = ["Mazzes", "Spreads", "Greens & Grains", "Meats & Seafood"] as const;
export type FoodCategory = typeof foodCategories[number];

export const foodLabels = ["Seasonal", "New", "ChefSpecial"] as const;
export type FoodLabel = typeof foodLabels[number];

export const insertFoodSchema = z.object({
  name: z.string().min(1),
  category: z.enum(foodCategories),
  priceCents: z.number().int().positive(),
  description: z.string().optional(),
});

export type InsertFood = z.infer<typeof insertFoodSchema>;

export interface Food extends InsertFood {
  id: string;
  outOfStock: boolean;
  labels: string[];
  updatedAt: string;
}

export interface FoodFilters {
  search?: string;
  category?: FoodCategory;
}

export const adminFoodUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.enum(foodCategories).optional(),
  priceCents: z.number().int().positive().optional(),
  description: z.string().max(1000).optional().nullable(),
  dietaryTags: z.array(z.string().max(50)).optional(),
}).strict();

export const adminFoodCreateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(foodCategories),
  priceCents: z.number().int().positive(),
  description: z.string().max(1000).optional().nullable(),
  dietaryTags: z.array(z.string().max(50)).optional(),
}).strict();
