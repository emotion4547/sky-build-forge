import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getArticleBySlug } from "@/data/articles";
import { ChevronRight } from "lucide-react";

const ArticleDetail = () => {
  const { slug } = useParams();
  const article = getArticleBySlug(slug || "");

  if (!article) return <div className="min-h-screen flex items-center justify-center">Статья не найдена</div>;

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
          <p className="text-sm text-muted-foreground mb-8">{article.author} • {article.readTime} мин • {article.publishedAt}</p>
          
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br/>') }} />
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
