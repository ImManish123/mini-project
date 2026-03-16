import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaArrowRight, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row py-5 pt-5 pb-4">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="text-white fw-bold mb-3" style={{fontSize: '1.4rem', letterSpacing: '-0.3px'}}>
              <span style={{background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '5px 9px', marginRight: '10px', display: 'inline-flex'}}>
                <FaHome />
              </span>
              HomeServ
            </h5>
            <p className="text-light mb-4" style={{opacity: 0.7, fontSize: '14px', lineHeight: 1.8}}>
              Your community living hub — connecting residents with trusted professionals 
              for home services, parking management, and community maintenance.
            </p>
            <div className="social-links d-flex gap-2">
              <a href="#!" className="text-light"><FaFacebook size={16} /></a>
              <a href="#!" className="text-light"><FaTwitter size={16} /></a>
              <a href="#!" className="text-light"><FaInstagram size={16} /></a>
              <a href="#!" className="text-light"><FaLinkedin size={16} /></a>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-white fw-bold mb-3" style={{fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Quick Links</h6>
            <ul className="list-unstyled">
              {[
                { to: '/', label: 'Home' },
                { to: '/services', label: 'Services' },
                { to: '/login', label: 'Login' },
                { to: '/register', label: 'Register' },
              ].map((link, i) => (
                <li key={i} className="mb-2">
                  <Link to={link.to} className="text-light text-decoration-none d-inline-flex align-items-center" style={{opacity: 0.7, fontSize: '14px'}}>
                    <FaArrowRight size={9} className="me-2" />{link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-white fw-bold mb-3" style={{fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Our Services</h6>
            <ul className="list-unstyled">
              {['🧹 Cleaning', '🔧 Plumbing', '⚡ Electrical', '🅿️ Parking', '🏠 Complaints', '✂️ Hair Cut'].map((service, i) => (
                <li key={i} className="mb-2 text-light" style={{opacity: 0.7, fontSize: '14px'}}>{service}</li>
              ))}
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-white fw-bold mb-3" style={{fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Contact Us</h6>
            <ul className="list-unstyled">
              <li className="mb-3 text-light d-flex align-items-start" style={{opacity: 0.7, fontSize: '14px'}}>
                <FaEnvelope className="me-2 mt-1 flex-shrink-0" size={13} />
                <span>support@homeserv.com</span>
              </li>
              <li className="mb-3 text-light d-flex align-items-start" style={{opacity: 0.7, fontSize: '14px'}}>
                <FaPhone className="me-2 mt-1 flex-shrink-0" size={13} />
                <span>+91 98765 43210</span>
              </li>
              <li className="mb-3 text-light d-flex align-items-start" style={{opacity: 0.7, fontSize: '14px'}}>
                <FaMapMarkerAlt className="me-2 mt-1 flex-shrink-0" size={13} />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>
        <hr className="border-light" style={{opacity: 0.1}} />
        <div className="row py-3">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-light mb-0" style={{opacity: 0.5, fontSize: '13px'}}>
              &copy; {new Date().getFullYear()} HomeServ. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="text-light mb-0" style={{opacity: 0.5, fontSize: '13px'}}>
              Made with <FaHeart size={11} className="text-danger mx-1" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
