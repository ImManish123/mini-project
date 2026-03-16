import React, { useState, useEffect } from 'react';
import { sosAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaFireAlt, FaAmbulance, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const sosTypes = [
  { type: 'FIRE', label: 'Fire Emergency', icon: <FaFireAlt size={40} />, color: '#e74c3c', bg: '#ffeaea', desc: 'Report fire emergency in the building', phone: '101' },
  { type: 'AMBULANCE', label: 'Medical Emergency', icon: <FaAmbulance size={40} />, color: '#e67e22', bg: '#fff3e0', desc: 'Request immediate medical assistance', phone: '108' },
  { type: 'POLICE', label: 'Police / Security', icon: <FaShieldAlt size={40} />, color: '#2980b9', bg: '#e3f2fd', desc: 'Report security threat or incident', phone: '100' },
];

const statusConfig = {
  INITIATED: { label: 'Initiated', color: '#6c757d', icon: <FaClock size={12} /> },
  NOTIFIED: { label: 'Notified', color: '#e67e22', icon: <FaExclamationTriangle size={12} /> },
  RESPONDING: { label: 'Responding', color: '#2980b9', icon: <FaAmbulance size={12} /> },
  RESOLVED: { label: 'Resolved', color: '#27ae60', icon: <FaCheckCircle size={12} /> },
  CANCELLED: { label: 'Cancelled', color: '#95a5a6', icon: <FaTimesCircle size={12} /> },
};

const SosEmergency = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await sosAPI.getMyAlerts();
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    setShowConfirm(true);
  };

  const handleSendAlert = async () => {
    if (!selectedType) return;
    setSending(true);
    try {
      const res = await sosAPI.createAlert({
        sosType: selectedType.type,
        location: location || user?.address || 'Apartment Complex',
        description: description || `${selectedType.label} reported by ${user?.name}`,
      });
      setSuccessData({ ...res.data, typeMeta: selectedType });
      setShowConfirm(false);
      setShowSuccess(true);
      setLocation('');
      setDescription('');
      toast.success('Emergency alert sent successfully!');
      loadAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this SOS alert?')) return;
    try {
      await sosAPI.cancelAlert(id);
      toast.info('Alert cancelled');
      loadAlerts();
    } catch (err) {
      toast.error('Failed to cancel alert');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-danger" /></div>;

  return (
    <div className="page-wrapper" style={{ background: '#f0f2f5' }}>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', paddingBottom: '60px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="fw-bold text-white mb-2" style={{ letterSpacing: '-0.5px' }}>
            <FaExclamationTriangle className="me-2" /> SOS Emergency
          </h2>
          <p className="text-white mb-0" style={{ opacity: 0.85, fontSize: '15px' }}>
            Quick emergency alerts for fire, medical, and security emergencies
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        {/* Success Modal */}
        {showSuccess && successData && (
          <div className="card border-0 mb-4" style={{ boxShadow: '0 8px 30px rgba(39,174,96,0.2)', borderLeft: '5px solid #27ae60' }}>
            <div className="card-body text-center py-5">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e8f8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'fadeInUp 0.5s ease' }}>
                <FaCheckCircle size={40} color="#27ae60" />
              </div>
              <h3 className="fw-bold text-success mb-2">Alert Sent Successfully!</h3>
              <p className="text-muted mb-3">
                Your <strong>{successData.typeMeta?.label}</strong> alert has been sent to the building management and emergency services have been notified.
              </p>
              <div className="card border-0 mx-auto mb-3" style={{ maxWidth: '400px', background: successData.typeMeta?.bg }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <span style={{ color: successData.typeMeta?.color }}>{successData.typeMeta?.icon}</span>
                    <div className="text-start">
                      <div className="fw-bold" style={{ color: successData.typeMeta?.color }}>{successData.typeMeta?.label}</div>
                      <small className="text-muted">Emergency No: {successData.typeMeta?.phone}</small>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-muted" style={{ fontSize: '14px' }}>
                <FaClock className="me-1" /> Estimated response time: <strong>5-10 minutes</strong>
              </p>
              <p className="text-muted mb-4" style={{ fontSize: '13px' }}>
                Alert ID: <strong>#{successData.id}</strong> | Status: <span className="badge bg-warning text-dark">Notified</span>
              </p>
              <button className="btn btn-outline-success px-4" onClick={() => setShowSuccess(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {showConfirm && selectedType && !showSuccess && (
          <div className="card border-0 mb-4" style={{ boxShadow: '0 8px 30px rgba(231,76,60,0.15)', borderLeft: `5px solid ${selectedType.color}` }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3" style={{ color: selectedType.color }}>
                {selectedType.icon} Confirm {selectedType.label}
              </h5>
              <div className="mb-3">
                <label className="form-label fw-semibold"><FaMapMarkerAlt className="me-1" />Location (optional)</label>
                <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)}
                  placeholder={user?.address || "e.g. Block A, Floor 3, Flat 301"} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Description (optional)</label>
                <textarea className="form-control" rows={2} value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Briefly describe the emergency..." />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-lg fw-bold flex-fill" style={{ background: selectedType.color, color: 'white', borderRadius: '12px' }}
                  onClick={handleSendAlert} disabled={sending}>
                  {sending ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : <>🚨 SEND ALERT</>}
                </button>
                <button className="btn btn-outline-secondary btn-lg px-4" style={{ borderRadius: '12px' }}
                  onClick={() => { setShowConfirm(false); setSelectedType(null); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* SOS Type Cards */}
        {!showConfirm && !showSuccess && (
          <div className="row g-4 mb-5">
            {sosTypes.map((s) => (
              <div key={s.type} className="col-md-4">
                <div className="card border-0 h-100 text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: '16px' }}
                  onClick={() => handleSelectType(s)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${s.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                  <div className="card-body p-5">
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: s.color }}>
                      {s.icon}
                    </div>
                    <h4 className="fw-bold mb-2">{s.label}</h4>
                    <p className="text-muted mb-3" style={{ fontSize: '14px' }}>{s.desc}</p>
                    <div className="badge" style={{ background: s.bg, color: s.color, fontSize: '14px', padding: '8px 16px' }}>
                      📞 {s.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert History */}
        <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <div className="card-header bg-white border-0 p-4">
            <h5 className="fw-bold mb-0">My SOS Alert History</h5>
          </div>
          <div className="card-body p-0">
            {alerts.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaShieldAlt size={40} className="mb-3 opacity-25" />
                <p>No alerts raised yet. Stay safe!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Location</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(a => {
                      const typeInfo = sosTypes.find(t => t.type === a.sosType) || sosTypes[0];
                      const stInfo = statusConfig[a.status] || statusConfig.INITIATED;
                      return (
                        <tr key={a.id}>
                          <td style={{ padding: '12px 16px' }}>#{a.id}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{a.location || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge" style={{ background: `${stInfo.color}15`, color: stInfo.color, padding: '6px 12px' }}>
                              {stInfo.icon} <span className="ms-1">{stInfo.label}</span>
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>{new Date(a.createdAt).toLocaleString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {(a.status === 'NOTIFIED' || a.status === 'INITIATED') && (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(a.id)}>Cancel</button>
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

export default SosEmergency;
