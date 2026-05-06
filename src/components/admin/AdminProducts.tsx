import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Grip,
  X,
  FolderTree,
  LayoutGrid,
  Sparkles,
  Loader2,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ImageUpload } from "./ImageUpload";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CatalogProduct,
  CatalogSection,
  CatalogSubcategory,
  ProductMetric,
  ProductSection,
  formatPrice,
  getCatalogIcon,
  normalizeProduct,
  pluralize,
} from "@/lib/catalog";

interface SectionForm {
  id?: string;
  title: string;
  slug: string;
  description: string;
  image: string[];
  icon: string;
  sort_order: number;
  is_published: boolean;
}

interface SubcategoryForm {
  id?: string;
  section_id: string;
  title: string;
  slug: string;
  description: string;
  image: string[];
  display_mode: string;
  sort_order: number;
  is_published: boolean;
}

type ProductForm = Omit<CatalogProduct, "id" | "created_at"> & { id?: string };

type DeleteState =
  | { type: "section"; item: CatalogSection }
  | { type: "subcategory"; item: CatalogSubcategory }
  | { type: "product"; item: CatalogProduct }
  | null;

const emptySection: SectionForm = {
  title: "",
  slug: "",
  description: "",
  image: [],
  icon: "Building2",
  sort_order: 0,
  is_published: true,
};

const emptySubcategory = (sectionId = ""): SubcategoryForm => ({
  section_id: sectionId,
  title: "",
  slug: "",
  description: "",
  image: [],
  display_mode: "hybrid",
  sort_order: 0,
  is_published: true,
});

const emptyProduct = (sectionId = "", subcategoryId = ""): ProductForm => ({
  slug: "",
  title: "",
  excerpt: "",
  overview: "",
  price_from: 0,
  price_to: 0,
  icon: "Building",
  usp: [],
  hero_metrics: [],
  content_sections: [],
  specs_spans: "",
  specs_heights: "",
  specs_insulation: "",
  specs_snow_load: "",
  specs_fire_resistance: "",
  applications: [],
  gallery: [],
  is_published: true,
  section_id: sectionId || null,
  subcategory_id: subcategoryId || null,
  sort_order: 0,
  catalog_card_title: "",
  catalog_card_description: "",
});

const cyrillicToLatinMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "cz",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const generateSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => cyrillicToLatinMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const shouldSyncSlug = (currentSlug: string, currentTitle: string) => {
  const normalizedSlug = generateSlug(currentSlug);
  return !normalizedSlug || normalizedSlug === generateSlug(currentTitle);
};

