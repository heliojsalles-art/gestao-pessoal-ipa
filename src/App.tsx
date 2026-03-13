import { useEffect, useState } from 'react';
import { AppRouter } from './router/AppRouter';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AppRouter />
      <div className={`app-splash ${showSplash ? 'visible' : 'hidden'}`}>
        <div className="app-splash-orb orb-a" />
        <div className="app-splash-orb orb-b" />
        <div className="app-splash-panel">
          <img src="/app-icon-dark.png" alt="Gestão Pessoal" className="app-splash-logo" />
          <div className="app-splash-title">Gestão Pessoal</div>
          <div className="app-splash-subtitle">Finanças, lembretes e listas em um só lugar</div>
        </div>
      </div>
    </>
  );
}
