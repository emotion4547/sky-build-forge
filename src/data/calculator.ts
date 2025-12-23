// Calculator configuration data
export interface CalculatorOption {
  name: string;
  addPriceMin: number;
  addPriceMax: number;
}

export interface RegionModifier {
  region: string;
  coefficient: number;
}

export interface CalculatorConfig {
  buildingType: string;
  slug: string;
  basePriceMin: number;
  basePriceMax: number;
  options: CalculatorOption[];
  durationMinWeeks: number;
  durationMaxWeeks: number;
  notes: string;
}

export const calculatorConfigs: CalculatorConfig[] = [
  {
    buildingType: "Склад из сэндвич-панелей",
    slug: "sklad",
    basePriceMin: 32000,
    basePriceMax: 46000,
    options: [
      { name: "Доковые ворота", addPriceMin: 1200, addPriceMax: 2000 },
      { name: "Температурный режим до -20°C", addPriceMin: 1500, addPriceMax: 2500 },
      { name: "LED-освещение", addPriceMin: 500, addPriceMax: 800 },
      { name: "Пожарная сигнализация", addPriceMin: 400, addPriceMax: 700 }
    ],
    durationMinWeeks: 8,
    durationMaxWeeks: 16,
    notes: "Стоимость зависит от пролёта, высоты и типа утепления"
  },
  {
    buildingType: "Производственный цех",
    slug: "tsekh",
    basePriceMin: 35000,
    basePriceMax: 52000,
    options: [
      { name: "Кран-балка до 10 т", addPriceMin: 2500, addPriceMax: 4000 },
      { name: "Кран-балка 10-32 т", addPriceMin: 4000, addPriceMax: 6500 },
      { name: "Усиленный пол (8 т/м²)", addPriceMin: 1500, addPriceMax: 2500 },
      { name: "Приточно-вытяжная вентиляция", addPriceMin: 1000, addPriceMax: 1800 }
    ],
    durationMinWeeks: 10,
    durationMaxWeeks: 18,
    notes: "Учитывается грузоподъёмность крана и требования к полам"
  },
  {
    buildingType: "Ангар",
    slug: "angar",
    basePriceMin: 26000,
    basePriceMax: 38000,
    options: [
      { name: "Утепление 50-100 мм", addPriceMin: 2000, addPriceMax: 3000 },
      { name: "Широкие ворота (6×5 м)", addPriceMin: 800, addPriceMax: 1500 },
      { name: "Антикоррозийное покрытие", addPriceMin: 500, addPriceMax: 900 }
    ],
    durationMinWeeks: 6,
    durationMaxWeeks: 12,
    notes: "Возможна установка без фундамента на подготовленную площадку"
  },
  {
    buildingType: "Торговый павильон / шоурум",
    slug: "pavilon",
    basePriceMin: 38000,
    basePriceMax: 58000,
    options: [
      { name: "Панорамное остекление", addPriceMin: 2000, addPriceMax: 5000 },
      { name: "Композитные фасады", addPriceMin: 1500, addPriceMax: 3000 },
      { name: "VRV-кондиционирование", addPriceMin: 1200, addPriceMax: 2000 },
      { name: "Дизайн-проект интерьера", addPriceMin: 800, addPriceMax: 1500 }
    ],
    durationMinWeeks: 8,
    durationMaxWeeks: 14,
    notes: "Включает архитектурное решение фасада"
  },
  {
    buildingType: "СТО / Автомойка",
    slug: "sto",
    basePriceMin: 34000,
    basePriceMax: 48000,
    options: [
      { name: "Промышленные ворота", addPriceMin: 1000, addPriceMax: 2000 },
      { name: "Гидроизоляция и дренаж", addPriceMin: 800, addPriceMax: 1500 },
      { name: "Очистные сооружения", addPriceMin: 1500, addPriceMax: 3000 },
      { name: "Клиентская зона", addPriceMin: 600, addPriceMax: 1200 }
    ],
    durationMinWeeks: 8,
    durationMaxWeeks: 12,
    notes: "Высота от 5 м для установки подъёмников"
  },
  {
    buildingType: "Агро-ангар",
    slug: "agro",
    basePriceMin: 24000,
    basePriceMax: 36000,
    options: [
      { name: "Система вентиляции для зерна", addPriceMin: 1000, addPriceMax: 2500 },
      { name: "Усиленное антикоррозийное покрытие", addPriceMin: 500, addPriceMax: 1000 },
      { name: "Утепление 50-100 мм", addPriceMin: 1500, addPriceMax: 2500 }
    ],
    durationMinWeeks: 6,
    durationMaxWeeks: 12,
    notes: "Специальные решения для хранения зерна и техники"
  },
  {
    buildingType: "ФАП / Медпункт",
    slug: "fap",
    basePriceMin: 40000,
    basePriceMax: 62000,
    options: [
      { name: "Полная инженерия", addPriceMin: 3000, addPriceMax: 6000 },
      { name: "Доступная среда", addPriceMin: 1000, addPriceMax: 2000 },
      { name: "Медицинское оснащение", addPriceMin: 2000, addPriceMax: 5000 }
    ],
    durationMinWeeks: 10,
    durationMaxWeeks: 20,
    notes: "Соответствие требованиям Минздрава и 44-ФЗ"
  },
  {
    buildingType: "Модульный офис",
    slug: "office",
    basePriceMin: 42000,
    basePriceMax: 58000,
    options: [
      { name: "Второй этаж", addPriceMin: 3000, addPriceMax: 5000 },
      { name: "Третий этаж", addPriceMin: 4000, addPriceMax: 7000 },
      { name: "Чистовая отделка", addPriceMin: 2000, addPriceMax: 4000 },
      { name: "VRV-кондиционирование", addPriceMin: 1000, addPriceMax: 1800 }
    ],
    durationMinWeeks: 10,
    durationMaxWeeks: 16,
    notes: "Включает офисные планировки и отделку"
  }
];

