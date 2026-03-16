import React, { useState, useEffect } from 'react';
import { workerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaSave, FaUser, FaPhone, FaMapMarkerAlt, FaRupeeSign, FaBriefcase, FaInfoCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const WorkerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await workerAPI.getProfile();
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        description: res.data.description || '',
        serviceArea: res.data.serviceArea || '',
        servicePincodes: res.data.servicePincodes || '',
        price: res.data.price || '',
        experienceYears: res.data.experienceYears || '',
        availabilityStatus: res.data.availabilityStatus ?? true,
      });
    } catch (err) {
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workerAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    const newStatus = !formData.availabilityStatus;
    setFormData(prev => ({ ...prev, availabilityStatus: newStatus }));
    try {
      await workerAPI.updateProfile({ ...formData, availabilityStatus: newStatus });
      toast.success(newStatus ? 'You are now available' : 'You are now unavailable');
    } catch (err) {
      setFormData(prev => ({ ...prev, availabilityStatus: !newStatus }));
      toast.error('Failed to update availability');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header" style={{background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', paddingBottom: '60px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <h2 className="fw-bold text-white mb-1" style={{letterSpacing: '-0.5px'}}>My Profile</h2>
          <p className="text-white mb-0" style={{opacity: 0.85, fontSize: '15px'}}>Update your service provider details</p>
        </div>
      </div>

      <div className="container" style={{marginTop: '-40px'}}>
        <div className="row">
          {/* Profile Card */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 text-center" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
              <div className="card-body p-4">
                <div className="vendor-avatar-xl mx-auto mb-3" style={{fontSize: '32px'}}>
                  {profile?.name?.charAt(0)}
                </div>
                <h5 className="fw-bold mb-1">{profile?.name}</h5>
                <p className="text-muted mb-2" style={{fontSize: '14px'}}>{profile?.category?.categoryName}</p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  {profile?.approved ? (
                    <span style={{background: 'rgba(0,184,148,0.1)', color: '#00b894', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600}}>✓ Approved</span>
                  ) : (
                    <span style={{background: 'rgba(243,156,18,0.1)', color: '#f39c12', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600}}>⏳ Pending</span>
                  )}
                  {profile?.blocked && <span style={{background: 'rgba(214,48,49,0.1)', color: '#d63031', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600}}>Blocked</span>}
                </div>
                <hr style={{opacity: 0.1}} />
                <div className="text-start">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(243,156,18,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'}}>
                      <span style={{fontSize: '14px'}}>⭐</span>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{fontSize: '11px'}}>Rating</small>
                      <span style={{fontSize: '13px', fontWeight: 600}}>{profile?.rating?.toFixed(1)} ({profile?.totalReviews} reviews)</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div style={{width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(108,99,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', color: '#6C63FF'}}>
                      <FaUser size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{fontSize: '11px'}}>Email</small>
                      <span style={{fontSize: '13px', fontWeight: 600}}>{profile?.email}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,184,148,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', color: '#00b894'}}>
                      <FaBriefcase size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{fontSize: '11px'}}>Member Since</small>
                      <span style={{fontSize: '13px', fontWeight: 600}}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'}) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-center gap-3 mt-3 p-2 rounded-3"
                  onClick={toggleAvailability}
                  style={{cursor: 'pointer', background: formData.availabilityStatus ? 'rgba(0,184,148,0.08)' : 'rgba(0,0,0,0.03)', borderRadius: '10px', transition: 'background 0.3s ease'}}>
                  <button type="button" className={`availability-toggle ${formData.availabilityStatus ? 'active' : ''}`}
                    onClick={e => e.stopPropagation()}>
                    <div className="toggle-knob" />
                  </button>
                  <span style={{fontSize: '14px', fontWeight: 600, color: formData.availabilityStatus ? '#00b894' : '#999'}}>
                    {formData.availabilityStatus ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Details Card */}
            {profile?.category && (
              <div className="card border-0 shadow-sm mt-3">
                <div className="card-header bg-primary text-white py-3">
                  <h6 className="fw-bold mb-0">📋 Category Details</h6>
                </div>
                <div className="card-body">
                  <div className="text-center mb-3">
                    {profile.category.imageUrl && (
                      <img src={profile.category.imageUrl} alt={profile.category.categoryName}
                        className="rounded" style={{width: '80px', height: '80px', objectFit: 'cover'}} />
                    )}
                    <h6 className="fw-bold mt-2 mb-1">{profile.category.categoryName}</h6>
                    {profile.category.icon && <span className="fs-4">{profile.category.icon}</span>}
                  </div>
                  {profile.category.description && (
                    <p className="text-muted small mb-2">
                      <strong>Description:</strong> {profile.category.description}
                    </p>
                  )}
                  <div className="d-flex justify-content-between border-top pt-2 mt-2">
                    <small className="text-muted">
                      <strong>Status:</strong>{' '}
                      {profile.category.active ? (
                        <span className="text-success">Active</span>
                      ) : (
                        <span className="text-danger">Inactive</span>
                      )}
                    </small>
                    <small className="text-muted">
                      <strong>ID:</strong> #{profile.category.id}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Form */}
          <div className="col-lg-8">
            <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
              <div className="card-header bg-white py-3 px-4" style={{borderBottom: '1px solid #f1f3f5', borderRadius: '16px 16px 0 0'}}>
                <h6 className="fw-bold mb-0" style={{fontSize: '15px'}}>Edit Profile</h6>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaUser className="me-2 text-primary" />Display Name
                      </label>
                      <input type="text" className="form-control" name="name"
                        value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaPhone className="me-2 text-primary" />Phone
                      </label>
                      <input type="tel" className="form-control" name="phone"
                        value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaRupeeSign className="me-2 text-primary" />Service Price (Rs. )
                      </label>
                      <input type="number" className="form-control" name="price"
                        value={formData.price} onChange={handleChange} min="0" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaBriefcase className="me-2 text-primary" />Experience (years)
                      </label>
                      <input type="number" className="form-control" name="experienceYears"
                        value={formData.experienceYears} onChange={handleChange} min="0" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaMapMarkerAlt className="me-2 text-primary" />Service Area (City)
                    </label>
                    <input type="text" className="form-control" name="serviceArea"
                      value={formData.serviceArea} onChange={handleChange} placeholder="e.g. Mumbai, Pune" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      📍 Service Pincodes
                    </label>
                    <input type="text" className="form-control" name="servicePincodes"
                      value={formData.servicePincodes} onChange={handleChange} 
                      placeholder="e.g. 600001, 600002, 600003 (comma-separated)" />
                    <small className="text-muted">Enter pincodes where you provide service. Leave empty to serve all areas.</small>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <FaInfoCircle className="me-2 text-primary" />Description
                    </label>
                    <textarea className="form-control" name="description" rows="3"
                      value={formData.description} onChange={handleChange} placeholder="Describe your services..." />
                  </div>
                  <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaSave className="me-2" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
