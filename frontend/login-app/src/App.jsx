import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import ReportPage from './components/ReportPage';
import './styles/App.css';

const App = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app-container">
              <h1>Witaj w aplikacji!</h1>
              <div className="form-container">
                {isLogin ? (
                    <LoginForm toggleForm={toggleForm}/>
                ): (
                    <RegistrationForm toggleForm={toggleForm}/>
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
          }
        />
        <Route
          path="/report"
          element={
            <PrivateRoute>
              <ReportPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