export const regionModifiers: RegionModifier[] = [
  { region: "Самарская область", coefficient: 1.0 },
  { region: "Республика Татарстан", coefficient: 1.0 },
  { region: "Ульяновская область", coefficient: 1.0 },
  { region: "Оренбургская область", coefficient: 1.02 },
  { region: "Пензенская область", coefficient: 1.0 },
  { region: "Саратовская область", coefficient: 1.02 },
  { region: "Республика Башкортостан", coefficient: 1.03 },
  { region: "Пермский край", coefficient: 1.05 },
  { region: "Республика Удмуртия", coefficient: 1.05 },
  { region: "Кировская область", coefficient: 1.07 },
  { region: "Другой регион", coefficient: 1.1 }
];

export const getConfigBySlug = (slug: string): CalculatorConfig | undefined => {
  return calculatorConfigs.find(c => c.slug === slug);
};

export interface CalculationResult {
  priceMin: number;
  priceMax: number;
  durationMin: number;
  durationMax: number;
}

export const calculateCost = (
  config: CalculatorConfig,
  area: number,
  selectedOptions: string[],
  regionCoefficient: number
): CalculationResult => {
  let priceMin = config.basePriceMin;
  let priceMax = config.basePriceMax;

  // Add selected options
  config.options.forEach(option => {
    if (selectedOptions.includes(option.name)) {
      priceMin += option.addPriceMin;
      priceMax += option.addPriceMax;
    }
  });

  // Apply region coefficient
  priceMin *= regionCoefficient;
  priceMax *= regionCoefficient;

  // Calculate total
  const totalMin = Math.round(priceMin * area);
  const totalMax = Math.round(priceMax * area);

  // Adjust duration based on area
  let durationMin = config.durationMinWeeks;
  let durationMax = config.durationMaxWeeks;

  if (area > 2000) {
    durationMin += 2;
    durationMax += 4;
  }
  if (area > 5000) {
    durationMin += 2;
    durationMax += 4;
  }

  return {
    priceMin: totalMin,
    priceMax: totalMax,
    durationMin,
    durationMax
  };
};
