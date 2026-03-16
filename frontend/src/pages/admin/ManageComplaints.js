import React, { useState, useEffect } from 'react';
import { complaintAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaFilter, FaClock, FaCheckCircle, FaSpinner, FaTimesCircle, FaMapMarkerAlt, FaUser, FaHardHat, FaTrash, FaReply, FaArrowUp, FaUserPlus } from 'react-icons/fa';

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

const statusConfig = {
  OPEN: { label: 'Open', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', icon: <FaClock size={12} /> },
  IN_PROGRESS: { label: 'In Progress', color: '#0984e3', bg: 'rgba(9,132,227,0.1)', icon: <FaSpinner size={12} /> },
  RESOLVED: { label: 'Resolved', color: '#00b894', bg: 'rgba(0,184,148,0.1)', icon: <FaCheckCircle size={12} /> },
  CLOSED: { label: 'Closed', color: '#636e72', bg: 'rgba(99,110,114,0.1)', icon: <FaCheckCircle size={12} /> },
  REJECTED: { label: 'Rejected', color: '#d63031', bg: 'rgba(214,48,49,0.1)', icon: <FaTimesCircle size={12} /> },
};

const priorityConfig = {
  LOW: { color: '#00b894', label: 'Low' },
  MEDIUM: { color: '#f39c12', label: 'Medium' },
  HIGH: { color: '#e17055', label: 'High' },
  URGENT: { color: '#d63031', label: 'Urgent' },
};

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [compRes, statsRes, workersRes] = await Promise.allSettled([
        complaintAPI.getAll(),
        complaintAPI.getStats(),
        adminAPI.getWorkers()
      ]);
      if (compRes.status === 'fulfilled') setComplaints(compRes.value.data);
      else console.error('Failed to load complaints:', compRes.reason);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      else console.error('Failed to load stats:', statsRes.reason);
      if (workersRes.status === 'fulfilled') setWorkers(workersRes.value.data);
      else console.error('Failed to load workers:', workersRes.reason);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await complaintAPI.updateStatus(id, status);
      toast.success('Status updated');
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (id, priority) => {
    try {
      await complaintAPI.updatePriority(id, priority);
      toast.success('Priority updated');
      loadData();
    } catch (err) {
      toast.error('Failed to update priority');
    }
  };

  const handleAssignWorker = async (id) => {
    if (!selectedWorker) { toast.error('Select a worker'); return; }
    try {
      await complaintAPI.assignWorker(id, parseInt(selectedWorker));
      toast.success('Worker assigned');
      setSelectedWorker('');
      loadData();
    } catch (err) {
      toast.error('Failed to assign worker');
    }
  };

  const handleRespond = async (id) => {
    if (!responseText.trim()) { toast.error('Enter a response'); return; }
    try {
      await complaintAPI.addResponse(id, responseText);
      toast.success('Response added');
      setResponseText('');
      loadData();
    } catch (err) {
      toast.error('Failed to add response');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await complaintAPI.deleteComplaint(id);
      toast.success('Complaint deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{ background: '#f0f2f5' }}>
      <div className="page-header admin-header" style={{ paddingBottom: '60px' }}>
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <FaExclamationTriangle className="text-white" size={22} />
            </div>
            <div>
              <h2 className="fw-bold text-white mb-1">Manage Complaints</h2>
              <p className="text-white mb-0" style={{ opacity: 0.7, fontSize: '14px' }}>
                Review, assign, and resolve community complaints
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-45px' }}>
        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total', value: stats.totalComplaints || 0, color: '#6C63FF', bg: 'linear-gradient(135deg, #6C63FF, #4834d4)', filterKey: 'ALL' },
            { label: 'Open', value: stats.openComplaints || 0, color: '#f39c12', bg: 'linear-gradient(135deg, #f39c12, #e67e22)', filterKey: 'OPEN' },
            { label: 'In Progress', value: stats.inProgressComplaints || 0, color: '#0984e3', bg: 'linear-gradient(135deg, #0984e3, #74b9ff)', filterKey: 'IN_PROGRESS' },
            { label: 'Resolved', value: stats.resolvedComplaints || 0, color: '#00b894', bg: 'linear-gradient(135deg, #00b894, #00cec9)', filterKey: 'RESOLVED' },
          ].map((s, i) => (
            <div key={i} className="col-lg-3 col-md-6">
              <div className="card border-0 text-white hover-lift" 
                onClick={() => setFilter(s.filterKey)}
                style={{ 
                  background: s.bg, 
                  boxShadow: filter === s.filterKey ? `0 8px 30px rgba(0,0,0,0.3)` : '0 8px 25px rgba(0,0,0,0.15)', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  transform: filter === s.filterKey ? 'scale(1.03)' : 'scale(1)',
                  border: filter === s.filterKey ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent'
                }}>
                <div className="card-body p-3">
                  <p className="mb-1" style={{ opacity: 0.85, fontSize: '13px', fontWeight: 500 }}>{s.label}</p>
                  <h2 className="fw-bold mb-0" style={{ fontSize: '1.6rem' }}>{s.value}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Urgent/High Priority Alert */}
        {(stats.urgentComplaints > 0 || stats.highPriorityComplaints > 0) && (
          <div className="card border-0 mb-4" style={{ background: 'rgba(214,48,49,0.08)', border: '1px solid rgba(214,48,49,0.2) !important' }}>
            <div className="card-body p-3 d-flex align-items-center">
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(214,48,49,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginRight: '14px'
              }}>
                <FaArrowUp className="text-danger" size={18} />
              </div>
              <span className="fw-semibold" style={{ fontSize: '14px' }}>
                <strong>{(stats.urgentComplaints || 0) + (stats.highPriorityComplaints || 0)}</strong> high priority complaint(s) need attention
              </span>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <FaFilter className="text-muted" />
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(f => (
            <button key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}
              style={{ borderRadius: '20px', fontSize: '12px' }}
            >
              {f === 'ALL' ? 'All' : f.replace('_', ' ')}
              {f !== 'ALL' && (
                <span className="badge bg-white text-dark ms-1" style={{ fontSize: '10px' }}>
                  {complaints.filter(c => c.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        {filtered.length === 0 ? (
          <div className="card border-0 p-5 text-center">
            <div style={{ fontSize: '60px', marginBottom: '16px', opacity: 0.4 }}>📭</div>
            <h5 className="fw-bold text-muted">No complaints found</h5>
          </div>
        ) : (
          <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>#</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Complaint</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Category</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Filed By</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Priority</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Status</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Assigned</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Date</th>
                    <th style={{ fontWeight: 600, padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const catInfo = categoryLabels[c.category] || { label: c.category, icon: '📋' };
                    const statusInfo = statusConfig[c.status] || statusConfig.OPEN;
                    const priInfo = priorityConfig[c.priority] || priorityConfig.MEDIUM;
                    const isExpanded = selectedComplaint?.id === c.id;
                    return (
                      <React.Fragment key={c.id}>
                        <tr style={{ cursor: 'pointer' }} onClick={() => { setSelectedComplaint(isExpanded ? null : c); if (!isExpanded) { setResponseText(''); setSelectedWorker(''); } }}>
                          <td style={{ padding: '12px 16px' }}>{c.id}</td>
                          <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                            <div className="fw-semibold text-dark">{c.title}</div>
                            {c.location && (
                              <small className="text-muted"><FaMapMarkerAlt size={10} className="me-1" />{c.location}</small>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span>{catInfo.icon} {catInfo.label}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span><FaUser size={10} className="me-1 text-muted" />{c.user?.name}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <select
                              className="form-select form-select-sm"
                              value={c.priority}
                              onClick={e => e.stopPropagation()}
                              onChange={e => handlePriorityChange(c.id, e.target.value)}
                              style={{ fontSize: '11px', borderRadius: '8px', width: '100px', color: priInfo.color, fontWeight: 600, border: `1px solid ${priInfo.color}30` }}
                            >
                              {Object.entries(priorityConfig).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <select
                              className="form-select form-select-sm"
                              value={c.status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => handleStatusChange(c.id, e.target.value)}
                              style={{ fontSize: '11px', borderRadius: '8px', width: '120px', color: statusInfo.color, fontWeight: 600, border: `1px solid ${statusInfo.color}30` }}
                            >
                              {Object.entries(statusConfig).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {c.assignedWorker ? (
                              <span className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: '11px' }}>
                                <FaHardHat size={10} className="me-1" />{c.assignedWorker.name}
                              </span>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '11px' }}>Unassigned</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <small className="text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</small>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button className="btn btn-outline-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(c.id); }} style={{ borderRadius: '8px', fontSize: '11px' }}>
                              <FaTrash size={10} />
                            </button>
                          </td>
                        </tr>
                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} style={{ background: '#f8f9fc', padding: '20px' }}>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <h6 className="fw-bold mb-2" style={{ fontSize: '13px' }}>Description</h6>
                                  <p style={{ fontSize: '13px' }}>{c.description}</p>
                                  {c.adminResponse && (
                                    <div className="p-3 rounded-3 mb-2" style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.1)' }}>
                                      <small className="text-primary fw-semibold d-block mb-1">Previous Response</small>
                                      <p className="mb-0" style={{ fontSize: '13px' }}>{c.adminResponse}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="col-md-6">
                                  {/* Assign Worker */}
                                  <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                                      <FaUserPlus className="me-1" />Assign Worker
                                    </label>
                                    <div className="input-group input-group-sm">
                                      <select className="form-select" value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)} style={{ fontSize: '12px', borderRadius: '8px 0 0 8px' }}>
                                        <option value="">Select worker...</option>
                                        {workers.map(w => (
                                          <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                                        ))}
                                      </select>
                                      <button className="btn btn-primary" onClick={() => handleAssignWorker(c.id)} style={{ borderRadius: '0 8px 8px 0', fontSize: '12px' }}>Assign</button>
                                    </div>
                                  </div>
                                  {/* Admin Response */}
                                  <div>
                                    <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                                      <FaReply className="me-1" />Admin Response
                                    </label>
                                    <div className="input-group input-group-sm">
                                      <textarea className="form-control" rows="2" placeholder="Type response to resident..." value={responseText} onChange={e => setResponseText(e.target.value)} style={{ fontSize: '12px', borderRadius: '8px 0 0 8px' }} />
                                      <button className="btn btn-success" onClick={() => handleRespond(c.id)} style={{ borderRadius: '0 8px 8px 0', fontSize: '12px' }}>Send</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageComplaints;
