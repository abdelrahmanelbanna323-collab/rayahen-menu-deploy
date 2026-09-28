// Auto-translation mappings for Italian and Russian
// Used when nameIt/nameRu fields don't exist in Firestore

export type Lang = 'AR' | 'EN' | 'IT' | 'RU';

// ──────────────────────────────────────────
// CATEGORY TRANSLATIONS
// ──────────────────────────────────────────
export const categoryTranslationsIt: Record<string, string> = {
  // by nameEn (exact match)
  'All': 'Tutto',
  'Breakfast Combos': 'Combo Colazione',
  'Breakfast': 'Colazione',
  'Bakery': 'Panetteria',
  'Coffee Drinks': 'Caffè',
  'Hot Drinks': 'Bevande Calde',
  'Milkshakes & Smoothies': 'Frullati & Smoothie',
  'Frappés & Iced Coffee': 'Frappè & Caffè Freddo',
  'Frappes & Iced Coffee': 'Frappè & Caffè Freddo',  // fallback
  'Nuts & Bubbles': 'Noci & Bubble',
  'Cocktails & Soda': 'Cocktail & Soda',
  'Fresh Juices': 'Succhi Freschi',
  'Desserts': 'Dolci',
  'Soft Drinks & Add-ons': 'Bibite & Extra',
  'Soft Drinks & Addons': 'Bibite & Extra',           // fallback
};

export const categoryTranslationsRu: Record<string, string> = {
  // by nameEn (exact match)
  'All': 'Всё',
  'Breakfast Combos': 'Завтрак Комбо',
  'Breakfast': 'Завтрак',
  'Bakery': 'Выпечка',
  'Coffee Drinks': 'Кофейные Напитки',
  'Hot Drinks': 'Горячие Напитки',
  'Milkshakes & Smoothies': 'Молочные Коктейли',
  'Frappés & Iced Coffee': 'Фраппе и Холодный Кофе',
  'Frappes & Iced Coffee': 'Фраппе и Холодный Кофе',  // fallback
  'Nuts & Bubbles': 'Орехи и Пузыри',
  'Cocktails & Soda': 'Коктейли и Газировка',
  'Fresh Juices': 'Свежие Соки',
  'Desserts': 'Десерты',
  'Soft Drinks & Add-ons': 'Напитки и Добавки',
  'Soft Drinks & Addons': 'Напитки и Добавки',          // fallback
};

// ──────────────────────────────────────────
// MENU ITEM KEYWORD-BASED TRANSLATIONS
// ──────────────────────────────────────────

