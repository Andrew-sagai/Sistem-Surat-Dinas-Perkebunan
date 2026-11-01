'use client';
import React, {
  createContext, useContext, useReducer, useCallback,
  useEffect, useState, useRef, useSyncExternalStore, ReactNode,
} from 'react';
import {
  AppState, StoreAction, User, SuratMasuk, Disposisi,
  SuratKeluar, PenugasanStaf,
  ArsipDigital, JenisSurat,
  KategoriDataMaster, DataMasterItem,
  UnitKerja, KlasifikasiSurat
} from './types';
import { supabaseAktif, sb, rpc, GalatData } from './data/supabase';
import { muatSemuaData, type DataTermuat } from './data/loader';

const initialState: AppState = {
  currentUser: null, users: [], unitKerja: [], jenisSurat: [], klasifikasi: [],
  suratMasuk: [], disposisi: [], penugasan: [], tindakLanjut: [], suratKeluar: [],
  persetujuan: [], arsip: [], notifikasi: [], riwayat: [], log: [],
  nomorSuratCounter: [], dataMaster: [], bukuEkspedisi: [],
  pengaturanInstansi: { id: '', namaPemda: '', namaInstansi: '', alamat: '', telpFax: '', logoPath: '' },
};

export type StoreActionInternal =
  | StoreAction
  | { type: 'HYDRATE_FROM_SUPABASE'; payload: DataTermuat }
  | { type: 'SET_CURRENT_USER'; payload: User | null };

