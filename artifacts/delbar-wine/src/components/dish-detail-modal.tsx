import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Wine, Check, ChevronDown, ChevronRight, AlertTriangle, ArrowLeft } from "lucide-react";
import { tierColor, tierBarColor } from "@shared/calibrateMatch";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { wineTypeColors, wineTypeLabel } from "@/lib/wineTypeColors";
import type { Food } from "@shared/foodSchema";

interface PairingResult {
  wine: {
    id: string;
    name: string;
    wineType: string;
    varietal: string;
    priceCents: number;
    priceCategory: string;
  };
  score: number;
  matchScore: number;
  confidenceTier: string;
  confidenceLevel?: string;
  explanation: string;
  whyItWorks: string[];
  reasonHighlights?: { positive: string[]; negative?: string };
  avoidNote?: string;
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

interface DishProfile {
  protein: string;
  cookingMethod: string;
  dominantSauce: string;
  spiceLevel: number;
  richness: number;
  saltLevel: number;
  sweetness: number;
  acidity: number;
  isVegetarian: boolean;
}

interface DishDetailModalProps {
  food: Food | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectWine?: (wineId: string) => void;
  backLabel?: string;
  onBack?: () => void;
}

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

function InsightChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-muted/50 border border-border rounded-xl p-3 min-w-[72px]" data-testid={`chip-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize mt-0.5">{value}</span>
    </div>
  );
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "bg-olive" : pct >= 40 ? "bg-gold" : "bg-terracotta";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] tabular-nums w-7 text-right text-muted-foreground">{pct}%</span>
    </div>
  );
}

function inferTags(food: Food): string[] {
  const name = food.name.toLowerCase();
  const desc = (food.description || "").toLowerCase();
  const combined = name + " " + desc;
  const tags: string[] = [];

  if (combined.includes("spic") || combined.includes("harissa") || combined.includes("chili") || combined.includes("adana")) tags.push("spicy");
  if (combined.includes("cream") || combined.includes("cheese") || combined.includes("butter") || combined.includes("labneh")) tags.push("creamy");
  if (combined.includes("grill") || combined.includes("charred") || combined.includes("kebab")) tags.push("grilled");
  if (combined.includes("fried") || combined.includes("crisp")) tags.push("crispy");
  if (combined.includes("smoke") || combined.includes("smoked")) tags.push("smoky");
  if (combined.includes("herb") || combined.includes("za'atar") || combined.includes("parsley") || combined.includes("mint")) tags.push("herby");
  if (combined.includes("citrus") || combined.includes("lemon") || combined.includes("lime")) tags.push("citrusy");
  if (combined.includes("tahini")) tags.push("tahini");
  if (combined.includes("pomegranate")) tags.push("fruity");

  return tags.slice(0, 4);
}

function generatePairingLogic(food: Food, topPairing: PairingResult | undefined, profile: DishProfile | null): string {
  if (!topPairing || !profile) return "";

  const parts: string[] = [];
  const b = topPairing.breakdown;

  if (b.acidFat > 0.6 && profile.richness > 0.5) {
    parts.push(`This dish's richness calls for wines with bright acidity to cut through the weight`);
  }
  if (b.tanninProtein > 0.6 && ["beef", "lamb"].includes(profile.protein)) {
    parts.push(`the protein pairs naturally with structured tannins`);
  }
  if (b.spiceHandling > 0.6 && profile.spiceLevel > 0.4) {
    parts.push(`look for lower alcohol and a touch of sweetness to tame the spice`);
  }
  if (b.sauceMatch > 0.6 && profile.dominantSauce !== "none") {
    parts.push(`the ${profile.dominantSauce} sauce finds a natural complement in the wine's flavor profile`);
  }
  if (b.intensityMatch > 0.7) {
    parts.push(`intensity levels are well-matched so neither overpowers the other`);
  }

  if (parts.length === 0) {
    parts.push("A balanced pairing where the wine's character complements the dish's flavor profile");
  }

  const joined = parts.join("; ");
  return joined.charAt(0).toUpperCase() + joined.slice(1) + ".";
}

