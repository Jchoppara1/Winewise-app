import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Plus, Pencil } from "lucide-react";
import type { Food } from "@shared/foodSchema";
import { foodCategories, foodLabels } from "@shared/foodSchema";
import { wineLabels } from "@shared/schema";

interface AdminWine {
  id: string;
  name: string;
  wineType: string;
  varietal: string;
  priceCents: number;
  description?: string | null;
  outOfStock: boolean;
  labels: string[];
}

interface AdminUser {
  email: string;
}

import { wineTypeColors, wineTypeLabel, WINE_TYPES } from "@/lib/wineTypeColors";
import { wineTypes } from "@shared/schema";

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/login", { email, password });
    },
    onSuccess: () => {
      toast({ title: "Logged in successfully" });
      onLogin();
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-serif text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                data-testid="input-admin-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function MenuItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Food | null;
  onSave: (data: { name: string; category: string; priceCents: number; description?: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Mazzes");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name);
        setCategory(item.category);
        setPriceDisplay((item.priceCents / 100).toFixed(2));
        setDescription(item.description || "");
      } else {
        setName("");
        setCategory("Mazzes");
        setPriceDisplay("");
        setDescription("");
      }
    }
  }, [open, item]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const priceCents = Math.round(parseFloat(priceDisplay || "0") * 100);
            onSave({ name, category, priceCents, description: description || undefined });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="input-menu-name" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-menu-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {foodCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              data-testid="input-menu-price"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-menu-description"
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" data-testid="button-cancel-menu">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} data-testid="button-save-menu">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WineDialog({
  open,
  onOpenChange,
  wine,
  onSave,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wine?: AdminWine | null;
  onSave: (data: { name: string; wineType: string; varietal: string; priceCents: number; description?: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [wineType, setWineType] = useState<string>("red");
  const [varietal, setVarietal] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      if (wine) {
        setName(wine.name);
        setWineType(wine.wineType);
        setVarietal(wine.varietal);
        setPriceDisplay((wine.priceCents / 100).toFixed(2));
        setDescription(wine.description || "");
      } else {
        setName("");
        setWineType("red");
        setVarietal("");
        setPriceDisplay("");
        setDescription("");
      }
    }
  }, [open, wine]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">{wine ? "Edit Wine" : "Add Wine"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const priceCents = Math.round(parseFloat(priceDisplay || "0") * 100);
            onSave({ name, wineType, varietal, priceCents, description: description || undefined });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="input-wine-name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={wineType} onValueChange={setWineType}>
                <SelectTrigger data-testid="select-wine-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wineTypes.map((t) => (
                    <SelectItem key={t} value={t}>{wineTypeLabel(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Varietal</Label>
              <Input value={varietal} onChange={(e) => setVarietal(e.target.value)} data-testid="input-wine-varietal" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              data-testid="input-wine-price"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-wine-description"
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" data-testid="button-cancel-wine">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} data-testid="button-save-wine">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LabelManager({
  currentLabels,
  allowedLabels,
  onUpdate,
}: {
  currentLabels: string[];
  allowedLabels: readonly string[];
  onUpdate: (labels: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {allowedLabels.map((label) => {
        const isActive = currentLabels.includes(label);
        return (
          <Badge
            key={label}
            variant={isActive ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => {
              const next = isActive
                ? currentLabels.filter((l) => l !== label)
                : [...currentLabels, label];
              onUpdate(next);
            }}
            data-testid={`badge-label-${label}`}
          >
            {label}
          </Badge>
        );
      })}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function MenuItemsTab() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Food | null>(null);

  const { data: menuItems, isLoading } = useQuery<Food[]>({
    queryKey: ["/api/admin/menu"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; category: string; priceCents: number; description?: string }) => {
      await apiRequest("POST", "/api/admin/menu", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
      setDialogOpen(false);
      toast({ title: "Menu item added" });
    },
    onError: () => toast({ title: "Failed to add menu item", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await apiRequest("PATCH", `/api/admin/menu/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
      setDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Menu item updated" });
    },
    onError: () => toast({ title: "Failed to update menu item", variant: "destructive" }),
  });

  const stockMutation = useMutation({
    mutationFn: async ({ id, outOfStock }: { id: string; outOfStock: boolean }) => {
      await apiRequest("PATCH", `/api/admin/menu/${id}/out-of-stock`, { outOfStock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
    },
    onError: () => toast({ title: "Failed to update stock status", variant: "destructive" }),
  });

  const labelsMutation = useMutation({
    mutationFn: async ({ id, labels }: { id: string; labels: string[] }) => {
      await apiRequest("PATCH", `/api/admin/menu/${id}/labels`, { labels });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
    },
    onError: () => toast({ title: "Failed to update labels", variant: "destructive" }),
  });

  const handleSave = (data: { name: string; category: string; priceCents: number; description?: string }) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="font-serif text-lg font-semibold" data-testid="text-menu-heading">Menu Items</h3>
        <Button
          onClick={() => { setEditingItem(null); setDialogOpen(true); }}
          data-testid="button-add-menu-item"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>Out of Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems?.map((item) => (
                <TableRow key={item.id} data-testid={`row-menu-${item.id}`}>
                  <TableCell className="font-medium" data-testid={`text-menu-name-${item.id}`}>{item.name}</TableCell>
                  <TableCell data-testid={`text-menu-category-${item.id}`}>{item.category}</TableCell>
                  <TableCell data-testid={`text-menu-price-${item.id}`}>${(item.priceCents / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <LabelManager
                      currentLabels={item.labels}
                      allowedLabels={foodLabels}
                      onUpdate={(labels) => labelsMutation.mutate({ id: item.id, labels })}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.outOfStock}
                      onCheckedChange={(checked) => stockMutation.mutate({ id: item.id, outOfStock: checked })}
                      data-testid={`switch-stock-menu-${item.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { setEditingItem(item); setDialogOpen(true); }}
                      data-testid={`button-edit-menu-${item.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {menuItems?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No menu items yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

function WinesTab() {
  const { toast } = useToast();
  const [wineList, setWineList] = useState<"bottle" | "glass">("bottle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<AdminWine | null>(null);

  const bottleQuery = useQuery<AdminWine[]>({
    queryKey: ["/api/admin/wines"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const glassQuery = useQuery<AdminWine[]>({
    queryKey: ["/api/admin/wines", "glass"],
    queryFn: async () => {
      const res = await fetch("/api/admin/wines?list=glass", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const wines = wineList === "bottle" ? bottleQuery.data : glassQuery.data;
  const isLoading = wineList === "bottle" ? bottleQuery.isLoading : glassQuery.isLoading;
  const listParam = wineList;

  const invalidateWineQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/wines"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/wines", "glass"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; wineType: string; varietal: string; priceCents: number; description?: string }) => {
      await apiRequest("POST", `/api/admin/wines?list=${listParam}`, data);
    },
    onSuccess: () => {
      invalidateWineQueries();
      setDialogOpen(false);
      toast({ title: "Wine added" });
    },
    onError: () => toast({ title: "Failed to add wine", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await apiRequest("PATCH", `/api/admin/wines/${id}?list=${listParam}`, data);
    },
    onSuccess: () => {
      invalidateWineQueries();
      setDialogOpen(false);
      setEditingWine(null);
      toast({ title: "Wine updated" });
    },
    onError: () => toast({ title: "Failed to update wine", variant: "destructive" }),
  });

  const stockMutation = useMutation({
    mutationFn: async ({ id, outOfStock }: { id: string; outOfStock: boolean }) => {
      await apiRequest("PATCH", `/api/admin/wines/${id}/out-of-stock?list=${listParam}`, { outOfStock });
    },
    onSuccess: () => {
      invalidateWineQueries();
    },
    onError: () => toast({ title: "Failed to update stock status", variant: "destructive" }),
  });

  const labelsMutation = useMutation({
    mutationFn: async ({ id, labels }: { id: string; labels: string[] }) => {
      await apiRequest("PATCH", `/api/admin/wines/${id}/labels?list=${listParam}`, { labels });
    },
    onSuccess: () => {
      invalidateWineQueries();
    },
    onError: () => toast({ title: "Failed to update labels", variant: "destructive" }),
  });

  const handleSave = (data: { name: string; wineType: string; varietal: string; priceCents: number; description?: string }) => {
    if (editingWine) {
      updateMutation.mutate({ id: editingWine.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="font-serif text-lg font-semibold" data-testid="text-wines-heading">Wines</h3>
          <TabsList>
            <TabsTrigger
              value="bottle"
              onClick={() => setWineList("bottle")}
              data-testid="tab-wine-bottles"
            >
              Bottles
            </TabsTrigger>
            <TabsTrigger
              value="glass"
              onClick={() => setWineList("glass")}
              data-testid="tab-wine-glass"
            >
              By Glass
            </TabsTrigger>
          </TabsList>
        </div>
        <Button
          onClick={() => { setEditingWine(null); setDialogOpen(true); }}
          data-testid="button-add-wine"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Wine
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Varietal</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>Out of Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wines?.map((wine) => (
                <TableRow key={wine.id} data-testid={`row-wine-${wine.id}`}>
                  <TableCell className="font-medium" data-testid={`text-wine-name-${wine.id}`}>{wine.name}</TableCell>
                  <TableCell data-testid={`text-wine-type-${wine.id}`}>{wineTypeLabel(wine.wineType)}</TableCell>
                  <TableCell data-testid={`text-wine-varietal-${wine.id}`}>{wine.varietal}</TableCell>
                  <TableCell data-testid={`text-wine-price-${wine.id}`}>${(wine.priceCents / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <LabelManager
                      currentLabels={wine.labels}
                      allowedLabels={wineLabels}
                      onUpdate={(labels) => labelsMutation.mutate({ id: wine.id, labels })}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={wine.outOfStock}
                      onCheckedChange={(checked) => stockMutation.mutate({ id: wine.id, outOfStock: checked })}
                      data-testid={`switch-stock-wine-${wine.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { setEditingWine(wine); setDialogOpen(true); }}
                      data-testid={`button-edit-wine-${wine.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {wines?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No wines yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <WineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        wine={editingWine}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const { data: adminUser, isLoading: checkingAuth } = useQuery<AdminUser | null>({
    queryKey: ["/api/admin/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!checkingAuth) {
      setIsAuthenticated(!!adminUser);
    }
  }, [adminUser, checkingAuth]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
      toast({ title: "Logged out" });
    },
  });

  if (checkingAuth || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={() => {
          setIsAuthenticated(true);
          queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <h1 className="font-serif text-xl font-semibold" data-testid="text-admin-title">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList>
            <TabsTrigger value="menu" data-testid="tab-menu-items">Menu Items</TabsTrigger>
            <TabsTrigger value="wines" data-testid="tab-wines">Wines</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <MenuItemsTab />
          </TabsContent>

          <TabsContent value="wines">
            <Tabs value="bottle" className="space-y-4">
              <WinesTab />
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