export const AdminProducts = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sections");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionForm | null>(null);
  const [currentSubcategory, setCurrentSubcategory] = useState<SubcategoryForm | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductForm | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"empty-only" | "all">("empty-only");
  const [aiScope, setAiScope] = useState<"filtered" | "all">("filtered");
  const [aiRunning, setAiRunning] = useState(false);
  const [aiProgress, setAiProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    const [sectionsResponse, subcategoriesResponse, productsResponse] = await Promise.all([
      supabase
        .from("catalog_sections" as any)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true }),
      supabase
        .from("catalog_subcategories" as any)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

    if (sectionsResponse.error || subcategoriesResponse.error || productsResponse.error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить каталог", variant: "destructive" });
    } else {
      setSections(((sectionsResponse.data as unknown) as CatalogSection[]) || []);
      setSubcategories(((subcategoriesResponse.data as unknown) as CatalogSubcategory[]) || []);
      setProducts((productsResponse.data || []).map(normalizeProduct));
    }
    setLoading(false);
  };

  const sectionMap = useMemo(() => new Map(sections.map((section) => [section.id, section])), [sections]);
  const subcategoryMap = useMemo(() => new Map(subcategories.map((subcategory) => [subcategory.id, subcategory])), [subcategories]);

  const sectionStats = useMemo(() => {
    return sections.reduce<Record<string, { subcategories: number; products: number }>>((acc, section) => {
      acc[section.id] = {
        subcategories: subcategories.filter((subcategory) => subcategory.section_id === section.id).length,
        products: products.filter((product) => product.section_id === section.id).length,
      };
      return acc;
    }, {});
  }, [sections, subcategories, products]);

  const subcategoryStats = useMemo(() => {
    return subcategories.reduce<Record<string, number>>((acc, subcategory) => {
      acc[subcategory.id] = products.filter((product) => product.subcategory_id === subcategory.id).length;
      return acc;
    }, {});
  }, [subcategories, products]);

  const filteredSubcategoriesForForm = useMemo(() => {
    if (!currentProduct?.section_id) return [];
    return subcategories.filter((subcategory) => subcategory.section_id === currentProduct.section_id);
  }, [currentProduct?.section_id, subcategories]);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sections.filter((section) => {
      if (!query) return true;
      return [section.title, section.slug, section.description || ""].join(" ").toLowerCase().includes(query);
    });
  }, [searchQuery, sections]);

  const filteredSubcategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return subcategories.filter((subcategory) => {
      if (sectionFilter !== "all" && subcategory.section_id !== sectionFilter) return false;
      if (!query) return true;
      return [subcategory.title, subcategory.slug, subcategory.description || ""].join(" ").toLowerCase().includes(query);
    });
  }, [searchQuery, sectionFilter, subcategories]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (sectionFilter !== "all" && product.section_id !== sectionFilter) return false;
      if (subcategoryFilter !== "all" && product.subcategory_id !== subcategoryFilter) return false;
      if (!query) return true;
      return [product.title, product.slug, product.excerpt, product.catalog_card_title || "", product.catalog_card_description || ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchQuery, sectionFilter, subcategoryFilter, products]);

  const openCreateSection = () => {
    setCurrentSection(emptySection);
    setSectionDialogOpen(true);
  };

  const openEditSection = (section: CatalogSection) => {
    setCurrentSection({
      id: section.id,
      title: section.title,
      slug: section.slug,
      description: section.description || "",
      image: section.image ? [section.image] : [],
      icon: section.icon,
      sort_order: section.sort_order,
      is_published: section.is_published,
    });
    setSectionDialogOpen(true);
  };

  const saveSection = async () => {
    if (!currentSection) return;

    const slug = generateSlug(currentSection.slug || currentSection.title);

    const payload = {
      title: currentSection.title,
      slug,
      description: currentSection.description || null,
      image: currentSection.image[0] || null,
      icon: currentSection.icon,
      sort_order: Number.isFinite(currentSection.sort_order) ? currentSection.sort_order : 0,
      is_published: currentSection.is_published,
    };

    const query = currentSection.id
      ? supabase.from("catalog_sections" as any).update(payload).eq("id", currentSection.id)
      : supabase.from("catalog_sections" as any).insert([payload]);

    const { error } = await query;

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: currentSection.id ? "Раздел обновлён" : "Раздел создан" });
    setSectionDialogOpen(false);
    setCurrentSection(null);
    fetchCatalog();
  };

  const openCreateSubcategory = () => {
    setCurrentSubcategory(emptySubcategory(sections[0]?.id || ""));
    setSubcategoryDialogOpen(true);
  };

  const openEditSubcategory = (subcategory: CatalogSubcategory) => {
    setCurrentSubcategory({
      id: subcategory.id,
      section_id: subcategory.section_id,
      title: subcategory.title,
      slug: subcategory.slug,
      description: subcategory.description || "",
      image: subcategory.image ? [subcategory.image] : [],
      display_mode: subcategory.display_mode,
      sort_order: subcategory.sort_order,
      is_published: subcategory.is_published,
    });
    setSubcategoryDialogOpen(true);
  };

  const saveSubcategory = async () => {
    if (!currentSubcategory) return;

    const slug = generateSlug(currentSubcategory.slug || currentSubcategory.title);

    const payload = {
      section_id: currentSubcategory.section_id,
      title: currentSubcategory.title,
      slug,
      description: currentSubcategory.description || null,
      image: currentSubcategory.image[0] || null,
      display_mode: currentSubcategory.display_mode,
      sort_order: Number.isFinite(currentSubcategory.sort_order) ? currentSubcategory.sort_order : 0,
      is_published: currentSubcategory.is_published,
    };

    const query = currentSubcategory.id
      ? supabase.from("catalog_subcategories" as any).update(payload).eq("id", currentSubcategory.id)
      : supabase.from("catalog_subcategories" as any).insert([payload]);

    const { error } = await query;

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: currentSubcategory.id ? "Подкатегория обновлена" : "Подкатегория создана" });
    setSubcategoryDialogOpen(false);
    setCurrentSubcategory(null);
    fetchCatalog();
  };

  const openCreateProduct = () => {
    const defaultSectionId = sections[0]?.id || "";
    const defaultSubcategoryId = subcategories.find((subcategory) => subcategory.section_id === defaultSectionId)?.id || "";
    setCurrentProduct(emptyProduct(defaultSectionId, defaultSubcategoryId));
    setProductDialogOpen(true);
  };

  const openEditProduct = (product: CatalogProduct) => {
    setCurrentProduct({ ...product, overview: product.overview || "" });
    setProductDialogOpen(true);
  };

  const saveProduct = async () => {
    if (!currentProduct) return;

    const slug = generateSlug(currentProduct.slug || currentProduct.title);

    const normalizedMetrics = (currentProduct.hero_metrics || [])
      .map((metric) => ({
        label: metric.label?.trim() || "",
        value: metric.value?.trim() || "",
      }))
      .filter((metric) => metric.label && metric.value);

    const normalizedSections = (currentProduct.content_sections || [])
      .map((section) => ({
        title: section.title?.trim() || "",
        body: section.body?.trim() || "",
        items: (section.items || []).map((item) => item.trim()).filter(Boolean),
      }))
      .filter((section) => section.title || section.body || section.items.length > 0);

    const payload = {
      slug,
      title: currentProduct.title,
      excerpt: currentProduct.excerpt,
      overview: currentProduct.overview || null,
      price_from: Number.isFinite(currentProduct.price_from) ? currentProduct.price_from : 0,
      price_to: Number.isFinite(currentProduct.price_to) ? currentProduct.price_to : 0,
      icon: currentProduct.icon,
      usp: currentProduct.usp || [],
      hero_metrics: normalizedMetrics,
      content_sections: normalizedSections,
      specs_spans: currentProduct.specs_spans || null,
      specs_heights: currentProduct.specs_heights || null,
      specs_insulation: currentProduct.specs_insulation || null,
      specs_snow_load: currentProduct.specs_snow_load || null,
      specs_fire_resistance: currentProduct.specs_fire_resistance || null,
      applications: currentProduct.applications || [],
      gallery: currentProduct.gallery || [],
      is_published: currentProduct.is_published,
      section_id: currentProduct.section_id || null,
      subcategory_id: currentProduct.subcategory_id || null,
      sort_order: Number.isFinite(currentProduct.sort_order) ? currentProduct.sort_order : 0,
      catalog_card_title: currentProduct.catalog_card_title || null,
      catalog_card_description: currentProduct.catalog_card_description || null,
    };

    const query = currentProduct.id
      ? supabase.from("products").update(payload).eq("id", currentProduct.id)
      : supabase.from("products").insert([payload]);

    const { error } = await query;

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: currentProduct.id ? "Товар обновлён" : "Товар создан" });
    setProductDialogOpen(false);
    setCurrentProduct(null);
    fetchCatalog();
  };

  const togglePublished = async (type: DeleteState["type"], item: CatalogSection | CatalogSubcategory | CatalogProduct) => {
    const table = type === "section" ? ("catalog_sections" as any) : type === "subcategory" ? ("catalog_subcategories" as any) : "products";
    const { error } = await supabase
      .from(table)
      .update({ is_published: !(item as any).is_published })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    fetchCatalog();
  };

  const confirmDelete = (state: DeleteState) => {
    setDeleteState(state);
    setDeleteDialogOpen(true);
  };

  const deleteEntity = async () => {
    if (!deleteState) return;

    if (deleteState.type === "section") {
      const hasSubcategories = subcategories.some((subcategory) => subcategory.section_id === deleteState.item.id);
      const hasProducts = products.some((product) => product.section_id === deleteState.item.id);
      if (hasSubcategories || hasProducts) {
        toast({
          title: "Удаление недоступно",
          description: "Сначала удалите или перенесите вложенные подкатегории и товары.",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        return;
      }
    }

    if (deleteState.type === "subcategory") {
      const hasProducts = products.some((product) => product.subcategory_id === deleteState.item.id);
      if (hasProducts) {
        toast({
          title: "Удаление недоступно",
          description: "Сначала удалите или перенесите товары из этой подкатегории.",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        return;
      }
    }

    const table =
      deleteState.type === "section"
        ? ("catalog_sections" as any)
        : deleteState.type === "subcategory"
          ? ("catalog_subcategories" as any)
          : "products";

    const { error } = await supabase.from(table).delete().eq("id", deleteState.item.id);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Элемент удалён" });
    setDeleteDialogOpen(false);
    setDeleteState(null);
    fetchCatalog();
  };

  const updateMetric = (index: number, field: keyof ProductMetric, value: string) => {
    if (!currentProduct) return;
    const metrics = [...(currentProduct.hero_metrics || [])];
    metrics[index] = { ...metrics[index], [field]: value };
    setCurrentProduct({ ...currentProduct, hero_metrics: metrics });
  };

  const addMetric = () => {
    if (!currentProduct) return;
    setCurrentProduct({
      ...currentProduct,
      hero_metrics: [...(currentProduct.hero_metrics || []), { label: "", value: "" }],
    });
  };

  const removeMetric = (index: number) => {
    if (!currentProduct) return;
    setCurrentProduct({
      ...currentProduct,
      hero_metrics: (currentProduct.hero_metrics || []).filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const updateSection = (index: number, field: keyof ProductSection, value: string | string[]) => {
    if (!currentProduct) return;
    const sectionsState = [...(currentProduct.content_sections || [])];
    sectionsState[index] = { ...sectionsState[index], [field]: value };
    setCurrentProduct({ ...currentProduct, content_sections: sectionsState });
  };

  const addSection = () => {
    if (!currentProduct) return;
    setCurrentProduct({
      ...currentProduct,
      content_sections: [...(currentProduct.content_sections || []), { title: "", body: "", items: [] }],
    });
  };

  const removeSection = (index: number) => {
    if (!currentProduct) return;
    setCurrentProduct({
      ...currentProduct,
      content_sections: (currentProduct.content_sections || []).filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const updateCurrentProductSection = (sectionId: string) => {
    if (!currentProduct) return;
    const matchingSubcategory = subcategories.find((subcategory) => subcategory.section_id === sectionId);
    setCurrentProduct({
      ...currentProduct,
      section_id: sectionId,
      subcategory_id: matchingSubcategory?.id || null,
    });
  };

  const runAutoFill = async () => {
    const productIds = (aiScope === "filtered" ? filteredProducts : products).map((p) => p.id);
    if (productIds.length === 0) {
      toast({ title: "Нет товаров для заполнения", variant: "destructive" });
      return;
    }
    setAiRunning(true);
    setAiProgress({ done: 0, total: productIds.length });
    let ok = 0;
    let skipped = 0;
    let errors = 0;
    try {
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        try {
          const { data, error } = await supabase.functions.invoke("auto-fill-products", {
            body: { productId, mode: aiMode },
          });
          if (error) throw error;
          const status = (data as { status?: string })?.status;
          if (status === "ok") ok++;
          else if (status === "skipped") skipped++;
          else errors++;
        } catch (e) {
          errors++;
          console.error("auto-fill error", productId, e);
        }
        setAiProgress({ done: i + 1, total: productIds.length });
      }
      toast({
        title: "Автозаполнение завершено",
        description: `Заполнено: ${ok}, пропущено: ${skipped}, ошибок: ${errors} из ${productIds.length}`,
      });
      setAiDialogOpen(false);
      await fetchCatalog();
    } catch (e: any) {
      toast({
        title: "Ошибка автозаполнения",
        description: e?.message || "Попробуйте позже",
        variant: "destructive",
      });
    } finally {
      setAiRunning(false);
      setAiProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по каталогу..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchCatalog} disabled={loading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          {activeTab === "sections" && (
            <Button onClick={openCreateSection}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить раздел
            </Button>
          )}
          {activeTab === "subcategories" && (
            <Button onClick={openCreateSubcategory}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить подкатегорию
            </Button>
          )}
          {activeTab === "products" && (
            <>
              <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Автозаполнить ИИ
              </Button>
              <Button onClick={openCreateProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить товар
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Разделы</p>
          <p className="text-2xl font-bold">{sections.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Подкатегории</p>
          <p className="text-2xl font-bold">{subcategories.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Товары</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Опубликовано</p>
          <p className="text-2xl font-bold text-primary">
            {sections.filter((item) => item.is_published).length + subcategories.filter((item) => item.is_published).length + products.filter((item) => item.is_published).length}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">Разделы</TabsTrigger>
          <TabsTrigger value="subcategories">Подкатегории</TabsTrigger>
          <TabsTrigger value="products">Товары</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          {filteredSections.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Разделы не найдены</p>
            </div>
          ) : (
            filteredSections.map((section) => {
              const IconComponent = getCatalogIcon(section.icon);
              const stats = sectionStats[section.id] || { subcategories: 0, products: 0 };
              return (
                <div key={section.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                          {!section.is_published && (
                            <Badge variant="outline">
                              <EyeOff className="mr-1 h-3 w-3" /> Скрыт
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">/{section.slug}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{section.description}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="rounded-full bg-secondary px-3 py-1">
                            {stats.subcategories} {pluralize(stats.subcategories, ["подкатегория", "подкатегории", "подкатегорий"])}
                          </span>
                          <span className="rounded-full bg-secondary px-3 py-1">
                            {stats.products} {pluralize(stats.products, ["товар", "товара", "товаров"])}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => togglePublished("section", section)}>
                        {section.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditSection(section)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete({ type: "section", item: section })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue placeholder="Фильтр по разделу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все разделы</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredSubcategories.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <FolderTree className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Подкатегории не найдены</p>
            </div>
          ) : (
            filteredSubcategories.map((subcategory) => {
              const parentSection = sectionMap.get(subcategory.section_id);
              return (
                <div key={subcategory.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{subcategory.title}</h3>
                        {!subcategory.is_published && (
                          <Badge variant="outline">
                            <EyeOff className="mr-1 h-3 w-3" /> Скрыта
                          </Badge>
                        )}
                        <Badge variant="secondary">{parentSection?.title || "Без раздела"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">/{subcategory.slug}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{subcategory.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="rounded-full bg-secondary px-3 py-1">
                          {subcategoryStats[subcategory.id] || 0} {pluralize(subcategoryStats[subcategory.id] || 0, ["товар", "товара", "товаров"])}
                        </span>
                        <span className="rounded-full bg-secondary px-3 py-1">
                          Режим: {subcategory.display_mode === "list" ? "список" : "гибрид"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => togglePublished("subcategory", subcategory)}>
                        {subcategory.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditSubcategory(subcategory)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete({ type: "subcategory", item: subcategory })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue placeholder="Фильтр по разделу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все разделы</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Фильтр по подкатегории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все подкатегории</SelectItem>
                {subcategories
                  .filter((subcategory) => sectionFilter === "all" || subcategory.section_id === sectionFilter)
                  .map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Товары не найдены</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const parentSection = product.section_id ? sectionMap.get(product.section_id) : null;
              const parentSubcategory = product.subcategory_id ? subcategoryMap.get(product.subcategory_id) : null;
              return (
                <div key={product.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{product.title}</h3>
                        {!product.is_published && (
                          <Badge variant="outline">
                            <EyeOff className="mr-1 h-3 w-3" /> Скрыт
                          </Badge>
                        )}
                        {parentSection && <Badge variant="secondary">{parentSection.title}</Badge>}
                        {parentSubcategory && <Badge variant="outline">{parentSubcategory.title}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">/{product.slug}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{product.excerpt}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="font-medium text-primary">
                          от {formatPrice(product.price_from)} ₽/м²
                        </span>
                        <span className="text-muted-foreground">Сортировка: {product.sort_order}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => togglePublished("product", product)}>
                        {product.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete({ type: "product", item: product })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentSection?.id ? "Редактировать раздел" : "Новый раздел"}</DialogTitle>
          </DialogHeader>
          {currentSection && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={currentSection.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setCurrentSection({
                        ...currentSection,
                        title,
                        slug: shouldSyncSlug(currentSection.slug, currentSection.title)
                          ? generateSlug(title)
                          : currentSection.slug,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={currentSection.slug} onChange={(event) => setCurrentSection({ ...currentSection, slug: generateSlug(event.target.value) })} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Иконка</Label>
                  <Input value={currentSection.icon} onChange={(event) => setCurrentSection({ ...currentSection, icon: event.target.value })} />
                </div>
                <div>
                  <Label>Порядок</Label>
                  <Input
                    type="number"
                    value={currentSection.sort_order}
                    onChange={(event) => setCurrentSection({ ...currentSection, sort_order: Number(event.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea value={currentSection.description} onChange={(event) => setCurrentSection({ ...currentSection, description: event.target.value })} rows={4} />
              </div>
              <div>
                <Label>Изображение</Label>
                <ImageUpload value={currentSection.image} onChange={(urls) => setCurrentSection({ ...currentSection, image: urls.slice(0, 1) })} folder="catalog-sections" maxImages={1} single />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Публикация</p>
                  <p className="text-sm text-muted-foreground">Опубликованный раздел виден на сайте</p>
                </div>
                <Button variant={currentSection.is_published ? "default" : "outline"} onClick={() => setCurrentSection({ ...currentSection, is_published: !currentSection.is_published })}>
                  {currentSection.is_published ? "Опубликован" : "Скрыт"}
                </Button>
              </div>
              <Button onClick={saveSection} className="w-full">Сохранить раздел</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentSubcategory?.id ? "Редактировать подкатегорию" : "Новая подкатегория"}</DialogTitle>
          </DialogHeader>
          {currentSubcategory && (
            <div className="space-y-4">
              <div>
                <Label>Раздел</Label>
                <Select value={currentSubcategory.section_id} onValueChange={(value) => setCurrentSubcategory({ ...currentSubcategory, section_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите раздел" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={currentSubcategory.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setCurrentSubcategory({
                        ...currentSubcategory,
                        title,
                        slug: shouldSyncSlug(currentSubcategory.slug, currentSubcategory.title)
                          ? generateSlug(title)
                          : currentSubcategory.slug,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={currentSubcategory.slug}
                    onChange={(event) => setCurrentSubcategory({ ...currentSubcategory, slug: generateSlug(event.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Порядок</Label>
                  <Input
                    type="number"
                    value={currentSubcategory.sort_order}
                    onChange={(event) => setCurrentSubcategory({ ...currentSubcategory, sort_order: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <Label>Режим открытия</Label>
                  <Select value={currentSubcategory.display_mode} onValueChange={(value) => setCurrentSubcategory({ ...currentSubcategory, display_mode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hybrid">Гибрид</SelectItem>
                      <SelectItem value="list">Всегда список</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea value={currentSubcategory.description} onChange={(event) => setCurrentSubcategory({ ...currentSubcategory, description: event.target.value })} rows={4} />
              </div>
              <div>
                <Label>Изображение</Label>
                <ImageUpload value={currentSubcategory.image} onChange={(urls) => setCurrentSubcategory({ ...currentSubcategory, image: urls.slice(0, 1) })} folder="catalog-subcategories" maxImages={1} single />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Публикация</p>
                  <p className="text-sm text-muted-foreground">Опубликованная подкатегория доступна на сайте</p>
                </div>
                <Button variant={currentSubcategory.is_published ? "default" : "outline"} onClick={() => setCurrentSubcategory({ ...currentSubcategory, is_published: !currentSubcategory.is_published })}>
                  {currentSubcategory.is_published ? "Опубликована" : "Скрыта"}
                </Button>
              </div>
              <Button onClick={saveSubcategory} className="w-full">Сохранить подкатегорию</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentProduct?.id ? "Редактировать товар" : "Новый товар"}</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <Label>Slug</Label>
                  <Input value={currentProduct.slug} onChange={(event) => setCurrentProduct({ ...currentProduct, slug: generateSlug(event.target.value) })} />
                </div>
                <div>
                  <Label>Иконка</Label>
                  <Input value={currentProduct.icon} onChange={(event) => setCurrentProduct({ ...currentProduct, icon: event.target.value })} />
                </div>
                <div>
                  <Label>Раздел</Label>
                  <Select value={currentProduct.section_id || ""} onValueChange={updateCurrentProductSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите раздел" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Подкатегория</Label>
                  <Select
                    value={currentProduct.subcategory_id || ""}
                    onValueChange={(value) => setCurrentProduct({ ...currentProduct, subcategory_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите подкатегорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategoriesForForm.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={currentProduct.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setCurrentProduct({
                        ...currentProduct,
                        title,
                        slug: shouldSyncSlug(currentProduct.slug, currentProduct.title)
                          ? generateSlug(title)
                          : currentProduct.slug,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Порядок</Label>
                  <Input
                    type="number"
                    value={currentProduct.sort_order}
                    onChange={(event) => setCurrentProduct({ ...currentProduct, sort_order: Number(event.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Краткое описание</Label>
                <Textarea value={currentProduct.excerpt} onChange={(event) => setCurrentProduct({ ...currentProduct, excerpt: event.target.value })} rows={3} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Заголовок карточки каталога</Label>
                  <Input
                    value={currentProduct.catalog_card_title || ""}
                    onChange={(event) => setCurrentProduct({ ...currentProduct, catalog_card_title: event.target.value })}
                  />
                </div>
                <div>
                  <Label>Описание карточки каталога</Label>
                  <Input
                    value={currentProduct.catalog_card_description || ""}
                    onChange={(event) => setCurrentProduct({ ...currentProduct, catalog_card_description: event.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Расширенное описание</Label>
                <Textarea value={currentProduct.overview || ""} onChange={(event) => setCurrentProduct({ ...currentProduct, overview: event.target.value })} rows={5} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <Label>Цена от (₽/м²)</Label>
                  <Input
                    type="number"
                    value={currentProduct.price_from}
                    onChange={(event) => setCurrentProduct({ ...currentProduct, price_from: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <Label>Пролёты</Label>
                  <Input value={currentProduct.specs_spans || ""} onChange={(event) => setCurrentProduct({ ...currentProduct, specs_spans: event.target.value })} />
                </div>
                <div>
                  <Label>Высоты</Label>
                  <Input value={currentProduct.specs_heights || ""} onChange={(event) => setCurrentProduct({ ...currentProduct, specs_heights: event.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Утепление</Label>
                  <Input value={currentProduct.specs_insulation || ""} onChange={(event) => setCurrentProduct({ ...currentProduct, specs_insulation: event.target.value })} />
                </div>
                <div>
                  <Label>Снеговая нагрузка</Label>
                  <Input value={currentProduct.specs_snow_load || ""} onChange={(event) => setCurrentProduct({ ...currentProduct, specs_snow_load: event.target.value })} />
                </div>
                <div>
                  <Label>Огнестойкость</Label>
                  <Input value={currentProduct.specs_fire_resistance || ""} onChange={(event) => setCurrentProduct({ ...currentProduct, specs_fire_resistance: event.target.value })} />
                </div>
              </div>

              <div>
                <Label>USP (через запятую)</Label>
                <Input
                  value={currentProduct.usp.join(", ")}
                  onChange={(event) => setCurrentProduct({ ...currentProduct, usp: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
                />
              </div>

              <div>
                <Label>Применение (через запятую)</Label>
                <Input
                  value={currentProduct.applications.join(", ")}
                  onChange={(event) => setCurrentProduct({ ...currentProduct, applications: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
                />
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Метрики в шапке</Label>
                    <p className="text-sm text-muted-foreground">Например: ветровой район, пролёт, срок работ</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить метрику
                  </Button>
                </div>
                <div className="space-y-3">
                  {(currentProduct.hero_metrics || []).map((metric, index) => (
                    <div key={`${metric.label}-${index}`} className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center rounded-lg border border-border p-3">
                      <Grip className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Значение" value={metric.value} onChange={(event) => updateMetric(index, "value", event.target.value)} />
                      <Input placeholder="Подпись" value={metric.label} onChange={(event) => updateMetric(index, "label", event.target.value)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeMetric(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Контентные секции</Label>
                    <p className="text-sm text-muted-foreground">Большие смысловые блоки страницы продукции</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSection}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить секцию
                  </Button>
                </div>
                <div className="space-y-4">
                  {(currentProduct.content_sections || []).map((sectionItem, index) => (
                    <div key={`${sectionItem.title}-${index}`} className="space-y-3 rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Grip className="h-4 w-4" />
                          Секция {index + 1}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Заголовок секции</Label>
                        <Input value={sectionItem.title} onChange={(event) => updateSection(index, "title", event.target.value)} />
                      </div>
                      <div>
                        <Label>Основной текст</Label>
                        <Textarea rows={5} value={sectionItem.body} onChange={(event) => updateSection(index, "body", event.target.value)} />
                      </div>
                      <div>
                        <Label>Пункты списка (каждый с новой строки)</Label>
                        <Textarea
                          rows={4}
                          value={sectionItem.items.join("\n")}
                          onChange={(event) => updateSection(index, "items", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Галерея</Label>
                <ImageUpload value={currentProduct.gallery || []} onChange={(urls) => setCurrentProduct({ ...currentProduct, gallery: urls })} folder="products" maxImages={10} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Публикация</p>
                  <p className="text-sm text-muted-foreground">Опубликованный товар виден на сайте и в каталоге</p>
                </div>
                <Button variant={currentProduct.is_published ? "default" : "outline"} onClick={() => setCurrentProduct({ ...currentProduct, is_published: !currentProduct.is_published })}>
                  {currentProduct.is_published ? "Опубликован" : "Скрыт"}
                </Button>
              </div>

              <Button onClick={saveProduct} className="w-full">Сохранить товар</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить элемент?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteState?.type === "section" && `Вы уверены, что хотите удалить раздел «${deleteState.item.title}»?`}
              {deleteState?.type === "subcategory" && `Вы уверены, что хотите удалить подкатегорию «${deleteState.item.title}»?`}
              {deleteState?.type === "product" && `Вы уверены, что хотите удалить товар «${deleteState.item.title}»?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEntity} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={aiDialogOpen} onOpenChange={(open) => !aiRunning && setAiDialogOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Автозаполнение карточек ИИ</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <p className="text-sm text-muted-foreground">
              ИИ соберёт данные через веб-поиск и заполнит описание, технические характеристики, USP, применение, метрики и текст карточки каталога. Поля slug, название, цены, изображения и публикация не изменяются. Процесс может занять несколько минут.
            </p>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Что заполнять</Label>
              <RadioGroup value={aiMode} onValueChange={(v) => setAiMode(v as "empty-only" | "all")}>
                <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value="empty-only" id="ai-mode-empty" className="mt-1" />
                  <Label htmlFor="ai-mode-empty" className="cursor-pointer font-normal">
                    Только пустые поля
                    <span className="block text-xs text-muted-foreground">Безопасный режим — существующие тексты сохраняются.</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value="all" id="ai-mode-all" className="mt-1" />
                  <Label htmlFor="ai-mode-all" className="cursor-pointer font-normal">
                    Перезаписать все
                    <span className="block text-xs text-muted-foreground">Заменит уже заполненные поля сгенерированными значениями.</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Какие товары</Label>
              <RadioGroup value={aiScope} onValueChange={(v) => setAiScope(v as "filtered" | "all")}>
                <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value="filtered" id="ai-scope-filtered" className="mt-1" />
                  <Label htmlFor="ai-scope-filtered" className="cursor-pointer font-normal">
                    Текущая выборка ({filteredProducts.length})
                    <span className="block text-xs text-muted-foreground">Учитываются активные фильтры и поиск.</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value="all" id="ai-scope-all" className="mt-1" />
                  <Label htmlFor="ai-scope-all" className="cursor-pointer font-normal">
                    Все товары ({products.length})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAiDialogOpen(false)} disabled={aiRunning}>
                Отмена
              </Button>
              <Button onClick={runAutoFill} disabled={aiRunning}>
                {aiRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {aiProgress ? `Обработка ${aiProgress.done}/${aiProgress.total}...` : "Идёт заполнение..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Запустить
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
