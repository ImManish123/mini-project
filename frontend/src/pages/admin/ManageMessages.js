import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaEnvelopeOpen, FaCheckDouble, FaTrash, FaUser, FaCalendarAlt, FaCheck, FaTimes, FaBell, FaFilter } from 'react-icons/fa';

const ManageMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await adminAPI.getMessages();
      setMessages(res.data);
    } catch (err) {
      toast.error('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminAPI.markMessageRead(id);
      setMessages(messages.map(m => m.id === id ? {...m, readByAdmin: true} : m));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminAPI.markAllMessagesRead();
      setMessages(messages.map(m => ({...m, readByAdmin: true})));
      toast.success('All messages marked as read');
    } catch (err) {
      toast.error('Failed to mark messages');
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'BOOKING_REQUEST': return <FaCalendarAlt className="text-warning" size={18} />;
      case 'BOOKING_ACCEPTED': return <FaCheck className="text-success" size={18} />;
      case 'BOOKING_DECLINED': return <FaTimes className="text-danger" size={18} />;
      default: return <FaBell className="text-info" size={18} />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BOOKING_REQUEST': return 'bg-warning text-dark';
      case 'BOOKING_ACCEPTED': return 'bg-success';
      case 'BOOKING_DECLINED': return 'bg-danger';
      default: return 'bg-info';
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !m.readByAdmin;
    return m.messageType === filter;
  });

  const unreadCount = messages.filter(m => !m.readByAdmin).length;

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header admin-header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-white">Messages & Activity Log</h2>
              <p className="text-white opacity-75 mb-0">
                {unreadCount > 0 ? `${unreadCount} unread message(s)` : 'All messages read'} — {messages.length} total
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-light btn-sm" onClick={handleMarkAllRead}>
                <FaCheckDouble className="me-1" />Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Filter Row */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <FaFilter className="mt-2 text-muted" />
          {['ALL', 'UNREAD', 'BOOKING_REQUEST', 'BOOKING_ACCEPTED', 'BOOKING_DECLINED'].map(f => (
            <button key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}>
              {f.replace(/_/g, ' ')}
              <span className="badge bg-white text-dark ms-1">
                {f === 'ALL' ? messages.length :
                 f === 'UNREAD' ? unreadCount :
                 messages.filter(m => m.messageType === f).length}
              </span>
            </button>
          ))}
        </div>

        {filteredMessages.length === 0 ? (
          <div className="text-center py-5">
            <FaEnvelope size={60} className="text-muted mb-3" />
            <h5 className="text-muted">No messages found</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover bg-white shadow-sm rounded">
              <thead>
                <tr>
                  <th width="30"></th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Message</th>
                  <th>Booking</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map(msg => (
                  <tr key={msg.id} className={!msg.readByAdmin ? 'fw-semibold' : ''} style={{backgroundColor: !msg.readByAdmin ? '#f0f8ff' : ''}}>
                    <td>
                      {msg.readByAdmin ? (
                        <FaEnvelopeOpen className="text-muted" />
                      ) : (
                        <FaEnvelope className="text-primary" />
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getTypeBadge(msg.messageType)}`}>
                        {getMessageIcon(msg.messageType)}{' '}
                        {msg.messageType?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="vendor-avatar-sm" style={{width: '28px', height: '28px', fontSize: '11px'}}>
                          {msg.sender?.name?.charAt(0)}
                        </div>
                        <div>
                          <small className="d-block">{msg.sender?.name}</small>
                          <small className="text-muted">{msg.sender?.role}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <small>{msg.receiver?.name}</small><br />
                      <small className="text-muted">{msg.receiver?.role}</small>
                    </td>
                    <td style={{maxWidth: '300px'}}>
                      <small className={!msg.readByAdmin ? '' : 'text-muted'}>{msg.content}</small>
                    </td>
                    <td>
                      {msg.booking && (
                        <span className="badge bg-light text-dark">#{msg.booking.id}</span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted text-nowrap">{new Date(msg.createdAt).toLocaleString()}</small>
                    </td>
                    <td>
                      {!msg.readByAdmin && (
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleMarkRead(msg.id)} title="Mark as read">
                          <FaCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMessages;
