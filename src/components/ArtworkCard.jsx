import React, { useState, useRef } from 'react';
import './ArtworkCard.css';

const ArtworkCard = ({ artwork }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
      className="artwork-card-container"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="artwork-card glass"
        style={{ 
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        <div className={`artwork-image-wrapper ${(artwork.orientation || 'Vertical').toLowerCase()}`}>
          <img src={artwork.image} alt={artwork.title} className="artwork-image" />
        </div>
        <div className="artwork-info">
          <h3 className="artwork-title serif">{artwork.title}</h3>
          <p className="artwork-category">{artwork.category}</p>
          <div className="artwork-footer">
            <button className="btn-small w-full">More Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;
