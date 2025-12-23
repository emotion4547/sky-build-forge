import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, ChevronRight, Quote, ZoomIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ImageLightbox";

interface Project {
  slug: string;
  title: string;
  region: string;
  segment: string;
  area: number;
  span: number;
  height: number;
  term_weeks: number;
  problem: string;
  solution: string;
  result: string;
  testimonial_text: string | null;
  testimonial_author: string | null;
  testimonial_position: string | null;
  photos: string[] | null;
}

const ProjectDetail = () => {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!error && data) {
        setProject(data);
      }
      setLoading(false);
    };

    if (slug) fetchProject();
  }, [slug]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container max-w-4xl space-y-6">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-10 w-3/4" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Проект не найден</p>
        </div>
        <Footer />
      </div>
    );
  }

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

          {project.photos && project.photos.length > 0 && (
            <div className="mb-8">
              <button 
                onClick={() => openLightbox(0)}
                className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary group cursor-pointer"
              >
                <img 
                  src={project.photos[0]} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-full p-3">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>
              </button>
              {project.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {project.photos.slice(1, 5).map((photo, i) => (
                    <button 
                      key={i} 
                      onClick={() => openLightbox(i + 1)}
                      className="relative aspect-video rounded-lg overflow-hidden bg-secondary group cursor-pointer"
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors" />
                      {i === 3 && project.photos && project.photos.length > 5 && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="text-lg font-semibold">+{project.photos.length - 5}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {project.photos && project.photos.length > 0 && (
            <ImageLightbox
              images={project.photos}
              initialIndex={lightboxIndex}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />
          )}

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
              <p className="text-2xl font-bold text-primary">{project.term_weeks}</p>
              <p className="text-sm text-muted-foreground">недель</p>
            </div>
          </div>

          <div className="space-y-8 mb-12">
            <div>
              <h2 className="font-bold mb-2">Задача</h2>
              <p className="text-muted-foreground">{project.problem}</p>
            </div>
            <div>
              <h2 className="font-bold mb-2">Решение</h2>
              <p className="text-muted-foreground">{project.solution}</p>
            </div>
            <div>
              <h2 className="font-bold mb-2">Результат</h2>
              <p className="text-muted-foreground">{project.result}</p>
            </div>
          </div>

          {project.testimonial_text && (
            <div className="bg-secondary rounded-xl p-6 mb-12">
              <Quote className="h-8 w-8 text-accent mb-4" />
              <p className="text-lg mb-4">{project.testimonial_text}</p>
              <p className="font-medium">{project.testimonial_author}</p>
              <p className="text-sm text-muted-foreground">{project.testimonial_position}</p>
            </div>
          )}

          <Button asChild>
            <Link to="/calculators">
              <Calculator className="mr-2 h-4 w-4" />
              Рассчитать свой проект
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
