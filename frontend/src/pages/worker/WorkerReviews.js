import React, { useState, useEffect } from 'react';
import { workerAPI } from '../../services/api';
import StarRating from '../../components/common/StarRating';
import { FaStar, FaUser, FaCalendarAlt } from 'react-icons/fa';

const WorkerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try {
      const res = await workerAPI.getReviews();
      setReviews(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)' }}>
        <div className="container">
          <h2 className="fw-bold text-white">⭐ My Reviews</h2>
          <p className="text-white opacity-75 mb-0">See what customers say about your service</p>
        </div>
      </div>
      <div className="container py-5">
        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center p-4">
              <h2 className="fw-bold text-primary mb-0">{reviews.length}</h2>
              <small className="text-muted">Total Reviews</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center p-4">
              <h2 className="fw-bold text-warning mb-0">⭐ {avgRating}</h2>
              <small className="text-muted">Average Rating</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center p-4">
              <h2 className="fw-bold text-success mb-0">{reviews.filter(r => r.rating >= 4).length}</h2>
              <small className="text-muted">Positive Reviews (4-5⭐)</small>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="row g-4">
            {reviews.map(r => (
              <div key={r.id} className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    {/* Customer Info */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                        style={{ width: 45, height: 45, fontSize: '1.1rem' }}>
                        {r.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0"><FaUser className="me-1 text-muted" size={12} />{r.user?.name || 'Customer'}</h6>
                        <small className="text-muted">{r.user?.email}</small>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-2">
                      <StarRating rating={r.rating} size={18} />
                      <span className="ms-2 fw-bold text-warning fs-5">{r.rating}/5</span>
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
                            AI suggested: {r.aiSuggestedRating}⭐
                          </span>
                        )}
                      </div>
                    )}

                    {/* Comment */}
                    <p className="text-dark mb-3" style={{ minHeight: 40 }}>
                      {r.comment || <em className="text-muted">No comment provided</em>}
                    </p>

                    {/* Booking & Date Info */}
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <div>
                        {r.booking && (
                          <span className="badge bg-light text-dark">
                            Booking #{r.booking.id} • Rs. {r.booking.totalAmount?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <small className="text-muted">
                        <FaCalendarAlt className="me-1" />
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <FaStar size={50} className="text-muted mb-3 opacity-25" />
            <h5 className="text-muted">No reviews yet</h5>
            <p className="text-muted">Reviews from customers will appear here after they complete bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerReviews;
