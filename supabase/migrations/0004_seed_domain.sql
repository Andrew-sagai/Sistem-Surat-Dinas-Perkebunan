-- Data master awal; akun dibuat melalui Supabase Auth.
INSERT INTO public.pengaturan_instansi (id, nama_pemda, nama_instansi, alamat, telp_fax, logo_path, updated_at)
VALUES ('pengaturan-1',
        'PEMERINTAH KABUPATEN MINAHASA SELATAN',
        'DINAS PERTANIAN',
        'Jl. Trans Sulawesi Kel. Pondang Kecamatan Amurang Timur',
        'Telp/ Fax : (0430) 22589',
        '/logo.png', now())
ON CONFLICT (id) DO UPDATE SET
  nama_pemda    = EXCLUDED.nama_pemda,
  nama_instansi = EXCLUDED.nama_instansi,
  alamat        = EXCLUDED.alamat,
  telp_fax      = EXCLUDED.telp_fax,
  logo_path     = EXCLUDED.logo_path,
  updated_at    = now();

-- ── Unit Kerja ──────────────────────────────────────────────────────────────
INSERT INTO public.unit_kerja (id, kode, nama, jenis, label_lembar, urutan_lembar, aktif, created_at, updated_at) VALUES
 ('uk-1','SEKR',   'Sekretariat',                                'sekretariat','Sekretaris',                                       1, true, now(), now()),
 ('uk-6','BID-PTN','Bidang Peternakan dan Kesehatan Hewan',       'bidang',     'Ka. Bid. Peternakan dan Kesehatan Hewan',             2, true, now(), now()),
 ('uk-3','BID-TPH','Bidang Tanaman Pangan dan Hortikultura',      'bidang',     'Ka. Bid. Tanaman Pangan dan Hortikultura',            3, true, now(), now()),
 ('uk-4','BID-SP', 'Bidang Prasarana dan Sarana Pertanian',      'bidang',     'Ka. Bid. Prasarana dan Sarana Pertanian',            4, true, now(), now()),
 ('uk-2','BID-PK', 'Bidang Perkebunan',                          'bidang',     'Ka. Bid. Perkebunan',                                5, true, now(), now()),
 ('uk-5','BID-PYL','Bidang Penyuluhan Pertanian',               'bidang',     'Ka. Bid. Penyuluhan Pertanian',                      6, true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  kode = EXCLUDED.kode, nama = EXCLUDED.nama, jenis = EXCLUDED.jenis,
  label_lembar = EXCLUDED.label_lembar, urutan_lembar = EXCLUDED.urutan_lembar,
  updated_at = now();

-- ── Jenis Surat ─────────────────────────────────────────────────────────────
INSERT INTO public.jenis_surat (id, nama, keterangan, utama, aktif, created_at, updated_at) VALUES
 ('js-1','Pemberitahuan','Menyampaikan pemberitahuan atau informasi resmi kedinasan kepada pihak terkait',        true,  true, now(), now()),
 ('js-2','Permintaan',   'Meminta data, informasi, keterangan, atau dukungan administratif dan teknis',          false, true, now(), now()),
 ('js-3','Undangan',     'Mengundang pihak lain untuk menghadiri rapat, pertemuan, atau acara kedinasan',          true,  true, now(), now()),
 ('js-4','Penugasan',    'Memberikan tugas kedinasan atau perintah pelaksanaan tugas kepada pejabat/staf',        true,  true, now(), now()),
 ('js-5','Keputusan',    'Menetapkan kebijakan, ketetapan hukum administratif, atau pembentukan tim/kegiatan dinas',true,  true, now(), now()),
 ('js-6','Sertifikat',   'Tanda bukti pengakuan, kelulusan, atau kepemilikan kompetensi/hak bidang pertanian',    false, true, now(), now()),
 ('js-7','Pengantar',    'Mengantarkan naskah, berkas, dokumen, atau barang dinas kepada instansi tujuan',        false, true, now(), now()),
 ('js-8','Edaran',       'Menyampaikan petunjuk, arahan, atau ketentuan umum persuratan kepada banyak pihak',     false, true, now(), now()),
 ('js-9','Rekomendasi',  'Memberikan pertimbangan, persetujuan teknis, atau dukungan kelayakan operasional dinas',false, true, now(), now()),
 ('js-10','Laporan',     'Menyampaikan laporan berkala, pertanggungjawaban kegiatan, atau hasil pelaksanaan tugas dinas', false, true, now(), now()),
 ('js-11','Lainnya',     'Jenis naskah dinas lainnya yang sah menurut tata naskah dinas',                           false, true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama, keterangan = EXCLUDED.keterangan, utama = EXCLUDED.utama,
  updated_at = now();

-- ── Klasifikasi Surat ───────────────────────────────────────────────────────
INSERT INTO public.klasifikasi_surat (id, kode, nama, uraian, unit_kerja_id, aktif, created_at, updated_at) VALUES
 ('kl-1','5.20','Urusan Umum/Kepegawaian',   NULL, 'uk-1', true, now(), now()),
 ('kl-2','5.22','Bidang Tanaman Pangan',      NULL, 'uk-3', true, now(), now()),
 ('kl-3','800','Kepegawaian/Umum',            NULL, 'uk-1', true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  kode = EXCLUDED.kode, nama = EXCLUDED.nama, unit_kerja_id = EXCLUDED.unit_kerja_id,
  updated_at = now();

-- ── Data Master Terpadu ─────────────────────────────────────────────────────
INSERT INTO public.data_master (id, kategori, kode, label, keterangan, aktif, urutan, meta, created_at, updated_at) VALUES
 ('dm-sifat-1','sifat_surat','biasa','Biasa','Surat dinas rutin, penyelesaian berjangka wajar',true,1,'{}'::jsonb,now(),now()),
 ('dm-sifat-2','sifat_surat','umum','Umum/Pemberitahuan','Pengumuman umum atau edaran terbuka',true,2,'{}'::jsonb,now(),now()),
 ('dm-sifat-3','sifat_surat','penting','Penting','Perlu perhatian pimpinan, harus diselesaikan tepat waktu',true,3,'{}'::jsonb,now(),now()),
 ('dm-sifat-4','sifat_surat','segera','Segera','Wajib ditindaklanjuti pada hari yang sama atau batas waktu ketat',true,4,'{}'::jsonb,now(),now()),
 ('dm-sifat-5','sifat_surat','rahasia','Rahasia','Dokumen tertutup, akses terbatas bagi pihak berwenang',true,5,'{}'::jsonb,now(),now()),
 ('dm-inst-1','jenis_instruksi','tanggapan_saran','Tanggapan dan Saran','Memberikan telaah, tanggapan tertulis, dan masukan teknis',true,1,'{}'::jsonb,now(),now()),
 ('dm-inst-2','jenis_instruksi','proses_lanjut','Proses Lebih Lanjut','Menindaklanjuti secara administratif atau operasional sesuai ketentuan',true,2,'{}'::jsonb,now(),now()),
 ('dm-inst-3','jenis_instruksi','koordinasi_konfirmasi','Koordinasi / Konfirmasi','Melakukan koordinasi lintas unit/bidang atau konfirmasi ke instansi pengirim',true,3,'{}'::jsonb,now(),now()),
 ('dm-inst-4','jenis_instruksi','selesaikan_segera','Selesaikan Segera','Penyelesaian prioritas tinggi dalam kurun waktu 1x24 jam',true,4,'{}'::jsonb,now(),now()),
 ('dm-inst-5','jenis_instruksi','hadiri_wakili','Hadiri / Wakili','Menghadiri undangan atau mewakili pimpinan dinas pada kegiatan',true,5,'{}'::jsonb,now(),now()),
 ('dm-inst-6','jenis_instruksi','arsipkan','Simpan / Arsipkan','Disimpan sebagai dokumen dokumentasi dan bahan informasi dinas',true,6,'{}'::jsonb,now(),now()),
 ('dm-inst-7','jenis_instruksi','lainnya','Lainnya (Isian Bebas)','Instruksi khusus yang diuraikan secara spesifik oleh pimpinan',true,7,'{}'::jsonb,now(),now()),
 ('dm-instansi-1','instansi_asal','SETDA-MINSEL','Sekretariat Daerah Kabupaten Minahasa Selatan','Pemerintah Kabupaten Minahasa Selatan',true,1,'{}'::jsonb,now(),now()),
 ('dm-instansi-2','instansi_asal','DISTAN-SULUT','Dinas Pertanian dan Peternakan Provinsi Sulawesi Utara','Pemerintah Provinsi Sulawesi Utara',true,2,'{}'::jsonb,now(),now()),
 ('dm-instansi-3','instansi_asal','KEMENTAN-RI','Kementerian Pertanian Republik Indonesia','Instansi Pemerintah Pusat',true,3,'{}'::jsonb,now(),now()),
 ('dm-instansi-4','instansi_asal','BPP-AMURANG','Balai Penyuluhan Pertanian (BPP) Amurang','Unit Pelaksana Teknis Penyuluhan Lapangan',true,4,'{}'::jsonb,now(),now()),
 ('dm-instansi-5','instansi_asal','BPS-MINSEL','Badan Pusat Statistik Kabupaten Minahasa Selatan','Instansi Vertikal mitra statistik pangan',true,5,'{}'::jsonb,now(),now()),
 ('dm-instansi-6','instansi_asal','DPRD-MINSEL','Dewan Perwakilan Rakyat Daerah Kabupaten Minahasa Selatan','Lembaga Legislatif Daerah',true,6,'{}'::jsonb,now(),now()),
 ('dm-instansi-7','instansi_asal','POKTAN-MAESA','Kelompok Tani Maesa Jaya Amurang Barat','Organisasi Gabungan Kelompok Tani binaan dinas',true,7,'{}'::jsonb,now(),now())
ON CONFLICT (kategori, kode) DO UPDATE SET
  label = EXCLUDED.label, keterangan = EXCLUDED.keterangan, urutan = EXCLUDED.urutan,
  updated_at = now();
