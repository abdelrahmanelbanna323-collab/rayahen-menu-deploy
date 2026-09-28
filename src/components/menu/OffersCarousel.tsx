"use client";
import React, { useState, useEffect } from 'react';
import { useMenuStore } from '@/store/useMenuStore';
import { Lang } from '@/lib/translations';
import { translateText } from '@/lib/autoTranslate';

interface OffersCarouselProps {
  lang: Lang;
  branchParam?: string;
}

export default function OffersCarousel({ lang, branchParam }: OffersCarouselProps) {
  const isAr = lang === 'AR';

  const promotions = useMenuStore((state) => state.promotions);
  const activePromotions = promotions
    .map(p => {
      const override = branchParam ? p.branchOverrides?.[branchParam] : undefined;
      return {
        ...p,
        isActive: override?.isActive ?? (p.isActive !== false),
        titleAr: override?.titleAr ?? p.titleAr,
        titleEn: override?.titleEn ?? p.titleEn,
        subtitleAr: override?.subtitleAr ?? p.subtitleAr,
        subtitleEn: override?.subtitleEn ?? p.subtitleEn,
        badgeAr: override?.badgeAr ?? p.badgeAr,
        badgeEn: override?.badgeEn ?? p.badgeEn,
        icon: override?.icon ?? p.icon,
        imageUrl: override?.imageUrl ?? p.imageUrl,
      };
    })
    .filter((p) => p.isActive);

  const [translations, setTranslations] = useState<Record<string, { title: string; subtitle: string; badge: string }>>({});

  useEffect(() => {
    if (lang === 'AR') return;
    const translateAll = async () => {
      const result: Record<string, { title: string; subtitle: string; badge: string }> = {};
      for (const offer of activePromotions) {
        let title = '';
        let subtitle = '';
        let badge = '';

        if (lang === 'IT') {
          title = (offer as any).titleIt || offer.titleEn || await translateText(offer.titleAr, lang);
          subtitle = (offer as any).subtitleIt || offer.subtitleEn || await translateText(offer.subtitleAr || '', lang);
          badge = (offer as any).badgeIt || offer.badgeEn || await translateText(offer.badgeAr || '', lang);
        } else if (lang === 'RU') {
          title = (offer as any).titleRu || offer.titleEn || await translateText(offer.titleAr, lang);
          subtitle = (offer as any).subtitleRu || offer.subtitleEn || await translateText(offer.subtitleAr || '', lang);
          badge = (offer as any).badgeRu || offer.badgeEn || await translateText(offer.badgeAr || '', lang);
        } else { // EN
          title = offer.titleEn || await translateText(offer.titleAr, lang);
          subtitle = offer.subtitleEn || await translateText(offer.subtitleAr || '', lang);
          badge = offer.badgeEn || await translateText(offer.badgeAr || '', lang);
        }
        result[offer.id] = { title, subtitle, badge };
      }
      setTranslations(result);
    };
    translateAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, activePromotions.map(p => p.id).join(',')]);

  if (activePromotions.length === 0) return null;

  return (
    <section className="mb-8 flex flex-col gap-3">
      {activePromotions.map((offer) => {
        const tx = translations[offer.id];
        const title = lang === 'AR' ? offer.titleAr : (tx?.title || offer.titleAr);
        const subtitle = lang === 'AR' ? offer.subtitleAr : (tx?.subtitle || offer.subtitleAr);
        const badge = lang === 'AR' ? offer.badgeAr : (tx?.badge || offer.badgeAr);
        return (
          <div key={offer.id} className="w-full">
            <div className={`min-h-[100px] md:min-h-[120px] bg-gradient-to-r ${offer.gradient || 'from-brand-gold to-brand-gold-light text-white'} rounded-[20px] p-4 flex flex-col justify-center relative overflow-hidden shadow-md border border-brand-gold/20 transition-transform duration-300 hover:scale-[1.02]`}>
              {offer.imageUrl && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40"
                    style={{ backgroundImage: `url(${offer.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </>
              )}
              <div className="relative z-10 flex flex-col items-start">
                <span className="inline-block bg-white/30 backdrop-blur-sm text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-white/40 shadow-sm uppercase tracking-wide">
                  {badge}
                </span>
                <h2 className="text-lg md:text-xl font-heading font-bold mb-1 drop-shadow-md flex items-center gap-2">
                  {offer.icon && <span>{offer.icon}</span>}
                  <span>{title}</span>
                </h2>
                <p className="opacity-100 text-xs md:text-sm max-w-[95%] font-body drop-shadow-md font-medium">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
