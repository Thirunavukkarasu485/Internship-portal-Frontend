import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <main className="page narrow">
      <h1>My profile</h1>
      {error && <div className="alert error">{error}</div>}
      {!user && !error && <p className="muted">Loading…</p>}
      {user && (
        <dl className="card profile">
          <dt>Name</dt><dd>{user.name}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Role</dt><dd><span className={`pill ${user.role}`}>{user.role}</span></dd>
          <dt>Member since</dt><dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
        </dl>
      )}
    </main>
  );
}
