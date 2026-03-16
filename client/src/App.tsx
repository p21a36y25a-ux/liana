import { useEffect, useState } from 'react';
import type { Framework } from './types';
import FrameworkList from './components/FrameworkList';

const FRAMEWORKS_URL = '/api/frameworks';

export default function App() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(FRAMEWORKS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<Framework[]>;
      })
      .then((data) => {
        setFrameworks(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load frameworks');
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__title">
            🌿 Liana
          </h1>
          <p className="app-header__subtitle">
            Web Framework Hub — Angular · Express · NestJS · Next.js · Nuxt · Parcel · React · Vite · Vue.js
          </p>
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="app-status" role="status">
            Loading frameworks…
          </div>
        )}
        {error && (
          <div className="app-status app-status--error" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && <FrameworkList frameworks={frameworks} />}
      </main>

      <footer className="app-footer">
        <p>
          Built with{' '}
          <strong>React</strong> + <strong>Vite</strong> (frontend) and{' '}
          <strong>Express</strong> (backend)
        </p>
      </footer>
    </div>
  );
}
