import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronDown, ChevronRight, Flame, Droplets, Check, Wine, UtensilsCrossed, Beef, Fish, Leaf, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Food, FoodCategory } from "@shared/foodSchema";
import { tierColor, tierBarColor } from "@shared/calibrateMatch";
import { wineTypeColors, wineTypeLabel, WINE_TYPES, type WineTypeKey } from "@/lib/wineTypeColors";

interface PairingResult {
  wine: {
    id: string;
    name: string;
    wineType: string;
    varietal: string;
    priceCents: number;
    priceCategory: string;
    description?: string;
  };
  score: number;
  matchScore: number;
  confidenceTier: string;
  confidenceLevel?: string;
  explanation: string;
  whyItWorks: string[];
  reasonHighlights?: { positive: string[]; negative?: string };
  breakdown: {
    intensityMatch: number;
    acidFat: number;
    tanninProtein: number;
    spiceHandling: number;
    sauceMatch: number;
    regionalBonus: number;
    total: number;
  };
}

interface WineProfileData {
  profile: {
    color: string;
    body: string;
    acidity: string;
    tannin: string;
    sweetness: string;
    oak: string;
    flavorNotes: string[];
    regionCues: string[];
    grapes: string[];
  };
  description: {
    headline: string;
    aromas: string[];
    palate: string[];
    structure: Record<string, string>;
  };
}

const foodCategories: FoodCategory[] = ["Mazzes", "Spreads", "Greens & Grains", "Meats & Seafood"];

const categoryColors: Record<string, string> = {
  "Mazzes": "bg-gold/10 text-gold dark:bg-gold/20",
  "Spreads": "bg-olive/10 text-olive dark:bg-olive/20",
  "Greens & Grains": "bg-olive/15 text-olive dark:bg-olive/25",
  "Meats & Seafood": "bg-terracotta/10 text-terracotta dark:bg-terracotta/20",
};

const priceCategoryColors: Record<string, string> = {
  "$": "bg-olive/10 text-olive dark:bg-olive/20 dark:text-olive",
  "$$": "bg-secondary text-secondary-foreground",
  "$$$": "bg-gold/10 text-gold dark:bg-gold/20",
  "$$$$": "bg-gold/15 text-gold dark:bg-gold/25 border border-gold/30",
};

type DishFilter = "vegetarian" | "spicy" | "seafood" | "red_meat";
type WineColorFilter = WineTypeKey;

function inferDishTraits(food: Food) {
  const name = food.name.toLowerCase();
  const desc = (food.description || "").toLowerCase();
  const combined = name + " " + desc;
  const cat = food.category;

  let isVegetarian = cat !== "Meats & Seafood";
  let isSeafood = false;
  let isRedMeat = false;
  let isSpicy = false;

  if (cat === "Meats & Seafood") {
    if (combined.includes("shrimp") || combined.includes("fish") || combined.includes("seafood") || combined.includes("calamari") || combined.includes("prawns")) {
      isSeafood = true;
    } else {
      isRedMeat = combined.includes("lamb") || combined.includes("beef") || combined.includes("steak") || combined.includes("kofta") || combined.includes("adana");
    }
  }

  if (combined.includes("spic") || combined.includes("harissa") || combined.includes("chili") || combined.includes("adana") || combined.includes("hot")) {
    isSpicy = true;
  }

  let spiceLevel: "Mild" | "Medium" | "Spicy" = "Mild";
  if (isSpicy) spiceLevel = "Spicy";
  else if (combined.includes("cumin") || combined.includes("sumac") || combined.includes("za'atar") || combined.includes("herbs")) spiceLevel = "Medium";

  let richness: "Light" | "Medium" | "Rich" = "Light";
  if (cat === "Meats & Seafood" || combined.includes("cream") || combined.includes("cheese") || combined.includes("butter")) richness = "Rich";
  else if (cat === "Spreads" || combined.includes("olive oil") || combined.includes("tahini")) richness = "Medium";

  return { isVegetarian, isSeafood, isRedMeat, isSpicy, spiceLevel, richness };
}

