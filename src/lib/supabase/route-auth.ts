import { NextResponse } from 'next/server';
import { getSupabaseServer } from './server';

export async function requireSession() {
  const client = await getSupabaseServer();
  if (!client) return { response: NextResponse.json({ galat: 'Layanan belum dikonfigurasi.' }, { status: 503 }) };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { response: NextResponse.json({ galat: 'Anda harus login.' }, { status: 401 }) };
  const { data: profile } = await client.from('users').select('id, role, aktif').eq('auth_id', data.user.id).maybeSingle();
  if (!profile?.aktif) return { response: NextResponse.json({ galat: 'Akun tidak memiliki akses.' }, { status: 403 }) };
  return { client, profile };
}
