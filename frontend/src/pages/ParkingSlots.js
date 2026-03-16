import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { parkingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaCar, FaMotorcycle, FaWheelchair, FaMapMarkerAlt, FaClock, FaRupeeSign, FaParking, FaFilter, FaHome, FaPlus } from 'react-icons/fa';

const ParkingSlots = () => {
  const { user, isAuthenticated } = useAuth();
  const [slots, setSlots] = useState([]);
  const [allocatedSlot, setAllocatedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    vehicleNumber: '',
    vehicleType: 'Car',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSlots();
    if (isAuthenticated()) {
      loadMyAllocatedSlot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSlots = async () => {
    try {
      const res = await parkingAPI.getAdditionalSlots();
      setSlots(res.data);
    } catch (err) {
      console.error('Error loading parking slots:', err);
      toast.error('Failed to load parking slots');
    } finally {
      setLoading(false);
    }
  };

  const loadMyAllocatedSlot = async () => {
    try {
      const res = await parkingAPI.getMyAllocatedSlot();
      if (res.data && res.data.length > 0) {
        setAllocatedSlot(res.data[0]);
      }
    } catch (err) {
      console.error('Error loading allocated slot:', err);
    }
  };

  const filteredSlots = filterType === 'ALL' 
    ? slots 
    : slots.filter(s => s.slotType === filterType);

  const getSlotIcon = (type) => {
    switch(type) {
      case 'TWO_WHEELER': return <FaMotorcycle size={24} />;
      case 'HANDICAPPED': return <FaWheelchair size={24} />;
      default: return <FaCar size={24} />;
    }
  };

  const getSlotTypeLabel = (type) => {
    switch(type) {
      case 'TWO_WHEELER': return 'Two Wheeler';
      case 'HANDICAPPED': return 'Handicapped';
      default: return 'Four Wheeler';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'AVAILABLE': return '#00b894';
      case 'BOOKED': return '#d63031';
      case 'ALLOCATED': return '#6C63FF';
      case 'MAINTENANCE': return '#f39c12';
      default: return '#636e72';
    }
  };

  const handleBookClick = (slot) => {
    if (!isAuthenticated()) {
      toast.info('Please login to book a parking slot');
      return;
    }
    setSelectedSlot(slot);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const startStr = now.toISOString().slice(0, 16);
    const endTime = new Date(now);
    endTime.setHours(endTime.getHours() + 2);
    const endStr = endTime.toISOString().slice(0, 16);
    
    setBookingForm({
      vehicleNumber: '',
      vehicleType: slot.slotType === 'TWO_WHEELER' ? 'Bike' : 'Car',
      startTime: startStr,
      endTime: endStr,
      notes: ''
    });
    setShowBookingModal(true);
  };

  const calculateAmount = () => {
    if (!selectedSlot || !bookingForm.startTime || !bookingForm.endTime) return 0;
    const start = new Date(bookingForm.startTime);
    const end = new Date(bookingForm.endTime);
    let hours = (end - start) / (1000 * 60 * 60);
    if (hours < 1) hours = 1;
    return Math.ceil(hours) * selectedSlot.pricePerHour;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    if (!bookingForm.vehicleNumber.trim()) {
      toast.error('Please enter vehicle number');
      return;
    }

    // Validate time
    const start = new Date(bookingForm.startTime);
    const end = new Date(bookingForm.endTime);
    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }
    if (start < new Date(Date.now() - 5 * 60 * 1000)) {
      toast.error('Start time cannot be in the past');
      return;
    }

    setSubmitting(true);
    try {
      const formatTime = (timeStr) => timeStr.length === 16 ? timeStr + ':00' : timeStr;
      await parkingAPI.createBooking({
        slotId: selectedSlot.id,
        vehicleNumber: bookingForm.vehicleNumber,
        vehicleType: bookingForm.vehicleType,
        startTime: formatTime(bookingForm.startTime),
        endTime: formatTime(bookingForm.endTime),
        notes: bookingForm.notes
      });
      toast.success('Booking created! Go to My Parking to pay & occupy the slot 💳');
      setShowBookingModal(false);
      loadSlots();
    } catch (err) {
      let errMsg = 'Failed to book parking slot';
      if (err.response?.data) {
        if (err.response.data.message) {
          errMsg = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errMsg = err.response.data;
        } else if (typeof err.response.data === 'object' && Object.keys(err.response.data).length > 0) {
          errMsg = Object.values(err.response.data)[0];
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  const availableCount = slots.filter(s => s.status === 'AVAILABLE').length;
  const bookedCount = slots.filter(s => s.status === 'BOOKED').length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header" style={{paddingBottom: '60px', background: 'linear-gradient(135deg, #0984e3 0%, #6C63FF 100%)'}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center mb-3">
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginRight: '14px'
                }}>
                  <FaParking className="text-white" size={26} />
                </div>
                <div>
                  <h2 className="fw-bold text-white mb-1" style={{letterSpacing: '-0.5px'}}>Community Parking</h2>
                  <p className="text-white mb-0" style={{opacity: 0.8, fontSize: '14px'}}>
                    Every home gets 1 allocated slot • Book additional parking below
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <div className="d-flex gap-3 justify-content-lg-end">
                <div className="text-center px-3" style={{borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                  <h4 className="text-white fw-bold mb-0">{availableCount}</h4>
                  <small className="text-white" style={{opacity: 0.7, fontSize: '12px'}}>Available</small>
                </div>
                <div className="text-center px-3" style={{borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                  <h4 className="text-white fw-bold mb-0">{bookedCount}</h4>
                  <small className="text-white" style={{opacity: 0.7, fontSize: '12px'}}>Booked</small>
                </div>
                <div className="text-center px-3">
                  <h4 className="text-white fw-bold mb-0">{slots.length}</h4>
                  <small className="text-white" style={{opacity: 0.7, fontSize: '12px'}}>Extra Slots</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '-40px'}}>
        {/* Allocated Slot Section */}
        {isAuthenticated() && (
          <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderLeft: '4px solid #6C63FF'}}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(108,99,255,0.1)', color: '#6C63FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                }}>
                  <FaHome size={20} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0" style={{fontSize: '16px'}}>Your Allocated Parking Slot</h5>
                  <small className="text-muted" style={{fontSize: '12px'}}>1 complimentary slot included with your home</small>
                </div>
              </div>
              {allocatedSlot ? (
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div style={{background: '#f8f9fc', borderRadius: '12px', padding: '16px'}}>
                      <div className="row g-3">
                        <div className="col-sm-3 text-center">
                          <div style={{
                            width: '56px', height: '56px', borderRadius: '14px',
                            background: 'rgba(108,99,255,0.1)', color: '#6C63FF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 8px'
                          }}>
                            {getSlotIcon(allocatedSlot.slotType)}
                          </div>
                          <h6 className="fw-bold mb-0">{allocatedSlot.slotNumber}</h6>
                          <small className="text-muted" style={{fontSize: '11px'}}>{getSlotTypeLabel(allocatedSlot.slotType)}</small>
                        </div>
                        <div className="col-sm-9">
                          <div className="row g-2">
                            <div className="col-6">
                              <small className="text-muted d-block" style={{fontSize: '11px'}}>Floor</small>
                              <span className="fw-semibold" style={{fontSize: '13px'}}>{allocatedSlot.floor}</span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block" style={{fontSize: '11px'}}>Flat No.</small>
                              <span className="fw-semibold" style={{fontSize: '13px'}}>{allocatedSlot.flatNumber || '-'}</span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block" style={{fontSize: '11px'}}>Location</small>
                              <span style={{fontSize: '12px'}}>{allocatedSlot.location}</span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block" style={{fontSize: '11px'}}>Status</small>
                              <span className="badge" style={{
                                background: 'rgba(108,99,255,0.1)', color: '#6C63FF',
                                fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px'
                              }}>
                                ALLOCATED ✓
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-center mt-3 mt-md-0">
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,184,148,0.08))',
                      borderRadius: '14px', padding: '20px'
                    }}>
                      <span style={{fontSize: '36px'}}>🅿️</span>
                      <h6 className="fw-bold text-success mb-0 mt-2">FREE</h6>
                      <small className="text-muted" style={{fontSize: '11px'}}>Included with home</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3" style={{background: '#f8f9fc', borderRadius: '12px'}}>
                  <span style={{fontSize: '32px', opacity: 0.5}}>🅿️</span>
                  <p className="text-muted mb-0" style={{fontSize: '13px'}}>
                    No parking slot allocated to your account yet. Contact admin to allocate your slot.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Parking Section Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <FaPlus className="text-primary me-2" size={16} />
            <h5 className="fw-bold mb-0" style={{fontSize: '18px'}}>Book Additional Parking</h5>
          </div>
          <small className="text-muted" style={{fontSize: '12px'}}>Need extra parking for guests or additional vehicles?</small>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}>
          <div className="card-body p-3">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <FaFilter className="text-muted me-2" />
              <span className="text-muted me-2" style={{fontSize: '14px', fontWeight: 600}}>Filter:</span>
              {['ALL', 'FOUR_WHEELER', 'TWO_WHEELER', 'HANDICAPPED'].map(type => (
                <button
                  key={type}
                  className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType(type)}
                  style={{borderRadius: '20px', fontSize: '13px', padding: '5px 16px'}}
                >
                  {type === 'ALL' ? '🅿️ All' : type === 'FOUR_WHEELER' ? '🚗 Four Wheeler' : type === 'TWO_WHEELER' ? '🏍️ Two Wheeler' : '♿ Handicapped'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Slots Grid */}
        {filteredSlots.length > 0 ? (
          <div className="row g-3">
            {filteredSlots.map((slot, index) => (
              <div key={slot.id} className="col-lg-3 col-md-4 col-sm-6" style={{animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`}}>
                <div className={`card border-0 h-100 parking-slot-card ${slot.status === 'AVAILABLE' ? 'hover-lift' : ''}`} 
                  style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'default'}}>
                  <div className="card-body p-4 text-center">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="badge" style={{
                        background: `${getStatusColor(slot.status)}15`,
                        color: getStatusColor(slot.status),
                        fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px'
                      }}>
                        {slot.status}
                      </span>
                      <span className="badge bg-light text-dark" style={{fontSize: '11px'}}>{slot.floor}</span>
                    </div>

                    <div style={{
                      width: '64px', height: '64px', borderRadius: '16px',
                      background: slot.status === 'AVAILABLE' ? 'rgba(0,184,148,0.1)' : slot.status === 'BOOKED' ? 'rgba(214,48,49,0.1)' : 'rgba(243,156,18,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px', color: getStatusColor(slot.status)
                    }}>
                      {getSlotIcon(slot.slotType)}
                    </div>
                    <h5 className="fw-bold mb-1">{slot.slotNumber}</h5>
                    <p className="text-muted mb-2" style={{fontSize: '12px'}}>{getSlotTypeLabel(slot.slotType)}</p>

                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <FaMapMarkerAlt className="text-muted me-1" size={10} />
                      <small className="text-muted" style={{fontSize: '11px'}}>{slot.location}</small>
                    </div>

                    <div className="mb-3">
                      <span className="fw-bold text-primary" style={{fontSize: '1.2rem'}}>Rs. {slot.pricePerHour}</span>
                      <small className="text-muted">/hr</small>
                    </div>

                    {slot.status === 'AVAILABLE' ? (
                      <button 
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => handleBookClick(slot)}
                        style={{borderRadius: '10px', fontWeight: 600}}
                      >
                        Book Extra Slot
                      </button>
                    ) : slot.status === 'BOOKED' ? (
                      <button className="btn btn-sm w-100" disabled
                        style={{borderRadius: '10px', background: '#fee2e2', color: '#d63031', border: 'none'}}>
                        Occupied
                      </button>
                    ) : (
                      <button className="btn btn-sm w-100" disabled
                        style={{borderRadius: '10px', background: '#fef3c7', color: '#f39c12', border: 'none'}}>
                        Under Maintenance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div style={{fontSize: '64px', marginBottom: '16px', opacity: 0.4}}>🅿️</div>
            <h5 className="text-muted">No additional parking slots found</h5>
            <p className="text-muted" style={{fontSize: '14px'}}>Try a different filter or check back later</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="card border-0 mt-4 mb-4" style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.05), rgba(0,184,148,0.05))',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
        }}>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h6 className="fw-bold mb-1" style={{fontSize: '15px'}}>💡 How Community Parking Works</h6>
                <ul className="text-muted mb-0" style={{fontSize: '13px', lineHeight: 1.8}}>
                  <li>Each home/flat gets <strong>1 free allocated parking slot</strong> included with your unit</li>
                  <li>Need parking for <strong>guests or extra vehicles</strong>? Reserve from the additional slots above</li>
                  <li><strong>Step 1:</strong> Reserve a slot → <strong>Step 2:</strong> Pay to occupy → <strong>Step 3:</strong> Exit when done</li>
                  <li>Additional slots are charged <strong>hourly</strong> and released when your booking completes</li>
                </ul>
              </div>
              <div className="col-md-4 text-center mt-3 mt-md-0">
                <span style={{fontSize: '48px'}}>🏢</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)', zIndex: 1050}} onClick={() => setShowBookingModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content" style={{borderRadius: '16px', border: 'none'}}>
              <div className="modal-header border-0 pb-0" style={{padding: '24px 24px 0'}}>
                <div>
                  <h5 className="modal-title fw-bold">Book Additional Parking</h5>
                  <p className="text-muted mb-0" style={{fontSize: '13px'}}>
                    Slot {selectedSlot.slotNumber} • {selectedSlot.floor} • {getSlotTypeLabel(selectedSlot.slotType)}
                  </p>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowBookingModal(false)}></button>
              </div>
              <form onSubmit={handleBooking}>
                <div className="modal-body" style={{padding: '20px 24px'}}>
                  <div className="alert" style={{background: 'rgba(108,99,255,0.08)', border: 'none', borderRadius: '12px'}}>
                    <div className="d-flex justify-content-between">
                      <span style={{fontSize: '14px'}}>
                        <FaRupeeSign className="text-primary me-1" size={12} />
                        Rate: <strong>Rs. {selectedSlot.pricePerHour}/hr</strong>
                      </span>
                      {calculateAmount() > 0 && (
                        <span className="fw-bold text-primary" style={{fontSize: '14px'}}>
                          Total: Rs. {calculateAmount()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Vehicle Number *</label>
                    <input type="text" className="form-control" placeholder="e.g., KA-01-AB-1234"
                      value={bookingForm.vehicleNumber}
                      onChange={e => setBookingForm({...bookingForm, vehicleNumber: e.target.value.toUpperCase()})}
                      required style={{borderRadius: '10px'}} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Vehicle Type</label>
                    <select className="form-select" value={bookingForm.vehicleType}
                      onChange={e => setBookingForm({...bookingForm, vehicleType: e.target.value})}
                      style={{borderRadius: '10px'}}>
                      {selectedSlot.slotType === 'TWO_WHEELER' ? (
                        <><option>Bike</option><option>Scooter</option><option>Bicycle</option></>
                      ) : (
                        <><option>Car</option><option>SUV</option><option>Van</option></>
                      )}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                        <FaClock className="me-1" size={11} />Start Time *
                      </label>
                      <input type="datetime-local" className="form-control"
                        value={bookingForm.startTime}
                        onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})}
                        required style={{borderRadius: '10px', fontSize: '13px'}} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                        <FaClock className="me-1" size={11} />End Time *
                      </label>
                      <input type="datetime-local" className="form-control"
                        value={bookingForm.endTime}
                        onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})}
                        required style={{borderRadius: '10px', fontSize: '13px'}} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>Notes (Optional)</label>
                    <textarea className="form-control" rows="2"
                      placeholder="e.g., Guest vehicle, visiting for 2 days..."
                      value={bookingForm.notes}
                      onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                      style={{borderRadius: '10px', fontSize: '13px'}}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0" style={{padding: '0 24px 24px'}}>
                  <button type="button" className="btn btn-light" onClick={() => setShowBookingModal(false)}
                    style={{borderRadius: '10px'}}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}
                    style={{borderRadius: '10px', fontWeight: 600}}>
                    {submitting ? 'Booking...' : `Reserve for Rs. ${calculateAmount()}`}
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

export default ParkingSlots;
