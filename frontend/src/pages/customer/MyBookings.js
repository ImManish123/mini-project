import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, vendorAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaFilter, FaTimesCircle, FaEye, FaSearch, FaRedo, FaClock, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  // Re-book modal state
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [rebookVendor, setRebookVendor] = useState(null);
  const [rebookSlots, setRebookSlots] = useState([]);
  const [rebookSubmitting, setRebookSubmitting] = useState(false);
  const [rebookForm, setRebookForm] = useState({
    bookingDate: '', timeSlot: '', serviceAddress: '', servicePincode: '', notes: '', paymentMethod: 'CASH_ON_SERVICE'
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id, 'Cancelled by customer');
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handlePay = async (id) => {
    try {
      await bookingAPI.pay(id);
      toast.success('💳 Payment successful!');
      loadBookings();
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  const handleRebookClick = async (booking) => {
    try {
      const res = await vendorAPI.getById(booking.vendor.id);
      setRebookVendor(res.data);
      setRebookSlots([]);
      setRebookForm({
        bookingDate: '', timeSlot: '',
        serviceAddress: booking.serviceAddress || '',
        servicePincode: booking.servicePincode || '',
        notes: '', paymentMethod: 'CASH_ON_SERVICE'
      });
      setShowRebookModal(true);
    } catch (err) {
      toast.error('Failed to load vendor details');
    }
  };

  const handleRebookDateChange = async (date) => {
    setRebookForm(f => ({ ...f, bookingDate: date, timeSlot: '' }));
    if (date && rebookVendor) {
      try {
        const res = await vendorAPI.getSlots(rebookVendor.id, date);
        setRebookSlots(res.data);
      } catch { setRebookSlots([]); }
    }
  };

  const handleRebookSubmit = async (e) => {
    e.preventDefault();
    if (!rebookForm.bookingDate || !rebookForm.timeSlot) {
      toast.error('Please select date and time slot');
      return;
    }
    setRebookSubmitting(true);
    try {
      await bookingAPI.create({ ...rebookForm, vendorId: rebookVendor.id });
      toast.success('🎉 Booking confirmed successfully!');
      setShowRebookModal(false);
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setRebookSubmitting(false);
    }
  };

  const filtered = (filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter))
    .filter(b => !search || b.vendor?.name?.toLowerCase().includes(search.toLowerCase()) || b.vendor?.category?.categoryName?.toLowerCase().includes(search.toLowerCase()));

  const filterCounts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    IN_PROGRESS: bookings.filter(b => b.status === 'IN_PROGRESS').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header" style={{paddingBottom: '55px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <h2 className="fw-bold text-white mb-2" style={{letterSpacing: '-0.5px'}}>
            <FaCalendarAlt className="me-2" size={24} />My Bookings
          </h2>
          <p className="text-white mb-0" style={{opacity: 0.8, fontSize: '15px'}}>
            View and manage all your service bookings ({bookings.length} total)
          </p>
        </div>
      </div>
      <div className="container" style={{marginTop: '-30px'}}>
        {/* Search & Filter Bar */}
        <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '14px'}}>
          <div className="card-body p-3">
            <div className="d-flex gap-3 align-items-center flex-wrap">
              <div className="flex-grow-1 position-relative">
                <FaSearch className="position-absolute text-muted" style={{top: '50%', left: '14px', transform: 'translateY(-50%)'}} />
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search by vendor or category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{paddingLeft: '40px', fontSize: '14px'}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {Object.entries(filterCounts).map(([status, count]) => (
            <button
              key={status}
              className={`btn btn-sm fw-semibold ${filter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(status)}
              style={{borderRadius: '10px', padding: '6px 14px', fontSize: '13px'}}
            >
              {status.replace(/_/g, ' ')} {count > 0 && <span className="badge bg-white bg-opacity-25 ms-1" style={{fontSize: '11px'}}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        {filtered.length > 0 ? (
          <div className="row g-3">
            {filtered.map((booking, index) => (
              <div key={booking.id} className="col-lg-6" style={{animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`}}>
                <div className="card border-0 hover-lift booking-card" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="card-body p-4" style={{paddingLeft: '20px'}}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div className="vendor-avatar me-3">{booking.vendor?.name?.charAt(0)}</div>
                        <div>
                          <h6 className="fw-bold mb-1" style={{fontSize: '15px'}}>{booking.vendor?.name}</h6>
                          <span className="badge bg-primary bg-opacity-10 text-primary" style={{fontSize: '11px'}}>{booking.vendor?.category?.categoryName}</span>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="p-2 rounded" style={{background: '#f8f9fc'}}>
                          <small className="text-muted d-block" style={{fontSize: '11px'}}>Date</small>
                          <span className="fw-semibold" style={{fontSize: '13px'}}>
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 rounded" style={{background: '#f8f9fc'}}>
                          <small className="text-muted d-block" style={{fontSize: '11px'}}>Time Slot</small>
                          <span className="fw-semibold" style={{fontSize: '13px'}}>{booking.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted d-block" style={{fontSize: '11px'}}>Amount</small>
                        <span className="fw-bold text-primary" style={{fontSize: '1.2rem'}}>Rs. {booking.totalAmount}</span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block" style={{fontSize: '11px'}}>Payment</small>
                        <StatusBadge status={booking.paymentStatus} />
                      </div>
                    </div>
                    <hr style={{opacity: 0.1}} />
                    <div className="d-flex gap-2 flex-wrap">
                      <Link to={`/booking/${booking.id}`} className="btn btn-sm btn-outline-primary" style={{borderRadius: '8px', fontSize: '12px'}}>
                        <FaEye className="me-1" size={11} />View Details
                      </Link>
                      {booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED' && (
                        <button className="btn btn-sm btn-success" onClick={() => handlePay(booking.id)} style={{borderRadius: '8px', fontSize: '12px'}}>
                          💳 Pay Now
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(booking.id)} style={{borderRadius: '8px', fontSize: '12px'}}>
                          <FaTimesCircle className="me-1" size={11} />Cancel
                        </button>
                      )}
                      {['CANCELLED', 'COMPLETED'].includes(booking.status) && booking.vendor?.id && (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleRebookClick(booking)} style={{borderRadius: '8px', fontSize: '12px'}}>
                          <FaRedo className="me-1" size={11} />Book Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div style={{fontSize: '48px', marginBottom: '16px', opacity: 0.3}}>📋</div>
            <h5 className="text-muted fw-bold mb-2">No bookings found</h5>
            <p className="text-muted" style={{fontSize: '14px'}}>
              {search ? 'Try a different search term' : 'Start by browsing our services'}
            </p>
            <Link to="/services" className="btn btn-primary px-4" style={{borderRadius: '10px'}}>Browse Services</Link>
          </div>
        )}
      </div>

      {/* Re-book Modal */}
      {showRebookModal && rebookVendor && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)', zIndex: 1050}} onClick={() => setShowRebookModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content" style={{borderRadius: '16px', border: 'none'}}>
              <div className="modal-header border-0 pb-0" style={{padding: '24px 24px 0'}}>
                <div>
                  <h5 className="modal-title fw-bold"><FaRedo className="me-2 text-primary" size={16} />Book Again</h5>
                  <p className="text-muted mb-0" style={{fontSize: '13px'}}>
                    {rebookVendor.name} • {rebookVendor.category?.categoryName} • Rs. {rebookVendor.price}
                  </p>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowRebookModal(false)}></button>
              </div>
              <form onSubmit={handleRebookSubmit}>
                <div className="modal-body" style={{padding: '20px 24px'}}>
                  <div className="row g-3">
                    {/* Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                        <FaCalendarAlt className="me-1 text-primary" size={12} />Preferred Date *
                      </label>
                      <input type="date" className="form-control"
                        value={rebookForm.bookingDate}
                        onChange={e => handleRebookDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required style={{borderRadius: '10px'}} />
                    </div>
                    {/* Time Slots */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                        <FaClock className="me-1 text-primary" size={12} />Time Slot *
                      </label>
                      {rebookSlots.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {rebookSlots.map(slot => (
                            <button type="button" key={slot}
                              className={`btn btn-sm ${rebookForm.timeSlot === slot ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => setRebookForm(f => ({...f, timeSlot: slot}))}
                              style={{borderRadius: '8px', fontSize: '12px', padding: '5px 12px'}}
                            >{slot}</button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted mb-0" style={{fontSize: '12px'}}>
                          {rebookForm.bookingDate ? 'No slots available for this date' : 'Select a date first'}
                        </p>
                      )}
                    </div>
                    {/* Address */}
                    <div className="col-md-8">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                        <FaMapMarkerAlt className="me-1 text-primary" size={12} />Service Address
                      </label>
                      <textarea className="form-control" rows="2"
                        value={rebookForm.serviceAddress}
                        onChange={e => setRebookForm(f => ({...f, serviceAddress: e.target.value}))}
                        placeholder="Enter address" style={{borderRadius: '10px', fontSize: '13px'}} />
                    </div>
                    {/* Pincode */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>📍 Pincode *</label>
                      <input type="text" className="form-control"
                        value={rebookForm.servicePincode}
                        onChange={e => setRebookForm(f => ({...f, servicePincode: e.target.value.replace(/\D/g, '').slice(0,6)}))}
                        placeholder="e.g. 600001" maxLength="6" required
                        pattern="[0-9]{6}" title="Enter 6-digit pincode"
                        style={{borderRadius: '10px', fontSize: '13px'}} />
                    </div>
                    {/* Notes */}
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Special Instructions (Optional)</label>
                      <textarea className="form-control" rows="2"
                        value={rebookForm.notes}
                        onChange={e => setRebookForm(f => ({...f, notes: e.target.value}))}
                        placeholder="Any specific instructions"
                        style={{borderRadius: '10px', fontSize: '13px'}} />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-3 p-3 rounded" style={{background: '#f8f9fc'}}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted" style={{fontSize: '13px'}}>Service Charge</span>
                      <span className="fw-bold text-primary" style={{fontSize: '16px'}}>Rs. {rebookVendor.price}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0" style={{padding: '0 24px 24px'}}>
                  <button type="button" className="btn btn-light" onClick={() => setShowRebookModal(false)} style={{borderRadius: '10px'}}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={rebookSubmitting} style={{borderRadius: '10px', fontWeight: 600}}>
                    {rebookSubmitting ? 'Booking...' : <><FaCheckCircle className="me-1" size={13} />Confirm Booking</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
