import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/route-auth';
import { keDataMaster } from '@/lib/data/mappers';

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (session.response) return session.response;
  const kategori = request.nextUrl.searchParams.get('kategori');
  let query = session.client.from('data_master').select('*').order('urutan');
  if (kategori) query = query.eq('kategori', kategori);
  if (request.nextUrl.searchParams.get('aktif') !== 'false') query = query.eq('aktif', true);
  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ galat: 'Gagal memuat data master.' }, { status: 500 });
  const data = (rows ?? []).map(keDataMaster);
  return NextResponse.json({ success: true, data, total: data.length, kategori: kategori || 'semua' });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (session.response) return session.response;
  if (session.profile.role !== 'admin') return NextResponse.json({ galat: 'Akses ditolak.' }, { status: 403 });
  try {
    const body = await request.json();
    const { data, error } = await session.client.rpc('rpc_tambah_data_master', {
      p_kategori: body.kategori, p_kode: body.kode, p_label: body.label,
      p_keterangan: body.keterangan ?? '', p_urutan: body.urutan ?? 1, p_meta: body.meta ?? {},
    });
    if (error) return NextResponse.json({ galat: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ galat: 'Format permintaan tidak valid.' }, { status: 400 });
  }
}
