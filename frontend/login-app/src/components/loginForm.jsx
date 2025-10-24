import React, { useState } from 'react';
import '../styles/LoginForm.css';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Proszę wypełnić wszystkie pola');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd logowania');
        return;
      }

      // zapis JWT w localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/report'); // przekierowanie do strony raportowania
    } catch (err) {
      setError('Błąd serwera');
    }
  };

  return (
    <div className="login-form-container">
      <h2>Logowanie</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-container">
          <label htmlFor="email">Adres e-mail</label>
          <input
            type="email"
            id="email"
            placeholder="Wpisz swój e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="password">Hasło</label>
          <input
            type="password"
            id="password"
            placeholder="Wpisz swoje hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Zaloguj się
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
