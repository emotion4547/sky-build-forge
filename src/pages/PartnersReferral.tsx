import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PartnersReferral = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-6">Реферальная программа</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Рекомендуйте СКБ УРАЛ56 и получайте вознаграждение за каждый реализованный проект.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Условия</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• До 3% от суммы контракта</li>
            <li>• Выплата после подписания договора</li>
            <li>• Без ограничений по количеству рекомендаций</li>
          </ul>
        </div>
        <Button asChild><Link to="/contacts">Стать партнёром</Link></Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default PartnersReferral;
