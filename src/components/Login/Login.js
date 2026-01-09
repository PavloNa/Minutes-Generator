import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../images/logo.png';
import { login, register } from '../../useAPI';

function Login() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation states
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Email validation
  const [isEmailValid, setIsEmailValid] = useState(true);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password requirements in real-time
  useEffect(() => {
    if (isRegister && password) {
      setPasswordRequirements({
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      });
    } else {
      setPasswordRequirements({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
    }
  }, [password, isRegister]);

  // Validate email on blur
  const handleEmailBlur = () => {
    if (email) {
      setIsEmailValid(validateEmail(email));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      // Validate email
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Validate password requirements
      const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
      if (!allRequirementsMet) {
        setError('Password does not meet all requirements');
        setLoading(false);
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const result = await register(username, password, email);
      if (result.success) {
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        setError('Registration successful! Please login.');
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setError('');
    setIsEmailValid(true);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="Enter your email"
                className={!isEmailValid && email ? 'invalid-input' : ''}
                required
              />
              {!isEmailValid && email && (
                <span className="validation-error">Please enter a valid email address</span>
              )}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="username">{isRegister ? 'Username' : 'Username or Email'}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isRegister ? 'Enter your username' : 'Enter your username or email'}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            {isRegister && password && (
              <div className="password-requirements">
                <div className={`requirement ${passwordRequirements.minLength ? 'met' : 'unmet'}`}>
                  <span className="icon">{passwordRequirements.minLength ? '✓' : '✗'}</span>
                  At least 8 characters
                </div>
                <div className={`requirement ${passwordRequirements.hasUpperCase ? 'met' : 'unmet'}`}>
                  <span className="icon">{passwordRequirements.hasUpperCase ? '✓' : '✗'}</span>
                  One uppercase letter
                </div>
                <div className={`requirement ${passwordRequirements.hasLowerCase ? 'met' : 'unmet'}`}>
                  <span className="icon">{passwordRequirements.hasLowerCase ? '✓' : '✗'}</span>
                  One lowercase letter
                </div>
                <div className={`requirement ${passwordRequirements.hasNumber ? 'met' : 'unmet'}`}>
                  <span className="icon">{passwordRequirements.hasNumber ? '✓' : '✗'}</span>
                  One number
                </div>
                <div className={`requirement ${passwordRequirements.hasSpecialChar ? 'met' : 'unmet'}`}>
                  <span className="icon">{passwordRequirements.hasSpecialChar ? '✓' : '✗'}</span>
                  One special character (!@#$%^&*...)
                </div>
              </div>
            )}
          </div>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}
          {!isRegister && <p>Forgot your password? <a href="/forgot-password">Reset</a></p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>
        <p>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span className="toggle-link" onClick={toggleMode}>
            {isRegister ? 'Login' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
