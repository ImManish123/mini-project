import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaTools, FaEnvelope, FaStar } from 'react-icons/fa';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [upRes, compRes, allRes] = await Promise.all([
        bookingAPI.getUpcoming(),
        bookingAPI.getCompleted(),
        bookingAPI.getMyBookings()
      ]);
      setUpcoming(upRes.data);
      setCompleted(compRes.data);
      setAllBookings(allRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  const totalSpent = allBookings
    .filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="page-wrapper">
      {/* Welcome Header */}
      <div className="page-header" style={{paddingBottom: '60px'}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="fw-bold text-white mb-2" style={{letterSpacing: '-0.5px'}}>
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-white mb-0" style={{opacity: 0.8, fontSize: '15px'}}>
                Here's your service dashboard — manage your bookings and track your services.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <Link to="/services" className="btn btn-warning fw-bold px-4" style={{borderRadius: '10px'}}>
                <FaTools className="me-2" />Book a Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '-50px'}}>
        {/* Stats Cards — Pulled up from header */}
        <div className="row g-3 mb-5">
          {[
            { icon: <FaCalendarAlt size={22} />, value: allBookings.length, label: 'Total Bookings', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
            { icon: <FaClock size={22} />, value: upcoming.length, label: 'Upcoming', color: '#f39c12', bg: 'rgba(243,156,18,0.08)' },
            { icon: <FaCheckCircle size={22} />, value: completed.length, label: 'Completed', color: '#00b894', bg: 'rgba(0,184,148,0.08)' },
            { icon: <FaTimesCircle size={22} />, value: allBookings.filter(b => b.status === 'CANCELLED').length, label: 'Cancelled', color: '#d63031', bg: 'rgba(214,48,49,0.08)' },
          ].map((stat, i) => (
            <div key={i} className="col-md-3 col-6">
              <Link to="/my-bookings" className="text-decoration-none">
                <div className="card border-0 p-3 stat-card hover-lift" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="d-flex align-items-center">
                    <div className="me-3" style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: stat.bg, color: stat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="fw-bold mb-0" style={{fontSize: '1.5rem'}}>{stat.value}</h3>
                      <small className="text-muted" style={{fontSize: '12px'}}>{stat.label}</small>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Total Spent Card */}
        {totalSpent > 0 && (
          <div className="card border-0 welcome-card mb-4 text-white" style={{boxShadow: '0 8px 30px rgba(108,99,255,0.25)'}}>
            <div className="card-body p-4" style={{position: 'relative', zIndex: 1}}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1" style={{opacity: 0.8, fontSize: '14px'}}>Total Amount Spent</p>
                  <h3 className="fw-bold mb-0">Rs. {totalSpent.toLocaleString()}</h3>
                </div>
                <div style={{fontSize: '40px', opacity: 0.4}}>💰</div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Upcoming Bookings */}
          <div className="col-lg-6">
            <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4" style={{borderBottom: '1px solid #f1f3f5'}}>
                <h6 className="fw-bold mb-0">
                  <span style={{background: 'rgba(108,99,255,0.08)', borderRadius: '8px', padding: '4px 8px', marginRight: '8px'}}>📅</span>
                  Upcoming Bookings
                </h6>
                <Link to="/my-bookings" className="text-primary text-decoration-none" style={{fontSize: '13px', fontWeight: 600}}>
                  View All <FaArrowRight className="ms-1" size={10} />
                </Link>
              </div>
              <div className="card-body p-0">
                {upcoming.length > 0 ? upcoming.slice(0, 5).map((booking, i) => (
                  <Link key={booking.id} to={`/booking/${booking.id}`} className="text-decoration-none">
                    <div className={`p-3 px-4 d-flex justify-content-between align-items-center ${i < upcoming.slice(0,5).length - 1 ? 'border-bottom' : ''}`} 
                      style={{transition: 'background 0.2s', cursor: 'pointer'}}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="d-flex align-items-center">
                        <div className="vendor-avatar-sm me-3">{booking.vendor?.name?.charAt(0)}</div>
                        <div>
                          <h6 className="fw-semibold mb-1 text-dark" style={{fontSize: '14px'}}>{booking.vendor?.name}</h6>
                          <small className="text-muted" style={{fontSize: '12px'}}>
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {booking.timeSlot}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={booking.status} />
                        <div className="fw-bold text-primary mt-1" style={{fontSize: '14px'}}>Rs. {booking.totalAmount}</div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-5 text-center">
                    <div style={{fontSize: '48px', marginBottom: '12px', opacity: 0.4}}>📭</div>
                    <p className="text-muted mb-3" style={{fontSize: '14px'}}>No upcoming bookings</p>
                    <Link to="/services" className="btn btn-primary btn-sm px-4">Book a Service</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Completed */}
          <div className="col-lg-6">
            <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <div className="card-header bg-white py-3 px-4" style={{borderBottom: '1px solid #f1f3f5'}}>
                <h6 className="fw-bold mb-0">
                  <span style={{background: 'rgba(0,184,148,0.08)', borderRadius: '8px', padding: '4px 8px', marginRight: '8px'}}>✅</span>
                  Recently Completed
                </h6>
              </div>
              <div className="card-body p-0">
                {completed.length > 0 ? completed.slice(0, 5).map((booking, i) => (
                  <Link key={booking.id} to={`/booking/${booking.id}`} className="text-decoration-none">
                    <div className={`p-3 px-4 d-flex justify-content-between align-items-center ${i < completed.slice(0,5).length - 1 ? 'border-bottom' : ''}`}
                      style={{transition: 'background 0.2s', cursor: 'pointer'}}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="d-flex align-items-center">
                        <div className="vendor-avatar-sm me-3" style={{background: 'linear-gradient(135deg, #00b894, #00cec9)'}}>
                          {booking.vendor?.name?.charAt(0)}
                        </div>
                        <div>
                          <h6 className="fw-semibold mb-1 text-dark" style={{fontSize: '14px'}}>{booking.vendor?.name}</h6>
                          <small className="text-muted" style={{fontSize: '12px'}}>
                            {booking.vendor?.category?.categoryName} • {new Date(booking.bookingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={booking.status} />
                        <div className="text-primary mt-1" style={{fontSize: '12px', fontWeight: 600}}>View Details →</div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-5 text-center">
                    <div style={{fontSize: '48px', marginBottom: '12px', opacity: 0.4}}>📋</div>
                    <p className="text-muted mb-0" style={{fontSize: '14px'}}>No completed bookings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mt-5 g-3">
          <div className="col-12 mb-2">
            <h6 className="fw-bold" style={{fontSize: '16px'}}>Quick Actions</h6>
          </div>
          {[
            { to: '/services', icon: '🔧', title: 'Book a Service', desc: 'Browse and book home services', color: '#6C63FF' },
            { to: '/my-bookings', icon: '📋', title: 'My Bookings', desc: 'View all your bookings', color: '#00b894' },
            { to: '/parking', icon: '🅿️', title: 'Car Parking', desc: 'Book a parking slot', color: '#0984e3' },
            { to: '/my-parking', icon: '🚗', title: 'My Parking', desc: 'View parking bookings', color: '#e17055' },
            { to: '/raise-complaint', icon: '⚠️', title: 'Raise Complaint', desc: 'Report a community issue', color: '#d63031' },
            { to: '/my-complaints', icon: '📝', title: 'My Complaints', desc: 'Track your complaints', color: '#6c5ce7' },
            { to: '/my-messages', icon: '💬', title: 'Messages', desc: 'Check your notifications', color: '#f39c12' },
          ].map(item => (
            <div key={item.to} className="col-md-4">
              <Link to={item.to} className="text-decoration-none">
                <div className="card border-0 hover-lift p-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.04)'}}>
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '50px', height: '50px', borderRadius: '14px',
                      background: `${item.color}12`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                    }}>
                      {item.icon}
                    </div>
                    <div className="ms-3 flex-grow-1">
                      <h6 className="fw-bold mb-0 text-dark" style={{fontSize: '14px'}}>{item.title}</h6>
                      <small className="text-muted" style={{fontSize: '12px'}}>{item.desc}</small>
                    </div>
                    <FaArrowRight className="text-muted" size={14} />
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

export default CustomerDashboard;
