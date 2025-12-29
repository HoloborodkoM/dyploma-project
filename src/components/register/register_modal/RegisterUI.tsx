import React from 'react';
import { TranslatedText } from '../../TranslatedText';
import RegisterForm from './RegisterForm';

interface RegisterUIProps {
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
}

const RegisterUI: React.FC<RegisterUIProps> = ({
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
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">
          <TranslatedText text="Реєстрація" />
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RegisterForm
            name={name}
            email={email}
            password={password}
            namePlaceholder={namePlaceholder}
            emailPlaceholder={emailPlaceholder}
            passwordPlaceholder={passwordPlaceholder}
            loading={loading}
            onNameChange={handleNameChange}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button 
            type="submit" 
            className="w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition flex items-center justify-center" 
            disabled={loading}
          >
            {loading && <span className="spinner mr-2" style={{ width: 18, height: 18 }} />}
            <TranslatedText text="Зареєструватися" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterUI;