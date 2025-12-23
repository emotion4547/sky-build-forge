import { Building2, MapPin, Calendar, Ruler } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

const defaultStats: StatItem[] = [
  { value: "150+", label: "Реализованных проектов" },
  { value: "500 000", label: "м² построенных объектов", suffix: "+" },
  { value: "12", label: "Лет опыта на рынке" },
  { value: "6", label: "Регионов ПФО" },
];

const iconMap = [Building2, Ruler, Calendar, MapPin];

export function StatsSection() {
  const { data: stats } = useSiteSettings<StatItem[]>("stats", defaultStats);

  return (
    <section id="stats" className="py-16 md:py-20 lg:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const Icon = iconMap[index % iconMap.length];
            return (
              <div
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-4 group-hover:bg-primary-foreground/20 transition-colors">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-4xl md:text-5xl font-bold font-display mb-2">
                  {stat.value}<span className="text-accent">{stat.suffix || ""}</span>
                </div>
                <p className="text-sm md:text-base text-primary-foreground/80">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
