import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FaUsers, FaStore, FaCalendarCheck, FaRupeeSign, FaClock, FaChartLine, FaArrowRight, FaHardHat, FaEnvelope, FaTachometerAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [extra, setExtra] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await adminAPI.getDashboard();
      if (res.data.stats) {
        setStats(res.data.stats);
        setExtra(res.data);
      } else {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header admin-header" style={{paddingBottom: '60px'}}>
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <FaTachometerAlt className="text-white" size={22} />
            </div>
            <div>
              <h2 className="fw-bold text-white mb-1" style={{letterSpacing: '-0.5px'}}>Admin Dashboard</h2>
              <p className="text-white mb-0" style={{opacity: 0.7, fontSize: '14px'}}>Overview of your platform performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '-45px'}}>
        {/* Main Stats */}
        <div className="row g-3 mb-4">
          {[
            { to: '/admin/bookings', label: 'Total Bookings', value: stats?.totalBookings || 0, sub: `${stats?.todayBookings || 0} today`, bg: 'linear-gradient(135deg, #6C63FF, #4834d4)', icon: <FaCalendarCheck size={32} /> },
            { to: '/admin/bookings', label: 'Total Revenue', value: `Rs. ${stats?.totalRevenue?.toLocaleString() || 0}`, sub: `Rs. ${stats?.monthlyRevenue?.toLocaleString() || 0} this month`, bg: 'linear-gradient(135deg, #00b894, #00cec9)', icon: <FaRupeeSign size={32} /> },
            { to: '/admin/vendors', label: 'Active Vendors', value: stats?.activeVendors || 0, sub: `${stats?.totalVendors || 0} total`, bg: 'linear-gradient(135deg, #0984e3, #74b9ff)', icon: <FaStore size={32} /> },
            { to: '/admin/users', label: 'Customers', value: stats?.totalCustomers || 0, sub: 'registered users', bg: 'linear-gradient(135deg, #fdcb6e, #f39c12)', icon: <FaUsers size={32} /> },
          ].map((card, i) => (
            <div key={i} className="col-lg-3 col-md-6">
              <Link to={card.to} className="text-decoration-none">
                <div className="card border-0 admin-stat-card text-white hover-lift" style={{background: card.bg, boxShadow: '0 8px 25px rgba(0,0,0,0.15)'}}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="mb-1" style={{opacity: 0.85, fontSize: '13px', fontWeight: 500}}>{card.label}</p>
                        <h2 className="fw-bold mb-1" style={{fontSize: '1.6rem'}}>{card.value}</h2>
                        <small style={{opacity: 0.75, fontSize: '12px'}}>{card.sub}</small>
                      </div>
                      <div style={{opacity: 0.3}}>{card.icon}</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="row g-3 mb-5">
          {[
            { to: '/admin/bookings', icon: <FaClock size={24} />, value: stats?.pendingBookings || 0, label: 'Pending', color: '#f39c12', bg: 'rgba(243,156,18,0.08)' },
            { to: '/admin/bookings', icon: <FaCalendarCheck size={24} />, value: stats?.completedBookings || 0, label: 'Completed', color: '#00b894', bg: 'rgba(0,184,148,0.08)' },
            { to: '/admin/bookings', icon: <FaChartLine size={24} />, value: extra?.declinedBookings ?? stats?.cancelledBookings ?? 0, label: 'Declined', color: '#d63031', bg: 'rgba(214,48,49,0.08)' },
            { to: '/admin/users', icon: <FaHardHat size={24} />, value: extra?.totalWorkers || 0, label: 'Workers', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
          ].map((card, i) => (
            <div key={i} className="col-md-3 col-6">
              <Link to={card.to} className="text-decoration-none">
                <div className="card border-0 hover-lift" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: card.bg, color: card.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="fw-bold mb-0" style={{fontSize: '1.4rem', color: card.color}}>{card.value}</h3>
                        <small className="text-muted" style={{fontSize: '12px'}}>{card.label}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Unread Messages Banner */}
        {extra?.unreadMessages > 0 && (
          <div className="card border-0 mb-4" style={{background: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.2) !important'}}>
            <div className="card-body p-3 d-flex align-items-center">
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(243,156,18,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginRight: '14px'
              }}>
                <FaEnvelope className="text-warning" size={18} />
              </div>
              <div className="flex-grow-1">
                <span className="fw-semibold" style={{fontSize: '14px'}}>You have <strong>{extra.unreadMessages}</strong> unread message(s) in the activity log.</span>
              </div>
              <Link to="/admin/messages" className="btn btn-sm btn-warning fw-semibold px-3" style={{borderRadius: '8px'}}>View</Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h6 className="fw-bold mb-3" style={{fontSize: '16px'}}>Quick Actions</h6>
        <div className="row g-3 mb-5">
          {[
            { to: '/admin/categories', icon: '📂', title: 'Manage Categories', desc: 'Add or edit service categories', color: '#6C63FF' },
            { to: '/admin/vendors', icon: '👷', title: 'Manage Vendors', desc: 'Approve, block, or manage vendors', color: '#0984e3' },
            { to: '/admin/bookings', icon: '📅', title: 'Manage Bookings', desc: 'View & update booking statuses', color: '#00b894' },
            { to: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'View all customer & worker accounts', color: '#d63031' },
            { to: '/admin/reviews', icon: '⭐', title: 'Manage Reviews', desc: 'Monitor ratings & feedback', color: '#f39c12' },
            { to: '/admin/messages', icon: '💬', title: 'Activity Log', desc: 'View all booking messages', color: '#6c5ce7' },
            { to: '/admin/parking', icon: '🅿️', title: 'Manage Parking', desc: 'Parking slots & bookings', color: '#0984e3' },
            { to: '/admin/complaints', icon: '⚠️', title: 'Manage Complaints', desc: 'Community complaints tracker', color: '#d63031' },
            { to: '/admin/sos', icon: '🆘', title: 'Manage SOS', desc: 'Emergency SOS alerts', color: '#e84393' },
            { to: '/admin/lift-bookings', icon: '🛗', title: 'Manage Lift Bookings', desc: 'Building lift reservations', color: '#00cec9' },
          ].map(item => (
            <div key={item.to} className="col-lg-4 col-md-6">
              <Link to={item.to} className="text-decoration-none">
                <div className="card border-0 hover-lift" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.04)'}}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px', height: '50px', borderRadius: '14px',
                        background: `${item.color}12`, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                        marginRight: '14px'
                      }}>
                        {item.icon}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0 text-dark" style={{fontSize: '14px'}}>{item.title}</h6>
                        <small className="text-muted" style={{fontSize: '12px'}}>{item.desc}</small>
                      </div>
                      <FaArrowRight className="text-muted" size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
