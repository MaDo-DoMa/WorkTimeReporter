// src/App.jsx
import React from 'react';
import './styles/App.css';
import LoginForm from './components/loginForm';

const App = () => {
  return (
    <div className="app-container">
      <h1>Witaj w aplikacji</h1>
      <LoginForm />
    </div>
  );
};

export default App;

