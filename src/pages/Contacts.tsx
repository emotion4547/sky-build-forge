import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Contacts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        message: formData.message || null,
        source: "contacts"
      });

      if (error) throw error;

      toast({ title: "Заявка отправлена", description: "Мы свяжемся с вами в ближайшее время" });
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
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Контакты</h1>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6 mb-8">
                {[
                  { icon: MapPin, title: "Адрес", text: "460019, Оренбургская область, г. Оренбург, мкр. Посёлок Кушкуль, ул. Просвещения, д. 19/4" },
                  { icon: Phone, title: "Телефон", text: "+7 (932) 536-91-29", href: "tel:+79325369129" },
                  { icon: Mail, title: "Email", text: "skbural@mail.ru", href: "mailto:skbural@mail.ru" },
                  { icon: Clock, title: "Режим работы", text: "Пн–Пт: 9:00–18:00" },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="icon-box shrink-0"><item.icon className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.href ? (
                        <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors">{item.text}</a>
                      ) : (
                        <p className="text-muted-foreground">{item.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-secondary rounded-xl aspect-video" />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Оставить заявку</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                  <Label>Сообщение</Label>
                  <Textarea 
                    placeholder="Опишите ваш проект" 
                    rows={4} 
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="mr-2 h-4 w-4" />{loading ? "Отправка..." : "Отправить заявку"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contacts;
