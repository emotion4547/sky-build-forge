import { Button } from "@/components/ui/button";
import { Calculator, Phone } from "lucide-react";

export function CTASection() {
  return (
    <section id="cta" className="py-16 md:py-20 lg:py-24 hero-section">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Готовы обсудить ваш проект?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Получите бесплатную консультацию и предварительный расчёт стоимости вашего объекта
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              Рассчитать стоимость
            </Button>
            <Button variant="heroOutline" size="lg">
              <Phone className="mr-2 h-5 w-5" />
              Заказать звонок
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
