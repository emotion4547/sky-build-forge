import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Phone, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  slug: string;
  title: string;
  excerpt: string;
  price_from: number;
  price_to: number;
  usp: string[] | null;
  specs_spans: string | null;
  specs_heights: string | null;
  specs_insulation: string | null;
  specs_snow_load: string | null;
  specs_fire_resistance: string | null;
  gallery: string[] | null;
}

interface Project {
  slug: string;
  title: string;
  area: number;
  term_weeks: number;
}

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (productData) {
        setProduct(productData);
        
        // Fetch related projects
        const { data: projectsData } = await supabase
          .from("projects")
          .select("slug, title, area, term_weeks")
          .eq("product_type", slug)
          .eq("is_published", true)
          .limit(3);
        
        if (projectsData) {
          setRelatedProjects(projectsData);
        }
      }
      setLoading(false);
    };

    if (slug) fetchData();
  }, [slug]);

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
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-foreground">Продукция</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">{product.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{product.excerpt}</p>
              <p className="text-2xl font-bold text-primary mb-6">
                {product.price_from.toLocaleString()} – {product.price_to.toLocaleString()} ₽/м²
              </p>
              {product.usp && product.usp.length > 0 && (
                <ul className="space-y-2 mb-8">
                  {product.usp.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
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
            <div className="aspect-video bg-secondary rounded-xl overflow-hidden">
              {product.gallery && product.gallery[0] && (
                <img 
                  src={product.gallery[0]} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-bold font-display mb-6">Технические характеристики</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(specs).map(([key, value]) => 
                value && (
                  <div key={key} className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                )
              )}
            </div>
          </section>

          {relatedProjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">Реализованные проекты</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map(project => (
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