function extractVintage(name: string): { baseName: string; vintage: string | null } {
  const match = name.match(/\b(19|20)\d{2}\b/);
  return { baseName: name, vintage: match ? match[0] : null };
}

function extractRegion(description?: string): string | null {
  if (!description) return null;
  const match = description.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

function DishListItem({
  food,
  isSelected,
  onClick,
}: {
  food: Food;
  isSelected: boolean;
  onClick: () => void;
}) {
  const traits = inferDishTraits(food);
  const priceDisplay = `$${(food.priceCents / 100).toFixed(0)}`;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md cursor-pointer ui-transition ${
        isSelected
          ? "bg-accent"
          : "hover:bg-muted/40"
      }`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }}}
      role="button"
      tabIndex={0}
      data-testid={`dish-item-${food.id}`}
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight line-clamp-1" data-testid={`text-dish-name-${food.id}`}>
            {food.name}
          </h3>
          <span className="text-sm font-semibold tabular-nums shrink-0 text-muted-foreground">{priceDisplay}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={`text-xs ${categoryColors[food.category] || "bg-muted"}`} data-testid={`badge-dish-category-${food.id}`}>
            {food.category}
          </Badge>
          {traits.spiceLevel !== "Mild" && (
            <Badge variant="outline" className="text-xs gap-0.5" data-testid={`badge-dish-spice-${food.id}`}>
              <Flame className="h-3 w-3" />
              {traits.spiceLevel}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs" data-testid={`badge-dish-richness-${food.id}`}>
            {traits.richness}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function PairingWineCard({
  pairing,
  wineColorFilter,
}: {
  pairing: PairingResult;
  wineColorFilter: WineColorFilter | null;
}) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [tastingOpen, setTastingOpen] = useState(false);

  const { wine, score, matchScore, confidenceTier, whyItWorks } = pairing;

  const { data: profileData } = useQuery<WineProfileData>({
    queryKey: ["/api/wines", wine.id, "profile", "bottle"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/wines/${wine.id}/profile?list=bottle`);
      return res.json();
    },
  });

  if (wineColorFilter) {
    const cls = (wine as any).classification;
    const matchesPrimary = cls?.typePrimary === wineColorFilter;
    const matchesSecondary = cls?.typeSecondary?.includes(wineColorFilter);
    const matchesFallback = wine.wineType === wineColorFilter;
    if (!matchesPrimary && !matchesSecondary && !matchesFallback) return null;
  }

  const { vintage } = extractVintage(wine.name);
  const region = extractRegion(wine.description || "") || (profileData?.profile?.regionCues?.[0] ?? null);
  const grapes = profileData?.profile?.grapes || [wine.varietal];
  const profile = profileData?.profile;
  const desc = profileData?.description;

  const styleBadges: string[] = [];
  if (profile) {
    if (profile.sweetness && profile.sweetness !== "none") styleBadges.push(profile.sweetness);
    if (profile.acidity && profile.acidity !== "none") styleBadges.push(`${profile.acidity} acid`);
    if (profile.body && profile.body !== "none") styleBadges.push(`${profile.body} body`);
    if (profile.tannin && profile.tannin !== "none") styleBadges.push(`${profile.tannin} tannin`);
    if (profile.oak && profile.oak !== "none") styleBadges.push(`${profile.oak} oak`);
  }

  return (
    <Card className="overflow-visible" data-testid={`pairing-card-${wine.id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-semibold text-sm leading-tight line-clamp-1" data-testid={`text-pairing-wine-name-${wine.id}`}>
                {wine.name}
              </h4>
              {vintage && (
                <span className="text-xs text-muted-foreground shrink-0">{vintage}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {region && (
                <span className="text-xs text-muted-foreground">{region}</span>
              )}
              {region && grapes.length > 0 && <span className="text-xs text-muted-foreground">·</span>}
              {grapes.length > 0 && (
                <span className="text-xs text-muted-foreground line-clamp-1">{grapes.join(", ")}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${tierColor(confidenceTier as any)}`} data-testid={`text-pairing-tier-${wine.id}`}>{confidenceTier}</span>
            <span className={`text-lg font-bold tabular-nums ${tierColor(confidenceTier as any)}`} data-testid={`text-pairing-score-${wine.id}`}>
              {matchScore}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={`text-xs ${wineTypeColors[wine.wineType]}`} data-testid={`badge-pairing-type-${wine.id}`}>
            {wineTypeLabel(wine.wineType)}
          </Badge>
          <Badge className={`text-xs ${priceCategoryColors[wine.priceCategory]}`} data-testid={`badge-pairing-price-${wine.id}`}>
            {wine.priceCategory}
          </Badge>
          {styleBadges.slice(0, 4).map((badge) => (
            <Badge key={badge} variant="outline" className="text-xs capitalize">
              {badge}
            </Badge>
          ))}
        </div>

        <Collapsible open={whyOpen} onOpenChange={setWhyOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-1.5 px-0 text-muted-foreground"
              data-testid={`button-why-${wine.id}`}
            >
              {whyOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span className="text-xs font-medium uppercase tracking-wide">Why it works</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
            <div className="space-y-1 pb-1">
              {whyItWorks.slice(0, 2).map((reason, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs">
                  <Check className="h-3 w-3 text-olive mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{reason}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {desc && (
          <Collapsible open={tastingOpen} onOpenChange={setTastingOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-1.5 px-0 text-muted-foreground"
                data-testid={`button-tasting-${wine.id}`}
              >
                {tastingOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span className="text-xs font-medium uppercase tracking-wide">Tasting notes</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
              <div className="space-y-2 pb-1">
                {desc.aromas && desc.aromas.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Aroma</span>
                    <ul className="mt-0.5 space-y-0.5">
                      {desc.aromas.map((a: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-1 shrink-0">
                            <svg width="5" height="5"><circle cx="2.5" cy="2.5" r="2.5" fill="currentColor"/></svg>
                          </span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {desc.palate && desc.palate.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Palate</span>
                    <ul className="mt-0.5 space-y-0.5">
                      {desc.palate.map((p: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-1 shrink-0">
                            <svg width="5" height="5"><circle cx="2.5" cy="2.5" r="2.5" fill="currentColor"/></svg>
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

interface DishFiltersState {
  search: string;
  traits: Set<DishFilter>;
}

function dishFiltersEqual(a: DishFiltersState, b: DishFiltersState): boolean {
  if (a.search !== b.search) return false;
  if (a.traits.size !== b.traits.size) return false;
  for (const t of a.traits) {
    if (!b.traits.has(t)) return false;
  }
  return true;
}

const defaultDishFilters = (): DishFiltersState => ({ search: "", traits: new Set() });

function DishFiltersBar({
  draftFilters,
  appliedFilters,
  onToggle,
  onSearchChange,
  onApply,
  onReset,
}: {
  draftFilters: DishFiltersState;
  appliedFilters: DishFiltersState;
  onToggle: (f: DishFilter) => void;
  onSearchChange: (s: string) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const filters: { key: DishFilter; label: string; icon: typeof Leaf }[] = [
    { key: "vegetarian", label: "Vegetarian", icon: Leaf },
    { key: "spicy", label: "Spicy", icon: Flame },
    { key: "seafood", label: "Seafood", icon: Fish },
    { key: "red_meat", label: "Red Meat", icon: Beef },
  ];

  const hasUnsavedChanges = !dishFiltersEqual(draftFilters, appliedFilters);
  const hasDraftValues = draftFilters.search.trim() !== "" || draftFilters.traits.size > 0;
  const hasAppliedValues = appliedFilters.search.trim() !== "" || appliedFilters.traits.size > 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search dishes..."
          value={draftFilters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          data-testid="input-dish-search"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={draftFilters.traits.has(key) ? "default" : "outline"}
            size="sm"
            className={`gap-1 text-xs toggle-elevate ${draftFilters.traits.has(key) ? "toggle-elevated" : ""}`}
            onClick={() => onToggle(key)}
            data-testid={`filter-${key}`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </Button>
        ))}
      </div>

      {hasUnsavedChanges && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400" data-testid="text-dish-unsaved-changes">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Unsaved changes
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onApply}
          disabled={!hasUnsavedChanges}
          className="flex-1"
          data-testid="button-apply-dish-filters"
        >
          Apply Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!hasDraftValues && !hasAppliedValues}
          className="flex-1"
          data-testid="button-reset-dish-filters"
        >
          <X className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}

interface WinePairingFiltersState {
  search: string;
  colorFilter: WineColorFilter | null;
}

function winePairingFiltersEqual(a: WinePairingFiltersState, b: WinePairingFiltersState): boolean {
  return a.search === b.search && a.colorFilter === b.colorFilter;
}

const defaultWinePairingFilters = (): WinePairingFiltersState => ({ search: "", colorFilter: null });

function WineColorFilterBar({
  activeColor,
  onChange,
}: {
  activeColor: WineColorFilter | null;
  onChange: (c: WineColorFilter | null) => void;
}) {
  const colors: WineColorFilter[] = WINE_TYPES.map(t => t.key);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {colors.map((color) => (
        <Button
          key={color}
          variant={activeColor === color ? "default" : "outline"}
          size="sm"
          className={`text-xs toggle-elevate ${activeColor === color ? "toggle-elevated" : ""}`}
          onClick={() => onChange(activeColor === color ? null : color)}
          data-testid={`filter-wine-color-${color.toLowerCase()}`}
        >
          {wineTypeLabel(color)}
        </Button>
      ))}
    </div>
  );
}

function PairingDetailPane({
  food,
  draftWineFilters,
  appliedWineFilters,
  onDraftSearchChange,
  onDraftColorChange,
  onApply,
  onReset,
}: {
  food: Food;
  draftWineFilters: WinePairingFiltersState;
  appliedWineFilters: WinePairingFiltersState;
  onDraftSearchChange: (s: string) => void;
  onDraftColorChange: (c: WineColorFilter | null) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const { data: bottlePairings, isLoading: bottleLoading } = useQuery<PairingResult[]>({
    queryKey: ["/api/foods", food.id, "pairings", "bottle", "classic"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/foods/${food.id}/pairings?list=bottle&mode=classic`);
      return res.json();
    },
  });

  const { data: glassPairings, isLoading: glassLoading } = useQuery<PairingResult[]>({
    queryKey: ["/api/foods", food.id, "pairings", "glass", "classic"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/foods/${food.id}/pairings?list=glass&mode=classic`);
      return res.json();
    },
  });

  const isLoading = bottleLoading || glassLoading;

  const allPairings = useMemo(() => {
    const combined = [
      ...(glassPairings || []),
      ...(bottlePairings || []),
    ].sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const deduped: PairingResult[] = [];
    for (const p of combined) {
      if (!seen.has(p.wine.id)) {
        seen.add(p.wine.id);
        deduped.push(p);
      }
    }
    return deduped;
  }, [bottlePairings, glassPairings]);

  const filteredPairings = useMemo(() => {
    let results = allPairings;

    if (appliedWineFilters.search.trim()) {
      const q = appliedWineFilters.search.toLowerCase();
      results = results.filter(p =>
        p.wine.name.toLowerCase().includes(q) ||
        p.wine.varietal.toLowerCase().includes(q)
      );
    }

    if (appliedWineFilters.colorFilter) {
      results = results.filter(p => {
        const cls = (p.wine as any).classification;
        return cls?.typePrimary === appliedWineFilters.colorFilter ||
          cls?.typeSecondary?.includes(appliedWineFilters.colorFilter) ||
          p.wine.wineType === appliedWineFilters.colorFilter;
      });
    }

    return results.slice(0, 3);
  }, [allPairings, appliedWineFilters]);

  const hasUnsavedChanges = !winePairingFiltersEqual(draftWineFilters, appliedWineFilters);
  const hasDraftValues = draftWineFilters.search.trim() !== "" || draftWineFilters.colorFilter !== null;
  const hasAppliedValues = appliedWineFilters.search.trim() !== "" || appliedWineFilters.colorFilter !== null;

  const traits = inferDishTraits(food);
  const priceDisplay = `$${(food.priceCents / 100).toFixed(0)}`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold leading-tight line-clamp-2" data-testid="text-selected-dish-name">
            {food.name}
          </h2>
          <span className="text-lg font-bold tabular-nums shrink-0" data-testid="text-selected-dish-price">
            {priceDisplay}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={`text-xs ${categoryColors[food.category] || "bg-muted"}`}>
            {food.category}
          </Badge>
          {traits.spiceLevel !== "Mild" && (
            <Badge variant="outline" className="text-xs gap-0.5">
              <Flame className="h-3 w-3" />
              {traits.spiceLevel}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {traits.richness}
          </Badge>
          {traits.isVegetarian && (
            <Badge variant="outline" className="text-xs gap-0.5">
              <Leaf className="h-3 w-3" />
              Vegetarian
            </Badge>
          )}
        </div>
        {food.description && (
          <p className="text-sm text-muted-foreground">{food.description}</p>
        )}
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Wine className="h-3.5 w-3.5" />
          Wine Pairings
        </h3>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search wines..."
            value={draftWineFilters.search}
            onChange={(e) => onDraftSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-wine-search"
          />
        </div>

        <WineColorFilterBar activeColor={draftWineFilters.colorFilter} onChange={onDraftColorChange} />

        {hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400" data-testid="text-wine-unsaved-changes">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onApply}
            disabled={!hasUnsavedChanges}
            className="flex-1"
            data-testid="button-apply-wine-filters"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasDraftValues && !hasAppliedValues}
            className="flex-1"
            data-testid="button-reset-wine-filters"
          >
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-md" />
            ))}
          </div>
        ) : filteredPairings.length > 0 ? (
          <div className="space-y-3">
            {filteredPairings.map((pairing) => (
              <PairingWineCard
                key={pairing.wine.id}
                pairing={pairing}
                wineColorFilter={null}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No matching wine pairings found.</p>
            {(appliedWineFilters.search || appliedWineFilters.colorFilter) && (
              <p className="text-xs mt-1">Try adjusting your search or filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FoodMenu() {
  const [draftDishFilters, setDraftDishFilters] = useState<DishFiltersState>(defaultDishFilters);
  const [appliedDishFilters, setAppliedDishFilters] = useState<DishFiltersState>(defaultDishFilters);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [draftWineFilters, setDraftWineFilters] = useState<WinePairingFiltersState>(defaultWinePairingFilters);
  const [appliedWineFilters, setAppliedWineFilters] = useState<WinePairingFiltersState>(defaultWinePairingFilters);

  const isMobile = useIsMobile();

  const { data: foods, isLoading } = useQuery<Food[]>({
    queryKey: ["/api/foods"],
  });

  const toggleDishFilter = useCallback((f: DishFilter) => {
    setDraftDishFilters((prev) => {
      const next = new Set(prev.traits);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return { ...prev, traits: next };
    });
  }, []);

  const handleApplyDishFilters = useCallback(() => {
    setAppliedDishFilters({ search: draftDishFilters.search, traits: new Set(draftDishFilters.traits) });
  }, [draftDishFilters]);

  const handleResetDishFilters = useCallback(() => {
    setDraftDishFilters(defaultDishFilters());
    setAppliedDishFilters(defaultDishFilters());
  }, []);

  const handleApplyWineFilters = useCallback(() => {
    setAppliedWineFilters({ ...draftWineFilters });
  }, [draftWineFilters]);

  const handleResetWineFilters = useCallback(() => {
    setDraftWineFilters(defaultWinePairingFilters());
    setAppliedWineFilters(defaultWinePairingFilters());
  }, []);

  const filteredFoods = useMemo(() => {
    if (!foods) return [];

    return foods.filter((food) => {
      if (appliedDishFilters.search.trim()) {
        const q = appliedDishFilters.search.toLowerCase();
        if (!food.name.toLowerCase().includes(q) &&
            !(food.description || "").toLowerCase().includes(q)) {
          return false;
        }
      }

      if (appliedDishFilters.traits.size > 0) {
        const traits = inferDishTraits(food);
        if (appliedDishFilters.traits.has("vegetarian") && !traits.isVegetarian) return false;
        if (appliedDishFilters.traits.has("spicy") && !traits.isSpicy) return false;
        if (appliedDishFilters.traits.has("seafood") && !traits.isSeafood) return false;
        if (appliedDishFilters.traits.has("red_meat") && !traits.isRedMeat) return false;
      }

      return true;
    });
  }, [foods, appliedDishFilters]);

  const groupedFoods = useMemo(() => {
    return foodCategories.reduce((acc, cat) => {
      acc[cat] = filteredFoods.filter(f => f.category === cat);
      return acc;
    }, {} as Record<FoodCategory, Food[]>);
  }, [filteredFoods]);

  const handleSelectFood = useCallback((food: Food) => {
    setSelectedFood(food);
    setDraftWineFilters(defaultWinePairingFilters());
    setAppliedWineFilters(defaultWinePairingFilters());
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-food-menu-title">
          <UtensilsCrossed className="h-6 w-6" />
          Wine Pairings
        </h1>
        <p className="text-sm text-muted-foreground">Select a dish to discover its best wine matches</p>
      </div>

      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className={`${isMobile ? "w-full" : "w-[380px]"} shrink-0 space-y-3`}>
          <DishFiltersBar
            draftFilters={draftDishFilters}
            appliedFilters={appliedDishFilters}
            onToggle={toggleDishFilter}
            onSearchChange={(s) => setDraftDishFilters((prev) => ({ ...prev, search: s }))}
            onApply={handleApplyDishFilters}
            onReset={handleResetDishFilters}
          />

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <div className={`${isMobile ? "" : "max-h-[calc(100vh-220px)]"} overflow-y-auto pr-1`} data-testid="dish-list">
              {foodCategories.map((cat) => {
                const items = groupedFoods[cat];
                if (items.length === 0) return null;

                return (
                  <div key={cat} className="mb-4">
                    <h3
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 px-3"
                      data-testid={`text-category-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {cat}
                    </h3>
                    <div className="space-y-0.5">
                      {items.map((food) => (
                        <DishListItem
                          key={food.id}
                          food={food}
                          isSelected={selectedFood?.id === food.id}
                          onClick={() => handleSelectFood(food)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredFoods.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No dishes match your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {selectedFood ? (
            <div className={`${isMobile ? "" : "sticky top-20 z-30"}`}>
              <Card>
                <CardContent className="p-5">
                  <PairingDetailPane
                    food={selectedFood}
                    draftWineFilters={draftWineFilters}
                    appliedWineFilters={appliedWineFilters}
                    onDraftSearchChange={(s) => setDraftWineFilters((prev) => ({ ...prev, search: s }))}
                    onDraftColorChange={(c) => setDraftWineFilters((prev) => ({ ...prev, colorFilter: c }))}
                    onApply={handleApplyWineFilters}
                    onReset={handleResetWineFilters}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-pairing-state">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Wine className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Select a Dish</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Choose a dish from the list to see its top wine pairings with detailed tasting notes and explanations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
