"use client";
import React from 'react';
import { useMenuStore } from '@/store/useMenuStore';

export default function ActivityLogsManager() {
  const activityLogs = useMenuStore((state) => state.activityLogs);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'تسجيل دخول': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'إضافة صنف': return 'bg-green-100 text-green-700 border-green-200';
      case 'حذف صنف': return 'bg-red-100 text-red-700 border-red-200';
      case 'تعديل صنف': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'تعديل حالة فرع': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'تعديل حالة': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-brand-gold/20 rounded-2xl overflow-hidden shadow-sm font-body">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-pearl-white/50">
        <div>
          <h4 className="text-lg font-bold text-soft-charcoal">سجل النشاطات (Activity Logs)</h4>
          <p className="text-sm text-gray-500">مراقبة التعديلات وعمليات الدخول التي تتم في لوحة التحكم</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-right">المستخدم</th>
              <th className="p-4 font-semibold text-right">الحدث</th>
              <th className="p-4 font-semibold text-right w-1/2">التفاصيل</th>
              <th className="p-4 font-semibold text-left">التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {(!activityLogs || activityLogs.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  لا توجد نشاطات مسجلة حتى الآن
                </td>
              </tr>
            )}
            {activityLogs && activityLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-right font-bold text-soft-charcoal">
                  {log.username}
                </td>
                <td className="p-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-600 truncate max-w-sm" dir="rtl">
                  {log.details}
                </td>
                <td className="p-4 text-left text-gray-500 text-xs font-mono" dir="ltr">
                  {formatDate(log.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
