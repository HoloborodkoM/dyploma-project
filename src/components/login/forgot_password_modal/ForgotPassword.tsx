import React from 'react';
import ForgotPasswordLogic from './ForgotPasswordLogic';
import ForgotPasswordUI from './ForgotPasswordUI';

interface ForgotPasswordProps {
  open: boolean;
  email: string;
  lang?: 'ua' | 'en';
  onClose: () => void;
  onReset: () => void;
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ 
  open, 
  email, 
  lang, 
  onClose, 
  onReset, 
  onBack 
}) => {
  return (
    <ForgotPasswordLogic
      open={open}
      email={email}
      lang={lang}
      onClose={onClose}
      onReset={onReset}
      onBack={onBack}
    >
      {({
        loading,
        message,
        handleSend,
        handleClose,
        handleBack
      }) => (
        <ForgotPasswordUI
          email={email}
          loading={loading}
          message={message}
          handleSend={handleSend}
          handleClose={handleClose}
          handleBack={handleBack}
        />
      )}
    </ForgotPasswordLogic>
  );
};

export default ForgotPassword;