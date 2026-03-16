import React, { useState, useEffect } from 'react';
import { liftBookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowUp, FaArrowDown, FaCalendarAlt, FaClock, FaUsers, FaCheckCircle, FaTimesCircle, FaSpinner, FaBuilding, FaHistory, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

const statusConfig = {
  PENDING: { label: 'Pending', color: '#f39c12', bg: '#fef9e7' },
  CONFIRMED: { label: 'Confirmed', color: '#27ae60', bg: '#eafaf1' },
  ACTIVE: { label: 'Active', color: '#2980b9', bg: '#ebf5fb' },
  COMPLETED: { label: 'Completed', color: '#7f8c8d', bg: '#f2f3f4' },
  CANCELLED: { label: 'Cancelled', color: '#e74c3c', bg: '#fdedec' },
};

const paymentConfig = {
  PENDING: { label: 'Unpaid', color: '#f39c12', bg: '#fef9e7' },
  PAID: { label: 'Paid', color: '#27ae60', bg: '#eafaf1' },
  FAILED: { label: 'Failed', color: '#e74c3c', bg: '#fdedec' },
  REFUNDED: { label: 'Refunded', color: '#8e44ad', bg: '#f5eef8' },
  CASH_ON_SERVICE: { label: 'Cash', color: '#2980b9', bg: '#ebf5fb' },
};

const LiftBooking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('book');
  const [form, setForm] = useState({
    flatNumber: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    numberOfGuests: 1,
    notes: '',
    paymentMethod: 'ONLINE',
  });
  const [dateBookings, setDateBookings] = useState([]);
  const [loadingDate, setLoadingDate] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (form.bookingDate) {
      loadDateBookings(form.bookingDate);
    }
  }, [form.bookingDate]);

  const loadBookings = async () => {
    try {
      const res = await liftBookingAPI.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDateBookings = async (date) => {
    setLoadingDate(true);
    try {
      const res = await liftBookingAPI.getByDate(date);
      setDateBookings(res.data);
    } catch (err) {
      console.error('Failed to load date bookings:', err);
    } finally {
      setLoadingDate(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flatNumber || !form.bookingDate || !form.startTime || !form.endTime) {
      toast.warning('Please fill in all required fields');
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.warning('End time must be after start time');
      return;
    }
    setSubmitting(true);
    try {
      await liftBookingAPI.create(form);
      toast.success('Lift booking created successfully!');
      setForm({ flatNumber: '', bookingDate: '', startTime: '', endTime: '', purpose: '', numberOfGuests: 1, notes: '', paymentMethod: 'ONLINE' });
      loadBookings();
      setActiveTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this lift booking?')) return;
    try {
      await liftBookingAPI.cancel(id);
      toast.info('Booking cancelled');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handlePayment = async (id) => {
    if (!window.confirm('Confirm payment for this booking?')) return;
    try {
      await liftBookingAPI.pay(id);
      toast.success('Payment successful!');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{ background: '#f0f2f5' }}>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', paddingBottom: '60px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="fw-bold text-white mb-2" style={{ letterSpacing: '-0.5px' }}>
            <FaBuilding className="me-2" /> Lift Booking
          </h2>
          <p className="text-white mb-0" style={{ opacity: 0.85, fontSize: '15px' }}>
            Reserve the apartment lift for your guests during functions and events
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        {/* Tabs */}
        <div className="card border-0 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <div className="card-body p-0">
            <div className="d-flex">
              <button className={`btn flex-fill py-3 fw-semibold ${activeTab === 'book' ? '' : 'text-muted'}`}
                style={{ borderRadius: '16px 0 0 16px', background: activeTab === 'book' ? '#6c5ce7' : 'white', color: activeTab === 'book' ? 'white' : '#6c757d', border: 'none' }}
                onClick={() => setActiveTab('book')}>
                <FaCalendarAlt className="me-2" /> Book Lift
              </button>
              <button className={`btn flex-fill py-3 fw-semibold ${activeTab === 'history' ? '' : 'text-muted'}`}
                style={{ borderRadius: '0 16px 16px 0', background: activeTab === 'history' ? '#6c5ce7' : 'white', color: activeTab === 'history' ? 'white' : '#6c757d', border: 'none' }}
                onClick={() => setActiveTab('history')}>
                <FaHistory className="me-2" /> My Bookings ({bookings.length})
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'book' && (
          <div className="row g-4">
            {/* Booking Form */}
            <div className="col-lg-7">
              <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                <div className="card-header bg-white border-0 p-4 pb-0">
                  <h5 className="fw-bold mb-1">New Lift Booking</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Reserve the lift for your guests (max 2 bookings at the same time)</p>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold"><FaBuilding className="me-1" /> Flat Number *</label>
                        <input type="text" className="form-control" name="flatNumber" value={form.flatNumber}
                          onChange={handleChange} placeholder="e.g. A-301" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold"><FaCalendarAlt className="me-1" /> Booking Date *</label>
                        <input type="date" className="form-control" name="bookingDate" value={form.bookingDate}
                          onChange={handleChange} min={todayStr} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold"><FaClock className="me-1" /> Start Time *</label>
                        <input type="time" className="form-control" name="startTime" value={form.startTime}
                          onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold"><FaClock className="me-1" /> End Time *</label>
                        <input type="time" className="form-control" name="endTime" value={form.endTime}
                          onChange={handleChange} required />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label fw-semibold">Purpose</label>
                        <select className="form-select" name="purpose" value={form.purpose} onChange={handleChange}>
                          <option value="">Select purpose</option>
                          <option value="Guest arrival for function">Guest arrival for function</option>
                          <option value="House warming ceremony">House warming ceremony</option>
                          <option value="Birthday celebration">Birthday celebration</option>
                          <option value="Festival gathering">Festival gathering</option>
                          <option value="Moving furniture">Moving furniture</option>
                          <option value="Wedding function">Wedding function</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold"><FaUsers className="me-1" /> No. of Guests</label>
                        <input type="number" className="form-control" name="numberOfGuests" value={form.numberOfGuests}
                          onChange={handleChange} min="1" max="100" />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Notes (optional)</label>
                        <textarea className="form-control" rows={2} name="notes" value={form.notes}
                          onChange={handleChange} placeholder="Any additional notes..." />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold"><FaCreditCard className="me-1" /> Payment Method *</label>
                        <div className="d-flex gap-3">
                          <div className={`flex-fill p-3 text-center rounded-3 border ${form.paymentMethod === 'ONLINE' ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer', background: form.paymentMethod === 'ONLINE' ? '#ebf5fb' : '#fff', transition: '0.2s' }}
                            onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'ONLINE' }))}>
                            <FaCreditCard size={20} className="mb-1" style={{ color: form.paymentMethod === 'ONLINE' ? '#6c5ce7' : '#aaa' }} />
                            <div className="fw-semibold" style={{ fontSize: '14px' }}>Pay Online</div>
                            <small className="text-muted">Pay after booking</small>
                          </div>
                          <div className={`flex-fill p-3 text-center rounded-3 border ${form.paymentMethod === 'CASH_ON_SERVICE' ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer', background: form.paymentMethod === 'CASH_ON_SERVICE' ? '#ebf5fb' : '#fff', transition: '0.2s' }}
                            onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'CASH_ON_SERVICE' }))}>
                            <FaMoneyBillWave size={20} className="mb-1" style={{ color: form.paymentMethod === 'CASH_ON_SERVICE' ? '#27ae60' : '#aaa' }} />
                            <div className="fw-semibold" style={{ fontSize: '14px' }}>Cash</div>
                            <small className="text-muted">Pay at the time</small>
                          </div>
                        </div>
                      </div>
                      {/* Price estimate */}
                      {form.startTime && form.endTime && form.endTime > form.startTime && (
                        <div className="col-12">
                          <div className="p-3 rounded-3" style={{ background: '#f0f0ff' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-semibold" style={{ color: '#6c5ce7' }}>Estimated Amount</span>
                              <span className="fw-bold fs-5" style={{ color: '#6c5ce7' }}>
                                Rs. {Math.ceil(((new Date(`2000-01-01T${form.endTime}`) - new Date(`2000-01-01T${form.startTime}`)) / 60000) / 30) * 50}
                              </span>
                            </div>
                            <small className="text-muted">Rs. 50 per 30-minute slot</small>
                          </div>
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-lg w-100 mt-4 fw-bold" disabled={submitting}
                      style={{ background: '#6c5ce7', color: 'white', borderRadius: '12px', padding: '14px' }}>
                      {submitting ? <><FaSpinner className="me-2 fa-spin" /> Booking...</> : <><FaCheckCircle className="me-2" /> Confirm Booking</>}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Date Availability Sidebar */}
            <div className="col-lg-5">
              <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                <div className="card-header bg-white border-0 p-4 pb-0">
                  <h6 className="fw-bold mb-1">
                    {form.bookingDate ? `Bookings on ${new Date(form.bookingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` : 'Select a date to see availability'}
                  </h6>
                </div>
                <div className="card-body p-4">
                  {!form.bookingDate ? (
                    <div className="text-center py-4 text-muted">
                      <FaCalendarAlt size={30} className="mb-2 opacity-25" />
                      <p className="mb-0">Pick a booking date to check availability</p>
                    </div>
                  ) : loadingDate ? (
                    <div className="text-center py-4"><FaSpinner className="fa-spin" /></div>
                  ) : dateBookings.length === 0 ? (
                    <div className="text-center py-4" style={{ color: '#27ae60' }}>
                      <FaCheckCircle size={30} className="mb-2" />
                      <p className="mb-0 fw-semibold">Lift is fully available on this date!</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted mb-3" style={{ fontSize: '13px' }}>{dateBookings.length} booking(s) on this date</p>
                      {dateBookings.map(b => (
                        <div key={b.id} className="d-flex align-items-center p-3 mb-2" style={{ background: statusConfig[b.status]?.bg || '#f8f9fa', borderRadius: '10px' }}>
                          <div className="me-3">
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                              <FaArrowUp style={{ color: '#6c5ce7' }} />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold" style={{ fontSize: '14px' }}>Flat {b.flatNumber}</div>
                            <small className="text-muted">{b.startTime?.substring(0, 5)} — {b.endTime?.substring(0, 5)}</small>
                          </div>
                          <span className="badge" style={{ background: statusConfig[b.status]?.color || '#6c757d', fontSize: '11px' }}>
                            {statusConfig[b.status]?.label || b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Info */}
                  <div className="mt-4 p-3" style={{ background: '#f0f0ff', borderRadius: '10px' }}>
                    <h6 className="fw-bold mb-2" style={{ color: '#6c5ce7', fontSize: '14px' }}><FaArrowUp className="me-1" /> Booking Rules</h6>
                    <ul className="mb-0 ps-3" style={{ fontSize: '13px', color: '#555' }}>
                      <li>Max 2 concurrent lift bookings per time slot</li>
                      <li>Booking must be for today or a future date</li>
                      <li>End time must be after start time</li>
                      <li>You can cancel pending/confirmed bookings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
            <div className="card-body p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FaArrowDown size={40} className="mb-3 opacity-25" />
                  <p>No lift bookings yet. Create your first booking!</p>
                  <button className="btn btn-outline-primary" onClick={() => setActiveTab('book')}>Book Now</button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>ID</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Flat</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Time</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Purpose</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => {
                        const sConf = statusConfig[b.status] || statusConfig.PENDING;
                        const pConf = paymentConfig[b.paymentStatus] || paymentConfig.PENDING;
                        return (
                          <tr key={b.id}>
                            <td style={{ padding: '12px 16px' }}>#{b.id}</td>
                            <td style={{ padding: '12px 16px' }}><FaBuilding className="me-1 text-muted" />{b.flatNumber}</td>
                            <td style={{ padding: '12px 16px' }}>{b.bookingDate}</td>
                            <td style={{ padding: '12px 16px' }}>{b.startTime?.substring(0, 5)} — {b.endTime?.substring(0, 5)}</td>
                            <td style={{ padding: '12px 16px' }}>{b.purpose || '—'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className="fw-semibold">Rs. {b.totalAmount || 0}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className="badge" style={{ background: pConf.bg, color: pConf.color, padding: '6px 12px' }}>
                                {pConf.label}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className="badge" style={{ background: sConf.bg, color: sConf.color, padding: '6px 12px' }}>
                                {sConf.label}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div className="d-flex gap-1">
                                {b.paymentStatus === 'PENDING' && b.status !== 'CANCELLED' && (
                                  <button className="btn btn-sm btn-success" onClick={() => handlePayment(b.id)}>
                                    <FaCreditCard className="me-1" /> Pay Now
                                  </button>
                                )}
                                {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(b.id)}>Cancel</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiftBooking;
