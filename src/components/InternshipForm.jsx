import { useState } from 'react';

const empty = { title: '', company: '', location: '', remote: false, eligibility: 'Any', skills: '', description: '', deadline: '', applyLink: '' };

export default function InternshipForm({ initial, onSubmit, onCancel, saving }) {
  const [f, setF] = useState(
    initial
      ? { ...initial, skills: (initial.skills || []).join(', '), deadline: initial.deadline?.slice(0, 10) || '' }
      : empty
  );
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...f, skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean) });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal" onSubmit={submit}>
        <h2>{initial ? 'Edit internship' : 'Add internship'}</h2>
        <div className="grid2">
          <label>Title<input required value={f.title} onChange={set('title')} /></label>
          <label>Company<input required value={f.company} onChange={set('company')} /></label>
          <label>Location<input value={f.location} onChange={set('location')} placeholder="e.g. Chennai" /></label>
          <label>Eligibility
            <select value={f.eligibility} onChange={set('eligibility')}>
              <option>Any</option><option>Pre-final year</option><option>Final year</option><option>Graduates</option>
            </select>
          </label>
          <label>Application deadline<input required type="date" value={f.deadline} onChange={set('deadline')} /></label>
          <label className="check"><input type="checkbox" checked={f.remote} onChange={set('remote')} /> Remote position</label>
        </div>
        <label>Skills (comma separated)<input value={f.skills} onChange={set('skills')} placeholder="React, Node.js, MongoDB" /></label>
        <label>Description<textarea rows="3" value={f.description} onChange={set('description')} /></label>
        <label>Application link or instructions<input required value={f.applyLink} onChange={set('applyLink')} placeholder="https://… or “Email resume to …”" /></label>
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save internship'}</button>
        </div>
      </form>
    </div>
  );
}
