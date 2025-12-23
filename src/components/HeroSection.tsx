import { Button } from "@/components/ui/button";
import { Calculator, Phone } from "lucide-react";

export function HeroSection() {
  return (
    <section className="hero-section py-20 md:py-28 lg:py-32">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight mb-6">
            Быстровозводимые здания для промышленности
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Проектирование и строительство складов, цехов, ангаров в Приволжском федеральном округе. Сроки от 6 недель, гарантия качества.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              Рассчитать проект
            </Button>
            <Button variant="heroOutline" size="lg">
              <Phone className="mr-2 h-5 w-5" />
              Назначить встречу
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
