"use client";
import React from 'react';
import { Lang, getItemName, t } from '@/lib/translations';

function resolveImage(nameAr: string, nameEn: string, categoryEn: string): string {
  const ar = nameAr.toLowerCase();
  const en = nameEn.toLowerCase();
  if (en.includes('espresso') || ar.includes('اسبريسو') || ar.includes('إسبريسو')) return '/img-espresso.jpg';
  if (en.includes('americano') || ar.includes('أمريكانو') || ar.includes('امريكانو')) return '/img-espresso.jpg';
  if (en.includes('macchiato') || ar.includes('ماكياتو')) return '/img-espresso.jpg';
  if (en.includes('turkish') || ar.includes('تركي')) return '/img-espresso.jpg';
  if (en.includes('cortado') || ar.includes('كورتادو')) return '/img-espresso.jpg';
  if (en.includes('cappuccino') || ar.includes('كابتشينو')) return '/img-cappuccino.jpg';
  if (en.includes('latte') || ar.includes('لاتيه') || ar.includes('لاتة')) return '/img-cappuccino.jpg';
  if (en.includes('mocha') || ar.includes('موكا')) return '/img-cappuccino.jpg';
  if (en.includes('flat white') || ar.includes('فلات وايت')) return '/img-cappuccino.jpg';
  if (en.includes('iced') || ar.includes('آيس') || ar.includes('ايس')) return '/img-iced-coffee.jpg';
  if (en.includes('frappe') || en.includes('frappé') || ar.includes('فرابيه') || ar.includes('فراب')) return '/img-iced-coffee.jpg';
  if (en.includes('cold brew') || ar.includes('كولد برو')) return '/img-iced-coffee.jpg';
  if (en.includes('spanish') || ar.includes('سبانش')) return '/img-iced-coffee.jpg';
  if (en.includes('hot chocolate') || ar.includes('هوت شوكلت') || ar.includes('شوكولاتة')) return '/img-hot-chocolate.jpg';
  if (en.includes('chocolate') || ar.includes('شوكليت') || ar.includes('شوكولا')) return '/img-hot-chocolate.jpg';
  if (en.includes('tea') || ar.includes('شاي')) return '/img-hot-chocolate.jpg';
  if (en.includes('matcha') || ar.includes('ماتشا')) return '/img-hot-chocolate.jpg';
  if (en.includes('milkshake') || en.includes('shake') || ar.includes('ميلك شيك') || ar.includes('شيك')) return '/img-milkshake.jpg';
  if (en.includes('smoothie') || ar.includes('سموزي') || ar.includes('سموثي')) return '/img-milkshake.jpg';
  if (en.includes('juice') || ar.includes('عصير') || ar.includes('عصائر')) return '/img-juice.jpg';
  if (en.includes('orange') || ar.includes('برتقال')) return '/img-juice.jpg';
  if (en.includes('mango') || ar.includes('مانجو')) return '/img-juice.jpg';
  if (en.includes('lemon') || ar.includes('ليمون')) return '/img-juice.jpg';
  if (en.includes('guava') || ar.includes('جوافة')) return '/img-juice.jpg';
  if (en.includes('croissant') || ar.includes('كرواسون') || ar.includes('كرواسان')) return '/img-croissant.jpg';
  if (en.includes('danish') || ar.includes('دانش')) return '/img-croissant.jpg';
  if (en.includes('cinnamon') || ar.includes('سينابون')) return '/img-croissant.jpg';
  if (en.includes('toast') || ar.includes('توست')) return '/img-croissant.jpg';
  if (en.includes('muffin') || ar.includes('مافن')) return '/img-croissant.jpg';
  if (en.includes('waffle') || ar.includes('وافل')) return '/img-dessert.jpg';
  if (en.includes('pancake') || ar.includes('بانكيك')) return '/img-dessert.jpg';
  if (ar.includes('فول') || en.includes('foul') || en.includes('fava')) return '/img-breakfast.jpg';
  if (ar.includes('فلافل') || en.includes('falafel')) return '/img-breakfast.jpg';
  if (ar.includes('سجق') || ar.includes('هوت دوج') || en.includes('sausage')) return '/img-breakfast.jpg';
  if (ar.includes('بطاطس') || en.includes('potato')) return '/img-breakfast.jpg';
  if (ar.includes('باذنجان') || en.includes('eggplant')) return '/img-breakfast.jpg';
  if (ar.includes('أومليت') || ar.includes('اومليت') || en.includes('omelette')) return '/img-omelette.jpg';
  if (ar.includes('بيض') || en.includes('egg')) return '/img-omelette.jpg';
  if (ar.includes('جبنة') || en.includes('cheese')) return '/img-omelette.jpg';
  if (ar.includes('تونة') || en.includes('tuna')) return '/img-omelette.jpg';
  if (en.includes('cake') || ar.includes('كيك') || ar.includes('كعك')) return '/img-dessert.jpg';
  if (en.includes('brownie') || ar.includes('براوني')) return '/img-dessert.jpg';
  if (en.includes('cheesecake') || ar.includes('تشيز كيك')) return '/img-dessert.jpg';
  if (en.includes('ice cream') || ar.includes('ايس كريم')) return '/img-dessert.jpg';
  if (en.includes('tiramisu') || ar.includes('تيراميسو')) return '/img-dessert.jpg';
  if (en.includes('kunafa') || ar.includes('كنافة')) return '/img-dessert.jpg';
  const catFallbacks: Record<string, string> = {
    'Coffee Drinks': '/img-cappuccino.jpg',
    'Hot Drinks': '/img-hot-chocolate.jpg',
    'Milkshakes & Smoothies': '/img-milkshake.jpg',
    'Frappes & Iced Coffee': '/img-iced-coffee.jpg',
    'Breakfast Combos': '/img-breakfast.jpg',
    'Breakfast': '/img-breakfast.jpg',
    'Bakery': '/img-croissant.jpg',
    'Fresh Juices': '/img-juice.jpg',
    'Desserts': '/img-dessert.jpg',
    'Nuts & Bubbles': '/img-milkshake.jpg',
    'Cocktails & Soda': '/img-juice.jpg',
    'Soft Drinks & Addons': '/img-juice.jpg',
  };
  return catFallbacks[categoryEn] || '/img-cappuccino.jpg';
}

