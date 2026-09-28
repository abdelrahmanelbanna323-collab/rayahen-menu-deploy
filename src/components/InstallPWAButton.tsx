"use client";
import React, { useEffect, useState, useCallback } from 'react';

interface InstallPWAButtonProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  icon?: string;
}

type Platform = 'android' | 'ios' | 'desktop' | 'unknown';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Macintosh|Windows|Linux/.test(ua)) return 'desktop';
  return 'unknown';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export default function InstallPWAButton({
  className = "px-3.5 h-9 md:h-10 rounded-full flex items-center gap-1.5 justify-center transition-all btn-gold-3d hover:scale-105 font-bold text-xs md:text-sm whitespace-nowrap",
  style,
  label = "تثبيت",
  icon = "📲",
}: InstallPWAButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    // If native prompt available (Android Chrome) — use it directly
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setInstalled(true);
      }
      return;
    }
    // Otherwise show step-by-step modal
    setShowModal(true);
  }, [deferredPrompt]);

  // Hide if already installed as PWA
  if (installed) return null;

  const iosSteps = [
    { icon: '⎘', text: 'افتح متصفح Safari' },
    { icon: '🔗', text: 'اضغط على زر المشاركة في الأسفل' },
    { icon: '➕', text: 'اختر «الإضافة إلى الشاشة الرئيسية»' },
    { icon: '✅', text: 'اضغط «إضافة» وستجد التطبيق على شاشتك' },
  ];

  const androidSteps = [
    { icon: '⋮', text: 'افتح قائمة المتصفح (النقاط الثلاث ⋮)' },
    { icon: '📲', text: 'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»' },
    { icon: '✅', text: 'اضغط «تثبيت» وسيظهر التطبيق على شاشتك' },
  ];

  const desktopSteps = [
    { icon: '🖥️', text: 'في متصفح Chrome أو Edge على الكمبيوتر:' },
    { icon: '➕', text: 'اضغط على أيقونة التثبيت 🖥️ جوار رابط الموقع في شريط العنوان فوق' },
    { icon: '⋮', text: 'أو افتح قائمة المتصفح (⋮) واختر «تثبيت التطبيق» (Install App)' },
    { icon: '✅', text: 'اضغط «تثبيت» وسيعمل كبرنامج منفصل على جهازك ومباشرة من سطح المكتب!' },
  ];

  const steps = platform === 'ios' ? iosSteps : (platform === 'android' ? androidSteps : desktopSteps);

  return (
    <>
      <button onClick={handleInstall} className={className} style={style}>
        <span>{label}</span>
        <span>{icon}</span>
      </button>

      {/* Step-by-step install modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 mb-6 md:mb-0 rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: '#FAF8F3', border: '1.5px solid #e8dfd4' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-6 pt-6 pb-4 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,#B38E5D22,#B38E5D11)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow"
                style={{ background: '#B38E5D' }}
              >
                📲
              </div>
              <div>
                <p className="font-extrabold text-lg" style={{ color: '#4A3C2A' }}>
                  تثبيت التطبيق
                </p>
                <p className="text-xs" style={{ color: '#888' }}>
                  {platform === 'ios' ? 'على جهاز iPhone / iPad' : 'على جهاز Android'}
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="px-6 py-5 space-y-4" dir="rtl">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: '#B38E5D22', color: '#B38E5D', border: '1.5px solid #B38E5D44' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="text-base mr-1">{step.icon}</span>
                    <span className="font-semibold text-sm" style={{ color: '#4A3C2A' }}>
                      {step.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-12 rounded-2xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg,#B38E5D,#8B6A3A)',
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(179,142,93,0.4)',
                }}
              >
                فهمت ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
