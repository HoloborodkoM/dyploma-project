import React, { useState, useRef, useEffect } from 'react';
import { t } from '../../TranslatedText';

const TEMP_EMAIL_KEY = 'temp_reset_password_email';

interface ResetPasswordLogicProps {
  open: boolean;
  email: string;
  lang?: 'ua' | 'en';
  onClose: () => void;
  onBack: () => void;
  onLogin: () => void;
  children: (props: {
    codeDigits: string[];
    codeInputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
    newPassword: string;
    loading: boolean;
    error: string;
    success: boolean;
    resendTimer: number;
    resendLoading: boolean;
    resendMessage: string;
    handleCodeInput: (idx: number, value: string) => void;
    handleCodePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleResend: () => Promise<void>;
    handleClose: () => void;
    handleBack: () => void;
    handleLogin: () => void;
  }) => React.ReactNode;
}

const ResetPasswordLogic: React.FC<ResetPasswordLogicProps> = ({ 
  open, 
  email, 
  lang: initialLang = 'ua', 
  onClose, 
  onBack, 
  onLogin,
  children 
}) => {
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'ua' | 'en'>(initialLang);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (open && email) {
      localStorage.setItem(TEMP_EMAIL_KEY, email);
    }
  }, [open, email]);

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
    setCodeDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setLoading(false);
    setError('');
    setSuccess(false);
    setResendTimer(0);
    setResendLoading(false);
    setResendMessage('');
  }, [open]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  if (!open) return null;

  const handleCodeInput = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...codeDigits];
    newDigits[idx] = value;
    setCodeDigits(newDigits);

    if (value && idx < 5) {
      codeInputsRef.current[idx + 1]?.focus();
    }

    if (!value && idx > 0) {
      codeInputsRef.current[idx - 1]?.focus();
    }
    setError('');
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (paste.length === 6) {
      setCodeDigits(paste.split(''));
      codeInputsRef.current[5]?.focus();
    }
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError('');
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    
    try {
      const response = await fetch('/api/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang })
      });
      const data = await response.json();
      if (!response.ok) {
        t(data.error || 'Сталася помилка. Спробуйте ще раз.', lang).then(setResendMessage);
        setResendLoading(false);
        return;
      }
      t('Код повторно надіслано', lang).then(setResendMessage);
      setResendTimer(60);
      setResendLoading(false);
    } catch (err) {
      t('Сталася помилка з мережею.', lang).then(setResendMessage);
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (codeDigits.some(d => !d) || !newPassword) {
      setError(lang === 'en' ? 'All fields are required' : 'Усі поля обовʼязкові');
      return;
    }
    setLoading(true);
    
    try {
      const lang = localStorage.getItem('preferredLanguage') || 'ua';
      const code = codeDigits.join('');
      const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, lang })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Сталася помилка. Спробуйте ще раз');
        setLoading(false);
        return;
      }
      setLoading(false);
      setSuccess(true);
      
      localStorage.removeItem(TEMP_EMAIL_KEY);
    } catch (err) {
      setError('Сталася помилка з мережею');
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

  const handleLogin = () => {
    localStorage.removeItem(TEMP_EMAIL_KEY);
    onLogin();
  };

  return children({
    codeDigits,
    codeInputsRef,
    newPassword,
    loading,
    error,
    success,
    resendTimer,
    resendLoading,
    resendMessage,
    handleCodeInput,
    handleCodePaste,
    handlePasswordChange,
    handleSubmit,
    handleResend,
    handleClose,
    handleBack,
    handleLogin
  });
};

export default ResetPasswordLogic;