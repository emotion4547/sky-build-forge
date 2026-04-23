import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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

const ProductSection = () => {
  const { sectionSlug } = useParams();
  const [section, setSection] = useState<CatalogSection | null>(null);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      if (!sectionSlug) return;
      setLoading(true);

      const { data: sectionData } = await supabase
        .from("catalog_sections" as any)
        .select("*")
        .eq("slug", sectionSlug)
        .eq("is_published", true)
        .maybeSingle();

      if (!sectionData) {
        setSection(null);
        setSubcategories([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      const [subcategoriesResponse, productsResponse] = await Promise.all([
        supabase
          .from("catalog_subcategories" as any)
          .select("*")
          .eq("section_id", sectionData.id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("section_id", sectionData.id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

      setSection(sectionData as CatalogSection);
      setSubcategories((subcategoriesResponse.data as CatalogSubcategory[]) || []);
      setProducts((productsResponse.data || []).map(normalizeProduct));
      setLoading(false);
    };

    fetchSection();
  }, [sectionSlug]);

  const productsBySubcategory = useMemo(() => {
    return products.reduce<Record<string, CatalogProduct[]>>((acc, product) => {
      if (!product.subcategory_id) return acc;
      acc[product.subcategory_id] = [...(acc[product.subcategory_id] || []), product];
      return acc;
    }, {});
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container space-y-6">
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-72 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Раздел каталога не найден.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = getCatalogIcon(section.icon);

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
                <BreadcrumbLink asChild>
                  <Link to="/products">Продукция</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{section.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">{section.title}</h1>
                <p className="mt-4 max-w-3xl text-lg text-muted-foreground leading-8">{section.description}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-secondary px-3 py-1">
                  {subcategories.length} {pluralize(subcategories.length, ["подкатегория", "подкатегории", "подкатегорий"])}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1">
                  {products.length} {pluralize(products.length, ["решение", "решения", "решений"])}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={section.image || products[0]?.gallery?.[0] || "/placeholder.svg"}
                alt={section.title}
                className="h-full w-full object-cover"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subcategories.map((subcategory) => {
              const subcategoryProducts = productsBySubcategory[subcategory.id] || [];
              const image = subcategory.image || subcategoryProducts[0]?.gallery?.[0] || section.image || "/placeholder.svg";

              return (
                <Link
                  key={subcategory.id}
                  to={`/products/section/${section.slug}/${subcategory.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card card-hover"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <img
                      src={image}
                      alt={subcategory.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/10" />
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">{subcategory.title}</h2>
                      <p className="mt-2 text-muted-foreground leading-7">{subcategory.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="rounded-full bg-secondary px-3 py-1">
                        {subcategoryProducts.length} {pluralize(subcategoryProducts.length, ["товар", "товара", "товаров"])}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1">
                        {subcategory.display_mode === "list" ? "Список" : "Гибрид"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      Открыть подкатегорию
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductSection;
