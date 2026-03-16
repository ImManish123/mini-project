import React, { useState, useEffect } from 'react';
import { bookingAPI, adminAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { toast } from 'react-toastify';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineBookingId, setDeclineBookingId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      loadBookings();
    } catch (err) { toast.error('Failed to update'); }
  };

  const openDeclineModal = (id) => {
    setDeclineBookingId(id);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const handleDecline = async () => {
    try {
      await adminAPI.declineBooking(declineBookingId, declineReason);
      toast.success('Booking declined successfully');
      setShowDeclineModal(false);
      loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to decline'); }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header admin-header">
        <div className="container">
          <h2 className="fw-bold text-white">📅 Manage Bookings</h2>
          <p className="text-white opacity-75 mb-0">View and update all booking statuses</p>
        </div>
      </div>
      <div className="container py-5">
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'CANCELLED'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(s)}>
              {s.replace(/_/g, ' ')} ({s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length})
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white shadow-sm rounded">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>
                    <span className="fw-semibold">{b.user?.name}</span>
                    <br /><small className="text-muted">{b.user?.email}</small>
                  </td>
                  <td>
                    <span className="fw-semibold">{b.vendor?.name}</span>
                    <br /><small className="text-muted">{b.vendor?.category?.categoryName}</small>
                  </td>
                  <td>{new Date(b.bookingDate).toLocaleDateString('en-IN')}</td>
                  <td><small>{b.timeSlot}</small></td>
                  <td className="fw-bold">Rs. {b.totalAmount}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td><StatusBadge status={b.paymentStatus} /></td>
                  <td>
                    {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'DECLINED' && (
                      <div className="d-flex gap-1">
                        <select className="form-select form-select-sm" style={{width: '120px'}}
                          value="" onChange={(e) => { if (e.target.value) handleStatusUpdate(b.id, e.target.value); }}>
                          <option value="">Update...</option>
                          {b.status === 'PENDING' && <option value="CONFIRMED">Confirm</option>}
                          {b.status === 'CONFIRMED' && <option value="IN_PROGRESS">Start</option>}
                          {b.status === 'IN_PROGRESS' && <option value="COMPLETED">Complete</option>}
                          <option value="CANCELLED">Cancel</option>
                        </select>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => openDeclineModal(b.id)}
                          title="Decline booking">
                          ✕
                        </button>
                      </div>
                    )}
                    {b.cancellationReason && (
                      <small className="text-danger d-block mt-1">{b.cancellationReason}</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-5 text-muted">No bookings found</div>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">⚠️ Decline Booking</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowDeclineModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to decline this booking? Both the customer and worker will be notified.</p>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Reason for declining:</label>
                  <textarea className="form-control" rows="3" value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="e.g., Service not available, Policy violation, etc."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeclineModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDecline}>Decline Booking</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
