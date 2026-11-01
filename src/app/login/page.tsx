'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const { login, isSupabase } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading || !isSupabase) return;
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) router.replace('/dashboard');
      else setError('Email atau kata sandi tidak sesuai. Silakan coba lagi.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-kop">
          <Image src="/logo.png" alt="Logo Minahasa Selatan" width={84} height={84} style={{ objectFit: 'contain', marginBottom: 16 }} />
          <div className="login-kop-subtitle">Pemerintah Kabupaten Minahasa Selatan</div>
          <div className="login-kop-title">Dinas Pertanian</div>
          <p>Sistem Informasi Manajemen Persuratan</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-right-content">
          <h1>Masuk</h1>
          <p style={{ margin: '8px 0 28px', color: 'var(--tinta-redup)' }}>Gunakan akun yang diberikan Administrator Sistem.</p>
          {!isSupabase && <div className="login-error" role="alert">Layanan belum dikonfigurasi. Hubungi Administrator Sistem.</div>}
          {error && <div className="login-error" role="alert" id="login-error">{error}</div>}
          <form className="login-form" onSubmit={handleSubmit} aria-busy={loading}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input id="login-email" type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Kata Sandi</label>
              <input id="login-password" type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !isSupabase} style={{ width: '100%' }}>
              {loading ? 'Sedang masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
