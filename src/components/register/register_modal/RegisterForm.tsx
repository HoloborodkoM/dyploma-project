import React, { useState } from 'react';

interface RegisterFormProps {
  name: string;
  email: string;
  password: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

const RegisterForm = ({
  name,
  email,
  password,
  namePlaceholder,
  emailPlaceholder,
  passwordPlaceholder,
  loading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
}: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <input
        type="text"
        className="w-full border rounded px-3 py-2"
        placeholder={namePlaceholder}
        value={name}
        onChange={e => onNameChange(e.target.value)}
        disabled={loading}
      />
      <input
        type="email"
        className="w-full border rounded px-3 py-2"
        placeholder={emailPlaceholder}
        value={email}
        onChange={e => onEmailChange(e.target.value)}
        disabled={loading}
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full border rounded px-3 py-2 pr-10"
          placeholder={passwordPlaceholder}
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          disabled={loading}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          onClick={() => setShowPassword(v => !v)}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
          )}
        </button>
      </div>
    </>
  );
};

export default RegisterForm;