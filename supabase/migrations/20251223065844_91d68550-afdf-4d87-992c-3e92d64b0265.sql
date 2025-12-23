-- Create site_settings table for editable content
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view settings (for frontend)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.site_settings (key, value) VALUES
('hero', '{
  "badge": "Приволжский федеральный округ",
  "title": "Быстровозводимые",
  "titleAccent": "здания",
  "description": "Проектирование и строительство складов, цехов, ангаров. Собственное производство металлоконструкций.",
  "highlights": ["От 6 недель", "Гарантия 5 лет", "Под ключ"],
  "phone": "+7 (800) 555-35-35"
}'::jsonb),
('stats', '[
  {"value": "150+", "label": "Реализованных проектов"},
  {"value": "500 000", "label": "м² построенных объектов", "suffix": "+"},
  {"value": "12", "label": "Лет опыта на рынке"},
  {"value": "6", "label": "Регионов ПФО"}
]'::jsonb),
('benefits', '[
  {"icon": "Clock", "title": "Сроки от 6 недель", "description": "Быстрое проектирование и возведение благодаря готовым конструктивным решениям"},
  {"icon": "Maximize", "title": "Пролёты до 60 м", "description": "Большие пролёты без промежуточных опор для максимальной полезной площади"},
  {"icon": "Award", "title": "Сертификация СРО", "description": "Все необходимые лицензии на проектирование и строительство"},
  {"icon": "Shield", "title": "Гарантия 5 лет", "description": "Полная гарантия на конструкции и выполненные работы"},
  {"icon": "Wrench", "title": "Своё производство", "description": "Собственный завод металлоконструкций — контроль качества на всех этапах"},
  {"icon": "Truck", "title": "Доставка по ПФО", "description": "Логистика по всем регионам Приволжского федерального округа"}
]'::jsonb),
('work_stages', '[
  {"number": "01", "icon": "FileText", "title": "Заявка и консультация", "description": "Обсуждаем ваши требования, бюджет и сроки. Бесплатный выезд инженера на объект.", "duration": "1–2 дня"},
  {"number": "02", "icon": "Ruler", "title": "Проектирование", "description": "Разрабатываем проект с учётом нагрузок, климата и назначения здания.", "duration": "5–10 дней"},
  {"number": "03", "icon": "Factory", "title": "Производство", "description": "Изготавливаем металлоконструкции и сэндвич-панели на собственном заводе.", "duration": "2–3 недели"},
  {"number": "04", "icon": "Truck", "title": "Доставка", "description": "Логистика комплектующих на объект по всему Приволжскому округу.", "duration": "1–3 дня"},
  {"number": "05", "icon": "HardHat", "title": "Монтаж", "description": "Профессиональная бригада выполняет сборку здания под ключ.", "duration": "2–4 недели"},
  {"number": "06", "icon": "CheckCircle", "title": "Сдача объекта", "description": "Подписание акта, передача документации и гарантийное обслуживание.", "duration": "1 день"}
]'::jsonb),
('cta', '{
  "title": "Готовы обсудить",
  "titleAccent": "ваш проект?",
  "description": "Получите бесплатную консультацию и предварительный расчёт стоимости вашего объекта уже сегодня",
  "phone": "+7 (800) 555-35-35"
}'::jsonb);