function appReducer(state: AppState, action: StoreActionInternal): AppState {
  // Muat ulang seluruh data dari Postgres (mode Supabase).
  if (action.type === 'HYDRATE_FROM_SUPABASE') {
    return { ...state, ...(action as { type: 'HYDRATE_FROM_SUPABASE'; payload: DataTermuat }).payload };
  }
  if (action.type === 'SET_CURRENT_USER') {
    return { ...state, currentUser: (action as { type: 'SET_CURRENT_USER'; payload: User | null }).payload };
  }

  switch ((action as StoreAction).type) {
    case 'LOGIN':
      return { ...state, currentUser: (action as Extract<StoreAction, { type: 'LOGIN' }>).payload };
    case 'LOGOUT':
      return initialState;

    case 'ADD_SURAT_MASUK':
      return { ...state, suratMasuk: [...state.suratMasuk, (action as Extract<StoreAction, { type: 'ADD_SURAT_MASUK' }>).payload] };
    case 'UPDATE_SURAT_MASUK':
      return {
        ...state,
        suratMasuk: state.suratMasuk.map((s) =>
          s.id === (action as Extract<StoreAction, { type: 'UPDATE_SURAT_MASUK' }>).payload.id
            ? { ...s, ...(action as Extract<StoreAction, { type: 'UPDATE_SURAT_MASUK' }>).payload }
            : s
        ),
      };

    case 'ADD_DISPOSISI':
      return { ...state, disposisi: [...state.disposisi, (action as Extract<StoreAction, { type: 'ADD_DISPOSISI' }>).payload] };
    case 'UPDATE_DISPOSISI':
      return {
        ...state,
        disposisi: state.disposisi.map((d) =>
          d.id === (action as Extract<StoreAction, { type: 'UPDATE_DISPOSISI' }>).payload.id
            ? { ...d, ...(action as Extract<StoreAction, { type: 'UPDATE_DISPOSISI' }>).payload }
            : d
        ),
      };

    case 'ADD_PENUGASAN':
      return { ...state, penugasan: [...state.penugasan, (action as Extract<StoreAction, { type: 'ADD_PENUGASAN' }>).payload] };
    case 'UPDATE_PENUGASAN':
      return {
        ...state,
        penugasan: state.penugasan.map((p) =>
          p.id === (action as Extract<StoreAction, { type: 'UPDATE_PENUGASAN' }>).payload.id
            ? { ...p, ...(action as Extract<StoreAction, { type: 'UPDATE_PENUGASAN' }>).payload }
            : p
        ),
      };

    case 'ADD_TINDAK_LANJUT':
      return { ...state, tindakLanjut: [...state.tindakLanjut, (action as Extract<StoreAction, { type: 'ADD_TINDAK_LANJUT' }>).payload] };
    case 'UPDATE_TINDAK_LANJUT':
      return {
        ...state,
        tindakLanjut: state.tindakLanjut.map((t) =>
          t.id === (action as Extract<StoreAction, { type: 'UPDATE_TINDAK_LANJUT' }>).payload.id
            ? { ...t, ...(action as Extract<StoreAction, { type: 'UPDATE_TINDAK_LANJUT' }>).payload }
            : t
        ),
      };

    case 'ADD_SURAT_KELUAR':
      return { ...state, suratKeluar: [...state.suratKeluar, (action as Extract<StoreAction, { type: 'ADD_SURAT_KELUAR' }>).payload] };
    case 'UPDATE_SURAT_KELUAR':
      return {
        ...state,
        suratKeluar: state.suratKeluar.map((s) =>
          s.id === (action as Extract<StoreAction, { type: 'UPDATE_SURAT_KELUAR' }>).payload.id
            ? { ...s, ...(action as Extract<StoreAction, { type: 'UPDATE_SURAT_KELUAR' }>).payload }
            : s
        ),
      };

    case 'ADD_PERSETUJUAN':
      return { ...state, persetujuan: [...state.persetujuan, (action as Extract<StoreAction, { type: 'ADD_PERSETUJUAN' }>).payload] };

    case 'ADD_NOTIFIKASI':
      return { ...state, notifikasi: [(action as Extract<StoreAction, { type: 'ADD_NOTIFIKASI' }>).payload, ...state.notifikasi] };
    case 'UPDATE_NOTIFIKASI':
      return {
        ...state,
        notifikasi: state.notifikasi.map((n) =>
          n.id === (action as Extract<StoreAction, { type: 'UPDATE_NOTIFIKASI' }>).payload.id
            ? { ...n, ...(action as Extract<StoreAction, { type: 'UPDATE_NOTIFIKASI' }>).payload }
            : n
        ),
      };
    case 'MARK_NOTIFIKASI_READ':
      return {
        ...state,
        notifikasi: state.notifikasi.map((n) =>
          n.id === (action as Extract<StoreAction, { type: 'MARK_NOTIFIKASI_READ' }>).payload
            ? { ...n, dibaca: true }
            : n
        ),
      };

    case 'ADD_RIWAYAT':
      return { ...state, riwayat: [...state.riwayat, (action as Extract<StoreAction, { type: 'ADD_RIWAYAT' }>).payload] };

    case 'ADD_LOG':
      return { ...state, log: [(action as Extract<StoreAction, { type: 'ADD_LOG' }>).payload, ...state.log] };

    case 'ADD_USER':
      return { ...state, users: [...state.users, (action as Extract<StoreAction, { type: 'ADD_USER' }>).payload] };
    case 'UPDATE_USER': {
      const payload = (action as Extract<StoreAction, { type: 'UPDATE_USER' }>).payload;
      return {
        ...state,
        users: state.users.map((u) => (u.id === payload.id ? { ...u, ...payload } : u)),
        currentUser: state.currentUser?.id === payload.id ? { ...state.currentUser, ...payload } : state.currentUser,
      };
    }

    case 'ADD_JENIS_SURAT':
      return { ...state, jenisSurat: [...state.jenisSurat, (action as Extract<StoreAction, { type: 'ADD_JENIS_SURAT' }>).payload] };
    case 'UPDATE_JENIS_SURAT':
      return {
        ...state,
        jenisSurat: state.jenisSurat.map((j) =>
          j.id === (action as Extract<StoreAction, { type: 'UPDATE_JENIS_SURAT' }>).payload.id
            ? { ...j, ...(action as Extract<StoreAction, { type: 'UPDATE_JENIS_SURAT' }>).payload }
            : j
        ),
      };

    case 'ADD_DATA_MASTER':
      return { ...state, dataMaster: [...state.dataMaster, (action as Extract<StoreAction, { type: 'ADD_DATA_MASTER' }>).payload] };
    case 'UPDATE_DATA_MASTER':
      return {
        ...state,
        dataMaster: state.dataMaster.map((dm) =>
          dm.id === (action as Extract<StoreAction, { type: 'UPDATE_DATA_MASTER' }>).payload.id
            ? { ...dm, ...(action as Extract<StoreAction, { type: 'UPDATE_DATA_MASTER' }>).payload }
            : dm
        ),
      };
    case 'DELETE_DATA_MASTER':
      return {
        ...state,
        dataMaster: state.dataMaster.filter((dm) => dm.id !== (action as Extract<StoreAction, { type: 'DELETE_DATA_MASTER' }>).payload),
      };

    case 'ADD_KLASIFIKASI':
      return { ...state, klasifikasi: [...state.klasifikasi, (action as Extract<StoreAction, { type: 'ADD_KLASIFIKASI' }>).payload] };
    case 'UPDATE_KLASIFIKASI':
      return {
        ...state,
        klasifikasi: state.klasifikasi.map((k) =>
          k.id === (action as Extract<StoreAction, { type: 'UPDATE_KLASIFIKASI' }>).payload.id
            ? { ...k, ...(action as Extract<StoreAction, { type: 'UPDATE_KLASIFIKASI' }>).payload }
            : k
        ),
      };

    case 'ADD_UNIT_KERJA':
      return { ...state, unitKerja: [...state.unitKerja, (action as Extract<StoreAction, { type: 'ADD_UNIT_KERJA' }>).payload] };
    case 'UPDATE_UNIT_KERJA':
      return {
        ...state,
        unitKerja: state.unitKerja.map((u) =>
          u.id === (action as Extract<StoreAction, { type: 'UPDATE_UNIT_KERJA' }>).payload.id
            ? { ...u, ...(action as Extract<StoreAction, { type: 'UPDATE_UNIT_KERJA' }>).payload }
            : u
        ),
      };
    case 'DELETE_UNIT_KERJA':
      return {
        ...state,
        unitKerja: state.unitKerja.filter((u) => u.id !== (action as Extract<StoreAction, { type: 'DELETE_UNIT_KERJA' }>).payload),
      };

    case 'ADD_ARSIP':
      return { ...state, arsip: [...state.arsip, (action as Extract<StoreAction, { type: 'ADD_ARSIP' }>).payload] };

    case 'UPDATE_ARSIP': {
      const payload = (action as Extract<StoreAction, { type: 'UPDATE_ARSIP' }>).payload;
      return {
        ...state,
        arsip: state.arsip.map((a) => (a.id === payload.id ? { ...a, ...payload } : a)),
      };
    }

    case 'UPDATE_COUNTER': {
      const p = (action as Extract<StoreAction, { type: 'UPDATE_COUNTER' }>).payload;
      const exists = state.nomorSuratCounter?.find(
        c => c.tahun === p.tahun && c.klasifikasiKode === p.klasifikasiKode
      );
      if (exists) {
        return {
          ...state,
          nomorSuratCounter: state.nomorSuratCounter.map(c =>
            c.tahun === p.tahun && c.klasifikasiKode === p.klasifikasiKode
              ? { ...c, counter: p.counter }
              : c
          ),
        };
      }
      return { ...state, nomorSuratCounter: [...(state.nomorSuratCounter || []), p] };
    }

    case 'RESET_DATA_SURAT':
      return {
        ...state,
        suratMasuk: [],
        disposisi: [],
        penugasan: [],
        tindakLanjut: [],
        suratKeluar: [],
        persetujuan: [],
        arsip: [],
        riwayat: [],
        notifikasi: [],
        log: [],
        nomorSuratCounter: [
          { tahun: new Date().getFullYear(), klasifikasiKode: 'SURAT_MASUK', counter: 0 },
          { tahun: new Date().getFullYear(), klasifikasiKode: 'SURAT_KELUAR', counter: 0 },
        ],
      };

    default:
      return state;
  }
}

