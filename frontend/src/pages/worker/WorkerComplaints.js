import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaClock, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const categoryLabels = {
  WATER_SUPPLY: { label: 'Water Supply', icon: '💧' },
  ELECTRICAL: { label: 'Electrical', icon: '⚡' },
  ELEVATOR: { label: 'Elevator', icon: '🛗' },
  GARBAGE: { label: 'Garbage', icon: '🗑️' },
  SECURITY: { label: 'Security', icon: '🔒' },
  NOISE: { label: 'Noise', icon: '🔊' },
  STRUCTURAL: { label: 'Structural', icon: '🏗️' },
  PLUMBING: { label: 'Plumbing', icon: '🔧' },
  COMMON_AREA: { label: 'Common Area', icon: '🏢' },
  PARKING: { label: 'Parking', icon: '🅿️' },
  GARDEN: { label: 'Garden', icon: '🌳' },
  SERVICE_COMPLAINT: { label: 'Service Complaint', icon: '👷' },
  OTHER: { label: 'Other', icon: '📋' },
};

const priorityConfig = {
  LOW: { color: '#00b894', label: 'Low' },
  MEDIUM: { color: '#f39c12', label: 'Medium' },
  HIGH: { color: '#e17055', label: 'High' },
  URGENT: { color: '#d63031', label: 'Urgent' },
};

const statusConfig = {
  OPEN: { label: 'Open', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', icon: <FaClock /> },
  IN_PROGRESS: { label: 'In Progress', color: '#0984e3', bg: 'rgba(9,132,227,0.1)', icon: <FaSpinner /> },
  RESOLVED: { label: 'Resolved', color: '#00b894', bg: 'rgba(0,184,148,0.1)', icon: <FaCheckCircle /> },
  CLOSED: { label: 'Closed', color: '#636e72', bg: 'rgba(99,110,114,0.1)', icon: <FaCheckCircle /> },
};

const WorkerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    try {
      const res = await complaintAPI.getWorkerAssigned();
      setComplaints(res.data);
    } catch (err) {
      toast.error('Failed to load assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await complaintAPI.workerUpdateStatus(id, status);
      toast.success('Status updated');
      loadComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ paddingBottom: '60px' }}>
        <div className="container">
          <h2 className="fw-bold text-white mb-2">
            <FaExclamationTriangle className="me-2" />Assigned Complaints
          </h2>
          <p className="text-white mb-0" style={{ opacity: 0.8, fontSize: '15px' }}>
            Complaints assigned to you for resolution
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Assigned', value: complaints.length, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
            { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, color: '#0984e3', bg: 'rgba(9,132,227,0.08)' },
            { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: '#00b894', bg: 'rgba(0,184,148,0.08)' },
          ].map((s, i) => (
            <div key={i} className="col-md-4">
              <div className="card border-0 p-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: s.bg, color: s.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 700
                  }}>
                    {s.value}
                  </div>
                  <small className="text-muted fw-semibold" style={{ fontSize: '12px' }}>{s.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {complaints.length === 0 ? (
          <div className="card border-0 p-5 text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px', opacity: 0.4 }}>📭</div>
            <h5 className="fw-bold text-muted">No complaints assigned</h5>
            <p className="text-muted" style={{ fontSize: '14px' }}>You don't have any complaints assigned to you yet.</p>
          </div>
        ) : (
          <div className="row g-3">
            {complaints.map(c => {
              const catInfo = categoryLabels[c.category] || { label: c.category, icon: '📋' };
              const priInfo = priorityConfig[c.priority] || priorityConfig.MEDIUM;
              const statInfo = statusConfig[c.status] || statusConfig.OPEN;
              return (
                <div key={c.id} className="col-12">
                  <div className="card border-0 complaint-card" style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    borderLeft: `4px solid ${priInfo.color}`
                  }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: statInfo.bg, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                            marginRight: '14px', flexShrink: 0
                          }}>
                            {catInfo.icon}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <h6 className="fw-bold mb-0" style={{ fontSize: '15px' }}>#{c.id} — {c.title}</h6>
                              <span className="badge" style={{
                                background: statInfo.bg, color: statInfo.color,
                                fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px'
                              }}>
                                {statInfo.label}
                              </span>
                              <span className="badge" style={{
                                background: `${priInfo.color}15`, color: priInfo.color,
                                fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px'
                              }}>
                                {priInfo.label} Priority
                              </span>
                            </div>
                            <p className="text-muted mb-2" style={{ fontSize: '13px' }}>{c.description}</p>
                            <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '12px' }}>
                              <span><FaUser size={10} className="me-1" />{c.user?.name}</span>
                              <span>{catInfo.label}</span>
                              {c.location && <span><FaMapMarkerAlt size={10} className="me-1" />{c.location}</span>}
                              <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                            <>
                              {c.status === 'OPEN' && (
                                <button className="btn btn-info btn-sm fw-semibold" onClick={() => handleStatusUpdate(c.id, 'IN_PROGRESS')} style={{ borderRadius: '8px', fontSize: '12px' }}>
                                  Start Working
                                </button>
                              )}
                              {c.status === 'IN_PROGRESS' && (
                                <button className="btn btn-success btn-sm fw-semibold" onClick={() => handleStatusUpdate(c.id, 'RESOLVED')} style={{ borderRadius: '8px', fontSize: '12px' }}>
                                  <FaCheckCircle className="me-1" />Mark Resolved
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerComplaints;
