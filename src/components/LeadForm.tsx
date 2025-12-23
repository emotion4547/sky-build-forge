import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { calculatorConfigs, regionModifiers } from "@/data/calculator";
import { Send, Upload, X } from "lucide-react";

export const LeadForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    buildingType: "",
    area: "",
    region: "",
    message: "",
    meetingPreference: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/vnd.dwg', 'application/acad', 'application/x-dwg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (selectedFile.size > maxSize) {
        toast({ title: "Ошибка", description: "Файл слишком большой (макс. 10 МБ)", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrl: string | null = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('lead-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        fileUrl = data.path;
      }

      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        building_type: formData.buildingType || null,
        area_m2: formData.area ? parseInt(formData.area) : null,
        region: formData.region || null,
        message: formData.message || null,
        meeting_preference: formData.meetingPreference ? "Офлайн-встреча" : null,
        file_upload: fileUrl,
        source: "homepage"
      });

      if (error) throw error;

      toast({ title: "Заявка отправлена", description: "Мы свяжемся с вами в ближайшее время" });
      navigate("/thank-you");
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({ title: "Ошибка", description: "Не удалось отправить заявку", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="lead-form" className="py-20 md:py-28 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Оставить заявку
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4">Рассчитать проект</h2>
            <p className="text-muted-foreground text-lg">Заполните форму и получите предварительную оценку стоимости в течение 2 часов</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>Имя *</Label>
                <Input
                  placeholder="Ваше имя"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Телефон *</Label>
                <Input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  required
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>Тип здания</Label>
                <Select value={formData.buildingType} onValueChange={v => setFormData(prev => ({ ...prev, buildingType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                  <SelectContent>
                    {calculatorConfigs.map(c => (
                      <SelectItem key={c.slug} value={c.buildingType}>{c.buildingType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Площадь, м²</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={formData.area}
                  onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Регион</Label>
              <Select value={formData.region} onValueChange={v => setFormData(prev => ({ ...prev, region: v }))}>
                <SelectTrigger><SelectValue placeholder="Выберите регион" /></SelectTrigger>
                <SelectContent>
                  {regionModifiers.map(r => (
                    <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Сообщение</Label>
              <Textarea
                placeholder="Опишите ваш проект, требования, пожелания..."
                rows={3}
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <div>
              <Label className="mb-2 block">Прикрепить файл (PDF, DWG)</Label>
              {file ? (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Upload className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Нажмите для загрузки (макс. 10 МБ)</span>
                  <input
                    type="file"
                    accept=".pdf,.dwg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={formData.meetingPreference}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, meetingPreference: !!checked }))}
                className="mt-0.5"
              />
              <span className="text-sm">Хочу назначить офлайн-встречу для обсуждения проекта</span>
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Отправка..." : "Отправить заявку"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <a href="/privacy" className="text-primary hover:underline">политикой конфиденциальности</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
