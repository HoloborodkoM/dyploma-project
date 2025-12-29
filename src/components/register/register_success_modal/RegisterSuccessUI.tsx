import React from 'react';
import { TranslatedText } from '../../TranslatedText';

interface RegisterSuccessUIProps {
  handleLogin: () => void;
}

const RegisterSuccessUI: React.FC<RegisterSuccessUIProps> = ({
  handleLogin
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <h2 className="text-xl font-bold mb-4 text-center">
          <TranslatedText text="Реєстрація успішна!" />
        </h2>
        <div className="text-green-600 text-center font-medium mb-4">
          <TranslatedText text="Тепер ви можете увійти до свого акаунта" />
        </div>
        <button className="w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition" onClick={handleLogin}>
          <TranslatedText text="Увійти" />
        </button>
      </div>
    </div>
  );
};

export default RegisterSuccessUI;