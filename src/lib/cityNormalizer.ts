// Функция для нормализации названий городов
export const normalizeCityName = (cityName: string): string => {
  if (!cityName) return '';
  
  return cityName
    .trim()
    // Убираем страну из названия (например, "Ташкент, Узбекистан" -> "Ташкент")
    .split(',')[0]
    .trim()
    // Приводим к нижнему регистру для сравнения
    .toLowerCase()
    // Убираем лишние пробелы
    .replace(/\s+/g, ' ');
};

// Функция для сравнения нормализованных названий городов
export const compareCities = (city1: string, city2: string): boolean => {
  return normalizeCityName(city1) === normalizeCityName(city2);
};

// Словарь для приведения названий к стандартному виду
const CITY_ALIASES: Record<string, string> = {
  'ташкент': 'Ташкент',
  'tashkent': 'Ташкент',
  'toshkent': 'Ташкент',
  'андижан': 'Андижан',
  'andijan': 'Андижан',
  'andijon': 'Андижан',
  'самарканд': 'Самарканд',
  'samarkand': 'Самарканд',
  'samarqand': 'Самарканд',
  'бухара': 'Бухара',
  'bukhara': 'Бухара',
  'buxoro': 'Бухара',
  'фергана': 'Фергана',
  'fergana': 'Фергана',
  'farg\'ona': 'Фергана',
  'наманган': 'Наманган',
  'namangan': 'Наманган',
  'хива': 'Хива',
  'khiva': 'Хива',
  'xiva': 'Хива',
  'ургенч': 'Ургенч',
  'urgench': 'Ургенч',
  'urganch': 'Ургенч',
  'карши': 'Карши',
  'karshi': 'Карши',
  'qarshi': 'Карши',
  'термез': 'Термез',
  'termez': 'Термез',
  'termiz': 'Термез',
  'джизак': 'Джизак',
  'jizzakh': 'Джизак',
  'jizzax': 'Джизак',
  'jizak': 'Джизак',
  'гулистан': 'Гулистан',
  'gulistan': 'Гулистан',
  'sirdaryo': 'Гулистан',
  'нукус': 'Нукус',
  'nukus': 'Нукус',
  'навои': 'Навои',
  'navoi': 'Навои',
  'navoiy': 'Навои'
};

// Функция для приведения названия города к стандартному виду
export const standardizeCityName = (cityName: string): string => {
  const normalized = normalizeCityName(cityName);
  return CITY_ALIASES[normalized] || cityName.split(',')[0].trim();
};