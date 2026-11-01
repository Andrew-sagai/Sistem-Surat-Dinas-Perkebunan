'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function Home() {
  const { state, isHydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (state.currentUser) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [state.currentUser, isHydrated, router]);

  return null;
}
