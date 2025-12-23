import { Button } from "@/components/ui/button";
import { Calculator, Phone, ArrowRight } from "lucide-react";

export function CTASection() {
  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="cta" className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4">
            Начните проект
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-6">
            Готовы обсудить
            <span className="text-accent"> ваш проект?</span>
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Получите бесплатную консультацию и предварительный расчёт стоимости вашего объекта уже сегодня
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="accent" 
              size="xl" 
              onClick={scrollToForm}
              className="group"
            >
              <Calculator className="h-5 w-5" />
              Рассчитать стоимость
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="border-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Phone className="h-5 w-5" />
              +7 (800) 555-35-35
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
