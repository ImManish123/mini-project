import React, { useState, useEffect, useRef } from 'react';
import { workerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import StatusBadge from '../../components/common/StatusBadge';
import { FaCheck, FaTimes, FaMapMarkerAlt, FaClock, FaUser, FaPlayCircle, FaFlagCheckered, FaSearch } from 'react-icons/fa';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('AVAILABLE');
  const [search, setSearch] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [declineId, setDeclineId] = useState(null);

  const stompClientRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const [trackingBookingId, setTrackingBookingId] = useState(null);

  useEffect(() => {
    loadBookings();
    return () => stopLocationTracking(); // Cleanup on unmount
  }, []);

  const stopLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
    setTrackingBookingId(null);
  };

  const handleStartJourney = async (id) => {
    try {
      await workerAPI.updateBookingStatus(id, 'ON_THE_WAY');
      toast.success('Journey started. Live location is now shared with customer.');
      loadBookings();
      
      // Start tracking
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }
      
      const socket = new SockJS('http://localhost:8080/ws');
      const stompClient = Stomp.over(socket);
      stompClient.debug = () => {}; // Disable debug logs
      
      stompClient.connect({}, () => {
        stompClientRef.current = stompClient;
        setTrackingBookingId(id);
        
        // Send location every 10 seconds
        locationIntervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const payload = {
                bookingId: id,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              stompClient.send("/app/location/update", {}, JSON.stringify(payload));
            },
            (error) => {
              console.error("Error getting location", error);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        }, 10000); // 10 seconds
        
        // Send initial location immediately
        navigator.geolocation.getCurrentPosition((position) => {
          stompClient.send("/app/location/update", {}, JSON.stringify({
            bookingId: id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        });
      }, (error) => {
        toast.error('Failed to connect to live tracking server');
      });
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start journey');
    }
  };

  const handleArrivedAndStart = async (id) => {
    stopLocationTracking();
    await handleStatusUpdate(id, 'IN_PROGRESS');
  };

  const loadBookings = async () => {
    try {
      const [myRes, availableRes] = await Promise.all([
        workerAPI.getBookings(),
        workerAPI.getAvailableBookings()
      ]);
      setBookings(myRes.data);
      setAvailableBookings(availableRes.data);
    } catch (err) {
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await workerAPI.acceptBooking(id);
      toast.success('🎉 Booking accepted! You are now assigned to this job.');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept - may have been taken by another worker');
    }
  };

  const handleDecline = async (id) => {
    try {
      await workerAPI.declineBooking(id, declineReason);
      toast.info('Booking declined');
      setDeclineId(null);
      setDeclineReason('');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await workerAPI.updateBookingStatus(id, status);
      toast.success('Status updated');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const filterCounts = {
    AVAILABLE: availableBookings.length,
    ALL: bookings.length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    ON_THE_WAY: bookings.filter(b => b.status === 'ON_THE_WAY').length,
    IN_PROGRESS: bookings.filter(b => b.status === 'IN_PROGRESS').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    DECLINED: bookings.filter(b => b.status === 'DECLINED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header" style={{background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', paddingBottom: '60px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <h2 className="fw-bold text-white mb-1" style={{letterSpacing: '-0.5px'}}>My Bookings</h2>
          <p className="text-white mb-0" style={{opacity: 0.85, fontSize: '15px'}}>Manage your booking requests</p>
        </div>
      </div>

      <div className="container" style={{marginTop: '-30px'}}>
        {/* Search & Filters */}
        <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px'}}>
          <div className="card-body p-3">
            <div className="row align-items-center g-3">
              <div className="col-md-5">
                <div className="position-relative">
                  <FaSearch className="position-absolute text-muted" style={{left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px'}} />
                  <input type="text" className="form-control border-0 bg-light" placeholder="Search by customer name..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{paddingLeft: '40px', borderRadius: '10px', fontSize: '14px'}} />
                </div>
              </div>
              <div className="col-md-7">
                <div className="d-flex gap-2 flex-wrap">
                  {[{key: 'AVAILABLE', label: '🆕 Available', active: 'btn-success', inactive: 'btn-outline-success'},
                    {key: 'ALL', label: 'All'},
                    {key: 'CONFIRMED', label: 'Confirmed'},
                    {key: 'ON_THE_WAY', label: 'On the Way'},
                    {key: 'IN_PROGRESS', label: 'In Progress'},
                    {key: 'COMPLETED', label: 'Completed'},
                    {key: 'DECLINED', label: 'Declined'},
                    {key: 'CANCELLED', label: 'Cancelled'},
                  ].map(f => (
                    <button key={f.key}
                      className={`btn btn-sm ${filter === f.key ? (f.active || 'btn-primary') : (f.inactive || 'btn-outline-secondary')}`}
                      onClick={() => setFilter(f.key)}
                      style={{borderRadius: '8px', fontSize: '12px', fontWeight: 600}}>
                      {f.label}
                      {filterCounts[f.key] > 0 && <span className="badge bg-white text-dark ms-1" style={{fontSize: '10px'}}>{filterCounts[f.key]}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {filter === 'AVAILABLE' && availableBookings.length > 0 && (
          <div className="card border-0 mb-4" style={{background: 'linear-gradient(135deg, rgba(0,184,148,0.08) 0%, rgba(0,206,201,0.08) 100%)', borderRadius: '12px', border: '1px solid rgba(0,184,148,0.15)'}}>
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <span style={{fontSize: '24px'}}>📍</span>
              <div>
                <strong style={{fontSize: '14px'}}>Available Bookings in Your Area</strong>
                <p className="text-muted mb-0" style={{fontSize: '13px'}}>These match your category and pincodes. Accept quickly before another worker takes them!</p>
              </div>
            </div>
          </div>
        )}

        {(filter === 'AVAILABLE' ? availableBookings : filteredBookings
          .filter(b => !search || b.user?.name?.toLowerCase().includes(search.toLowerCase()))
        ).length === 0 ? (
          <div className="text-center py-5">
            <div style={{fontSize: '48px', marginBottom: '16px'}}>{filter === 'AVAILABLE' ? '📍' : '📋'}</div>
            <h5 className="fw-bold text-muted">{filter === 'AVAILABLE' ? 'No available bookings in your area' : 'No bookings found'}</h5>
            <p className="text-muted" style={{fontSize: '14px'}}>Check back later for new requests</p>
          </div>
        ) : (
          <div className="row g-3">
            {(filter === 'AVAILABLE' ? availableBookings : filteredBookings
              .filter(b => !search || b.user?.name?.toLowerCase().includes(search.toLowerCase()))
            ).map((booking, index) => (
              <div key={booking.id} className="col-12" style={{animation: 'fadeInUp 0.4s ease forwards', animationDelay: `${index * 0.05}s`}}>
                <div className={`card border-0 ${booking.status === 'PENDING' ? 'border-start border-success border-4' : ''}`}
                  style={{boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '14px'}}>
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      {/* Customer Info */}
                      <div className="col-md-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="vendor-avatar-sm">
                            {booking.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">{booking.user?.name}</h6>
                            <small className="text-muted"><FaUser className="me-1" />{booking.user?.email}</small>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="col-md-3">
                        <div className="small">
                          <div><FaClock className="me-1 text-primary" />{booking.bookingDate} — {booking.timeSlot}</div>
                          <div><FaMapMarkerAlt className="me-1 text-danger" />{booking.serviceAddress || 'N/A'}</div>
                          {booking.servicePincode && (
                            <div><span className="badge bg-info text-white">📍 {booking.servicePincode}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Amount & Status */}
                      <div className="col-md-2 text-center">
                        <div className="fw-bold text-success">Rs. {booking.totalAmount}</div>
                        <StatusBadge status={booking.status} />
                      </div>

                      {/* Actions */}
                      <div className="col-md-4 text-end">
                        {booking.status === 'PENDING' && (
                          <div className="d-flex gap-2 justify-content-end flex-wrap">
                            <button className="btn btn-success btn-sm" onClick={() => handleAccept(booking.id)}>
                              <FaCheck className="me-1" />Accept
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeclineId(booking.id === declineId ? null : booking.id)}>
                              <FaTimes className="me-1" />Decline
                            </button>
                          </div>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button className="btn btn-info btn-sm text-white" onClick={() => handleStartJourney(booking.id)}>
                            <FaMapMarkerAlt className="me-1" />Start Journey
                          </button>
                        )}
                        {booking.status === 'ON_THE_WAY' && (
                          <div className="d-flex flex-column align-items-end gap-2">
                             <span className="badge bg-warning text-dark"><div className="spinner-grow spinner-grow-sm me-1" role="status" style={{width: '10px', height: '10px', verticalAlign: 'middle'}}/> Sharing Location...</span>
                             <button className="btn btn-primary btn-sm" onClick={() => handleArrivedAndStart(booking.id)}>
                               <FaPlayCircle className="me-1" />Arrived & Start Work
                             </button>
                          </div>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}>
                            <FaFlagCheckered className="me-1" />Mark Complete
                          </button>
                        )}
                        {booking.status === 'DECLINED' && booking.cancellationReason && (
                          <small className="text-muted">Reason: {booking.cancellationReason}</small>
                        )}
                      </div>
                    </div>

                    {/* Decline reason input */}
                    {declineId === booking.id && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <label className="form-label fw-semibold small">Reason for declining (optional)</label>
                        <div className="d-flex gap-2">
                          <input type="text" className="form-control form-control-sm" placeholder="Enter reason..."
                            value={declineReason} onChange={e => setDeclineReason(e.target.value)} />
                          <button className="btn btn-danger btn-sm" onClick={() => handleDecline(booking.id)}>
                            Confirm Decline
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDeclineId(null); setDeclineReason(''); }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mt-2">
                        <small className="text-muted"><strong>Customer Note:</strong> {booking.notes}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerBookings;
