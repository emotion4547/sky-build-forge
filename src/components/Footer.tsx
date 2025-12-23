import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import logo from "@/assets/logo.png";

const companyInfo = {
  name: "ООО «СКБ УРАЛ56»",
  address: "460019, Оренбургская область, г. Оренбург, мкр. Посёлок Кушкуль, ул. Просвещения, д. 19/4",
  phone: "+7 (932) 536-91-29",
  email: "skbural@mail.ru",
  inn: "5609201898",
  ogrn: "1235600002770",
};

const navLinks = [
  { label: "Продукция", href: "/products" },
  { label: "Проекты", href: "/projects" },
  { label: "О компании", href: "/company/about" },
  { label: "Калькулятор", href: "/calculators" },
  { label: "Контакты", href: "/contacts" },
];

const legalLinks = [
  { label: "Политика конфиденциальности", href: "/legal/privacy" },
  { label: "Политика cookies", href: "/legal/cookies" },
];

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-secondary">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="СКБ УРАЛ56" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Строительство быстровозводимых зданий, модульных конструкций, складских помещений и сельскохозяйственных объектов. Допуск СРО и ОПО.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{companyInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href={`tel:${companyInfo.phone.replace(/\D/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {companyInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href={`mailto:${companyInfo.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {companyInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Requisites */}
          <div>
            <h4 className="font-semibold mb-4">Реквизиты</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="text-foreground">ИНН:</span> {companyInfo.inn}</p>
              <p><span className="text-foreground">ОГРН:</span> {companyInfo.ogrn}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-sm">Документы</h4>
              <ul className="space-y-1">
                {legalLinks.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {companyInfo.name}. Все права защищены.
          </p>
          <p className="text-xs text-muted-foreground">
            Информация на сайте не является публичной офертой
          </p>
        </div>
      </div>
    </footer>
  );
}
