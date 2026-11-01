'use client';
import { useMemo } from 'react';
import { useStore } from './store';
import type { Konteks } from './data/mutasi';
import * as mutasi from './data/mutasi';
import type {
  InstruksiDisposisi,
  JenisInstruksi,
  KategoriDataMaster,
  SifatSurat,
  SuratKeluar,
  SuratMasuk,
  UserRole,
} from './types';

export function useBusinessLogic() {
  const store = useStore();

  const ctx = useMemo<Konteks>(
    () => ({
      penggunaId: store.state.currentUser?.id ?? '',
      authId: store.authUser?.id ?? store.state.currentUser?.authId ?? '',
      email: store.authUser?.email ?? store.state.currentUser?.email ?? '',
      muatUlang: store.refresh,
    }),
    [store.state.currentUser, store.authUser, store.refresh]
  );

  // ── Surat masuk ─────────────────────────────────────────
  const apiCatatSuratMasuk = async (
    data: Partial<SuratMasuk>,
    file: File | null
  ): Promise<string> => {
    return mutasi.catatSuratMasuk(ctx, data, file);
  };

  // ── Disposisi ───────────────────────────────────────────
  const apiBuatDisposisi = async (suratMasukId: string): Promise<string> => {
    return mutasi.buatDisposisi(ctx, suratMasukId);
  };

  const apiBeriDisposisi = async (
    dispId: string,
    instruksi: JenisInstruksi,
    bidangTujuanIds: string[],
    catatan: string,
    tenggat: string,
    instruksiLainnya?: string,
    instruksiList?: InstruksiDisposisi[],
    sifat?: SifatSurat
  ): Promise<void> => {
      return mutasi.beriDisposisi(
        ctx,
        dispId,
        instruksi,
        bidangTujuanIds,
        catatan,
        tenggat,
        instruksiLainnya,
        instruksiList,
        sifat
      );
  };

  const apiTerimaDisposisi = async (dispId: string): Promise<void> => {
    return mutasi.terimaDisposisi(ctx, dispId);
  };

  const apiTeruskanKeStaf = async (
    dispId: string,
    stafId: string,
    catatanPenugasan: string
  ): Promise<void> => {
    return mutasi.teruskanKeStaf(ctx, dispId, stafId, catatanPenugasan);
  };

  const apiTindakLanjutLangsung = async (
    dispId: string,
    uraianHasil: string,
    file: File | null,
    perluSuratJawaban: boolean = false
  ): Promise<void> => {
      return mutasi.tindakLanjutLangsung(ctx, dispId, uraianHasil, file, perluSuratJawaban);
  };

  const apiSimpanProgres = async (dispId: string, catatanProgres: string): Promise<void> => {
    return mutasi.simpanProgres(ctx, dispId, catatanProgres);
  };

  const apiLaporkanHasil = async (
    dispId: string,
    uraianHasil: string,
    file: File | null
  ): Promise<void> => {
    return mutasi.laporkanHasil(ctx, dispId, uraianHasil, file);
  };

  const apiPeriksaLaporan = async (
    tlId: string,
    setuju: boolean,
    catatan: string,
    perluSuratJawaban: boolean = false
  ): Promise<void> => {
      return mutasi.periksaLaporan(ctx, tlId, setuju, catatan, perluSuratJawaban);
  };

  const apiBeriCatatanSekdis = async (dispId: string, catatan: string): Promise<void> => {
    return mutasi.beriCatatanSekdis(ctx, dispId, catatan);
  };

  const apiBubuhkanParaf = async (dispId: string): Promise<void> => {
    return mutasi.bubuhkanParaf(ctx, dispId);
  };

  const apiTidakPerluDisposisi = async (dispId: string, catatan: string): Promise<void> => {
    return mutasi.tidakPerluDisposisi(ctx, dispId, catatan);
  };

  // ── Surat keluar ────────────────────────────────────────
  const apiAjukanSuratKeluar = async (
    data_: Partial<SuratKeluar>,
    asDraft: boolean = false
  ): Promise<string> => {
    return mutasi.ajukanSuratKeluar(ctx, data_, asDraft);
  };

  const apiParafKoordinasi = async (
    skId: string,
    setuju: boolean,
    catatan: string
  ): Promise<void> => {
    return mutasi.parafKoordinasi(ctx, skId, setuju, catatan);
  };

  const apiTandatanganSurat = async (skId: string, passwordConfirm: string): Promise<void> => {
    return mutasi.tandatanganSurat(ctx, skId, passwordConfirm);
  };

  const apiTolakSuratKeluar = async (skId: string, catatan: string): Promise<void> => {
    return mutasi.tolakSuratKeluar(ctx, skId, catatan);
  };

  const apiTerbitkanNomorSurat = async (skId: string): Promise<string> => {
    return mutasi.terbitkanNomorSurat(ctx, skId);
  };

  const apiDokumentasikanDanKirimSuratKeluar = async (
    skId: string,
    tanggalKirim: string,
    file: File | null
  ): Promise<void> => {
    return mutasi.kirimSuratKeluar(ctx, skId, tanggalKirim, file);
  };

  const apiBuktiTerima = async (
    skId: string,
    tanggalDiterima: string,
    namaPenerima: string
  ): Promise<void> => {
    return mutasi.buktiTerima(ctx, skId, tanggalDiterima, namaPenerima);
  };

  // ── Arsip ───────────────────────────────────────────────
  const apiVerifikasiArsip = async (arsipId: string): Promise<void> => {
    return mutasi.verifikasiArsip(ctx, arsipId);
  };

  const apiKoreksiMetadataArsip = async (
    arsipId: string,
    perihalBaru: string | null,
    klasifikasiIdBaru: string | null,
    alasan: string
  ): Promise<void> => {
      return mutasi.koreksiMetadataArsip(ctx, arsipId,perihalBaru, klasifikasiIdBaru, alasan);
  };

  // ── Pengguna ────────────────────────────────────────────
  const apiTambahPengguna = async (
    nama: string,
    email: string,
    role: UserRole,
    unitKerjaId?: string | null,
    password?: string
  ): Promise<void> => {
    return mutasi.tambahPengguna(ctx, nama, email, role, unitKerjaId, password);
  };

  const apiUbahPengguna = async (
    userId: string,
    payload: { nama: string; email: string; role: UserRole; unitKerjaId?: string | null }
  ): Promise<void> => {
    return mutasi.ubahPengguna(ctx, userId, payload);
  };

  const apiTogglePengguna = async (userId: string): Promise<void> => {
    return mutasi.togglePengguna(ctx, userId);
  };

  const apiResetPassword = async (targetUserId: string, newPassword?: string): Promise<string> => {
    return mutasi.resetPassword(ctx, targetUserId, newPassword);
  };

  // ── Tanda tangan digital ────────────────────────────────
  const apiUploadTandaTangan = async (userId: string, dataUrl: string): Promise<void> => {
    return mutasi.uploadTandaTangan(ctx, userId, dataUrl);
  };

  const apiHapusTandaTangan = async (userId: string): Promise<void> => {
    return mutasi.hapusTandaTangan(ctx, userId);
  };

  // ── Data master ─────────────────────────────────────────
  const apiTambahUnitKerja = async (
    kode: string,
    nama: string,
    labelLembar?: string,
    urutanLembar?: number,
    jenis: 'sekretariat' | 'bidang' = 'bidang'
  ): Promise<void> => {
      return mutasi.tambahUnitKerja(ctx, kode, nama, labelLembar, urutanLembar, jenis);
  };

  const apiUbahUnitKerja = async (
    id: string,
    payload: { nama: string; kode?: string; labelLembar?: string; urutanLembar?: number }
  ): Promise<void> => {
    return mutasi.ubahUnitKerja(ctx, id, payload);
  };

  const apiToggleUnitKerja = async (id: string): Promise<void> => {
    return mutasi.toggleUnitKerja(ctx, id);
  };

  const apiHapusUnitKerja = async (id: string): Promise<void> => {
    return mutasi.hapusUnitKerja(ctx, id);
  };

  const apiTambahKlasifikasi = async (
    kode: string,
    nama: string,
    uraian?: string,
    unitKerjaId?: string | null
  ): Promise<void> => {
    return mutasi.tambahKlasifikasi(ctx, kode, nama, uraian, unitKerjaId);
  };

  const apiUbahKlasifikasi = async (
    id: string,
    payload: { nama: string; kode?: string; uraian?: string; unitKerjaId?: string | null }
  ): Promise<void> => {
    return mutasi.ubahKlasifikasi(ctx, id, payload);
  };

  const apiToggleKlasifikasi = async (id: string): Promise<void> => {
    return mutasi.toggleKlasifikasi(ctx, id);
  };

  const apiTambahDataMaster = async (
    kategori: KategoriDataMaster,
    kode: string,
    label: string,
    keterangan?: string,
    urutan?: number,
    meta?: Record<string, unknown>
  ): Promise<string> => {
      return mutasi.tambahDataMaster(ctx, kategori, kode, label, keterangan, urutan, meta);
  };

  const apiUbahDataMaster = async (
    id: string,
    payload: {
      kode?: string;
      label?: string;
      keterangan?: string;
      urutan?: number;
      meta?: Record<string, unknown>;
    }
  ): Promise<void> => {
    return mutasi.ubahDataMaster(ctx, id, payload);
  };

  const apiToggleDataMaster = async (id: string): Promise<void> => {
    return mutasi.toggleDataMaster(ctx, id);
  };

  // ── Utilitas ────────────────────────────────────────────
  /**
   * Pengingat batas waktu. Pada mode Supabase dijalankan otomatis oleh
   * pg_cron (rpc_proses_pengingat_batas_waktu), sehingga fungsi ini
   * tidak melakukan apa pun di sisi klien.
   */
  const apiTriggerPengingatBatasWaktu = async (): Promise<void> => {
    return;
  };

  const apiResetDataSurat = async (): Promise<void> => {
    return mutasi.resetDataSurat(ctx);
  };

  return {
    apiCatatSuratMasuk,
    apiBuatDisposisi,
    apiBeriDisposisi,
    apiTerimaDisposisi,
    apiParafPenerimaanDisposisi: apiTerimaDisposisi,
    apiTeruskanKeStaf,
    apiTindakLanjutLangsung,
    apiSimpanProgres,
    apiLaporkanHasil,
    apiPeriksaLaporan,
    apiAjukanSuratKeluar,
    apiParafKoordinasi,
    apiTandatanganSurat,
    apiTolakSuratKeluar,
    apiTerbitkanNomorSurat,
    apiDokumentasikanDanKirimSuratKeluar,
    apiBuktiTerima,
    apiKoreksiMetadataArsip,
    apiVerifikasiArsip,
    apiTambahPengguna,
    apiUbahPengguna,
    apiTogglePengguna,
    apiResetPassword,
    apiUploadTandaTangan,
    apiHapusTandaTangan,
    apiTambahUnitKerja,
    apiUbahUnitKerja,
    apiToggleUnitKerja,
    apiHapusUnitKerja,
    apiTambahKlasifikasi,
    apiUbahKlasifikasi,
    apiToggleKlasifikasi,
    apiTambahDataMaster,
    apiUbahDataMaster,
    apiToggleDataMaster,
    apiBeriCatatanSekdis,
    apiBubuhkanParaf,
    apiTidakPerluDisposisi,
    apiTriggerPengingatBatasWaktu,
    apiResetDataSurat,
  };
}

export const useApi = useBusinessLogic;
