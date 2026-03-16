import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';

const CustomerProfile = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await api.put('/users/profile', formData);
      const updatedUser = { ...user, ...res.data };
      login(updatedUser);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header" style={{paddingBottom: '60px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <h2 className="fw-bold text-white mb-2" style={{letterSpacing: '-0.5px'}}>My Profile</h2>
          <p className="text-white mb-0" style={{opacity: 0.8, fontSize: '15px'}}>Manage your account details</p>
        </div>
      </div>

      <div className="container" style={{marginTop: '-40px'}}>
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-lg-4">
            <div className="card border-0 text-center" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <div className="card-body p-4">
                <div className="vendor-avatar-xl mx-auto mb-3" style={{fontSize: '32px'}}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <h5 className="fw-bold mb-1">{user?.name}</h5>
                <p className="text-muted mb-2" style={{fontSize: '14px'}}>{user?.email}</p>
                <span className="badge bg-primary bg-opacity-10 text-primary" style={{fontSize: '11px'}}>
                  <FaShieldAlt className="me-1" size={10} />{user?.role}
                </span>
                <hr style={{opacity: 0.1}} className="my-3" />
                <div className="text-start">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(108,99,255,0.08)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                    }}>
                      <FaEnvelope className="text-primary" size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{fontSize: '11px'}}>Email</small>
                      <span style={{fontSize: '13px', fontWeight: 600}}>{user?.email}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(0,184,148,0.08)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                    }}>
                      <FaPhone className="text-success" size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{fontSize: '11px'}}>Phone</small>
                      <span style={{fontSize: '13px', fontWeight: 600}}>{user?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(243,156,18,0.08)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                    }}>
                      <FaCalendarAlt className="text-warning" size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{fontSize: '11px'}}>Member Since</small>
                      <span style={{fontSize: '13px', fontWeight: 600}}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'}) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="col-lg-8">
            <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center" style={{borderBottom: '1px solid #f1f3f5'}}>
                <h6 className="fw-bold mb-0">
                  <FaUser className="me-2 text-primary" size={14} />Account Details
                </h6>
                <button 
                  className={`btn btn-sm ${editing ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  style={{borderRadius: '8px', fontSize: '13px'}}
                >
                  {editing ? <><FaSave className="me-1" size={12} />Save</> : <><FaEdit className="me-1" size={12} />Edit</>}
                </button>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                      <FaUser className="me-2 text-primary" size={12} />Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editing}
                      style={{fontSize: '14px'}}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                      <FaEnvelope className="me-2 text-primary" size={12} />Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email}
                      disabled
                      style={{fontSize: '14px', background: '#f8f9fc'}}
                    />
                    <small className="text-muted" style={{fontSize: '11px'}}>Email cannot be changed</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                      <FaPhone className="me-2 text-primary" size={12} />Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Enter phone number"
                      style={{fontSize: '14px'}}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{fontSize: '13px'}}>
                      <FaMapMarkerAlt className="me-2 text-primary" size={12} />Address
                    </label>
                    <textarea
                      className="form-control"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Enter your address"
                      style={{fontSize: '14px'}}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-primary px-4" onClick={handleSave} style={{borderRadius: '10px'}}>
                      <FaSave className="me-2" size={13} />Save Changes
                    </button>
                    <button className="btn btn-outline-secondary px-4" onClick={() => setEditing(false)} style={{borderRadius: '10px'}}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Security */}
            <div className="card border-0 mt-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <div className="card-header bg-white py-3 px-4" style={{borderBottom: '1px solid #f1f3f5'}}>
                <h6 className="fw-bold mb-0">
                  <FaShieldAlt className="me-2 text-primary" size={14} />Account Security
                </h6>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1" style={{fontSize: '14px'}}>Password</h6>
                    <p className="text-muted mb-0" style={{fontSize: '13px'}}>Last changed: Unknown</p>
                  </div>
                  <button className="btn btn-outline-primary btn-sm" style={{borderRadius: '8px', fontSize: '13px'}}
                    onClick={() => toast.info('Password change feature coming soon!')}>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
