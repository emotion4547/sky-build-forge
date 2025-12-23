import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchPage = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold font-display mb-6">Поиск</h1>
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Введите запрос..." className="pl-10" />
        </div>
        <p className="text-muted-foreground text-center">Введите запрос для поиска по сайту</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default SearchPage;
