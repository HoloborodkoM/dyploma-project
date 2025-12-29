import React from 'react';
import { TranslatedText } from '../../TranslatedText';
import LoginForm from './LoginForm';

interface LoginUIProps {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  onForgot: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleClose: () => void;
  handleEmailChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
}

const LoginUI: React.FC<LoginUIProps> = ({
  email,
  password,
  error,
  loading,
  emailPlaceholder,
  passwordPlaceholder,
  onForgot,
  handleSubmit,
  handleClose,
  handleEmailChange,
  handlePasswordChange
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">
          <TranslatedText text="Увійти" />
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <LoginForm
            email={email}
            password={password}
            emailPlaceholder={emailPlaceholder}
            passwordPlaceholder={passwordPlaceholder}
            loading={loading}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {(error === 'Невірний пароль' || error === 'Incorrect password') && (
            <button
              type="button"
              className="text-blue-600 text-sm underline hover:text-blue-800"
              onClick={onForgot}
            >
              <TranslatedText text="Забули пароль?" />
            </button>
          )}
          <button 
            type="submit" 
            className="w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition flex items-center justify-center" 
            disabled={loading}
          >
            {loading && <span className="spinner mr-2" style={{ width: 18, height: 18 }} />}
            <TranslatedText text="Увійти" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginUI;