import { FileText, Ruler, Factory, Truck, HardHat, CheckCircle, LucideIcon } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface StageItem {
  number: string;
  icon: string;
  title: string;
  description: string;
  duration: string;
}

const defaultStages: StageItem[] = [
  { number: "01", icon: "FileText", title: "Заявка и консультация", description: "Обсуждаем ваши требования, бюджет и сроки. Бесплатный выезд инженера на объект.", duration: "1–2 дня" },
  { number: "02", icon: "Ruler", title: "Проектирование", description: "Разрабатываем проект с учётом нагрузок, климата и назначения здания.", duration: "5–10 дней" },
  { number: "03", icon: "Factory", title: "Производство", description: "Изготавливаем металлоконструкции и сэндвич-панели на собственном заводе.", duration: "2–3 недели" },
  { number: "04", icon: "Truck", title: "Доставка", description: "Логистика комплектующих на объект по всему Приволжскому округу.", duration: "1–3 дня" },
  { number: "05", icon: "HardHat", title: "Монтаж", description: "Профессиональная бригада выполняет сборку здания под ключ.", duration: "2–4 недели" },
  { number: "06", icon: "CheckCircle", title: "Сдача объекта", description: "Подписание акта, передача документации и гарантийное обслуживание.", duration: "1 день" },
];

const iconMap: Record<string, LucideIcon> = {
  FileText, Ruler, Factory, Truck, HardHat, CheckCircle
};

export function WorkStagesSection() {
  const { data: stages } = useSiteSettings<StageItem[]>("work_stages", defaultStages);

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
      {/* Decorative line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border hidden lg:block" />

      <div className="container relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Как мы работаем
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-foreground mb-4">
            Этапы строительства
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            От первого звонка до сдачи объекта — прозрачный процесс на каждом этапе
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-4">
          {stages.map((stage, index) => {
            const Icon = iconMap[stage.icon] || CheckCircle;
            return (
              <div key={stage.number} className="relative group">
                {/* Connector line */}
                {index < stages.length - 1 && (
                  <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                )}
                
                {/* Card */}
                <div className="relative bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  {/* Icon circle */}
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <Icon className="h-8 w-8 text-primary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {stage.number}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground text-center mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-3 line-clamp-3">
                    {stage.description}
                  </p>
                  <div className="text-center">
                    <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                      {stage.duration}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-4">
          {stages.map((stage, index) => {
            const Icon = iconMap[stage.icon] || CheckCircle;
            return (
              <div key={stage.number} className="flex gap-4">
                {/* Left side - number and line */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                    {stage.number}
                  </div>
                  {index < stages.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-primary/20 mt-2" />
                  )}
                </div>
                
                {/* Right side - content */}
                <div className="flex-1 pb-8">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{stage.title}</h3>
                        <span className="text-xs font-medium text-primary">{stage.duration}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground rounded-full px-6 py-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">Общий срок: от 6 недель под ключ</span>
          </div>
        </div>
      </div>
    </section>
  );
}
