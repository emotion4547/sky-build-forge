import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, RefreshCw } from "lucide-react";

interface SiteSetting {
  id: string;
  key: string;
  value: any;
}

export function AdminSiteSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("key");

    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    setSaving(key);
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось сохранить", variant: "destructive" });
    } else {
      toast({ title: "Сохранено", description: `Настройки "${key}" обновлены` });
      fetchSettings();
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const heroSettings = settings.find(s => s.key === "hero");
  const statsSettings = settings.find(s => s.key === "stats");
  const benefitsSettings = settings.find(s => s.key === "benefits");
  const stagesSettings = settings.find(s => s.key === "work_stages");
  const ctaSettings = settings.find(s => s.key === "cta");

  return (
    <Tabs defaultValue="hero" className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full max-w-2xl">
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="stats">Статистика</TabsTrigger>
        <TabsTrigger value="benefits">Преимущества</TabsTrigger>
        <TabsTrigger value="stages">Этапы</TabsTrigger>
        <TabsTrigger value="cta">CTA</TabsTrigger>
      </TabsList>

      {/* Hero Settings */}
      <TabsContent value="hero">
        <HeroEditor 
          data={heroSettings?.value || {}} 
          onSave={(value) => updateSetting("hero", value)}
          saving={saving === "hero"}
        />
      </TabsContent>

      {/* Stats Settings */}
      <TabsContent value="stats">
        <StatsEditor 
          data={statsSettings?.value || []} 
          onSave={(value) => updateSetting("stats", value)}
          saving={saving === "stats"}
        />
      </TabsContent>

      {/* Benefits Settings */}
      <TabsContent value="benefits">
        <BenefitsEditor 
          data={benefitsSettings?.value || []} 
          onSave={(value) => updateSetting("benefits", value)}
          saving={saving === "benefits"}
        />
      </TabsContent>

      {/* Work Stages Settings */}
      <TabsContent value="stages">
        <StagesEditor 
          data={stagesSettings?.value || []} 
          onSave={(value) => updateSetting("work_stages", value)}
          saving={saving === "work_stages"}
        />
      </TabsContent>

      {/* CTA Settings */}
      <TabsContent value="cta">
        <CTAEditor 
          data={ctaSettings?.value || {}} 
          onSave={(value) => updateSetting("cta", value)}
          saving={saving === "cta"}
        />
      </TabsContent>
    </Tabs>
  );
}

// Hero Editor
function HeroEditor({ data, onSave, saving }: { data: any; onSave: (v: any) => void; saving: boolean }) {
  const [form, setForm] = useState(data);

  useEffect(() => { setForm(data); }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Главный экран (Hero)</CardTitle>
        <CardDescription>Настройки главного блока на первом экране</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Бейдж</Label>
          <Input value={form.badge || ""} onChange={e => setForm({ ...form, badge: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Заголовок</Label>
            <Input value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Акцент заголовка</Label>
            <Input value={form.titleAccent || ""} onChange={e => setForm({ ...form, titleAccent: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Описание</Label>
          <Textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <Label>Преимущества (через запятую)</Label>
          <Input 
            value={(form.highlights || []).join(", ")} 
            onChange={e => setForm({ ...form, highlights: e.target.value.split(",").map((s: string) => s.trim()) })} 
          />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <Button onClick={() => onSave(form)} disabled={saving}>
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

// Stats Editor
function StatsEditor({ data, onSave, saving }: { data: any[]; onSave: (v: any) => void; saving: boolean }) {
  const [items, setItems] = useState(data);

  useEffect(() => { setItems(data); }, [data]);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика</CardTitle>
        <CardDescription>Блок с цифрами компании</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label>Значение</Label>
              <Input value={item.value || ""} onChange={e => updateItem(index, "value", e.target.value)} />
            </div>
            <div>
              <Label>Суффикс</Label>
              <Input value={item.suffix || ""} onChange={e => updateItem(index, "suffix", e.target.value)} placeholder="+" />
            </div>
            <div>
              <Label>Описание</Label>
              <Input value={item.label || ""} onChange={e => updateItem(index, "label", e.target.value)} />
            </div>
          </div>
        ))}
        <Button onClick={() => onSave(items)} disabled={saving}>
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

// Benefits Editor
function BenefitsEditor({ data, onSave, saving }: { data: any[]; onSave: (v: any) => void; saving: boolean }) {
  const [items, setItems] = useState(data);

  useEffect(() => { setItems(data); }, [data]);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { icon: "Shield", title: "", description: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Преимущества</CardTitle>
        <CardDescription>Блок с преимуществами компании</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Преимущество {index + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Иконка (Clock, Shield, Award, Wrench, Truck, Maximize)</Label>
                <Input value={item.icon || ""} onChange={e => updateItem(index, "icon", e.target.value)} />
              </div>
              <div>
                <Label>Заголовок</Label>
                <Input value={item.title || ""} onChange={e => updateItem(index, "title", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={item.description || ""} onChange={e => updateItem(index, "description", e.target.value)} />
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Добавить
          </Button>
          <Button onClick={() => onSave(items)} disabled={saving}>
            {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Сохранить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Stages Editor
function StagesEditor({ data, onSave, saving }: { data: any[]; onSave: (v: any) => void; saving: boolean }) {
  const [items, setItems] = useState(data);

  useEffect(() => { setItems(data); }, [data]);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Этапы работы</CardTitle>
        <CardDescription>Таймлайн процесса строительства</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {item.number}
              </span>
              <span className="font-medium">{item.title}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Иконка</Label>
                <Input value={item.icon || ""} onChange={e => updateItem(index, "icon", e.target.value)} />
              </div>
              <div>
                <Label>Заголовок</Label>
                <Input value={item.title || ""} onChange={e => updateItem(index, "title", e.target.value)} />
              </div>
              <div>
                <Label>Срок</Label>
                <Input value={item.duration || ""} onChange={e => updateItem(index, "duration", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={item.description || ""} onChange={e => updateItem(index, "description", e.target.value)} />
            </div>
          </div>
        ))}
        <Button onClick={() => onSave(items)} disabled={saving}>
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

// CTA Editor
function CTAEditor({ data, onSave, saving }: { data: any; onSave: (v: any) => void; saving: boolean }) {
  const [form, setForm] = useState(data);

  useEffect(() => { setForm(data); }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Призыв к действию (CTA)</CardTitle>
        <CardDescription>Блок с кнопками внизу страницы</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Заголовок</Label>
            <Input value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Акцент заголовка</Label>
            <Input value={form.titleAccent || ""} onChange={e => setForm({ ...form, titleAccent: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Описание</Label>
          <Textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <Button onClick={() => onSave(form)} disabled={saving}>
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}