// ─── Context Type ─────────────────────────────────────────
interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<StoreActionInternal>;
  isHydrated: boolean;
  isSupabase: boolean;
  authUser: { id: string; email: string } | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  getUser: (id: string) => User | undefined;
  getUnitKerja: (id: string) => UnitKerja | undefined;
  getJenisSurat: (id: string | undefined) => JenisSurat | undefined;
  getKlasifikasi: (id: string) => KlasifikasiSurat | undefined;
  getDataMaster: (kategori?: KategoriDataMaster, hanyaAktif?: boolean) => DataMasterItem[];
  getMasterLabel: (kategori: KategoriDataMaster, kode: string, defaultVal?: string) => string;
  getUnreadCount: () => number;
  generateId: (prefix: string) => string;
  /** Simpan status baca notifikasi melalui RPC. */
  markNotifikasiRead: (notifikasiId?: string) => Promise<void>;
  getScopedDisposisi: () => Disposisi[];
  getScopedSuratMasuk: () => SuratMasuk[];
  getMyPenugasan: () => PenugasanStaf[];
  getSuratKeluarByRole: () => SuratKeluar[];
  getScopedArsip: () => ArsipDigital[];
}

const StoreContext = createContext<StoreContextType | null>(null);

let idCounter = 1000;

// Pembantu `useSyncExternalStore` untuk mendeteksi sisi klien.
const subscribeHidrasi = () => () => {};
const getSnapshotHidrasi = () => true;
const getServerSnapshotHidrasi = () => false;

