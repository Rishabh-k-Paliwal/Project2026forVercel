import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/garuda.png" alt="Garuda logo" className="logo-mark" />
          <span>
            ElectroRent
            <small className="logo-subtitle">A project by Garuda Creation</small>
          </span>
        </Link>

        <div className="navbar-right">
          <div className="nav-auth-actions">
            {isAuthenticated ? (
              <>
                <span className="user-name">Hi, {user?.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-nav-login">
                  Login
                </Link>
                <Link to="/register" className="btn-nav-register">
                  Register
                </Link>
              </>
            )}
          </div>

          <div
            className="dropdown-container"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="dropdown-trigger menu-trigger">
              Menu <FaChevronDown className="chevron-icon" />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-section">
                  <span className="dropdown-header">Discover</span>
                  <Link to="/" className="dropdown-item">Browse Products</Link>
                  <Link to="/about" className="dropdown-item">About Us</Link>
                  <Link to="/team" className="dropdown-item">Our Team</Link>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-section">
                  <span className="dropdown-header">Support</span>
                  <Link to="/contact" className="dropdown-item">Contact Us</Link>
                  <Link to="/terms" className="dropdown-item">Terms of Service</Link>
                  <Link to="/privacy" className="dropdown-item">Privacy Policy</Link>
                </div>

                {isAuthenticated && (
                  <>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-section">
                      <span className="dropdown-header">My Account</span>
                      <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                      <Link to="/add-product" className="dropdown-item">List New Item</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
