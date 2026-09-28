"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuStore } from '@/store/useMenuStore';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(true);

  const loginAdmin = useMenuStore((state) => state.loginAdmin);
  const isSupabaseSynced = useMenuStore((state) => state.isSupabaseSynced);
  const initSupabaseListener = useMenuStore((state) => state.initSupabaseListener);
  const router = useRouter();

  // Start Firebase listener to load real users from cloud
  useEffect(() => {
    const cleanup = initSupabaseListener();
    return cleanup || undefined;
  }, [initSupabaseListener]);

  // Wait for Firebase sync (max 5 seconds), then unlock login button
  useEffect(() => {
    if (isSupabaseSynced) {
      setIsSyncingUsers(false);
      return;
    }
    const timer = setTimeout(() => setIsSyncingUsers(false), 5000);
    return () => clearTimeout(timer);
  }, [isSupabaseSynced]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const success = loginAdmin(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setErrorMsg('اسم المستخدم أو كلمة السر غير صحيحة');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-body"
      style={{
        background: 'linear-gradient(145deg, #2C1E11 0%, #3D2B1A 40%, #4A3220 100%)',
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #C4A265 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, #C4A265 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div
        className="relative w-full max-w-sm rounded-3xl p-8"
        style={{
          background: 'linear-gradient(145deg, #FAF8F3 0%, #F5F0E8 100%)',
          border: '1px solid rgba(196,162,101,0.25)',
          boxShadow: '0 24px 60px rgba(20,12,4,0.5), 0 4px 16px rgba(196,162,101,0.1)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              width: '68px',
              height: '68px',
              background: 'linear-gradient(145deg, #FFFFFF, #FAF4EC)',
              border: '2px solid rgba(196,162,101,0.3)',
              boxShadow: '0 4px 20px rgba(196,162,101,0.18)',
            }}
          >
            <img src="/icon-192-v2.png" alt="Rayahen Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1
            className="font-heading font-bold tracking-[0.15em]"
            style={{ color: '#C4A265', fontSize: '1.5rem' }}
          >
            rayahen
          </h1>
          <p className="text-xs mt-1 tracking-wider" style={{ color: '#A09075' }}>
            لوحة التحكم الإدارية
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(196,162,101,0.2)' }} />
          <span className="text-xs font-bold tracking-widest" style={{ color: '#C4A265' }}>تسجيل الدخول</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(196,162,101,0.2)' }} />
        </div>

        {/* Firebase user sync loading indicator */}
        {isSyncingUsers && (
          <div
            className="mb-5 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2"
            style={{
              background: 'rgba(196,162,101,0.08)',
              border: '1px solid rgba(196,162,101,0.2)',
              color: '#A09075',
            }}
          >
            <span className="inline-block animate-spin">⌛</span>
            جاري تحميل بيانات المستخدمين...
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div
            className="mb-5 p-3 rounded-xl text-xs font-bold text-center"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#dc2626',
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold mb-1.5 tracking-wider"
              style={{ color: '#7A6A55' }}
            >
              اسم المستخدم (Username)
            </label>
            <input
              type="text"
              required
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(196,162,101,0.25)',
                color: '#2C2416',
              }}
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #C4A265'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,162,101,0.1)'; }}
              onBlur={e => { e.currentTarget.style.border = '1.5px solid rgba(196,162,101,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold mb-1.5 tracking-wider"
              style={{ color: '#7A6A55' }}
            >
              كلمة السر (Password)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(196,162,101,0.25)',
                color: '#2C2416',
              }}
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #C4A265'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,162,101,0.1)'; }}
              onBlur={e => { e.currentTarget.style.border = '1.5px solid rgba(196,162,101,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSyncingUsers}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mt-2"
            style={{
              background: (isLoading || isSyncingUsers)
                ? 'rgba(196,162,101,0.6)'
                : 'linear-gradient(135deg, #C4A265 0%, #D4B87A 50%, #B8945A 100%)',
              color: '#3D2B1A',
              boxShadow: (isLoading || isSyncingUsers) ? 'none' : '0 4px 16px rgba(196,162,101,0.35)',
              letterSpacing: '0.05em',
            }}
          >
            {isSyncingUsers ? '⌛ جاري التحميل...' : isLoading ? '...' : '🔐 دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
