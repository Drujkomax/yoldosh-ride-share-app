
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'ru' | 'uz' | 'en';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const translations = {
  ru: {
    // Dashboard
    'driver_dashboard': 'Панель водителя',
    'passenger_dashboard': 'Панель пассажира',
    'manage_rides': 'Управляйте своими поездками',
    'find_rides': 'Находите попутчиков',
    'create_ride': 'Создать поездку',
    'find_ride': 'Найти поездку',
    'search_requests': 'Найти заявки',
    'my_rides': 'Мои поездки',
    'passenger_requests': 'Заявки пассажиров',
    'verification_needed': 'Пройдите верификацию',
    'verification_required': 'Для создания поездок и откликов на заявки требуется верификация',
    'verify_now': 'Пройти',
    'back': 'Назад',
    'settings': 'Настройки',
    'profile': 'Профиль',
    'active': 'Активна',
    'respond': 'Откликнуться',
    'details': 'Подробнее',
    'edit': 'Редактировать',
    // Search
    'search_rides': 'Поиск поездок',
    'search_passenger_requests': 'Заявки пассажиров',
    'filters': 'Фильтры',
    'from': 'Откуда',
    'to': 'Куда',
    'date': 'Дата',
    'min_price': 'Мин. цена (сум)',
    'max_price': 'Макс. цена (сум)',
    'sort_by': 'Сортировка',
    'by_time': 'По времени',
    'by_price': 'По цене',
    'by_rating': 'По рейтингу',
    'apply_filters': 'Применить фильтры',
    'select_city': 'Выберите город',
    'select_date': 'Выберите дату',
    'found_rides': 'Найдено поездок',
    'found_requests': 'Найдено заявок',
    // Settings
    'personal_data': 'Личные данные',
    'app_settings': 'Настройки приложения',
    'dark_theme': 'Темная тема',
    'app_language': 'Язык приложения',
    'notifications': 'Уведомления',
    'save_changes': 'Сохранить изменения',
    'ride_history': 'История поездок',
    'my_reviews': 'Мои отзывы',
    'logout': 'Выйти из аккаунта',
    'profile_updated': 'Профиль обновлен!',
    // Common
    'passengers': 'пассажир(ов)',
    'sum': 'сум',
    'rating': 'Рейтинг',
    'reviews': 'отзывов',
    'verified': 'Проверен',
    'book': 'Забронировать',
    'morning': 'Утром',
    'afternoon': 'Днем',
    'evening': 'Вечером',
    'anytime': 'Любое время'
  },
  uz: {
    // Dashboard
    'driver_dashboard': 'Haydovchi paneli',
    'passenger_dashboard': 'Yo\'lovchi paneli',
    'manage_rides': 'Sayohatlaringizni boshqaring',
    'find_rides': 'Yo\'lboshchilarni toping',
    'create_ride': 'Sayohat yaratish',
    'find_ride': 'Sayohat topish',
    'search_requests': 'So\'rovlarni topish',
    'my_rides': 'Mening sayohatlarim',
    'passenger_requests': 'Yo\'lovchi so\'rovlari',
    'verification_needed': 'Tasdiqlashdan o\'ting',
    'verification_required': 'Sayohat yaratish va so\'rovlarga javob berish uchun tasdiqlash kerak',
    'verify_now': 'O\'tish',
    'back': 'Orqaga',
    'settings': 'Sozlamalar',
    'profile': 'Profil',
    'active': 'Faol',
    'respond': 'Javob berish',
    'details': 'Batafsil',
    'edit': 'Tahrirlash',
    // Search
    'search_rides': 'Sayohat qidirish',
    'search_passenger_requests': 'Yo\'lovchi so\'rovlari',
    'filters': 'Filtrlar',
    'from': 'Qayerdan',
    'to': 'Qayerga',
    'date': 'Sana',
    'min_price': 'Min. narx (so\'m)',
    'max_price': 'Maks. narx (so\'m)',
    'sort_by': 'Saralash',
    'by_time': 'Vaqt bo\'yicha',
    'by_price': 'Narx bo\'yicha',
    'by_rating': 'Reyting bo\'yicha',
    'apply_filters': 'Filtrlarni qo\'llash',
    'select_city': 'Shaharni tanlang',
    'select_date': 'Sanani tanlang',
    'found_rides': 'Topilgan sayohatlar',
    'found_requests': 'Topilgan so\'rovlar',
    // Settings
    'personal_data': 'Shaxsiy ma\'lumotlar',
    'app_settings': 'Ilova sozlamalari',
    'dark_theme': 'Qorong\'u mavzu',
    'app_language': 'Ilova tili',
    'notifications': 'Bildirishnomalar',
    'save_changes': 'O\'zgarishlarni saqlash',
    'ride_history': 'Sayohatlar tarixi',
    'my_reviews': 'Mening sharhlarim',
    'logout': 'Hisobdan chiqish',
    'profile_updated': 'Profil yangilandi!',
    // Common
    'passengers': 'yo\'lovchi',
    'sum': 'so\'m',
    'rating': 'Reyting',
    'reviews': 'sharh',
    'verified': 'Tasdiqlangan',
    'book': 'Bron qilish',
    'morning': 'Ertalab',
    'afternoon': 'Kunduz',
    'evening': 'Kechqurun',
    'anytime': 'Istalgan vaqt'
  },
  en: {
    // Dashboard
    'driver_dashboard': 'Driver Dashboard',
    'passenger_dashboard': 'Passenger Dashboard',
    'manage_rides': 'Manage your rides',
    'find_rides': 'Find companions',
    'create_ride': 'Create Ride',
    'find_ride': 'Find Ride',
    'search_requests': 'Find Requests',
    'my_rides': 'My Rides',
    'passenger_requests': 'Passenger Requests',
    'verification_needed': 'Get verified',
    'verification_required': 'Verification is required to create rides and respond to requests',
    'verify_now': 'Verify',
    'back': 'Back',
    'settings': 'Settings',
    'profile': 'Profile',
    'active': 'Active',
    'respond': 'Respond',
    'details': 'Details',
    'edit': 'Edit',
    // Search
    'search_rides': 'Search Rides',
    'search_passenger_requests': 'Passenger Requests',
    'filters': 'Filters',
    'from': 'From',
    'to': 'To',
    'date': 'Date',
    'min_price': 'Min. price (sum)',
    'max_price': 'Max. price (sum)',
    'sort_by': 'Sort by',
    'by_time': 'By time',
    'by_price': 'By price',
    'by_rating': 'By rating',
    'apply_filters': 'Apply filters',
    'select_city': 'Select city',
    'select_date': 'Select date',
    'found_rides': 'Found rides',
    'found_requests': 'Found requests',
    // Settings
    'personal_data': 'Personal Data',
    'app_settings': 'App Settings',
    'dark_theme': 'Dark Theme',
    'app_language': 'App Language',
    'notifications': 'Notifications',
    'save_changes': 'Save Changes',
    'ride_history': 'Ride History',
    'my_reviews': 'My Reviews',
    'logout': 'Logout',
    'profile_updated': 'Profile updated!',
    // Common
    'passengers': 'passenger(s)',
    'sum': 'sum',
    'rating': 'Rating',
    'reviews': 'reviews',
    'verified': 'Verified',
    'book': 'Book',
    'morning': 'Morning',
    'afternoon': 'Afternoon',
    'evening': 'Evening',
    'anytime': 'Anytime'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('yoldosh-theme');
    return (saved as Theme) || 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('yoldosh-language');
    return (saved as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('yoldosh-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('yoldosh-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, language, setTheme, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
