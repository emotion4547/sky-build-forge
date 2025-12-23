import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, FileText, Home, RefreshCw, Users, Mail, BarChart3, 
  Menu, X, ChevronLeft, ChevronRight, FolderOpen, Package, Newspaper
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";
import { AdminLeads } from "@/components/admin/AdminLeads";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSubscribers } from "@/components/admin/AdminSubscribers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminProjects } from "@/components/admin/AdminProjects";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminArticles } from "@/components/admin/AdminArticles";
import { cn } from "@/lib/utils";

type AdminSection = "leads" | "users" | "subscribers" | "analytics" | "projects" | "products" | "articles";

const sections = [
  { id: "leads" as AdminSection, label: "Заявки", icon: FileText },
  { id: "projects" as AdminSection, label: "Проекты", icon: FolderOpen },
  { id: "products" as AdminSection, label: "Продукты", icon: Package },
  { id: "articles" as AdminSection, label: "Статьи", icon: Newspaper },
  { id: "users" as AdminSection, label: "Пользователи", icon: Users },
  { id: "subscribers" as AdminSection, label: "Подписчики", icon: Mail },
  { id: "analytics" as AdminSection, label: "Аналитика", icon: BarChart3 },
];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("leads");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        } else if (session.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else if (session.user) {
        checkAdminRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (data?.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      toast({ 
        title: "Доступ запрещён", 
        description: "У вас нет прав администратора", 
        variant: "destructive" 
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "leads":
        return <AdminLeads />;
      case "projects":
        return <AdminProjects />;
      case "products":
        return <AdminProducts />;
      case "articles":
        return <AdminArticles />;
      case "users":
        return <AdminUsers />;
      case "subscribers":
        return <AdminSubscribers />;
      case "analytics":
        return <AdminAnalytics />;
      default:
        return <AdminLeads />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-6">У вас нет прав администратора</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/">На главную</Link>
            </Button>
            <Button onClick={handleLogout}>Выйти</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-background border-r border-border transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-16",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className={cn(
          "h-16 border-b border-border flex items-center px-4",
          sidebarOpen ? "justify-between" : "justify-center"
        )}>
          {sidebarOpen ? (
            <>
              <img src={logo} alt="СКБ УРАЛ56" className="h-8" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => {
                    setActiveSection(section.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground",
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <section.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span className="font-medium">{section.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className={cn(
          "border-t border-border p-4",
          !sidebarOpen && "flex flex-col items-center"
        )}>
          {sidebarOpen && (
            <p className="text-xs text-muted-foreground mb-2 truncate">
              {user?.email}
            </p>
          )}
          <div className={cn("flex gap-2", !sidebarOpen && "flex-col")}>
            <Button 
              variant="ghost" 
              size={sidebarOpen ? "sm" : "icon"}
              asChild
              className={!sidebarOpen ? "w-10 h-10" : ""}
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">На сайт</span>}
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size={sidebarOpen ? "sm" : "icon"}
              onClick={handleLogout}
              className={!sidebarOpen ? "w-10 h-10" : ""}
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">Выйти</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src={logo} alt="СКБ УРАЛ56" className="h-8" />
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
          >
            <Link to="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        </header>

        {/* Page Header */}
        <div className="bg-background border-b border-border px-6 py-4">
          <h1 className="text-2xl font-bold font-display flex items-center gap-3">
            {sections.find(s => s.id === activeSection)?.icon && (
              <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {(() => {
                  const Icon = sections.find(s => s.id === activeSection)?.icon;
                  return Icon ? <Icon className="h-5 w-5 text-primary" /> : null;
                })()}
              </span>
            )}
            {sections.find(s => s.id === activeSection)?.label}
          </h1>
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Admin;
