import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Award, Users, Factory, Shield } from "lucide-react";

const CompanyAbout = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-6">О компании</h1>
        <p className="text-lg text-muted-foreground mb-12">
          СКБ УРАЛ56 — проектирование и строительство быстровозводимых зданий в Приволжском федеральном округе с 2012 года.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Factory, title: "Собственное производство", desc: "5000 тонн металлоконструкций в год" },
            { icon: Users, title: "Опытная команда", desc: "Инженеры, проектировщики, монтажники" },
            { icon: Award, title: "Членство в СРО", desc: "Проектирование и строительство" },
            { icon: Shield, title: "Гарантия качества", desc: "До 25 лет на конструкции" },
          ].map(item => (
            <div key={item.title} className="bg-card border border-border rounded-xl p-6">
              <item.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold font-display mb-4">Наша миссия</h2>
          <p className="text-muted-foreground">
            Мы строим здания, которые помогают бизнесу расти: быстро, качественно и по оптимальной цене. Каждый проект — это индивидуальное решение под задачи клиента.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default CompanyAbout;
