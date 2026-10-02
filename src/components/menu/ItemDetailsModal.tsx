"use client";
import React, { useEffect, useState } from 'react';
import { MenuItem } from '@/components/menu/AddonBottomSheet';
import { Lang, t, getItemName } from '@/lib/translations';

interface ItemDetailsModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  lang: Lang;
  showVat?: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export default function ItemDetailsModal({ isOpen, item, lang, showVat = false, onClose, onAddToCart }: ItemDetailsModalProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered || !item) return null;

  const tr = t(lang);
  const isAr = lang === 'AR';
  const primaryName = getItemName(item as any, lang);
  const secondaryName = lang === 'AR' ? item.nameEn : item.nameAr;
  const description =
    lang === 'AR' ? item.descriptionAr :
    lang === 'IT' ? (item.descriptionIt || item.descriptionEn) :
    lang === 'RU' ? (item.descriptionRu || item.descriptionEn) :
    item.descriptionEn;

  // We should have imgSrc if passed or handled before. 
  // For safety, assuming item.imageUrl is present if not we fall back to something.
  const imgSrc = item.imageUrl || '/img-cappuccino.jpg'; 

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`glass-panel w-full sm:w-[480px] max-h-[90vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col pointer-events-auto shadow-2xl transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full sm:translate-y-10 sm:scale-95 opacity-0'}`}
      >
        {/* Pull handle for mobile */}
        <div className="w-full flex justify-center pt-4 pb-2 sm:hidden">
          <div className="w-12 h-1.5 bg-black/20 rounded-full" />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white/40 transition-all z-20 border border-white/40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div className="overflow-y-auto scrollbar-hide pb-28 sm:pb-32">
          {/* Image Header */}
          <div className="relative w-full h-[280px] sm:h-[320px] bg-white rounded-t-[32px] sm:rounded-t-[32px]">
            <img 
              src={imgSrc} 
              alt={primaryName}
              className="w-full h-full object-contain rounded-t-[32px] sm:rounded-t-[32px] p-4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 -mt-10 relative z-10">
            <div className="glass-light rounded-3xl p-6 shadow-sm border border-white/80">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A3C2A] leading-tight mb-1">{primaryName}</h2>
              <p className="text-xs font-bold text-[#A0896A] mb-4 uppercase tracking-wider">{secondaryName}</p>
              
              {description && (
                <div className="bg-white/40 rounded-2xl p-4 mb-2">
                  <p className="text-[#6E5A47] leading-relaxed text-sm">{description}</p>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between mt-4 px-2">
              <div>
                <p className="text-xs text-[#888888] font-bold uppercase tracking-wider mb-1">{lang === 'AR' ? 'السعر' : lang === 'IT' ? 'Prezzo' : lang === 'RU' ? 'Цена' : 'Price'}</p>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#B38E5D]">
                  {item.price} <span className="text-lg font-semibold">{tr.currency}</span>
                </div>
                {showVat && (
                  <p className="text-[10px] font-semibold text-[#A0896A] mt-1 opacity-80">
                    {lang === 'AR' ? 'يتم إضافة 14% ضريبة قيمة مضافة' : lang === 'IT' ? '+14% IVA' : lang === 'RU' ? '+14% НДС' : '+14% VAT'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
          <button 
            onClick={() => {
              onAddToCart(item);
              onClose();
            }}
            className="w-full py-4 rounded-[20px] btn-gold-3d text-white font-bold text-lg flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(179,142,93,0.3)]"
          >
            <span>{tr.addToBill || 'Add to Bill 🧾'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
