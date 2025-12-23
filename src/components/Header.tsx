import { Button } from "@/components/ui/button";
import { Calculator, Phone, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Главная", href: "#" },
  { label: "Продукция", href: "#products" },
  { label: "Проекты", href: "#stats" },
  { label: "Компания", href: "#benefits" },
  { label: "Калькуляторы", href: "#calculator" },
  { label: "Контакты", href: "#cta" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary" />
          <span className="text-lg font-bold text-foreground">СКБ УРАЛ56</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Calculator className="mr-1.5 h-4 w-4" />
            Рассчитать
          </Button>
          <Button size="sm">
            <Phone className="mr-1.5 h-4 w-4" />
            Консультация
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
              <Button variant="outline" size="sm">
                <Calculator className="mr-1.5 h-4 w-4" />
                Рассчитать
              </Button>
              <Button size="sm">
                <Phone className="mr-1.5 h-4 w-4" />
                Консультация
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
