"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLoginPage from '../login/page';
import PromotionsManager from '@/components/admin/PromotionsManager';
import MenuItemsManager from '@/components/admin/MenuItemsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import AnnouncementsManager from '@/components/admin/AnnouncementsManager';
import UsersManager from '@/components/admin/UsersManager';
import ActivityLogsManager from '@/components/admin/ActivityLogsManager';
import InstallPWAButton from '@/components/InstallPWAButton';
import { useMenuStore } from '@/store/useMenuStore';
import { AVAILABLE_BRANCHES } from '@/types';

const MENU_URL = process.env.NEXT_PUBLIC_MENU_URL || '/';

export default function AdminDashboardPage() {
  const router = useRouter();
  const currentSessionUser = useMenuStore((state) => state.currentSessionUser);
  const logoutAdmin = useMenuStore((state) => state.logoutAdmin);

  // Synchronous check: If not logged in, instantly display Login Page directly without any flash
  if (!currentSessionUser) {
    return <AdminLoginPage />;
  }

  return <DashboardContent user={currentSessionUser} onLogout={() => { logoutAdmin(); router.push('/login'); }} />;
}

function DashboardContent({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'promotions' | 'announcements' | 'users'>('menu');
  const menuItems = useMenuStore((state) => state.menuItems);
  const categories = useMenuStore((state) => state.categories);
  const promotions = useMenuStore((state) => state.promotions);
  const announcements = useMenuStore((state) => state.announcements);
  const adminUsers = useMenuStore((state) => state.adminUsers);
  const ratingUrl = useMenuStore((state) => state.ratingUrl);
  const setRatingUrl = useMenuStore((state) => state.setRatingUrl);
  const syncToSupabase = useMenuStore((state) => state.syncToSupabase);
  const initSupabaseListener = useMenuStore((state) => state.initSupabaseListener);
  const lastSyncStatus = useMenuStore((state) => state.lastSyncStatus);
  const lastSyncError = useMenuStore((state) => state.lastSyncError);
  const adminBranch = useMenuStore((state) => state.adminBranch);
  const setAdminBranch = useMenuStore((state) => state.setAdminBranch);

  const clearAllData = useMenuStore((state) => state.clearAllData);
  const resetToDefaults = useMenuStore((state) => state.resetToDefaults);

  const [inputRatingUrl, setInputRatingUrl] = useState(ratingUrl || '');
  const [savedMsg, setSavedMsg] = useState(false);
  const [syncStatus, setSyncStatus] = useState(false);

  // Copy Branch Settings modal state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySource, setCopySource] = useState('fawzy-moaz');
  const [copyTargets, setCopyTargets] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'done'>('idle');
  const copyBranchSettings = useMenuStore((state) => state.copyBranchSettings);

  const toggleCopyTarget = (id: string) => {
    setCopyTargets(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopyBranch = async () => {
    if (!copyTargets.length) return;
    setCopyStatus('copying');
    await copyBranchSettings(copySource, copyTargets);
    setCopyStatus('done');
    setTimeout(() => {
      setShowCopyModal(false);
      setCopyStatus('idle');
      setCopyTargets([]);
    }, 2000);
  };

  useEffect(() => {
    const cleanup = initSupabaseListener();
    return cleanup || undefined;
  }, [initSupabaseListener]);

  const activePromosCount = promotions.filter((p) => p.isActive).length;

  const handleSaveRatingUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingUrl(inputRatingUrl);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleManualSync = async () => {
    await syncToSupabase();
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Bar with User Badge, Navigation & Logout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-4 border-b border-brand-gold/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-soft-charcoal">Dashboard Overview / لوحة التحكم</h2>
            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[11px] md:text-xs px-2.5 py-0.5 rounded-full font-bold">
              👤 {user}
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm">Real-time management for Rayahen Alexandria menu items, categories, promotions, and admin accounts.</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto items-stretch sm:items-center">
          {/* Global Branch Selector */}
          <div className="flex items-center bg-white border border-brand-gold/30 rounded-xl px-2 shadow-sm overflow-hidden w-full sm:w-auto shrink-0">
            <span className="text-xs font-bold text-gray-500 pl-2 whitespace-nowrap">الفرع:</span>
            <select
              value={adminBranch}
              onChange={(e) => setAdminBranch(e.target.value)}
              className="bg-transparent text-soft-charcoal text-xs md:text-sm py-2 pr-2 font-bold focus:outline-none cursor-pointer w-full"
            >
              <option value="all">الكل (الأساسي)</option>
              {AVAILABLE_BRANCHES.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Button Grid for Mobile */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
            <InstallPWAButton
              className="bg-brand-gold text-white hover:opacity-90 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer w-full"
            />

            {/* Guest Menu Navigation Link */}
            <a
              href={adminBranch !== 'all' ? `https://rayahen-menu-deploy.vercel.app/${adminBranch}` : 'https://rayahen-menu-deploy.vercel.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-pearl-white text-soft-charcoal border border-brand-gold/30 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 w-full"
            >
              <span>📱</span>
              <span>المنيو {adminBranch !== 'all' ? `- ${AVAILABLE_BRANCHES.find(b => b.id === adminBranch)?.name || adminBranch}` : ''}</span>
            </a>

            <button
              onClick={handleManualSync}
              disabled={lastSyncStatus === 'syncing'}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 w-full col-span-2 sm:col-span-1"
            >
              <span>{lastSyncStatus === 'syncing' ? '⌛' : '☁️'}</span>
              <span>{lastSyncStatus === 'syncing' ? 'جاري المزامنة...' : 'مزامنة السحابة'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('استعادة البيانات الافتراضية للمنيو والعروض والمنشورات؟')) {
                  resetToDefaults();
                }
              }}
              className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center w-full"
            >
              🔄 استعادة
            </button>

            {/* Copy Branch Settings Button */}
            <button
              onClick={() => { setCopySource('fawzy-moaz'); setCopyTargets([]); setShowCopyModal(true); }}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 w-full col-span-2 sm:col-span-1"
            >
              <span>📋</span>
              <span>نسخ إعدادات فرع</span>
            </button>

            <button
              onClick={onLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 w-full"
            >
              <span>🚪</span>
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Feedback */}
      {lastSyncStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 shadow-sm animate-in fade-in">
          <span>✅ تم حفظ البيانات في السحابة (Supabase) بنجاح! ستظهر في المنيو للعملاء فوراً.</span>
        </div>
      )}
      {lastSyncStatus === 'error' && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-xs font-bold mb-6 flex flex-col gap-1 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>❌ حدث خطأ أثناء الحفظ في السحابة (Supabase):</span>
          </div>
          <p className="font-mono text-[11px] bg-red-100 p-2 rounded border border-red-200 mt-1">{lastSyncError || 'تأكد من إعدادات Supabase أو صلاحيات الـ Rules'}</p>
        </div>
      )}

      {/* Branch Mode Banner */}
      {adminBranch !== 'all' && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl shadow-sm animate-in fade-in">
          <span className="text-xl">🏪</span>
          <div className="flex-1">
            <p className="font-bold text-sm">وضع الفرع المخصص: <span className="text-amber-700">{AVAILABLE_BRANCHES.find(b => b.id === adminBranch)?.name}</span></p>
            <p className="text-xs mt-0.5 text-amber-700">أي تعديل تقوم به الآن سيكون مخصصاً لهذا الفرع فقط ولن يؤثر على باقي الفروع.</p>
          </div>
          <button
            onClick={() => setAdminBranch('all')}
            className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            ← رجوع للكل
          </button>
        </div>
      )}

      {/* Rating System Link Integration Box */}
      <div className="bg-white border border-brand-gold/20 p-4 md:p-5 rounded-2xl mb-8 shadow-sm">
        <form onSubmit={handleSaveRatingUrl} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-soft-charcoal text-sm flex items-center gap-2">
              <span>⭐</span>
              <span>رابط نظام التقييم الخاص بك (Rating System Link)</span>
            </h4>
            <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
              ضع أي رابط لنظام التقييم الذي تملكه على جهازك أو على Vercel ليفتح فوراً عندما يضغط الزبون على زر التقييم.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="e.g. https://rayahen-rating.vercel.app"
              value={inputRatingUrl}
              onChange={(e) => setInputRatingUrl(e.target.value)}
              className="bg-pearl-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-soft-charcoal focus:outline-none focus:border-brand-gold w-full md:w-auto md:min-w-[260px]"
            />
            <button
              type="submit"
              className="bg-brand-gold text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm hover:opacity-90 whitespace-nowrap justify-center flex"
            >
              {savedMsg ? 'تم الحفظ ✓' : 'حفظ الرابط'}
            </button>
          </div>
        </form>
      </div>

      {/* Metric Cards (Responsive Grid: 2 cols on mobile, 3 on tablet, 5 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-3.5 md:p-5 rounded-2xl border border-brand-gold/20 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 text-[11px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Items / الأصناف</h3>
            <p className="text-lg md:text-2xl font-bold text-soft-charcoal font-heading">{menuItems.length}</p>
          </div>
          <span className="text-xl md:text-2xl">☕</span>
        </div>

        <div className="bg-white p-3.5 md:p-5 rounded-2xl border border-brand-gold/20 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 text-[11px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Categories / الأقسام</h3>
            <p className="text-lg md:text-2xl font-bold text-soft-charcoal font-heading">{categories.length - 1}</p>
          </div>
          <span className="text-xl md:text-2xl">📁</span>
        </div>

        <div className="bg-gradient-to-br from-brand-gold/15 via-amber-50 to-brand-gold/5 p-3.5 md:p-5 rounded-2xl border border-brand-gold/30 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-brand-gold text-[11px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Promos / العروض</h3>
            <p className="text-lg md:text-2xl font-bold text-brand-gold font-heading">{activePromosCount}</p>
          </div>
          <span className="text-xl md:text-2xl">🏷️</span>
        </div>

        <div className="bg-white p-3.5 md:p-5 rounded-2xl border border-brand-gold/20 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 text-[11px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Posts / الإعلانات</h3>
            <p className="text-lg md:text-2xl font-bold text-soft-charcoal font-heading">{announcements.length}</p>
          </div>
          <span className="text-xl md:text-2xl">📣</span>
        </div>

        <div className="bg-white p-3.5 md:p-5 rounded-2xl border border-brand-gold/20 shadow-sm flex justify-between items-center col-span-2 sm:col-span-1">
          <div>
            <h3 className="text-gray-500 text-[11px] md:text-xs font-bold uppercase tracking-wider mb-0.5">Admins / المديرين</h3>
            <p className="text-lg md:text-2xl font-bold text-soft-charcoal font-heading">{adminUsers.length}</p>
          </div>
          <span className="text-xl md:text-2xl">👤</span>
        </div>
      </div>

      {/* Navigation Tabs (Smooth horizontal scrolling on mobile, wrap on desktop) */}
      <div className="flex flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar gap-2 md:gap-3 mb-6 border-b border-brand-gold/15 pb-4">
        <button
          onClick={() => setActiveTab('menu')}
          className={`shrink-0 whitespace-nowrap px-3.5 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'menu'
              ? 'bg-brand-gold text-white shadow-md'
              : 'bg-white border border-brand-gold/20 text-gray-600 hover:text-brand-gold'
          }`}
        >
          <span>☕</span>
          <span>الأصناف ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`shrink-0 whitespace-nowrap px-3.5 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-brand-gold text-white shadow-md'
              : 'bg-white border border-brand-gold/20 text-gray-600 hover:text-brand-gold'
          }`}
        >
          <span>📁</span>
          <span>الأقسام ({categories.length - 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`shrink-0 whitespace-nowrap px-3.5 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'promotions'
              ? 'bg-brand-gold text-white shadow-md'
              : 'bg-white border border-brand-gold/20 text-gray-600 hover:text-brand-gold'
          }`}
        >
          <span>🏷️</span>
          <span>العروض ({promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`shrink-0 whitespace-nowrap px-3.5 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'announcements'
              ? 'bg-brand-gold text-white shadow-md'
              : 'bg-white border border-brand-gold/20 text-gray-600 hover:text-brand-gold'
          }`}
        >
          <span>📣</span>
          <span>الإعلانات ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`shrink-0 whitespace-nowrap px-3.5 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-brand-gold text-white shadow-md'
              : 'bg-white border border-brand-gold/20 text-gray-600 hover:text-brand-gold'
          }`}
        >
          <span>👥</span>
          <span>المديرين ({adminUsers.length})</span>
        </button>
      </div>

      {/* Active Tab Component Render */}
      <section className="mt-4 animate-in fade-in duration-200">
        {activeTab === 'menu' && <MenuItemsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'promotions' && <PromotionsManager />}
        {activeTab === 'announcements' && <AnnouncementsManager />}
        {activeTab === 'users' && <UsersManager />}
      </section>

      {/* Copy Branch Settings Modal */}
      {showCopyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCopyModal(false); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #fef9f0 0%, #fff8eb 100%)' }}
            >
              <div>
                <h3 className="font-heading font-bold text-lg text-soft-charcoal flex items-center gap-2">
                  <span>📋</span> نسخ إعدادات فرع إلى فروع أخرى
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  يتم نسخ حالات الإظهار/الإخفاء فقط — الأسعار والبيانات الأساسية لا تتغير أبداً
                </p>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Source Branch */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">📤 انسخ من فرع:</label>
                <select
                  value={copySource}
                  onChange={(e) => setCopySource(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-soft-charcoal focus:outline-none focus:border-brand-gold bg-pearl-white"
                >
                  {AVAILABLE_BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Branches */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  📥 طبّق على فروع: <span className="text-brand-gold">({copyTargets.length} مختار)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {AVAILABLE_BRANCHES.filter(b => b.id !== copySource).map(b => {
                    const selected = copyTargets.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        onClick={() => toggleCopyTarget(b.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-right ${
                          selected
                            ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border text-[10px] ${
                          selected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                        }`}>
                          {selected ? '✓' : ''}
                        </span>
                        {b.name}
                      </button>
                    );
                  })}
                </div>

                {/* Select All / Deselect All */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setCopyTargets(AVAILABLE_BRANCHES.filter(b => b.id !== copySource).map(b => b.id))}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >تحديد الكل</button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setCopyTargets([])}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                  >إلغاء التحديد</button>
                </div>
              </div>

              {/* Warning Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                <span className="font-bold">⚠️ ملاحظة:</span> سيتم استبدال إعدادات الإخفاء/الإظهار الحالية للفروع المختارة بإعدادات فرع <span className="font-bold">{AVAILABLE_BRANCHES.find(b => b.id === copySource)?.name}</span>. لا يمكن التراجع عن هذه العملية.
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >إلغاء</button>
              <button
                onClick={handleCopyBranch}
                disabled={!copyTargets.length || copyStatus === 'copying'}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  copyStatus === 'done'
                    ? 'bg-emerald-500 text-white'
                    : copyStatus === 'copying'
                    ? 'bg-blue-400 text-white opacity-80 cursor-wait'
                    : copyTargets.length
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {copyStatus === 'copying' && <span className="animate-spin">⌛</span>}
                {copyStatus === 'done' ? '✅ تم النسخ بنجاح!' : copyStatus === 'copying' ? 'جاري النسخ...' : `📋 نسخ إلى ${copyTargets.length} فرع`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

