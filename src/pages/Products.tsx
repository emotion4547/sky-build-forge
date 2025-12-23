import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { Warehouse, Factory, Building, Store, Car, Wheat, Heart, Building2, ArrowRight } from "lucide-react";

const iconMap: Record<string, any> = {
  Warehouse, Factory, Building, Store, Car, Wheat, Heart, Building2
};

const Products = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Продукция</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Быстровозводимые здания для любых задач: от складов до медицинских объектов
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = iconMap[product.icon] || Building;
              return (
                <Link
                  key={product.slug}
                  to={`/products/${product.slug}`}
                  className="group card-hover bg-card rounded-xl p-6 border border-border"
                >
                  <div className="icon-box mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">{product.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4">{product.excerpt}</p>
                  <p className="text-primary font-medium mb-4">
                    От {product.priceFrom.toLocaleString()} ₽/м²
                  </p>
                  <span className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Подробнее <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
