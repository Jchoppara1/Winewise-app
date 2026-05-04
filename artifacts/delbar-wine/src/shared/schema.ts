import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { WINE_TYPE_KEYS, type WineTypeKey, type WineClassification } from "./wineTypes";

export const wineTypes = WINE_TYPE_KEYS;
export type WineType = WineTypeKey;

export const priceCategories = ["$", "$$", "$$$", "$$$$"] as const;
export type PriceCategory = typeof priceCategories[number];

export const foodPairingOptions = [
  "Beef",
  "Lamb",
  "Poultry",
  "Seafood",
  "Fish",
  "Pasta",
  "Cheese",
  "Salads",
  "Desserts",
  "Spicy Food",
  "Appetizers",
] as const;
export type FoodPairing = typeof foodPairingOptions[number];

export const wineLabels = ["Featured", "New", "ByTheGlass", "Reserve"] as const;
export type WineLabel = typeof wineLabels[number];

export const wineClassificationSchema = z.object({
  typePrimary: z.enum(wineTypes),
  typeSecondary: z.array(z.enum(wineTypes)),
  confidence: z.number(),
  reasons: z.array(z.string()),
});

export const wines = pgTable("wines", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  wineType: varchar("wine_type", { length: 20 }).notNull(),
  varietal: text("varietal").notNull(),
  priceCents: integer("price_cents").notNull(),
  description: text("description"),
  classification: jsonb("classification"),
  priceCategory: varchar("price_category", { length: 10 }).notNull(),
  foodPairings: text("food_pairings").array().notNull(),
  outOfStock: boolean("out_of_stock").default(false).notNull(),
  labels: text("labels").array().default([]).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWineSchema = createInsertSchema(wines)
  .omit({ id: true, classification: true, priceCategory: true, foodPairings: true, outOfStock: true, labels: true, updatedAt: true })
  .extend({
    name: z.string().min(1, "Name is required").max(200),
    wineType: z.enum(wineTypes),
    varietal: z.string().min(1, "Varietal is required").max(100),
    priceCents: z.number().int().min(0, "Price must be positive"),
    description: z.string().max(1000).optional(),
  });

export type InsertWine = z.infer<typeof insertWineSchema>;
export type Wine = typeof wines.$inferSelect & { classification: WineClassification | null };

export const adminWineUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  wineType: z.enum(wineTypes).optional(),
  varietal: z.string().min(1).max(100).optional(),
  priceCents: z.number().int().min(0).optional(),
  description: z.string().max(1000).optional().nullable(),
  producer: z.string().max(200).optional().nullable(),
  vintage: z.string().max(10).optional().nullable(),
  region: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).strict();

export const adminWineCreateSchema = z.object({
  name: z.string().min(1).max(200),
  wineType: z.enum(wineTypes),
  varietal: z.string().min(1).max(100),
  priceCents: z.number().int().min(0),
  description: z.string().max(1000).optional().nullable(),
  producer: z.string().max(200).optional().nullable(),
  vintage: z.string().max(10).optional().nullable(),
  region: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).strict();

export const wineFiltersSchema = z.object({
  search: z.string().optional(),
  wineType: z.enum(wineTypes).optional(),
  priceCategory: z.enum(priceCategories).optional(),
  foodPairing: z.enum(foodPairingOptions).optional(),
});

export type WineFilters = z.infer<typeof wineFiltersSchema>;

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
