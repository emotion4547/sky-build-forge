import { Warehouse, Factory, Building, Store, Car, Wheat, Heart, ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const iconMap: Record<string, LucideIcon> = {
  Warehouse,
  Factory,
  Building,
  Store,
  Car,
  Wheat,
  Heart,
};

interface BuildingType {
  icon: string;
  title: string;
  description: string;
  price: string;
  href: string;
  image: string;
}

const defaultBuildingTypes: BuildingType[] = [
  {
    icon: "Warehouse",
    title: "Склады",
    description: "Логистические комплексы, распределительные центры",
    price: "От 32 000 ₽/м²",
    href: "/products/sklad",
    image: "/images/products/sklad.jpg",
  },
  {
    icon: "Factory",
    title: "Производственные цеха",
    description: "Промышленные объекты любой сложности",
    price: "От 35 000 ₽/м²",
    href: "/products/tsekh",
    image: "/images/products/tsekh.jpg",
  },
  {
    icon: "Building",
    title: "Ангары",
    description: "Холодные и утеплённые ангары",
    price: "От 26 000 ₽/м²",
    href: "/products/angar",
    image: "/images/products/angar.jpg",
  },
  {
    icon: "Store",
    title: "Торговые павильоны",
    description: "Магазины, ТЦ, выставочные залы",
    price: "От 38 000 ₽/м²",
    href: "/products/pavilon",
    image: "/images/products/pavilon.jpg",
  },
  {
    icon: "Car",
    title: "СТО и автомойки",
    description: "Автосервисы, паркинги, мойки",
    price: "От 34 000 ₽/м²",
    href: "/products/sto",
    image: "/images/products/sto.jpg",
  },
  {
    icon: "Wheat",
    title: "Агро-ангары",
    description: "Зернохранилища, фермы, теплицы",
    price: "От 24 000 ₽/м²",
    href: "/products/agro",
    image: "/images/products/agro.jpg",
  },
  {
    icon: "Heart",
    title: "ФАП и медпункты",
    description: "Модульные медицинские объекты",
    price: "От 40 000 ₽/м²",
    href: "/products/fap",
    image: "/images/products/fap.jpg",
  },
];

export function BuildingTypesSection() {
  const { data: buildingTypes } = useSiteSettings<BuildingType[]>("building_types", defaultBuildingTypes);

  return (
    <section id="products" className="py-16 md:py-20 lg:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Наша специализация
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-foreground mb-4">
            Типы зданий
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Проектируем и строим промышленные объекты любой сложности с соблюдением всех норм и стандартов
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {buildingTypes.map((type, index) => {
            const IconComponent = iconMap[type.icon] || Warehouse;
            return (
              <Link
                key={type.title}
                to={type.href}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Cover Image */}
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <img 
                    src={type.image} 
                    alt={type.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60" />
                </div>
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/90 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <IconComponent className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">{type.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{type.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{type.price}</span>
                    <span className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
