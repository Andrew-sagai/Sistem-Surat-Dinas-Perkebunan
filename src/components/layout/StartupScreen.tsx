'use client';

import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import styles from './StartupScreen.module.css';

export default function StartupScreen({ children }: { children: ReactNode }) {
  const { isHydrated } = useStore();
  const router = useRouter();
  const [introDone, setIntroDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [slow, setSlow] = useState(false);
  const leaving = introDone && isHydrated;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intro = window.setTimeout(() => setIntroDone(true), reduced ? 0 : 1100);
    const timeout = window.setTimeout(() => setSlow(true), 10000);
    return () => {
      window.clearTimeout(intro);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const exit = window.setTimeout(() => setDismissed(true), reduced ? 0 : 260);
    return () => window.clearTimeout(exit);
  }, [leaving]);

  function openLogin() {
    setDismissed(true);
    router.replace('/login');
  }

  return (
    <>
      <div hidden={!dismissed}>{children}</div>
      {!dismissed && (
        <section className={`${styles.screen} ${leaving ? styles.leaving : ''}`} aria-label="Membuka e-Surat Distan">
          <div className={styles.identity}>
            <span className={styles.identityMark} aria-hidden="true" />
            <span>Pemerintah Kabupaten<br />Minahasa Selatan</span>
          </div>

          <div className={styles.center}>
            <Image className={styles.crest} src="/logo.png" alt="Lambang Kabupaten Minahasa Selatan" width={88} height={116} preload />
            <h1 className={styles.title}>e-Surat <span>Distan</span></h1>
            <p className={styles.agency}>Dinas Pertanian</p>
            <p className={styles.description}>Sistem Informasi Manajemen Persuratan</p>
            <div className={styles.loading} role="status" aria-live="polite">
              <div className={styles.track} aria-hidden="true"><span /></div>
              <p>{slow && !isHydrated ? 'Pemuatan sesi lebih lama dari biasanya.' : leaving ? 'Sistem siap.' : 'Menyiapkan sistem persuratan...'}</p>
            </div>
            {slow && !isHydrated && (
              <div className={styles.recovery}>
                <button type="button" onClick={() => window.location.reload()}>Muat ulang</button>
                <button type="button" onClick={openLogin}>Buka halaman masuk</button>
              </div>
            )}
          </div>

          <footer className={styles.footer}>
            <span>Surat masuk. Disposisi. Arsip.</span>
            <span>Kabupaten Minahasa Selatan</span>
          </footer>
        </section>
      )}
    </>
  );
}
