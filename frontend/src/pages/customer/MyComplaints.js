import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaPlus, FaClock, FaCheckCircle, FaSpinner, FaTimesCircle, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';

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
  OTHER: { label: 'Other', icon: '📋' },
};

const statusConfig = {
  OPEN: { label: 'Open', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', icon: <FaClock /> },
  IN_PROGRESS: { label: 'In Progress', color: '#0984e3', bg: 'rgba(9,132,227,0.1)', icon: <FaSpinner /> },
  RESOLVED: { label: 'Resolved', color: '#00b894', bg: 'rgba(0,184,148,0.1)', icon: <FaCheckCircle /> },
  CLOSED: { label: 'Closed', color: '#636e72', bg: 'rgba(99,110,114,0.1)', icon: <FaCheckCircle /> },
  REJECTED: { label: 'Rejected', color: '#d63031', bg: 'rgba(214,48,49,0.1)', icon: <FaTimesCircle /> },
};

const priorityConfig = {
  LOW: { color: '#00b894', label: 'Low' },
  MEDIUM: { color: '#f39c12', label: 'Medium' },
  HIGH: { color: '#e17055', label: 'High' },
  URGENT: { color: '#d63031', label: 'Urgent' },
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    try {
      const res = await complaintAPI.getMyComplaints();
      setComplaints(res.data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ paddingBottom: '60px' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-white mb-2">
                <FaExclamationTriangle className="me-2" />My Complaints
              </h2>
              <p className="text-white mb-0" style={{ opacity: 0.8, fontSize: '15px' }}>
                Track the status of your community complaints
              </p>
            </div>
            <Link to="/raise-complaint" className="btn btn-warning fw-bold px-4" style={{ borderRadius: '10px' }}>
              <FaPlus className="me-2" />Raise Complaint
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total', value: complaints.length, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
            { label: 'Open', value: complaints.filter(c => c.status === 'OPEN').length, color: '#f39c12', bg: 'rgba(243,156,18,0.08)' },
            { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, color: '#0984e3', bg: 'rgba(9,132,227,0.08)' },
            { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length, color: '#00b894', bg: 'rgba(0,184,148,0.08)' },
          ].map((s, i) => (
            <div key={i} className="col-md-3 col-6">
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

        {/* Filter */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <FaFilter className="text-muted" />
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}
              style={{ borderRadius: '20px', fontSize: '12px' }}
            >
              {f === 'ALL' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Complaint List */}
        {filtered.length === 0 ? (
          <div className="card border-0 p-5 text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px', opacity: 0.4 }}>📭</div>
            <h5 className="fw-bold text-muted mb-2">No complaints found</h5>
            <p className="text-muted mb-3" style={{ fontSize: '14px' }}>You haven't filed any complaints yet.</p>
            <Link to="/raise-complaint" className="btn btn-primary px-4" style={{ borderRadius: '10px' }}>
              <FaPlus className="me-2" />Raise Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map(complaint => {
              const catInfo = categoryLabels[complaint.category] || { label: complaint.category, icon: '📋' };
              const statusInfo = statusConfig[complaint.status] || statusConfig.OPEN;
              const priorityInfo = priorityConfig[complaint.priority] || priorityConfig.MEDIUM;
              return (
                <div key={complaint.id} className="col-12">
                  <div
                    className="card border-0 complaint-card hover-lift"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer', borderLeft: `4px solid ${priorityInfo.color}` }}
                    onClick={() => setSelectedComplaint(selectedComplaint?.id === complaint.id ? null : complaint)}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: statusInfo.bg, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                            marginRight: '14px', flexShrink: 0
                          }}>
                            {catInfo.icon}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <h6 className="fw-bold mb-0" style={{ fontSize: '15px' }}>{complaint.title}</h6>
                              <span className="badge" style={{
                                background: statusInfo.bg, color: statusInfo.color,
                                fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px'
                              }}>
                                {statusInfo.icon} <span className="ms-1">{statusInfo.label}</span>
                              </span>
                              <span className="badge" style={{
                                background: `${priorityInfo.color}15`, color: priorityInfo.color,
                                fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px'
                              }}>
                                {priorityInfo.label}
                              </span>
                            </div>
                            <p className="text-muted mb-1" style={{ fontSize: '13px' }}>
                              {complaint.description.length > 120 ? complaint.description.substring(0, 120) + '...' : complaint.description}
                            </p>
                            <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '12px' }}>
                              <span>{catInfo.label}</span>
                              {complaint.location && <span><FaMapMarkerAlt className="me-1" />{complaint.location}</span>}
                              <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-muted" style={{ fontSize: '12px' }}>#{complaint.id}</span>
                      </div>

                      {/* Expanded Detail */}
                      {selectedComplaint?.id === complaint.id && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f1f3f5' }}>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <small className="text-muted fw-semibold d-block mb-1">Full Description</small>
                              <p className="mb-0" style={{ fontSize: '13px' }}>{complaint.description}</p>
                            </div>
                            <div className="col-md-6">
                              {complaint.adminResponse && (
                                <div className="p-3 rounded-3" style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.1)' }}>
                                  <small className="text-primary fw-semibold d-block mb-1">Admin Response</small>
                                  <p className="mb-0" style={{ fontSize: '13px' }}>{complaint.adminResponse}</p>
                                </div>
                              )}
                              {complaint.assignedWorker && (
                                <div className="mt-2">
                                  <small className="text-muted fw-semibold">Assigned to: </small>
                                  <span className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: '12px' }}>
                                    {complaint.assignedWorker.name}
                                  </span>
                                </div>
                              )}
                              {complaint.resolvedAt && (
                                <div className="mt-2">
                                  <small className="text-muted fw-semibold">Resolved: </small>
                                  <span style={{ fontSize: '12px' }}>
                                    {new Date(complaint.resolvedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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

export default MyComplaints;
