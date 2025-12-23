const stats = [
  {
    value: "150+",
    label: "Реализованных проектов",
  },
  {
    value: "500 000+",
    label: "м² построенных объектов",
  },
  {
    value: "12",
    label: "Лет опыта на рынке",
  },
  {
    value: "6",
    label: "Регионов ПФО",
  },
];

export function StatsSection() {
  return (
    <section id="stats" className="py-16 md:py-20 lg:py-24 bg-background">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="stat-number mb-2">{stat.value}</div>
              <p className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
