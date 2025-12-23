import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Warehouse, Factory, Building, Store, Car, Wheat, Heart, Building2, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/PaginationControls";

const iconMap: Record<string, any> = {
  Warehouse, Factory, Building, Store, Car, Wheat, Heart, Building2
};

interface Product {
  slug: string;
  title: string;
  excerpt: string;
  icon: string;
  price_from: number;
  gallery: string[] | null;
}

const ITEMS_PER_PAGE = 9;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("slug, title, excerpt, icon, price_from, gallery")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              ))
            ) : (
              paginatedProducts.map((product) => {
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
                      От {product.price_from.toLocaleString()} ₽/м²
                    </p>
                    <span className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      Подробнее <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
