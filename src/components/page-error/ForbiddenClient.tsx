'use client';

import ForbiddenBlock from './PageErrorBlock';

export default function ForbiddenClient() {
  let message = '';

  if (typeof window !== 'undefined') {
    const lang = localStorage.getItem('preferredLanguage') || 'ua';
    if (lang === 'en') {
      message = 'You are not allowed to access this page';
    } else {
      message = 'Ви не маєте доступу до цієї сторінки';
    }
  }
  return <ForbiddenBlock message={message} />;
}