import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiDollarSign, FiUsers, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isOPS } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/payouts" className="navbar-brand">
          <span className="navbar-brand-icon">₹</span>
          <span className="navbar-brand-text">PayoutMgmt</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link
            to="/payouts"
            className={`nav-link ${isActive('/payouts') ? 'nav-link--active' : ''}`}
          >
            <FiDollarSign />
            Payouts
          </Link>
          <Link
            to="/vendors"
            className={`nav-link ${isActive('/vendors') ? 'nav-link--active' : ''}`}
          >
            <FiUsers />
            Vendors
          </Link>
        </div>

        {/* User Info + Logout */}
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className={`role-badge role-badge--${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className="btn-icon btn-logout" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
          {/* Mobile Menu Toggle */}
          <button
            className="btn-icon mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link
            to="/payouts"
            className={`mobile-nav-link ${isActive('/payouts') ? 'nav-link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <FiDollarSign /> Payouts
          </Link>
          <Link
            to="/vendors"
            className={`mobile-nav-link ${isActive('/vendors') ? 'nav-link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <FiUsers /> Vendors
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
