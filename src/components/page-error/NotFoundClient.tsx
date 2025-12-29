'use client';

import NotFoundBlock from './PageErrorBlock';

export default function NotFoundClient() {
  let message = '';

  if (typeof window !== 'undefined') {
    const lang = localStorage.getItem('preferredLanguage') || 'ua';
    if (lang === 'en') {
      message = 'Page not found';
    } else {
      message = 'Сторінку не знайдено';
    }
  }
  return <NotFoundBlock message={message} />;
}