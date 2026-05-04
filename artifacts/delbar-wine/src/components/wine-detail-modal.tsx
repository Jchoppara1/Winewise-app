import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Thermometer, Wine, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { tierColor, tierBarColor } from "@shared/calibrateMatch";
import { formatPrice } from "@shared/wineRules";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { wineTypeColors, wineTypeLabel } from "@/lib/wineTypeColors";
import { useState } from "react";

interface WineProfile {
  body: string;
  acidity: string;
  tannin: string;
  sweetness: string;
  oak: string;
  flavorNotes: string[];
  regionCues?: string[];
  grapes?: string[];
}

interface WineDescription {
  headline: string;
  aromas: [string, string, string];
  palate: [string, string, string];
  servingSuggestions: string[];
}

interface EnrichedWine {
  id: string;
  name: string;
  wineType: string;
  varietal: string;
  priceCents: number;
  priceCategory: string;
  description?: string | null;
  foodPairings: string[];
  profile?: WineProfile;
  wineDescription?: WineDescription;
}

interface FoodPairingResult {
  food: { id: string; name: string; category: string; priceCents: number };
  score: number;
  matchScore: number;
  confidenceTier: string;
  confidenceLevel?: string;
  explanation: string;
  whyItWorks: string[];
}

interface WineDetailModalProps {
  wine: EnrichedWine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGlassWine?: boolean;
  onSelectFood?: (foodId: string) => void;
  backLabel?: string;
  onBack?: () => void;
}

const categoryColors: Record<string, string> = {
  "Mazzes": "bg-gold/10 text-gold dark:bg-gold/20",
  "Spreads": "bg-olive/10 text-olive dark:bg-olive/20",
  "Greens & Grains": "bg-olive/15 text-olive dark:bg-olive/25",
  "Meats & Seafood": "bg-terracotta/10 text-terracotta dark:bg-terracotta/20",
};

function InsightChip({ label, value }: { label: string; value: string }) {
  if (!value || value === "none") return null;
  return (
    <div className="flex flex-col items-center justify-center bg-muted/50 border border-border rounded-xl p-3 min-w-[72px]" data-testid={`chip-${label.toLowerCase()}`}>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize mt-0.5">{value}</span>
    </div>
  );
}

function extractVintageAndClean(name: string): { displayName: string; vintage: string | null } {
  const match = name.match(/\b(19|20)\d{2}\b/);
  return { displayName: name, vintage: match ? match[0] : null };
}