const itemKeywordTranslations: Array<{ keywords: string[]; it: string; ru: string }> = [
  // Breakfast
  { keywords: ['oriental breakfast'], it: 'Colazione Orientale', ru: 'Восточный Завтрак' },
  { keywords: ['western breakfast'], it: 'Colazione Occidentale', ru: 'Западный Завтрак' },
  { keywords: ['french breakfast'], it: 'Colazione Francese', ru: 'Французский Завтрак' },
  { keywords: ['rayahen signature breakfast', 'rayahen breakfast'], it: 'Colazione Signature Rayahen', ru: 'Фирменный Завтрак Раяхен' },
  { keywords: ['american breakfast'], it: 'Colazione Americana', ru: 'Американский Завтрак' },
  { keywords: ['plain foul'], it: 'Foul Semplice', ru: 'Простые Бобы' },
  { keywords: ['foul with olive oil'], it: "Foul con Olio d'Oliva", ru: 'Бобы с Оливковым Маслом' },
  { keywords: ['alexandrian foul'], it: 'Foul Alessandrino', ru: 'Александрийские Бобы' },
  { keywords: ['foul with butter'], it: 'Foul al Burro', ru: 'Бобы с Маслом' },
  { keywords: ['dynamite foul'], it: 'Foul Dinamite', ru: 'Бобы Динамит' },
  { keywords: ['sesame falafel'], it: 'Falafel al Sesamo', ru: 'Фалафель с Кунжутом' },
  { keywords: ['falafel'], it: 'Falafel', ru: 'Фалафель' },
  { keywords: ['omelette'], it: 'Omelette', ru: 'Омлет' },
  { keywords: ['scrambled eggs'], it: 'Uova Strapazzate', ru: 'Яичница-болтунья' },
  { keywords: ['toast'], it: 'Toast', ru: 'Тост' },
  // Coffee Drinks
  { keywords: ['espresso'], it: 'Espresso', ru: 'Эспрессо' },
  { keywords: ['americano'], it: 'Americano', ru: 'Американо' },
  { keywords: ['cappuccino'], it: 'Cappuccino', ru: 'Капучино' },
  { keywords: ['flat white'], it: 'Flat White', ru: 'Флэт Уайт' },
  { keywords: ['macchiato'], it: 'Macchiato', ru: 'Макиато' },
  { keywords: ['cortado'], it: 'Cortado', ru: 'Кортадо' },
  { keywords: ['latte'], it: 'Latte', ru: 'Латте' },
  { keywords: ['mocha'], it: 'Mocaccino', ru: 'Мокко' },
  { keywords: ['turkish coffee', 'turkish'], it: 'Caffè Turco', ru: 'Турецкий Кофе' },
  { keywords: ['cold brew'], it: 'Cold Brew', ru: 'Холодный Брю' },
  { keywords: ['spanish latte', 'spanish'], it: 'Latte Spagnolo', ru: 'Испанский Латте' },
  // Hot Drinks
  { keywords: ['hot chocolate'], it: 'Cioccolata Calda', ru: 'Горячий Шоколад' },
  { keywords: ['matcha latte'], it: 'Latte al Matcha', ru: 'Матча Латте' },
  { keywords: ['matcha'], it: 'Matcha', ru: 'Матча' },
  { keywords: ['green tea'], it: 'Tè Verde', ru: 'Зелёный Чай' },
  { keywords: ['herbal tea'], it: 'Tisana', ru: 'Травяной Чай' },
  { keywords: ['mint tea'], it: 'Tè alla Menta', ru: 'Мятный Чай' },
  { keywords: ['tea'], it: 'Tè', ru: 'Чай' },
  // Iced / Frappé
  { keywords: ['iced latte'], it: 'Latte Freddo', ru: 'Холодный Латте' },
  { keywords: ['iced mocha'], it: 'Mocha Freddo', ru: 'Холодный Мокко' },
  { keywords: ['iced coffee'], it: 'Caffè Freddo', ru: 'Холодный Кофе' },
  { keywords: ['iced matcha'], it: 'Matcha Freddo', ru: 'Холодная Матча' },
  { keywords: ['frappe', 'frappé', 'frappuccino'], it: 'Frappè', ru: 'Фраппе' },
  // Milkshakes
  { keywords: ['milkshake', 'milk shake'], it: 'Frullato', ru: 'Молочный Коктейль' },
  { keywords: ['smoothie'], it: 'Smoothie', ru: 'Смузи' },
  { keywords: ['mango'], it: 'Mango', ru: 'Манго' },
  { keywords: ['strawberry'], it: 'Fragola', ru: 'Клубника' },
  { keywords: ['banana'], it: 'Banana', ru: 'Банан' },
  { keywords: ['chocolate shake'], it: 'Frullato al Cioccolato', ru: 'Шоколадный Коктейль' },
  // Juices
  { keywords: ['orange juice', 'fresh orange'], it: "Succo d'Arancia", ru: 'Апельсиновый Сок' },
  { keywords: ['lemon juice', 'lemonade'], it: 'Limonata', ru: 'Лимонад' },
  { keywords: ['mango juice'], it: 'Succo di Mango', ru: 'Сок из Манго' },
  { keywords: ['guava'], it: 'Guava', ru: 'Гуава' },
  { keywords: ['carrot juice', 'carrot'], it: 'Succo di Carota', ru: 'Морковный Сок' },
  { keywords: ['pomegranate'], it: 'Succo di Melograno', ru: 'Гранатовый Сок' },
  { keywords: ['fresh juice'], it: 'Succo Fresco', ru: 'Свежевыжатый Сок' },
  // Bakery
  { keywords: ['croissant'], it: 'Croissant', ru: 'Круассан' },
  { keywords: ['danish'], it: 'Pasticcio Danese', ru: 'Датская Выпечка' },
  { keywords: ['muffin'], it: 'Muffin', ru: 'Маффин' },
  { keywords: ['waffle'], it: 'Waffle', ru: 'Вафля' },
  { keywords: ['pancake'], it: 'Pancake', ru: 'Блинчики' },
  { keywords: ['cinnamon roll', 'cinnabon'], it: 'Rotolo alla Cannella', ru: 'Рулет с Корицей' },
  // Desserts
  { keywords: ['cheesecake'], it: 'Cheesecake', ru: 'Чизкейк' },
  { keywords: ['tiramisu', 'tiramisù'], it: 'Tiramisù', ru: 'Тирамису' },
  { keywords: ['brownie'], it: 'Brownie', ru: 'Брауни' },
  { keywords: ['kunafa', 'konafa'], it: 'Kunafa', ru: 'Кунафа' },
  { keywords: ['ice cream'], it: 'Gelato', ru: 'Мороженое' },
  { keywords: ['cake'], it: 'Torta', ru: 'Торт' },
  // Cocktails / Soda / Nuts
  { keywords: ['mojito'], it: 'Mojito', ru: 'Мохито' },
  { keywords: ['mint lemonade'], it: 'Limonata alla Menta', ru: 'Мятный Лимонад' },
  { keywords: ['passion fruit'], it: 'Frutto della Passione', ru: 'Маракуйя' },
  { keywords: ['soda'], it: 'Soda', ru: 'Газировка' },
  { keywords: ['coca cola', 'coke'], it: 'Coca Cola', ru: 'Кока-Кола' },
  { keywords: ['pepsi'], it: 'Pepsi', ru: 'Пепси' },
  { keywords: ['water'], it: 'Acqua', ru: 'Вода' },
  { keywords: ['sprite'], it: 'Sprite', ru: 'Спрайт' },
  { keywords: ['7up'], it: '7Up', ru: '7Up' },
  { keywords: ['bubble tea', 'boba'], it: 'Bubble Tea', ru: 'Пузырьковый Чай' },
  { keywords: ['mixed nuts', 'nuts'], it: 'Noci Miste', ru: 'Орехи' },
];

