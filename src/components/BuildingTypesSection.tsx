import { Warehouse, Factory, Building, Store, Car, Wheat, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const buildingTypes = [
  {
    icon: Warehouse,
    title: "Склады",
    description: "Логистические комплексы, распределительные центры",
    price: "От 32 000 ₽/м²",
    href: "/products/sklady",
    color: "from-blue-500/10 to-blue-600/5",
  },
  {
    icon: Factory,
    title: "Производственные цеха",
    description: "Промышленные объекты любой сложности",
    price: "От 35 000 ₽/м²",
    href: "/products/proizvodstvennye-tsexa",
    color: "from-orange-500/10 to-orange-600/5",
  },
  {
    icon: Building,
    title: "Ангары",
    description: "Холодные и утеплённые ангары",
    price: "От 26 000 ₽/м²",
    href: "/products/angary",
    color: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    icon: Store,
    title: "Торговые павильоны",
    description: "Магазины, ТЦ, выставочные залы",
    price: "От 38 000 ₽/м²",
    href: "/products/torgovye-pavilony",
    color: "from-purple-500/10 to-purple-600/5",
  },
  {
    icon: Car,
    title: "СТО и автомойки",
    description: "Автосервисы, паркинги, мойки",
    price: "От 34 000 ₽/м²",
    href: "/products/sto-avtomoyki",
    color: "from-red-500/10 to-red-600/5",
  },
  {
    icon: Wheat,
    title: "Агро-ангары",
    description: "Зернохранилища, фермы, теплицы",
    price: "От 24 000 ₽/м²",
    href: "/products/agro-angary",
    color: "from-green-500/10 to-green-600/5",
  },
  {
    icon: Heart,
    title: "ФАП и медпункты",
    description: "Модульные медицинские объекты",
    price: "От 40 000 ₽/м²",
    href: "/products/fap-medpunkty",
    color: "from-pink-500/10 to-pink-600/5",
  },
];

export function BuildingTypesSection() {
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
          {buildingTypes.map((type, index) => (
            <Link
              key={type.title}
              to={type.href}
              className="group relative bg-card rounded-2xl p-6 border border-border overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <type.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{type.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">{type.price}</span>
                  <span className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
