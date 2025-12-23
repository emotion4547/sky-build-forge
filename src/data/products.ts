// Product types data
export interface Product {
  slug: string;
  title: string;
  excerpt: string;
  priceFrom: number;
  priceTo: number;
  icon: string;
  usp: string[];
  specs: {
    spans: string;
    heights: string;
    insulation: string;
    snowLoad: string;
    fireResistance: string;
  };
  applications: string[];
  steps: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  gallery: string[];
  relatedProjects: string[];
}

export const products: Product[] = [
  {
    slug: "sklad",
    title: "Склад из сэндвич-панелей",
    excerpt: "Быстровозводимые складские комплексы с оптимальным температурным режимом и логистикой",
    priceFrom: 32000,
    priceTo: 46000,
    icon: "Warehouse",
    usp: [
      "Срок строительства от 8 недель",
      "Пролёты до 36 метров без опор",
      "Температурный режим до -20°C"
    ],
    specs: {
      spans: "12–36 м",
      heights: "6–18 м",
      insulation: "80–200 мм (PIR/минвата)",
      snowLoad: "до 240 кг/м²",
      fireResistance: "EI 30–90"
    },
    applications: ["Логистические центры", "Распределительные склады", "Кросс-докинг терминалы", "Холодильные склады"],
    steps: [
      { title: "Проектирование", description: "Разработка проекта под ваши требования" },
      { title: "Фундамент", description: "Устройство монолитного или свайного фундамента" },
      { title: "Каркас", description: "Монтаж металлоконструкций" },
      { title: "Ограждение", description: "Установка сэндвич-панелей" },
      { title: "Инженерия", description: "Подключение коммуникаций" },
      { title: "Сдача", description: "Ввод объекта в эксплуатацию" }
    ],
    faq: [
      { question: "Нужно ли разрешение на строительство?", answer: "Да, для капитальных объектов требуется разрешение. Мы помогаем с оформлением документации." },
      { question: "Какой фундамент подходит?", answer: "Зависит от грунтов: монолитная плита, ленточный или свайный фундамент." },
      { question: "Можно ли сделать отопление?", answer: "Да, предусматриваем системы отопления, вентиляции и кондиционирования." },
      { question: "Какая гарантия?", answer: "Гарантия на конструкции — 5 лет, на панели — до 25 лет." }
    ],
    gallery: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    relatedProjects: ["sklad-kazan", "sklad-samara"]
  },
  {
    slug: "tsekh",
    title: "Производственный цех",
    excerpt: "Цеха для машиностроения, металлообработки и других производств с кран-балками",
    priceFrom: 35000,
    priceTo: 52000,
    icon: "Factory",
    usp: [
      "Большие пролёты до 42 м",
      "Подкрановые пути до 50 т",
      "Усиленный пол под оборудование"
    ],
    specs: {
      spans: "18–42 м",
      heights: "8–24 м",
      insulation: "100–200 мм",
      snowLoad: "до 320 кг/м²",
      fireResistance: "EI 45–120"
    },
    applications: ["Машиностроение", "Металлообработка", "Сборочные производства", "Пищевые производства"],
    steps: [
      { title: "Техзадание", description: "Анализ требований к производству" },
      { title: "Проект", description: "Разработка рабочей документации" },
      { title: "Фундамент", description: "Усиленный фундамент под оборудование" },
      { title: "Каркас", description: "Монтаж с подкрановыми путями" },
      { title: "Ограждение", description: "Утеплённые панели" },
      { title: "Пуск", description: "Наладка и сдача объекта" }
    ],
    faq: [
      { question: "Можно ли установить кран-балку?", answer: "Да, проектируем с учётом грузоподъёмности до 50 тонн." },
      { question: "Какая нагрузка на пол?", answer: "Проектируем полы под нагрузку до 10 т/м²." },
      { question: "Какие требования к вентиляции?", answer: "Рассчитываем под конкретное производство и требования СанПиН." }
    ],
    gallery: ["/placeholder.svg", "/placeholder.svg"],
    relatedProjects: ["tsekh-tolyatti"]
  },
  {
    slug: "angar",
    title: "Ангар для техники/хранения",
    excerpt: "Экономичные ангары для хранения техники, материалов и сельхозпродукции",
    priceFrom: 26000,
    priceTo: 38000,
    icon: "Building",
    usp: [
      "Минимальная цена за м²",
      "Строительство от 6 недель",
      "Широкие въездные проёмы"
    ],
    specs: {
      spans: "12–30 м",
      heights: "4–12 м",
      insulation: "без утепления / 50–100 мм",
      snowLoad: "до 180 кг/м²",
      fireResistance: "EI 15–45"
    },
    applications: ["Хранение техники", "Склад материалов", "Зернохранилище", "Гараж спецтехники"],
    steps: [
      { title: "Замер", description: "Выезд на площадку" },
      { title: "Проект", description: "Типовой или индивидуальный" },
      { title: "Производство", description: "Изготовление конструкций" },
      { title: "Монтаж", description: "Сборка на объекте" }
    ],
    faq: [
      { question: "Нужен ли фундамент?", answer: "Для лёгких ангаров возможна установка на площадку или ленточный фундамент." },
      { question: "Можно ли утеплить позже?", answer: "Да, конструкция позволяет доутепление." }
    ],
    gallery: ["/placeholder.svg"],
    relatedProjects: ["angar-orenburg"]
  },
  {
    slug: "pavilon",
    title: "Торговый павильон/шоурум",
    excerpt: "Современные торговые павильоны и автосалоны с панорамным остеклением",
    priceFrom: 38000,
    priceTo: 58000,
    icon: "Store",
    usp: [
      "Архитектурные фасады",
      "Панорамное остекление",
      "Готовность под отделку"
    ],
    specs: {
      spans: "9–24 м",
      heights: "4–8 м",
      insulation: "100–150 мм",
      snowLoad: "до 200 кг/м²",
      fireResistance: "EI 45–90"
    },
    applications: ["Торговые центры", "Автосалоны", "Шоурумы", "Выставочные залы"],
    steps: [
      { title: "Дизайн", description: "Разработка концепции" },
      { title: "Проектирование", description: "Архитектурные и конструктивные решения" },
      { title: "Строительство", description: "Возведение здания" },
      { title: "Отделка", description: "Фасады и интерьер" }
    ],
    faq: [
      { question: "Какие фасады возможны?", answer: "Витражи, композитные панели, керамогранит." },
      { question: "Можно ли сделать второй этаж?", answer: "Да, проектируем многоэтажные павильоны." }
    ],
    gallery: ["/placeholder.svg"],
    relatedProjects: ["pavilon-samara"]
  },
  {
    slug: "sto",
    title: "СТО и автомойки",
    excerpt: "Станции техобслуживания и автомойки с подъёмниками и специализированным оборудованием",
    priceFrom: 34000,
    priceTo: 48000,
    icon: "Car",
    usp: [
      "Готовые планировки на 2–10 постов",
      "Высота под подъёмники",
      "Гидроизоляция и дренаж"
    ],
    specs: {
      spans: "12–24 м",
      heights: "5–7 м",
      insulation: "80–120 мм",
      snowLoad: "до 180 кг/м²",
      fireResistance: "EI 45"
    },
    applications: ["Автосервисы", "Шиномонтаж", "Автомойки", "Мультибрендовые СТО"],
    steps: [
      { title: "Планировка", description: "Расстановка оборудования" },
      { title: "Проект", description: "Инженерные системы" },
      { title: "Строительство", description: "Возведение комплекса" },
      { title: "Оснащение", description: "Монтаж оборудования" }
    ],
    faq: [
      { question: "Какая высота нужна?", answer: "Минимум 5 м для двухстоечных подъёмников." },
      { question: "Как решается водоотведение?", answer: "Проектируем трапы, очистные сооружения." }
    ],
    gallery: ["/placeholder.svg"],
    relatedProjects: ["sto-ulyanovsk"]
  },
  {
    slug: "agro",
    title: "Агро-ангары",
    excerpt: "Ангары для хранения зерна, техники и сельскохозяйственной продукции",
    priceFrom: 24000,
    priceTo: 36000,
    icon: "Wheat",
    usp: [
      "Антикоррозийная защита",
      "Вентиляция для зерна",
      "Широкие ворота для техники"
    ],
    specs: {
      spans: "15–36 м",
      heights: "6–12 м",
      insulation: "без / 50–100 мм",
      snowLoad: "до 200 кг/м²",
      fireResistance: "EI 15–30"
    },
    applications: ["Зернохранилища", "Овощехранилища", "Хранение техники", "Ремонтные мастерские"],
    steps: [
      { title: "Осмотр", description: "Анализ площадки" },
      { title: "Решение", description: "Подбор типа ангара" },
      { title: "Изготовление", description: "Производство конструкций" },
      { title: "Монтаж", description: "Сборка и сдача" }
    ],
    faq: [
      { question: "Какая вентиляция нужна для зерна?", answer: "Проектируем активную или пассивную вентиляцию по нормам." },
      { question: "Нужна ли антикоррозийная обработка?", answer: "Обязательна для агрообъектов — используем оцинковку и спецпокрытия." }
    ],
    gallery: ["/placeholder.svg"],
    relatedProjects: ["angar-orenburg"]
  },
  {
    slug: "fap",
    title: "ФАП и медпункты",
    excerpt: "Фельдшерско-акушерские пункты и медицинские модули для госзаказчиков",
    priceFrom: 40000,
    priceTo: 62000,
    icon: "Heart",
    usp: [
      "Соответствие 44-ФЗ/223-ФЗ",
      "Полная инженерия",
      "Готовность под лицензирование"
    ],
    specs: {
      spans: "9–15 м",
      heights: "3–4 м",
      insulation: "120–200 мм",
      snowLoad: "до 200 кг/м²",
      fireResistance: "EI 60–90"
    },
    applications: ["ФАП", "Врачебные амбулатории", "Здравпункты", "Модульные поликлиники"],
    steps: [
      { title: "ТЗ", description: "Согласование с заказчиком" },
      { title: "Проект", description: "По требованиям Минздрава" },
      { title: "Производство", description: "Изготовление модулей" },
      { title: "Доставка", description: "Транспортировка" },
      { title: "Монтаж", description: "Сборка на площадке" },
      { title: "Сдача", description: "Акты и документация" }
    ],
    faq: [
      { question: "Соответствует ли требованиям 44-ФЗ?", answer: "Да, работаем по госконтрактам с полным пакетом документов." },
      { question: "Какая инженерия включена?", answer: "Отопление, водоснабжение, канализация, электрика, вентиляция." },
      { question: "Можно ли получить лицензию?", answer: "Объекты проектируются под требования лицензирования." }
    ],
    gallery: ["/placeholder.svg"],
    relatedProjects: ["fap-orenburg"]
  },
  {
    slug: "office",
    title: "Модульный офис",
    excerpt: "Административные здания и офисные комплексы быстрой сборки",
    priceFrom: 42000,
    priceTo: 58000,
    icon: "Building2",
    usp: [
      "Строительство от 10 недель",
      "Офисные планировки",
      "Полная отделка под ключ"
    ],
    specs: {
      spans: "9–18 м",
      heights: "3–9 м (1–3 этажа)",
      insulation: "120–150 мм",
      snowLoad: "до 200 кг/м²",
      fireResistance: "EI 60"
    },
    applications: ["Административные здания", "Офисные центры", "Штабы строек", "Диспетчерские"],
    steps: [
      { title: "Планировка", description: "Разработка планов этажей" },
      { title: "Проект", description: "Конструктив и инженерия" },
      { title: "Строительство", description: "Возведение здания" },
      { title: "Отделка", description: "Чистовая отделка" }
    ],
    faq: [
      { question: "Сколько этажей можно сделать?", answer: "До 3 этажей на металлокаркасе." },
      { question: "Какая отделка?", answer: "Офисный стандарт: потолки, полы, стены, сантехника." }
    ],
    gallery: ["/placeholder.svg"],
    relatedProjects: []
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};
