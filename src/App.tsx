import { useState, useEffect } from 'react';
import { PerspectiveRoom } from './components/perspective';
import { Loader } from './components/Loader';

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio-theme-mode');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    return 'dark';
  });

  const handleModeChange = (nextMode: 'light' | 'dark') => {
    setMode(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-theme-mode', nextMode);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.style.backgroundColor = mode === 'dark' ? '#0a0a0a' : '#fafafa';
    document.body.style.backgroundColor = mode === 'dark' ? '#0a0a0a' : '#fafafa';
  }, [mode]);

  return (
    <main className="relative w-full min-h-screen">
      <Loader isDark={mode === 'dark'} />
      <PerspectiveRoom
        mode={mode}
        onModeChange={handleModeChange}
        strokeWidth={1}
        boundaryStrokeWidth={1.6}
      />
    </main>
  );
}
