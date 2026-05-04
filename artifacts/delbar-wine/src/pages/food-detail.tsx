import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Wine, Sparkles, BookOpen, Check } from "lucide-react";
import { tierColor, tierBarColor } from "@shared/calibrateMatch";
import type { Food } from "@shared/foodSchema";
import type { Wine as WineType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { wineTypeColors, wineTypeLabel } from "@/lib/wineTypeColors";

interface PairingResult {
  wine: WineType;
  score: number;
  matchScore: number;
  confidenceTier: string;
  confidenceLevel?: string;
  explanation: string;
  whyItWorks: string[];
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

const categoryColors: Record<string, string> = {
  "Mazzes": "bg-gold/10 text-gold dark:bg-gold/20",
  "Spreads": "bg-olive/10 text-olive dark:bg-olive/20",
  "Greens & Grains": "bg-olive/15 text-olive dark:bg-olive/25",
  "Meats & Seafood": "bg-terracotta/10 text-terracotta dark:bg-terracotta/20",
};

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "bg-olive" : pct >= 40 ? "bg-gold" : "bg-terracotta";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums w-8 text-right text-muted-foreground">{pct}%</span>
    </div>
  );
}

function PairingCard({ pairing, listLabel }: { pairing: PairingResult; listLabel: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const { matchScore, confidenceTier } = pairing;
  const tc = tierColor(confidenceTier as any);
  const bc = tierBarColor(confidenceTier as any);

  return (
    <Card
      className="overflow-visible"
      data-testid={`card-pairing-${pairing.wine.id}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="font-semibold"
                data-testid={`text-pairing-name-${pairing.wine.id}`}
              >
                {pairing.wine.name}
              </h3>
              <Badge className={wineTypeColors[pairing.wine.wineType]} data-testid={`badge-pairing-type-${pairing.wine.id}`}>
                {wineTypeLabel(pairing.wine.wineType)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {listLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{pairing.wine.varietal}</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${tc}`} data-testid={`text-pairing-tier-${pairing.wine.id}`}>{confidenceTier}</span>
            <span className={`text-lg font-bold tabular-nums ${tc}`} data-testid={`text-pairing-score-${pairing.wine.id}`}>
              {matchScore}%
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`text-pairing-price-${pairing.wine.id}`}>
              ${(pairing.wine.priceCents / 100).toFixed(0)}
            </span>
          </div>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${bc}`} style={{ width: `${matchScore}%` }} />
        </div>

        <p className="text-sm text-muted-foreground" data-testid={`text-pairing-explanation-${pairing.wine.id}`}>
          {pairing.explanation}
        </p>

        {pairing.whyItWorks.length > 0 && (
          <div className="space-y-1">
            {pairing.whyItWorks.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-olive mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{reason}</span>
              </div>
            ))}
          </div>
        )}

        {pairing.avoidNote && (
          <p className="text-xs text-terracotta">
            Note: {pairing.avoidNote}
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          data-testid={`button-toggle-details-${pairing.wine.id}`}
        >
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          {showDetails ? "Hide" : "Show"} Score Breakdown
        </Button>

        {showDetails && (
          <div className="space-y-2 pt-2 border-t">
            <ScoreBar value={pairing.breakdown.intensityMatch} label="Intensity" />
            <ScoreBar value={pairing.breakdown.acidFat} label="Acid / Fat" />
            <ScoreBar value={pairing.breakdown.tanninProtein} label="Tannin / Protein" />
            <ScoreBar value={pairing.breakdown.spiceHandling} label="Spice" />
            <ScoreBar value={pairing.breakdown.sauceMatch} label="Sauce" />
            <ScoreBar value={pairing.breakdown.regionalBonus} label="Regional" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FoodDetail() {
  const [, params] = useRoute("/food/:id");
  const foodId = params?.id;
  const [mode, setMode] = useState<"classic" | "adventurous">("classic");

  const { data: food, isLoading: foodLoading } = useQuery<Food>({
    queryKey: ["/api/foods", foodId],
    enabled: !!foodId,
  });

  const { data: glassPairings, isLoading: glassLoading, isFetching: glassFetching } = useQuery<PairingResult[]>({
    queryKey: ["/api/foods", foodId, "pairings", "glass", mode],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/foods/${foodId}/pairings?list=glass&mode=${mode}`);
      return res.json();
    },
    enabled: !!foodId,
  });

  const { data: bottlePairings, isLoading: bottleLoading, isFetching: bottleFetching } = useQuery<PairingResult[]>({
    queryKey: ["/api/foods", foodId, "pairings", "bottle", mode],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/foods/${foodId}/pairings?list=bottle&mode=${mode}`);
      return res.json();
    },
    enabled: !!foodId,
  });

  const isLoading = foodLoading || glassLoading || bottleLoading;
  const isSwitching = glassFetching || bottleFetching;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Dish not found</p>
          <Link href="/food">
            <Button variant="ghost">Back to Food Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const priceDisplay = `$${(food.priceCents / 100).toFixed(0)}`;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Link href="/food">
        <Button variant="ghost" size="sm" data-testid="button-back-to-menu">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <h1
                className="text-3xl font-bold"
                data-testid="text-food-detail-name"
              >
                {food.name}
              </h1>
              <Badge
                className={`${categoryColors[food.category] || "bg-muted"}`}
                data-testid="badge-food-detail-category"
              >
                {food.category}
              </Badge>
            </div>
            <div
              className="text-3xl font-bold"
              data-testid="text-food-detail-price"
            >
              {priceDisplay}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recommended Wine Pairings</h2>
          </div>
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={mode === "classic" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setMode("classic")}
              data-testid="button-mode-classic"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Classic
            </Button>
            <Button
              variant={mode === "adventurous" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setMode("adventurous")}
              data-testid="button-mode-adventurous"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Adventurous
            </Button>
          </div>
        </div>

        {isSwitching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Updating recommendations...
          </div>
        )}

        {((glassPairings && glassPairings.length > 0) || (bottlePairings && bottlePairings.length > 0)) ? (
          <div className="space-y-6">
            {glassPairings && glassPairings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">By the Glass</h3>
                <div className="grid gap-3">
                  {glassPairings.map((p) => (
                    <PairingCard key={p.wine.id} pairing={p} listLabel="Glass" />
                  ))}
                </div>
              </div>
            )}

            {bottlePairings && bottlePairings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">By the Bottle</h3>
                <div className="grid gap-3">
                  {bottlePairings.map((p) => (
                    <PairingCard key={p.wine.id} pairing={p} listLabel="Bottle" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No wine pairings available for this dish.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
