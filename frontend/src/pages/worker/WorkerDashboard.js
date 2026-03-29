import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../../services/api';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaEnvelope, FaHardHat, FaStar, FaRupeeSign, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';

const WorkerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await workerAPI.getDashboard();
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  const fakeStats = {
    availableBookings: 14,
    confirmedBookings: 16,
    completedBookings: 12,
    declinedBookings: 11,
  };

  const statCards = [
    { label: 'Available to Accept', value: fakeStats.availableBookings, icon: <FaClock size={22} />, gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', to: '/worker/bookings' },
    { label: 'Confirmed', value: fakeStats.confirmedBookings, icon: <FaCalendarAlt size={22} />, gradient: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)', to: '/worker/bookings' },
    { label: 'Completed', value: fakeStats.completedBookings, icon: <FaCheckCircle size={22} />, gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', to: '/worker/bookings' },
    { label: 'Declined', value: fakeStats.declinedBookings, icon: <FaTimesCircle size={22} />, gradient: 'linear-gradient(135deg, #d63031 0%, #ff7675 100%)', to: '/worker/bookings' },
  ];

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header" style={{background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', paddingBottom: '80px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaHardHat size={28} className="text-white" />
            </div>
            <div>
              <h2 className="fw-bold text-white mb-1" style={{letterSpacing: '-0.5px'}}>Worker Dashboard</h2>
              <p className="text-white mb-0" style={{opacity: 0.85, fontSize: '15px'}}>
                {stats?.vendorProfile?.name || 'Worker'} — {stats?.vendorProfile?.category?.categoryName || 'Service'}
              </p>
            </div>
            <div className="ms-auto">
              {stats?.vendorProfile?.approved ? (
                <span style={{background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600}}>
                  <FaCheckCircle className="me-1" size={12} />Approved
                </span>
              ) : (
                <span style={{background: 'rgba(255,193,7,0.3)', padding: '6px 16px', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600}}>
                  ⏳ Pending Approval
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '-60px'}}>
        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {statCards.map((card, i) => (
            <div key={i} className="col-lg-3 col-md-6" style={{animation: 'fadeInUp 0.5s ease forwards', animationDelay: `${i * 0.1}s`}}>
              {card.to ? (
                <Link to={card.to} className="text-decoration-none">
                  <div className="card border-0 text-white" style={{background: card.gradient, borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.12)'}}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p className="mb-1" style={{opacity: 0.85, fontSize: '13px'}}>{card.label}</p>
                          <h2 className="fw-bold mb-0">{card.value}</h2>
                        </div>
                        <div style={{opacity: 0.3}}>{card.icon}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="card border-0 text-white" style={{background: card.gradient, borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.12)'}}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1" style={{opacity: 0.85, fontSize: '13px'}}>{card.label}</p>
                        <h2 className="fw-bold mb-0">{card.value}</h2>
                      </div>
                      <div style={{opacity: 0.3}}>{card.icon}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Unread Messages Banner */}
        {stats?.unreadMessages > 0 && (
          <div className="card border-0 mb-4" style={{background: 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)', borderRadius: '14px'}}>
            <div className="card-body p-3 d-flex align-items-center">
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(108,99,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px'
              }}>
                <FaEnvelope className="text-primary" size={16} />
              </div>
              <div className="flex-grow-1">
                <span className="fw-semibold" style={{fontSize: '14px'}}>You have <strong>{stats.unreadMessages}</strong> unread message(s)</span>
              </div>
              <Link to="/worker/messages" className="btn btn-primary btn-sm" style={{borderRadius: '8px', fontSize: '13px'}}>View Messages</Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h6 className="fw-bold mb-3" style={{fontSize: '15px', color: '#2d3436'}}>Quick Actions</h6>
        <div className="row g-3 mb-4">
          {[
            { to: '/worker/bookings', icon: <FaCalendarAlt size={20} />, title: 'My Bookings', desc: 'View & manage all booking requests', color: '#0984e3', bg: 'rgba(9,132,227,0.08)' },
            { to: '/worker/messages', icon: <FaEnvelope size={20} />, title: 'Messages', desc: 'View booking notifications', color: '#00b894', bg: 'rgba(0,184,148,0.08)' },
            { to: '/worker/reviews', icon: <FaStar size={20} />, title: 'Reviews', desc: 'See customer feedback', color: '#f39c12', bg: 'rgba(243,156,18,0.08)' },
            { to: '/worker/profile', icon: <FaHardHat size={20} />, title: 'My Profile', desc: 'Update your service details', color: '#6c5ce7', bg: 'rgba(108,92,231,0.08)' },
          ].map(item => (
            <div key={item.to} className="col-md-3 col-6">
              <Link to={item.to} className="text-decoration-none">
                <div className="card border-0 h-100 hover-lift" style={{borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'}}>
                  <div className="card-body p-3 text-center">
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px', background: item.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: item.color
                    }}>{item.icon}</div>
                    <h6 className="fw-bold mb-1 text-dark" style={{fontSize: '14px'}}>{item.title}</h6>
                    <small className="text-muted" style={{fontSize: '12px'}}>{item.desc}</small>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Vendor Profile Summary */}
        {stats?.vendorProfile && (
          <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
            <div className="card-header bg-white py-3 px-4" style={{borderBottom: '1px solid #f1f3f5', borderRadius: '16px 16px 0 0'}}>
              <h6 className="fw-bold mb-0" style={{fontSize: '15px'}}>Your Service Profile</h6>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {[
                  { icon: <FaCalendarAlt size={13} />, label: 'Category', value: stats.vendorProfile.category?.categoryName, color: '#6C63FF' },
                  { icon: <FaBriefcase size={13} />, label: 'Experience', value: `${stats.vendorProfile.experienceYears} years`, color: '#0984e3' },
                  { icon: <FaRupeeSign size={13} />, label: 'Price', value: `Rs. ${stats.vendorProfile.price}`, color: '#00b894' },
                  { icon: <FaStar size={13} />, label: 'Rating', value: `${stats.vendorProfile.rating?.toFixed(1)} (${stats.vendorProfile.totalReviews})`, color: '#f39c12' },
                  { icon: <FaMapMarkerAlt size={13} />, label: 'Service Area', value: stats.vendorProfile.serviceArea, color: '#e17055' },
                ].map((item, i) => (
                  <div key={i} className="col-md">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: `${item.color}15`, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: item.color
                      }}>{item.icon}</div>
                      <div>
                        <small className="text-muted d-block" style={{fontSize: '11px'}}>{item.label}</small>
                        <span className="fw-semibold" style={{fontSize: '13px'}}>{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
