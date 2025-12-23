import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-6">Политика конфиденциальности</h1>
        <div className="prose max-w-none text-muted-foreground">
          <p>Настоящая политика конфиденциальности определяет порядок обработки персональных данных пользователей сайта СКБ УРАЛ56.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Сбор информации</h2>
          <p>Мы собираем информацию, которую вы предоставляете при заполнении форм на сайте.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Использование информации</h2>
          <p>Собранная информация используется для связи с вами и обработки заявок.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Защита данных</h2>
          <p>Мы принимаем меры для защиты ваших персональных данных.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
