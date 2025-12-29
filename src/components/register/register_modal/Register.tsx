import React from 'react';
import RegisterLogic from './RegisterLogic';
import RegisterUI from './RegisterUI';

interface RegisterProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string, name: string, password: string) => void;
}

const Register: React.FC<RegisterProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  return (
    <RegisterLogic
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
    >
      {({
        name,
        email,
        password,
        error,
        loading,
        namePlaceholder,
        emailPlaceholder,
        passwordPlaceholder,
        handleSubmit,
        handleNameChange,
        handleEmailChange,
        handlePasswordChange,
        handleClose
      }) => (
        <RegisterUI
          name={name}
          email={email}
          password={password}
          error={error}
          loading={loading}
          namePlaceholder={namePlaceholder}
          emailPlaceholder={emailPlaceholder}
          passwordPlaceholder={passwordPlaceholder}
          handleSubmit={handleSubmit}
          handleNameChange={handleNameChange}
          handleEmailChange={handleEmailChange}
          handlePasswordChange={handlePasswordChange}
          handleClose={handleClose}
        />
      )}
    </RegisterLogic>
  );
};

export default Register;