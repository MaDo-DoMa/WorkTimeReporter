import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import '../styles/EmailVerification.css';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token.trim()) {
      setError('Proszę wpisać kod weryfikacyjny');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd weryfikacji');
        return;
      }

      setSuccess('✅ Email zweryfikowany! Możesz się teraz zalogować.');
      
      // Przekieruj do logowania po 2 sekundach
      setTimeout(() => {
        navigate('/', { state: { verified: true } });
      }, 2000);

    } catch (err) {
      console.error('Błąd weryfikacji:', err);
      setError('Błąd połączenia z serwerem');
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Brak adresu email');
      return;
    }

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd wysyłania');
      } else {
        setSuccess('📧 Kod został wysłany ponownie!');
      }
    } catch (err) {
      console.error('Błąd wysyłania:', err);
      setError('Błąd połączenia z serwerem');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2>📧 Weryfikacja emaila</h2>
        <p className="verification-info">
          Wysłaliśmy kod weryfikacyjny na adres:
          <br />
          <strong>{email || 'twój email'}</strong>
        </p>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleVerify} className="verification-form">
          <div className="input-group">
            <label htmlFor="token">Kod weryfikacyjny</label>
            <input
              type="text"
              id="token"
              placeholder="Wklej kod z emaila"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="verification-input"
              autoFocus
              required
            />
            <small className="input-hint">
              Sprawdź swoją skrzynkę pocztową oraz folder SPAM
            </small>
          </div>

          <button type="submit" className="verify-button">
            ✔️ Zweryfikuj
          </button>
        </form>

        <div className="resend-section">
          <p>Nie otrzymałeś kodu?</p>
          <button
            type="button"
            onClick={handleResend}
            className="resend-button"
            disabled={isResending}
          >
            {isResending ? '⏳ Wysyłanie...' : '🔄 Wyślij ponownie'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Powrót do logowania
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;