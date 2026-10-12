import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { login, register } from '../../useAPI';
import Logo from '../Logo';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'A number', test: (p) => /[0-9]/.test(p) },
  { label: 'A symbol, like ! @ # $ %', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function Login() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailInvalid = isRegister && emailTouched && email !== '' && !isEmail(email);
  const confirmMismatch = isRegister && confirmPassword !== '' && confirmPassword !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (isRegister) {
      if (!isEmail(email)) return setError('Enter a valid email address.');
      if (!PASSWORD_RULES.every((rule) => rule.test(password))) return setError('Your password is missing some of the requirements below.');
      if (password !== confirmPassword) return setError('The two passwords don’t match.');
    }

    setLoading(true);
    if (isRegister) {
      const result = await register(username, password, email);
      if (result.success) {
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        setNotice('Account created. Sign in to continue.');
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(username, password);
      if (result.success) {
        navigate('/');
        return;
      }
      setError(result.error);
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setEmailTouched(false);
    setError('');
    setNotice('');
  };

  return (
    <main className="login">
      <div className="login-intro">
        <Link to="/about" className="login-brand"><Logo size={36} />Minutes Generator</Link>
        <p className="login-lede">Turn a meeting transcript or recording into structured minutes and a PDF.</p>
      </div>

      <section className="panel panel-glass login-card" aria-labelledby="login-title">
        <h1 id="login-title">{isRegister ? 'Create your account' : 'Sign in'}</h1>

        <div aria-live="polite">
          {error && <p className="notice notice-error">{error}</p>}
          {notice && <p className="notice notice-success">{notice}</p>}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                className="input"
                type="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                aria-invalid={emailInvalid}
                aria-describedby={emailInvalid ? 'email-error' : undefined}
                required
              />
              {emailInvalid && <span id="email-error" className="field-error">This doesn’t look like an email address.</span>}
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="username">{isRegister ? 'Username' : 'Username or email'}</label>
            <input
              className="input"
              type="text"
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              className="input"
              type="password"
              id="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={isRegister ? 'password-rules' : undefined}
              required
            />
            {isRegister && (
              <ul id="password-rules" className="password-rules">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li key={rule.label} className={met ? 'met' : ''}>
                      <span aria-hidden="true" className="rule-mark">{met ? '✓' : '·'}</span>
                      {rule.label}
                      <span className="visually-hidden">{met ? ' (done)' : ' (missing)'}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {isRegister && (
            <div className="field">
              <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
              <input
                className="input"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={confirmMismatch}
                required
              />
              {confirmMismatch && <span className="field-error">Passwords don’t match yet.</span>}
            </div>
          )}

          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? (isRegister ? 'Creating account' : 'Signing in') : (isRegister ? 'Create account' : 'Sign in')}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? 'Already have an account?' : 'New here?'}
          <button type="button" className="link-btn" onClick={toggleMode}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  );
}

export default Login;