/**
 * Tries to find a translation for a menu item name based on keywords.
 * Falls back to the English name if no match found.
 */
export function translateItemName(nameEn: string, lang: 'IT' | 'RU'): string {
  const lower = nameEn.toLowerCase();
  for (const entry of itemKeywordTranslations) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return lang === 'IT' ? entry.it : entry.ru;
    }
  }
  return nameEn;
}

/**
 * Translates a description text. Uses English if available, else a generic fallback.
 */
export function translateItemDescription(descEn: string, descAr: string, lang: 'IT' | 'RU'): string {
  const source = descEn || descAr || '';
  if (!source) return '';
  const lower = source.toLowerCase();

  // Common ingredient / method patterns
  const patterns: Array<{ kw: string[]; it: string; ru: string }> = [
    { kw: ['espresso', 'اسبريسو', 'إسبريسو'], it: 'Caffè espresso', ru: 'Эспрессо' },
    { kw: ['milk', 'حليب', 'لبن'], it: 'latte', ru: 'молоко' },
    { kw: ['sugar', 'سكر'], it: 'zucchero', ru: 'сахар' },
    { kw: ['ice', 'ثلج'], it: 'ghiaccio', ru: 'лёд' },
    { kw: ['cream', 'كريمة'], it: 'panna', ru: 'сливки' },
    { kw: ['butter', 'زبدة'], it: 'burro', ru: 'масло' },
    { kw: ['sesame', 'سمسم'], it: 'sesamo', ru: 'кунжут' },
    { kw: ['foul', 'فول'], it: 'fave egiziane', ru: 'египетские бобы' },
    { kw: ['falafel', 'فلافل'], it: 'falafel', ru: 'фалафель' },
    { kw: ['cheese', 'جبنة', 'جبن'], it: 'formaggio', ru: 'сыр' },
    { kw: ['egg', 'بيض', 'بيضة'], it: 'uova', ru: 'яйца' },
    { kw: ['tomato', 'طماطم'], it: 'pomodoro', ru: 'томат' },
    { kw: ['olive oil', 'زيت زيتون'], it: "olio d'oliva", ru: 'оливковое масло' },
    { kw: ['vinegar', 'خل'], it: 'aceto', ru: 'уксус' },
    { kw: ['eggplant', 'باذنجان'], it: 'melanzana', ru: 'баклажан' },
    { kw: ['potato', 'بطاطس'], it: 'patate', ru: 'картофель' },
    { kw: ['sausage', 'سجق'], it: 'salsiccia', ru: 'колбаса' },
    { kw: ['chocolate', 'شوكولا'], it: 'cioccolato', ru: 'шоколад' },
    { kw: ['vanilla', 'فانيليا'], it: 'vaniglia', ru: 'ваниль' },
    { kw: ['caramel', 'كراميل'], it: 'caramello', ru: 'карамель' },
    { kw: ['hazelnut', 'بندق'], it: 'nocciola', ru: 'фундук' },
    { kw: ['almond', 'لوز'], it: 'mandorla', ru: 'миндаль' },
    { kw: ['orange', 'برتقال'], it: 'arancia', ru: 'апельсин' },
    { kw: ['mango', 'مانجو'], it: 'mango', ru: 'манго' },
    { kw: ['strawberry', 'فراولة'], it: 'fragola', ru: 'клубника' },
    { kw: ['banana', 'موز'], it: 'banana', ru: 'банан' },
    { kw: ['lemon', 'ليمون'], it: 'limone', ru: 'лимон' },
    { kw: ['fresh', 'طازج'], it: 'fresco', ru: 'свежий' },
    { kw: ['hot', 'ساخن'], it: 'caldo', ru: 'горячий' },
    { kw: ['cold', 'بارد'], it: 'freddo', ru: 'холодный' },
    { kw: ['large', 'كبير'], it: 'grande', ru: 'большой' },
    { kw: ['small', 'صغير'], it: 'piccolo', ru: 'маленький' },
    { kw: ['pcs', 'قطع', 'حبة'], it: 'pezzi', ru: 'штуки' },
  ];

  // Try to detect if we can return the English directly (it's already good enough)
  if (descEn && descEn.length > 0) {
    // English description is universal enough for IT/RU
    return descEn;
  }

  // For Arabic-only descriptions, return a generic note
  if (lang === 'IT') return 'Vedi menu per dettagli';
  if (lang === 'RU') return 'Смотрите меню для деталей';
  return source;
}

