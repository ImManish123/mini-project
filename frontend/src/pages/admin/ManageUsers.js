import React, { useState, useEffect } from 'react';
import { adminAPI, bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaToggleOn, FaToggleOff, FaTrash, FaUsers, FaHardHat, FaChevronDown, FaChevronUp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarCheck } from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('CUSTOMER');
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, bookingsRes] = await Promise.allSettled([
        adminAPI.getUsers(),
        bookingAPI.getAll()
      ]);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('User status updated');
      loadData();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      loadData();
    } catch (err) { toast.error('Failed'); }
  };

  const toggleExpand = (id) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  const getUserBookings = (userId) => {
    return bookings.filter(b => b.userId === userId || b.user?.id === userId);
  };

  const getWorkerBookings = (userId) => {
    return bookings.filter(b => b.vendor?.user?.id === userId || b.workerId === userId);
  };

  const filteredUsers = users.filter(u => {
    const matchesTab = u.role === activeTab;
    const matchesSearch = searchTerm === '' || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const customerCount = users.filter(u => u.role === 'CUSTOMER').length;
  const workerCount = users.filter(u => u.role === 'WORKER').length;

  const getStatusBadge = (status) => {
    const colors = { PENDING: 'warning', CONFIRMED: 'info', COMPLETED: 'success', CANCELLED: 'danger', DECLINED: 'danger', IN_PROGRESS: 'primary' };
    return colors[status] || 'secondary';
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header admin-header">
        <div className="container">
          <h2 className="fw-bold text-white">👥 Manage Users</h2>
          <p className="text-white opacity-75 mb-0">View and manage all registered users</p>
        </div>
      </div>
      <div className="container py-5">
        {/* Tabs */}
        <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
          <button
            className={`btn btn-lg ${activeTab === 'CUSTOMER' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => { setActiveTab('CUSTOMER'); setExpandedUser(null); }}
          >
            <FaUsers className="me-2" />Customers ({customerCount})
          </button>
          <button
            className={`btn btn-lg ${activeTab === 'WORKER' ? 'btn-info text-white' : 'btn-outline-info'}`}
            onClick={() => { setActiveTab('WORKER'); setExpandedUser(null); }}
          >
            <FaHardHat className="me-2" />Workers ({workerCount})
          </button>
          <div className="ms-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* User Cards */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h5>No {activeTab === 'CUSTOMER' ? 'customers' : 'workers'} found</h5>
          </div>
        ) : (
          filteredUsers.map(u => {
            const isExpanded = expandedUser === u.id;
            const userBookings = activeTab === 'CUSTOMER' ? getUserBookings(u.id) : getWorkerBookings(u.id);
            
            return (
              <div key={u.id} className="card border-0 shadow-sm mb-3">
                <div
                  className="card-body p-4"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleExpand(u.id)}
                >
                  <div className="d-flex align-items-center flex-wrap gap-3">
                    {/* Avatar */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: 50, height: 50, fontSize: '1.2rem',
                        background: activeTab === 'CUSTOMER' ? '#28a745' : '#17a2b8'
                      }}
                    >
                      {u.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* Name & Email */}
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-0">{u.name}</h6>
                      <small className="text-muted">
                        <FaEnvelope className="me-1" />{u.email}
                      </small>
                    </div>

                    {/* Phone */}
                    <div className="text-muted">
                      <FaPhone className="me-1" />{u.phone || '-'}
                    </div>

                    {/* Address */}
                    {u.address && (
                      <div className="text-muted d-none d-lg-block" style={{ maxWidth: 200 }}>
                        <FaMapMarkerAlt className="me-1" />
                        <small>{u.address}</small>
                      </div>
                    )}

                    {/* Bookings count */}
                    <div className="text-center">
                      <span className="badge bg-primary rounded-pill px-3 py-2">
                        <FaCalendarCheck className="me-1" />{userBookings.length} bookings
                      </span>
                    </div>

                    {/* Status */}
                    <span className={`badge bg-${u.active ? 'success' : 'danger'} px-3 py-2`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>

                    {/* Joined Date */}
                    <small className="text-muted">
                      Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '-'}
                    </small>

                    {/* Actions */}
                    <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-sm btn-outline-warning" title={u.active ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(u.id)}>
                        {u.active ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(u.id)}>
                        <FaTrash />
                      </button>
                    </div>

                    {/* Expand icon */}
                    <div className="text-primary">
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="card-footer bg-light p-4">
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Full Name:</strong> {u.name}
                      </div>
                      <div className="col-md-4">
                        <strong>Email:</strong> {u.email}
                      </div>
                      <div className="col-md-4">
                        <strong>Phone:</strong> {u.phone || 'N/A'}
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <strong>Address:</strong> {u.address || 'N/A'}
                      </div>
                      <div className="col-md-4">
                        <strong>Role:</strong>{' '}
                        <span className={`badge bg-${u.role === 'CUSTOMER' ? 'success' : 'info'}`}>{u.role}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Status:</strong>{' '}
                        <span className={`badge bg-${u.active ? 'success' : 'danger'}`}>{u.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    {/* Booking History */}
                    <h6 className="fw-bold mb-3">
                      <FaCalendarCheck className="me-2 text-primary" />
                      {activeTab === 'CUSTOMER' ? 'Booking History' : 'Assigned Bookings'} ({userBookings.length})
                    </h6>
                    {userBookings.length === 0 ? (
                      <p className="text-muted">No bookings found.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Service</th>
                              {activeTab === 'CUSTOMER' ? <th>Worker/Vendor</th> : <th>Customer</th>}
                              <th>Date</th>
                              <th>Time Slot</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Payment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userBookings.map((b, idx) => (
                              <tr key={b.id}>
                                <td>{idx + 1}</td>
                                <td className="fw-semibold">{b.vendor?.name || b.vendorName || '-'}</td>
                                {activeTab === 'CUSTOMER' ? (
                                  <td>{b.vendor?.user?.name || b.workerName || 'Not Assigned'}</td>
                                ) : (
                                  <td>{b.user?.name || b.customerName || '-'}</td>
                                )}
                                <td>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN') : '-'}</td>
                                <td>{b.timeSlot || '-'}</td>
                                <td className="fw-semibold">Rs. {b.totalAmount?.toLocaleString() || 0}</td>
                                <td>
                                  <span className={`badge bg-${getStatusBadge(b.status)}`}>{b.status}</span>
                                </td>
                                <td>
                                  <span className={`badge bg-${b.paymentStatus === 'PAID' ? 'success' : 'secondary'}`}>
                                    {b.paymentStatus || 'PENDING'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
