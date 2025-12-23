import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, FileText, Home, RefreshCw, Calendar, MapPin, Phone, Mail, Building, 
  Trash2, Download, Filter, Search, X, FileDown, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

type LeadStatus = "new" | "in_progress" | "closed";

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
  status: LeadStatus;
}

const statusLabels: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  closed: "Закрыта"
};

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  closed: "bg-green-500/10 text-green-600 border-green-500/20"
};

const statusIcons: Record<LeadStatus, React.ReactNode> = {
  new: <AlertCircle className="h-3 w-3" />,
  in_progress: <Clock className="h-3 w-3" />,
  closed: <CheckCircle className="h-3 w-3" />
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [buildingTypeFilter, setBuildingTypeFilter] = useState<string>("all");
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

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

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось обновить статус", variant: "destructive" });
    } else {
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      toast({ title: "Статус обновлён" });
    }
  };

  const confirmDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const deleteLead = async () => {
    if (!leadToDelete) return;

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadToDelete.id);

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" });
    } else {
      setLeads(leads.filter(lead => lead.id !== leadToDelete.id));
      toast({ title: "Заявка удалена" });
    }

    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  const downloadFile = async (filePath: string, leadName: string) => {
    const { data, error } = await supabase.storage
      .from("lead-files")
      .download(filePath);

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось скачать файл", variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${leadName}_${filePath.split("/").pop()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const filteredData = getFilteredLeads();
    
    const headers = ["Имя", "Телефон", "Email", "Тип здания", "Площадь", "Регион", "Сообщение", "Статус", "Дата"];
    const csvContent = [
      headers.join(";"),
      ...filteredData.map(lead => [
        lead.name,
        lead.phone,
        lead.email || "",
        lead.building_type || "",
        lead.area_m2 || "",
        lead.region || "",
        lead.message?.replace(/;/g, ",") || "",
        statusLabels[lead.status],
        formatDate(lead.created_at)
      ].join(";"))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Экспорт завершён", description: `Экспортировано ${filteredData.length} заявок` });
  };

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      const matchesSearch = searchQuery === "" || 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        (lead.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesBuildingType = buildingTypeFilter === "all" || lead.building_type === buildingTypeFilter;
      
      return matchesSearch && matchesStatus && matchesBuildingType;
    });
  };

  const buildingTypes = [...new Set(leads.filter(l => l.building_type).map(l => l.building_type!))];
  const filteredLeads = getFilteredLeads();

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === "new").length,
    in_progress: leads.filter(l => l.status === "in_progress").length,
    closed: leads.filter(l => l.status === "closed").length
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${statusFilter === "all" ? "border-primary" : "border-border hover:border-primary/50"}`}
            onClick={() => setStatusFilter("all")}
          >
            <p className="text-sm text-muted-foreground">Всего</p>
            <p className="text-2xl font-bold">{statusCounts.all}</p>
          </div>
          <div 
            className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${statusFilter === "new" ? "border-blue-500" : "border-border hover:border-blue-500/50"}`}
            onClick={() => setStatusFilter("new")}
          >
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-blue-500" /> Новые
            </p>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.new}</p>
          </div>
          <div 
            className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${statusFilter === "in_progress" ? "border-amber-500" : "border-border hover:border-amber-500/50"}`}
            onClick={() => setStatusFilter("in_progress")}
          >
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" /> В работе
            </p>
            <p className="text-2xl font-bold text-amber-600">{statusCounts.in_progress}</p>
          </div>
          <div 
            className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${statusFilter === "closed" ? "border-green-500" : "border-border hover:border-green-500/50"}`}
            onClick={() => setStatusFilter("closed")}
          >
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" /> Закрыты
            </p>
            <p className="text-2xl font-bold text-green-600">{statusCounts.closed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск по имени, телефону, email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <Select value={buildingTypeFilter} onValueChange={setBuildingTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Building className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Тип здания" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {buildingTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={fetchLeads} disabled={leadsLoading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${leadsLoading ? "animate-spin" : ""}`} />
                Обновить
              </Button>
              <Button onClick={exportToCSV} variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Заявки
            {filteredLeads.length !== leads.length && (
              <span className="text-sm text-muted-foreground font-normal">
                (показано {filteredLeads.length} из {leads.length})
              </span>
            )}
          </h2>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">
              {leads.length === 0 ? "Заявок пока нет" : "Нет заявок по заданным фильтрам"}
            </p>
            <p className="text-muted-foreground">
              {leads.length === 0 ? "Новые заявки появятся здесь" : "Попробуйте изменить параметры поиска"}
            </p>
            {leads.length > 0 && (
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setBuildingTypeFilter("all");
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{lead.name}</h3>
                          <Badge className={`${statusColors[lead.status]} flex items-center gap-1`}>
                            {statusIcons[lead.status]}
                            {statusLabels[lead.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(lead.created_at)}
                          {lead.source && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                              {lead.source}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={lead.status} 
                          onValueChange={(value: LeadStatus) => updateLeadStatus(lead.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новая</SelectItem>
                            <SelectItem value="in_progress">В работе</SelectItem>
                            <SelectItem value="closed">Закрыта</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => confirmDelete(lead)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadFile(lead.file_upload!, lead.name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Скачать файл
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить заявку от {leadToDelete?.name}? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLead} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
