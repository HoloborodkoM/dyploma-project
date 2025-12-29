import React, { useState, useEffect } from 'react';
import { t } from '../../TranslatedText';

const TEMP_REGISTER_EMAIL_KEY = 'temp_register_email';
const TEMP_REGISTER_NAME_KEY = 'temp_register_name';

interface RegisterLogicProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string, name: string, password: string) => void;
  children: (props: {
    name: string;
    email: string;
    password: string;
    error: string;
    loading: boolean;
    namePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleNameChange: (value: string) => void;
    handleEmailChange: (value: string) => void;
    handlePasswordChange: (value: string) => void;
    handleClose: () => void;
  }) => React.ReactNode;
}

const RegisterLogic: React.FC<RegisterLogicProps> = ({
  open,
  onClose,
  onSuccess,
  children
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [namePlaceholder, setNamePlaceholder] = useState("Прізвище Ім'я");
  const [emailPlaceholder, setEmailPlaceholder] = useState("Пошта");
  const [passwordPlaceholder, setPasswordPlaceholder] = useState("Пароль");
  const [lang, setLang] = useState<'ua' | 'en'>('ua');

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
    setLoading(false);
    
    if (open) {
      const savedEmail = localStorage.getItem(TEMP_REGISTER_EMAIL_KEY);
      const savedName = localStorage.getItem(TEMP_REGISTER_NAME_KEY);
      
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        setEmail('');
      }
      
      if (savedName) {
        setName(savedName);
      } else {
        setName('');
      }
      
      setPassword('');
      setError('');
    }
  }, [open]);

  useEffect(() => {
    t("Прізвище Ім'я", lang).then(setNamePlaceholder);
    t("Пошта", lang).then(setEmailPlaceholder);
    t("Пароль", lang).then(setPasswordPlaceholder);
  }, [lang]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const lang = localStorage.getItem('preferredLanguage') || 'ua';
      const response = await fetch('/api/register/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, lang })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Сталася помилка. Спробуйте ще раз');
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess(email, name, password);
    } catch (err) {
      t('Сталася помилка з мережею.', lang).then(setError);
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleClose = () => {
    localStorage.removeItem(TEMP_REGISTER_EMAIL_KEY);
    localStorage.removeItem(TEMP_REGISTER_NAME_KEY);
    onClose();
  };

  return children({
    name,
    email,
    password,
    error,
    loading,
    namePlaceholder,
    emailPlaceholder,
    passwordPlaceholder,
    handleSubmit,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleClose
  });
};

export default RegisterLogic;