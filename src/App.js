import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Main from './components/Main/Main';
import Login from './components/Login/Login';
import Profile from './components/Profile/Profile';
import Files from './components/Files/Files';
import About from './components/About/About';
import { isLoggedIn } from './useAPI';

function ProtectedRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();
      setAuthenticated(loggedIn);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    return null; // Or a loading spinner
  }

  return authenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className='App-header'>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
          <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;