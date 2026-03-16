import React, { useState, useEffect, useRef, useCallback } from 'react';
import { liftBookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaBuilding, FaCalendarAlt, FaClock, FaUsers, FaCheckCircle, FaTimesCircle, FaChartBar, FaFilter, FaArrowUp, FaCreditCard } from 'react-icons/fa';

const statusMeta = {
  PENDING: { label: 'Pending', color: '#f39c12' },
  CONFIRMED: { label: 'Confirmed', color: '#27ae60' },
  ACTIVE: { label: 'Active', color: '#2980b9' },
  COMPLETED: { label: 'Completed', color: '#7f8c8d' },
  CANCELLED: { label: 'Cancelled', color: '#e74c3c' },
};

const paymentMeta = {
  PENDING: { label: 'Unpaid', color: '#f39c12' },
  PAID: { label: 'Paid', color: '#27ae60' },
  FAILED: { label: 'Failed', color: '#e74c3c' },
  REFUNDED: { label: 'Refunded', color: '#8e44ad' },
  CASH_ON_SERVICE: { label: 'Cash', color: '#2980b9' },
};

const ManageLiftBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  const handleDropdownToggle = useCallback((id, e) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, left: rect.right });
    setOpenDropdown(id);
  }, [openDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([liftBookingAPI.getAll(), liftBookingAPI.getStats()]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load lift booking data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await liftBookingAPI.updateStatus(id, newStatus);
      toast.success(`Booking #${id} updated to ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredBookings = statusFilter === 'ALL' ? bookings : bookings.filter(b => b.status === statusFilter);

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{ background: '#f0f2f5' }}>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', paddingBottom: '60px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="fw-bold text-white mb-2"><FaBuilding className="me-2" /> Manage Lift Bookings</h2>
          <p className="text-white mb-0" style={{ opacity: 0.85 }}>Review and manage apartment lift booking requests</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        {/* Stats */}
        {stats && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Total', value: stats.total || 0, color: '#6c757d', icon: <FaChartBar /> },
              { label: 'Pending', value: stats.pending || 0, color: '#f39c12', icon: <FaClock /> },
              { label: 'Confirmed', value: stats.confirmed || 0, color: '#27ae60', icon: <FaCheckCircle /> },
              { label: 'Active', value: stats.active || 0, color: '#2980b9', icon: <FaArrowUp /> },
              { label: 'Completed', value: stats.completed || 0, color: '#7f8c8d', icon: <FaCheckCircle /> },
              { label: 'Cancelled', value: stats.cancelled || 0, color: '#e74c3c', icon: <FaTimesCircle /> },
            ].map((s, i) => (
              <div key={i} className="col">
                <div className="card border-0 text-center" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.06)', borderRadius: '12px' }}>
                  <div className="card-body p-3">
                    <div className="mb-1" style={{ color: s.color }}>{s.icon}</div>
                    <h3 className="fw-bold mb-0" style={{ color: s.color }}>{s.value}</h3>
                    <small className="text-muted">{s.label}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">All Lift Bookings ({filteredBookings.length})</h5>
            <div className="d-flex align-items-center gap-2">
              <FaFilter className="text-muted" />
              <select className="form-select form-select-sm" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {Object.entries(statusMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-5 text-muted">No bookings found</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>ID</th>
                      <th style={{ padding: '12px 16px' }}>Resident</th>
                      <th style={{ padding: '12px 16px' }}>Flat</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Time</th>
                      <th style={{ padding: '12px 16px' }}>Purpose</th>
                      <th style={{ padding: '12px 16px' }}>Amount</th>
                      <th style={{ padding: '12px 16px' }}>Payment</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => {
                      const sMeta = statusMeta[b.status] || statusMeta.PENDING;
                      const pMeta = paymentMeta[b.paymentStatus] || paymentMeta.PENDING;
                      return (
                        <tr key={b.id}>
                          <td style={{ padding: '12px 16px' }}>#{b.id}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="fw-semibold">{b.user?.name || 'N/A'}</div>
                            <small className="text-muted">{b.user?.email || ''}</small>
                          </td>
                          <td style={{ padding: '12px 16px' }}><FaBuilding className="me-1 text-muted" />{b.flatNumber}</td>
                          <td style={{ padding: '12px 16px' }}><FaCalendarAlt className="me-1 text-muted" />{b.bookingDate}</td>
                          <td style={{ padding: '12px 16px' }}>{b.startTime?.substring(0, 5)} — {b.endTime?.substring(0, 5)}</td>
                          <td style={{ padding: '12px 16px' }}>{b.purpose || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="fw-semibold">Rs. {b.totalAmount || 0}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge" style={{ background: `${pMeta.color}20`, color: pMeta.color, padding: '6px 12px' }}>
                              <FaCreditCard className="me-1" size={10} />{pMeta.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge" style={{ background: `${sMeta.color}20`, color: sMeta.color, padding: '6px 12px' }}>
                              {sMeta.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                              <div style={{ position: 'relative' }}>
                                <button
                                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                  onClick={(e) => handleDropdownToggle(b.id, e)}
                                >
                                  Update
                                </button>
                                {openDropdown === b.id && (
                                  <div
                                    ref={dropdownRef}
                                    style={{
                                      position: 'fixed',
                                      top: dropdownPos.top,
                                      left: dropdownPos.left,
                                      transform: 'translateX(-100%)',
                                      zIndex: 9999,
                                      background: '#fff',
                                      border: '1px solid rgba(0,0,0,0.15)',
                                      borderRadius: '6px',
                                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                      padding: '4px 0',
                                      minWidth: '150px',
                                    }}
                                  >
                                    {['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].filter(s => s !== b.status).map(s => (
                                      <button
                                        key={s}
                                        className="dropdown-item"
                                        style={{ padding: '6px 16px', cursor: 'pointer' }}
                                        onClick={() => { handleStatusUpdate(b.id, s); setOpenDropdown(null); }}
                                      >
                                        <span style={{ color: statusMeta[s]?.color }}>● </span>{statusMeta[s]?.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
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
      </div>
    </div>
  );
};

export default ManageLiftBookings;
