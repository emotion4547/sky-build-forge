import { Clock, Maximize, Award } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Сроки от 6 недель",
    description: "Быстрое проектирование и возведение",
  },
  {
    icon: Maximize,
    title: "Большие пролёты",
    description: "До 60 метров без промежуточных опор",
  },
  {
    icon: Award,
    title: "Сертификация СРО",
    description: "Лицензии на проектирование и строительство",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-16 md:py-20 lg:py-24 bg-secondary/30">
      <div className="container">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-12 md:mb-16">
          Преимущества работы с нами
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="flex flex-col items-center text-center p-6"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="icon-box mb-5">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
