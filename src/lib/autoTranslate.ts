// Auto-translation using Google Translate unofficial endpoint
// Supports: AR/EN → IT, RU
// Uses batch translation + localStorage cache for performance

import type { Lang } from './translations';

// ── Cache version: increment to invalidate old cached translations ────────────
const CACHE_VERSION = 'v3';

// ── Cache (localStorage + in-memory) ────────────────────────────────────────

const MEM_CACHE = new Map<string, string>();

function cacheKey(text: string, lang: string) {
  // Use cache version + lang + first 100 chars of text as key
  return `tr_${CACHE_VERSION}_${lang}_${text.slice(0, 100)}`;
}

function readCache(text: string, lang: string): string | null {
  const k = cacheKey(text, lang);
  if (MEM_CACHE.has(k)) return MEM_CACHE.get(k)!;
  try {
    const v = localStorage.getItem(k);
    if (v) { MEM_CACHE.set(k, v); return v; }
  } catch {}
  return null;
}

function writeCache(text: string, lang: string, translated: string) {
  const k = cacheKey(text, lang);
  MEM_CACHE.set(k, translated);
  try { localStorage.setItem(k, translated); } catch {}
}

// ── Lang map ─────────────────────────────────────────────────────────────────

const langMap: Partial<Record<Lang, string>> = {
  EN: 'en',
  IT: 'it',
  RU: 'ru',
};

// Detect if text is mostly Arabic
function isArabicText(text: string): boolean {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicChars > text.length * 0.3;
}

// ── Build Google Translate URL ────────────────────────────────────────────────
// sl=auto: let Google detect source language (handles both AR and EN inputs)

function googleUrl(text: string, targetCode: string): string {
  const sl = isArabicText(text) ? 'ar' : 'auto';
  return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
}

// ── Single text translation ───────────────────────────────────────────────────

export async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text?.trim() || targetLang === 'AR') return text;
  const target = langMap[targetLang];
  if (!target) return text;

  const cached = readCache(text, target);
  if (cached) return cached;

  try {
    const url = googleUrl(text, target);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const translated: string = data?.[0]
      ?.map((chunk: any[]) => chunk?.[0] ?? '')
      .join('')
      .trim();
    if (!translated || translated === text) return text;
    writeCache(text, target, translated);
    return translated;
  } catch {
    // Fallback: MyMemory API
    try {
      const sl = isArabicText(text) ? 'ar' : 'en';
      const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${target}`;
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 5000);
      const res2 = await fetch(url2, { signal: c2.signal });
      clearTimeout(t2);
      if (!res2.ok) return text;
      const d2 = await res2.json();
      const t2r: string = d2?.responseData?.translatedText;
      if (!t2r || t2r === text) return text;
      writeCache(text, target, t2r);
      return t2r;
    } catch {
      return text;
    }
  }
}

// ── Batch translation (translate many strings at once) ────────────────────────

export async function batchTranslate(
  texts: string[],
  targetLang: Lang
): Promise<string[]> {
  if (!texts.length || targetLang === 'AR') return texts;
  const target = langMap[targetLang];
  if (!target) return texts;

  // Separate already-cached from uncached
  const results: string[] = new Array(texts.length);
  const needTranslation: Array<{ idx: number; text: string }> = [];

  for (let i = 0; i < texts.length; i++) {
    if (!texts[i]?.trim()) { results[i] = texts[i] || ''; continue; }
    const cached = readCache(texts[i], target);
    if (cached) {
      results[i] = cached;
    } else {
      needTranslation.push({ idx: i, text: texts[i] });
    }
  }

  if (needTranslation.length === 0) return results;

  // Batch in chunks of 30 to avoid URL size limits
  const CHUNK = 30;
  for (let c = 0; c < needTranslation.length; c += CHUNK) {
    const chunk = needTranslation.slice(c, c + CHUNK);
    // Join with a unique separator that's unlikely to appear in translated text
    const SEP = '\n█\n';
    const combined = chunk.map(x => x.text).join(SEP);

    try {
      const url = googleUrl(combined, target);
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        const full: string = data?.[0]
          ?.map((ch: any[]) => ch?.[0] ?? '')
          .join('')
          .trim() ?? '';

        // Split back by separator variants Google might output
        const parts = full.split(/\s*[█▌|]{1,4}\s*/);

        chunk.forEach((item, pi) => {
          const translated = parts[pi]?.trim() || item.text;
          results[item.idx] = translated;
          writeCache(item.text, target, translated);
        });
        continue;
      }
    } catch {}

    // Fallback: translate individually
    for (const item of chunk) {
      results[item.idx] = await translateText(item.text, targetLang);
    }
  }

  return results;
}

// ── Clear all cached translations (call when needed) ─────────────────────────

export function clearTranslationCache() {
  MEM_CACHE.clear();
  // Also clear localStorage entries for this cache version
  try {
    const prefix = `tr_${CACHE_VERSION}_`;
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) keysToDelete.push(k);
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
  } catch {}
}
