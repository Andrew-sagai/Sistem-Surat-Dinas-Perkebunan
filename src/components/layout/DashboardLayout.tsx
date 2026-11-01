'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { routePermissions } from '@/lib/rbac';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, isHydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Tunggu pemulihan sesi Auth dan profil sebelum menentukan rute.
    if (!isHydrated) return;

    if (!state.currentUser) {
      router.push('/login');
      return;
    }

    // Route guard client-side
    const rootPath = `/${pathname.split('/')[1]}`;
    const allowedRoles = routePermissions[rootPath];
    if (allowedRoles && !allowedRoles.includes(state.currentUser.role)) {
      router.push('/403');
    }
  }, [state.currentUser, isHydrated, router, pathname]);

  // Tampilkan null selama hydration berlangsung atau currentUser belum ada.
  // Ini mencegah flash redirect dan rendering layout tanpa user.
  if (!isHydrated || !state.currentUser) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
