import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';
import { randomUUID } from 'node:crypto';

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const nama = process.env.ADMIN_NAMA?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!url || !key || !email || !nama || !password) {
    throw new Error('Isi NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_NAMA, dan ADMIN_PASSWORD di .env.local.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ADMIN_EMAIL tidak valid.');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD minimal 12 karakter.');

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: existing, error: checkError } = await client.from('users').select('id').eq('role', 'admin').eq('aktif', true).not('auth_id', 'is', null).limit(1);
  if (checkError) throw checkError;
  if (existing.length) throw new Error('Administrator aktif sudah ada. Kelola akun berikutnya melalui menu Pengguna.');
  const { data: profile, error: profileError } = await client.from('users').select('id').eq('email', email).maybeSingle();
  if (profileError) throw profileError;
  if (profile) throw new Error('Email sudah memiliki profil. Periksa akun tersebut melalui Dashboard Supabase.');

  // createUser menolak email yang sudah ada; skrip tidak mengganti sandi akun lama.
  const { data: auth, error: authError } = await client.auth.admin.createUser({ email, password, email_confirm: true });
  if (authError) throw authError;
  const { error: insertError } = await client.from('users').insert({
    id: `u-${randomUUID()}`, auth_id: auth.user.id, nama, email, role: 'admin', unit_kerja_id: null, aktif: true,
  });
  if (insertError) {
    const { error: rollbackError } = await client.auth.admin.deleteUser(auth.user.id);
    if (rollbackError) console.error('Akun Auth belum tertaut. Periksa Authentication di Dashboard Supabase sebelum mencoba lagi.');
    throw insertError;
  }
  console.log('Administrator berhasil dibuat. Login dengan akun yang Anda tentukan, lalu buat akun pegawai melalui menu Pengguna.');
  console.log('Hapus ADMIN_PASSWORD dari .env.local setelah selesai.');
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
