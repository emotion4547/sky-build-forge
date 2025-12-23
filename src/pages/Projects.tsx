import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/PaginationControls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Project {
  slug: string;
  title: string;
  region: string;
  segment: string;
  area: number;
  term_weeks: number;
  photos: string[] | null;
}

const ITEMS_PER_PAGE = 9;

const SEGMENTS = [
  { value: "all", label: "Все сегменты" },
  { value: "промышленность", label: "Промышленность" },
  { value: "логистика", label: "Логистика" },
  { value: "агро", label: "Агро" },
  { value: "B2G", label: "B2G" },
  { value: "торговля", label: "Торговля" },
  { value: "авто", label: "Авто" },
];

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

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

  // Get unique regions for filter
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(projects.map(p => p.region))].sort();
    return [{ value: "all", label: "Все регионы" }, ...uniqueRegions.map(r => ({ value: r, label: r }))];
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSegment = selectedSegment === "all" || project.segment === selectedSegment;
      const matchesRegion = selectedRegion === "all" || project.region === selectedRegion;
      return matchesSegment && matchesRegion;
    });
  }, [projects, selectedSegment, selectedRegion]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSegment, selectedRegion]);

  const hasActiveFilters = selectedSegment !== "all" || selectedRegion !== "all";

  const clearFilters = () => {
    setSelectedSegment("all");
    setSelectedRegion("all");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Реализованные проекты</h1>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Сегмент" />
              </SelectTrigger>
              <SelectContent>
                {SEGMENTS.map(segment => (
                  <SelectItem key={segment.value} value={segment.value}>
                    {segment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Регион" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-2" />
                Сбросить фильтры
              </Button>
            )}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-muted-foreground mb-6">
              Найдено проектов: {filteredProjects.length}
            </p>
          )}

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
            ) : paginatedProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Проекты не найдены</p>
              </div>
            ) : (
              paginatedProjects.map(project => (
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

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Projects;
