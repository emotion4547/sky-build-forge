import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calculator, Phone, ZoomIn } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ImageLightbox } from "@/components/ImageLightbox";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct, CatalogSection, CatalogSubcategory, normalizeProduct } from "@/lib/catalog";

interface Project {
  slug: string;
  title: string;
  area: number;
  term_weeks: number;
}

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [section, setSection] = useState<CatalogSection | null>(null);
  const [subcategory, setSubcategory] = useState<CatalogSubcategory | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!productData) {
        setProduct(null);
        setSection(null);
        setSubcategory(null);
        setRelatedProjects([]);
        setLoading(false);
        return;
      }

      const normalizedProduct = normalizeProduct(productData);
      setProduct(normalizedProduct);

      const queries: Promise<any>[] = [
        supabase
          .from("projects")
          .select("slug, title, area, term_weeks")
          .eq("product_type", slug)
          .eq("is_published", true)
          .limit(3),
      ];

      if (normalizedProduct.section_id) {
        queries.push(
          supabase
            .from("catalog_sections" as any)
            .select("*")
            .eq("id", normalizedProduct.section_id)
            .maybeSingle(),
        );
      }

      if (normalizedProduct.subcategory_id) {
        queries.push(
          supabase
            .from("catalog_subcategories" as any)
            .select("*")
            .eq("id", normalizedProduct.subcategory_id)
            .maybeSingle(),
        );
      }

      const responses = await Promise.all(queries);
      const [projectsResponse, sectionResponse, subcategoryResponse] = responses;

      setRelatedProjects(projectsResponse?.data || []);
      setSection((sectionResponse?.data as CatalogSection | undefined) || null);
      setSubcategory((subcategoryResponse?.data as CatalogSubcategory | undefined) || null);
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container space-y-6">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Продукт не найден</p>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = {
    "Пролёты": product.specs_spans,
    "Высоты": product.specs_heights,
    "Утепление": product.specs_insulation,
    "Снеговая нагрузка": product.specs_snow_load,
    "Огнестойкость": product.specs_fire_resistance,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <Breadcrumb className="mb-6">
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
              {section && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/products/section/${section.slug}`}>{section.title}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              {section && subcategory && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/products/section/${section.slug}/${subcategory.slug}`}>{subcategory.title}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">{product.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{product.excerpt}</p>
              <p className="text-2xl font-bold text-primary mb-6">
                {product.price_from.toLocaleString("ru-RU")} – {product.price_to.toLocaleString("ru-RU")} ₽/м²
              </p>
              {product.hero_metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
                  {product.hero_metrics.map((metric) => (
                    <div key={`${metric.label}-${metric.value}`} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-lg font-semibold text-foreground">{metric.value}</p>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {product.usp.length > 0 && (
                <ul className="space-y-2 mb-8">
                  {product.usp.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link to="/calculators">
                    <Calculator className="mr-2 h-4 w-4" />
                    Рассчитать стоимость
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contacts">
                    <Phone className="mr-2 h-4 w-4" />
                    Консультация
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => openLightbox(0)}
                className="relative w-full aspect-video bg-secondary rounded-xl overflow-hidden group cursor-pointer"
              >
                {product.gallery && product.gallery[0] && (
                  <img
                    src={product.gallery[0]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-full p-3">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>
              </button>

              {product.gallery && product.gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.gallery.slice(1, 5).map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => openLightbox(index + 1)}
                      className="relative aspect-video rounded-lg overflow-hidden bg-secondary group cursor-pointer"
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors" />
                      {index === 3 && product.gallery && product.gallery.length > 5 && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="text-lg font-semibold">+{product.gallery.length - 5}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {product.gallery && product.gallery.length > 0 && (
            <ImageLightbox
              images={product.gallery}
              initialIndex={lightboxIndex}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />
          )}

          <section className="mb-16">
            {product.overview && (
              <div className="mb-8 max-w-4xl">
                <h2 className="text-2xl font-bold font-display mb-4">О проекте</h2>
                <p className="text-base leading-7 text-muted-foreground whitespace-pre-line">{product.overview}</p>
              </div>
            )}

            <h2 className="text-2xl font-bold font-display mb-6">Технические характеристики</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(specs).map(
                ([key, value]) =>
                  value && (
                    <div key={key} className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">{key}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ),
              )}
            </div>
          </section>

          {product.content_sections.length > 0 && (
            <section className="mb-16 space-y-8">
              {product.content_sections.map((sectionItem, index) => (
                <div key={`${sectionItem.title}-${index}`} className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-8">
                  <div>
                    <h2 className="text-2xl font-bold font-display">{sectionItem.title}</h2>
                  </div>
                  <div className="space-y-4">
                    {sectionItem.body && (
                      <p className="text-base leading-7 text-muted-foreground whitespace-pre-line">{sectionItem.body}</p>
                    )}
                    {sectionItem.items.length > 0 && (
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {sectionItem.items.map((item) => (
                          <li key={item} className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-foreground">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {relatedProjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">Реализованные проекты</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map((project) => (
                  <Link
                    key={project.slug}
                    to={`/projects/${project.slug}`}
                    className="card-hover bg-card border border-border rounded-xl p-4"
                  >
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.area} м² • {project.term_weeks} нед.
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
