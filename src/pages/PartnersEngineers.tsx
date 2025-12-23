import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PartnersEngineers = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-6">Проектировщикам</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Техническая поддержка и материалы для проектных организаций.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ресурсы для проектирования</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• BIM-модели и узлы</li>
            <li>• Альбомы типовых решений</li>
            <li>• Консультации инженеров</li>
            <li>• Расчёт нагрузок</li>
          </ul>
        </div>
        <Button asChild><Link to="/contacts">Получить материалы</Link></Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default PartnersEngineers;
