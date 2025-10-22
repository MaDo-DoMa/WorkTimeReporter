// src/components/RegistrationForm.jsx
import React, { useState } from 'react';
import '../styles/RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.position) {
      setError('Wszystkie pola są wymagane!');
      return;
    }
    alert('Rejestracja zakończona sukcesem!');
  };

  return (
    <div className="registration-form-container">
      <h2>Rejestracja</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="registration-form">
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
