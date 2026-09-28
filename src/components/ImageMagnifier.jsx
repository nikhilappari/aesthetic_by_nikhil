import React, { useState, useRef } from 'react';
import './ImageMagnifier.css';

const ImageMagnifier = ({
  src,
  alt = 'Hand-drawn artwork',
  className = '',
  lensSize = 160,
  defaultZoom = 2.5
}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);
  const [lensStyle, setLensStyle] = useState({});
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef(null);

  const updatePosition = (clientX, clientY, isTouch = false) => {
    if (!isEnabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Boundary check
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      setIsHovered(false);
      return;
    }

    setIsHovered(true);
    if (!hasInteracted) setHasInteracted(true);

    const radius = lensSize / 2;

    // For touch devices, offset slightly upwards so the finger doesn't obscure the magnified view
    const displayY = isTouch ? Math.max(radius, y - 55) : y;
    const displayX = x;

    // Calculate background size and position for pixel-perfect zoom alignment
    const bgWidth = rect.width * zoomLevel;
    const bgHeight = rect.height * zoomLevel;
    const bgX = radius - (x * zoomLevel);
    const bgY = radius - (y * zoomLevel);

    setLensStyle({
      width: `${lensSize}px`,
      height: `${lensSize}px`,
      left: `${displayX}px`,
      top: `${displayY}px`,
      backgroundImage: `url("${src}")`,
      backgroundSize: `${bgWidth}px ${bgHeight}px`,
      backgroundPosition: `${bgX}px ${bgY}px`
    });
  };

  const handleMouseMove = (e) => {
    updatePosition(e.clientX, e.clientY, false);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updatePosition(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      updatePosition(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`image-magnifier-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => isEnabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsHovered(false)}
    >
      <img src={src} alt={alt} className="magnifier-source-img" />

      {/* Floating Toolbar with controls */}
      <div className="magnifier-toolbar">
        <div 
          className="magnifier-hint-badge"
          style={{ opacity: hasInteracted && isHovered ? 0.35 : 1 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Pencil Texture Loupe</span>
        </div>

        <div className="magnifier-controls" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`magnifier-zoom-btn ${zoomLevel === 2 ? 'active' : ''}`}
            onClick={() => { setZoomLevel(2); setIsEnabled(true); }}
            title="2x Zoom"
          >
            2x
          </button>
          <button
            type="button"
            className={`magnifier-zoom-btn ${zoomLevel === 2.5 ? 'active' : ''}`}
            onClick={() => { setZoomLevel(2.5); setIsEnabled(true); }}
            title="2.5x Zoom"
          >
            2.5x
          </button>
          <button
            type="button"
            className={`magnifier-zoom-btn ${zoomLevel === 3.5 ? 'active' : ''}`}
            onClick={() => { setZoomLevel(3.5); setIsEnabled(true); }}
            title="3.5x Zoom"
          >
            3.5x
          </button>
          <button
            type="button"
            className={`magnifier-toggle-btn ${isEnabled ? 'active' : ''}`}
            onClick={() => {
              setIsEnabled(!isEnabled);
              if (isEnabled) setIsHovered(false);
            }}
            title={isEnabled ? "Disable Loupe" : "Enable Loupe"}
          >
            {isEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* The Magnifying Glass Lens */}
      {isEnabled && isHovered && (
        <div className="magnifier-lens" style={lensStyle}>
          <div className="magnifier-reticle" />
        </div>
      )}
    </div>
  );
};

export default ImageMagnifier;
