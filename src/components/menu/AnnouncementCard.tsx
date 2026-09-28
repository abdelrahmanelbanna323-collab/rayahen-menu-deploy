"use client";
import React, { useState, useEffect } from 'react';
import { useMenuStore } from '@/store/useMenuStore';
import { Lang, t } from '@/lib/translations';
import { translateText } from '@/lib/autoTranslate';

interface AnnouncementCardProps {
  lang: Lang;
  branchParam?: string;
}

interface TranslatedPost {
  id: string;
  titleAr: string;
  contentAr: string;
  badgeAr?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: string;
  translatedTitle?: string;
  translatedContent?: string;
  translatedBadge?: string;
}

export default function AnnouncementCard({ lang, branchParam }: AnnouncementCardProps) {
  const announcements = useMenuStore((state) => state.announcements);
  const activeAnnouncements = announcements
    .map(a => {
      const override = branchParam ? a.branchOverrides?.[branchParam] : undefined;
      return {
        ...a,
        isActive: override?.isActive ?? (a.isActive !== false),
        titleAr: override?.titleAr ?? a.titleAr,
        titleEn: override?.titleEn ?? a.titleEn,
        contentAr: override?.contentAr ?? a.contentAr,
        contentEn: override?.contentEn ?? a.contentEn,
        imageUrl: override?.imageUrl ?? a.imageUrl,
        badgeAr: override?.badgeAr ?? a.badgeAr,
        badgeEn: override?.badgeEn ?? a.badgeEn,
      };
    })
    .filter((a) => a.isActive);

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, TranslatedPost>>({});

  const isAr = lang === 'AR';
  const tr = t(lang);
  const visibleAnnouncements = activeAnnouncements.filter((a) => !dismissedIds.includes(a.id));

  useEffect(() => {
    if (lang === 'AR') return;
    const translateAll = async () => {
      const result: Record<string, TranslatedPost> = {};
      for (const post of visibleAnnouncements) {
        // Try manual fields first (titleIt, titleRu etc), then auto-translate from Arabic
        let title = '';
        let content = '';
        let badge = '';

        if (lang === 'IT') {
          title = (post as any).titleIt || await translateText(post.titleAr, lang);
          content = (post as any).contentIt || await translateText(post.contentAr, lang);
          badge = (post as any).badgeIt || await translateText(post.badgeAr || '', lang);
        } else if (lang === 'RU') {
          title = (post as any).titleRu || await translateText(post.titleAr, lang);
          content = (post as any).contentRu || await translateText(post.contentAr, lang);
          badge = (post as any).badgeRu || await translateText(post.badgeAr || '', lang);
        } else { // EN
          title = post.titleEn || await translateText(post.titleAr, lang);
          content = post.contentEn || await translateText(post.contentAr, lang);
          badge = post.badgeEn || await translateText(post.badgeAr || '', lang);
        }

        result[post.id] = {
          id: post.id,
          titleAr: post.titleAr,
          contentAr: post.contentAr,
          badgeAr: post.badgeAr,
          imageUrl: post.imageUrl,
          videoUrl: (post as any).videoUrl,
          mediaType: (post as any).mediaType,
          translatedTitle: title,
          translatedContent: content,
          translatedBadge: badge,
        };
      }
      setTranslations(result);
    };
    translateAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, visibleAnnouncements.map(p => p.id).join(',')]);

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      {visibleAnnouncements.map((post) => {
        const tx = translations[post.id];
        const title = lang === 'AR' ? post.titleAr : (tx?.translatedTitle || post.titleAr);
        const content = lang === 'AR' ? post.contentAr : (tx?.translatedContent || post.contentAr);
        const badge = lang === 'AR' ? post.badgeAr : (tx?.translatedBadge || post.badgeAr);
        return (
          <div
            key={post.id}
            className="bg-white border border-brand-gold/30 rounded-2xl overflow-hidden shadow-md relative animate-in fade-in slide-in-from-top-3 duration-300"
          >
            {/* Top Banner Accent */}
            <div className="h-2 bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold" />

            {/* Dismiss Button */}
            <button
              onClick={() => setDismissedIds((prev) => [...prev, post.id])}
              className={`absolute top-4 ${
                isAr ? 'left-4' : 'right-4'
              } text-gray-400 hover:text-soft-charcoal p-1.5 rounded-full bg-pearl-white border border-brand-gold/20 text-xs shadow-sm transition`}
            >
              ✕
            </button>

            <div className="p-5">
              {/* Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/20 mb-3">
                {badge || tr.announcementBadge}
              </span>

              {/* Title */}
              <h3 className={`font-bold text-xl mb-2 text-gray-800 ${isAr ? 'text-right' : 'text-left'}`}>
                {title}
              </h3>

              {/* Image / Video (if provided) */}
              {post.imageUrl || (post as any).videoUrl ? (
                <div className="my-3 rounded-xl overflow-hidden max-h-[650px] border border-brand-gold/15 bg-gray-50/50 flex items-center justify-center">
                  {(post as any).mediaType === 'video' || (post as any).videoUrl || (post.imageUrl && (post.imageUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) || post.imageUrl.startsWith('data:video/') || post.imageUrl.includes('video'))) ? (
                    <video
                      src={(post as any).videoUrl || post.imageUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-auto max-h-[650px] object-contain mx-auto"
                    />
                  ) : (
                    <img src={post.imageUrl} alt={title} className="w-full h-auto max-h-[650px] object-contain mx-auto" />
                  )}
                </div>
              ) : (
                <div className="my-3 h-36 bg-gradient-to-br from-pearl-white via-amber-50/40 to-brand-gold/10 rounded-xl border border-brand-gold/15 flex items-center justify-center">
                  <span className="text-brand-gold/40 font-heading font-bold text-lg">
                    ☕ Rayahen Alexandria Announcement
                  </span>
                </div>
              )}

              {/* Content */}
              <p className={`text-sm text-gray-600 whitespace-pre-wrap leading-relaxed ${isAr ? 'text-right' : 'text-left'} max-h-[400px] overflow-y-auto custom-scrollbar pr-2`}>
                {content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
