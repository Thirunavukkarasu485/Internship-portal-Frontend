import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password); // no role is ever sent
      navigate('/dashboard', { replace: true, state: { welcome: true } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <form className="card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">Student accounts are free.</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        <label>Full name<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} autoComplete="new-password" /></label>
        <button className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
