import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/route-auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (session.response) return session.response;
  if (session.profile.role !== 'admin') return NextResponse.json({ galat: 'Akses ditolak.' }, { status: 403 });
  const admin = await getSupabaseAdmin();
  if (!admin) return NextResponse.json({ galat: 'Konfigurasi administrator belum lengkap.' }, { status: 503 });
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const nama = String(body.nama ?? '').trim();
    const password = String(body.password ?? '');
    if (!nama || !email || password.length < 12) return NextResponse.json({ galat: 'Nama, email, dan kata sandi minimal 12 karakter wajib diisi.' }, { status: 400 });
    const { data: auth, error: authError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (authError) return NextResponse.json({ galat: authError.message }, { status: 400 });

    const { data: profile, error: profileError } = await session.client.rpc('rpc_tambah_pengguna', {
      p_nama: nama, p_email: email, p_role: body.role, p_unit_kerja_id: body.unitKerjaId ?? null,
    });
    if (profileError) {
      const { error: rollback } = await admin.auth.admin.deleteUser(auth.user.id);
      return NextResponse.json({ galat: rollback ? 'Profil gagal dibuat dan akun Auth belum dibersihkan. Hubungi pengelola Supabase.' : profileError.message }, { status: 400 });
    }
    const { data: linked, error: linkError } = await admin.from('users').update({ auth_id: auth.user.id }).eq('id', profile.id).select('id').single();
    if (linkError || !linked) {
      const { error: profileCleanup } = await admin.from('users').delete().eq('id', profile.id).is('auth_id', null);
      const { error: authCleanup } = await admin.auth.admin.deleteUser(auth.user.id);
      return NextResponse.json({ galat: profileCleanup || authCleanup ? 'Penautan akun gagal. Periksa profil dan Auth di Supabase sebelum mencoba lagi.' : 'Penautan akun gagal. Silakan coba lagi.' }, { status: 500 });
    }
    return NextResponse.json({ sukses: true, data: { id: profile.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ galat: 'Gagal membuat akun. Periksa format data dan koneksi server.' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (session.response) return session.response;
  if (session.profile.role !== 'admin') return NextResponse.json({ galat: 'Akses ditolak.' }, { status: 403 });
  const admin = await getSupabaseAdmin();
  if (!admin) return NextResponse.json({ galat: 'Konfigurasi administrator belum lengkap.' }, { status: 503 });
  try {
    const body = await request.json();
    const { data: target, error } = await admin.from('users').select('id, email, auth_id').eq('id', body.userId).single();
    if (error || !target?.auth_id) return NextResponse.json({ galat: 'Akun Auth pengguna tidak ditemukan.' }, { status: 404 });
    const email = String(body.email ?? '').trim().toLowerCase();
    const changed = email !== target.email;
    if (changed) {
      const { error: authError } = await admin.auth.admin.updateUserById(target.auth_id, { email, email_confirm: true });
      if (authError) return NextResponse.json({ galat: authError.message }, { status: 400 });
    }
    const { error: updateError } = await session.client.rpc('rpc_ubah_pengguna', {
      p_user_id: target.id, p_nama: body.nama, p_email: email, p_role: body.role, p_unit_kerja_id: body.unitKerjaId ?? null,
    });
    if (updateError) {
      if (changed) {
        const { error: rollback } = await admin.auth.admin.updateUserById(target.auth_id, { email: target.email, email_confirm: true });
        if (rollback) return NextResponse.json({ galat: 'Profil gagal diperbarui. Email Auth perlu diselaraskan oleh pengelola Supabase.' }, { status: 500 });
      }
      return NextResponse.json({ galat: updateError.message }, { status: 400 });
    }
    return NextResponse.json({ sukses: true });
  } catch {
    return NextResponse.json({ galat: 'Gagal memperbarui akun.' }, { status: 400 });
  }
}
