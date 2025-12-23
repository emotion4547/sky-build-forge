import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/data/products";
import { getProjectsByProductType } from "@/data/projects";
import { Calculator, Phone, ChevronRight } from "lucide-react";

const ProductDetail = () => {
  const { slug } = useParams();
  const product = getProductBySlug(slug || "");
  const relatedProjects = getProjectsByProductType(slug || "");

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Продукт не найден</div>;
  }

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
                {product.priceFrom.toLocaleString()} – {product.priceTo.toLocaleString()} ₽/м²
              </p>
              <ul className="space-y-2 mb-8">
                {product.usp.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild><Link to="/calculators"><Calculator className="mr-2 h-4 w-4" />Рассчитать стоимость</Link></Button>
                <Button variant="outline" asChild><Link to="/contacts"><Phone className="mr-2 h-4 w-4" />Консультация</Link></Button>
              </div>
            </div>
            <div className="bg-secondary rounded-xl aspect-video" />
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-bold font-display mb-6">Технические характеристики</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {relatedProjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">Реализованные проекты</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.slice(0, 3).map(project => (
                  <Link key={project.slug} to={`/projects/${project.slug}`} className="card-hover bg-card border border-border rounded-xl p-4">
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.area} м² • {project.termWeeks} нед.</p>
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
