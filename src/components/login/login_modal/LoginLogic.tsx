import React, { useState, useEffect } from 'react';
import { t } from '../../TranslatedText';
import { useAuth } from '@/hooks/useAuth';

const TEMP_EMAIL_KEY = 'temp_reset_password_email';

interface LoginLogicProps {
  open: boolean;
  onClose: () => void;
  onForgot: () => void;
  setLoginEmail: (email: string) => void;
  children: (props: {
    email: string;
    password: string;
    error: string;
    loading: boolean;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleClose: () => void;
    handleEmailChange: (value: string) => void;
    handlePasswordChange: (value: string) => void;
  }) => React.ReactNode;
}

const LoginLogic: React.FC<LoginLogicProps> = ({ 
  open, 
  onClose, 
  setLoginEmail, 
  children 
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailPlaceholder, setEmailPlaceholder] = useState('Пошта');
  const [passwordPlaceholder, setPasswordPlaceholder] = useState('Пароль');
  const [lang, setLang] = useState<'ua' | 'en'>('ua');

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
    setLoading(false);
    
    if (open) {
      const savedEmail = localStorage.getItem(TEMP_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setLoginEmail(savedEmail);
      } else {
        setEmail('');
      }
      setPassword('');
      setError('');
    }
  }, [open, setLoginEmail]);

  useEffect(() => {
    t('Пошта', lang).then(setEmailPlaceholder);
    t('Пароль', lang).then(setPasswordPlaceholder);
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const lang = localStorage.getItem('preferredLanguage') || 'ua';
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, lang })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Сталася помилка. Спробуйте ще раз');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        login(data.token);
      }
      setLoading(false);
      handleClose();
    } catch (err) {
      t('Сталася помилка з мережею.', lang).then(setError);
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.removeItem(TEMP_EMAIL_KEY);
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setLoginEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  if (!open) return null;

  return children({
    email,
    password,
    error,
    loading,
    emailPlaceholder,
    passwordPlaceholder,
    handleSubmit,
    handleClose,
    handleEmailChange,
    handlePasswordChange
  });
};

export default LoginLogic;