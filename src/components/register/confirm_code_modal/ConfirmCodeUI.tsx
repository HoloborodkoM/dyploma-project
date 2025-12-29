import React from 'react';
import { TranslatedText } from '../../TranslatedText';
import ConfirmCodeForm from './ConfirmCodeForm';

interface ConfirmCodeUIProps {
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
}

const ConfirmCodeUI: React.FC<ConfirmCodeUIProps> = ({
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
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">
          <TranslatedText text="Підтвердження пошти" />
        </h2>
        <ConfirmCodeForm
          codeDigits={codeDigits}
          codeInputsRef={codeInputsRef}
          loading={loading}
          error={error}
          resendTimer={resendTimer}
          resendLoading={resendLoading}
          resendMessage={resendMessage}
          onCodeInput={handleCodeInput}
          onCodePaste={handleCodePaste}
          onBack={handleBack}
          onSubmit={handleSubmit}
          onResend={handleResend}
        />
      </div>
    </div>
  );
};

export default ConfirmCodeUI;