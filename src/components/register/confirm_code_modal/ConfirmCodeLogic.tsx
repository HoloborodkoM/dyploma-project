import React, { useRef, useState, useEffect } from 'react';
import { t } from '../../TranslatedText';

const TEMP_REGISTER_EMAIL_KEY = 'temp_register_email';
const TEMP_REGISTER_NAME_KEY = 'temp_register_name';

interface ConfirmCodeLogicProps {
  open: boolean;
  email: string;
  name: string;
  password: string;
  lang?: 'ua' | 'en';
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
  children: (props: {
    codeDigits: string[];
    codeInputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
    loading: boolean;
    error: string;
    resendTimer: number;
    resendLoading: boolean;
    resendMessage: string;
    handleCodeInput: (idx: number, value: string) => void;
    handleCodePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleResend: () => Promise<void>;
    handleBack: () => void;
    handleClose: () => void;
  }) => React.ReactNode;
}

const ConfirmCodeLogic: React.FC<ConfirmCodeLogicProps> = ({
  open,
  email,
  name,
  password,
  lang: initialLang = 'ua',
  onBack,
  onClose,
  onSuccess,
  children
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [lang, setLang] = useState<'ua' | 'en'>(initialLang);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
    setCode('');
    setLoading(false);
    setError('');
    setResendTimer(0);
    setResendLoading(false);
    setResendMessage('');
    
    if (open && email && name) {
      localStorage.setItem(TEMP_REGISTER_EMAIL_KEY, email);
      localStorage.setItem(TEMP_REGISTER_NAME_KEY, name);
    }
  }, [open, email, name]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  if (!open) return null;

  const handleCodeInput = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = code.split('').concat(Array(6 - code.length).fill('')).slice(0, 6);
    newDigits[idx] = value;
    const joined = newDigits.join('').replace(/\D/g, '');
    setCode(joined);

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
    
    if (paste.length) {
      setCode(paste);
      if (paste.length < 6) {
        codeInputsRef.current[paste.length]?.focus();
      } else {
        codeInputsRef.current[5]?.focus();
      }
    }
    setError('');
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/register/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, lang })
      });
      const data = await response.json();
      if (!response.ok) {
        setResendMessage(data.error || 'Сталася помилка. Спробуйте ще раз.');
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

    if (code.length < 6) {
      setError(lang === 'en' ? 'All fields are required' : 'Усі поля обовʼязкові');
      return;
    }
    setLoading(true);
    
    try {
      const response = await fetch('/api/register/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, lang })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Сталася помилка. Спробуйте ще раз');
        setLoading(false);
        return;
      }
      setLoading(false);
      localStorage.removeItem(TEMP_REGISTER_EMAIL_KEY);
      localStorage.removeItem(TEMP_REGISTER_NAME_KEY);
      
      onSuccess();
    } catch (err) {
      setError('Сталася помилка з мережею');
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  const handleClose = () => {
    localStorage.removeItem(TEMP_REGISTER_EMAIL_KEY);
    localStorage.removeItem(TEMP_REGISTER_NAME_KEY);
    onClose();
  };

  const codeDigits = code.split('').concat(Array(6 - code.length).fill('')).slice(0, 6);

  return children({
    codeDigits,
    codeInputsRef,
    loading,
    error,
    resendTimer,
    resendLoading,
    resendMessage,
    handleCodeInput,
    handleCodePaste,
    handleSubmit,
    handleResend,
    handleBack,
    handleClose
  });
};

export default ConfirmCodeLogic;