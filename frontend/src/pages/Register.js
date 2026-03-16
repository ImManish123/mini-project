import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, categoryAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaUserPlus, FaHardHat, FaUserTie } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
    role: 'CUSTOMER', categoryId: '', experience: '', price: '', serviceArea: '', servicePincodes: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      const res = await authAPI.register(data);
      login(res.data);
      toast.success('Account created successfully!');
      if (data.role === 'WORKER') {
        navigate('/worker');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{background: '#f0f2f5'}}>
      <div className="container">
        <div className="row justify-content-center align-items-center py-5">
          <div className="col-md-8 col-lg-7">
            <div className="card border-0 auth-card" style={{boxShadow: '0 8px 40px rgba(0,0,0,0.08)', borderRadius: '20px'}}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="auth-icon mb-3">
                    <FaUserPlus size={30} />
                  </div>
                  <h3 className="fw-bold">Create Account</h3>
                  <p className="text-muted">Join HomeServ today</p>
                </div>

                {/* Role Selection */}
                <div className="d-flex gap-3 mb-4">
                  <button type="button"
                    className={`btn flex-fill py-3 ${formData.role === 'CUSTOMER' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFormData({...formData, role: 'CUSTOMER'})}
                    style={{borderRadius: '14px', transition: 'all 0.3s ease'}}>
                    <FaUserTie className="me-2" size={20} />
                    <div className="fw-bold">Customer</div>
                    <small style={{opacity: 0.8}}>Book home services</small>
                  </button>
                  <button type="button"
                    className={`btn flex-fill py-3 ${formData.role === 'WORKER' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFormData({...formData, role: 'WORKER'})}
                    style={{borderRadius: '14px', transition: 'all 0.3s ease'}}>
                    <FaHardHat className="me-2" size={20} />
                    <div className="fw-bold">Worker</div>
                    <small style={{opacity: 0.8}}>Provide services</small>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaUser className="me-2 text-primary" />Full Name
                      </label>
                      <input type="text" className="form-control" name="name"
                        value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaEnvelope className="me-2 text-primary" />Email
                      </label>
                      <input type="email" className="form-control" name="email"
                        value={formData.email} onChange={handleChange} placeholder="john@email.com" required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaLock className="me-2 text-primary" />Password
                      </label>
                      <input type="password" className="form-control" name="password"
                        value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <FaLock className="me-2 text-primary" />Confirm Password
                      </label>
                      <input type="password" className="form-control" name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaPhone className="me-2 text-primary" />Phone Number
                    </label>
                    <input type="tel" className="form-control" name="phone"
                      value={formData.phone} onChange={handleChange} placeholder="9876543210" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaMapMarkerAlt className="me-2 text-primary" />Address
                    </label>
                    <textarea className="form-control" name="address" rows="2"
                      value={formData.address} onChange={handleChange} placeholder="Your full address" />
                  </div>

                  {/* Worker-specific fields */}
                  {formData.role === 'WORKER' && (
                    <div className="rounded-3 p-3 mb-3" style={{background: '#f8f9fc', border: '1px solid #edf0f5', borderRadius: '14px'}}>
                      <h6 className="fw-bold text-primary mb-3"><FaHardHat className="me-2" />Service Details</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">Service Category</label>
                          <select className="form-select" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">Experience (years)</label>
                          <input type="number" className="form-control" name="experience"
                            value={formData.experience} onChange={handleChange} placeholder="e.g. 3" min="0" />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">Service Price (Rs. )</label>
                          <input type="number" className="form-control" name="price"
                            value={formData.price} onChange={handleChange} placeholder="e.g. 499" min="0" />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">Service Area (City)</label>
                          <input type="text" className="form-control" name="serviceArea"
                            value={formData.serviceArea} onChange={handleChange} placeholder="e.g. Mumbai, Pune" />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">📍 Service Pincodes</label>
                        <input type="text" className="form-control" name="servicePincodes"
                          value={formData.servicePincodes} onChange={handleChange} 
                          placeholder="e.g. 600001, 600002, 600003 (comma-separated)" />
                        <small className="text-muted">Enter pincodes where you provide service. Leave empty to serve all areas.</small>
                      </div>
                      <div className="mb-2">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea className="form-control" name="description" rows="2"
                          value={formData.description} onChange={handleChange} placeholder="Describe your services..." />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaUserPlus className="me-2" />}
                    {loading ? 'Creating Account...' : `Create ${formData.role === 'WORKER' ? 'Worker' : 'Customer'} Account`}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <p className="text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary fw-semibold text-decoration-none">Sign In</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
