import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/route-auth';

export async function POST() {
  const session = await requireSession();
  if (session.response) return session.response;
  return NextResponse.json({
    success: false,
    kanal: 'email',
    statusKirim: 'gagal',
    pesanGalat: 'Pengiriman email belum tersedia. Notifikasi dapat dibaca melalui aplikasi.',
  }, { status: 501 });
}