/**
 * Get the display name of a menu item for the given language.
 * If nameEn looks like Arabic (contains Arabic chars), use nameAr as fallback.
 */
export function getItemName(item: any, lang: Lang): string {
  const isArabicText = (s: string) => /[\u0600-\u06FF]/.test(s);
  
  if (lang === 'AR') return item.nameAr || item.nameEn;
  if (lang === 'EN') {
    // If nameEn is actually Arabic or empty, return nameAr (better than garbage)
    if (!item.nameEn || isArabicText(item.nameEn)) return item.nameAr;
    return item.nameEn;
  }
  if (lang === 'IT') {
    if (item.nameIt) return item.nameIt;
    // If nameEn is valid (not Arabic), try keyword translation
    if (item.nameEn && !isArabicText(item.nameEn)) return translateItemName(item.nameEn, 'IT');
    // Fall back to Arabic name (better than wrong English)
    return item.nameAr;
  }
  if (lang === 'RU') {
    if (item.nameRu) return item.nameRu;
    if (item.nameEn && !isArabicText(item.nameEn)) return translateItemName(item.nameEn, 'RU');
    return item.nameAr;
  }
  return item.nameEn || item.nameAr;
}

/**
 * Get the display name of a category for the given language.
 * Tries nameEn and cat.id as lookup keys for fallback translations.
 */
export function getCategoryName(cat: any, lang: Lang): string {
  if (lang === 'AR') return cat.nameAr || cat.nameEn;
  if (lang === 'EN') return cat.nameEn;
  if (lang === 'IT') {
    return cat.nameIt
      || categoryTranslationsIt[cat.nameEn]
      || categoryTranslationsIt[cat.id]
      || cat.nameEn;
  }
  if (lang === 'RU') {
    return cat.nameRu
      || categoryTranslationsRu[cat.nameEn]
      || categoryTranslationsRu[cat.id]
      || cat.nameEn;
  }
  return cat.nameEn;
}

// ──────────────────────────────────────────
// UI STRING TRANSLATIONS
// ──────────────────────────────────────────

export interface UIStrings {
  searchPlaceholder: string;
  noResults: string;
  specialOffers: string;
  install: string;
  rateUs: string;
  billTotal: string;
  bill: string;
  billTitle: string;
  billSubtitle: string;
  addOns: string;
  quantity: string;
  itemTotal: string;
  addToBill: string;
  totalBill: string;
  clearBill: string;
  close: string;
  remove: string;
  subtotal: string;
  vatNote: string;
  vatAddedNote: string;
  noBillItems: string;
  searchResultsPrefix: string;
  branch: string;
  announcementBadge: string;
  currency: string;
}

