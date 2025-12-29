import React, { useState, useEffect } from 'react';

const TEMP_EMAIL_KEY = 'temp_reset_password_email';

interface ForgotPasswordLogicProps {
  open: boolean;
  email: string;
  lang?: 'ua' | 'en';
  onClose: () => void;
  onReset: () => void;
  onBack: () => void;
  children: (props: {
    loading: boolean;
    message: { text: string; type: 'success' | 'error' } | null;
    handleSend: (e: React.FormEvent) => Promise<void>;
    handleClose: () => void;
    handleBack: () => void;
  }) => React.ReactNode;
}

const ForgotPasswordLogic: React.FC<ForgotPasswordLogicProps> = ({ 
  open, 
  email, 
  lang: initialLang = 'ua', 
  onClose, 
  onReset, 
  onBack,
  children
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [lang, setLang] = useState<'ua' | 'en'>(initialLang);

  useEffect(() => {
    if (open && email) {
      localStorage.setItem(TEMP_EMAIL_KEY, email);
    }
  }, [open, email]);

  useEffect(() => {
    if (!open) return;
    
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
    setLoading(false);
    setMessage(null);
  }, [open]);

  if (!open) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    
    try {
      const response = await fetch('/api/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({ text: data.error, type: 'error' });
        setLoading(false);
        return;
      }
      setMessage({ text: data.message, type: 'success' });
      setLoading(false);
      setTimeout(onReset, 1000);
    } catch (err) {
      setMessage({ text: 'network Error', type: 'error' });
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.removeItem(TEMP_EMAIL_KEY);
    onClose();
  };

  const handleBack = () => {
    onBack();
  };

  return children({
    loading,
    message,
    handleSend,
    handleClose,
    handleBack
  });
};

export default ForgotPasswordLogic;