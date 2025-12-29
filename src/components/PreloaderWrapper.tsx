'use client';

import { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getInitialLang(): 'ua' | 'en' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'en' || saved === 'ua') return saved;
  }
  return 'ua';
}

interface TranslationContextType {
  loading: boolean;
  startTranslation: () => void;
  finishTranslation: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function useTranslationContext() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslationContext must be used within TranslationProvider');
  return ctx;
}

function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [initialLang, setInitialLang] = useState<'ua' | 'en'>('ua');
  const failSafeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const lang = getInitialLang();
      setInitialLang(lang);
      if (lang !== 'ua') setCount(1);
    }
  }, []);

  const startTranslation = useCallback(() => {
    setCount(c => c + 1);
    if (failSafeTimer.current) {
      clearTimeout(failSafeTimer.current);
      failSafeTimer.current = null;
    }
  }, []);

  const finishTranslation = useCallback(() => setCount(c => Math.max(0, c - 1)), []);

  useEffect(() => {
    if (mounted && count > 0) {
      if (failSafeTimer.current) clearTimeout(failSafeTimer.current);
      failSafeTimer.current = setTimeout(() => setCount(0), 2000);
      return () => {
        if (failSafeTimer.current) clearTimeout(failSafeTimer.current);
      };
    }
  }, [mounted, count]);

  const loading = mounted ? count > 0 : false;

  return (
    <TranslationContext.Provider value={{
      loading,
      startTranslation,
      finishTranslation,
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

function PreloaderContent() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      transition: 'opacity 0.5s',
    }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1.2s linear infinite' }}>
        <circle cx="40" cy="40" r="36" stroke="#E53935" strokeWidth="8" fill="#fff" />
        <rect x="34" y="20" width="12" height="40" rx="3" fill="#E53935" />
        <rect x="20" y="34" width="40" height="12" rx="3" fill="#E53935" />
      </svg>
    </div>
  );
}

export default function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [routeLoading, setRouteLoading] = useState(false);
  const [langLoading, setLangLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setRouteLoading(true);
      const timer = setTimeout(() => setRouteLoading(false), 500); // можно увеличить время, если нужно
      return () => clearTimeout(timer);
    }
  }, [pathname, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      setLangLoading(true);
      setTimeout(() => setLangLoading(false), 500);
    };
    window.addEventListener('languageChanged', handler);
    return () => window.removeEventListener('languageChanged', handler);
  }, [mounted]);

  if (!mounted) {
    return <PreloaderContent />;
  }

  return (
    <TranslationProvider>
      <PreloaderWrapperInner routeLoading={routeLoading || langLoading}>{children}</PreloaderWrapperInner>
    </TranslationProvider>
  );
}

function PreloaderWrapperInner({ children, routeLoading }: { children: React.ReactNode, routeLoading: boolean }) {
  const { loading } = useTranslationContext();
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!loading && !routeLoading) {
      timer = setTimeout(() => setShowPreloader(false), 1000); // 1 секунда для любого языка
    } else {
      setShowPreloader(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, routeLoading]);

  return (
    <>
      <div style={{ opacity: showPreloader ? 0 : 1, transition: 'opacity 0.5s' }}>
        {children}
      </div>
      {showPreloader && <PreloaderContent />}
    </>
  );
}