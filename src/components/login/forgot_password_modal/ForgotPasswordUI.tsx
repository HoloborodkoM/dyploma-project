import React from 'react';
import { TranslatedText } from '../../TranslatedText';
import ForgotPasswordForm from './ForgotPasswordForm';

interface ForgotPasswordUIProps {
  email: string;
  loading: boolean;
  message: { text: string; type: 'success' | 'error' } | null;
  handleSend: (e: React.FormEvent) => Promise<void>;
  handleClose: () => void;
  handleBack: () => void;
}

const ForgotPasswordUI: React.FC<ForgotPasswordUIProps> = ({
  email,
  loading,
  message,
  handleSend,
  handleClose,
  handleBack
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">
          <TranslatedText text="Відновлення пароля" />
        </h2>
        <ForgotPasswordForm
          email={email}
          loading={loading}
          message={message}
          onSend={handleSend}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default ForgotPasswordUI;