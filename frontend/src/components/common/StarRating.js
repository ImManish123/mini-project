import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, size = 16, showNumber = true }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={i} className="text-warning" size={size} />);
  }
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-warning" size={size} />);
  }
  const remaining = 5 - stars.length;
  for (let i = 0; i < remaining; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" size={size} />);
  }

  return (
    <span className="d-inline-flex align-items-center gap-1">
      {stars}
      {showNumber && <span className="ms-1 fw-semibold" style={{fontSize: size * 0.85}}>{rating}</span>}
    </span>
  );
};

export default StarRating;
