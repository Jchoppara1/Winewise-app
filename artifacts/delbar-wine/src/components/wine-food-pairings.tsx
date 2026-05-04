import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Wine } from "@shared/schema";
import { UtensilsCrossed } from "lucide-react";
import { tierColor } from "@shared/calibrateMatch";
import { apiRequest } from "@/lib/queryClient";

interface FoodPairingResult {
  food: { id: string; name: string; category: string; priceCents: number };
  score: number;
  matchScore: number;
  confidenceTier: string;
  explanation: string;
  whyItWorks: string[];
}

interface WineFoodPairingsProps {
  wine: Wine;
  maxItems?: number;
  isGlassWine?: boolean;
}

export function WineFoodPairings({ wine, maxItems = 3, isGlassWine = false }: WineFoodPairingsProps) {
  const listType = isGlassWine ? "glass" : "bottle";
  const { data: pairings } = useQuery<FoodPairingResult[]>({
    queryKey: ["/api/wines", wine.id, "pairings", listType],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/wines/${wine.id}/pairings?list=${listType}&mode=classic`);
      return res.json();
    },
  });

  if (!pairings || pairings.length === 0) return null;

  const displayedPairings = pairings.slice(0, maxItems);
  const remainingCount = pairings.length - maxItems;

  return (
    <div className="pt-2 border-t mt-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Pairs With</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {displayedPairings.map(({ food, matchScore, confidenceTier }) => (
          <Link key={food.id} href={`/food/${food.id}`}>
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer ui-transition"
              data-testid={`badge-food-pair-${wine.id}-${food.id}`}
            >
              {food.name.replace(" (GF)", "")}
              <span className={`ml-1 ${tierColor(confidenceTier as any)}`}>{matchScore}%</span>
            </Badge>
          </Link>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount}
          </Badge>
        )}
      </div>
    </div>
  );
}
