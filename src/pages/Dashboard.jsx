import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import InternshipForm from '../components/InternshipForm';

const daysLeft = (d) => Math.ceil((new Date(d) - new Date().setHours(0, 0, 0, 0)) / 86400000);

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user.role === 'admin';

  const [filters, setFilters] = useState({ search: '', location: '', remote: '', eligibility: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.welcome ? `Welcome, ${user.name}! Your account is ready.` : '');
  const [editing, setEditing] = useState(null); // null | 'new' | internship
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await api.get('/internships', { params });
      setItems(res.data.internships);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // debounce so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const setF = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const hasFilters = Object.values(filters).some(Boolean);
  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 4000); };

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await api.post('/internships', data);
        flash('Internship created successfully.');
      } else {
        await api.put(`/internships/${editing._id}`, data);
        flash('Internship updated successfully.');
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Delete "${it.title}" at ${it.company}?`)) return;
    try {
      await api.delete(`/internships/${it._id}`);
      flash('Internship deleted successfully.');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <main className="page">
      <div className="row between">
        <div>
          <h1>Internships</h1>
          <p className="muted">{isAdmin ? 'Manage the listings students see.' : 'Open positions, sorted by the nearest deadline.'}</p>
        </div>
        {isAdmin && <button className="btn" onClick={() => setEditing('new')}>Add internship</button>}
      </div>

      <section className="filters" aria-label="Search and filters">
        <input type="search" placeholder="Search by title, company or skill" value={filters.search} onChange={setF('search')} className="grow" />
        <input placeholder="Location" value={filters.location} onChange={setF('location')} />
        <select value={filters.remote} onChange={setF('remote')} aria-label="Remote status">
          <option value="">Remote or on-site</option>
          <option value="true">Remote only</option>
          <option value="false">On-site only</option>
        </select>
        <select value={filters.eligibility} onChange={setF('eligibility')} aria-label="Eligibility">
          <option value="">Any eligibility</option>
          <option>Pre-final year</option>
          <option>Final year</option>
          <option>Graduates</option>
        </select>
        {hasFilters && <button className="btn ghost" onClick={() => setFilters({ search: '', location: '', remote: '', eligibility: '' })}>Clear</button>}
      </section>

      {notice && <div className="alert success" role="status">{notice}</div>}
      {error && (
        <div className="alert error" role="alert">
          {error} <button className="link" onClick={load}>Try again</button>
        </div>
      )}

      {loading && <p className="muted">Loading internships…</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">
          <h2>{hasFilters ? 'No internships match your search' : 'No internships posted yet'}</h2>
          <p className="muted">{hasFilters ? 'Try a different keyword or clear the filters.' : isAdmin ? 'Use “Add internship” to post the first one.' : 'Check back soon.'}</p>
        </div>
      )}

      <ul className="list">
        {items.map((it) => {
          const left = daysLeft(it.deadline);
          const isUrl = /^https?:\/\//i.test(it.applyLink);
          return (
            <li key={it._id} className="item">
              <div className="item-main">
                <h2>{it.title}</h2>
                <p className="company">{it.company} · {it.remote ? 'Remote' : it.location || 'Location not specified'}{it.remote && it.location ? ` (${it.location})` : ''}</p>
                {it.description && <p className="desc">{it.description}</p>}
                <div className="tags">
                  {it.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
              <div className="item-side">
                <p className="meta">Eligibility: <b>{it.eligibility}</b></p>
                <p className={`meta ${left <= 5 ? 'soon' : ''}`}>
                  Apply by <b>{new Date(it.deadline).toLocaleDateString()}</b>
                  <br />{left === 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`}
                </p>
                {isUrl ? (
                  <a className="btn" href={it.applyLink} target="_blank" rel="noreferrer">Apply</a>
                ) : (
                  <p className="how"><b>How to apply:</b> {it.applyLink}</p>
                )}
                {isAdmin && (
                  <div className="row">
                    <button className="btn ghost" onClick={() => setEditing(it)}>Edit</button>
                    <button className="btn danger" onClick={() => remove(it)}>Delete</button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <InternshipForm initial={editing === 'new' ? null : editing} saving={saving} onSubmit={save} onCancel={() => setEditing(null)} />
      )}
    </main>
  );
}
