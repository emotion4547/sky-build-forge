import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articles } from "@/data/articles";
import { Link } from "react-router-dom";

const CompanyPress = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Пресс-центр</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.slug} to={`/company/press/${article.slug}`} className="card-hover bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-secondary" />
              <div className="p-4">
                <span className="text-xs text-accent font-medium">{article.category}</span>
                <h2 className="font-semibold mt-1 mb-2 line-clamp-2">{article.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.lead}</p>
                <p className="text-xs text-muted-foreground mt-2">{article.readTime} мин • {article.publishedAt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CompanyPress;
