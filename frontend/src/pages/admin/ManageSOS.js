import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sosAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaFireAlt, FaAmbulance, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaClock, FaChartBar, FaFilter } from 'react-icons/fa';

const sosTypeMeta = {
  FIRE: { label: 'Fire', icon: <FaFireAlt />, color: '#e74c3c' },
  AMBULANCE: { label: 'Ambulance', icon: <FaAmbulance />, color: '#e67e22' },
  POLICE: { label: 'Police', icon: <FaShieldAlt />, color: '#2980b9' },
};

const statusMeta = {
  INITIATED: { label: 'Initiated', color: '#6c757d' },
  NOTIFIED: { label: 'Notified', color: '#e67e22' },
  RESPONDING: { label: 'Responding', color: '#2980b9' },
  RESOLVED: { label: 'Resolved', color: '#27ae60' },
  CANCELLED: { label: 'Cancelled', color: '#95a5a6' },
};

const ManageSOS = () => {
  const [alerts, setAlerts] = useState([]);
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
      const [alertsRes, statsRes] = await Promise.all([sosAPI.getAll(), sosAPI.getStats()]);
      setAlerts(alertsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load SOS data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await sosAPI.updateStatus(id, newStatus);
      toast.success(`Alert #${id} updated to ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredAlerts = statusFilter === 'ALL' ? alerts : alerts.filter(a => a.status === statusFilter);

  if (loading) return <div className="loading-screen"><div className="spinner-border text-danger" /></div>;

  return (
    <div className="page-wrapper" style={{ background: '#f0f2f5' }}>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', paddingBottom: '60px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="fw-bold text-white mb-2"><FaExclamationTriangle className="me-2" /> Manage SOS Alerts</h2>
          <p className="text-white mb-0" style={{ opacity: 0.85 }}>Monitor and respond to emergency alerts</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        {/* Stats */}
        {stats && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Total', value: stats.total || 0, color: '#6c757d', icon: <FaChartBar /> },
              { label: 'Notified', value: stats.notified || 0, color: '#e67e22', icon: <FaClock /> },
              { label: 'Responding', value: stats.responding || 0, color: '#2980b9', icon: <FaAmbulance /> },
              { label: 'Resolved', value: stats.resolved || 0, color: '#27ae60', icon: <FaCheckCircle /> },
              { label: 'Cancelled', value: stats.cancelled || 0, color: '#95a5a6', icon: <FaTimesCircle /> },
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

        {/* Filter & Table */}
        <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">All SOS Alerts ({filteredAlerts.length})</h5>
            <div className="d-flex align-items-center gap-2">
              <FaFilter className="text-muted" />
              <select className="form-select form-select-sm" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {Object.entries(statusMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-5 text-muted">No alerts found</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>ID</th>
                      <th style={{ padding: '12px 16px' }}>User</th>
                      <th style={{ padding: '12px 16px' }}>Type</th>
                      <th style={{ padding: '12px 16px' }}>Location</th>
                      <th style={{ padding: '12px 16px' }}>Description</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map(a => {
                      const tMeta = sosTypeMeta[a.sosType] || sosTypeMeta.FIRE;
                      const sMeta = statusMeta[a.status] || statusMeta.INITIATED;
                      return (
                        <tr key={a.id}>
                          <td style={{ padding: '12px 16px' }}>#{a.id}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="fw-semibold">{a.user?.name || 'N/A'}</div>
                            <small className="text-muted">{a.user?.email || ''}</small>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: tMeta.color }}>{tMeta.icon} {tMeta.label}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{a.location || '—'}</td>
                          <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                            <span style={{ fontSize: '13px' }}>{a.description || '—'}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge" style={{ background: `${sMeta.color}20`, color: sMeta.color, padding: '6px 12px' }}>
                              {sMeta.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>{new Date(a.createdAt).toLocaleString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {a.status !== 'RESOLVED' && a.status !== 'CANCELLED' && (
                              <div style={{ position: 'relative' }}>
                                <button
                                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                  onClick={(e) => handleDropdownToggle(a.id, e)}
                                >
                                  Update
                                </button>
                                {openDropdown === a.id && (
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
                                    {['NOTIFIED', 'RESPONDING', 'RESOLVED', 'CANCELLED'].filter(s => s !== a.status).map(s => (
                                      <button
                                        key={s}
                                        className="dropdown-item"
                                        style={{ padding: '6px 16px', cursor: 'pointer' }}
                                        onClick={() => { handleStatusUpdate(a.id, s); setOpenDropdown(null); }}
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

export default ManageSOS;
