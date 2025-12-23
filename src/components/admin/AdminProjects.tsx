import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderOpen, RefreshCw, Plus, Edit, Trash2, Eye, EyeOff, Search, X
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

type ProjectSegment = "промышленность" | "логистика" | "агро" | "B2G" | "торговля" | "авто";

interface Project {
  id: string;
  slug: string;
  title: string;
  region: string;
  segment: ProjectSegment;
  product_type: string;
  area: number;
  span: number;
  height: number;
  term_weeks: number;
  budget_min: number;
  budget_max: number;
  problem: string;
  solution: string;
  result: string;
  testimonial_text: string | null;
  testimonial_author: string | null;
  testimonial_position: string | null;
  photos: string[];
  tags: string[];
  year: number;
  is_published: boolean;
  created_at: string;
}

const emptyProject: Omit<Project, 'id' | 'created_at'> = {
  slug: "",
  title: "",
  region: "",
  segment: "промышленность",
  product_type: "",
  area: 0,
  span: 0,
  height: 0,
  term_weeks: 0,
  budget_min: 0,
  budget_max: 0,
  problem: "",
  solution: "",
  result: "",
  testimonial_text: null,
  testimonial_author: null,
  testimonial_position: null,
  photos: [],
  tags: [],
  year: new Date().getFullYear(),
  is_published: true
};

export const AdminProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить проекты", variant: "destructive" });
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const openCreateDialog = () => {
    setCurrentProject(emptyProject);
    setEditDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setCurrentProject(project);
    setEditDialogOpen(true);
  };

  const saveProject = async () => {
    if (!currentProject) return;

    const projectData = {
      slug: currentProject.slug,
      title: currentProject.title,
      region: currentProject.region,
      segment: currentProject.segment,
      product_type: currentProject.product_type,
      area: currentProject.area,
      span: currentProject.span,
      height: currentProject.height,
      term_weeks: currentProject.term_weeks,
      budget_min: currentProject.budget_min,
      budget_max: currentProject.budget_max,
      problem: currentProject.problem,
      solution: currentProject.solution,
      result: currentProject.result,
      testimonial_text: currentProject.testimonial_text || null,
      testimonial_author: currentProject.testimonial_author || null,
      testimonial_position: currentProject.testimonial_position || null,
      photos: currentProject.photos || [],
      tags: currentProject.tags || [],
      year: currentProject.year,
      is_published: currentProject.is_published
    };

    if ('id' in currentProject && currentProject.id) {
      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", currentProject.id);

      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Проект обновлён" });
        fetchProjects();
      }
    } else {
      const { error } = await supabase
        .from("projects")
        .insert([projectData]);

      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Проект создан" });
        fetchProjects();
      }
    }

    setEditDialogOpen(false);
    setCurrentProject(null);
  };

  const togglePublished = async (project: Project) => {
    const { error } = await supabase
      .from("projects")
      .update({ is_published: !project.is_published })
      .eq("id", project.id);

    if (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } else {
      setProjects(projects.map(p => 
        p.id === project.id ? { ...p, is_published: !p.is_published } : p
      ));
    }
  };

  const confirmDelete = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const deleteProject = async () => {
    if (!projectToDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectToDelete.id);

    if (error) {
      toast({ title: "Ошибка", variant: "destructive" });
    } else {
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      toast({ title: "Проект удалён" });
    }

    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const filteredProjects = projects.filter(p => 
    searchQuery === "" || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const segmentColors: Record<ProjectSegment, string> = {
    "промышленность": "bg-orange-500/10 text-orange-600",
    "логистика": "bg-blue-500/10 text-blue-600",
    "агро": "bg-green-500/10 text-green-600",
    "B2G": "bg-purple-500/10 text-purple-600",
    "торговля": "bg-pink-500/10 text-pink-600",
    "авто": "bg-red-500/10 text-red-600"
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск проектов..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchProjects} disabled={loading} variant="outline">
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Всего проектов</p>
          <p className="text-2xl font-bold">{projects.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Опубликовано</p>
          <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.is_published).length}</p>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Проектов не найдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{project.title}</h3>
                    <Badge className={segmentColors[project.segment]}>{project.segment}</Badge>
                    {!project.is_published && (
                      <Badge variant="outline" className="text-muted-foreground">
                        <EyeOff className="h-3 w-3 mr-1" /> Скрыт
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.region} • {project.area} м² • {project.year}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => togglePublished(project)}>
                    {project.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete(project)}>
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
              {currentProject && 'id' in currentProject ? "Редактировать проект" : "Новый проект"}
            </DialogTitle>
          </DialogHeader>
          {currentProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug</Label>
                  <Input 
                    value={currentProject.slug || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, slug: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Год</Label>
                  <Input 
                    type="number"
                    value={currentProject.year || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label>Название</Label>
                <Input 
                  value={currentProject.title || ""} 
                  onChange={(e) => setCurrentProject({...currentProject, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Регион</Label>
                  <Input 
                    value={currentProject.region || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, region: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Сегмент</Label>
                  <Select 
                    value={currentProject.segment || "промышленность"} 
                    onValueChange={(v) => setCurrentProject({...currentProject, segment: v as ProjectSegment})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="промышленность">Промышленность</SelectItem>
                      <SelectItem value="логистика">Логистика</SelectItem>
                      <SelectItem value="агро">Агро</SelectItem>
                      <SelectItem value="B2G">B2G</SelectItem>
                      <SelectItem value="торговля">Торговля</SelectItem>
                      <SelectItem value="авто">Авто</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Площадь (м²)</Label>
                  <Input 
                    type="number"
                    value={currentProject.area || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, area: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Пролёт (м)</Label>
                  <Input 
                    type="number"
                    value={currentProject.span || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, span: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Высота (м)</Label>
                  <Input 
                    type="number"
                    value={currentProject.height || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, height: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Срок (нед)</Label>
                  <Input 
                    type="number"
                    value={currentProject.term_weeks || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, term_weeks: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Бюджет от (₽)</Label>
                  <Input 
                    type="number"
                    value={currentProject.budget_min || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, budget_min: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Бюджет до (₽)</Label>
                  <Input 
                    type="number"
                    value={currentProject.budget_max || ""} 
                    onChange={(e) => setCurrentProject({...currentProject, budget_max: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label>Проблема</Label>
                <Textarea 
                  value={currentProject.problem || ""} 
                  onChange={(e) => setCurrentProject({...currentProject, problem: e.target.value})}
                />
              </div>
              <div>
                <Label>Решение</Label>
                <Textarea 
                  value={currentProject.solution || ""} 
                  onChange={(e) => setCurrentProject({...currentProject, solution: e.target.value})}
                />
              </div>
              <div>
                <Label>Результат</Label>
                <Textarea 
                  value={currentProject.result || ""} 
                  onChange={(e) => setCurrentProject({...currentProject, result: e.target.value})}
                />
              </div>
              <div>
                <Label>Теги (через запятую)</Label>
                <Input 
                  value={currentProject.tags?.join(", ") || ""} 
                  onChange={(e) => setCurrentProject({...currentProject, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
                />
              </div>
              <Button onClick={saveProject} className="w-full">Сохранить</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить "{projectToDelete?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProject} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