function WineDetailContent({
  wine,
  isGlassWine,
  onSelectFood,
}: {
  wine: EnrichedWine;
  isGlassWine: boolean;
  onSelectFood?: (foodId: string) => void;
}) {
  const listType = isGlassWine ? "glass" : "bottle";

  const { data: pairings } = useQuery<FoodPairingResult[]>({
    queryKey: ["/api/wines", wine.id, "pairings", listType, "detail"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/wines/${wine.id}/pairings?list=${listType}&mode=classic`);
      return res.json();
    },
  });

  const profile = wine.profile;
  const desc = wine.wineDescription;
  const topPairings = pairings?.slice(0, 5) || [];

  const servingTemp = wine.wineType === "sparkling" ? "4-7°C (40-45°F)"
    : ["white", "rose", "orange"].includes(wine.wineType) ? "7-10°C (45-50°F)"
    : ["fortified", "dessert"].includes(wine.wineType) ? "10-14°C (50-57°F)"
    : profile?.body === "light" ? "12-14°C (54-57°F)"
    : "16-18°C (61-65°F)";

  const glassType = wine.wineType === "sparkling" ? "Flute or coupe"
    : ["white", "rose", "orange"].includes(wine.wineType) ? "Standard white wine glass"
    : wine.wineType === "fortified" ? "Small tulip or copita glass"
    : profile?.body === "full" ? "Large Bordeaux glass"
    : "Standard red wine glass";

  const guestLikes: string[] = [];
  if (desc) {
    if (desc.aromas[0]) guestLikes.push(desc.aromas[0]);
    if (desc.palate[0]) guestLikes.push(desc.palate[0]);
  }

  return (
    <div className="overflow-y-auto max-h-[calc(90vh-220px)] px-6 pb-6 space-y-6 ui-fade-in">
      {profile && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" data-testid="wine-insight-strip">
          <InsightChip label="Body" value={profile.body} />
          <InsightChip label="Acidity" value={profile.acidity} />
          {profile.tannin !== "none" && <InsightChip label="Tannin" value={profile.tannin} />}
          <InsightChip label="Sweetness" value={profile.sweetness} />
          {profile.oak !== "none" && <InsightChip label="Oak" value={profile.oak} />}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          {desc && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground">Tasting Notes</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Aroma</span>
                  <ul className="mt-1.5 space-y-1.5">
                    {desc.aromas.map((a, i) => (
                      <li key={i} className="text-sm flex items-start gap-2" data-testid={`wine-aroma-${i}`}>
                        <span className="text-gold mt-1.5 shrink-0">
                          <svg width="5" height="5"><circle cx="2.5" cy="2.5" r="2.5" fill="currentColor"/></svg>
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Palate</span>
                  <ul className="mt-1.5 space-y-1.5">
                    {desc.palate.map((p, i) => (
                      <li key={i} className="text-sm flex items-start gap-2" data-testid={`wine-palate-${i}`}>
                        <span className="text-gold mt-1.5 shrink-0">
                          <svg width="5" height="5"><circle cx="2.5" cy="2.5" r="2.5" fill="currentColor"/></svg>
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {profile && profile.flavorNotes.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground">Flavor Notes</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.flavorNotes.map((note) => (
                  <Badge key={note} variant="outline" className="text-xs capitalize rounded-full">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <h4 className="text-sm uppercase tracking-widest text-muted-foreground">Serving</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span data-testid="text-wine-detail-temp">{servingTemp}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wine className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{glassType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {topPairings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Pairs Best With
              </h4>
              <div className="space-y-3">
                {topPairings.map(({ food, score, matchScore, confidenceTier, explanation }) => {
                  const tc = tierColor(confidenceTier as any);
                  const bc = tierBarColor(confidenceTier as any);
                  return (
                  <div
                    key={food.id}
                    className={`bg-card rounded-2xl border border-border p-5 space-y-2 ${onSelectFood ? "cursor-pointer ui-lift-hover" : ""}`}
                    onClick={() => onSelectFood?.(food.id)}
                    role={onSelectFood ? "button" : undefined}
                    tabIndex={onSelectFood ? 0 : undefined}
                    aria-label={onSelectFood ? `View details for ${food.name}` : undefined}
                    onKeyDown={(e) => { if (onSelectFood && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSelectFood(food.id); } }}
                    data-testid={`wine-detail-pairing-${food.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="text-sm font-semibold line-clamp-1">{food.name.replace(" (GF)", "")}</span>
                        <Badge className={`text-[10px] ${categoryColors[food.category] || "bg-muted"}`}>
                          {food.category}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${tc}`} data-testid={`text-pairing-tier-${food.id}`}>{confidenceTier}</span>
                        <span className={`text-sm font-bold tabular-nums ${tc}`}>{matchScore}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bc}`} style={{ width: `${matchScore}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{explanation}</p>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {guestLikes.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground">Why Guests Like It</h4>
              <ul className="space-y-2">
                {guestLikes.map((like, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2" data-testid={`wine-guest-like-${i}`}>
                    <span className="text-gold mt-1.5 shrink-0">
                      <svg width="5" height="5"><circle cx="2.5" cy="2.5" r="2.5" fill="currentColor"/></svg>
                    </span>
                    {like}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WineDetailModal({ wine, open, onOpenChange, isGlassWine = false, onSelectFood, backLabel, onBack }: WineDetailModalProps) {
  const isMobile = useIsMobile();

  if (!wine) return null;

  const desc = wine.wineDescription;
  const profile = wine.profile;
  const { vintage } = extractVintageAndClean(wine.name);
  const regionStr = profile?.regionCues?.join(", ");
  const grapesStr = profile?.grapes?.join(", ") || wine.varietal;

  const subtitleParts: string[] = [];
  if (regionStr) subtitleParts.push(regionStr);
  if (grapesStr) subtitleParts.push(grapesStr);
  if (vintage) subtitleParts.push(vintage);

  const headerContent = (
    <div className="bg-delbar-pattern px-6 pt-6 pb-5 border-b border-gold/30 relative">
      {backLabel && onBack && (
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground mb-3 hover:text-foreground transition-colors"
          onClick={onBack}
          aria-label={backLabel}
          data-testid="button-back-to-dish"
        >
          <ArrowLeft className="h-3 w-3" />
          {backLabel}
        </button>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          {isMobile ? (
            <DrawerTitle className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight break-words" data-testid="text-wine-detail-name">
              {wine.name}
            </DrawerTitle>
          ) : (
            <DialogTitle className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight break-words" data-testid="text-wine-detail-name">
              {wine.name}
            </DialogTitle>
          )}
          {subtitleParts.length > 0 && (
            <p className="text-sm text-muted-foreground" data-testid="text-wine-detail-subtitle">
              {subtitleParts.join(" \u00b7 ")}
            </p>
          )}
          {desc?.headline && (
            <p className="text-sm text-muted-foreground italic">{desc.headline}</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <Badge className={`text-xs ${wineTypeColors[wine.wineType]}`} data-testid="badge-wine-detail-type">
              {wineTypeLabel(wine.wineType)}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          <span className="border border-gold/40 bg-gold/10 text-foreground px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-wine-detail-tier">
            {wine.priceCategory}
          </span>
          <span className="text-sm font-semibold tabular-nums" data-testid="badge-wine-detail-price">
            {formatPrice(wine.priceCents)}
          </span>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] overflow-hidden" data-testid="wine-detail-modal">
          <DrawerHeader className="p-0">
            {headerContent}
          </DrawerHeader>
          <WineDetailContent wine={wine} isGlassWine={isGlassWine} onSelectFood={onSelectFood} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[860px] w-[94vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl border border-border bg-card shadow-lift"
        data-testid="wine-detail-modal"
      >
        <DialogDescription className="sr-only">Wine details and food pairing recommendations</DialogDescription>
        <DialogHeader className="p-0">
          {headerContent}
        </DialogHeader>
        <WineDetailContent wine={wine} isGlassWine={isGlassWine} onSelectFood={onSelectFood} />
      </DialogContent>
    </Dialog>
  );
}
