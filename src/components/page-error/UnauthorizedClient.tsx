'use client';

import UnauthorizedBlock from './PageErrorBlock';

export default function UnauthorizedClient() {
  let message = '';

  if (typeof window !== 'undefined') {
    const lang = localStorage.getItem('preferredLanguage') || 'ua';
    if (lang === 'en') {
      message = 'You are not authorized to access this page';
    } else {
      message = 'Ви не авторизовані для доступу до цієї сторінки';
    }
  }
  return <UnauthorizedBlock message={message} />;
}