import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/route-auth';
import { keSuratKeluar } from '@/lib/data/mappers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  const session = await requireSession();
  if (session.response) return session.response;
  let query = session.client.from('surat_keluar').select('*');
  if (status) query = query.eq('status', status);
  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ galat: 'Gagal memuat surat keluar.' }, { status: 500 });
  const data = (rows ?? []).map(keSuratKeluar);

  return NextResponse.json({
    success: true,
    total: data.length,
    data,
  });
}
