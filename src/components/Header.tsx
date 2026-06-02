import { Button } from "@/components/ui/button";
import { Calculator, Phone, Menu, X, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchCommand } from "@/components/SearchCommand";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

type CatalogSubcategory = { id: string; title: string; slug: string; section_id: string };
type CatalogSection = { id: string; title: string; slug: string; subcategories: CatalogSubcategory[] };

const staticNavItems = [
  { label: "Главная", href: "/" },
  {
    label: "Компания",
    href: "/company/about",
    submenu: [
      { label: "О компании", href: "/company/about" },
      { label: "Пресс-центр", href: "/company/press" },
    ],
  },
  {
    label: "Партнёрам",
    href: "/partners/referral",
    submenu: [
      { label: "Реферальная программа", href: "/partners/referral" },
      { label: "Строителям", href: "/partners/builders" },
      { label: "Проектировщикам", href: "/partners/engineers" },
    ],
  },
  { label: "Калькулятор", href: "/calculators" },
  { label: "Контакты", href: "/contacts" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const location = useLocation();

  useEffect(() => {
    const loadCatalog = async () => {
      const [{ data: sectionsData }, { data: subData }] = await Promise.all([
        supabase
          .from("catalog_sections" as any)
          .select("id, title, slug, sort_order")
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("catalog_subcategories" as any)
          .select("id, title, slug, section_id, sort_order")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
      ]);

      const subs = (subData as any[]) || [];
      const grouped: CatalogSection[] = ((sectionsData as any[]) || []).map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        subcategories: subs.filter((sub) => sub.section_id === s.id),
      }));
      setSections(grouped);
    };
    loadCatalog();
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const productsActive = location.pathname.startsWith("/products");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="СКБ УРАЛ56" className="h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-secondary ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Главная
            </Link>

            {/* Продукция — dropdown с разделами и подкатегориями */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-secondary ${
                    productsActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Продукция
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[680px] p-4">
                <div className="mb-3 pb-3 border-b border-border">
                  <Link
                    to="/products"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Все разделы каталога →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {sections.map((section) => (
                    <div key={section.id} className="min-w-0">
                      <Link
                        to={`/products/section/${section.slug}`}
                        className="block mb-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {section.title}
                      </Link>
                      {section.subcategories.length > 0 && (
                        <ul className="space-y-1 pl-2 border-l border-border">
                          {section.subcategories.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                to={`/products/section/${section.slug}/${sub.slug}`}
                                className="block py-0.5 text-xs text-muted-foreground hover:text-primary transition-colors truncate"
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/projects"
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-secondary ${
                isActive("/projects") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Проекты
            </Link>

            {staticNavItems.slice(1).map((item) =>
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
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Поиск">
              <Search className="h-4 w-4" />
            </Button>
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
          <div className="lg:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Поиск">
              <Search className="h-5 w-5" />
            </Button>
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background max-h-[80vh] overflow-y-auto">
            <nav className="container py-4 flex flex-col gap-1">
              <Link
                to="/"
                className={`py-2 text-sm font-medium ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Главная
              </Link>

              <div className="py-2">
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-primary"
                >
                  Продукция
                </Link>
                <div className="mt-2 flex flex-col gap-2 pl-3 border-l border-border">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <Link
                        to={`/products/section/${section.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-1 text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {section.title}
                      </Link>
                      {section.subcategories.length > 0 && (
                        <ul className="pl-3 mt-1 space-y-1 border-l border-border">
                          {section.subcategories.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                to={`/products/section/${section.slug}/${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-0.5 text-xs text-muted-foreground hover:text-primary"
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/projects"
                className={`py-2 text-sm font-medium ${isActive("/projects") ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Проекты
              </Link>

              {staticNavItems.slice(1).map((item) =>
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
              )}

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

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
