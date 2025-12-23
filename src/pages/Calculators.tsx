import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculatorConfigs, regionModifiers, calculateCost, CalculationResult } from "@/data/calculator";
import { Calculator, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Calculators = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [buildingType, setBuildingType] = useState("");
  const [area, setArea] = useState("");
  const [region, setRegion] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const config = calculatorConfigs.find(c => c.slug === buildingType);
  const regionCoef = regionModifiers.find(r => r.region === region)?.coefficient || 1;

  const handleCalculate = () => {
    if (!config || !area || !region) return;
    const res = calculateCost(config, parseInt(area), selectedOptions, regionCoef);
    setResult(res);
  };

  const toggleOption = (option: string) => {
    setSelectedOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        building_type: config?.buildingType || null,
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
      setLoading(false);
    }
  };

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
                  {calculatorConfigs.map(c => <SelectItem key={c.slug} value={c.slug}>{c.buildingType}</SelectItem>)}
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
                  {regionModifiers.map(r => <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {config && (
              <div>
                <Label className="mb-3 block">Дополнительные опции</Label>
                <div className="space-y-2">
                  {config.options.map(opt => (
                    <label key={opt.name} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={selectedOptions.includes(opt.name)} onCheckedChange={() => toggleOption(opt.name)} />
                      <span className="text-sm">{opt.name} (+{opt.addPriceMin.toLocaleString()}–{opt.addPriceMax.toLocaleString()} ₽/м²)</span>
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
                      <Input 
                        placeholder="Ваше имя" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Телефон</Label>
                      <Input 
                        type="tel" 
                        placeholder="+7 (___) ___-__-__" 
                        required 
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
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
                    <Button type="submit" className="w-full" disabled={loading}>
                      <Send className="mr-2 h-4 w-4" />{loading ? "Отправка..." : "Отправить заявку"}
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
