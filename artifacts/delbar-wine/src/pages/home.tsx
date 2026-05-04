import { useState, useMemo, memo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Wine, WineFilters, wineTypes, priceCategories, foodPairingOptions } from "@shared/schema";
import { wineTypeColors, wineTypeLabel, WINE_TYPES } from "@/lib/wineTypeColors";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, Wine as WineIcon, Pencil, Trash2, X, Filter, GlassWater, Grape, Droplets, Flame } from "lucide-react";
import { formatPrice } from "@shared/wineRules";
import { WineFoodPairings } from "@/components/wine-food-pairings";
import { WineDetailModal } from "@/components/wine-detail-modal";
import { DishDetailModal } from "@/components/dish-detail-modal";
import type { Food } from "@shared/foodSchema";

interface EnrichedWine extends Wine {
  profile?: {
    body: string;
    acidity: string;
    tannin: string;
    sweetness: string;
    oak: string;
    flavorNotes: string[];
  };
  wineDescription?: {
    headline: string;
    aromas: [string, string, string];
    palate: [string, string, string];
    servingSuggestions: string[];
  };
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  wineType: z.enum(wineTypes),
  varietal: z.string().min(1, "Varietal is required").max(100),
  priceCents: z.number().int().min(0, "Price must be positive"),
  description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function WineCardSkeleton() {
  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Skeleton className="h-4 w-full" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function WineCard({ 
  wine, 
  onEdit, 
  onDelete,
  onSelect,
  isGlass,
}: { 
  wine: EnrichedWine; 
  onEdit: (wine: EnrichedWine) => void;
  onDelete: (id: string) => void;
  onSelect: (wine: EnrichedWine) => void;
  isGlass?: boolean;
}) {

  const priceCategoryColors: Record<string, string> = {
    "$": "bg-olive/10 text-olive dark:bg-olive/20 dark:text-olive",
    "$$": "bg-secondary text-secondary-foreground",
    "$$$": "bg-gold/10 text-gold dark:bg-gold/20",
    "$$$$": "bg-gold/15 text-gold dark:bg-gold/25 border border-gold/30",
  };

  const profile = wine.profile;
  const desc = wine.wineDescription;

  return (
    <Card
      className="overflow-visible ui-card-interactive group cursor-pointer"
      onClick={() => onSelect(wine)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(wine); }}}
      role="button"
      tabIndex={0}
      data-testid={`card-wine-${wine.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate" data-testid={`text-wine-name-${wine.id}`}>
              {wine.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {wine.varietal}
            </p>
            {desc && (
              <p className="text-xs text-muted-foreground mt-1 italic" data-testid={`text-wine-headline-${wine.id}`}>
                {desc.headline}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold tabular-nums" data-testid={`text-wine-price-${wine.id}`}>
              {formatPrice(wine.priceCents)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={() => onEdit(wine)}
            data-testid={`button-edit-wine-${wine.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-destructive"
                data-testid={`button-delete-wine-${wine.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Wine</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{wine.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(wine.id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {wine.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {wine.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            variant="secondary" 
            className={`text-xs ${wineTypeColors[wine.wineType]}`}
            data-testid={`badge-wine-type-${wine.id}`}
          >
            {wineTypeLabel(wine.wineType)}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`text-xs ${priceCategoryColors[wine.priceCategory]}`}
            data-testid={`badge-price-category-${wine.id}`}
          >
            {wine.priceCategory}
          </Badge>
          {profile && (
            <>
              <Badge variant="outline" className="text-xs" data-testid={`badge-body-${wine.id}`}>
                {profile.body}
              </Badge>
              <Badge variant="outline" className="text-xs" data-testid={`badge-acidity-${wine.id}`}>
                <Droplets className="h-3 w-3 mr-1" />
                {profile.acidity} acid
              </Badge>
              {profile.tannin !== "none" && (
                <Badge variant="outline" className="text-xs" data-testid={`badge-tannin-${wine.id}`}>
                  <Flame className="h-3 w-3 mr-1" />
                  {profile.tannin} tannin
                </Badge>
              )}
            </>
          )}
        </div>
        {profile && profile.flavorNotes.length > 0 && (
          <div className="flex flex-wrap gap-1" data-testid={`text-flavor-notes-${wine.id}`}>
            {profile.flavorNotes.slice(0, 4).map((note) => (
              <span key={note} className="text-xs text-muted-foreground">
                {note}{profile.flavorNotes.indexOf(note) < Math.min(profile.flavorNotes.length, 4) - 1 ? " ·" : ""}
              </span>
            ))}
          </div>
        )}
        <WineFoodPairings wine={wine} maxItems={3} isGlassWine={isGlass} />
      </CardContent>
    </Card>
  );
}

function filtersEqual(a: WineFilters, b: WineFilters): boolean {
  return (a.search || "") === (b.search || "") &&
    (a.wineType || "") === (b.wineType || "") &&
    (a.priceCategory || "") === (b.priceCategory || "") &&
    (a.foodPairing || "") === (b.foodPairing || "");
}

function FilterPanel({
  draftFilters,
  appliedFilters,
  onDraftChange,
  onApply,
  onReset,
}: {
  draftFilters: WineFilters;
  appliedFilters: WineFilters;
  onDraftChange: (filters: WineFilters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const hasUnsavedChanges = !filtersEqual(draftFilters, appliedFilters);
  const hasDraftValues = draftFilters.search || draftFilters.wineType || draftFilters.priceCategory || draftFilters.foodPairing;

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 h-5 transition-opacity duration-200 ease-out ${hasUnsavedChanges ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        data-testid="text-unsaved-changes"
        aria-hidden={!hasUnsavedChanges}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
        Unsaved changes
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search wines..."
          value={draftFilters.search || ""}
          onChange={(e) => onDraftChange({ ...draftFilters, search: e.target.value || undefined })}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Wine Type
          </Label>
          <Select
            value={draftFilters.wineType || "all"}
            onValueChange={(value) => 
              onDraftChange({ ...draftFilters, wineType: value === "all" ? undefined : value as any })
            }
          >
            <SelectTrigger data-testid="select-wine-type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {wineTypes.map((type) => (
                <SelectItem key={type} value={type}>{wineTypeLabel(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Price Range
          </Label>
          <Select
            value={draftFilters.priceCategory || "all"}
            onValueChange={(value) => 
              onDraftChange({ ...draftFilters, priceCategory: value === "all" ? undefined : value as any })
            }
          >
            <SelectTrigger data-testid="select-price-category">
              <SelectValue placeholder="All prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prices</SelectItem>
              {priceCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat} {cat === "$" ? "(Under $20)" : cat === "$$" ? "($20-$40)" : cat === "$$$" ? "($40-$80)" : "($80+)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Food Pairing
          </Label>
          <Select
            value={draftFilters.foodPairing || "all"}
            onValueChange={(value) => 
              onDraftChange({ ...draftFilters, foodPairing: value === "all" ? undefined : value as any })
            }
          >
            <SelectTrigger data-testid="select-food-pairing">
              <SelectValue placeholder="All pairings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pairings</SelectItem>
              {foodPairingOptions.map((pairing) => (
                <SelectItem key={pairing} value={pairing}>{pairing}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={onApply}
          disabled={!hasUnsavedChanges}
          className="flex-1"
          data-testid="button-apply-filters"
        >
          Apply Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!hasDraftValues && !appliedFilters.search && !appliedFilters.wineType && !appliedFilters.priceCategory && !appliedFilters.foodPairing}
          className="flex-1"
          data-testid="button-reset-filters"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}

function WineFormDialog({
  open,
  onOpenChange,
  wine,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wine?: Wine | null;
  onSubmit: (values: FormValues) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: wine ? {
      name: wine.name,
      wineType: wine.wineType as any,
      varietal: wine.varietal,
      priceCents: wine.priceCents,
      description: wine.description || "",
    } : {
      name: "",
      wineType: "red",
      varietal: "",
      priceCents: 0,
      description: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{wine ? "Edit Wine" : "Add New Wine"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wine Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Chateau Margaux 2015" 
                      {...field} 
                      data-testid="input-wine-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-form-wine-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wineTypes.map((type) => (
                          <SelectItem key={type} value={type}>{wineTypeLabel(type)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="varietal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Varietal</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Cabernet Sauvignon" 
                        {...field} 
                        data-testid="input-varietal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priceCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00" 
                        className="pl-7"
                        value={field.value ? (field.value / 100).toFixed(2) : ""}
                        onChange={(e) => {
                          const cents = Math.round(parseFloat(e.target.value || "0") * 100);
                          field.onChange(cents);
                        }}
                        data-testid="input-price"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tasting notes, vintage information, etc."
                      className="resize-none"
                      rows={3}
                      {...field} 
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit-wine">
                {isSubmitting ? "Saving..." : wine ? "Update Wine" : "Add Wine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <GlassWater className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">
        {hasFilters ? "No wines match your filters" : "No wines yet"}
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        {hasFilters 
          ? "Try adjusting your search or filter criteria to find wines."
          : "Add your first wine to get started building your wine list."
        }
      </p>
    </div>
  );
}

function WineDebugPanel({ wines }: { wines: EnrichedWine[] }) {
  const [show, setShow] = useState(false);
  const isDev = import.meta.env.DEV;
  const debugEnabled = isDev && typeof localStorage !== "undefined" && localStorage.getItem("debugWine") === "1";

  if (!debugEnabled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 text-white text-xs" data-testid="debug-panel">
      <button
        onClick={() => setShow(v => !v)}
        className="w-full px-4 py-1 text-left font-mono hover:bg-white/10"
        data-testid="debug-toggle"
      >
        {show ? "▼" : "▲"} Wine Classification Debug ({wines.length} wines)
      </button>
      {show && (
        <div className="max-h-64 overflow-auto p-2">
          <table className="w-full font-mono">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-1">Name</th>
                <th className="text-left p-1">Primary</th>
                <th className="text-left p-1">Secondary</th>
                <th className="text-left p-1">Conf</th>
                <th className="text-left p-1">Reasons</th>
              </tr>
            </thead>
            <tbody>
              {wines.map(w => {
                const cls = (w as any).classification;
                return (
                  <tr key={w.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-1 max-w-[200px] truncate">{w.name}</td>
                    <td className="p-1">{cls?.typePrimary || w.wineType}</td>
                    <td className="p-1">{cls?.typeSecondary?.join(", ") || "—"}</td>
                    <td className="p-1">{cls?.confidence?.toFixed(2) || "?"}</td>
                    <td className="p-1 max-w-[300px] truncate">{cls?.reasons?.join(", ") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type WineViewMode = "bottle" | "glass";

// Maps varietal filter keys to search terms used against wine data fields
const VARIETAL_FILTER_MAP: Record<string, string> = {
  malbec: "malbec",
  cabernetSauvignon: "cabernet sauvignon",
  pinotGrigio: "pinot grigio",
  pinotNoir: "pinot noir",
  chardonnay: "chardonnay",
  sauvignonBlanc: "sauvignon blanc",
  syrah: "syrah|shiraz",
  riesling: "riesling",
};

export default function Home() {
  const { toast } = useToast();
  const [draftFilters, setDraftFilters] = useState<WineFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<WineFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<EnrichedWine | null>(null);
  const [selectedWine, setSelectedWine] = useState<EnrichedWine | null>(null);
  const [selectedDish, setSelectedDish] = useState<Food | null>(null);
  const [backToWine, setBackToWine] = useState<EnrichedWine | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<WineViewMode>("bottle");

  const { data: bottleWines, isLoading: bottleLoading } = useQuery<EnrichedWine[]>({
    queryKey: ["/api/wines"],
  });

  const { data: glassWines, isLoading: glassLoading } = useQuery<EnrichedWine[]>({
    queryKey: ["/api/wines-by-glass"],
  });

  const { data: allFoods } = useQuery<Food[]>({
    queryKey: ["/api/foods"],
  });

  const wines = viewMode === "bottle" ? bottleWines : glassWines;
  const isLoading = viewMode === "bottle" ? bottleLoading : glassLoading;

  const handleSelectFoodFromWine = (foodId: string) => {
    const food = allFoods?.find(f => f.id === foodId);
    if (food) {
      setBackToWine(selectedWine);
      setSelectedWine(null);
      setSelectedDish(food);
    }
  };

  const handleSelectWineFromDish = (wineId: string) => {
    const allWinesList = [...(bottleWines || []), ...(glassWines || [])];
    const wine = allWinesList.find(w => w.id === wineId);
    if (wine) {
      setSelectedDish(null);
      setBackToWine(null);
      setSelectedWine(wine);
    }
  };

  const handleBackToWine = () => {
    if (backToWine) {
      setSelectedDish(null);
      setSelectedWine(backToWine);
      setBackToWine(null);
    }
  };

  const filteredWines = useMemo(() => {
    if (!wines) return [];

    return wines.filter((wine) => {
      if (appliedFilters.search) {
        const search = appliedFilters.search.toLowerCase();
        if (
          !wine.name.toLowerCase().includes(search) &&
          !wine.varietal.toLowerCase().includes(search) &&
          !wine.description?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (appliedFilters.wineType) {
        const varietalSearchTerm = VARIETAL_FILTER_MAP[appliedFilters.wineType];

        if (varietalSearchTerm) {
          const searchTerms = varietalSearchTerm.split("|");
          const matchesVarietal = searchTerms.some(term =>
            wine.varietal?.toLowerCase().includes(term) ||
            wine.name?.toLowerCase().includes(term) ||
            wine.description?.toLowerCase().includes(term)
          );
          if (!matchesVarietal) return false;
        } else {
          const cls = (wine as any).classification;
          const matchesPrimary = cls?.typePrimary === appliedFilters.wineType;
          const matchesSecondary = cls?.typeSecondary?.includes(appliedFilters.wineType);
          const matchesFallback = wine.wineType === appliedFilters.wineType;
          if (!matchesPrimary && !matchesSecondary && !matchesFallback) {
            return false;
          }
        }
      }

      if (appliedFilters.priceCategory && wine.priceCategory !== appliedFilters.priceCategory) {
        return false;
      }

      if (appliedFilters.foodPairing && !wine.foodPairings.includes(appliedFilters.foodPairing)) {
        return false;
      }

      return true;
    });
  }, [wines, appliedFilters]);

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest("POST", "/api/wines", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wines"] });
      setIsFormOpen(false);
      toast({ title: "Wine added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add wine", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      return apiRequest("PATCH", `/api/wines/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wines"] });
      setEditingWine(null);
      toast({ title: "Wine updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update wine", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/wines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wines"] });
      toast({ title: "Wine deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete wine", variant: "destructive" });
    },
  });

  const handleEdit = (wine: EnrichedWine) => {
    setEditingWine(wine);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const handleResetFilters = () => {
    setDraftFilters({});
    setAppliedFilters({});
  };

  const hasActiveFilters = appliedFilters.search || appliedFilters.wineType || appliedFilters.priceCategory || appliedFilters.foodPairing;
  const activeFilterCount = [appliedFilters.wineType, appliedFilters.priceCategory, appliedFilters.foodPairing].filter(Boolean).length;
  const hasUnsavedFilterChanges = !filtersEqual(draftFilters, appliedFilters);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-md bg-primary/10">
              <Grape className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Wine List</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "bottle" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode("bottle")}
                data-testid="button-view-bottle"
              >
                By the Bottle
              </Button>
              <Button
                variant={viewMode === "glass" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode("glass")}
                data-testid="button-view-glass"
              >
                By the Glass
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(activeFilterCount > 0 || hasUnsavedFilterChanges) && (
                <Badge variant={hasUnsavedFilterChanges ? "default" : "secondary"} className="ml-2 h-5 w-5 p-0 justify-center">
                  {hasUnsavedFilterChanges ? "!" : activeFilterCount}
                </Badge>
              )}
            </Button>
            {viewMode === "bottle" && (
              <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-wine">
                <Plus className="h-4 w-4 mr-2" />
                Add Wine
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className={`
            ${showMobileFilters ? "block" : "hidden"} 
            md:block 
            w-full md:w-72 
            shrink-0
            ${showMobileFilters ? "mb-6" : ""}
          `}>
            <div className="sticky top-24 bg-card rounded-lg border p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h2>
              <FilterPanel
                draftFilters={draftFilters}
                appliedFilters={appliedFilters}
                onDraftChange={setDraftFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  "Loading wines..."
                ) : (
                  <>
                    Showing <span className="font-medium text-foreground">{filteredWines.length}</span>
                    {wines && filteredWines.length !== wines.length && (
                      <> of {wines.length}</>
                    )} wines
                  </>
                )}
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ui-fade-in">
                {Array.from({ length: 6 }).map((_, i) => (
                  <WineCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredWines.length === 0 ? (
              <EmptyState hasFilters={!!hasActiveFilters} />
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ui-fade-in" data-testid="wine-grid">
                {filteredWines.map((wine) => (
                  <WineCard
                    key={wine.id}
                    wine={wine}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSelect={setSelectedWine}
                    isGlass={viewMode === "glass"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <WineFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={(values) => createMutation.mutate(values)}
        isSubmitting={createMutation.isPending}
      />

      <WineFormDialog
        key={editingWine?.id}
        open={!!editingWine}
        onOpenChange={(open) => !open && setEditingWine(null)}
        wine={editingWine}
        onSubmit={(values) => editingWine && updateMutation.mutate({ id: editingWine.id, data: values })}
        isSubmitting={updateMutation.isPending}
      />

      <WineDetailModal
        wine={selectedWine}
        open={!!selectedWine}
        onOpenChange={(open) => !open && setSelectedWine(null)}
        isGlassWine={viewMode === "glass"}
        onSelectFood={handleSelectFoodFromWine}
      />

      <DishDetailModal
        food={selectedDish}
        open={!!selectedDish}
        onOpenChange={(open) => {
          if (!open) {
            if (backToWine) {
              handleBackToWine();
            } else {
              setSelectedDish(null);
            }
          }
        }}
        onSelectWine={handleSelectWineFromDish}
        backLabel={backToWine ? `Back to ${backToWine.name}` : undefined}
        onBack={backToWine ? handleBackToWine : undefined}
      />

      <WineDebugPanel wines={wines || []} />
    </div>
  );
}