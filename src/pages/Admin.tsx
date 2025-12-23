import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, FileText, Users, Home, RefreshCw, Calendar, MapPin, Phone, Mail, Building } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  building_type: string | null;
  area_m2: number | null;
  region: string | null;
  message: string | null;
  meeting_preference: string | null;
  file_upload: string | null;
  source: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
      fetchLeads();
    } else {
      setIsAdmin(false);
      toast({ 
        title: "Доступ запрещён", 
        description: "У вас нет прав администратора", 
        variant: "destructive" 
      });
    }
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить заявки", variant: "destructive" });
    } else {
      setLeads(data || []);
    }
    setLeadsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="СКБ УРАЛ56" className="h-10" />
            <span className="font-semibold text-lg hidden sm:inline">Панель управления</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><Home className="h-4 w-4 mr-2" />На сайт</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Заявки
            </h1>
            <p className="text-muted-foreground">Всего: {leads.length}</p>
          </div>
          <Button onClick={fetchLeads} disabled={leadsLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${leadsLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        {leads.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Заявок пока нет</p>
            <p className="text-muted-foreground">Новые заявки появятся здесь</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(lead.created_at)}
                          {lead.source && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                              {lead.source}
                            </span>
                          )}
                        </div>
                      </div>
                      {lead.meeting_preference && (
                        <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                          {lead.meeting_preference}
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        <a href={`tel:${lead.phone}`} className="hover:text-primary">{lead.phone}</a>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary shrink-0" />
                          <a href={`mailto:${lead.email}`} className="hover:text-primary truncate">{lead.email}</a>
                        </div>
                      )}
                      {lead.building_type && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-primary shrink-0" />
                          <span>{lead.building_type}</span>
                        </div>
                      )}
                      {lead.region && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span>{lead.region}</span>
                        </div>
                      )}
                    </div>

                    {(lead.area_m2 || lead.message) && (
                      <div className="pt-3 border-t border-border">
                        {lead.area_m2 && (
                          <p className="text-sm"><span className="text-muted-foreground">Площадь:</span> {lead.area_m2} м²</p>
                        )}
                        {lead.message && (
                          <p className="text-sm mt-1"><span className="text-muted-foreground">Сообщение:</span> {lead.message}</p>
                        )}
                      </div>
                    )}

                    {lead.file_upload && (
                      <div className="pt-2">
                        <span className="text-xs text-muted-foreground">Прикреплён файл</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
