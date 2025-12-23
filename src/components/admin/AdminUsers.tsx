import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, RefreshCw, Shield, User, Calendar, Mail, ShieldCheck, ShieldAlert, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

type AppRole = "admin" | "editor" | "user";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
}

const roleLabels: Record<AppRole, string> = {
  admin: "Администратор",
  editor: "Редактор",
  user: "Пользователь"
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
  editor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  user: "bg-gray-500/10 text-gray-600 border-gray-500/20"
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <ShieldAlert className="h-3 w-3" />,
  editor: <Pencil className="h-3 w-3" />,
  user: <User className="h-3 w-3" />
};

export const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Get user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (rolesError) {
      toast({ title: "Ошибка", description: "Не удалось загрузить пользователей", variant: "destructive" });
      setLoading(false);
      return;
    }

    // We can't directly query auth.users, so we'll display user_id
    // In a real app, you'd have a profiles table with emails
    setUsers(rolesData || []);
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось обновить роль", variant: "destructive" });
    } else {
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
      toast({ title: "Роль обновлена" });
    }
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === "admin").length,
    editor: users.filter(u => u.role === "editor").length,
    user: users.filter(u => u.role === "user").length
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div 
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${roleFilter === "all" ? "border-primary" : "border-border hover:border-primary/50"}`}
          onClick={() => setRoleFilter("all")}
        >
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> Всего
          </p>
          <p className="text-2xl font-bold">{roleCounts.all}</p>
        </div>
        <div 
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${roleFilter === "admin" ? "border-red-500" : "border-border hover:border-red-500/50"}`}
          onClick={() => setRoleFilter("admin")}
        >
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-red-500" /> Админы
          </p>
          <p className="text-2xl font-bold text-red-600">{roleCounts.admin}</p>
        </div>
        <div 
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${roleFilter === "editor" ? "border-purple-500" : "border-border hover:border-purple-500/50"}`}
          onClick={() => setRoleFilter("editor")}
        >
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Pencil className="h-3 w-3 text-purple-500" /> Редакторы
          </p>
          <p className="text-2xl font-bold text-purple-600">{roleCounts.editor}</p>
        </div>
        <div 
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${roleFilter === "user" ? "border-gray-500" : "border-border hover:border-gray-500/50"}`}
          onClick={() => setRoleFilter("user")}
        >
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3 text-gray-500" /> Пользователи
          </p>
          <p className="text-2xl font-bold text-gray-600">{roleCounts.user}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Поиск по ID пользователя..." 
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
          
          <Button onClick={fetchUsers} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Пользователи
          {filteredUsers.length !== users.length && (
            <span className="text-sm text-muted-foreground font-normal">
              (показано {filteredUsers.length} из {users.length})
            </span>
          )}
        </h2>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">
            {users.length === 0 ? "Пользователей пока нет" : "Нет пользователей по фильтру"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {roleIcons[user.role]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {user.user_id.slice(0, 8)}...
                      </code>
                      <Badge className={`${roleColors[user.role]} flex items-center gap-1`}>
                        {roleIcons[user.role]}
                        {roleLabels[user.role]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                </div>
                
                <Select 
                  value={user.role} 
                  onValueChange={(value: AppRole) => updateUserRole(user.user_id, value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        Администратор
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4 text-purple-500" />
                        Редактор
                      </div>
                    </SelectItem>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Пользователь
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
