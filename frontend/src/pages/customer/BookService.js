import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCreditCard, FaMoneyBill, FaCheckCircle } from 'react-icons/fa';

const BookService = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bookingDate: '',
    timeSlot: '',
    serviceAddress: '',
    servicePincode: '',
    notes: '',
    paymentMethod: 'CASH_ON_SERVICE'
  });

  const loadVendor = useCallback(async () => {
    try {
      const res = await vendorAPI.getById(vendorId);
      setVendor(res.data);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Vendor not found');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  const loadSlots = async (date) => {
    try {
      const res = await vendorAPI.getSlots(vendorId, date);
      setSlots(res.data);
    } catch (err) {
      console.error('Error loading slots:', err);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setForm({ ...form, bookingDate: date, timeSlot: '' });
    if (date) loadSlots(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookingDate || !form.timeSlot) {
      toast.error('Please select date and time slot');
      return;
    }
    setSubmitting(true);
    try {
      const bookingData = { ...form, vendorId: parseInt(vendorId) };
      await bookingAPI.create(bookingData);
      toast.success('🎉 Booking confirmed successfully!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;
  if (!vendor) return <div className="text-center py-5"><h4>Vendor not found</h4></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h2 className="fw-bold text-white"><FaCalendarAlt className="me-2" />Book Service</h2>
          <p className="text-white opacity-75 mb-0">Complete your booking with {vendor.name}</p>
        </div>
      </div>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit}>
              {/* Vendor Summary */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Service Provider</h5>
                  <div className="d-flex align-items-center">
                    <div className="vendor-avatar-lg me-3">{vendor.name.charAt(0)}</div>
                    <div>
                      <h5 className="fw-bold mb-1">{vendor.name}</h5>
                      <p className="text-muted mb-1">{vendor.category?.categoryName}</p>
                      <StarRating rating={vendor.rating} size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3"><FaCalendarAlt className="me-2 text-primary" />Select Date & Time</h5>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Preferred Date</label>
                    <input type="date" className="form-control form-control-lg"
                      value={form.bookingDate} onChange={handleDateChange} min={today} required />
                  </div>
                  {slots.length > 0 && (
                    <div>
                      <label className="form-label fw-semibold"><FaClock className="me-2" />Available Time Slots</label>
                      <div className="row g-2">
                        {slots.map(slot => (
                          <div key={slot} className="col-md-3 col-6">
                            <div
                              className={`slot-card p-2 text-center rounded border cursor-pointer ${form.timeSlot === slot ? 'border-primary bg-primary text-white' : 'border-light'}`}
                              onClick={() => setForm({ ...form, timeSlot: slot })}
                              style={{ cursor: 'pointer' }}
                            >
                              <small className="fw-semibold">{slot}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address & Notes */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3"><FaMapMarkerAlt className="me-2 text-primary" />Service Details</h5>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label fw-semibold">Service Address</label>
                      <textarea className="form-control" rows="2" value={form.serviceAddress}
                        onChange={(e) => setForm({ ...form, serviceAddress: e.target.value })}
                        placeholder="Enter the address where service is needed" />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">📍 Pincode *</label>
                      <input type="text" className="form-control" value={form.servicePincode}
                        onChange={(e) => setForm({ ...form, servicePincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="e.g. 600001" maxLength="6" required
                        pattern="[0-9]{6}" title="Please enter a valid 6-digit pincode" />
                      {vendor.servicePincodes && (
                        <small className="text-muted">Available: {vendor.servicePincodes}</small>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Special Instructions (Optional)</label>
                    <textarea className="form-control" rows="2" value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Any specific instructions for the professional" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3"><FaCreditCard className="me-2 text-primary" />Payment Method</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div
                        className={`p-3 rounded border text-center cursor-pointer ${form.paymentMethod === 'CASH_ON_SERVICE' ? 'border-primary bg-primary-subtle' : ''}`}
                        onClick={() => setForm({ ...form, paymentMethod: 'CASH_ON_SERVICE' })}
                        style={{ cursor: 'pointer' }}
                      >
                        <FaMoneyBill className="mb-2 text-success" size={24} />
                        <p className="fw-semibold mb-0">Cash on Service</p>
                        <small className="text-muted">Pay after service completion</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div
                        className={`p-3 rounded border text-center cursor-pointer ${form.paymentMethod === 'ONLINE' ? 'border-primary bg-primary-subtle' : ''}`}
                        onClick={() => setForm({ ...form, paymentMethod: 'ONLINE' })}
                        style={{ cursor: 'pointer' }}
                      >
                        <FaCreditCard className="mb-2 text-primary" size={24} />
                        <p className="fw-semibold mb-0">Online Payment</p>
                        <small className="text-muted">Pay now (simulated)</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold" disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaCheckCircle className="me-2" />}
                {submitting ? 'Confirming Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
              <div className="card-header bg-primary text-white py-3">
                <h5 className="fw-bold mb-0">Booking Summary</h5>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Service</span>
                  <span className="fw-semibold">{vendor.category?.categoryName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Professional</span>
                  <span className="fw-semibold">{vendor.name}</span>
                </div>
                {form.bookingDate && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Date</span>
                    <span className="fw-semibold">{new Date(form.bookingDate).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                {form.timeSlot && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Time</span>
                    <span className="fw-semibold">{form.timeSlot}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Service Charge</span>
                  <span className="fw-semibold">Rs. {vendor.price}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Platform Fee</span>
                  <span className="fw-semibold text-success">FREE</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fw-bold fs-5 text-primary">Rs. {vendor.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
