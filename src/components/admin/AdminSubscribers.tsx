import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, Calendar, Trash2, FileDown, Search, X, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface Subscriber {
  id: string;
  email: string;
  confirmed: boolean | null;
  created_at: string;
}

export const AdminSubscribers = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить подписчиков", variant: "destructive" });
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
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

  const confirmDelete = (subscriber: Subscriber) => {
    setSubscriberToDelete(subscriber);
    setDeleteDialogOpen(true);
  };

  const deleteSubscriber = async () => {
    if (!subscriberToDelete) return;

    const { error } = await supabase
      .from("subscribers")
      .delete()
      .eq("id", subscriberToDelete.id);

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить подписчика", variant: "destructive" });
    } else {
      setSubscribers(subscribers.filter(s => s.id !== subscriberToDelete.id));
      toast({ title: "Подписчик удалён" });
    }

    setDeleteDialogOpen(false);
    setSubscriberToDelete(null);
  };

  const exportToCSV = () => {
    const headers = ["Email", "Подтверждён", "Дата подписки"];
    const csvContent = [
      headers.join(";"),
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.confirmed ? "Да" : "Нет",
        formatDate(sub.created_at)
      ].join(";"))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Экспорт завершён", description: `Экспортировано ${filteredSubscribers.length} подписчиков` });
  };

  const copyEmails = () => {
    const emails = filteredSubscribers.map(s => s.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast({ title: "Скопировано", description: `${filteredSubscribers.length} email-адресов скопировано` });
  };

  const filteredSubscribers = subscribers.filter(sub => 
    searchQuery === "" || sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmedCount = subscribers.filter(s => s.confirmed).length;
  const pendingCount = subscribers.filter(s => !s.confirmed).length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" /> Всего
          </p>
          <p className="text-2xl font-bold">{subscribers.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" /> Подтверждено
          </p>
          <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500" /> Ожидают
          </p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Поиск по email..." 
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
          
          <div className="flex gap-2">
            <Button onClick={fetchSubscribers} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
            <Button onClick={copyEmails} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Копировать
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Подписчики
          {filteredSubscribers.length !== subscribers.length && (
            <span className="text-sm text-muted-foreground font-normal">
              (показано {filteredSubscribers.length} из {subscribers.length})
            </span>
          )}
        </h2>
      </div>

      {filteredSubscribers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">
            {subscribers.length === 0 ? "Подписчиков пока нет" : "Нет подписчиков по запросу"}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Статус</th>
                <th className="text-left p-4 font-medium">Дата</th>
                <th className="text-right p-4 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-t border-border">
                  <td className="p-4">
                    <a href={`mailto:${subscriber.email}`} className="hover:text-primary">
                      {subscriber.email}
                    </a>
                  </td>
                  <td className="p-4">
                    {subscriber.confirmed ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Подтверждён
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Ожидает
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(subscriber.created_at)}
                  </td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => confirmDelete(subscriber)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить подписчика?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {subscriberToDelete?.email}? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSubscriber} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
