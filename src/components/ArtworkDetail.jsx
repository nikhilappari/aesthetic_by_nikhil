import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ArtworkDetail.css';

const ArtworkDetail = ({ artwork, onClose }) => {
  const navigate = useNavigate();
  if (!artwork) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="detail-grid">
          <div className="detail-image">
            <img src={artwork.image} alt={artwork.title} />
          </div>
          <div className="detail-info">
            <div className="badge">{artwork.type}</div>
            <h2 className="serif">{artwork.title}</h2>
            <p className="category">{artwork.category}</p>
            <p className="description">{artwork.description}</p>
            
            <div className="specs">
              <div className="spec-item">
                <span>Medium</span>
                <span>{artwork.type === 'Color' ? 'Polychromos Pencils' : 'Nitram Charcoal'}</span>
              </div>
              <div className="spec-item">
                <span>Available Sizes</span>
                <span>{artwork.category.includes('Couple') ? 'A3 Only' : 'A4, A3'}</span>
              </div>
            </div>

            <div className="detail-footer">
              <button className="btn-primary" onClick={() => {
                onClose();
                navigate('/order');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>Request Similar Sketch</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
