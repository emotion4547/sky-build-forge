import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-slide-up">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Мы используем cookies для улучшения работы сайта.{" "}
          <Link to="/legal/cookies" className="text-primary hover:underline">
            Подробнее
          </Link>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDecline}>
            Отклонить
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
