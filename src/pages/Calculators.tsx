import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Send, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalculatorConfig {
  id: string;
  slug: string;
  building_type: string;
  base_price_min: number;
  base_price_max: number;
  duration_min_weeks: number;
  duration_max_weeks: number;
  notes: string | null;
}

interface CalculatorOption {
  id: string;
  config_id: string;
  name: string;
  add_price_min: number;
  add_price_max: number;
}

interface CalculatorRegion {
  id: string;
  region: string;
  coefficient: number;
}

interface CalculationResult {
  priceMin: number;
  priceMax: number;
  durationMin: number;
  durationMax: number;
}

const Calculators = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<CalculatorConfig[]>([]);
  const [options, setOptions] = useState<CalculatorOption[]>([]);
  const [regions, setRegions] = useState<CalculatorRegion[]>([]);
  
  const [buildingType, setBuildingType] = useState("");
  const [area, setArea] = useState("");
  const [region, setRegion] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configsRes, optionsRes, regionsRes] = await Promise.all([
        supabase.from("calculator_configs").select("*").eq("is_published", true).order("sort_order"),
        supabase.from("calculator_options").select("*").order("sort_order"),
        supabase.from("calculator_regions").select("*").order("sort_order"),
      ]);

      if (configsRes.data) setConfigs(configsRes.data);
      if (optionsRes.data) setOptions(optionsRes.data);
      if (regionsRes.data) setRegions(regionsRes.data);
    } catch (error) {
      console.error("Error fetching calculator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const config = configs.find(c => c.slug === buildingType);
  const configOptions = options.filter(o => o.config_id === config?.id);
  const regionCoef = regions.find(r => r.region === region)?.coefficient || 1;

  const handleCalculate = () => {
    if (!config || !area || !region) return;
    
    let priceMin = config.base_price_min;
    let priceMax = config.base_price_max;

    configOptions.forEach(option => {
      if (selectedOptions.includes(option.name)) {
        priceMin += option.add_price_min;
        priceMax += option.add_price_max;
      }
    });

    priceMin *= regionCoef;
    priceMax *= regionCoef;

    const areaNum = parseInt(area);
    const totalMin = Math.round(priceMin * areaNum);
    const totalMax = Math.round(priceMax * areaNum);

    let durationMin = config.duration_min_weeks;
    let durationMax = config.duration_max_weeks;

    if (areaNum > 2000) { durationMin += 2; durationMax += 4; }
    if (areaNum > 5000) { durationMin += 2; durationMax += 4; }

    setResult({ priceMin: totalMin, priceMax: totalMax, durationMin, durationMax });
  };

  const toggleOption = (option: string) => {
    setSelectedOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        building_type: config?.building_type || null,
        area_m2: parseInt(area) || null,
        region: region || null,
        source: "calculator"
      });

      if (error) throw error;
      toast({ title: "Заявка отправлена", description: "Мы подготовим точное КП и свяжемся с вами" });
      navigate("/thank-you");
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось отправить заявку", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">Калькулятор стоимости</h1>
          <p className="text-muted-foreground mb-8">Получите предварительную оценку стоимости и сроков строительства</p>

          <div className="space-y-6">
            <div>
              <Label>Тип здания</Label>
              <Select value={buildingType} onValueChange={v => { setBuildingType(v); setSelectedOptions([]); setResult(null); }}>
                <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                <SelectContent>
                  {configs.map(c => <SelectItem key={c.slug} value={c.slug}>{c.building_type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Площадь, м²</Label>
              <Input type="number" placeholder="500" value={area} onChange={e => setArea(e.target.value)} />
            </div>

            <div>
              <Label>Регион</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue placeholder="Выберите регион" /></SelectTrigger>
                <SelectContent>
                  {regions.map(r => <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {config && configOptions.length > 0 && (
              <div>
                <Label className="mb-3 block">Дополнительные опции</Label>
                <div className="space-y-2">
                  {configOptions.map(opt => (
                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={selectedOptions.includes(opt.name)} onCheckedChange={() => toggleOption(opt.name)} />
                      <span className="text-sm">{opt.name} (+{opt.add_price_min.toLocaleString()}–{opt.add_price_max.toLocaleString()} ₽/м²)</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleCalculate} disabled={!buildingType || !area || !region} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />Рассчитать
            </Button>

            {result && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Предварительная оценка</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Стоимость</p>
                    <p className="text-xl font-bold text-primary">{(result.priceMin / 1000000).toFixed(1)}–{(result.priceMax / 1000000).toFixed(1)} млн ₽</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Срок</p>
                    <p className="text-xl font-bold text-primary">{result.durationMin}–{result.durationMax} недель</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">* Расчёт является предварительным и не является публичной офертой</p>
                
                {!showForm ? (
                  <Button onClick={() => setShowForm(true)} className="w-full">
                    <Send className="mr-2 h-4 w-4" />Получить точное КП
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <Label>Имя</Label>
                      <Input placeholder="Ваше имя" required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Телефон</Label>
                      <Input type="tel" placeholder="+7 (___) ___-__-__" required value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      <Send className="mr-2 h-4 w-4" />{submitting ? "Отправка..." : "Отправить заявку"}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calculators;
