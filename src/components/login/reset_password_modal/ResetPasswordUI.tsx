import React from 'react';
import { TranslatedText } from '../../TranslatedText';
import ResetPasswordForm from './ResetPasswordForm';

interface ResetPasswordUIProps {
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
}

const ResetPasswordUI: React.FC<ResetPasswordUIProps> = ({
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
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">
          <TranslatedText text="Зміна пароля" />
        </h2>
        
        {success ? (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-lg font-medium">
              <TranslatedText text="Пароль успішно змінено!" />
            </div>
            <button 
              className="border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition"
              onClick={handleLogin}
            >
              <TranslatedText text="Увійти" />
            </button>
          </div>
        ) : (
          <ResetPasswordForm
            codeDigits={codeDigits}
            codeInputsRef={codeInputsRef}
            newPassword={newPassword}
            loading={loading}
            error={error}
            onCodeInput={handleCodeInput}
            onCodePaste={handleCodePaste}
            onPasswordChange={handlePasswordChange}
            onBack={handleBack}
            onSubmit={handleSubmit}
            resendTimer={resendTimer}
            resendLoading={resendLoading}
            resendMessage={resendMessage}
            onResend={handleResend}
          />
        )}
      </div>
    </div>
  );
};

export default ResetPasswordUI;