function extractVintage(name: string): string | null {
  const match = name.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

function PairingCard({
  pairing,
  onSelectWine,
}: {
  pairing: PairingResult;
  onSelectWine?: (wineId: string) => void;
}) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const { wine, score, matchScore, confidenceTier, whyItWorks, avoidNote, breakdown } = pairing;
  const vintage = extractVintage(wine.name);
  const tc = tierColor(confidenceTier as any);
  const bc = tierBarColor(confidenceTier as any);

  return (
    <div
      className={`bg-card rounded-2xl border border-border p-5 space-y-3 ${onSelectWine ? "cursor-pointer ui-lift-hover" : ""}`}
      data-testid={`dish-detail-pairing-${wine.id}`}
    >
      <div
        className="flex items-start justify-between gap-3"
        onClick={() => onSelectWine?.(wine.id)}
        role={onSelectWine ? "button" : undefined}
        tabIndex={onSelectWine ? 0 : undefined}
        aria-label={onSelectWine ? `View details for ${wine.name}` : undefined}
        onKeyDown={(e) => { if (onSelectWine && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSelectWine(wine.id); } }}
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold">{wine.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{wine.varietal}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className={`text-[10px] ${wineTypeColors[wine.wineType]}`}>
              {wineTypeLabel(wine.wineType)}
            </Badge>
            <span className="border border-gold/40 bg-gold/10 text-foreground px-2 py-0.5 rounded-full text-[10px] font-medium">
              {wine.priceCategory}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${tc}`}>{confidenceTier}</span>
          <span className={`text-lg font-bold tabular-nums ${tc}`}>{matchScore}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bc}`} style={{ width: `${matchScore}%` }} />
      </div>

      {whyItWorks.length > 0 && (
        <p className="text-xs text-muted-foreground leading-relaxed">{whyItWorks[0]}</p>
      )}

      {avoidNote && (
        <div className="flex items-start gap-1.5 text-xs bg-terracotta/10 border border-terracotta/25 rounded-xl p-3">
          <AlertTriangle className="h-3 w-3 text-terracotta mt-0.5 shrink-0" />
          <span className="text-terracotta">{avoidNote}</span>
        </div>
      )}

      <Collapsible open={breakdownOpen} onOpenChange={setBreakdownOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1 px-0 text-muted-foreground h-auto py-1"
            data-testid={`button-breakdown-${wine.id}`}
          >
            {breakdownOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="text-[10px] font-semibold uppercase tracking-wider">Score Breakdown</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
          <div className="space-y-1.5 pt-2 pb-1">
            <ScoreBar value={breakdown.intensityMatch} label="Intensity" />
            <ScoreBar value={breakdown.acidFat} label="Acid / Fat" />
            <ScoreBar value={breakdown.tanninProtein} label="Tannin / Protein" />
            <ScoreBar value={breakdown.spiceHandling} label="Spice" />
            <ScoreBar value={breakdown.sauceMatch} label="Sauce" />
            <ScoreBar value={breakdown.regionalBonus} label="Regional" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function DishDetailContent({
  food,
  onSelectWine,
}: {
  food: Food;
  onSelectWine?: (wineId: string) => void;
}) {
  const { data: glassPairings, isLoading: glassLoading } = useQuery<PairingResult[]>({
    queryKey: ["/api/foods", food.id, "pairings", "glass", "classic", "detail"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/foods/${food.id}/pairings?list=glass&mode=classic`);
      return res.json();
    },
  });

  const { data: bottlePairings, isLoading: bottleLoading } = useQuery<PairingResult[]>({
    queryKey: ["/api/foods", food.id, "pairings", "bottle", "classic", "detail"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/foods/${food.id}/pairings?list=bottle&mode=classic`);
      return res.json();
    },
  });

  const { data: dishProfile } = useQuery<DishProfile>({
    queryKey: ["/api/foods", food.id, "dish-profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/foods/${food.id}/dish-profile`);
      return res.json();
    },
  });

  const isLoadingPairings = glassLoading || bottleLoading;

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
    return deduped.slice(0, 3);
  }, [glassPairings, bottlePairings]);

  const tags = inferTags(food);

  const spiceLevelLabel = !dishProfile ? "Mild" :
    dishProfile.spiceLevel > 0.6 ? "Spicy" :
    dishProfile.spiceLevel > 0.3 ? "Medium" : "Mild";

  const richnessLabel = !dishProfile ? "Light" :
    dishProfile.richness > 0.6 ? "Rich" :
    dishProfile.richness > 0.3 ? "Medium" : "Light";

  const cookingLabel = dishProfile?.cookingMethod || "Other";

  const pairingLogic = generatePairingLogic(food, allPairings[0], dishProfile ?? null);

  return (
    <div className="overflow-y-auto max-h-[calc(90vh-220px)] px-6 pb-6 space-y-6 ui-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" data-testid="dish-insight-strip">
        {dishProfile && (
          <>
            <InsightChip label="Protein" value={dishProfile.protein === "none" ? "Vegetable" : dishProfile.protein} />
            <InsightChip label="Sauce" value={dishProfile.dominantSauce === "none" ? "Plain" : dishProfile.dominantSauce} />
            <InsightChip label="Spice" value={spiceLevelLabel} />
            <InsightChip label="Richness" value={richnessLabel} />
            <InsightChip label="Cooking" value={cookingLabel} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          {food.description && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground">Description</h4>
              <p className="text-sm leading-relaxed" data-testid="text-dish-detail-description">
                {food.description}
              </p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground">Flavor Profile</h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs capitalize rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {pairingLogic && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground">Chef's Pairing Logic</h4>
              <div className="border-l-2 border-olive/50 bg-muted/30 p-4 rounded-xl">
                <p className="text-sm leading-relaxed italic" data-testid="text-dish-pairing-logic">
                  {pairingLogic}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Wine className="h-3.5 w-3.5" />
            Top Pairings
          </h4>

          {isLoadingPairings ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : allPairings.length > 0 ? (
            <div className="space-y-3">
              {allPairings.map((pairing) => (
                <PairingCard
                  key={pairing.wine.id}
                  pairing={pairing}
                  onSelectWine={onSelectWine}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No wine pairings available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DishDetailModal({ food, open, onOpenChange, onSelectWine, backLabel, onBack }: DishDetailModalProps) {
  const isMobile = useIsMobile();

  if (!food) return null;

  const priceDisplay = `$${(food.priceCents / 100).toFixed(0)}`;
  const tags = inferTags(food);

  const headerContent = (
    <div className="bg-delbar-pattern px-6 pt-6 pb-5 border-b border-gold/30 relative">
      {backLabel && onBack && (
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground mb-3 hover:text-foreground transition-colors"
          onClick={onBack}
          aria-label={backLabel}
          data-testid="button-back-to-wine"
        >
          <ArrowLeft className="h-3 w-3" />
          {backLabel}
        </button>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          {isMobile ? (
            <DrawerTitle className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight break-words" data-testid="text-dish-detail-name">
              {food.name}
            </DrawerTitle>
          ) : (
            <DialogTitle className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight break-words" data-testid="text-dish-detail-name">
              {food.name}
            </DialogTitle>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className={`text-xs ${categoryColors[food.category] || "bg-muted"}`} data-testid="badge-dish-detail-category">
              {food.category}
            </Badge>
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] capitalize rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          <span className="text-xl font-bold tabular-nums" data-testid="text-dish-detail-price">{priceDisplay}</span>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] overflow-hidden" data-testid="dish-detail-modal">
          <DrawerHeader className="p-0">
            {headerContent}
          </DrawerHeader>
          <DishDetailContent food={food} onSelectWine={onSelectWine} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[860px] w-[94vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl border border-border bg-card shadow-lift"
        data-testid="dish-detail-modal"
      >
        <DialogDescription className="sr-only">Dish details and wine pairing recommendations</DialogDescription>
        <DialogHeader className="p-0">
          {headerContent}
        </DialogHeader>
        <DishDetailContent food={food} onSelectWine={onSelectWine} />
      </DialogContent>
    </Dialog>
  );
}
