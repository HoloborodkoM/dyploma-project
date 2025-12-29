import React from 'react';
import RegisterSuccessLogic from './RegisterSuccessLogic';
import RegisterSuccessUI from './RegisterSuccessUI';

interface RegisterSuccessProps {
  open: boolean;
  onLogin: () => void;
}

const RegisterSuccess: React.FC<RegisterSuccessProps> = ({
  open,
  onLogin
}) => {
  return (
    <RegisterSuccessLogic
      open={open}
      onLogin={onLogin}
    >
      {({
        handleLogin
      }) => (
        <RegisterSuccessUI
          handleLogin={handleLogin}
        />
      )}
    </RegisterSuccessLogic>
  );
};

export default RegisterSuccess;