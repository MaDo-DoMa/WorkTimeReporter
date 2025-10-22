// src/App.jsx
import React, { useState } from 'react';
import './styles/App.css';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';

const App = () => {
  const [isLogin, setIsLogin] = useState(true); // Przechowujemy, który formularz ma być pokazany

  // Funkcja do przełączania formularzy
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="app-container">
      <h1>Witaj w aplikacji!</h1>
      <div className="form-container">
        {isLogin ? (
          <LoginForm />
        ) : (
          <RegistrationForm />
        )}
      </div>
      <p className="toggle-text">
        {isLogin ? (
          <>
            Nie masz konta?{' '}
            <span onClick={toggleForm} className="toggle-link">
              Zarejestruj się
            </span>
          </>
        ) : (
          <>
            Masz już konto?{' '}
            <span onClick={toggleForm} className="toggle-link">
              Zaloguj się
            </span>
          </>
        )}
      </p>
    </div>
  );
};

export default App;
