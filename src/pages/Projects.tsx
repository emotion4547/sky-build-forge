import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  slug: string;
  title: string;
  region: string;
  segment: string;
  area: number;
  term_weeks: number;
  photos: string[] | null;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("slug, title, region, segment, area, term_weeks, photos")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Реализованные проекты</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              projects.map(project => (
                <Link 
                  key={project.slug} 
                  to={`/projects/${project.slug}`} 
                  className="card-hover bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div className="aspect-video bg-secondary">
                    {project.photos && project.photos[0] && (
                      <img 
                        src={project.photos[0]} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-accent font-medium">{project.segment}</span>
                    <h2 className="font-semibold mt-1 mb-2">{project.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {project.area} м² • {project.region} • {project.term_weeks} нед.
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Projects;
