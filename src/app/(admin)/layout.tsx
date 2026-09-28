import React from 'react';
import type { Metadata } from "next";
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: "Rayahen Admin | Dashboard",
  description: "Rayahen Alexandria Dashboard",
  manifest: '/manifest-admin.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rayahen Admin',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-body" style={{ background: '#FAF8F3' }}>
      <AdminSidebar />
      {/* Main Content */}
      <main
        className="flex-1 p-8 overflow-y-auto"
        style={{ background: '#FAF8F3' }}
      >
        {children}
      </main>
    </div>
  );
}
