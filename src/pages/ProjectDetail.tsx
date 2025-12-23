import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getProjectBySlug } from "@/data/projects";
import { Calculator, ChevronRight, Quote } from "lucide-react";

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = getProjectBySlug(slug || "");

  if (!project) return <div className="min-h-screen flex items-center justify-center">Проект не найден</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/projects" className="hover:text-foreground">Проекты</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{project.title}</span>
          </nav>

          <span className="text-accent font-medium">{project.segment} • {project.region}</span>
          <h1 className="text-3xl md:text-4xl font-bold font-display mt-2 mb-6">{project.title}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{project.area}</p>
              <p className="text-sm text-muted-foreground">м²</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{project.span}</p>
              <p className="text-sm text-muted-foreground">м пролёт</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{project.height}</p>
              <p className="text-sm text-muted-foreground">м высота</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{project.termWeeks}</p>
              <p className="text-sm text-muted-foreground">недель</p>
            </div>
          </div>

          <div className="space-y-8 mb-12">
            <div><h2 className="font-bold mb-2">Задача</h2><p className="text-muted-foreground">{project.problem}</p></div>
            <div><h2 className="font-bold mb-2">Решение</h2><p className="text-muted-foreground">{project.solution}</p></div>
            <div><h2 className="font-bold mb-2">Результат</h2><p className="text-muted-foreground">{project.result}</p></div>
          </div>

          {project.testimonial && (
            <div className="bg-secondary rounded-xl p-6 mb-12">
              <Quote className="h-8 w-8 text-accent mb-4" />
              <p className="text-lg mb-4">{project.testimonial.text}</p>
              <p className="font-medium">{project.testimonial.author}</p>
              <p className="text-sm text-muted-foreground">{project.testimonial.position}</p>
            </div>
          )}

          <Button asChild><Link to="/calculators"><Calculator className="mr-2 h-4 w-4" />Рассчитать свой проект</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
