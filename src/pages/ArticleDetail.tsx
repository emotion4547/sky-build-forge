import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  slug: string;
  title: string;
  lead: string;
  body: string;
  category: string;
  cover: string;
  author: string;
  read_time: number;
  published_at: string;
}

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!error && data) {
        setArticle(data);
      }
      setLoading(false);
    };

    if (slug) fetchArticle();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <article className="container max-w-3xl space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Статья не найдена</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <article className="container max-w-3xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/company/press" className="hover:text-foreground">Пресс-центр</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground line-clamp-1">{article.title}</span>
          </nav>

          <span className="text-accent font-medium">{article.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold font-display mt-2 mb-4">{article.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{article.lead}</p>
          <p className="text-sm text-muted-foreground mb-8">
            {article.author} • {article.read_time} мин • {formatDate(article.published_at)}
          </p>

          {article.cover && article.cover !== "/placeholder.svg" && (
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary mb-8">
              <img 
                src={article.cover} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none" 
            dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br/>') }} 
          />
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
