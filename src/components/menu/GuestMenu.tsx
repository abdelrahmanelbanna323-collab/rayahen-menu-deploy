"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import OffersCarousel from '@/components/menu/OffersCarousel';
import AnnouncementCard from '@/components/menu/AnnouncementCard';
import ItemCard from '@/components/menu/ItemCard';
import SplashScreen from '@/components/SplashScreen';
import { MenuItem, CartItem } from '@/components/menu/AddonBottomSheet';
import BillCalculatorModal from '@/components/menu/BillCalculatorModal';
import RatingModal from '@/components/menu/RatingModal';
import ItemDetailsModal from '@/components/menu/ItemDetailsModal';
import InstallPWAButton from '@/components/InstallPWAButton';
import { useMenuStore } from '@/store/useMenuStore';
import { AVAILABLE_BRANCHES } from '@/types';
import { Lang, t, getCategoryName, getItemName, isRtl, langNames } from '@/lib/translations';
import { batchTranslate } from '@/lib/autoTranslate';

const categoryIcons: Record<string, string> = {
  'All':                      '🍽️',
  'Breakfast Combos':         '⭐',
  'Breakfast':                '🍳',
  'Bakery':                   '🥐',
  'Coffee Drinks':            '☕',
  'Hot Drinks':               '♨️',
  'Milkshakes & Smoothies':   '🥤',
  'Frappes & Iced Coffee':    '❄️',
  'Nuts & Bubbles':           '🌰',
  'Cocktails & Soda':         '🍹',
  'Fresh Juices':             '🍊',
  'Desserts':                 '🍰',
  'Soft Drinks & Addons':     '💧',
};

const branchNamesAr: Record<string, string> = {
  'fawzy-moaz': 'فوزي معاذ',
  'naql-handasa': 'النقل والهندسة',
  'sidi-bishr': 'سيدي بشر',
  'roushdy': 'رشدي',
  'raml': 'محطة الرمل',
  'raml-cafe': 'محطة الرمل كافيه',
  'san-stefano': 'سان استيفانو',
  'san-stefano-cafe': 'سان استيفانو كافيه',
  'asafra': 'العصافرة',
  'sidi-gaber': 'سيدي جابر',
  'sharm-delta': 'شرم الدلتا',
  'sharm-souq': 'شرم السوق',
  'sharm-nabq': 'شرم نبق'
};

const branchNamesIt: Record<string, string> = {
  'fawzy-moaz': 'Fawzy Moaz',
  'naql-handasa': 'Naql Handasa',
  'sidi-bishr': 'Sidi Bishr',
  'roushdy': 'Roushdy',
  'raml': 'Raml',
  'raml-cafe': 'Raml Cafè',
  'san-stefano': 'San Stefano',
  'san-stefano-cafe': 'San Stefano Cafè',
  'asafra': 'Asafra',
  'sidi-gaber': 'Sidi Gaber',
  'sharm-delta': 'Sharm Delta',
  'sharm-souq': 'Sharm Souq',
  'sharm-nabq': 'Sharm Nabq'
};

const branchNamesRu: Record<string, string> = {
  'fawzy-moaz': 'Фавзи Муаз',
  'naql-handasa': 'Накл Хандаса',
  'sidi-bishr': 'Сиди Бишр',
  'roushdy': 'Рушди',
  'raml': 'Рамль',
  'raml-cafe': 'Рамль Кафе',
  'san-stefano': 'Сан Стефано',
  'san-stefano-cafe': 'Сан Стефано Кафе',
  'asafra': 'Эль Асафра',
  'sidi-gaber': 'Сиди Габер',
  'sharm-delta': 'Шарм Дельта',
  'sharm-souq': 'Шарм Сук',
  'sharm-nabq': 'Шарм Набк'
};

