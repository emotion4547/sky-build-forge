import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { projects } from "@/data/projects";
import { Link } from "react-router-dom";

const Projects = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-12">
      <div className="container">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Реализованные проекты</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project.slug} to={`/projects/${project.slug}`} className="card-hover bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-secondary" />
              <div className="p-4">
                <span className="text-xs text-accent font-medium">{project.segment}</span>
                <h2 className="font-semibold mt-1 mb-2">{project.title}</h2>
                <p className="text-sm text-muted-foreground">{project.area} м² • {project.region} • {project.termWeeks} нед.</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Projects;
