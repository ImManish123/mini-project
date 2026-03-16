import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

const categories = [
  { value: 'WATER_SUPPLY', label: 'Water Supply', icon: '💧' },
  { value: 'ELECTRICAL', label: 'Electrical', icon: '⚡' },
  { value: 'ELEVATOR', label: 'Elevator', icon: '🛗' },
  { value: 'GARBAGE', label: 'Garbage / Waste', icon: '🗑️' },
  { value: 'SECURITY', label: 'Security', icon: '🔒' },
  { value: 'NOISE', label: 'Noise', icon: '🔊' },
  { value: 'STRUCTURAL', label: 'Structural', icon: '🏗️' },
  { value: 'PLUMBING', label: 'Plumbing', icon: '🔧' },
  { value: 'COMMON_AREA', label: 'Common Area', icon: '🏢' },
  { value: 'PARKING', label: 'Parking', icon: '🅿️' },
  { value: 'GARDEN', label: 'Garden / Landscape', icon: '🌳' },
  { value: 'SERVICE_COMPLAINT', label: 'Service Complaint', icon: '👷' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
];

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await complaintAPI.fileComplaint(form);
      toast.success('Complaint filed successfully!');
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ paddingBottom: '60px' }}>
        <div className="container">
          <button className="btn btn-outline-light btn-sm mb-3" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />Back
          </button>
          <h2 className="fw-bold text-white mb-2">
            <FaExclamationTriangle className="me-2" />Raise a Complaint
          </h2>
          <p className="text-white mb-0" style={{ opacity: 0.8, fontSize: '15px' }}>
            Report a community issue and we'll get it resolved for you.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="card-body p-4 p-lg-5">
                <form onSubmit={handleSubmit}>
                  {/* Category Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Category <span className="text-danger">*</span>
                    </label>
                    <div className="row g-2">
                      {categories.map(cat => (
                        <div key={cat.value} className="col-md-4 col-6">
                          <div
                            className={`complaint-category-card p-3 text-center rounded-3 ${form.category === cat.value ? 'active' : ''}`}
                            onClick={() => setForm({ ...form, category: cat.value })}
                            style={{
                              cursor: 'pointer',
                              border: form.category === cat.value
                                ? '2px solid #6C63FF'
                                : '2px solid #e9ecef',
                              background: form.category === cat.value
                                ? 'rgba(108,99,255,0.05)'
                                : 'white',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{cat.icon}</div>
                            <small className={`fw-semibold ${form.category === cat.value ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '12px' }}>
                              {cat.label}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Brief summary of the issue..."
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Describe the issue in detail — what happened, when, and any other relevant info..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Block A, 3rd Floor Corridor, Near Garden..."
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-bold"
                    disabled={submitting}
                    style={{ borderRadius: '12px' }}
                  >
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                    ) : (
                      <><FaPaperPlane className="me-2" />Submit Complaint</>
                    )}
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

export default RaiseComplaint;
