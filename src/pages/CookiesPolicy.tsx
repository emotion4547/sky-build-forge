import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const CookiesPolicy = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-6">Политика использования cookies</h1>
        <div className="prose max-w-none text-muted-foreground">
          <p>Сайт СКБ УРАЛ56 использует cookies для улучшения работы и анализа посещаемости.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">Что такое cookies</h2>
          <p>Cookies — небольшие текстовые файлы, сохраняемые в браузере.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">Какие cookies мы используем</h2>
          <p>Функциональные cookies для работы сайта и аналитические для Яндекс.Метрики.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">Управление cookies</h2>
          <p>Вы можете отключить cookies в настройках браузера.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CookiesPolicy;
