// Projects/Cases data
export interface Project {
  slug: string;
  title: string;
  region: string;
  segment: "промышленность" | "логистика" | "агро" | "B2G" | "торговля" | "авто";
  productType: string;
  area: number;
  span: number;
  height: number;
  termWeeks: number;
  budgetMin: number;
  budgetMax: number;
  problem: string;
  solution: string;
  result: string;
  testimonial?: {
    text: string;
    author: string;
    position: string;
  };
  photos: string[];
  tags: string[];
  year: number;
}

export const projects: Project[] = [
  {
    slug: "sklad-kazan",
    title: "Склад под сортировку у М-7, Казань",
    region: "Казань",
    segment: "логистика",
    productType: "sklad",
    area: 3500,
    span: 24,
    height: 12,
    termWeeks: 12,
    budgetMin: 112000000,
    budgetMax: 140000000,
    problem: "Логистическая компания нуждалась в современном сортировочном центре вблизи федеральной трассы М-7 с температурным режимом и доковыми воротами для обработки 5000+ отправлений в сутки.",
    solution: "Спроектировали и построили склад 3500 м² с 8 доковыми воротами, системой поддержания температуры до -20°C, автоматическими воротами и LED-освещением. Применили сэндвич-панели 150 мм с PIR-утеплителем.",
    result: "Объект введён за 85 дней. Пропускная способность 7000 отправлений/сутки. Экономия на отоплении 30% за счёт PIR-панелей.",
    testimonial: {
      text: "Профессиональный подход на всех этапах. Сроки соблюдены, качество отличное. Рекомендуем СКБ УРАЛ56 для логистических проектов.",
      author: "Иванов А.П.",
      position: "Директор по логистике"
    },
    photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    tags: ["склад", "логистика", "температурный режим", "доковые ворота"],
    year: 2024
  },
  {
    slug: "tsekh-tolyatti",
    title: "Цех металлообработки, Тольятти",
    region: "Тольятти",
    segment: "промышленность",
    productType: "tsekh",
    area: 2100,
    span: 30,
    height: 14,
    termWeeks: 16,
    budgetMin: 84000000,
    budgetMax: 105000000,
    problem: "Машиностроительному предприятию требовался новый цех для размещения станков с ЧПУ и мостового крана грузоподъёмностью 20 тонн.",
    solution: "Возвели производственный цех с пролётом 30 м без промежуточных опор, подкрановыми путями, усиленным полом (нагрузка 8 т/м²) и приточно-вытяжной вентиляцией.",
    result: "Введено в срок. Установлено 12 станков с ЧПУ. Производительность участка увеличилась на 40%.",
    testimonial: {
      text: "Качество металлоконструкций и монтажа на высшем уровне. Кран-балка работает без нареканий.",
      author: "Петров В.И.",
      position: "Главный инженер"
    },
    photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    tags: ["цех", "производство", "кран-балка", "металлообработка"],
    year: 2024
  },
  {
    slug: "angar-orenburg",
    title: "Ангар для сельхозтехники, Оренбургская область",
    region: "Оренбургская область",
    segment: "агро",
    productType: "angar",
    area: 1800,
    span: 24,
    height: 8,
    termWeeks: 8,
    budgetMin: 46800000,
    budgetMax: 54000000,
    problem: "Агрохолдингу требовалось надёжное укрытие для хранения и обслуживания парка сельхозтехники (комбайны, тракторы).",
    solution: "Построили неутеплённый ангар 1800 м² с широкими воротами 6×5 м, бетонным полом и антикоррозийным покрытием каркаса.",
    result: "Срок строительства 7 недель. Вместимость: 25 единиц техники. Снижение износа техники в межсезонье.",
    photos: ["/placeholder.svg", "/placeholder.svg"],
    tags: ["ангар", "агро", "техника", "хранение"],
    year: 2023
  },
  {
    slug: "pavilon-samara",
    title: "Павильон-шоурум, Самара",
    region: "Самара",
    segment: "торговля",
    productType: "pavilon",
    area: 600,
    span: 15,
    height: 6,
    termWeeks: 10,
    budgetMin: 27600000,
    budgetMax: 34800000,
    problem: "Дилерскому центру требовался современный шоурум с панорамным остеклением и системой климат-контроля.",
    solution: "Построили павильон 600 м² с витражным остеклением по фасаду, VRV-системой кондиционирования, дизайнерской отделкой.",
    result: "Открытие через 11 недель. Посещаемость салона выросла на 60% благодаря привлекательному фасаду.",
    testimonial: {
      text: "Шоурум получился именно таким, как мы хотели. Клиенты отмечают комфорт и современный дизайн.",
      author: "Сидорова М.К.",
      position: "Директор салона"
    },
    photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    tags: ["павильон", "шоурум", "остекление", "торговля"],
    year: 2024
  },
  {
    slug: "sto-ulyanovsk",
    title: "СТО на 6 постов, Ульяновск",
    region: "Ульяновск",
    segment: "авто",
    productType: "sto",
    area: 450,
    span: 18,
    height: 6,
    termWeeks: 9,
    budgetMin: 17100000,
    budgetMax: 21600000,
    problem: "Сеть автосервисов расширялась и нуждалась в новой СТО на 6 постов с мойкой и шиномонтажом.",
    solution: "Возвели комплекс 450 м² с 6 подъёмниками, зоной мойки с гидроизоляцией, административной частью и клиентской зоной.",
    result: "Запуск за 9 недель. Пропускная способность: 40 автомобилей в день.",
    photos: ["/placeholder.svg", "/placeholder.svg"],
    tags: ["СТО", "автосервис", "мойка", "шиномонтаж"],
    year: 2024
  },
  {
    slug: "fap-orenburg",
    title: "ФАП, Оренбургская область",
    region: "Оренбургская область",
    segment: "B2G",
    productType: "fap",
    area: 320,
    span: 12,
    height: 3.5,
    termWeeks: 14,
    budgetMin: 15360000,
    budgetMax: 19840000,
    problem: "Администрация района по программе модернизации первичного звена здравоохранения заказала ФАП для отдалённого населённого пункта.",
    solution: "Изготовили и смонтировали модульный ФАП 320 м² с полной инженерией, доступной средой, оснащением по стандарту Минздрава.",
    result: "Сдан по 44-ФЗ в срок. Обслуживает 1200 жителей. Лицензия получена через 2 недели после сдачи.",
    testimonial: {
      text: "Объект полностью соответствует требованиям. Документация в порядке, приёмка прошла без замечаний.",
      author: "Козлов Н.С.",
      position: "Глава администрации"
    },
    photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    tags: ["ФАП", "B2G", "госзаказ", "медицина"],
    year: 2023
  }
];

export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find(p => p.slug === slug);
};

export const getProjectsByProductType = (productType: string): Project[] => {
  return projects.filter(p => p.productType === productType);
};
