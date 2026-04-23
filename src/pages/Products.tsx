import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct, CatalogSection, CatalogSubcategory, getCatalogIcon, normalizeProduct, pluralize } from "@/lib/catalog";

const Products = () => {
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      const [sectionsResponse, subcategoriesResponse, productsResponse] = await Promise.all([
        supabase
          .from("catalog_sections" as any)
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
        supabase
          .from("catalog_subcategories" as any)
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

      setSections((sectionsResponse.data as CatalogSection[]) || []);
      setSubcategories((subcategoriesResponse.data as CatalogSubcategory[]) || []);
      setProducts((productsResponse.data || []).map(normalizeProduct));
      setLoading(false);
    };

    fetchCatalog();
  }, []);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return sections;

    return sections.filter((section) => {
      const sectionSubcategories = subcategories.filter((subcategory) => subcategory.section_id === section.id);
      const sectionProducts = products.filter((product) => product.section_id === section.id);

      return [
        section.title,
        section.description || "",
        ...sectionSubcategories.map((subcategory) => `${subcategory.title} ${subcategory.description || ""}`),
        ...sectionProducts.map((product) => `${product.title} ${product.excerpt}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchQuery, sections, subcategories, products]);

  const counts = useMemo(() => {
    return sections.reduce<Record<string, { subcategories: number; products: number }>>((acc, section) => {
      acc[section.id] = {
        subcategories: subcategories.filter((subcategory) => subcategory.section_id === section.id).length,
        products: products.filter((product) => product.section_id === section.id).length,
      };
      return acc;
    }, {});
  }, [sections, subcategories, products]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container space-y-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Главная</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Продукция</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Каталог решений
              </span>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold font-display text-foreground">Продукция</h1>
              <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
                Выберите нужный раздел каталога, чтобы перейти к подкатегориям и страницам конкретных решений.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по разделам и решениям..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
          </section>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="space-y-3 p-6">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              По вашему запросу разделы каталога не найдены.
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSections.map((section) => {
                const IconComponent = getCatalogIcon(section.icon);
                const image = section.image || products.find((product) => product.section_id === section.id)?.gallery?.[0] || "/placeholder.svg";
                const sectionCounts = counts[section.id] || { subcategories: 0, products: 0 };

                return (
                  <Link
                    key={section.id}
                    to={`/products/section/${section.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card card-hover"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                      <img
                        src={image}
                        alt={section.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/5" />
                      <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/90 text-primary-foreground shadow-sm">
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-4 p-6">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                        <p className="text-muted-foreground leading-7">{section.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="rounded-full bg-secondary px-3 py-1">
                          {sectionCounts.subcategories} {pluralize(sectionCounts.subcategories, ["подкатегория", "подкатегории", "подкатегорий"])}
                        </span>
                        <span className="rounded-full bg-secondary px-3 py-1">
                          {sectionCounts.products} {pluralize(sectionCounts.products, ["решение", "решения", "решений"])}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        Перейти в раздел
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
