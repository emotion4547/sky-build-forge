import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Building, MapPin, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Lead {
  id: string;
  created_at: string;
  building_type: string | null;
  region: string | null;
  status: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const AdminAnalytics = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("id, created_at, building_type, region, status")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить данные", variant: "destructive" });
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  // Leads by day (last 30 days)
  const getLeadsByDay = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dayMap: Record<string, number> = {};
    
    // Initialize all days
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
      dayMap[key] = 0;
    }
    
    // Count leads
    leads.forEach(lead => {
      const date = new Date(lead.created_at);
      if (date >= thirtyDaysAgo) {
        const key = date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
        if (key in dayMap) {
          dayMap[key]++;
        }
      }
    });

    return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
  };

  // Leads by building type
  const getLeadsByBuildingType = () => {
    const typeMap: Record<string, number> = {};
    
    leads.forEach(lead => {
      const type = lead.building_type || "Не указан";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    return Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Leads by region
  const getLeadsByRegion = () => {
    const regionMap: Record<string, number> = {};
    
    leads.forEach(lead => {
      const region = lead.region || "Не указан";
      regionMap[region] = (regionMap[region] || 0) + 1;
    });

    return Object.entries(regionMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Leads by month
  const getLeadsByMonth = () => {
    const monthMap: Record<string, number> = {};
    
    leads.forEach(lead => {
      const date = new Date(lead.created_at);
      const key = date.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" });
      monthMap[key] = (monthMap[key] || 0) + 1;
    });

    return Object.entries(monthMap).map(([month, count]) => ({ month, count }));
  };

  const leadsByDay = getLeadsByDay();
  const leadsByBuildingType = getLeadsByBuildingType();
  const leadsByRegion = getLeadsByRegion();
  const leadsByMonth = getLeadsByMonth();

  // Calculate metrics
  const totalLeads = leads.length;
  const thisMonth = leads.filter(l => {
    const date = new Date(l.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const lastMonth = leads.filter(l => {
    const date = new Date(l.created_at);
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
  }).length;
  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 100;

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Аналитика
        </h2>
        <Button onClick={fetchData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Всего заявок</p>
          <p className="text-2xl font-bold">{totalLeads}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">В этом месяце</p>
          <p className="text-2xl font-bold">{thisMonth}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">В прошлом месяце</p>
          <p className="text-2xl font-bold">{lastMonth}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Рост
          </p>
          <p className={`text-2xl font-bold ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {growth >= 0 ? "+" : ""}{growth}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leads by Day */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Заявки за 30 дней
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval={4}
                  className="text-muted-foreground"
                />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Building Type */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Building className="h-4 w-4" />
            По типу здания
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsByBuildingType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {leadsByBuildingType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Region */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Топ-10 регионов
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByRegion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-muted-foreground" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Month */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            По месяцам
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
