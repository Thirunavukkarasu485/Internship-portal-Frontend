import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="nav">
      <Link to="/" className="brand">InternBoard</Link>
      <nav>
        {user ? (
          <>
            <NavLink to="/dashboard">Internships</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <span className={`pill ${user.role}`}>{user.role}</span>
            <button className="btn ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Create account</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
