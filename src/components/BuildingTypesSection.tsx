import { Warehouse, Factory, Building, Store, Car, Wheat, Heart, ArrowRight } from "lucide-react";

const buildingTypes = [
  {
    icon: Warehouse,
    title: "Склады",
    price: "От 32 000 ₽/м²",
    href: "#",
  },
  {
    icon: Factory,
    title: "Производственные цеха",
    price: "От 35 000 ₽/м²",
    href: "#",
  },
  {
    icon: Building,
    title: "Ангары",
    price: "От 26 000 ₽/м²",
    href: "#",
  },
  {
    icon: Store,
    title: "Торговые павильоны",
    price: "От 38 000 ₽/м²",
    href: "#",
  },
  {
    icon: Car,
    title: "СТО и автомойки",
    price: "От 34 000 ₽/м²",
    href: "#",
  },
  {
    icon: Wheat,
    title: "Агро-ангары",
    price: "От 24 000 ₽/м²",
    href: "#",
  },
  {
    icon: Heart,
    title: "ФАП и медпункты",
    price: "От 40 000 ₽/м²",
    href: "#",
  },
];

export function BuildingTypesSection() {
  return (
    <section id="products" className="py-16 md:py-20 lg:py-24 bg-background">
      <div className="container">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-12 md:mb-16">
          Типы зданий
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {buildingTypes.map((type, index) => (
            <a
              key={type.title}
              href={type.href}
              className="group card-hover bg-card rounded-xl p-6 border border-border flex flex-col items-center text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="icon-box mb-4">
                <type.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{type.title}</h3>
              <p className="text-sm text-primary font-medium mb-4">{type.price}</p>
              <span className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Подробнее
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
