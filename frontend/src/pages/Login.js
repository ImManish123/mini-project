import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'WORKER') navigate('/worker');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(formData);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      if (res.data.role === 'ADMIN') {
        navigate('/admin');
      } else if (res.data.role === 'WORKER') {
        navigate('/worker');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-80">
          <div className="col-md-5">
            <div className="card border-0 shadow-lg auth-card">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="auth-icon mb-3">
                    <FaSignInAlt size={30} />
                  </div>
                  <h3 className="fw-bold">Welcome Back</h3>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaEnvelope className="me-2 text-primary" />Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <FaLock className="me-2 text-primary" />Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <FaSignInAlt className="me-2" />
                    )}
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <p className="text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                      Sign Up
                    </Link>
                  </p>
                </div>
                <hr />
                <div className="text-center">
                  <small className="text-muted" style={{fontSize: '12px'}}>Demo Credentials</small><br />
                  <div className="d-flex gap-2 justify-content-center mt-2 flex-wrap">
                    <button type="button" className="btn btn-outline-secondary btn-sm" style={{fontSize: '11px', borderRadius: '8px'}}
                      onClick={() => setFormData({ email: 'admin@smarthome.com', password: 'admin123' })}>
                      Admin Login
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" style={{fontSize: '11px', borderRadius: '8px'}}
                      onClick={() => setFormData({ email: 'customer@test.com', password: 'customer123' })}>
                      Customer Login
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" style={{fontSize: '11px', borderRadius: '8px'}}
                      onClick={() => setFormData({ email: 'worker1@test.com', password: 'worker123' })}>
                      Worker Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
