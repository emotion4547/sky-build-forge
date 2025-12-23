import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Pencil, Trash2, Save, RefreshCw, Settings2, 
  MapPin, GripVertical, ChevronDown, ChevronUp
} from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CalculatorConfig {
  id: string;
  slug: string;
  building_type: string;
  base_price_min: number;
  base_price_max: number;
  duration_min_weeks: number;
  duration_max_weeks: number;
  notes: string | null;
  is_published: boolean;
  sort_order: number;
}

interface CalculatorOption {
  id: string;
  config_id: string;
  name: string;
  add_price_min: number;
  add_price_max: number;
  sort_order: number;
}

interface CalculatorRegion {
  id: string;
  region: string;
  coefficient: number;
  sort_order: number;
}

export function AdminCalculators() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<CalculatorConfig[]>([]);
  const [options, setOptions] = useState<CalculatorOption[]>([]);
  const [regions, setRegions] = useState<CalculatorRegion[]>([]);
  
  const [editingConfig, setEditingConfig] = useState<CalculatorConfig | null>(null);
  const [editingOption, setEditingOption] = useState<CalculatorOption | null>(null);
  const [editingRegion, setEditingRegion] = useState<CalculatorRegion | null>(null);
  
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'config' | 'option' | 'region'; id: string } | null>(null);
  
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [expandedConfigs, setExpandedConfigs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configsRes, optionsRes, regionsRes] = await Promise.all([
        supabase.from("calculator_configs").select("*").order("sort_order"),
        supabase.from("calculator_options").select("*").order("sort_order"),
        supabase.from("calculator_regions").select("*").order("sort_order"),
      ]);

      if (configsRes.data) setConfigs(configsRes.data);
      if (optionsRes.data) setOptions(optionsRes.data);
      if (regionsRes.data) setRegions(regionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Ошибка", description: "Не удалось загрузить данные", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleConfigExpanded = (id: string) => {
    setExpandedConfigs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Config CRUD
  const handleSaveConfig = async (config: Partial<CalculatorConfig>) => {
    try {
      if (editingConfig?.id) {
        const { error } = await supabase
          .from("calculator_configs")
          .update(config)
          .eq("id", editingConfig.id);
        if (error) throw error;
        toast({ title: "Сохранено", description: "Калькулятор обновлён" });
      } else {
        const insertData = {
          slug: config.slug!,
          building_type: config.building_type!,
          base_price_min: config.base_price_min ?? 0,
          base_price_max: config.base_price_max ?? 0,
          duration_min_weeks: config.duration_min_weeks ?? 8,
          duration_max_weeks: config.duration_max_weeks ?? 16,
          notes: config.notes,
          is_published: config.is_published ?? true,
          sort_order: config.sort_order ?? 0,
        };
        const { error } = await supabase.from("calculator_configs").insert(insertData);
        if (error) throw error;
        toast({ title: "Создано", description: "Калькулятор добавлен" });
      }
      setConfigDialogOpen(false);
      setEditingConfig(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteConfig = async () => {
    if (!deleteTarget || deleteTarget.type !== 'config') return;
    try {
      const { error } = await supabase.from("calculator_configs").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: "Удалено", description: "Калькулятор удалён" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // Option CRUD
  const handleSaveOption = async (option: Partial<CalculatorOption>) => {
    try {
      if (editingOption?.id) {
        const { error } = await supabase
          .from("calculator_options")
          .update(option)
          .eq("id", editingOption.id);
        if (error) throw error;
        toast({ title: "Сохранено", description: "Опция обновлена" });
      } else {
        const insertData = {
          config_id: option.config_id!,
          name: option.name!,
          add_price_min: option.add_price_min ?? 0,
          add_price_max: option.add_price_max ?? 0,
          sort_order: option.sort_order ?? 0,
        };
        const { error } = await supabase.from("calculator_options").insert(insertData);
        if (error) throw error;
        toast({ title: "Создано", description: "Опция добавлена" });
      }
      setOptionDialogOpen(false);
      setEditingOption(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteOption = async () => {
    if (!deleteTarget || deleteTarget.type !== 'option') return;
    try {
      const { error } = await supabase.from("calculator_options").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: "Удалено", description: "Опция удалена" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // Region CRUD
  const handleSaveRegion = async (region: Partial<CalculatorRegion>) => {
    try {
      if (editingRegion?.id) {
        const { error } = await supabase
          .from("calculator_regions")
          .update(region)
          .eq("id", editingRegion.id);
        if (error) throw error;
        toast({ title: "Сохранено", description: "Регион обновлён" });
      } else {
        const insertData = {
          region: region.region!,
          coefficient: region.coefficient ?? 1,
          sort_order: region.sort_order ?? 0,
        };
        const { error } = await supabase.from("calculator_regions").insert(insertData);
        if (error) throw error;
        toast({ title: "Создано", description: "Регион добавлен" });
      }
      setRegionDialogOpen(false);
      setEditingRegion(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteRegion = async () => {
    if (!deleteTarget || deleteTarget.type !== 'region') return;
    try {
      const { error } = await supabase.from("calculator_regions").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: "Удалено", description: "Регион удалён" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleTogglePublished = async (config: CalculatorConfig) => {
    try {
      const { error } = await supabase
        .from("calculator_configs")
        .update({ is_published: !config.is_published })
        .eq("id", config.id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
  };

  const getOptionsForConfig = (configId: string) => {
    return options.filter(o => o.config_id === configId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculators" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="calculators" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Калькуляторы
          </TabsTrigger>
          <TabsTrigger value="regions" className="gap-2">
            <MapPin className="h-4 w-4" />
            Регионы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculators" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Всего калькуляторов: {configs.length}
            </p>
            <Button onClick={() => { setEditingConfig(null); setConfigDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить калькулятор
            </Button>
          </div>

          <div className="space-y-4">
            {configs.map((config) => (
              <Card key={config.id}>
                <Collapsible 
                  open={expandedConfigs.has(config.id)}
                  onOpenChange={() => toggleConfigExpanded(config.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {expandedConfigs.has(config.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {config.building_type}
                            <Badge variant={config.is_published ? "default" : "secondary"}>
                              {config.is_published ? "Опубликован" : "Скрыт"}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config.base_price_min.toLocaleString()}–{config.base_price_max.toLocaleString()} ₽/м² • 
                            {config.duration_min_weeks}–{config.duration_max_weeks} нед. • 
                            {getOptionsForConfig(config.id).length} опций
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.is_published}
                          onCheckedChange={() => handleTogglePublished(config)}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setEditingConfig(config); setConfigDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setDeleteTarget({ type: 'config', id: config.id }); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Дополнительные опции</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => { 
                              setSelectedConfigId(config.id);
                              setEditingOption(null); 
                              setOptionDialogOpen(true); 
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Добавить опцию
                          </Button>
                        </div>

                        {getOptionsForConfig(config.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            Нет дополнительных опций
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead className="text-right">Мин. цена</TableHead>
                                <TableHead className="text-right">Макс. цена</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getOptionsForConfig(config.id).map((option) => (
                                <TableRow key={option.id}>
                                  <TableCell>{option.name}</TableCell>
                                  <TableCell className="text-right">
                                    +{option.add_price_min.toLocaleString()} ₽/м²
                                  </TableCell>
                                  <TableCell className="text-right">
                                    +{option.add_price_max.toLocaleString()} ₽/м²
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => { 
                                          setSelectedConfigId(config.id);
                                          setEditingOption(option); 
                                          setOptionDialogOpen(true); 
                                        }}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => { 
                                          setDeleteTarget({ type: 'option', id: option.id }); 
                                          setDeleteDialogOpen(true); 
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}

                        {config.notes && (
                          <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
                            {config.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Всего регионов: {regions.length}
            </p>
            <Button onClick={() => { setEditingRegion(null); setRegionDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить регион
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Регион</TableHead>
                  <TableHead className="text-right">Коэффициент</TableHead>
                  <TableHead className="text-right">Наценка</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-medium">{region.region}</TableCell>
                    <TableCell className="text-right">{region.coefficient}</TableCell>
                    <TableCell className="text-right">
                      {region.coefficient === 1 ? '—' : `+${((region.coefficient - 1) * 100).toFixed(0)}%`}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setEditingRegion(region); setRegionDialogOpen(true); }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setDeleteTarget({ type: 'region', id: region.id }); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Редактировать калькулятор" : "Добавить калькулятор"}
            </DialogTitle>
          </DialogHeader>
          <ConfigForm 
            config={editingConfig}
            onSave={handleSaveConfig}
            onCancel={() => setConfigDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Option Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingOption ? "Редактировать опцию" : "Добавить опцию"}
            </DialogTitle>
          </DialogHeader>
          <OptionForm 
            option={editingOption}
            configId={selectedConfigId}
            onSave={handleSaveOption}
            onCancel={() => setOptionDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Region Dialog */}
      <Dialog open={regionDialogOpen} onOpenChange={setRegionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRegion ? "Редактировать регион" : "Добавить регион"}
            </DialogTitle>
          </DialogHeader>
          <RegionForm 
            region={editingRegion}
            onSave={handleSaveRegion}
            onCancel={() => setRegionDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'config' && "Это действие удалит калькулятор и все связанные опции."}
              {deleteTarget?.type === 'option' && "Это действие удалит опцию из калькулятора."}
              {deleteTarget?.type === 'region' && "Это действие удалит регион из списка."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteTarget?.type === 'config') handleDeleteConfig();
                if (deleteTarget?.type === 'option') handleDeleteOption();
                if (deleteTarget?.type === 'region') handleDeleteRegion();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Config Form Component
function ConfigForm({ 
  config, 
  onSave, 
  onCancel 
}: { 
  config: CalculatorConfig | null; 
  onSave: (config: Partial<CalculatorConfig>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    slug: config?.slug || "",
    building_type: config?.building_type || "",
    base_price_min: config?.base_price_min || 0,
    base_price_max: config?.base_price_max || 0,
    duration_min_weeks: config?.duration_min_weeks || 8,
    duration_max_weeks: config?.duration_max_weeks || 16,
    notes: config?.notes || "",
    is_published: config?.is_published ?? true,
    sort_order: config?.sort_order || 0,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Название типа здания</Label>
          <Input
            value={formData.building_type}
            onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
            placeholder="Склад из сэндвич-панелей"
            required
          />
        </div>
        <div>
          <Label>Slug (URL)</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="sklad"
            required
          />
        </div>
        <div>
          <Label>Порядок сортировки</Label>
          <Input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Мин. цена (₽/м²)</Label>
          <Input
            type="number"
            value={formData.base_price_min}
            onChange={(e) => setFormData({ ...formData, base_price_min: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label>Макс. цена (₽/м²)</Label>
          <Input
            type="number"
            value={formData.base_price_max}
            onChange={(e) => setFormData({ ...formData, base_price_max: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Мин. срок (недель)</Label>
          <Input
            type="number"
            value={formData.duration_min_weeks}
            onChange={(e) => setFormData({ ...formData, duration_min_weeks: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label>Макс. срок (недель)</Label>
          <Input
            type="number"
            value={formData.duration_max_weeks}
            onChange={(e) => setFormData({ ...formData, duration_max_weeks: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div>
        <Label>Примечание</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Дополнительная информация о расчёте"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
        />
        <Label>Опубликован</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
      </div>
    </form>
  );
}

// Option Form Component
function OptionForm({ 
  option,
  configId,
  onSave, 
  onCancel 
}: { 
  option: CalculatorOption | null;
  configId: string | null;
  onSave: (option: Partial<CalculatorOption>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    config_id: option?.config_id || configId || "",
    name: option?.name || "",
    add_price_min: option?.add_price_min || 0,
    add_price_max: option?.add_price_max || 0,
    sort_order: option?.sort_order || 0,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div>
        <Label>Название опции</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Кран-балка до 10 т"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Мин. наценка (₽/м²)</Label>
          <Input
            type="number"
            value={formData.add_price_min}
            onChange={(e) => setFormData({ ...formData, add_price_min: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label>Макс. наценка (₽/м²)</Label>
          <Input
            type="number"
            value={formData.add_price_max}
            onChange={(e) => setFormData({ ...formData, add_price_max: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div>
        <Label>Порядок сортировки</Label>
        <Input
          type="number"
          value={formData.sort_order}
          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
      </div>
    </form>
  );
}

// Region Form Component
function RegionForm({ 
  region, 
  onSave, 
  onCancel 
}: { 
  region: CalculatorRegion | null; 
  onSave: (region: Partial<CalculatorRegion>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    region: region?.region || "",
    coefficient: region?.coefficient || 1,
    sort_order: region?.sort_order || 0,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div>
        <Label>Название региона</Label>
        <Input
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          placeholder="Самарская область"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Коэффициент</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.coefficient}
            onChange={(e) => setFormData({ ...formData, coefficient: parseFloat(e.target.value) || 1 })}
            required
          />
        </div>
        <div>
          <Label>Порядок сортировки</Label>
          <Input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Коэффициент 1.0 = без наценки, 1.05 = +5%, 1.10 = +10%
      </p>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
      </div>
    </form>
  );
}
