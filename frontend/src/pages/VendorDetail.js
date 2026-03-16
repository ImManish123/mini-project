import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { vendorAPI, reviewAPI } from '../services/api';
import StarRating from '../components/common/StarRating';
import { FaMapMarkerAlt, FaBriefcase, FaCheckCircle, FaStar, FaUser, FaCalendarAlt, FaShieldAlt, FaThumbsUp } from 'react-icons/fa';

const VendorDetail = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [vendorRes, reviewRes] = await Promise.all([
        vendorAPI.getById(id),
        reviewAPI.getByVendor(id)
      ]);
      setVendor(vendorRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      console.error('Error loading vendor:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : vendor?.rating?.toFixed(1) || '0.0';

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }));

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;
  if (!vendor) return <div className="text-center py-5"><h4>Vendor not found</h4></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{paddingBottom: '60px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{fontSize: '13px'}}>
              <li className="breadcrumb-item"><Link to="/services" className="text-white" style={{opacity: 0.7}}>Services</Link></li>
              <li className="breadcrumb-item"><Link to={`/vendors/category/${vendor.category?.id}`} className="text-white" style={{opacity: 0.7}}>{vendor.category?.categoryName}</Link></li>
              <li className="breadcrumb-item text-white fw-semibold">{vendor.name}</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="container" style={{marginTop: '-40px'}}>
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Profile Card */}
            <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
              <div className="card-body p-4">
                <div className="d-flex align-items-start flex-wrap gap-3">
                  <div className="vendor-avatar-xl">{vendor.name.charAt(0)}</div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <h3 className="fw-bold mb-1" style={{letterSpacing: '-0.5px'}}>{vendor.name}</h3>
                        <span className="badge bg-primary bg-opacity-10 text-primary mb-2" style={{fontSize: '12px', borderRadius: '6px'}}>{vendor.category?.categoryName}</span>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <StarRating rating={vendor.rating} size={16} />
                          <span className="fw-bold" style={{color: '#f39c12'}}>{avgRating}</span>
                          <span className="text-muted" style={{fontSize: '13px'}}>({vendor.totalReviews} reviews)</span>
                        </div>
                      </div>
                      {vendor.availabilityStatus && (
                        <span style={{background: 'rgba(0,184,148,0.1)', color: '#00b894', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600}}>
                          <FaCheckCircle className="me-1" size={12} />Available
                        </span>
                      )}
                    </div>
                    <p className="text-muted mt-2 mb-3" style={{fontSize: '14px', lineHeight: '1.6'}}>{vendor.description}</p>
                    <div className="d-flex gap-3 flex-wrap">
                      {[
                        { icon: <FaBriefcase size={13} />, text: `${vendor.experienceYears} years experience`, color: '#6C63FF' },
                        { icon: <FaMapMarkerAlt size={13} />, text: vendor.serviceArea, color: '#e17055' },
                      ].map((item, i) => (
                        <span key={i} style={{background: '#f8f9fc', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#2d3436'}}>
                          <span style={{color: item.color}} className="me-2">{item.icon}</span>{item.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            {reviews.length > 0 && (
              <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3" style={{fontSize: '16px'}}>Rating Breakdown</h5>
                  <div className="row align-items-center">
                    <div className="col-md-4 text-center mb-3 mb-md-0">
                      <div className="fw-bold" style={{fontSize: '48px', color: '#f39c12', lineHeight: 1}}>{avgRating}</div>
                      <StarRating rating={parseFloat(avgRating)} size={18} />
                      <p className="text-muted mt-1 mb-0" style={{fontSize: '13px'}}>{reviews.length} reviews</p>
                    </div>
                    <div className="col-md-8">
                      {ratingBreakdown.map(item => (
                        <div key={item.star} className="d-flex align-items-center gap-2 mb-1">
                          <span style={{fontSize: '13px', fontWeight: 600, width: '20px'}}>{item.star}★</span>
                          <div className="flex-grow-1" style={{height: '8px', background: '#f1f3f5', borderRadius: '4px', overflow: 'hidden'}}>
                            <div style={{width: `${item.pct}%`, height: '100%', background: '#f39c12', borderRadius: '4px', transition: 'width 0.5s ease'}} />
                          </div>
                          <span style={{fontSize: '12px', color: '#636e72', width: '40px'}}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="card border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
              <div className="card-header bg-white py-3 px-4" style={{borderBottom: '1px solid #f1f3f5', borderRadius: '16px 16px 0 0'}}>
                <h5 className="fw-bold mb-0" style={{fontSize: '16px'}}><FaStar className="text-warning me-2" size={16} />Reviews ({reviews.length})</h5>
              </div>
              <div className="card-body p-4">
                {reviews.length > 0 ? reviews.map((review, index) => (
                  <div key={review.id} className="mb-4 pb-4" style={{borderBottom: index < reviews.length - 1 ? '1px solid #f1f3f5' : 'none'}}>
                    <div className="d-flex align-items-center mb-2">
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: `hsl(${(review.user?.name?.charCodeAt(0) || 0) * 5}, 50%, 90%)`,
                        color: `hsl(${(review.user?.name?.charCodeAt(0) || 0) * 5}, 50%, 40%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '15px', marginRight: '12px'
                      }}>
                        {review.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-0" style={{fontSize: '14px'}}>{review.user?.name}</h6>
                        <small className="text-muted" style={{fontSize: '12px'}}>
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </small>
                      </div>
                      <div className="ms-auto">
                        <StarRating rating={review.rating} size={14} showNumber={false} />
                      </div>
                    </div>
                    <p className="text-muted mb-0 ms-5 ps-2" style={{fontSize: '14px', lineHeight: '1.6'}}>{review.comment}</p>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <div style={{fontSize: '40px', marginBottom: '12px'}}>💬</div>
                    <p className="text-muted mb-0">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Booking Card */}
            <div className="card border-0 sticky-top" style={{top: '90px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px'}}>
              <div className="card-body p-4 text-center">
                <h4 className="fw-bold text-primary mb-0" style={{fontSize: '32px'}}>Rs. {vendor.price}</h4>
                <p className="text-muted mb-4" style={{fontSize: '14px'}}>per service visit</p>
                <Link to={`/book/${vendor.id}`} className="btn btn-primary btn-lg w-100 fw-semibold mb-3" style={{borderRadius: '12px', padding: '12px'}}>
                  <FaCalendarAlt className="me-2" />Book Now
                </Link>
                <div className="mt-3 text-start">
                  <h6 className="fw-bold mb-3" style={{fontSize: '14px'}}>What's Included:</h6>
                  <ul className="list-unstyled">
                    {[
                      { icon: <FaCheckCircle className="text-success" size={13} />, text: 'Professional service at doorstep' },
                      { icon: <FaShieldAlt className="text-primary" size={13} />, text: 'Verified & trained expert' },
                      { icon: <FaThumbsUp className="text-info" size={13} />, text: 'Service guarantee' },
                      { icon: <FaCheckCircle className="text-success" size={13} />, text: 'Transparent pricing' },
                      { icon: <FaCheckCircle className="text-success" size={13} />, text: 'Easy cancellation' },
                    ].map((item, i) => (
                      <li key={i} className="mb-2 d-flex align-items-center gap-2" style={{fontSize: '13px'}}>
                        {item.icon} {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
