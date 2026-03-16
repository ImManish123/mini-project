import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaTools, FaCalendarAlt, FaUserCircle, FaTachometerAlt, FaSignOutAlt, FaHardHat, FaEnvelope, FaStar, FaCog, FaParking, FaExclamationTriangle, FaBuilding } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin, isWorker, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? 'shadow-lg' : ''}`} 
      style={{
        background: scrolled 
          ? 'linear-gradient(135deg, #6C63FF 0%, #4834d4 100%)' 
          : 'linear-gradient(135deg, rgba(108,99,255,0.95) 0%, rgba(72,52,212,0.95) 100%)',
        transition: 'all 0.3s ease',
        padding: scrolled ? '6px 0' : '10px 0'
      }}>
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/" style={{letterSpacing: '-0.5px'}}>
          <span style={{background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '4px 8px', marginRight: '8px'}}>
            <FaHome />
          </span>
          HomeServ
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" style={{padding: '6px 10px'}}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/">
                <FaHome className="me-1" size={13} />Home
              </Link>
            </li>
            {/* Services & Parking links - hide for workers */}
            {!(isAuthenticated() && isWorker()) && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/services') ? 'active' : ''}`} to="/services">
                    <FaTools className="me-1" size={13} />Services
                  </Link>
                </li>
                {isAuthenticated() && !isAdmin() ? (
                  <li className="nav-item dropdown">
                    <a className={`nav-link dropdown-toggle ${isActive('/parking') || isActive('/my-parking') ? 'active' : ''}`} href="#!" role="button" data-bs-toggle="dropdown">
                      <FaParking className="me-1" size={13} />Parking
                    </a>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/parking"><FaParking className="me-2 text-muted" size={12} />Book Parking</Link></li>
                      <li><Link className="dropdown-item" to="/my-parking"><FaCalendarAlt className="me-2 text-muted" size={12} />My Parking</Link></li>
                    </ul>
                  </li>
                ) : (
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/parking') ? 'active' : ''}`} to="/parking">
                      <FaParking className="me-1" size={13} />Parking
                    </Link>
                  </li>
                )}
              </>
            )}
            {/* Customer nav */}
            {isAuthenticated() && !isAdmin() && !isWorker() && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                    <FaTachometerAlt className="me-1" size={13} />Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`} to="/my-bookings">
                    <FaCalendarAlt className="me-1" size={13} />My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/my-messages') ? 'active' : ''}`} to="/my-messages">
                    <FaEnvelope className="me-1" size={13} />Messages
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/my-complaints') ? 'active' : ''}`} to="/my-complaints">
                    <FaExclamationTriangle className="me-1" size={13} />Complaints
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/lift-booking') ? 'active' : ''}`} to="/lift-booking">
                    <FaBuilding className="me-1" size={13} />Lift Booking
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/sos') ? 'active' : ''}`} to="/sos"
                    style={{ color: '#ff6b6b', fontWeight: 600 }}>
                    🚨 SOS
                  </Link>
                </li>
              </>
            )}
            {/* Worker nav */}
            {isAuthenticated() && isWorker() && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/worker') ? 'active' : ''}`} to="/worker">
                    <FaTachometerAlt className="me-1" size={13} />Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/worker/bookings') ? 'active' : ''}`} to="/worker/bookings">
                    <FaCalendarAlt className="me-1" size={13} />Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/worker/messages') ? 'active' : ''}`} to="/worker/messages">
                    <FaEnvelope className="me-1" size={13} />Messages
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/worker/reviews') ? 'active' : ''}`} to="/worker/reviews">
                    <FaStar className="me-1" size={13} />Reviews
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/worker/complaints') ? 'active' : ''}`} to="/worker/complaints">
                    <FaExclamationTriangle className="me-1" size={13} />Complaints
                  </Link>
                </li>
              </>
            )}
            {/* Admin nav */}
            {isAuthenticated() && isAdmin() && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin') ? 'active' : ''}`} to="/admin">
                    <FaTachometerAlt className="me-1" size={13} />Dashboard
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#!" role="button" data-bs-toggle="dropdown">
                    <FaCog className="me-1" size={13} />Manage
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/admin/categories"><FaTools className="me-2 text-muted" size={12} />Categories</Link></li>
                    <li><Link className="dropdown-item" to="/admin/vendors"><FaUserCircle className="me-2 text-muted" size={12} />Vendors</Link></li>
                    <li><Link className="dropdown-item" to="/admin/bookings"><FaCalendarAlt className="me-2 text-muted" size={12} />Bookings</Link></li>
                    <li><Link className="dropdown-item" to="/admin/users"><FaHardHat className="me-2 text-muted" size={12} />Users</Link></li>
                    <li><Link className="dropdown-item" to="/admin/reviews"><FaStar className="me-2 text-muted" size={12} />Reviews</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to="/admin/messages"><FaEnvelope className="me-2 text-muted" size={12} />Activity Log</Link></li>
                    <li><Link className="dropdown-item" to="/admin/parking"><FaParking className="me-2 text-muted" size={12} />Parking</Link></li>
                    <li><Link className="dropdown-item" to="/admin/complaints"><FaExclamationTriangle className="me-2 text-muted" size={12} />Complaints</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to="/admin/sos">🚨 SOS Alerts</Link></li>
                    <li><Link className="dropdown-item" to="/admin/lift-bookings"><FaBuilding className="me-2 text-muted" size={12} />Lift Bookings</Link></li>
                  </ul>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {isAuthenticated() ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#!" role="button" data-bs-toggle="dropdown">
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: '8px', fontSize: '13px', fontWeight: 700
                  }}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span style={{fontSize: '14px'}}>{user.name}</span>
                  {isWorker() && <FaHardHat className="ms-2 text-warning" size={13} />}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" style={{minWidth: '220px'}}>
                  <li className="px-3 py-2">
                    <div className="fw-bold" style={{fontSize: '14px'}}>{user.name}</div>
                    <div className="text-muted" style={{fontSize: '12px'}}>{user.email}</div>
                    <span className="badge bg-primary bg-opacity-10 text-primary mt-1" style={{fontSize: '10px'}}>{user.role}</span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {isWorker() && (
                    <li><Link className="dropdown-item" to="/worker/profile"><FaUserCircle className="me-2 text-muted" size={13} />My Profile</Link></li>
                  )}
                  {!isAdmin() && !isWorker() && (
                    <li><Link className="dropdown-item" to="/profile"><FaUserCircle className="me-2 text-muted" size={13} />My Profile</Link></li>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" size={13} />Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <li className="nav-item">
                  <Link className="nav-link" to="/login" style={{fontSize: '14px'}}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm px-3 fw-semibold" to="/register" 
                    style={{borderRadius: '10px', fontSize: '13px', padding: '6px 16px'}}>
                    Sign Up
                  </Link>
                </li>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