interface ItemCardProps {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionIt?: string;
  descriptionRu?: string;
  price: number;
  badgeEn?: string;
  badgeAr?: string;
  badgeIt?: string;
  badgeRu?: string;
  categoryEn?: string;
  imageUrl?: string;
  nameIt?: string;
  nameRu?: string;
  lang: Lang;
  showVat?: boolean;
  onClick?: () => void;
  onQuickAdd?: (e: React.MouseEvent) => void;
}

export default function ItemCard({
  nameEn, nameAr, nameIt, nameRu, descriptionEn, descriptionAr, descriptionIt, descriptionRu, price,
  badgeEn, badgeAr, badgeIt, badgeRu, categoryEn = '', imageUrl, lang, showVat = false, onClick, onQuickAdd,
}: ItemCardProps) {
  const isAr = lang === 'AR';
  const imgSrc = imageUrl || resolveImage(nameAr, nameEn, categoryEn);

  const badge =
    lang === 'AR' ? badgeAr :
    lang === 'IT' ? (badgeIt || badgeEn) :
    lang === 'RU' ? (badgeRu || badgeEn) :
    badgeEn;

  const primaryName = getItemName({ nameEn, nameAr, nameIt, nameRu }, lang);

  // Secondary name: always show Arabic for EN (and vice versa), English for IT/RU
  const secondaryName =
    lang === 'AR' ? nameEn :
    lang === 'EN' ? nameAr :
    nameEn;  // For IT/RU: show English as universal subtitle

  const tr = t(lang);

  // Description: use whatever was passed in (batch-translated by GuestMenu for IT/RU)
  const description =
    lang === 'AR' ? descriptionAr :
    lang === 'IT' ? (descriptionIt || descriptionEn || '') :
    lang === 'RU' ? (descriptionRu || descriptionEn || '') :
    descriptionEn;

  return (
    <div
      onClick={onClick}
      className="card-soft-3d group cursor-pointer flex flex-col overflow-hidden h-full"
    >
      {/* Food Image Full Width for Grid Layout */}
      <div className="relative w-full overflow-hidden" style={{ height: '130px' }}>
        <img
          src={imgSrc}
          alt={primaryName}
          className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Light overlay for clean aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay" />
        
        {/* Elegant Badge */}
        {badge && (
          <div
            className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm"
            style={{
              background: '#FFFFFF',
              color: '#B38E5D',
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          >
            {badge}
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 px-3 py-3 flex flex-col justify-between">
        <div>
          <p className="font-bold text-sm leading-snug" style={{ color: '#4A3C2A' }}>
            {primaryName}
          </p>
          <p className="text-[10px] mt-0.5 leading-snug" style={{ color: '#888888' }}>
            {secondaryName}
          </p>
          {description && (
            <p className="text-[10px] mt-1.5 leading-snug" style={{ color: '#A3988E' }}>
              {description}
            </p>
          )}
        </div>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-sm" style={{ color: '#B38E5D' }}>
              {price} <span style={{ fontWeight: '600', fontSize: '0.7em' }}>{tr.currency}</span>
            </span>
            {showVat && (
              <span className="text-[9px] font-semibold leading-none mt-1 block" style={{ color: '#A0896A', opacity: 0.85 }}>
                {lang === 'AR' ? 'يتم إضافة 14% ضريبة قيمة مضافة' : lang === 'IT' ? '+14% IVA' : lang === 'RU' ? '+14% НДС' : '+14% VAT'}
              </span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); if (onQuickAdd) onQuickAdd(e); }}
            className="btn-gold-3d flex items-center justify-center rounded-full w-8 h-8 text-xl leading-none"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
