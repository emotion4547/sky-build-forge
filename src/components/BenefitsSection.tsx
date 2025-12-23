import { Clock, Maximize, Award, Shield, Wrench, Truck, LucideIcon } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

const defaultBenefits: BenefitItem[] = [
  { icon: "Clock", title: "Сроки от 6 недель", description: "Быстрое проектирование и возведение благодаря готовым конструктивным решениям" },
  { icon: "Maximize", title: "Пролёты до 60 м", description: "Большие пролёты без промежуточных опор для максимальной полезной площади" },
  { icon: "Award", title: "Сертификация СРО", description: "Все необходимые лицензии на проектирование и строительство" },
  { icon: "Shield", title: "Гарантия 5 лет", description: "Полная гарантия на конструкции и выполненные работы" },
  { icon: "Wrench", title: "Своё производство", description: "Собственный завод металлоконструкций — контроль качества на всех этапах" },
  { icon: "Truck", title: "Доставка по ПФО", description: "Логистика по всем регионам Приволжского федерального округа" },
];

const iconMap: Record<string, LucideIcon> = {
  Clock, Maximize, Award, Shield, Wrench, Truck
};

export function BenefitsSection() {
  const { data: benefits } = useSiteSettings<BenefitItem[]>("benefits", defaultBenefits);

  return (
    <section id="benefits" className="py-16 md:py-20 lg:py-24 bg-secondary/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Почему мы
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-foreground mb-4">
            Преимущества работы с нами
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Комплексный подход к строительству: от проекта до сдачи объекта под ключ
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon] || Shield;
            return (
              <div
                key={benefit.title}
                className="bg-card rounded-2xl p-8 border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
