import { Button } from "@/components/ui/button";
import { Calculator, Phone, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Продукция", href: "/products" },
  { label: "Проекты", href: "/projects" },
  { 
    label: "Компания", 
    href: "/company/about",
    submenu: [
      { label: "О компании", href: "/company/about" },
      { label: "Пресс-центр", href: "/company/press" },
    ]
  },
  { 
    label: "Партнёрам", 
    href: "/partners/referral",
    submenu: [
      { label: "Реферальная программа", href: "/partners/referral" },
      { label: "Строителям", href: "/partners/builders" },
      { label: "Проектировщикам", href: "/partners/engineers" },
    ]
  },
  { label: "Калькулятор", href: "/calculators" },
  { label: "Контакты", href: "/contacts" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="СКБ УРАЛ56" className="h-16 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            item.submenu ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-secondary ${
                      isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.submenu.map((sub) => (
                    <DropdownMenuItem key={sub.href} asChild>
                      <Link to={sub.href} className="w-full cursor-pointer">
                        {sub.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-secondary ${
                  isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/calculators">
              <Calculator className="mr-1.5 h-4 w-4" />
              Рассчитать
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/contacts">
              <Phone className="mr-1.5 h-4 w-4" />
              Консультация
            </Link>
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
          <nav className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              item.submenu ? (
                <div key={item.label} className="py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </span>
                  <div className="mt-2 flex flex-col gap-1 pl-3 border-l border-border">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        className={`py-1.5 text-sm font-medium transition-colors ${
                          location.pathname === sub.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`py-2 text-sm font-medium transition-colors ${
                    isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/calculators" onClick={() => setMobileMenuOpen(false)}>
                  <Calculator className="mr-1.5 h-4 w-4" />
                  Рассчитать
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/contacts" onClick={() => setMobileMenuOpen(false)}>
                  <Phone className="mr-1.5 h-4 w-4" />
                  Консультация
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
