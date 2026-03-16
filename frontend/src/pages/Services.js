import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../services/api';
import { FaArrowRight, FaSearch } from 'react-icons/fa';

const categoryImages = {
  'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=200&fit=crop',
  'plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=200&fit=crop',
  'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=200&fit=crop',
  'appliance repair': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=200&fit=crop',
  'beauty & wellness': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&h=200&fit=crop',
  'pest control': 'https://images.unsplash.com/photo-1611690488505-1430015be129?w=400&h=200&fit=crop',
  'hair cut': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=200&fit=crop',
  'movers': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&h=200&fit=crop',
  'wifi': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=200&fit=crop',
  'cable': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=200&fit=crop',
  'electricity': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop',
  'water supply': 'https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400&h=200&fit=crop',
  'gas connection': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=200&fit=crop',
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=200&fit=crop',
  'newspaper': 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=400&h=200&fit=crop',
  'cleaning staff': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=200&fit=crop',
  'courier partners': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=200&fit=crop',
  'laundry': 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=200&fit=crop',
  'painting': 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=200&fit=crop',
  'carpentry': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=200&fit=crop',
};

const getCategoryImage = (cat) => {
  if (cat.imageUrl) return cat.imageUrl;
  const key = Object.keys(categoryImages).find(k => cat.categoryName.toLowerCase().includes(k));
  return key ? categoryImages[key] : null;
};

const fallbackImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=200&fit=crop';

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const lastRowCategories = ['newspaper', 'water supply', 'pest control'];

  const filtered = categories
    .filter(cat =>
      cat.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aIsLast = lastRowCategories.includes(a.categoryName.toLowerCase()) ? 1 : 0;
      const bIsLast = lastRowCategories.includes(b.categoryName.toLowerCase()) ? 1 : 0;
      return aIsLast - bIsLast;
    });

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper" style={{background: '#f0f2f5'}}>
      <div className="page-header" style={{paddingBottom: '55px'}}>
        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <span className="badge bg-white bg-opacity-25 text-white px-3 py-2 rounded-pill mb-3" style={{fontSize: '12px', fontWeight: 600}}>
            {categories.length} Services Available
          </span>
          <h2 className="fw-bold text-white mb-2" style={{letterSpacing: '-0.5px'}}>Our Services</h2>
          <p className="text-white mb-0" style={{opacity: 0.8, fontSize: '15px'}}>Choose from a wide range of professional home services</p>
        </div>
      </div>
      <div className="container" style={{marginTop: '-30px'}}>
        {/* Search Bar */}
        <div className="card border-0 mb-4" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '14px'}}>
          <div className="card-body p-3">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search services... (e.g. plumbing, cleaning, hair cut)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{fontSize: '15px'}}
              />
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {filtered.map((cat, index) => (
            <div key={cat.id} className="col-lg-4 col-md-6" style={{animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both`}}>
              <Link to={`/vendors/category/${cat.id}`} className="text-decoration-none">
                <div className="card border-0 h-100 category-card overflow-hidden hover-lift" style={{boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                  <div className="position-relative">
                    <img
                      src={getCategoryImage(cat) || fallbackImage}
                      className="card-img-top"
                      alt={cat.categoryName}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100" 
                         style={{background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.75))'}} />
                    <div className="position-absolute bottom-0 start-0 p-4">
                      <span style={{fontSize: '2rem', marginRight: '8px'}}>{cat.icon}</span>
                      <span className="text-white fw-bold" style={{fontSize: '1.2rem'}}>{cat.categoryName}</span>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-muted mb-3" style={{fontSize: '14px', lineHeight: 1.6}}>{cat.description}</p>
                    <span className="text-primary fw-bold" style={{fontSize: '14px'}}>
                      Explore Professionals <FaArrowRight className="ms-1" size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-5">
            <div style={{fontSize: '48px', marginBottom: '16px', opacity: 0.3}}>🔍</div>
            <h5 className="text-muted fw-bold">No services found</h5>
            <p className="text-muted">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
