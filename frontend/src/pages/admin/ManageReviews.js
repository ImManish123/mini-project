import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../services/api';
import StarRating from '../../components/common/StarRating';
import { toast } from 'react-toastify';
import { FaTrash, FaUser, FaHardHat, FaStore, FaCalendarAlt, FaStar, FaSearch } from 'react-icons/fa';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try {
      const res = await reviewAPI.getAll();
      setReviews(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewAPI.delete(id);
      toast.success('Review deleted');
      loadReviews();
    } catch (err) { toast.error('Failed'); }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesRating = filterRating === 'all' || r.rating === parseInt(filterRating);
    const matchesSentiment = filterSentiment === 'all' || r.sentimentLabel === filterSentiment;
    const matchesSearch = searchTerm === '' ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSentiment && matchesSearch;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header admin-header">
        <div className="container">
          <h2 className="fw-bold text-white">⭐ Manage Reviews</h2>
          <p className="text-white opacity-75 mb-0">Monitor customer feedback and AI sentiment analysis</p>
        </div>
      </div>
      <div className="container py-5">
        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <h3 className="fw-bold text-primary mb-0">{reviews.length}</h3>
              <small className="text-muted">Total Reviews</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <h3 className="fw-bold text-warning mb-0">⭐ {avgRating}</h3>
              <small className="text-muted">Average Rating</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <h3 className="fw-bold text-success mb-0">{reviews.filter(r => r.sentimentLabel === 'POSITIVE').length || reviews.filter(r => r.rating >= 4).length}</h3>
              <small className="text-muted">😊 Positive</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <h3 className="fw-bold text-danger mb-0">{reviews.filter(r => r.sentimentLabel === 'NEGATIVE').length || reviews.filter(r => r.rating <= 2).length}</h3>
              <small className="text-muted">😞 Negative</small>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body d-flex gap-3 flex-wrap align-items-center">
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ maxWidth: 180 }} value={filterRating} onChange={e => setFilterRating(e.target.value)}>
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select className="form-select" style={{ maxWidth: 180 }} value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)}>
              <option value="all">All Sentiments</option>
              <option value="POSITIVE">😊 Positive</option>
              <option value="NEUTRAL">😐 Neutral</option>
              <option value="NEGATIVE">😞 Negative</option>
            </select>
            <span className="text-muted ms-auto">{filteredReviews.length} review(s)</span>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="row g-4">
            {filteredReviews.map(r => (
              <div key={r.id} className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    {/* Header: Customer & Delete */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40, fontSize: '1rem' }}>
                          {r.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0"><FaUser className="me-1 text-muted" size={12} />{r.user?.name || 'Unknown'}</h6>
                          <small className="text-muted">{r.user?.email}</small>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)} title="Delete review">
                        <FaTrash />
                      </button>
                    </div>

                    {/* Rating */}
                    <div className="mb-2">
                      <StarRating rating={r.rating} size={16} />
                      <span className="ms-2 fw-bold text-warning">{r.rating}/5</span>
                    </div>

                    {/* AI Sentiment Badge */}
                    {r.sentimentLabel && (
                      <div className="mb-2">
                        <span className={`badge ${r.sentimentLabel === 'POSITIVE' ? 'bg-success' :
                            r.sentimentLabel === 'NEGATIVE' ? 'bg-danger' : 'bg-warning text-dark'
                          }`} style={{ fontSize: '11px' }}>
                          🤖 {r.sentimentLabel === 'POSITIVE' ? '😊' : r.sentimentLabel === 'NEGATIVE' ? '😞' : '😐'}{' '}
                          {r.sentimentLabel} {r.sentimentScore ? `(${Math.round(r.sentimentScore * 100)}%)` : ''}
                        </span>
                        {r.aiSuggestedRating && r.aiSuggestedRating !== r.rating && (
                          <span className="badge bg-light text-dark ms-1" style={{ fontSize: '11px' }}>
                            AI: {r.aiSuggestedRating}⭐
                          </span>
                        )}
                      </div>
                    )}

                    {/* Comment */}
                    <p className="text-dark mb-3" style={{ minHeight: 40 }}>
                      {r.comment || <em className="text-muted">No comment provided</em>}
                    </p>

                    <hr />

                    {/* Service & Vendor Info */}
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted d-block"><FaStore className="me-1" />Service/Vendor</small>
                        <span className="fw-semibold">{r.vendor?.name || 'N/A'}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block"><FaStar className="me-1" />Category</small>
                        <span className="fw-semibold">{r.vendor?.category?.categoryName || 'N/A'}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block"><FaHardHat className="me-1" />Worker</small>
                        <span className="fw-semibold text-info">{r.vendor?.user?.name || 'Not Assigned'}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block"><FaCalendarAlt className="me-1" />Reviewed On</small>
                        <span className="fw-semibold">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Info */}
                    {r.booking && (
                      <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted fw-semibold">Booking #{r.booking.id}</small>
                        <span className="ms-2 badge bg-success">{r.booking.status}</span>
                        <span className="ms-2 fw-bold">Rs. {r.booking.totalAmount?.toLocaleString()}</span>
                        {r.booking.bookingDate && (
                          <span className="ms-2 text-muted">
                            {new Date(r.booking.bookingDate).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <h5>No reviews found</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReviews;
