import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PartnersBuilders = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-6">Строителям</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Комплектация металлоконструкциями и сэндвич-панелями для строительных организаций.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Что мы предлагаем</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Поставка металлоконструкций</li>
            <li>• Сэндвич-панели собственного производства</li>
            <li>• Техническая документация и чертежи</li>
            <li>• Шефмонтаж и консультации</li>
          </ul>
        </div>
        <Button asChild><Link to="/contacts">Запросить условия</Link></Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default PartnersBuilders;
