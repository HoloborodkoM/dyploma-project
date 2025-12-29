import React from 'react';
import { TranslatedText } from '../../TranslatedText';

interface ForgotPasswordFormProps {
  email: string;
  loading: boolean;
  message: { text: string; type: 'success' | 'error' } | null;
  onSend: (e: React.FormEvent) => void;
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  email, 
  loading, 
  message, 
  onSend, 
  onBack 
}) => {
  return (
    <form onSubmit={onSend} className="space-y-4">
      <div>
        <div className="mb-2">
          <TranslatedText text="Відправити код на пошту" /> <b>{email}</b>
        </div>
      </div>
      {message && (
        <div className={`text-sm ${message.type === 'success' ? 'text-blue-600' : 'text-red-500'}`}>{message.text}</div>
      )}
      <div className="flex justify-between items-center">
        <button type="button" className="text-gray-500 text-sm underline" onClick={onBack}>
          <TranslatedText text="Назад" />
        </button>
        <button type="submit" className="border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition flex items-center justify-center" disabled={loading}>
          {loading && <span className="spinner mr-2" style={{ width: 18, height: 18 }} />}
          <TranslatedText text="Відправити код" />
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;