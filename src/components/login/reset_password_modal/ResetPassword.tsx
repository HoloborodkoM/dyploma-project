import React from 'react';
import ResetPasswordLogic from './ResetPasswordLogic';
import ResetPasswordUI from './ResetPasswordUI';

interface ResetPasswordProps {
  open: boolean;
  email: string;
  lang?: 'ua' | 'en';
  onClose: () => void;
  onBack: () => void;
  onLogin: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ 
  open, 
  email, 
  lang, 
  onClose, 
  onBack, 
  onLogin 
}) => {
  return (
    <ResetPasswordLogic
      open={open}
      email={email}
      lang={lang}
      onClose={onClose}
      onBack={onBack}
      onLogin={onLogin}
    >
      {({
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
      }) => (
        <ResetPasswordUI
          codeDigits={codeDigits}
          codeInputsRef={codeInputsRef}
          newPassword={newPassword}
          loading={loading}
          error={error}
          success={success}
          resendTimer={resendTimer}
          resendLoading={resendLoading}
          resendMessage={resendMessage}
          handleCodeInput={handleCodeInput}
          handleCodePaste={handleCodePaste}
          handlePasswordChange={handlePasswordChange}
          handleSubmit={handleSubmit}
          handleResend={handleResend}
          handleClose={handleClose}
          handleBack={handleBack}
          handleLogin={handleLogin}
        />
      )}
    </ResetPasswordLogic>
  );
};

export default ResetPassword;