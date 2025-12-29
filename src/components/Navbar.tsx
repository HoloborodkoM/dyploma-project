'use client'

import Link from 'next/link';
import { TranslatedText } from './TranslatedText';
import { LanguageSwitcher } from './LanguageSwitcher'
import { usePathname, useRouter } from 'next/navigation';
import Login from './login/login_modal/Login';
import Register from './register/register_modal/Register';
import ForgotPassword from './login/forgot_password_modal/ForgotPassword';
import ResetPassword from './login/reset_password_modal/ResetPassword';
import ConfirmCode from './register/confirm_code_modal/ConfirmCode';
import RegisterSuccess from './register/register_success_modal/RegisterSuccess';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'
import md5 from 'md5';
import PreloaderWrapper from './PreloaderWrapper';
import Modal from './Modal';
import { fetchWithAuth } from '@/utils/auth';

const RedCrossIcon = () => (
  <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" stroke="#E53935" strokeWidth="8" fill="#fff" />
    <rect x="34" y="20" width="12" height="40" rx="3" fill="#E53935" />
    <rect x="20" y="34" width="40" height="12" rx="3" fill="#E53935" />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [modal, setModal] = useState<'login' | 'forgot' | 'reset' | 'register' | 'registerCode' | 'registerSuccess' | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loadingLogout, setLoadingLogout] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [isEmailOverflow, setIsEmailOverflow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [user]);

  useEffect(() => {
    function handleResize() {
      if (!navRef.current) return;
      const emailSpan = navRef.current.querySelector('.user-email-span') as HTMLSpanElement;
      if (emailSpan) {
        setIsEmailOverflow(emailSpan.offsetWidth + emailSpan.offsetLeft > navRef.current.offsetWidth - 120); // 120px запас под меню
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  const handleLogout = async () => {
    setLoadingLogout(true);
    logout();
    setLoadingLogout(false);
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setShowDeleteModal(false);
    try {
      setLoadingLogout(true);
      const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
      const res = await fetchWithAuth(`/api/users/${user.id}?lang=${currentLang}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error);
        setLoadingLogout(false);
        return;
      }
      logout();
      setLoadingLogout(false);
      router.push('/');
    } catch (error) {
      setLoadingLogout(false);
    }
  };

  function getProfilePhoto(email: string) {
    return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=identicon`;
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="container-wrapper py-4 flex justify-between items-center">
        <div className="flex justify-start items-start space-x-2 text-xl font-bold text-primary">
          <RedCrossIcon />
          <span>MedHelp</span>
        </div>
        <ul className="hidden md:flex flex-1 justify-center space-x-6">
          <li>
            <Link
              href="/"
              className={`font-medium hover:text-primary transition-colors border-b-2 ${pathname === '/' ? 'text-primary font-bold border-primary' : 'border-transparent'}`}
            >
              <TranslatedText text="Головна" />
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link
                  href="/courses"
                  className={`font-medium hover:text-primary transition-colors border-b-2 ${pathname.startsWith('/courses') ? 'text-primary font-bold border-primary' : 'border-transparent'}`}
                >
                  <TranslatedText text="Курси" />
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations"
                  className={`font-medium hover:text-primary transition-colors border-b-2 ${pathname.startsWith('/simulations') ? 'text-primary font-bold border-primary' : 'border-transparent'}`}
                >
                  <TranslatedText text="Симуляції" />
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              href="/about"
              className={`font-medium hover:text-primary transition-colors border-b-2 ${pathname.startsWith('/about') ? 'text-primary font-bold border-primary' : 'border-transparent'}`}
            >
              <TranslatedText text="Про проект" />
            </Link>
          </li>
        </ul>
        <div className="justify-end items-end space-x-3 flex">
          <div className="lang-switcher-block hidden [@media(min-width:400px)]:block"><LanguageSwitcher /></div>
          {user ? (
            <div className="relative avatar-block" ref={menuRef}>
              <button onClick={() => setMenuOpen(v => !v)} className="flex items-center space-x-2 focus:outline-none">
                <img
                  src={getProfilePhoto(user.email)}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border object-cover"
                  style={{ minWidth: 40, minHeight: 40, maxWidth: 48, maxHeight: 48 }}
                />
                <span className="font-medium text-gray-700 hidden lg:block user-email-span">{user.email}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded z-50">
                  <div className="lg:hidden block w-full text-left px-4 py-2 text-gray-700">{user.email}</div>
                  {user?.role === 'ROOT' && (
                    <Link href="/users" className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-blue-600"><TranslatedText text="Користувачі" /></Link>
                  )}
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-black-600" onClick={handleLogout}><TranslatedText text="Вийти" /></button>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-red-600" onClick={() => setShowDeleteModal(true)}><TranslatedText text="Видалити акаунт" /></button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setModal('login')} className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition hidden sm:block">
                <TranslatedText text="Увійти" />
              </button>
              <button onClick={() => setModal('register')} className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition hidden sm:block">
                <TranslatedText text="Реєстрація" />
              </button>
            </>
          )}
          
          <div className="md:hidden flex items-center">
            <button className="p-2 text-gray-500" onClick={() => setMobileMenuOpen(v => !v)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute top-16 right-2 bg-white shadow-lg rounded z-50 flex flex-col p-2 space-y-2 ease-in-out animate-slide-in">
                <Link href="/" className="px-4 py-2 hover:bg-gray-100 rounded"><TranslatedText text="Головна" /></Link>
                {user && <Link href="/courses" className="px-4 py-2 hover:bg-gray-100 rounded"><TranslatedText text="Курси" /></Link>}
                {user && <Link href="/simulations" className="px-4 py-2 hover:bg-gray-100 rounded"><TranslatedText text="Симуляції" /></Link>}
                <Link href="/about" className="px-4 py-2 hover:bg-gray-100 rounded"><TranslatedText text="Про проект" /></Link>
                <div className="border-t my-2" />
                <div className="lang-switcher-block hidden [@media(max-width:399px)]:block">
                  <LanguageSwitcher />
                </div>
                {!user && (
                  <>
                    <button onClick={() => setModal('login')} className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition w-full mb-2 block sm:hidden">
                      <TranslatedText text="Увійти" />
                    </button>
                    <button onClick={() => setModal('register')} className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition w-full block sm:hidden">
                      <TranslatedText text="Реєстрація" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Login
        open={modal === 'login'}
        onClose={() => setModal(null)}
        onForgot={() => setModal('forgot')}
        setLoginEmail={setLoginEmail}
      />
      <ForgotPassword
        open={modal === 'forgot'}
        email={loginEmail}
        lang={lang}
        onClose={() => setModal(null)}
        onReset={() => setModal('reset')}
        onBack={() => setModal('login')}
      />
      <ResetPassword
        open={modal === 'reset'}
        email={loginEmail}
        lang={lang}
        onClose={() => setModal(null)}
        onBack={() => setModal('login')}
        onLogin={() => setModal('login')}
      />
      <Register
        open={modal === 'register'}
        onClose={() => setModal(null)}
        onSuccess={(email, name, password) => {
          setRegisterEmail(email);
          setRegisterName(name);
          setRegisterPassword(password);
          setModal('registerCode');
        }}
      />
      <ConfirmCode
        open={modal === 'registerCode'}
        email={registerEmail}
        name={registerName}
        password={registerPassword}
        lang={lang}
        onClose={() => setModal(null)}
        onBack={() => setModal('register')}
        onSuccess={() => setModal('registerSuccess')}
      />
      <RegisterSuccess
        open={modal === 'registerSuccess'}
        onLogin={() => setModal('login')}
      />
      {loadingLogout && (
        <PreloaderWrapper>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <span className="text-lg font-medium mt-4"><TranslatedText text="Вихід..." /></span>
          </div>
        </PreloaderWrapper>
      )}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center text-red-600">
              <TranslatedText text="Видалити акаунт?" />
            </h2>
            <p className="mb-6 text-center">
              <TranslatedText text="Ви впевнені, що хочете видалити свій акаунт? Цю дію не можна скасувати." />
            </p>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDeleteModal(false)}>
                <TranslatedText text="Скасувати" />
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleDeleteAccount}>
                <TranslatedText text="Видалити" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </nav>
  )
}