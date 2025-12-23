import { Button } from "@/components/ui/button";
import { Calculator, Phone, ChevronDown, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";

const highlights = [
  "От 6 недель",
  "Гарантия 5 лет",
  "Под ключ",
];

export function HeroSection() {
  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Строительство быстровозводимых зданий" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20 md:py-28">
        <div className="max-w-2xl animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-foreground">Приволжский федеральный округ</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display text-foreground leading-[1.1] mb-6">
            Быстровозводимые
            <span className="block text-primary">здания</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
            Проектирование и строительство складов, цехов, ангаров. Собственное производство металлоконструкций.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-4 mb-10">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="accent" size="xl" onClick={scrollToForm}>
              <Calculator className="h-5 w-5" />
              Рассчитать проект
            </Button>
            <Button variant="heroOutline" size="xl">
              <Phone className="h-5 w-5" />
              +7 (800) 555-35-35
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block">
        <button 
          onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Подробнее</span>
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
