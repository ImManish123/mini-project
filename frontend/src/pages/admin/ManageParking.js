import React, { useState, useEffect } from 'react';
import { parkingAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaParking, FaCar, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaWrench, FaCheckCircle, FaMotorcycle, FaWheelchair, FaClock, FaRupeeSign, FaHome, FaUserPlus, FaUnlink } from 'react-icons/fa';

const ManageParking = () => {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('allocated');
  const [showModal, setShowModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [allocatingSlot, setAllocatingSlot] = useState(null);
  const [allocateForm, setAllocateForm] = useState({ userId: '', flatNumber: '' });
  const [slotForm, setSlotForm] = useState({
    slotNumber: '', floor: 'Ground Floor', slotType: 'FOUR_WHEELER', pricePerHour: '', location: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [slotsRes, bookingsRes, statsRes, usersRes] = await Promise.allSettled([
        parkingAPI.getAllSlots(),
        parkingAPI.getAllBookings(),
        parkingAPI.getStats(),
        adminAPI.getUsers()
      ]);
      if (slotsRes.status === 'fulfilled') setSlots(slotsRes.value.data);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.filter(u => u.role === 'CUSTOMER'));
    } catch (err) {
      console.error('Error loading parking data:', err);
      toast.error('Failed to load parking data');
    } finally {
      setLoading(false);
    }
  };

  const allocatedSlots = slots.filter(s => s.isAllocated || s.allocated);
  const additionalSlots = slots.filter(s => !s.isAllocated && !s.allocated);

  const handleAddSlot = () => {
    setEditingSlot(null);
    setSlotForm({ slotNumber: '', floor: 'Basement 1', slotType: 'FOUR_WHEELER', pricePerHour: '', location: '' });
    setShowModal(true);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      slotNumber: slot.slotNumber,
      floor: slot.floor,
      slotType: slot.slotType,
      pricePerHour: slot.pricePerHour,
      location: slot.location || ''
    });
    setShowModal(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await parkingAPI.updateSlot(editingSlot.id, slotForm);
        toast.success('Slot updated successfully');
      } else {
        await parkingAPI.createSlot(slotForm);
        toast.success('Additional slot created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to save slot');
    }
  };

  const handleAllocateClick = (slot) => {
    setAllocatingSlot(slot);
    setAllocateForm({ userId: '', flatNumber: '' });
    setShowAllocateModal(true);
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!allocatingSlot) return;
    try {
      await parkingAPI.allocateSlot(allocatingSlot.id, {
        userId: parseInt(allocateForm.userId),
        flatNumber: allocateForm.flatNumber
      });
      toast.success('Slot allocated to resident successfully!');
      setShowAllocateModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate slot');
    }
  };

  const handleDeallocate = async (slotId) => {
    if (!window.confirm('Remove allocation? The slot will become available as additional parking.')) return;
    try {
      await parkingAPI.deallocateSlot(slotId);
      toast.success('Slot deallocated');
      loadData();
    } catch (err) {
      toast.error('Failed to deallocate slot');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await parkingAPI.toggleSlotStatus(id);
      toast.success('Slot status toggled');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await parkingAPI.toggleSlotActive(id);
      toast.success('Slot active status updated');
      loadData();
    } catch (err) {
      toast.error('Failed to toggle active status');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking slot?')) return;
    try {
      await parkingAPI.deleteSlot(id);
      toast.success('Slot deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete slot');
    }
  };

  const handleCompleteBooking = async (id) => {
    if (!window.confirm('Mark this booking as completed and release the slot?')) return;
    try {
      await parkingAPI.completeBooking(id);
      toast.success('Booking completed & slot released');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking and release the slot?')) return;
    try {
      await parkingAPI.cancelBooking(id);
      toast.success('Booking cancelled');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getSlotIcon = (type) => {
    switch(type) {
      case 'TWO_WHEELER': return <FaMotorcycle />;
      case 'HANDICAPPED': return <FaWheelchair />;
      default: return <FaCar />;
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header admin-header" style={{paddingBottom: '60px'}}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <FaParking className="text-white" size={22} />
              </div>
              <div>
                <h2 className="fw-bold text-white mb-1" style={{letterSpacing: '-0.5px'}}>Community Parking</h2>
                <p className="text-white mb-0" style={{opacity: 0.7, fontSize: '14px'}}>Manage allocated & additional parking slots</p>
              </div>
            </div>
            <button className="btn btn-warning fw-bold px-3" onClick={handleAddSlot} style={{borderRadius: '10px'}}>
              <FaPlus className="me-2" />Add Extra Slot
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '-40px'}}>
        {/* Stats */}
        {stats && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Allocated Slots', value: stats.allocatedSlots || allocatedSlots.length, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)', icon: <FaHome size={20} /> },
              { label: 'Additional Slots', value: stats.additionalSlots || additionalSlots.length, color: '#0984e3', bg: 'rgba(9,132,227,0.08)', icon: <FaParking size={20} /> },
              { label: 'Active Bookings', value: stats.activeBookings, color: '#00b894', bg: 'rgba(0,184,148,0.08)', icon: <FaCar size={20} /> },
              { label: 'Revenue', value: `Rs. ${(stats.totalRevenue || 0).toLocaleString()}`, color: '#f39c12', bg: 'rgba(243,156,18,0.08)', icon: <FaRupeeSign size={20} /> },
            ].map((s, i) => (
              <div key={i} className="col-md-3 col-6">
                <div className="card border-0 p-3" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="d-flex align-items-center">
                    <div className="me-3" style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: s.bg, color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0" style={{fontSize: '1.3rem'}}>{s.value}</h4>
                      <small className="text-muted" style={{fontSize: '12px'}}>{s.label}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
          <button
            className={`btn ${activeTab === 'allocated' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('allocated')}
            style={{borderRadius: '10px', fontWeight: 600}}
          >
            <FaHome className="me-2" />Allocated ({allocatedSlots.length})
          </button>
          <button
            className={`btn ${activeTab === 'additional' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('additional')}
            style={{borderRadius: '10px', fontWeight: 600}}
          >
            <FaParking className="me-2" />Additional ({additionalSlots.length})
          </button>
          <button
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('bookings')}
            style={{borderRadius: '10px', fontWeight: 600}}
          >
            <FaClock className="me-2" />Bookings ({bookings.length})
          </button>
        </div>

        {/* Allocated Slots Tab */}
        {activeTab === 'allocated' && (
          <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
            <div className="card-header bg-white border-0 p-3">
              <div className="d-flex align-items-center">
                <FaHome className="text-primary me-2" />
                <span className="fw-bold" style={{fontSize: '14px'}}>Resident Allocated Parking (1 per home)</span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{background: '#f8f9fc'}}>
                  <tr>
                    <th style={{fontSize: '13px', fontWeight: 600, padding: '14px 16px'}}>Slot</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Type</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Floor</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Flat No.</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Resident</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Status</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocatedSlots.map(slot => (
                    <tr key={slot.id}>
                      <td style={{padding: '12px 16px'}}>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{color: '#6C63FF'}}>
                            {getSlotIcon(slot.slotType)}
                          </span>
                          <strong style={{fontSize: '14px'}}>{slot.slotNumber}</strong>
                        </div>
                      </td>
                      <td style={{fontSize: '13px'}}>{slot.slotType.replace('_', ' ')}</td>
                      <td style={{fontSize: '13px'}}>{slot.floor}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary" style={{fontSize: '12px'}}>
                          {slot.flatNumber || 'Not Set'}
                        </span>
                      </td>
                      <td style={{fontSize: '13px'}}>
                        {slot.allocatedToUser ? (
                          <div>
                            <strong>{slot.allocatedToUser.name}</strong>
                            <br /><small className="text-muted">{slot.allocatedToUser.email}</small>
                          </div>
                        ) : (
                          <span className="text-muted" style={{fontSize: '12px'}}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: 'rgba(108,99,255,0.1)', color: '#6C63FF',
                          fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px'
                        }}>
                          ALLOCATED
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {!slot.allocatedToUser && (
                            <button className="btn btn-sm btn-outline-success" onClick={() => handleAllocateClick(slot)} title="Assign Resident">
                              <FaUserPlus size={11} />
                            </button>
                          )}
                          {slot.allocatedToUser && (
                            <button className="btn btn-sm btn-outline-warning" onClick={() => handleDeallocate(slot.id)} title="Remove Allocation">
                              <FaUnlink size={11} />
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditSlot(slot)} title="Edit">
                            <FaEdit size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {allocatedSlots.length === 0 && (
              <div className="text-center py-5">
                <div style={{fontSize: '48px', opacity: 0.4}}>🏠</div>
                <p className="text-muted mt-2">No allocated parking slots yet</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Slots Tab */}
        {activeTab === 'additional' && (
          <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
            <div className="card-header bg-white border-0 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FaParking className="text-primary me-2" />
                  <span className="fw-bold" style={{fontSize: '14px'}}>Additional Bookable Parking Slots</span>
                </div>
                <button className="btn btn-sm btn-primary" onClick={handleAddSlot} style={{borderRadius: '8px'}}>
                  <FaPlus className="me-1" size={10} />Add Slot
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{background: '#f8f9fc'}}>
                  <tr>
                    <th style={{fontSize: '13px', fontWeight: 600, padding: '14px 16px'}}>Slot</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Type</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Floor</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Price/hr</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Status</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Active</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {additionalSlots.map(slot => (
                    <tr key={slot.id}>
                      <td style={{padding: '12px 16px'}}>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{color: slot.status === 'AVAILABLE' ? '#00b894' : '#d63031'}}>
                            {getSlotIcon(slot.slotType)}
                          </span>
                          <strong style={{fontSize: '14px'}}>{slot.slotNumber}</strong>
                        </div>
                      </td>
                      <td style={{fontSize: '13px'}}>{slot.slotType.replace('_', ' ')}</td>
                      <td style={{fontSize: '13px'}}>{slot.floor}</td>
                      <td style={{fontSize: '13px'}}>Rs. {slot.pricePerHour}</td>
                      <td>
                        <span className="badge" style={{
                          background: slot.status === 'AVAILABLE' ? 'rgba(0,184,148,0.1)' : slot.status === 'BOOKED' ? 'rgba(214,48,49,0.1)' : 'rgba(243,156,18,0.1)',
                          color: slot.status === 'AVAILABLE' ? '#00b894' : slot.status === 'BOOKED' ? '#d63031' : '#f39c12',
                          fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px'
                        }}>
                          {slot.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm p-0" onClick={() => handleToggleActive(slot.id)} title="Toggle Active">
                          {slot.active ? <FaToggleOn size={22} className="text-success" /> : <FaToggleOff size={22} className="text-muted" />}
                        </button>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {slot.status !== 'BOOKED' && (
                            <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggleStatus(slot.id)} title="Toggle Maintenance">
                              <FaWrench size={11} />
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditSlot(slot)} title="Edit">
                            <FaEdit size={11} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteSlot(slot.id)} title="Delete">
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {additionalSlots.length === 0 && (
              <div className="text-center py-5">
                <div style={{fontSize: '48px', opacity: 0.4}}>🅿️</div>
                <p className="text-muted mt-2">No additional parking slots created yet</p>
                <button className="btn btn-primary btn-sm" onClick={handleAddSlot}>Add First Slot</button>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
            <div className="card-header bg-white border-0 p-3">
              <div className="d-flex align-items-center">
                <FaClock className="text-primary me-2" />
                <span className="fw-bold" style={{fontSize: '14px'}}>Additional Parking Bookings</span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{background: '#f8f9fc'}}>
                  <tr>
                    <th style={{fontSize: '13px', fontWeight: 600, padding: '14px 16px'}}>#</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Resident</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Slot</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Vehicle</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Duration</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Amount</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Status</th>
                    <th style={{fontSize: '13px', fontWeight: 600}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{padding: '12px 16px', fontSize: '13px'}}>#{b.id}</td>
                      <td style={{fontSize: '13px'}}>
                        <strong>{b.user?.name}</strong>
                        <br /><small className="text-muted">{b.user?.email}</small>
                      </td>
                      <td style={{fontSize: '13px'}}>
                        <strong>{b.parkingSlot?.slotNumber}</strong>
                        <br /><small className="text-muted">{b.parkingSlot?.floor}</small>
                      </td>
                      <td style={{fontSize: '13px'}}>
                        {b.vehicleNumber}
                        <br /><small className="text-muted">{b.vehicleType}</small>
                      </td>
                      <td style={{fontSize: '12px'}}>
                        {formatDateTime(b.startTime)}
                        <br />to {formatDateTime(b.endTime)}
                      </td>
                      <td><strong style={{fontSize: '14px', color: '#6C63FF'}}>Rs. {b.totalAmount}</strong></td>
                      <td>
                        <span className="badge" style={{
                          background: b.status === 'ACTIVE' ? 'rgba(0,184,148,0.1)' : b.status === 'COMPLETED' ? 'rgba(108,99,255,0.1)' : b.status === 'PENDING' ? 'rgba(243,156,18,0.1)' : 'rgba(214,48,49,0.1)',
                          color: b.status === 'ACTIVE' ? '#00b894' : b.status === 'COMPLETED' ? '#6C63FF' : b.status === 'PENDING' ? '#f39c12' : '#d63031',
                          fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px'
                        }}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {b.status === 'ACTIVE' && (
                            <button className="btn btn-sm btn-outline-success" onClick={() => handleCompleteBooking(b.id)} title="Complete & Release Slot">
                              <FaCheckCircle size={11} />
                            </button>
                          )}
                          {(b.status === 'ACTIVE' || b.status === 'PENDING') && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelBooking(b.id)} title="Cancel Booking">
                              <FaTrash size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bookings.length === 0 && (
              <div className="text-center py-5">
                <div style={{fontSize: '48px', opacity: 0.4}}>📋</div>
                <p className="text-muted mt-2">No additional parking bookings yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Slot Modal */}
      {showModal && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)', zIndex: 1050}} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content" style={{borderRadius: '16px', border: 'none'}}>
              <div className="modal-header border-0 pb-0" style={{padding: '24px 24px 0'}}>
                <h5 className="modal-title fw-bold">
                  {editingSlot ? 'Edit Parking Slot' : 'Add Additional Parking Slot'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSaveSlot}>
                <div className="modal-body" style={{padding: '20px 24px'}}>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Slot Number *</label>
                      <input type="text" className="form-control" placeholder="e.g., A-01"
                        value={slotForm.slotNumber}
                        onChange={e => setSlotForm({...slotForm, slotNumber: e.target.value})}
                        required style={{borderRadius: '10px'}} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Floor *</label>
                      <select className="form-select" value={slotForm.floor}
                        onChange={e => setSlotForm({...slotForm, floor: e.target.value})}
                        style={{borderRadius: '10px'}}>
                        <option>Ground Floor</option>
                        <option>1st Floor</option>
                        <option>2nd Floor</option>
                        <option>3rd Floor</option>
                        <option>Basement 1</option>
                        <option>Basement 2</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Slot Type *</label>
                      <select className="form-select" value={slotForm.slotType}
                        onChange={e => setSlotForm({...slotForm, slotType: e.target.value})}
                        style={{borderRadius: '10px'}}>
                        <option value="FOUR_WHEELER">Four Wheeler</option>
                        <option value="TWO_WHEELER">Two Wheeler</option>
                        <option value="HANDICAPPED">Handicapped</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Price/Hour (Rs. ) *</label>
                      <input type="number" className="form-control" placeholder="e.g., 50"
                        value={slotForm.pricePerHour}
                        onChange={e => setSlotForm({...slotForm, pricePerHour: e.target.value})}
                        required min="0" step="0.5" style={{borderRadius: '10px'}} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Location Description</label>
                      <input type="text" className="form-control" placeholder="e.g., Basement Near Entrance"
                        value={slotForm.location}
                        onChange={e => setSlotForm({...slotForm, location: e.target.value})}
                        style={{borderRadius: '10px'}} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0" style={{padding: '0 24px 24px'}}>
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)} style={{borderRadius: '10px'}}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" style={{borderRadius: '10px', fontWeight: 600}}>
                    {editingSlot ? 'Update Slot' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Allocate to Resident Modal */}
      {showAllocateModal && allocatingSlot && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)', zIndex: 1050}} onClick={() => setShowAllocateModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content" style={{borderRadius: '16px', border: 'none'}}>
              <div className="modal-header border-0 pb-0" style={{padding: '24px 24px 0'}}>
                <div>
                  <h5 className="modal-title fw-bold">Assign Resident to Slot</h5>
                  <p className="text-muted mb-0" style={{fontSize: '13px'}}>
                    Slot {allocatingSlot.slotNumber} • {allocatingSlot.floor}
                  </p>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowAllocateModal(false)}></button>
              </div>
              <form onSubmit={handleAllocate}>
                <div className="modal-body" style={{padding: '20px 24px'}}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Select Resident *</label>
                    <select className="form-select" value={allocateForm.userId}
                      onChange={e => setAllocateForm({...allocateForm, userId: e.target.value})}
                      required style={{borderRadius: '10px'}}>
                      <option value="">Choose a resident...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Flat/Unit Number *</label>
                    <input type="text" className="form-control" placeholder="e.g., 101, A-201"
                      value={allocateForm.flatNumber}
                      onChange={e => setAllocateForm({...allocateForm, flatNumber: e.target.value})}
                      required style={{borderRadius: '10px'}} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0" style={{padding: '0 24px 24px'}}>
                  <button type="button" className="btn btn-light" onClick={() => setShowAllocateModal(false)} style={{borderRadius: '10px'}}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4" style={{borderRadius: '10px', fontWeight: 600}}>
                    <FaUserPlus className="me-2" size={12} />Assign Resident
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParking;