export default function GuestMenu({ branchParam }: { branchParam?: string }) {
  const key = branchParam?.toLowerCase() ?? '';
  const branchNameDisplayEn = branchParam
    ? branchParam.charAt(0).toUpperCase() + branchParam.slice(1).replace(/-/g, ' ')
    : 'Menu';
  const branchNameDisplayAr = branchParam ? branchNamesAr[key] || branchNameDisplayEn : 'المنيو';
  const branchNameDisplayIt = branchParam ? branchNamesIt[key] || branchNameDisplayEn : 'Menu';
  const branchNameDisplayRu = branchParam ? branchNamesRu[key] || branchNameDisplayEn : 'Меню';

  const [lang, setLang] = useState<Lang>('AR');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Batch translation map: itemId → { name, description }
  const [itemTranslations, setItemTranslations] = useState<Record<string, { name: string; description: string }>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const menuItems = useMenuStore((state) => state.menuItems);
  const activeMenuItems = menuItems
    .map(item => {
      const override = branchParam ? item.branchOverrides?.[branchParam] : undefined;
      return {
        ...item,
        price: override?.price ?? item.price,
        isActive: override?.isActive ?? (item.isActive !== false)
      };
    })
    .filter(item => 
      item.isActive && 
      (!item.branches || item.branches.length === 0 || !branchParam || item.branches.includes(branchParam))
    );
  const categories = useMenuStore((state) => state.categories);
  const activeCategories = categories.map(cat => {
    const override = branchParam ? cat.branchOverrides?.[branchParam] : undefined;
    return {
      ...cat,
      isActive: override?.isActive ?? (cat.isActive !== false),
      nameAr: override?.nameAr ?? cat.nameAr,
      nameEn: override?.nameEn ?? cat.nameEn,
      icon: override?.icon ?? cat.icon,
      imageUrl: override?.imageUrl ?? cat.imageUrl,
    };
  }).filter(cat => cat.isActive);
  const ratingUrl = useMenuStore((state) => state.ratingUrl);
  const vatSettings = useMenuStore((state) => state.vatSettings);
  const activeBranchObj = AVAILABLE_BRANCHES.find(b => b.id === (branchParam || 'all')) || { name: 'المنيو العام الرئيسي' };
  const showVat = vatSettings[branchParam || 'all'] 
    ?? vatSettings[activeBranchObj.name] 
    ?? vatSettings['all'] 
    ?? vatSettings['الكل']
    ?? vatSettings['المنيو العام الرئيسي']
    ?? vatSettings['المنيو العام الرئيسي (الكل / All Branches)']
    ?? false;
  // Listener is auto-started at module level in useMenuStore (see bottom of store file).
  // No need to start/stop it here from the component lifecycle.


  // Close lang dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Batch-translate all items when language changes to IT or RU
  const translateAllItems = useCallback(async (targetLang: Lang, items: typeof activeMenuItems) => {
    if (targetLang === 'AR' || targetLang === 'EN') {
      setItemTranslations({});
      setIsTranslating(false);
      return;
    }
    setIsTranslating(true);
    try {
      // Collect texts that need translation
      const nameSources: string[] = [];
      const descSources: string[] = [];
      for (const item of items) {
        // Name: use existing translated field if available
        // Source: prefer Arabic for better translation quality, fall back to English
        const hasName = targetLang === 'IT' ? !!item.nameIt : !!item.nameRu;
        nameSources.push(hasName
          ? (targetLang === 'IT' ? item.nameIt! : item.nameRu!)
          : (item.nameAr || item.nameEn));  // Arabic preferred as translation source
        // Description: use existing translated field if available
        // Source: prefer Arabic (richer, more accurate for this menu)
        const hasDesc = targetLang === 'IT' ? !!item.descriptionIt : !!item.descriptionRu;
        descSources.push(hasDesc
          ? (targetLang === 'IT' ? item.descriptionIt! : item.descriptionRu!)
          : (item.descriptionAr || item.descriptionEn || ''));
      }
      const [translatedNames, translatedDescs] = await Promise.all([
        batchTranslate(nameSources, targetLang),
        batchTranslate(descSources, targetLang),
      ]);
      const map: Record<string, { name: string; description: string }> = {};
      items.forEach((item, i) => {
        map[item.id] = {
          name: translatedNames[i] || item.nameEn || item.nameAr,
          description: translatedDescs[i] || '',
        };
      });
      setItemTranslations(map);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Trigger batch translation when lang or items change
  useEffect(() => {
    translateAllItems(lang, activeMenuItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, activeMenuItems.map(i => i.id).join(',')]);

  const isAr = isRtl(lang);
  const tr = t(lang);

  const handleRateClick = () => {
    window.open(ratingUrl || 'https://rayahen-rating.vercel.app/', '_blank');
  };

  const handleAddItemToBill = (item: MenuItem) => {
    // Enrich item with batch-translated fields so the bill modal shows translated names
    const tx = itemTranslations[item.id];
    const enrichedItem = tx ? {
      ...item,
      nameIt: tx.name || item.nameIt,
      nameRu: tx.name || item.nameRu,
      descriptionIt: tx.description || item.descriptionIt,
      descriptionRu: tx.description || item.descriptionRu,
    } : item;
    setCartItems((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * item.price } : c);
      return [...prev, { cartId: Date.now().toString() + Math.random(), item: enrichedItem as any, selectedAddons: [], quantity: 1, totalPrice: item.price }];
    });
  };

  const handleItemClick = (item: MenuItem) => {
    const tx = itemTranslations[item.id];
    const enrichedItem = tx ? {
      ...item,
      nameIt: tx.name || item.nameIt,
      nameRu: tx.name || item.nameRu,
      descriptionIt: tx.description || item.descriptionIt,
      descriptionRu: tx.description || item.descriptionRu,
    } : item;
    setSelectedItem(enrichedItem as MenuItem);
    setIsDetailsOpen(true);
  };

  const handleUpdateQuantity = (cartId: string, newQty: number) => {
    if (newQty <= 0) { setCartItems(p => p.filter(c => c.cartId !== cartId)); return; }
    setCartItems(prev => prev.map(c => c.cartId !== cartId ? c : { ...c, quantity: newQty, totalPrice: (c.totalPrice / c.quantity) * newQty }));
  };

  const totalCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = cartItems.reduce((s, i) => s + i.totalPrice, 0);

  const filteredItems = activeMenuItems.filter(item => {
    const matchCat = activeCategory === "All" || item.categoryEn === activeCategory;
    const translatedName = getItemName(item, lang);
    const matchSearch =
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery) ||
      translatedName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = (() => {
    if (activeCategory !== 'All' || searchQuery) return [];
    return activeCategories
      .filter(c => c.id !== 'All')
      .map(cat => ({ ...cat, items: activeMenuItems.filter(i => i.categoryEn === cat.id) }))
      .filter(g => g.items.length > 0);
  })();

  return (
    <>
      <SplashScreen showVat={showVat} lang={lang} />
      <div className="bg-[#f0ece6] min-h-screen">
        <main
          dir={isAr ? 'rtl' : 'ltr'}
          className="min-h-screen font-body pb-36 relative bg-pearl-white max-w-[1200px] mx-auto shadow-2xl"
        >
          {/* ── HEADER ── */}
          <header className="relative px-5 md:px-10 pt-8 pb-6 flex flex-col md:flex-row justify-between items-center gap-5 md:gap-0 bg-white rounded-b-[40px] shadow-sm mb-6 z-10">
            {/* Mobile Logo (Top) / Desktop Logo (Center Absolute) */}
            <div className="flex flex-col items-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1">
              <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-widest text-gold-gradient transition-all">
                Rayahen
              </h1>
              <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#B38E5D] font-bold mt-1 text-center">
                {lang === 'AR'
                  ? `فرع ${branchNameDisplayAr}`
                  : lang === 'IT'
                  ? `Filiale ${branchNameDisplayIt}`
                  : lang === 'RU'
                  ? `Филиал ${branchNameDisplayRu}`
                  : `${branchNameDisplayEn} Branch`}
              </p>
            </div>

            {/* Controls Row (Search + Lang + Rate) */}
            <div className="flex justify-between items-center w-full md:w-auto z-10">
              {/* Left controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSearchOpen(v => !v)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all btn-soft-3d hover:scale-105"
                  style={{ color: '#6E5A47' }}
                >
                  {isSearchOpen
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 6-12 12M6 6l12 12"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  }
                </button>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2 md:gap-3">
                <InstallPWAButton
                  label={tr.install}
                  className="px-3 md:px-4 h-9 md:h-10 rounded-full flex items-center gap-1 justify-center transition-all btn-soft-3d hover:scale-105 font-bold text-xs md:text-sm text-[#6E5A47]"
                />

                {/* Language Switcher Dropdown */}
                <div ref={langDropdownRef} className="relative">
                  <button
                    onClick={() => setIsLangOpen(v => !v)}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs transition-all btn-soft-3d hover:scale-105 gap-0.5"
                    style={{ color: '#6E5A47' }}
                    title="Change language"
                  >
                    {lang === 'AR' ? 'ع' : lang}
                  </button>

                  {isLangOpen && (
                    <div
                      className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slide-up"
                      style={{ minWidth: '130px' }}
                    >
                      {(['AR', 'EN', 'IT', 'RU'] as Lang[]).map(l => (
                        <button
                          key={l}
                          onClick={() => { setLang(l); setIsLangOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-[#f9f4ee] ${
                            lang === l ? 'text-[#B38E5D] bg-[#f9f4ee]' : 'text-[#4A3C2A]'
                          }`}
                        >
                          <span className="text-base">
                            {l === 'AR' ? '🇪🇬' : l === 'EN' ? '🇬🇧' : l === 'IT' ? '🇮🇹' : '🇷🇺'}
                          </span>
                          <span>{langNames[l]}</span>
                          {lang === l && <span className="ml-auto text-[#B38E5D] text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleRateClick}
                  className="px-3 md:px-4 h-9 md:h-10 rounded-full flex items-center gap-1.5 justify-center transition-all btn-gold-3d hover:scale-105"
                >
                  <span className="text-xs md:text-sm font-bold whitespace-nowrap">{tr.rateUs}</span>
                  <span className="text-sm md:text-base">⭐</span>
                </button>
              </div>
            </div>
          </header>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="px-5 md:px-10 mb-6 animate-slide-up">
              <div className="card-soft-3d p-2 max-w-2xl mx-auto">
                <input
                  type="text"
                  autoFocus
                  placeholder={tr.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 md:py-4 md:text-lg outline-none font-bold bg-transparent"
                  style={{ color: '#4A3C2A' }}
                />
              </div>
            </div>
          )}

          {/* Announcement */}
          <div className="px-5 md:px-10 mb-6 max-w-4xl mx-auto">
            <AnnouncementCard lang={lang} branchParam={branchParam} />
          </div>


          {/* ── OFFERS CAROUSEL ── */}
          <div className="px-5 md:px-10 mb-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-4 pl-1">
              <div className="w-1.5 h-6 rounded-full bg-[#B38E5D]" />
              <p className="font-extrabold text-lg md:text-2xl text-[#4A3C2A]">
                {tr.specialOffers}
              </p>
            </div>
            <OffersCarousel lang={lang} branchParam={branchParam} />
          </div>

          {/* ── CATEGORY ICONS NAV ── */}
          <nav className="overflow-x-auto scrollbar-hide sticky top-0 z-20 py-4 md:py-6 px-5 md:px-10 bg-white/80 backdrop-blur-xl border-y border-gray-100 shadow-sm mb-8">
            <div className="flex md:flex-wrap md:justify-center gap-4 md:gap-6 min-w-max md:min-w-0 max-w-5xl mx-auto">
              {activeCategories.map(cat => {
                const isActive = activeCategory === cat.id;
                const icon = cat.icon || categoryIcons[cat.id] || '🍽️';
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex flex-col items-center gap-2 transition-all duration-300 group"
                  >
                    <div
                      className={`flex items-center justify-center rounded-[20px] md:rounded-[24px] text-2xl md:text-3xl transition-all duration-300 overflow-hidden group-hover:scale-110 ${
                        isActive ? 'btn-gold-3d' : 'btn-soft-3d'
                      }`}
                      style={{ width: '60px', height: '60px' }}
                    >
                      {(cat.imageUrl) ? (
                        <img src={cat.imageUrl} alt={getCategoryName(cat, lang)} className="w-full h-full object-contain p-1" />
                      ) : (
                        icon
                      )}
                    </div>
                    <span
                      className="text-[10px] md:text-xs font-bold text-center leading-tight transition-colors"
                      style={{
                        color: isActive ? '#B38E5D' : '#888888',
                        maxWidth: '90px',
                        wordBreak: 'normal',
                        whiteSpace: 'normal',
                      }}
                    >
                      {getCategoryName(cat, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── MENU CONTENT ── */}
          <div className="px-5 md:px-10 max-w-6xl mx-auto">
            {/* Translating indicator */}
            {isTranslating && (
              <div className="flex items-center gap-2 mb-4 px-2 text-[#B38E5D] text-xs font-bold animate-pulse">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                </svg>
                {lang === 'RU' ? 'Переводим...' : lang === 'IT' ? 'Traduzione...' : 'Translating...'}
              </div>
            )}
            {searchQuery ? (
              <>
                <p className="font-bold text-sm md:text-base mb-6 text-[#B38E5D] pl-2">
                  {`${tr.searchResultsPrefix} "${searchQuery}"`}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredItems.length > 0
                    ? filteredItems.map(item => {
                        const tx = itemTranslations[item.id];
                        return <ItemCard key={item.id} {...item}
                          nameIt={tx?.name || item.nameIt}
                          nameRu={tx?.name || item.nameRu}
                          descriptionIt={tx?.description || item.descriptionIt}
                          descriptionRu={tx?.description || item.descriptionRu}
                          lang={lang} showVat={showVat} onClick={() => handleItemClick(item as any)} onQuickAdd={() => handleAddItemToBill(item as any)} />;
                      })
                    : <div className="col-span-full text-center py-20 text-[#A3988E]"><p className="text-5xl md:text-6xl mb-4">🔍</p><p className="font-bold md:text-xl">{tr.noResults}</p></div>
                  }
                </div>
              </>
            ) : activeCategory === 'All' ? (
              grouped.map(group => (
                <div key={group.id} className="mb-12 animate-slide-up">
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-6 pl-1">
                    <div className="w-1.5 h-7 md:h-8 rounded-full bg-[#B38E5D]" />
                    <p className="font-extrabold text-xl md:text-3xl text-[#4A3C2A]">
                      {getCategoryName(group, lang)}
                    </p>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {group.items.map(item => {
                      const tx = itemTranslations[item.id];
                      return <ItemCard key={item.id} {...item}
                        nameIt={tx?.name || item.nameIt}
                        nameRu={tx?.name || item.nameRu}
                        descriptionIt={tx?.description || item.descriptionIt}
                        descriptionRu={tx?.description || item.descriptionRu}
                        lang={lang} showVat={showVat} onClick={() => handleItemClick(item as any)} onQuickAdd={() => handleAddItemToBill(item as any)} />;
                    })}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6 pl-1 animate-slide-up">
                  <div className="w-1.5 h-7 md:h-8 rounded-full bg-[#B38E5D]" />
                  <p className="font-extrabold text-xl md:text-3xl text-[#4A3C2A]">
                    {(() => { const cat = categories.find(c => c.id === activeCategory); return cat ? getCategoryName(cat, lang) : activeCategory; })()}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-slide-up">
                  {filteredItems.map(item => {
                    const tx = itemTranslations[item.id];
                    return <ItemCard key={item.id} {...item}
                      nameIt={tx?.name || item.nameIt}
                      nameRu={tx?.name || item.nameRu}
                      descriptionIt={tx?.description || item.descriptionIt}
                      descriptionRu={tx?.description || item.descriptionRu}
                      lang={lang} showVat={showVat} onClick={() => handleItemClick(item as any)} onQuickAdd={() => handleAddItemToBill(item as any)} />;
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── FLOATING BILL BAR ── */}
          {cartItems.length > 0 && (
            <div
              className="fixed bottom-6 md:bottom-10 z-50 animate-slide-up left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 transition-all"
              style={{ width: 'calc(100% - 40px)', maxWidth: '440px' }}
            >
              <div className="glass-light rounded-3xl p-4 md:p-5 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-white">
                <div className="flex items-center gap-4">
                  <div className="btn-gold-3d w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg md:text-xl">
                    {totalCount}
                  </div>
                  <div>
                    <p className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-[#888888] mb-0.5">
                      {tr.billTotal}
                    </p>
                    <p className="font-extrabold font-heading text-2xl md:text-3xl leading-none text-[#4A3C2A]">
                      {totalAmount} <span className="text-sm md:text-base font-semibold text-[#B38E5D]">{tr.currency}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsBillModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3.5 md:py-4 rounded-2xl font-bold text-sm md:text-base btn-soft-3d text-[#4A3C2A] hover:scale-105"
                >
                  <span className="text-lg md:text-xl">🧾</span>
                  <span>{tr.bill}</span>
                </button>
              </div>
            </div>
          )}

          <BillCalculatorModal
            isOpen={isBillModalOpen}
            cartItems={cartItems}
            lang={lang}
            showVat={showVat}
            onClose={() => setIsBillModalOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={cartId => setCartItems(p => p.filter(c => c.cartId !== cartId))}
            onClearBill={() => { setCartItems([]); setIsBillModalOpen(false); }}
          />
          <RatingModal isOpen={isRatingOpen} lang={lang} onClose={() => setIsRatingOpen(false)} />
          <ItemDetailsModal 
            isOpen={isDetailsOpen}
            item={selectedItem}
            lang={lang}
            showVat={showVat}
            onClose={() => setIsDetailsOpen(false)}
            onAddToCart={handleAddItemToBill}
          />
        </main>
      </div>
    </>
  );
}