const uiStrings: Record<Lang, UIStrings> = {
  AR: {
    searchPlaceholder: 'ابحث عن أي صنف...',
    noResults: 'لا توجد نتائج',
    specialOffers: 'العروض الخاصة',
    install: 'تثبيت',
    rateUs: 'شارك تجربتك',
    billTotal: 'إجمالي الفاتورة',
    bill: 'الفاتورة',
    billTitle: 'فاتورتك المتوقعة',
    billSubtitle: 'حساب إجمالي طلبك في رياحين',
    addOns: 'اختر الإضافات',
    quantity: 'الكمية',
    itemTotal: 'الإجمالي للفاتورة',
    addToBill: 'أضف للفاتورة 🧾',
    totalBill: 'إجمالي الفاتورة المتوقع:',
    clearBill: 'تفريغ الفاتورة 🗑️',
    close: 'موافق / إغلاق',
    remove: 'حذف',
    subtotal: 'المجموع:',
    vatNote: '',
    vatAddedNote: 'يضاف 14% ضريبة قيمة مضافة',
    noBillItems: 'لم تقم بإضافة أي عنصر للفاتورة بعد',
    searchResultsPrefix: 'نتائج',
    branch: 'فرع',
    announcementBadge: '📣 إعلان ترحيبي',
    currency: 'ج.م',
  },
  EN: {
    searchPlaceholder: 'Search menu...',
    noResults: 'No results found',
    specialOffers: 'Special Offers',
    install: 'Install',
    rateUs: 'Rate Us',
    billTotal: 'Bill Total',
    bill: 'Bill',
    billTitle: 'Your Estimated Bill',
    billSubtitle: 'Rayahen Alexandria Bill Calculation',
    addOns: 'Custom Add-ons',
    quantity: 'Quantity',
    itemTotal: 'Item Total',
    addToBill: 'Add to Bill 🧾',
    totalBill: 'Total Estimated Bill:',
    clearBill: 'Clear Bill 🗑️',
    close: 'Close',
    remove: 'Remove',
    subtotal: 'Subtotal:',
    vatNote: '',
    vatAddedNote: '14% VAT is added to the total',
    noBillItems: 'No items added to your bill yet',
    searchResultsPrefix: 'Results for',
    branch: 'Branch',
    announcementBadge: '📣 Welcome Announcement',
    currency: 'EGP',
  },
  IT: {
    searchPlaceholder: 'Cerca nel menu...',
    noResults: 'Nessun risultato',
    specialOffers: 'Offerte Speciali',
    install: 'Installa',
    rateUs: 'Valutaci',
    billTotal: 'Totale Conto',
    bill: 'Conto',
    billTitle: 'Il Tuo Conto Stimato',
    billSubtitle: 'Calcolo del conto Rayahen Alessandria',
    addOns: 'Extra Personalizzati',
    quantity: 'Quantità',
    itemTotal: 'Totale Articolo',
    addToBill: 'Aggiungi al Conto 🧾',
    totalBill: 'Totale Stimato:',
    clearBill: 'Svuota Conto 🗑️',
    close: 'Chiudi',
    remove: 'Rimuovi',
    subtotal: 'Subtotale:',
    vatNote: '',
    vatAddedNote: '+14% IVA verrà aggiunta al totale',
    noBillItems: 'Nessun articolo aggiunto al conto',
    searchResultsPrefix: 'Risultati per',
    branch: 'Filiale',
    announcementBadge: '📣 Annuncio',
    currency: 'LE',  // Lira Egiziana (Italian name for Egyptian Pound)
  },
  RU: {
    searchPlaceholder: 'Поиск по меню...',
    noResults: 'Ничего не найдено',
    specialOffers: 'Специальные Предложения',
    install: 'Установить',
    rateUs: 'Оценить нас',
    billTotal: 'Итого по счёту',
    bill: 'Счёт',
    billTitle: 'Ваш Предварительный Счёт',
    billSubtitle: 'Расчёт счёта — Rayahen Александрия',
    addOns: 'Дополнения',
    quantity: 'Количество',
    itemTotal: 'Итого по позиции',
    addToBill: 'Добавить в счёт 🧾',
    totalBill: 'Общая Сумма:',
    clearBill: 'Очистить счёт 🗑️',
    close: 'Закрыть',
    remove: 'Удалить',
    subtotal: 'Подытог:',
    vatNote: '',
    vatAddedNote: '+14% НДС будет добавлен к итогу',
    noBillItems: 'Пока нет позиций в счёте',
    searchResultsPrefix: 'Результаты для',
    branch: 'Филиал',
    announcementBadge: '📣 Объявление',
    currency: 'ЕГФ',  // Египетский Фунт (Russian abbreviation for Egyptian Pound)
  },
};

export function t(lang: Lang): UIStrings {
  return uiStrings[lang];
}

export const langNames: Record<Lang, string> = {
  AR: 'عربي',
  EN: 'English',
  IT: 'Italiano',
  RU: 'Русский',
};

export const isRtl = (lang: Lang) => lang === 'AR';
