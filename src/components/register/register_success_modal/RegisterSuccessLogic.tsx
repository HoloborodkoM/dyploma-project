import React, { useEffect } from 'react';

const TEMP_REGISTER_EMAIL_KEY = 'temp_register_email';
const TEMP_REGISTER_NAME_KEY = 'temp_register_name';

interface RegisterSuccessLogicProps {
  open: boolean;
  onLogin: () => void;
  children: (props: {
    handleLogin: () => void;
  }) => React.ReactNode;
}

const RegisterSuccessLogic: React.FC<RegisterSuccessLogicProps> = ({
  open,
  onLogin,
  children
}) => {
  useEffect(() => {
    if (open) {
      localStorage.removeItem(TEMP_REGISTER_EMAIL_KEY);
      localStorage.removeItem(TEMP_REGISTER_NAME_KEY);
    }
  }, [open]);

  if (!open) return null;

  const handleLogin = () => {
    onLogin();
  };

  return children({
    handleLogin
  });
};

export default RegisterSuccessLogic;