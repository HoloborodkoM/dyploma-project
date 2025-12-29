import React from 'react';
import ConfirmCodeLogic from './ConfirmCodeLogic';
import ConfirmCodeUI from './ConfirmCodeUI';

interface ConfirmCodeProps {
  open: boolean;
  email: string;
  name: string;
  password: string;
  lang?: 'ua' | 'en';
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfirmCode: React.FC<ConfirmCodeProps> = ({
  open,
  email,
  name,
  password,
  lang,
  onBack,
  onClose,
  onSuccess
}) => {
  return (
    <ConfirmCodeLogic
      open={open}
      email={email}
      name={name}
      password={password}
      lang={lang}
      onBack={onBack}
      onClose={onClose}
      onSuccess={onSuccess}
    >
      {({
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
      }) => (
        <ConfirmCodeUI
          codeDigits={codeDigits}
          codeInputsRef={codeInputsRef}
          loading={loading}
          error={error}
          resendTimer={resendTimer}
          resendLoading={resendLoading}
          resendMessage={resendMessage}
          handleCodeInput={handleCodeInput}
          handleCodePaste={handleCodePaste}
          handleSubmit={handleSubmit}
          handleResend={handleResend}
          handleBack={handleBack}
          handleClose={handleClose}
        />
      )}
    </ConfirmCodeLogic>
  );
};

export default ConfirmCode;