import React from 'react';
import { TranslatedText } from '../../TranslatedText';

interface ConfirmCodeFormProps {
  codeDigits: string[];
  codeInputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
  loading: boolean;
  error: string;
  resendTimer: number;
  resendLoading: boolean;
  resendMessage: string;
  onCodeInput: (idx: number, value: string) => void;
  onCodePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
}

const ConfirmCodeForm: React.FC<ConfirmCodeFormProps> = ({
  codeDigits,
  codeInputsRef,
  loading,
  error,
  resendTimer,
  resendLoading,
  resendMessage,
  onCodeInput,
  onCodePaste,
  onBack,
  onSubmit,
  onResend
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          <TranslatedText text="Введіть код з пошти" />
        </label>
        <div className="flex space-x-2 justify-center mb-2">
          {codeDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { codeInputsRef.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-10 h-12 text-center border rounded text-xl font-mono focus:ring-2 focus:ring-blue-400"
              value={digit}
              onChange={e => onCodeInput(idx, e.target.value)}
              onPaste={idx === 0 ? onCodePaste : undefined}
              onKeyDown={e => {
                if (e.key === 'Backspace' && !codeDigits[idx] && idx > 0) {
                  codeInputsRef.current[idx - 1]?.focus();
                }
              }}
              autoFocus={idx === 0}
              disabled={loading}
            />
          ))}
        </div>
        <button
          type="button"
          className={`w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition flex items-center justify-center mb-2 ${resendTimer > 0 ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : ''}`}
          onClick={onResend}
          disabled={resendTimer > 0 || resendLoading}
        >
          {resendTimer > 0 ? (
            <span><TranslatedText text="Надіслати ще раз" /> ({resendTimer})</span>
          ) : (
            <TranslatedText text="Надіслати ще раз" />
          )}
        </button>
        {resendMessage && <div className="text-green-600 text-sm text-center mb-1">{resendMessage}</div>}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-between items-center">
        <button type="button" className="text-gray-500 text-sm underline" onClick={onBack}>
          <TranslatedText text="Назад" />
        </button>
        <button type="submit" className="border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition flex items-center justify-center" disabled={loading}>
          {loading && <span className="spinner mr-2" style={{ width: 18, height: 18 }} />}
          <TranslatedText text="Підтвердити" />
        </button>
      </div>
    </form>
  );
};

export default ConfirmCodeForm;