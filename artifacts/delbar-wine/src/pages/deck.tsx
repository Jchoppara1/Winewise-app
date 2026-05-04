import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Grape,
  UtensilsCrossed,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Wine,
  ChefHat,
  Zap,
  Lock,
} from "lucide-react";

const stats = [
  { value: "66", label: "Wines Cataloged", icon: Wine },
  { value: "37", label: "Dishes Paired", icon: ChefHat },
  { value: "6", label: "Pairing Dimensions", icon: Zap },
  { value: "100%", label: "Secure Admin", icon: Lock },
];

const features = [
  {
    title: "Curated Wine Collection",
    description:
      "A complete catalog of 66 wines organized by type, varietal, and price. Each bottle includes an auto-generated tasting profile with body, acidity, tannin levels, and aroma notes — powered by a grape variety database.",
    screenshot: "/images/screenshot-wines.png",
    icon: Grape,
    badges: ["Auto-Profiling", "4 Wine Types", "Price Tiers"],
  },
  {
    title: "Signature Food Menu",
    description:
      "37 Middle Eastern dishes across Mazzes, Spreads, Greens & Grains, and Meats & Seafood. Each dish is described with ingredients, preparation style, and flavor intensity — all feeding into the pairing algorithm.",
    screenshot: "/images/screenshot-food.png",
    icon: UtensilsCrossed,
    badges: ["4 Categories", "Flavor Profiles", "Dietary Info"],
  },
  {
    title: "Intelligent Wine Pairings",
    description:
      "A 6-dimension scoring algorithm matches wines to dishes based on intensity, acid-fat balance, tannin-protein interaction, spice harmony, sauce compatibility, and regional affinity. Each pairing comes with a match score and a plain-language explanation.",
    screenshot: "/images/screenshot-pairings.png",
    icon: BarChart3,
    badges: ["Scored Matches", "Why It Works", "Classic & Adventurous"],
  },
  {
    title: "Admin Inventory Control",
    description:
      "A secure dashboard for restaurant staff to manage stock availability in real-time, apply labels like Featured, New, or By the Glass, and add or edit wines and dishes. Out-of-stock items are automatically hidden from the public menu.",
    screenshot: "/images/screenshot-admin-login.png",
    icon: ShieldCheck,
    badges: ["Session Auth", "Rate Limited", "Real-Time Stock"],
  },
];

export default function DeckPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-[hsl(var(--primary)/0.08)] via-background to-[hsl(var(--accent)/0.12)]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="gap-1.5 text-sm px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            Investor Preview
          </Badge>
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground"
            data-testid="text-deck-title"
          >
            Delbar Wine & Dine
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A modern restaurant platform that pairs an expertly curated wine
            collection with a signature Middle Eastern menu — powered by an
            intelligent pairing engine and real-time inventory management.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <Link href="/">
              <Button size="lg" className="gap-2" data-testid="button-try-wines">
                <Grape className="h-4 w-4" />
                Explore Wines
              </Button>
            </Link>
            <Link href="/food">
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                data-testid="button-try-food"
              >
                <UtensilsCrossed className="h-4 w-4" />
                See Pairings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-b">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6 pb-5 space-y-2">
                  <stat.icon className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p
                    className="text-3xl font-serif font-bold text-foreground"
                    data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-20">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={feature.title}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-12 items-center`}
                data-testid={`section-feature-${index}`}
              >
                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <feature.icon className="h-5 w-5" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Feature {index + 1}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {feature.badges.map((badge) => (
                      <Badge key={badge} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full max-w-xl">
                  <Card className="overflow-hidden">
                    <img
                      src={feature.screenshot}
                      alt={feature.title}
                      className="w-full h-auto"
                      data-testid={`img-feature-${index}`}
                      loading="lazy"
                    />
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-[hsl(var(--primary)/0.06)] to-[hsl(var(--accent)/0.08)]">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Under the Hood
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Built with React, TypeScript, Express, and a custom scoring engine.
            The pairing algorithm evaluates wines against dishes across six
            weighted dimensions — intensity, acid-fat balance, tannin-protein
            interaction, spice harmony, sauce compatibility, and regional
            affinity — to produce calibrated match scores with natural-language
            explanations.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {[
              "React",
              "TypeScript",
              "Express",
              "Tailwind CSS",
              "shadcn/ui",
              "Zod",
              "TanStack Query",
            ].map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Ready to Explore?
          </h2>
          <p className="text-muted-foreground">
            Browse the live application to see every feature in action.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/">
              <Button className="gap-2" data-testid="button-cta-wines">
                Wine List
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/food">
              <Button variant="outline" className="gap-2" data-testid="button-cta-food">
                Food & Pairings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="secondary" className="gap-2" data-testid="button-cta-admin">
                Admin Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t text-center">
        <p className="text-sm text-muted-foreground">
          Delbar Wine & Dine Platform
        </p>
      </footer>
    </div>
  );
}
