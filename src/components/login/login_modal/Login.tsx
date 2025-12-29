import React from 'react';
import LoginLogic from './LoginLogic';
import LoginUI from './LoginUI';

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onForgot: () => void;
  setLoginEmail: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ 
  open, 
  onClose, 
  onForgot, 
  setLoginEmail 
}) => {
  return (
    <LoginLogic
      open={open}
      onClose={onClose}
      onForgot={onForgot}
      setLoginEmail={setLoginEmail}
    >
      {({
        email,
        password,
        error,
        loading,
        emailPlaceholder,
        passwordPlaceholder,
        handleSubmit,
        handleClose,
        handleEmailChange,
        handlePasswordChange
      }) => (
        <LoginUI
          email={email}
          password={password}
          error={error}
          loading={loading}
          emailPlaceholder={emailPlaceholder}
          passwordPlaceholder={passwordPlaceholder}
          onForgot={onForgot}
          handleSubmit={handleSubmit}
          handleClose={handleClose}
          handleEmailChange={handleEmailChange}
          handlePasswordChange={handlePasswordChange}
        />
      )}
    </LoginLogic>
  );
};

export default Login;