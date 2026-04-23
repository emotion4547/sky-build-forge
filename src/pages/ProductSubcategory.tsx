import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { CatalogProduct, CatalogSection, CatalogSubcategory, formatPrice, getCatalogIcon, normalizeProduct, pluralize } from "@/lib/catalog";

const ProductSubcategory = () => {
  const { sectionSlug, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState<CatalogSection | null>(null);
  const [subcategory, setSubcategory] = useState<CatalogSubcategory | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategory = async () => {
      if (!sectionSlug || !subcategorySlug) return;
      setLoading(true);

      const { data: sectionDataRaw } = await supabase
        .from("catalog_sections" as any)
        .select("*")
        .eq("slug", sectionSlug)
        .eq("is_published", true)
        .maybeSingle();

      const sectionData = (sectionDataRaw as unknown) as CatalogSection | null;

      if (!sectionData) {
        setSection(null);
        setSubcategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data: subcategoryDataRaw } = await supabase
        .from("catalog_subcategories" as any)
        .select("*")
        .eq("slug", subcategorySlug)
        .eq("section_id", sectionData.id)
        .eq("is_published", true)
        .maybeSingle();

      const subcategoryData = (subcategoryDataRaw as unknown) as CatalogSubcategory | null;

      if (!subcategoryData) {
        setSection(sectionData);
        setSubcategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("subcategory_id", subcategoryData.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      const normalizedProducts = (productsData || []).map(normalizeProduct);

      setSection(sectionData);
      setSubcategory(subcategoryData);
      setProducts(normalizedProducts);
      setLoading(false);

      if (subcategoryData.display_mode !== "list" && normalizedProducts.length === 1) {
        navigate(`/products/${normalizedProducts[0].slug}`, { replace: true });
      }
    };

    fetchSubcategory();
  }, [navigate, sectionSlug, subcategorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container space-y-6">
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!section || !subcategory) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Подкатегория не найдена.</p>
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
                <BreadcrumbLink asChild>
                  <Link to={`/products/section/${section.slug}`}>{section.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{subcategory.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">{subcategory.title}</h1>
                <p className="mt-4 max-w-3xl text-lg text-muted-foreground leading-8">{subcategory.description}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-secondary px-3 py-1">
                  {products.length} {pluralize(products.length, ["товар", "товара", "товаров"])}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1">
                  Режим: {subcategory.display_mode === "list" ? "список" : "гибрид"}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={subcategory.image || products[0]?.gallery?.[0] || section.image || "/placeholder.svg"}
                alt={subcategory.title}
                className="h-full w-full object-cover"
              />
            </div>
          </section>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              В этой подкатегории пока нет опубликованных решений.
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => {
                const image = product.gallery?.[0] || subcategory.image || section.image || "/placeholder.svg";

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card card-hover"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                      <img
                        src={image}
                        alt={product.catalog_card_title || product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-4 p-6">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {product.catalog_card_title || product.title}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {product.catalog_card_description || product.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-primary">от {formatPrice(product.price_from)} ₽/м²</span>
                        <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                          Подробнее
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
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

export default ProductSubcategory;
