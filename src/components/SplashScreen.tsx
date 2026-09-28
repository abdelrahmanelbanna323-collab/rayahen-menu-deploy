"use client";
import React, { useEffect, useState } from 'react';

export default function SplashScreen({ showVat = false, lang = 'AR' }: { showVat?: boolean; lang?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [localShowVat, setLocalShowVat] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const branch = window.location.pathname.replace(/^\//, '').split('/')[0] || 'all';
        const raw = localStorage.getItem('rayahen-menu-storage');
        if (raw) {
          const stored = JSON.parse(raw);
          const vs = stored?.state?.vatSettings;
          if (vs && vs[branch] !== undefined) return vs[branch];
        }
      } catch(e) {}
    }
    return showVat;
  });

  useEffect(() => {
    // Show on every page load (every QR scan)
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }, 2200);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed -inset-20 z-[99999] w-[140vw] h-[140vh] -left-[20vw] -top-[20vh] flex flex-col items-center justify-center transition-all duration-600 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ background: '#FAF8F3', touchAction: 'none' }}
    >
      {/* Custom Keyframes for Seamless Handover & Luxury Animation Suite */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverseSlow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes scalePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 15px 50px rgba(196,154,69,0.35); }
          50% { transform: scale(1.04); box-shadow: 0 22px 65px rgba(196,154,69,0.55); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-150%) rotate(25deg); }
          100% { transform: translateX(150%) rotate(25deg); }
        }
        @keyframes ringsIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes textIn {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0px); opacity: 1; }
        }
        @keyframes glowIn {
          0% { box-shadow: 0 0 0 rgba(196,154,69,0); border-color: rgba(196,154,69,0); }
          100% { box-shadow: 0 15px 50px rgba(196,154,69,0.35); border-color: rgba(196,154,69,0.4); }
        }
        .animate-spin-slow { animation: spinSlow 9s linear infinite; }
        .animate-spin-reverse-slow { animation: spinReverseSlow 14s linear infinite; }
        .animate-scale-pulse { animation: glowIn 0.5s ease-out forwards, scalePulse 3s ease-in-out 0.5s infinite; }
        .animate-shimmer-sweep { animation: shimmerSweep 2.2s ease-in-out infinite; }
        .animate-rings-in { animation: ringsIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-text-in { animation: textIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      {/* Outer Floating Luxury Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer Glowing Halos & Rotating Rings (Smooth Entrance via animate-rings-in) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-rings-in">
          <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border border-[#C49A45]/30 border-t-[#C49A45] border-r-[#C49A45]/60 animate-spin-slow opacity-80" />
          <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full border border-[#C49A45]/15 border-b-[#C49A45]/50 animate-spin-reverse-slow opacity-60" />
          <div className="absolute w-64 h-64 md:w-72 md:h-72 rounded-full bg-[#C49A45]/15 blur-2xl animate-pulse" />
        </div>

        {/* Perfectly Circular Animated Logo Container (Starts matching OS static screen then glows up) */}
        <div className="w-56 h-56 md:w-64 md:h-64 relative rounded-full overflow-hidden bg-white flex items-center justify-center animate-scale-pulse border-2 border-transparent">
          <img
            src="/icon-512-v2.png"
            alt="Rayahen Logo"
            className="w-full h-full object-contain rounded-full"
          />
          {/* Dynamic Light Sweep Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/45 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" />
        </div>
      </div>
      
      {/* Royal Brand Typography (Smooth Fade In) */}
      <div className="mt-8 text-center animate-text-in">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-[0.2em] text-[#B38E5D] drop-shadow-sm">
          رياحين
        </h1>
        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#C49A45] font-semibold mt-1.5 opacity-90">
          R A Y A H E N
        </p>

        {/* VAT Notice */}
        {localShowVat && (
          <div
            className="mt-4 mx-4 px-4 py-2 rounded-xl text-xs font-bold"
            style={{
              background: 'rgba(196,154,69,0.12)',
              border: '1px solid rgba(196,154,69,0.5)',
              color: '#7A5C2E',
            }}
          >
            {lang === 'AR'
              ? 'يضاف 14% ضريبة قيمة مضافة على الأسعار'
              : lang === 'IT'
              ? '+14% IVA verrà aggiunta ai prezzi'
              : lang === 'RU'
              ? '+14% НДС добавляется к ценам'
              : '14% VAT is added to all prices'}
          </div>
        )}
      </div>

      {/* Premium Loader */}
      <div className="absolute bottom-[16vh] flex gap-2.5 opacity-75 animate-text-in" style={{ animationDelay: '200ms' }}>
        <div className="w-2 h-2 rounded-full bg-[#C49A45] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-[#C49A45] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-[#C49A45] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}



