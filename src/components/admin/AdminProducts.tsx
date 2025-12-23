import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, RefreshCw, Plus, Edit, Trash2, Eye, EyeOff, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  price_from: number;
  price_to: number;
  icon: string;
  usp: string[];
  specs_spans: string | null;
  specs_heights: string | null;
  specs_insulation: string | null;
  specs_snow_load: string | null;
  specs_fire_resistance: string | null;
  applications: string[];
  is_published: boolean;
  created_at: string;
}

const emptyProduct: Omit<Product, 'id' | 'created_at'> = {
  slug: "",
  title: "",
  excerpt: "",
  price_from: 0,
  price_to: 0,
  icon: "Building",
  usp: [],
  specs_spans: "",
  specs_heights: "",
  specs_insulation: "",
  specs_snow_load: "",
  specs_fire_resistance: "",
  applications: [],
  is_published: true
};

export const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить продукты", variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const openCreateDialog = () => {
    setCurrentProduct(emptyProduct);
    setEditDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setEditDialogOpen(true);
  };

  const saveProduct = async () => {
    if (!currentProduct) return;

    const productData = {
      slug: currentProduct.slug,
      title: currentProduct.title,
      excerpt: currentProduct.excerpt,
      price_from: currentProduct.price_from,
      price_to: currentProduct.price_to,
      icon: currentProduct.icon,
      usp: currentProduct.usp || [],
      specs_spans: currentProduct.specs_spans || null,
      specs_heights: currentProduct.specs_heights || null,
      specs_insulation: currentProduct.specs_insulation || null,
      specs_snow_load: currentProduct.specs_snow_load || null,
      specs_fire_resistance: currentProduct.specs_fire_resistance || null,
      applications: currentProduct.applications || [],
      is_published: currentProduct.is_published
    };

    if ('id' in currentProduct && currentProduct.id) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", currentProduct.id);

      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Продукт обновлён" });
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([productData]);

      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Продукт создан" });
        fetchProducts();
      }
    }

    setEditDialogOpen(false);
    setCurrentProduct(null);
  };

  const togglePublished = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_published: !product.is_published })
      .eq("id", product.id);

    if (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } else {
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_published: !p.is_published } : p
      ));
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productToDelete.id);

    if (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } else {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({ title: "Продукт удалён" });
    }

    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter(p => 
    searchQuery === "" || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск продуктов..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchProducts} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Всего продуктов</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Опубликовано</p>
          <p className="text-2xl font-bold text-green-600">{products.filter(p => p.is_published).length}</p>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Продуктов не найдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{product.title}</h3>
                    {!product.is_published && (
                      <Badge variant="outline" className="text-muted-foreground">
                        <EyeOff className="h-3 w-3 mr-1" /> Скрыт
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {product.excerpt}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    от {formatPrice(product.price_from)} до {formatPrice(product.price_to)} ₽/м²
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => togglePublished(product)}>
                    {product.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProduct && 'id' in currentProduct ? "Редактировать продукт" : "Новый продукт"}
            </DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug</Label>
                  <Input 
                    value={currentProduct.slug || ""} 
                    onChange={(e) => setCurrentProduct({...currentProduct, slug: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Иконка</Label>
                  <Input 
                    value={currentProduct.icon || ""} 
                    onChange={(e) => setCurrentProduct({...currentProduct, icon: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Название</Label>
                <Input 
                  value={currentProduct.title || ""} 
                  onChange={(e) => setCurrentProduct({...currentProduct, title: e.target.value})}
                />
              </div>
              <div>
                <Label>Краткое описание</Label>
                <Textarea 
                  value={currentProduct.excerpt || ""} 
                  onChange={(e) => setCurrentProduct({...currentProduct, excerpt: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Цена от (₽/м²)</Label>
                  <Input 
                    type="number"
                    value={currentProduct.price_from || ""} 
                    onChange={(e) => setCurrentProduct({...currentProduct, price_from: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Цена до (₽/м²)</Label>
                  <Input 
                    type="number"
                    value={currentProduct.price_to || ""} 
                    onChange={(e) => setCurrentProduct({...currentProduct, price_to: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label>USP (через запятую)</Label>
                <Input 
                  value={currentProduct.usp?.join(", ") || ""} 
                  onChange={(e) => setCurrentProduct({...currentProduct, usp: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Пролёты</Label>
                  <Input 
                    value={currentProduct.specs_spans || ""} 
                    onChange={(e) => setCurrentProduct({...currentProduct, specs_spans: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Высоты</Label>
                  <Input 
                    value={currentProduct.specs_heights || ""} 
                    onChange={(e) => setCurrentProduct({...currentProduct, specs_heights: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Применение (через запятую)</Label>
                <Input 
                  value={currentProduct.applications?.join(", ") || ""} 
                  onChange={(e) => setCurrentProduct({...currentProduct, applications: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
                />
              </div>
              <Button onClick={saveProduct} className="w-full">Сохранить</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить продукт?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить "{productToDelete?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProduct} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
