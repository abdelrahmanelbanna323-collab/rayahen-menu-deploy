"use client";
import React, { useState } from 'react';
import { useMenuStore, AdminUser } from '@/store/useMenuStore';

export default function UsersManager() {
  const adminUsers = useMenuStore((state) => state.adminUsers);
  const addAdminUser = useMenuStore((state) => state.addAdminUser);
  const updateAdminUser = useMenuStore((state) => state.updateAdminUser);
  const deleteAdminUser = useMenuStore((state) => state.deleteAdminUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'MANAGER'>('MANAGER');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('MANAGER');
    setEditingUserId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    if (editingUserId) {
      updateAdminUser(editingUserId, {
        username,
        passwordHash: password,
        role,
      });
    } else {
      const newUser: AdminUser = {
        id: Date.now().toString(),
        username,
        passwordHash: password,
        role,
      };
      addAdminUser(newUser);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEditClick = (user: AdminUser) => {
    setEditingUserId(user.id);
    setUsername(user.username);
    setPassword(user.passwordHash);
    setRole(user.role);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white border border-brand-gold/20 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-pearl-white/50">
        <div>
          <h4 className="text-lg font-bold text-soft-charcoal">Admin Accounts & Passwords / إدارة حسابات المديرين وكلمات السر</h4>
          <p className="text-sm text-gray-500">Create, edit usernames/passwords, or manage admin credentials.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 hover:opacity-90 active:scale-95 text-sm"
        >
          + Add New Admin User / إضافة مدير جديد
        </button>
      </div>

      <div className="p-0 overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Username / اسم المستخدم</th>
              <th className="p-4 font-semibold">Password / كلمة السر</th>
              <th className="p-4 font-semibold">Role / الصلاحية</th>
              <th className="p-4 font-semibold text-right">Actions / إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {adminUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/60 transition">
                <td className="p-4 font-bold text-soft-charcoal flex items-center gap-2">
                  <span>👤</span>
                  <span>{user.username}</span>
                </td>
                <td className="p-4 text-gray-500 font-mono">
                  •••••••• ({user.passwordHash})
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'SUPER_ADMIN'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-brand-gold hover:underline font-bold text-xs"
                  >
                    Edit / تعديل
                  </button>
                  {adminUsers.length > 1 && (
                    <button
                      onClick={() => deleteAdminUser(user.id)}
                      className="text-red-500 hover:underline font-bold text-xs"
                    >
                      Delete / حذف
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List for Admin Users (Zero Horizontal Scrolling, Zero Truncation!) */}
      <div className="block md:hidden p-3 space-y-3.5 bg-gray-50/70">
        {adminUsers.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-11 h-11 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">👤</span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-bold text-soft-charcoal text-base leading-snug break-words">{user.username}</p>
                  <p className="text-xs text-gray-500 font-mono break-words">•••••••• ({user.passwordHash})</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 shadow-2xs ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400 font-medium">إدارة الحساب:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditClick(user)}
                  className="bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  <span>✏️</span>
                  <span>تعديل</span>
                </button>
                {adminUsers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteAdminUser(user.id)}
                    className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <span>🗑️</span>
                    <span>حذف</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-pearl-white border border-brand-gold/30 p-6 rounded-2xl w-full max-w-md shadow-2xl text-soft-charcoal">
            <h3 className="text-xl font-bold text-brand-gold mb-4">
              {editingUserId ? 'Edit Admin User / تعديل بيانات المدير' : 'Add New Admin Account / إضافة مدير جديد'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Username / اسم المستخدم (للتسجيل)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. manager1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Password / كلمة السر الجديدة</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Role / الصلاحية</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                >
                  <option value="MANAGER">MANAGER (مدير فرع)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (مدير عام)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-200 transition text-sm"
              >
                Cancel / إلغاء
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 text-sm"
              >
                {editingUserId ? 'Save Changes / حفظ التعديلات' : 'Create Account / إنشاء الحساب'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
