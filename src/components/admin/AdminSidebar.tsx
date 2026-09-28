"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMenuStore } from '@/store/useMenuStore';
import InstallPWAButton from '../InstallPWAButton';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const logoutAdmin = useMenuStore((state) => state.logoutAdmin);
  const currentSessionUser = useMenuStore((state) => state.currentSessionUser);

  // Hide sidebar completely if not logged in or on login page
  if (!currentSessionUser || pathname === '/login') {
    return null;
  }

  return (
    <aside
      className="w-full md:w-60 flex flex-col p-6 shrink-0"
      style={{
        background: 'linear-gradient(180deg, #3D2B1A 0%, #2C1E11 100%)',
        borderRight: '1px solid rgba(196,162,101,0.15)',
      }}
    >
      {/* Logo Area */}
      <div
        className="flex items-center gap-3 mb-8 pb-5"
        style={{ borderBottom: '1px solid rgba(196,162,101,0.15)' }}
      >
        <div
          className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            width: '42px',
            height: '42px',
            background: 'rgba(196,162,101,0.12)',
            border: '1.5px solid rgba(196,162,101,0.35)',
            boxShadow: '0 2px 10px rgba(196,162,101,0.15)',
          }}
        >
          <img src="/icon-512.png" alt="Rayahen Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <div>
          <h1
            className="font-heading font-bold leading-none tracking-widest"
            style={{ color: '#D4B87A', fontSize: '1.1rem', letterSpacing: '0.12em' }}
          >
            rayahen
          </h1>
          <p className="text-[10px] mt-0.5 font-body tracking-wider" style={{ color: 'rgba(196,162,101,0.5)' }}>
            Admin Panel
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2 flex-grow">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            background: 'rgba(196,162,101,0.15)',
            border: '1px solid rgba(196,162,101,0.25)',
            color: '#D4B87A',
          }}
        >
          <span>📊</span>
          <span>Dashboard / لوحة التحكم</span>
        </Link>
      </nav>

      {/* PWA Install Button */}
      <div className="mb-4 mt-auto">
        <InstallPWAButton
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #D4B87A 0%, #C4A265 100%)',
            color: '#1a1109',
            boxShadow: '0 4px 15px rgba(196,162,101,0.3)',
          }}
        />
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          if (confirm('تأكيد تسجيل الخروج؟')) {
            logoutAdmin();
            router.push('/dashboard');
          }
        }}
        className="flex items-center gap-2 text-xs font-bold transition-all pt-4"
        style={{
          borderTop: '1px solid rgba(196,162,101,0.12)',
          color: 'rgba(196,162,101,0.4)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(196,162,101,0.4)'; }}
      >
        <span>🚪</span>
        <span>تسجيل الخروج</span>
      </button>
    </aside>
  );
}

