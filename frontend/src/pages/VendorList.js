import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { vendorAPI, categoryAPI } from '../services/api';
import StarRating from '../components/common/StarRating';
import { FaMapMarkerAlt, FaBriefcase, FaRupeeSign, FaSearch, FaSortAmountDown, FaUserTie } from 'react-icons/fa';

// Worker profile images mapped by category for display
const workerImagesByCategory = {
  'cleaning': [
    'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
  ],
  'plumber': [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  ],
  'electrician': [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
  ],
  'appliance repair': [
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1548449112-96a38a643324?w=150&h=150&fit=crop&crop=face'
  ],
  'beauty & wellness': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  ],
  'pest control': [
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150&h=150&fit=crop&crop=face'
  ],
  'hair cut': [
    'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face'
  ],
  'movers': [
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face'
  ],
  'wifi': [
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  ],
  'cable': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  ],
  'electricity': [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  ],
  'water supply': [
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face'
  ],
  'gas connection': [
    'https://images.unsplash.com/photo-1548449112-96a38a643324?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face'
  ],
  'milk': [
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=150&h=150&fit=crop&crop=face'
  ],
  'newspaper': [
    'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face'
  ],
  'cleaning staff': [
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=150&h=150&fit=crop&crop=face'
  ],
  'courier partners': [
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  ],
  'laundry': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  ],
};

const getWorkerImage = (vendor, index, categoryName) => {
  if (vendor.profileImage) return vendor.profileImage;
  const key = categoryName?.toLowerCase();
  const images = workerImagesByCategory[key];
  if (images && images.length > 0) {
    return images[index % images.length];
  }
  return null; // will fall back to initial avatar
};

const VendorList = () => {
  const { categoryId } = useParams();
  const [vendors, setVendors] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [vendorRes, catRes] = await Promise.allSettled([
        vendorAPI.getByCategory(categoryId),
        categoryAPI.getById(categoryId)
      ]);
      if (vendorRes.status === 'fulfilled') setVendors(vendorRes.value.data);
      if (catRes.status === 'fulfilled') setCategory(catRes.value.data);
    } catch (err) {
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = vendors
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.serviceArea?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return 0;
    });

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{paddingBottom: '60px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <h2 className="fw-bold text-white" style={{letterSpacing: '-0.5px'}}>
            {category?.icon} {category?.categoryName || 'Services'}
          </h2>
          <p className="text-white mb-0" style={{opacity: 0.8, fontSize: '15px'}}>{category?.description}</p>
        </div>
      </div>
      <div className="container" style={{marginTop: '-30px'}}>
        {/* Search & Sort Bar */}
        <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
          <div className="card-body p-3">
            <div className="row align-items-center g-3">
              <div className="col-md-6">
                <div className="position-relative">
                  <FaSearch className="position-absolute text-muted" style={{left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px'}} />
                  <input type="text" className="form-control border-0 bg-light" placeholder="Search by name or area..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{paddingLeft: '40px', borderRadius: '10px', fontSize: '14px'}} />
                </div>
              </div>
              <div className="col-md-3">
                <span className="text-muted" style={{fontSize: '13px'}}>{filtered.length} professional{filtered.length !== 1 ? 's' : ''} found</span>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center gap-2">
                  <FaSortAmountDown className="text-muted" size={13} />
                  <select className="form-select form-select-sm border-0 bg-light" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    style={{borderRadius: '10px', fontSize: '13px'}}>
                    <option value="rating">Top Rated</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {filtered.map((vendor, index) => (
            <div key={vendor.id} className="col-lg-6" style={{animation: 'fadeInUp 0.5s ease forwards', animationDelay: `${index * 0.08}s`}}>
              <div className="card border-0 h-100 hover-lift" style={{boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '16px', transition: 'all 0.3s ease'}}>
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-3 text-center mb-3 mb-md-0">
                      {(() => {
                        const imgUrl = getWorkerImage(vendor, index, category?.categoryName);
                        return imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={vendor.name}
                            className="mx-auto d-block"
                            style={{
                              width: '80px', height: '80px', borderRadius: '50%',
                              objectFit: 'cover', border: '3px solid #e8f4fd',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null;
                      })()}
                      <div className="vendor-avatar-lg mx-auto" style={{
                        display: getWorkerImage(vendor, index, category?.categoryName) ? 'none' : 'flex'
                      }}>{vendor.name.charAt(0)}</div>
                      {vendor.availabilityStatus && (
                        <span className="badge bg-success bg-opacity-10 text-success mt-2" style={{fontSize: '10px', borderRadius: '6px'}}>● Available</span>
                      )}
                    </div>
                    <div className="col-md-9">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="fw-bold mb-1" style={{fontSize: '16px'}}>{vendor.name}</h5>
                          <div className="mb-2">
                            <StarRating rating={vendor.rating} size={14} />
                            <small className="text-muted ms-1">({vendor.totalReviews} reviews)</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="fw-bold text-primary" style={{fontSize: '22px'}}>Rs. {vendor.price}</span>
                          <br /><small className="text-muted" style={{fontSize: '11px'}}>per visit</small>
                        </div>
                      </div>
                      <p className="text-muted mb-2" style={{fontSize: '13px', lineHeight: '1.5'}}>{vendor.description}</p>
                      <div className="d-flex gap-3 mb-3 flex-wrap">
                        <span style={{fontSize: '12px', color: '#636e72', background: '#f8f9fa', padding: '3px 10px', borderRadius: '6px'}}>
                          <FaBriefcase className="me-1" size={11} />{vendor.experienceYears} yrs exp
                        </span>
                        <span style={{fontSize: '12px', color: '#636e72', background: '#f8f9fa', padding: '3px 10px', borderRadius: '6px'}}>
                          <FaMapMarkerAlt className="me-1" size={11} />{vendor.serviceArea}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <Link to={`/vendors/${vendor.id}`} className="btn btn-outline-primary btn-sm" style={{borderRadius: '8px', fontSize: '13px'}}>View Profile</Link>
                        <Link to={`/book/${vendor.id}`} className="btn btn-primary btn-sm" style={{borderRadius: '8px', fontSize: '13px'}}>Book Now</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-5">
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🔍</div>
            <h5 className="fw-bold text-muted">{search ? 'No professionals match your search' : 'No professionals available yet'}</h5>
            <p className="text-muted mb-4" style={{fontSize: '14px'}}>Try a different search or browse other services</p>
            <Link to="/services" className="btn btn-primary" style={{borderRadius: '10px'}}>Browse Other Services</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorList;
