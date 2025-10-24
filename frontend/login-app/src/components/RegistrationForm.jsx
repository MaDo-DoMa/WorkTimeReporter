import React, { useState } from 'react';
import '../styles/RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const { login, password, firstName, lastName, email, position } = formData;
  if (!login || !password || !firstName || !lastName || !email || !position) {
    setError('Wszystkie pola są wymagane!');
    setSuccess('');
    return;
  }

  fetch('http://localhost:5000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login,
      password,
      first_name: firstName,
      last_name: lastName,
      email,
      position,
    }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        setError(data.error || 'Błąd rejestracji');
        setSuccess('');
      } else {
        setSuccess('Zarejestrowano! Sprawdź maila, aby potwierdzić konto.');
        setError('');
        setFormData({
          login: '',
          password: '',
          firstName: '',
          lastName: '',
          email: '',
          position: '',
        });
      }
    })
    .catch(() => {
      setError('Błąd serwera');
      setSuccess('');
    });
};

  return (
    <div className="registration-form-container">
      <h2>Rejestracja</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="input-container">
          <label htmlFor="login">Login</label>
          <input
            type="text"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Wpisz swój login"
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="password">Hasło</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Wpisz swoje hasło"
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="firstName">Imię</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Wpisz swoje imię"
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="lastName">Nazwisko</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Wpisz swoje nazwisko"
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="email">Adres e-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Wpisz swój e-mail"
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="position">Stanowisko pracy</label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Wpisz swoje stanowisko pracy"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Zarejestruj się
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
