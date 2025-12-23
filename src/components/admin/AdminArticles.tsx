import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, RefreshCw, Plus, Edit, Trash2, Eye, EyeOff, Search, Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";

type ArticleCategory = "новости" | "технологии" | "закупки";

interface Article {
  id: string;
  slug: string;
  title: string;
  lead: string;
  body: string;
  category: ArticleCategory;
  cover: string;
  author: string;
  read_time: number;
  tags: string[];
  published_at: string;
  is_published: boolean;
  created_at: string;
}

const emptyArticle: Omit<Article, 'id' | 'created_at'> = {
  slug: "",
  title: "",
  lead: "",
  body: "",
  category: "новости",
  cover: "/placeholder.svg",
  author: "",
  read_time: 5,
  tags: [],
  published_at: new Date().toISOString().split('T')[0],
  is_published: true
};

export const AdminArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article> | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить статьи", variant: "destructive" });
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  const openCreateDialog = () => {
    setCurrentArticle(emptyArticle);
    setEditDialogOpen(true);
  };

  const openEditDialog = (article: Article) => {
    setCurrentArticle(article);
    setEditDialogOpen(true);
  };

  const saveArticle = async () => {
    if (!currentArticle) return;

    const articleData = {
      slug: currentArticle.slug,
      title: currentArticle.title,
      lead: currentArticle.lead,
      body: currentArticle.body,
      category: currentArticle.category,
      cover: currentArticle.cover || "/placeholder.svg",
      author: currentArticle.author,
      read_time: currentArticle.read_time,
      tags: currentArticle.tags || [],
      published_at: currentArticle.published_at,
      is_published: currentArticle.is_published
    };

    if ('id' in currentArticle && currentArticle.id) {
      const { error } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", currentArticle.id);

      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Статья обновлена" });
        fetchArticles();
      }
    } else {
      const { error } = await supabase
        .from("articles")
        .insert([articleData]);

      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Статья создана" });
        fetchArticles();
      }
    }

    setEditDialogOpen(false);
    setCurrentArticle(null);
  };

  const togglePublished = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .update({ is_published: !article.is_published })
      .eq("id", article.id);

    if (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } else {
      setArticles(articles.map(a => 
        a.id === article.id ? { ...a, is_published: !a.is_published } : a
      ));
    }
  };

  const confirmDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const deleteArticle = async () => {
    if (!articleToDelete) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleToDelete.id);

    if (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } else {
      setArticles(articles.filter(a => a.id !== articleToDelete.id));
      toast({ title: "Статья удалена" });
    }

    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  const filteredArticles = articles.filter(a => 
    searchQuery === "" || 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColors: Record<ArticleCategory, string> = {
    "новости": "bg-blue-500/10 text-blue-600",
    "технологии": "bg-purple-500/10 text-purple-600",
    "закупки": "bg-green-500/10 text-green-600"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск статей..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchArticles} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Всего статей</p>
          <p className="text-2xl font-bold">{articles.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Опубликовано</p>
          <p className="text-2xl font-bold text-green-600">{articles.filter(a => a.is_published).length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Новости</p>
          <p className="text-2xl font-bold text-blue-600">{articles.filter(a => a.category === "новости").length}</p>
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Статей не найдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{article.title}</h3>
                    <Badge className={categoryColors[article.category]}>{article.category}</Badge>
                    {!article.is_published && (
                      <Badge variant="outline" className="text-muted-foreground">
                        <EyeOff className="h-3 w-3 mr-1" /> Скрыт
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {article.lead}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.published_at)}
                    </span>
                    <span>{article.read_time} мин</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => togglePublished(article)}>
                    {article.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(article)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete(article)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentArticle && 'id' in currentArticle ? "Редактировать статью" : "Новая статья"}
            </DialogTitle>
          </DialogHeader>
          {currentArticle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug</Label>
                  <Input 
                    value={currentArticle.slug || ""} 
                    onChange={(e) => setCurrentArticle({...currentArticle, slug: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Категория</Label>
                  <Select 
                    value={currentArticle.category || "новости"} 
                    onValueChange={(v) => setCurrentArticle({...currentArticle, category: v as ArticleCategory})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="новости">Новости</SelectItem>
                      <SelectItem value="технологии">Технологии</SelectItem>
                      <SelectItem value="закупки">Закупки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Заголовок</Label>
                <Input 
                  value={currentArticle.title || ""} 
                  onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
                />
              </div>
              <div>
                <Label>Лид</Label>
                <Textarea 
                  value={currentArticle.lead || ""} 
                  onChange={(e) => setCurrentArticle({...currentArticle, lead: e.target.value})}
                />
              </div>
              <div>
                <Label>Текст (Markdown)</Label>
                <Textarea 
                  className="min-h-[200px] font-mono text-sm"
                  value={currentArticle.body || ""} 
                  onChange={(e) => setCurrentArticle({...currentArticle, body: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Автор</Label>
                  <Input 
                    value={currentArticle.author || ""} 
                    onChange={(e) => setCurrentArticle({...currentArticle, author: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Время чтения (мин)</Label>
                  <Input 
                    type="number"
                    value={currentArticle.read_time || ""} 
                    onChange={(e) => setCurrentArticle({...currentArticle, read_time: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Дата публикации</Label>
                  <Input 
                    type="date"
                    value={currentArticle.published_at || ""} 
                    onChange={(e) => setCurrentArticle({...currentArticle, published_at: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Теги (через запятую)</Label>
                <Input 
                  value={currentArticle.tags?.join(", ") || ""} 
                  onChange={(e) => setCurrentArticle({...currentArticle, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
                />
              </div>
              <Button onClick={saveArticle} className="w-full">Сохранить</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить статью?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить "{articleToDelete?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={deleteArticle} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
