import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Food } from "@shared/foodSchema";

interface FoodCardProps {
  food: Food;
  onClick?: (food: Food) => void;
}

const categoryColors: Record<string, string> = {
  "Mazzes": "bg-gold/10 text-gold dark:bg-gold/20",
  "Spreads": "bg-olive/10 text-olive dark:bg-olive/20",
  "Greens & Grains": "bg-olive/15 text-olive dark:bg-olive/25",
  "Meats & Seafood": "bg-terracotta/10 text-terracotta dark:bg-terracotta/20",
};

export function FoodCard({ food, onClick }: FoodCardProps) {
  const priceDisplay = `$${(food.priceCents / 100).toFixed(0)}`;
  
  return (
    <Card 
      className="ui-card-interactive cursor-pointer h-full"
      onClick={() => onClick?.(food)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(food); }}}
      role="button"
      tabIndex={0}
      data-testid={`card-food-${food.id}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="font-semibold text-lg leading-tight"
              data-testid={`text-food-name-${food.id}`}
            >
              {food.name}
            </h3>
            <span 
              className="font-bold text-lg shrink-0"
              data-testid={`text-food-price-${food.id}`}
            >
              {priceDisplay}
            </span>
          </div>
          
          <Badge 
            className={`w-fit ${categoryColors[food.category] || "bg-muted"}`}
            data-testid={`badge-food-category-${food.id}`}
          >
            {food.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
