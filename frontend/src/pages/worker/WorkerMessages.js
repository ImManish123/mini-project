import React, { useState, useEffect } from 'react';
import { workerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaEnvelopeOpen, FaCheckDouble, FaUser, FaCalendarAlt, FaCheck, FaTimes, FaBell } from 'react-icons/fa';

const WorkerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await workerAPI.getMessages();
      setMessages(res.data);
    } catch (err) {
      toast.error('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await workerAPI.markAllRead();
      toast.success('All messages marked as read');
      loadMessages();
    } catch (err) {
      toast.error('Failed to mark messages');
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'BOOKING_REQUEST': return <FaCalendarAlt className="text-warning" />;
      case 'BOOKING_ACCEPTED': return <FaCheck className="text-success" />;
      case 'BOOKING_DECLINED': return <FaTimes className="text-danger" />;
      default: return <FaBell className="text-info" />;
    }
  };

  const getMessageBg = (type) => {
    switch (type) {
      case 'BOOKING_REQUEST': return 'border-start border-warning border-4';
      case 'BOOKING_ACCEPTED': return 'border-start border-success border-4';
      case 'BOOKING_DECLINED': return 'border-start border-danger border-4';
      default: return '';
    }
  };

  const unreadCount = messages.filter(m => !m.readByReceiver).length;

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header" style={{background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', paddingBottom: '60px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h2 className="fw-bold text-white mb-1" style={{letterSpacing: '-0.5px'}}>Messages & Notifications</h2>
              <p className="text-white mb-0" style={{opacity: 0.85, fontSize: '15px'}}>
                {unreadCount > 0 ? `${unreadCount} unread message(s)` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-sm text-white" onClick={handleMarkAllRead}
                style={{background: 'rgba(255,255,255,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: 600}}>
                <FaCheckDouble className="me-1" size={12} />Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '-30px'}}>
        {messages.length === 0 ? (
          <div className="card border-0 text-center py-5" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
            <div className="card-body">
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📭</div>
              <h5 className="fw-bold text-muted">No messages yet</h5>
              <p className="text-muted" style={{fontSize: '14px'}}>Messages will appear here when customers book your services</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {messages.map((msg, index) => (
              <div key={msg.id} className="col-12" style={{animation: 'fadeInUp 0.4s ease forwards', animationDelay: `${index * 0.04}s`}}>
                <div className={`card border-0 ${getMessageBg(msg.messageType)}`}
                  style={{boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '14px', background: !msg.readByReceiver ? '#fafbff' : '#fff'}}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start gap-3">
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: !msg.readByReceiver ? 'rgba(108,99,255,0.1)' : '#f1f3f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {!msg.readByReceiver ? <FaEnvelope className="text-primary" size={16} /> : <FaEnvelopeOpen className="text-muted" size={16} />}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span style={{background: '#f1f3f5', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600}}>
                              {getMessageIcon(msg.messageType)}{' '}
                              {msg.messageType?.replace(/_/g, ' ')}
                            </span>
                            {!msg.readByReceiver && (
                              <span style={{background: '#6C63FF', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700}}>NEW</span>
                            )}
                          </div>
                          <small className="text-muted" style={{fontSize: '12px', whiteSpace: 'nowrap'}}>
                            {new Date(msg.createdAt).toLocaleString('en-IN', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                          </small>
                        </div>
                        <p className="mb-1 mt-2" style={{fontSize: '14px', lineHeight: '1.5'}}>{msg.content}</p>
                        <div className="d-flex gap-3 flex-wrap">
                          {msg.sender && (
                            <small className="text-muted" style={{fontSize: '12px'}}>
                              <FaUser className="me-1" size={11} />From: {msg.sender.name}
                            </small>
                          )}
                          {msg.booking && (
                            <small className="text-muted" style={{fontSize: '12px'}}>
                              <FaCalendarAlt className="me-1" size={11} />Booking #{msg.booking.id}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
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

export default WorkerMessages;
