import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaCar, FaParking, FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaMapMarkerAlt, FaHome, FaCreditCard, FaHourglass, FaRedo } from 'react-icons/fa';

const MyParkingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [allocatedSlot, setAllocatedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadBookings();
    loadMyAllocatedSlot();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await parkingAPI.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Error loading parking bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadMyAllocatedSlot = async () => {
    try {
      const res = await parkingAPI.getMyAllocatedSlot();
      if (res.data && res.data.length > 0) {
        setAllocatedSlot(res.data[0]);
      }
    } catch (err) {
      console.error('Error loading allocated slot:', err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this parking booking?')) return;
    try {
      await parkingAPI.cancelBooking(id);
      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleComplete = async (id) => {
    try {
      await parkingAPI.completeBooking(id);
      toast.success('Booking completed - slot released! ✅');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    }
  };

  const handlePay = async (id) => {
    if (!window.confirm('Confirm payment and occupy this parking slot?')) return;
    try {
      await parkingAPI.payBooking(id);
      toast.success('Payment successful! Slot is now occupied 🎉');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payment');
    }
  };

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: 'rgba(243,156,18,0.1)', color: '#f39c12', label: 'PENDING PAYMENT' },
      ACTIVE: { bg: 'rgba(0,184,148,0.1)', color: '#00b894', label: 'OCCUPIED' },
      COMPLETED: { bg: 'rgba(108,99,255,0.1)', color: '#6C63FF', label: 'COMPLETED' },
      CANCELLED: { bg: 'rgba(214,48,49,0.1)', color: '#d63031', label: 'CANCELLED' }
    };
    const s = styles[status] || styles.PENDING;
    return (
      <span className="badge" style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>
        {s.label}
      </span>
    );
  };

  const formatDateTime = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{paddingBottom: '60px', background: 'linear-gradient(135deg, #0984e3 0%, #6C63FF 100%)'}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="fw-bold text-white mb-2" style={{letterSpacing: '-0.5px'}}>
                <FaParking className="me-2" />My Parking
              </h2>
              <p className="text-white mb-0" style={{opacity: 0.8, fontSize: '14px'}}>
                Your allocated slot & additional parking bookings
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <Link to="/parking" className="btn btn-warning fw-bold px-4" style={{borderRadius: '10px'}}>
                <FaCar className="me-2" />Book Extra Parking
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '-40px'}}>
        {/* Allocated Slot Card */}
        {allocatedSlot && (
          <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderLeft: '4px solid #6C63FF'}}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(108,99,255,0.1)', color: '#6C63FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                }}>
                  <FaHome size={18} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0" style={{fontSize: '14px'}}>Your Allocated Parking Slot</h6>
                  <small className="text-muted" style={{fontSize: '11px'}}>Complimentary with your home</small>
                </div>
              </div>
              <div className="d-flex align-items-center flex-wrap gap-4" style={{background: '#f8f9fc', borderRadius: '10px', padding: '12px 16px'}}>
                <div>
                  <small className="text-muted d-block" style={{fontSize: '11px'}}>Slot</small>
                  <span className="fw-bold" style={{fontSize: '14px', color: '#6C63FF'}}>{allocatedSlot.slotNumber}</span>
                </div>
                <div>
                  <small className="text-muted d-block" style={{fontSize: '11px'}}>Floor</small>
                  <span style={{fontSize: '13px'}}>{allocatedSlot.floor}</span>
                </div>
                <div>
                  <small className="text-muted d-block" style={{fontSize: '11px'}}>Flat</small>
                  <span style={{fontSize: '13px'}}>{allocatedSlot.flatNumber || '-'}</span>
                </div>
                <div>
                  <small className="text-muted d-block" style={{fontSize: '11px'}}>Location</small>
                  <span style={{fontSize: '12px'}}>{allocatedSlot.location}</span>
                </div>
                <div className="ms-auto">
                  <span className="badge" style={{
                    background: 'rgba(0,184,148,0.1)', color: '#00b894',
                    fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px'
                  }}>FREE ✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Bookings Label */}
        <h6 className="fw-bold text-muted mb-3" style={{fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
          Additional Parking Bookings
        </h6>
        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { icon: <FaHourglass size={20} />, value: bookings.filter(b => b.status === 'PENDING').length, label: 'Pending Pay', color: '#f39c12', bg: 'rgba(243,156,18,0.08)' },
            { icon: <FaCar size={20} />, value: bookings.filter(b => b.status === 'ACTIVE').length, label: 'Occupied', color: '#00b894', bg: 'rgba(0,184,148,0.08)' },
            { icon: <FaCheckCircle size={20} />, value: bookings.filter(b => b.status === 'COMPLETED').length, label: 'Completed', color: '#0984e3', bg: 'rgba(9,132,227,0.08)' },
            { icon: <FaTimesCircle size={20} />, value: bookings.filter(b => b.status === 'CANCELLED').length, label: 'Cancelled', color: '#d63031', bg: 'rgba(214,48,49,0.08)' },
          ].map((stat, i) => (
            <div key={i} className="col-md-3 col-6">
              <div className="card border-0 p-3" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: stat.bg, color: stat.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{fontSize: '1.3rem'}}>{stat.value}</h4>
                    <small className="text-muted" style={{fontSize: '12px'}}>{stat.label}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}
              style={{borderRadius: '20px', fontSize: '13px', padding: '5px 16px'}}
            >
              {f === 'ALL' ? 'All Bookings' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="row g-3">
            {filteredBookings.map((booking, index) => (
              <div key={booking.id} className="col-lg-6" style={{animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`}}>
                <div className="card border-0 h-100" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '14px',
                          background: booking.status === 'ACTIVE' ? 'rgba(0,184,148,0.1)' : booking.status === 'PENDING' ? 'rgba(243,156,18,0.1)' : 'rgba(108,99,255,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginRight: '12px', color: booking.status === 'ACTIVE' ? '#00b894' : booking.status === 'PENDING' ? '#f39c12' : '#6C63FF'
                        }}>
                          <FaCar size={22} />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0" style={{fontSize: '15px'}}>
                            Slot {booking.parkingSlot?.slotNumber}
                          </h6>
                          <small className="text-muted" style={{fontSize: '12px'}}>
                            {booking.parkingSlot?.floor} • {booking.vehicleType}
                          </small>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="mb-3" style={{background: '#f8f9fc', borderRadius: '10px', padding: '12px'}}>
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block" style={{fontSize: '11px'}}>Vehicle</small>
                          <span className="fw-semibold" style={{fontSize: '13px'}}>{booking.vehicleNumber}</span>
                        </div>
                        <div className="col-6 text-end">
                          <small className="text-muted d-block" style={{fontSize: '11px'}}>Amount</small>
                          <span className="fw-bold text-primary" style={{fontSize: '15px'}}>Rs. {booking.totalAmount}</span>
                        </div>
                      </div>
                      <hr style={{margin: '8px 0', opacity: 0.1}} />
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block" style={{fontSize: '11px'}}>
                            <FaClock size={9} className="me-1" />Start
                          </small>
                          <span style={{fontSize: '12px'}}>{formatDateTime(booking.startTime)}</span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block" style={{fontSize: '11px'}}>
                            <FaClock size={9} className="me-1" />End
                          </small>
                          <span style={{fontSize: '12px'}}>{formatDateTime(booking.endTime)}</span>
                        </div>
                      </div>
                      {booking.parkingSlot?.location && (
                        <>
                          <hr style={{margin: '8px 0', opacity: 0.1}} />
                          <small className="text-muted" style={{fontSize: '11px'}}>
                            <FaMapMarkerAlt size={9} className="me-1" />{booking.parkingSlot.location}
                          </small>
                        </>
                      )}
                    </div>

                    {booking.notes && (
                      <p className="text-muted mb-3" style={{fontSize: '12px'}}>
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}

                    {booking.status === 'PENDING' && (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-warning flex-fill"
                          onClick={() => handlePay(booking.id)}
                          style={{borderRadius: '8px', fontWeight: 600, fontSize: '13px', color: '#fff'}}
                        >
                          <FaCreditCard className="me-1" size={12} />Pay Rs. {booking.totalAmount} & Occupy
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancel(booking.id)}
                          style={{borderRadius: '8px', fontSize: '13px'}}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {booking.status === 'ACTIVE' && (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-success flex-fill"
                          onClick={() => handleComplete(booking.id)}
                          style={{borderRadius: '8px', fontWeight: 600, fontSize: '13px'}}
                        >
                          <FaCheckCircle className="me-1" size={12} />Exit & Complete
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger flex-fill"
                          onClick={() => handleCancel(booking.id)}
                          style={{borderRadius: '8px', fontSize: '13px'}}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div style={{fontSize: '64px', marginBottom: '16px', opacity: 0.4}}>🅿️</div>
            <h5 className="text-muted">No parking bookings found</h5>
            <p className="text-muted mb-3" style={{fontSize: '14px'}}>
              {filter !== 'ALL' ? 'Try a different filter or ' : ''}Book a parking slot to get started
            </p>
            <Link to="/parking" className="btn btn-primary px-4" style={{borderRadius: '10px'}}>
              Book Parking <FaArrowRight className="ms-2" size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyParkingBookings;
