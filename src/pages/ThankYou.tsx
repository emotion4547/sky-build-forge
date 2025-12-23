import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const ThankYou = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-20">
      <div className="container max-w-lg text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold font-display mb-4">Спасибо за заявку!</h1>
        <p className="text-muted-foreground mb-8">
          Мы получили ваше сообщение и свяжемся с вами в ближайшее время.
        </p>
        <Button asChild><Link to="/">На главную</Link></Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default ThankYou;
