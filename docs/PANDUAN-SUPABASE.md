# Supabase untuk akun nyata

Aplikasi menggunakan Supabase Auth, Postgres, dan Storage. Konfigurasi kosong
menonaktifkan login; aplikasi tidak kembali ke akun demo atau data localStorage.

## Penyiapan proyek baru

1. Buat proyek Supabase milik instansi.
2. Salin `.env.example` menjadi `.env.local`. Isi URL proyek, anon/publishable key,
   service role key, dan `DATABASE_URL`. Simpan service role key hanya di server.
3. Jalankan `npm run check:migrasi` untuk memeriksa SQL secara lokal.
4. Jalankan `npm run supabase:migrate` untuk memasang skema pada proyek tujuan.
5. Isi `ADMIN_EMAIL`, `ADMIN_NAMA`, dan `ADMIN_PASSWORD` dengan akun administrator
   asli. Gunakan kata sandi minimal 12 karakter. Jalankan `npm run supabase:buat-admin`.
6. Hapus `ADMIN_PASSWORD` dari `.env.local`, lalu jalankan `npm run dev`.
7. Masuk sebagai administrator dan tambahkan pegawai melalui menu Pengguna.
   Tentukan peran, unit kerja, serta kata sandi masing-masing akun.

Skrip administrator hanya membuat akun baru ketika belum ada administrator aktif
yang tertaut ke Auth. Skrip tidak mengganti kata sandi akun lama. Pembuatan akun
menggunakan [API admin Supabase](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
dari server. Akun yang dibuat administrator dikonfirmasi tanpa email verifikasi;
pastikan alamat email dan pemilik akun benar sebelum membuatnya.

Pada menu Pengguna, reset kata sandi mengatur kata sandi baru melalui Supabase Auth.
Administrator menyampaikan kata sandi tersebut kepada pemilik akun melalui saluran
pribadi. Tidak ada simulasi pengiriman email untuk reset sandi.

Notifikasi tersedia di dalam aplikasi. Integrasi pengiriman email belum tersedia;
endpoint email mengembalikan status gagal, bukan laporan pengiriman simulasi.

## Migrasi yang dipertahankan

| Berkas | Fungsi |
|---|---|
| `0001_schema.sql` | Tabel dan relasi |
| `0002_rls.sql` | Pembatasan akses data dan bucket privat |
| `0003_rpc.sql` | Proses bisnis, penomoran, disposisi, persetujuan, dan arsip |
| `0004_seed_domain.sql` | Data master awal, tanpa akun demo |
| `0006_cron.sql` | Penjadwalan pengingat |

Nomor `0005` sengaja tidak dipakai lagi karena berisi surat contoh. Instalasi baru
memiliki data master, tetapi pengguna dan transaksi surat masih kosong. Tinjau nama
instansi, unit kerja, klasifikasi, dan data master sebelum penggunaan operasional.

`perbaiki-policy-storage.sql` tetap tersedia untuk proyek dengan policy Storage lama.
`reset_data_surat.sql` adalah alat pengosongan transaksi, bukan langkah instalasi;
jangan jalankan pada data operasional yang masih diperlukan.

## Jika proyek sebelumnya memakai demo

Perubahan berkas lokal tidak menghapus akun Auth atau baris yang sudah tersimpan
di Supabase. Jangan menjalankan reset seluruh data untuk sekadar menghapus demo.
Periksa akun dan relasi surat terlebih dahulu. Nonaktifkan akun demo yang masih
terkait riwayat; hapus akun/data contoh hanya setelah memastikan tidak ada transaksi
nyata yang menggunakannya. Cadangkan database sebelum pembersihan tersebut.

Untuk proyek yang sudah mempunyai admin demo aktif, buat admin asli melalui menu
Pengguna terlebih dahulu, uji login admin asli, lalu nonaktifkan admin demo. Skrip
bootstrap memang menolak membuat admin tambahan ketika admin aktif sudah ada.

Riwayat migrasi lama di `_migrasi_log` tetap dipertahankan. Tidak perlu menghapus
entri `0005` atau menjalankan ulang seluruh migrasi menggunakan `--force`.

## Pengingat dan pemeriksaan

Aktifkan extension `pg_cron` bila tersedia sebelum memasang `0006`. Alternatifnya,
jadwalkan route `/api/cron/reminder` dengan rahasia `CRON_SECRET`.

Jalankan `npm run check:migrasi`, `npm run test:matriks`, `npm run test:nav`,
dan `npm run test:skenario` untuk pemeriksaan lokal. Skrip uji online lama yang
mengandalkan kata sandi dan ID demo telah dihapus; pengujian Auth/Storage nyata
perlu dilakukan pada proyek uji terpisah dengan akun yang Anda siapkan.

Jika login gagal, periksa konfigurasi, hasil migrasi, keberadaan akun di Authentication,
`public.users.auth_id`, dan status `aktif`. Setelah mengubah variabel `NEXT_PUBLIC_*`,
restart server pengembangan atau build ulang deployment.
