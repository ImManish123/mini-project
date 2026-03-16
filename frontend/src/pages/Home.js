import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, vendorAPI, reviewAPI } from '../services/api';
import StarRating from '../components/common/StarRating';
import { FaArrowRight, FaShieldAlt, FaClock, FaCheckCircle, FaStar, FaUsers, FaCalendarCheck, FaHeadset, FaHandshake, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaTools } from 'react-icons/fa';

const categoryImages = {
  'newspaper': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=200&fit=crop',
  'pest control': 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400&h=200&fit=crop',
  'water supply': 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&h=200&fit=crop',
  'plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=200&fit=crop',
  'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=200&fit=crop',
  'electrician': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=200&fit=crop',
  'painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=200&fit=crop',
  'carpentry': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=200&fit=crop',
};

const getCategoryImage = (cat) => {
  const key = Object.keys(categoryImages).find(k => cat.categoryName.toLowerCase().includes(k));
  if (key) return categoryImages[key];
  if (cat.imageUrl) return cat.imageUrl;
  return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=200&fit=crop';
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [topAtsReview, setTopAtsReview] = useState(null);
  const [topReviews, setTopReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catRes, vendorRes, reviewRes, atsRes] = await Promise.all([
        categoryAPI.getAll(),
        vendorAPI.getTopRated(),
        reviewAPI.getTopRated()
      ]);
      setCategories(catRes.data);
      setTopVendors(vendorRes.data.slice(0, 6));
      setTopReviews(reviewRes.data || []);
      setTopAtsReview(atsRes.data && atsRes.data.length > 0 ? atsRes.data[0] : null);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(topReviews.length / reviewsPerPage);
  const visibleReviews = topReviews.slice(reviewPage * reviewsPerPage, (reviewPage + 1) * reviewsPerPage);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="container">
            <div className="row align-items-center min-vh-80">
              <div className="col-lg-7" style={{animation: 'fadeInUp 0.8s ease-out'}}>
                <span className="badge bg-white bg-opacity-25 text-white px-4 py-2 mb-4 rounded-pill" style={{backdropFilter: 'blur(10px)', fontSize: '14px', fontWeight: 600}}>
                  ✨ Community Living Made Simple
                </span>
                <h1 className="display-3 fw-bold text-white mb-4" style={{letterSpacing: '-1px', lineHeight: 1.1}}>
                  Community Services,<br />
                  <span className="text-warning" style={{display: 'inline-block', animation: 'fadeInUp 1s ease-out 0.2s both'}}>At Your Doorstep.</span>
                </h1>
                <p className="text-white mb-4" style={{fontSize: '18px', lineHeight: 1.8, opacity: 0.9, maxWidth: '520px'}}>
                  Your apartment community hub — book home services, manage parking, 
                  raise complaints, and connect with trusted professionals.
                </p>
                <div className="d-flex gap-3 flex-wrap mb-5">
                  <Link to="/services" className="btn btn-warning btn-lg px-4 fw-bold" style={{borderRadius: '12px'}}>
                    Explore Services <FaArrowRight className="ms-2" />
                  </Link>
                  <Link to="/register" className="btn btn-outline-light btn-lg px-4" style={{borderRadius: '12px', borderWidth: '2px'}}>
                    Get Started Free
                  </Link>
                </div>
                <div className="d-flex gap-4 flex-wrap mt-4 pt-3">
                  <div className="stats-counter text-center px-4" style={{borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    <h3 className="text-warning fw-bold mb-0" style={{fontSize: '2rem'}}>500+</h3>
                    <small className="text-white" style={{opacity: 0.8, fontSize: '13px'}}>Expert Professionals</small>
                  </div>
                  <div className="stats-counter text-center px-4" style={{borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    <h3 className="text-warning fw-bold mb-0" style={{fontSize: '2rem'}}>200+</h3>
                    <small className="text-white" style={{opacity: 0.8, fontSize: '13px'}}>Happy Residents</small>
                  </div>
                  <div className="text-center px-4">
                    <h3 className="text-warning fw-bold mb-0" style={{fontSize: '2rem'}}>4.8</h3>
                    <small className="text-white" style={{opacity: 0.8, fontSize: '13px'}}>Average Rating</small>
                  </div>
                </div>
              </div>
              <div className="col-lg-5 d-none d-lg-block text-center" style={{animation: 'fadeInUp 0.8s ease-out 0.3s both'}}>
                <div style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                                    {topAtsReview ? (
                    <div style={{
                      width: '100%', height: '420px', 
                      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'center', alignItems: 'center',
                      padding: '40px', color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', marginBottom: '20px'
                      }}>
                        <FaStar className="text-warning" />
                      </div>
                      <h4 className="fw-bold mb-3">Top Rated Customer</h4>
                      <p className="fst-italic mb-3" style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                        "{topAtsReview.comment || 'Amazing service provided!'}"
                      </p>
                      <h5 className="mb-1 text-warning">- {topAtsReview.user?.name || 'Customer'}</h5>
                      <div className="mt-3 bg-white text-dark rounded-pill px-3 py-1 fw-bold">
                        ATS Score: {topAtsReview.atsScore}/100
                      </div>
                    </div>
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=600&fit=crop"
                      alt="Smart Home Services"
                      style={{width: '100%', height: '420px', objectFit: 'cover', display: 'block'}}
                    />
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '40px 30px 30px'
                  }}>
                    <h4 className="text-white fw-bold mb-2">Need a service?</h4>
                    <p className="text-white mb-3" style={{opacity: 0.85, fontSize: '14px'}}>Browse services available for your community</p>
                    <Link to="/services" className="btn btn-warning px-4 fw-bold" style={{borderRadius: '10px'}}>
                      Browse Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5" style={{background: '#f8f9fc'}}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3" style={{fontSize: '13px', fontWeight: 600}}>HOW IT WORKS</span>
            <h2 className="fw-bold" style={{fontSize: '2.2rem', letterSpacing: '-0.5px'}}>Book a Service in <span className="gradient-text">3 Easy Steps</span></h2>
            <p className="text-muted mt-2" style={{maxWidth: '500px', margin: '0 auto'}}>Getting your home serviced has never been easier</p>
          </div>
          <div className="row g-4">
              <div className="col-md-4">
                <div className="card border-0 h-100 text-center p-4 step-card" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="step-number">1</div>
                  <div className="card-body pt-4">
                    <div className="step-icon mb-3" style={{ fontSize: "2.5rem", color: "#4f46e5" }}><FaTools /></div>
                    <h5 className="fw-bold mb-2">Choose a Service</h5>
                    <p className="text-muted" style={{fontSize: '14px'}}>Browse through our wide range of home services and select what you need.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 h-100 text-center p-4 step-card" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="step-number">2</div>
                  <div className="card-body pt-4">
                    <div className="step-icon mb-3" style={{ fontSize: "2.5rem", color: "#4f46e5" }}><FaCalendarCheck /></div>
                    <h5 className="fw-bold mb-2">Pick Date & Time</h5>
                    <p className="text-muted" style={{fontSize: '14px'}}>Select a convenient date and time slot from available options.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 h-100 text-center p-4 step-card" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="step-number">3</div>
                  <div className="card-body pt-4">
                    <div className="step-icon mb-3" style={{ fontSize: "2.5rem", color: "#4f46e5" }}><FaCheckCircle /></div>
                    <h5 className="fw-bold mb-2">Relax & Enjoy</h5>
                    <p className="text-muted" style={{fontSize: '14px'}}>Our verified professional will arrive at your doorstep on time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Service Categories */}
      <section className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3" style={{fontSize: '13px', fontWeight: 600}}>OUR SERVICES</span>
            <h2 className="fw-bold" style={{fontSize: '2.2rem', letterSpacing: '-0.5px'}}>What Are You <span className="gradient-text">Looking For?</span></h2>
            <p className="text-muted mt-2" style={{maxWidth: '500px', margin: '0 auto'}}>Choose from our wide range of professional services</p>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {[...categories].sort((a, b) => {
                const lastRow = ['newspaper', 'water supply', 'pest control'];
                const aIsLast = lastRow.includes(a.categoryName.toLowerCase());
                const bIsLast = lastRow.includes(b.categoryName.toLowerCase());
                if (aIsLast && !bIsLast) return 1;
                if (!aIsLast && bIsLast) return -1;
                return 0;
              }).map((cat, index) => (
                <div key={cat.id} className="col-lg-4 col-md-6" style={{animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`}}>
                  <Link to={`/vendors/category/${cat.id}`} className="text-decoration-none">
                    <div className="card border-0 h-100 category-card hover-lift overflow-hidden" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                      <div className="category-img-wrapper">
                        <img 
                          src={getCategoryImage(cat)} 
                          className="card-img-top" 
                          alt={cat.categoryName}
                          style={{height: '200px', objectFit: 'cover'}}
                        />
                        <div className="category-overlay">
                          <span className="fs-1">{cat.icon}</span>
                        </div>
                      </div>
                      <div className="card-body text-center p-4">
                        <h5 className="card-title fw-bold text-dark mb-2">{cat.categoryName}</h5>
                        <p className="card-text text-muted" style={{fontSize: '13px', lineHeight: 1.6}}>{cat.description}</p>
                        <span className="btn btn-sm btn-primary mt-2 px-3" style={{borderRadius: '8px'}}>
                          <FaTools className="me-1" size={12} /> Book Service <FaArrowRight className="ms-1" size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-5">
            <Link to="/services" className="btn btn-primary btn-lg px-5">
              View All Services <FaArrowRight className="ms-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Rated Vendors */}
      {topVendors.length > 0 && (
        <section className="py-5" style={{background: '#f8f9fc'}}>
          <div className="container py-5">
            <div className="text-center mb-5">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3" style={{fontSize: '13px', fontWeight: 600}}>TOP PROFESSIONALS</span>
              <h2 className="fw-bold" style={{fontSize: '2.2rem', letterSpacing: '-0.5px'}}>Our Highest Rated <span className="gradient-text">Experts</span></h2>
              <p className="text-muted mt-2" style={{maxWidth: '500px', margin: '0 auto'}}>Trusted professionals with verified reviews</p>
            </div>
            <div className="row g-4">
              {topVendors.map((vendor, index) => (
                <div key={vendor.id} className="col-lg-4 col-md-6" style={{animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`}}>
                  <div className="card border-0 h-100 vendor-card" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="vendor-avatar me-3">
                          {vendor.name.charAt(0)}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1" style={{fontSize: '15px'}}>{vendor.name}</h6>
                          <span className="badge bg-primary bg-opacity-10 text-primary" style={{fontSize: '11px'}}>{vendor.category?.categoryName}</span>
                        </div>
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <StarRating rating={vendor.rating} />
                        <small className="text-muted ms-2" style={{fontSize: '12px'}}>({vendor.totalReviews} reviews)</small>
                      </div>
                      <p className="text-muted mb-3" style={{fontSize: '13px', lineHeight: 1.6}}>{vendor.description}</p>
                      <hr style={{opacity: 0.1}} />
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block" style={{fontSize: '11px'}}>Starting from</small>
                          <span className="fw-bold text-primary" style={{fontSize: "1.3rem"}}>Rs. {vendor.price || 499}</span>
                        </div>
                        <Link to={`/vendors/${vendor.id}`} className="btn btn-sm btn-primary px-3">
                          View Details <FaArrowRight className="ms-1" size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3" style={{fontSize: '13px', fontWeight: 600}}>WHY HOMESERV?</span>
            <h2 className="fw-bold" style={{fontSize: '2.2rem', letterSpacing: '-0.5px'}}>Why Residents <span className="gradient-text">Love Us</span></h2>
          </div>
          <div className="row g-4">
            {[
              { icon: <FaShieldAlt size={28} />, title: 'Verified Pros', desc: 'Background-checked & trained professionals you can trust', color: '#6C63FF' },
              { icon: <FaClock size={28} />, title: 'On Time', desc: 'Punctual service guaranteed at your chosen time slot', color: '#00b894' },
              { icon: <FaCheckCircle size={28} />, title: 'Quality Assured', desc: 'Satisfaction guaranteed or we make it right for you', color: '#FF6B6B' },
              { icon: <FaHeadset size={28} />, title: '24/7 Support', desc: 'Round-the-clock customer support for all your queries', color: '#fdcb6e' },
            ].map((item, i) => (
              <div key={i} className="col-md-3 col-6">
                <div className="feature-card card h-100 border-0" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.04)'}}>
                  <div className="feature-icon" style={{background: `${item.color}12`, color: item.color}}>
                    {item.icon}
                  </div>
                  <h6 className="fw-bold mb-2" style={{fontSize: '15px'}}>{item.title}</h6>
                  <p className="text-muted mb-0" style={{fontSize: '13px', lineHeight: 1.6}}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car Parking Section */}
      <section className="py-5" style={{background: '#f8f9fc'}}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3" style={{fontSize: '13px', fontWeight: 600}}>COMMUNITY PARKING</span>
              <h2 className="fw-bold mb-3" style={{fontSize: '2.2rem', letterSpacing: '-0.5px'}}>
                Smart <span className="gradient-text">Community Parking</span>
              </h2>
              <p className="text-muted mb-4" style={{fontSize: '15px', lineHeight: 1.8}}>
                Every home in our community comes with 1 allocated parking slot. Need extra parking 
                for guests or additional vehicles? Book additional slots instantly!
              </p>
              <div className="row g-3 mb-4">
                {[
                  { icon: <FaCheckCircle/>, title: '1 Slot Per Home', desc: 'Default allocated parking' },
                  { icon: <FaCalendarCheck/>, title: 'Extra Parking', desc: 'Book additional slots' },
                  { icon: <FaUsers/>, title: 'Accessible Parking', desc: 'Handicapped-friendly slots' },
                  { icon: <FaClock/>, title: 'Instant Booking', desc: 'Book extra slots anytime' },
                ].map((item, i) => (
                  <div key={i} className="col-6">
                    <div className="d-flex align-items-start">
                      <span style={{fontSize: '24px', marginRight: '10px'}}>{item.icon}</span>
                      <div>
                        <h6 className="fw-bold mb-0" style={{fontSize: '14px'}}>{item.title}</h6>
                        <small className="text-muted" style={{fontSize: '12px'}}>{item.desc}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/parking" className="btn btn-primary btn-lg px-4 fw-bold" style={{borderRadius: '12px'}}>
                View Parking Slots <FaArrowRight className="ms-2" />
              </Link>
            </div>
            <div className="col-lg-6 text-center">
              <div style={{
                background: 'linear-gradient(135deg, #0984e3 0%, #6C63FF 100%)',
                borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{position: 'relative', zIndex: 1}}>
                  <div style={{fontSize: "80px", marginBottom: "16px"}}><span role="img" aria-label="parking">🚗</span></div>
                  <h4 className="text-white fw-bold mb-2">Community Parking System</h4>
                  <p className="text-white mb-3" style={{opacity: 0.8, fontSize: '14px'}}>
                    1 Allocated Slot Per Home • Extra Slots On Demand
                  </p>
                  <div className="d-flex justify-content-center gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-warning fw-bold" style={{fontSize: '1.5rem'}}>1 Free</div>
                      <small className="text-white" style={{opacity: 0.7, fontSize: '12px'}}>Slot / Home</small>
                    </div>
                    <div className="text-center">
                      <div className="text-warning fw-bold" style={{fontSize: "1.5rem"}}>Rs. 15</div>
                      <small className="text-white" style={{opacity: 0.7, fontSize: "12px"}}>Extra/hr</small>
                    </div>
                    <div className="text-center">
                      <div className="text-warning fw-bold" style={{fontSize: '1.5rem'}}>24/7</div>
                      <small className="text-white" style={{opacity: 0.7, fontSize: '12px'}}>Available</small>
                    </div>
                  </div>
                </div>
                <div style={{position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)'}}></div>
                <div style={{position: 'absolute', bottom: '-15%', left: '-10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resident Testimonials */}
      {topReviews.length > 0 && (
        <section className="py-5">
          <div className="container py-5">
            <div className="text-center mb-5">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3" style={{fontSize: '13px', fontWeight: 600}}>TESTIMONIALS</span>
              <h2 className="fw-bold" style={{fontSize: '2.2rem', letterSpacing: '-0.5px'}}>What Our Residents <span className="gradient-text">Say</span></h2>
              <p className="text-muted mt-2" style={{maxWidth: '500px', margin: '0 auto'}}>Real reviews from our community members</p>
            </div>
            <div className="row g-4">
              {visibleReviews.map((review, index) => (
                <div key={review.id} className="col-lg-4 col-md-6" style={{animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`}}>
                  <div className="card border-0 h-100 testimonial-card" style={{
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    borderRadius: '16px',
                    borderTop: '3px solid #6C63FF',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}>
                    <div className="card-body p-4">
                      {/* User Info */}
                      <div className="d-flex align-items-center mb-3">
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6C63FF, #0984e3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '18px', marginRight: '12px',
                          flexShrink: 0
                        }}>
                          {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-0" style={{fontSize: '15px'}}>{review.user?.name || 'Resident'}</h6>
                          <div className="d-flex align-items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} size={13} style={{color: i < review.rating ? '#ffc107' : '#e0e0e0', marginRight: '1px'}} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Review Title (vendor/service name) */}
                      <h6 className="fw-bold mb-2" style={{fontSize: '14px', color: '#2d3436'}}>
                        {review.vendor?.name || 'Great Service'}
                      </h6>

                      {/* Review Comment */}
                      <div style={{position: 'relative'}}>
                        <FaQuoteLeft size={16} style={{color: '#6C63FF', opacity: 0.3, marginBottom: '4px'}} />
                        <p className="text-muted mb-0" style={{
                          fontSize: '13.5px', lineHeight: 1.7, fontStyle: 'italic',
                          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          "{review.comment}"
                        </p>
                      </div>

                      {/* Service Category Badge */}
                      {review.vendor?.category?.categoryName && (
                        <div className="mt-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary" style={{fontSize: '11px'}}>
                            {review.vendor.category.categoryName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Arrows */}
            {totalReviewPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                <button
                  className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                  style={{width: '40px', height: '40px'}}
                  onClick={() => setReviewPage(prev => Math.max(0, prev - 1))}
                  disabled={reviewPage === 0}
                >
                  <FaChevronLeft size={14} />
                </button>
                <span className="text-muted" style={{fontSize: '14px'}}>
                  {reviewPage + 1} / {totalReviewPages}
                </span>
                <button
                  className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                  style={{width: '40px', height: '40px'}}
                  onClick={() => setReviewPage(prev => Math.min(totalReviewPages - 1, prev + 1))}
                  disabled={reviewPage === totalReviewPages - 1}
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section py-5" style={{position: 'relative'}}>
        <div className="container text-center py-5" style={{position: 'relative', zIndex: 1}}>
          <div style={{maxWidth: '600px', margin: '0 auto'}}>
            <h2 className="text-white fw-bold mb-3" style={{fontSize: '2.2rem', letterSpacing: '-0.5px'}}>Ready to Book Your First Service?</h2>
            <p className="text-white mb-4" style={{opacity: 0.85, fontSize: '16px', lineHeight: 1.7}}>
              Join thousands of happy customers and experience premium home services today
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="btn btn-warning btn-lg px-5 fw-bold" style={{borderRadius: '12px'}}>
                Sign Up Free <FaArrowRight className="ms-2" />
              </Link>
              <Link to="/services" className="btn btn-outline-light btn-lg px-4" style={{borderRadius: '12px', borderWidth: '2px'}}>
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