// ─── StoreProvider ────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Flag hydration — false saat render di server, true di browser. Dipakai
  // `useSyncExternalStore` supaya tidak perlu `setState` di dalam efek.
  const clientReady = useSyncExternalStore(
    subscribeHidrasi,
    getSnapshotHidrasi,
    getServerSnapshotHidrasi
  );

  const isSupabase = supabaseAktif();
  const [sessionReady, setSessionReady] = useState(!isSupabase);
  const isHydrated = clientReady && sessionReady;
  const [authUser, setAuthUserState] = useState<{ id: string; email: string } | null>(null);
  const authRef = useRef<{ id: string; email: string } | null>(null);

  const setAuthUser = useCallback((v: { id: string; email: string } | null) => {
    authRef.current = v;
    setAuthUserState(v);
  }, []);

  /** Muat ulang seluruh data dari Postgres dan perbarui pengguna saat ini. */
  const refresh = useCallback(async () => {
    if (!supabaseAktif()) return;
    const data = await muatSemuaData();
    dispatch({ type: 'HYDRATE_FROM_SUPABASE', payload: data });
    const id = authRef.current?.id;
    if (id) {
      dispatch({
        type: 'SET_CURRENT_USER',
        payload: data.users.find((u) => u.authId === id && u.aktif) ?? null,
      });
    }
  }, []);

  // ── Pulihkan sesi Supabase saat aplikasi dimuat ──
  useEffect(() => {
    if (!isSupabase) {
      return;
    }
    let batal = false;
    (async () => {
      try {
        const client = sb();
        const { data } = await client.auth.getSession();
        const sesi = data.session;
        if (!sesi) {
          return;
        }
        if (!batal) {
          setAuthUser({ id: sesi.user.id, email: sesi.user.email ?? '' });
        }
        const termuat = await muatSemuaData();
        if (batal) return;
        dispatch({ type: 'HYDRATE_FROM_SUPABASE', payload: termuat });
        dispatch({
          type: 'SET_CURRENT_USER',
          payload: termuat.users.find((u) => u.authId === sesi.user.id && u.aktif) ?? null,
        });
      } catch (galat) {
        console.error('[store] gagal memulihkan sesi Supabase:', galat);
      } finally {
        if (!batal) setSessionReady(true);
      }
    })();
    return () => {
      batal = true;
    };
  }, [isSupabase, setAuthUser]);

  // ── Ikuti perubahan status autentikasi (mis. sign-out di tab lain) ──
  useEffect(() => {
    if (!isSupabase) return;
    const client = sb();
    const { data } = client.auth.onAuthStateChange((_event, sesi) => {
      if (!sesi) {
        setAuthUser(null);
        dispatch({ type: 'LOGOUT' });
        return;
      }
      setAuthUser({ id: sesi.user.id, email: sesi.user.email ?? '' });
    });
    return () => data.subscription.unsubscribe();
  }, [isSupabase, setAuthUser]);

  // ─── Auth helpers ─────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password;

    if (supabaseAktif()) {
      const { data, error } = await sb().auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });
      if (error) {
        if (/invalid login credentials/i.test(error.message)) return null;
        throw new GalatData(
          'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.'
        );
      }
      const authId = data.user.id;
      const termuat = await muatSemuaData();
      dispatch({ type: 'HYDRATE_FROM_SUPABASE', payload: termuat });
      const user = termuat.users.find((u) => u.authId === authId) ?? null;
      if (!user) {
        await sb().auth.signOut();
        throw new GalatData('Akun Anda belum terdaftar pada aplikasi. Hubungi Administrator.');
      }
      if (!user.aktif) {
        await sb().auth.signOut();
        throw new GalatData('Akun Anda telah dinonaktifkan. Hubungi Administrator.');
      }
      setAuthUser({ id: authId, email: cleanEmail });
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      return user;
    }

    throw new GalatData('Layanan belum dikonfigurasi. Hubungi Administrator.');
  }, [setAuthUser]);

  const logout = useCallback(async () => {
    if (supabaseAktif()) {
      try {
        await sb().auth.signOut();
      } catch {
        // abaikan — sesi lokal tetap dibersihkan
      }
      setAuthUser(null);
    }
    dispatch({ type: 'LOGOUT' });
  }, [setAuthUser]);

  const getUser = useCallback((id: string) => {
    return state.users.find((u) => u.id === id);
  }, [state.users]);

  const getUnitKerja = useCallback((id: string) => {
    return state.unitKerja.find((u) => u.id === id);
  }, [state.unitKerja]);

  const getJenisSurat = useCallback((id: string | undefined) => {
    if (!id) return undefined;
    return state.jenisSurat.find((j) => j.id === id);
  }, [state.jenisSurat]);

  const getKlasifikasi = useCallback((id: string) => {
    return state.klasifikasi.find((k) => k.id === id);
  }, [state.klasifikasi]);

  const getUnreadCount = useCallback(() => {
    if (!state.currentUser) return 0;
    return state.notifikasi.filter(
      (n) => n.userId === state.currentUser!.id && !n.dibaca
    ).length;
  }, [state.currentUser, state.notifikasi]);

  // ─── Generator helpers ────────────────────────────────
  const generateId = useCallback((prefix: string) => {
    idCounter++;
    return `${prefix}-${Date.now()}-${idCounter}`;
  }, []);

  const markNotifikasiRead = useCallback(
    async (notifikasiId?: string) => {
      await rpc('rpc_tandai_notifikasi_dibaca', { p_notifikasi_id: notifikasiId ?? null });
      await refresh();
    },
    [refresh]
  );

  const getScopedDisposisi = useCallback(() => {
    if (!state.currentUser) return [];
    const role = state.currentUser.role;
    if (role === 'kepala_bidang') {
      return state.disposisi.filter(d =>
        d.bidangTujuan.some(b => b.unitKerjaId === state.currentUser!.unitKerjaId)
      );
    }
    if (role === 'sekretaris') {
      // Sekdis melihat disposisi lintas bidang (instruksi koordinasi atau >1 bidang) atau disposisi ke sekretariat
      return state.disposisi.filter(d =>
        d.bidangTujuan.length > 1 ||
        d.instruksi === 'koordinasi_konfirmasi' ||
        d.bidangTujuan.some(b => b.unitKerjaId === state.currentUser!.unitKerjaId)
      );
    }
    if (role === 'staf_pelaksana') {
      const myDispIds = state.penugasan
        .filter(p => p.stafId === state.currentUser!.id)
        .map(p => p.disposisiId);
      return state.disposisi.filter(d => myDispIds.includes(d.id));
    }
    // kepala_dinas & petugas_surat: akses penuh ke SEMUA disposisi
    // (Proposal 14d: Kadis memperoleh dashboard pimpinan yang menyeluruh)
    return state.disposisi;
  }, [state.currentUser, state.disposisi, state.penugasan]);

  /**
   * getScopedSuratMasuk — filter surat masuk berdasarkan role:
   * - kepala_bidang  : hanya surat yang ada disposisinya ke unitKerja miliknya
   * - staf_pelaksana : hanya surat yang ada penugasannya dengan stafId === user.id
   * - lainnya        : semua surat masuk (akses penuh)
   */
  const getScopedSuratMasuk = useCallback((): SuratMasuk[] => {
    if (!state.currentUser) return [];
    const role = state.currentUser.role;

    if (role === 'kepala_bidang') {
      const myDispIds = state.disposisi
        .filter(d => d.bidangTujuan.some(b => b.unitKerjaId === state.currentUser!.unitKerjaId))
        .map(d => d.suratMasukId);
      return state.suratMasuk.filter(s => myDispIds.includes(s.id));
    }

    if (role === 'staf_pelaksana') {
      const myPenugasan = state.penugasan.filter(p => p.stafId === state.currentUser!.id);
      const myDispIds = myPenugasan.map(p => p.disposisiId);
      const myDisposisi = state.disposisi.filter(d => myDispIds.includes(d.id));
      const mySMIds = myDisposisi.map(d => d.suratMasukId);
      return state.suratMasuk.filter(s => mySMIds.includes(s.id));
    }

    if (role === 'sekretaris') {
      // Sekretaris: akses surat dinas, namun surat rahasia hanya jika sekretariat menjadi tujuan disposisi
      return state.suratMasuk.filter(s => {
        if (s.sifat !== 'rahasia') return true;
        return state.disposisi.some(d => d.suratMasukId === s.id && d.bidangTujuan.some(b => b.unitKerjaId === state.currentUser!.unitKerjaId));
      });
    }

    // petugas_surat, admin, kepala_dinas: akses penuh
    return state.suratMasuk;
  }, [state.currentUser, state.suratMasuk, state.disposisi, state.penugasan]);

  const getMyPenugasan = useCallback(() => {
    if (!state.currentUser) return [];
    if (state.currentUser.role === 'staf_pelaksana') {
      return state.penugasan.filter(p => p.stafId === state.currentUser!.id);
    }
    return state.penugasan;
  }, [state.currentUser, state.penugasan]);

  const getSuratKeluarByRole = useCallback(() => {
    if (!state.currentUser) return [];
    const role = state.currentUser.role;
    if (role === 'sekretaris') {
      // Sekretaris: lihat semua surat keluar tapi aksi hanya pada menunggu_paraf
      return state.suratKeluar;
    }
    if (role === 'kepala_dinas') {
      // Kadis: lihat semua surat keluar untuk monitoring; aksi hanya pada menunggu_ttd
      return state.suratKeluar;
    }
    if (role === 'staf_pelaksana') {
      // Staf: hanya melihat surat yang ia susun
      return state.suratKeluar.filter(s => s.penyusunId === state.currentUser!.id);
    }
    // petugas_surat: akses penuh
    return state.suratKeluar;
  }, [state.currentUser, state.suratKeluar]);

  const getScopedArsip = useCallback(() => {
    if (!state.currentUser) return [];
    const role = state.currentUser.role;
    if (role === 'staf_pelaksana') {
      const myPenugasan = state.penugasan.filter(p => p.stafId === state.currentUser!.id);
      const myDispIds = myPenugasan.map(p => p.disposisiId);
      const myDisposisi = state.disposisi.filter(d => myDispIds.includes(d.id));
      const mySMIds = myDisposisi.map(d => d.suratMasukId);
      return state.arsip.filter(
        a => a.jenisSurat === 'masuk' && a.suratMasukId && mySMIds.includes(a.suratMasukId)
      );
    }
    if (role === 'kepala_bidang') {
      // Kabid: arsip surat yang pernah didisposisikan ke bidangnya
      const myDispSMIds = state.disposisi
        .filter(d => d.bidangTujuan.some(b => b.unitKerjaId === state.currentUser!.unitKerjaId))
        .map(d => d.suratMasukId);
      return state.arsip.filter(
        a => a.suratKeluarId || (a.suratMasukId && myDispSMIds.includes(a.suratMasukId))
      );
    }
    return state.arsip;
  }, [state.currentUser, state.arsip, state.penugasan, state.disposisi]);

  const getDataMaster = useCallback((kategori?: KategoriDataMaster, hanyaAktif: boolean = true) => {
    return (state.dataMaster || [])
      .filter(d => (!kategori || d.kategori === kategori) && (!hanyaAktif || d.aktif))
      .sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  }, [state.dataMaster]);

  const getMasterLabel = useCallback((kategori: KategoriDataMaster, kode: string, defaultVal?: string) => {
    const item = (state.dataMaster || []).find(d => d.kategori === kategori && d.kode.toLowerCase() === (kode || '').toLowerCase());
    return item ? item.label : (defaultVal || kode);
  }, [state.dataMaster]);

  // ─── Provider value ───────────────────────────────────
  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        isHydrated,
        isSupabase,
        authUser,
        login,
        logout,
        refresh,
        getUser,
        getUnitKerja,
        getJenisSurat,
        getKlasifikasi,
        getDataMaster,
        getMasterLabel,
        getUnreadCount,
        markNotifikasiRead,
        generateId,
        getScopedDisposisi,
        getScopedSuratMasuk,
        getMyPenugasan,
        getSuratKeluarByRole,
        getScopedArsip,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
