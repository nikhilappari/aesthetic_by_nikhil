import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtworkDetail from './ArtworkDetail';
import './Gallery.css';

const Gallery = ({ artworks }) => {
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'spotlight' or 'grid'
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const navigate = useNavigate();

  const filteredArtworks = filter === 'All' 
    ? artworks 
    : artworks.filter(art => art.type === filter);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  const activeArtwork = filteredArtworks[activeIndex] || null;

  const handleNext = () => {
    if (filteredArtworks.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % filteredArtworks.length);
  };

  const handlePrev = () => {
    if (filteredArtworks.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + filteredArtworks.length) % filteredArtworks.length);
  };

  const handleCommissionClick = (artwork) => {
    // Map artwork type/category to order form options
    let styleOption = 'Black & White (Charcoal)';
    if (artwork.type === 'Color' || artwork.category.toLowerCase().includes('color')) {
      styleOption = 'Color Pencil';
    } else if (artwork.category.toLowerCase().includes('graphite')) {
      styleOption = 'Graphite Pencil';
    }

    const typeOption = artwork.category.includes('Couple') ? 'Couple Portrait' : 'Single Portrait';

    localStorage.setItem('commissionPreset', JSON.stringify({
      style: styleOption,
      type: typeOption
    }));

    navigate('/order');
  };

  const filterTabs = ['All', 'Black & White', 'Color'];

  return (
    <section className="gallery-section section-padding" id="gallery">
      <div className="container">
        
        {/* Exhibition Header */}
        <div className="gallery-header">
          <div className="gallery-header-info">
            <span className="gallery-eyebrow">Studio Nikhil Exhibition</span>
            <h2 className="section-title serif">The Masterpieces</h2>
          </div>
          
          <div className="gallery-controls">
            {/* Filter Tabs */}
            <div className="filter-tabs">
              {filterTabs.map(tab => (
                <button 
                  key={tab}
                  className={`filter-tab ${filter === tab ? 'active' : ''}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Layout Toggle */}
            <div className="layout-toggle-container">
              <button 
                className={`layout-toggle-btn ${viewMode === 'spotlight' ? 'active' : ''}`}
                onClick={() => setViewMode('spotlight')}
                title="Cinematic Spotlight View"
              >
                🎬 Spotlight
              </button>
              <button 
                className={`layout-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Exhibition Masonry Wall"
              >
                🧱 Grid Wall
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {filteredArtworks.length > 0 ? (
          viewMode === 'spotlight' ? (
            /* Cinematic Spotlight Mode */
            <div className="spotlight-outer-container module-fade-in" key={`spotlight-${filter}`}>
              {activeArtwork && (
                <>
                  {/* Background Glassmorphic Glow */}
                  <div 
                    className="ambient-glow" 
                    style={{ backgroundImage: `url(${activeArtwork.image})` }}
                  ></div>

                  <div className="spotlight-wrapper glass">
                    {/* Left Column: Framed Masterpiece */}
                    <div className="spotlight-frame-container">
                      <div className={`spotlight-frame ${activeArtwork.orientation === 'Horizontal' ? 'horizontal' : 'vertical'}`} onClick={() => setSelectedArtwork(activeArtwork)}>
                        <div className="frame-matte">
                          <img src={activeArtwork.image} alt={activeArtwork.title} className="frame-image" />
                          <div className="frame-spotlight-reflection"></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Masterpiece Specs & Narrative */}
                    <div className="spotlight-details">
                      <div className="details-header">
                        <span className="artwork-meta-tag">{activeArtwork.type} • {activeArtwork.category}</span>
                        <h1 className="artwork-title-large serif">{activeArtwork.title}</h1>
                      </div>

                      <p className="artwork-narrative">
                        {activeArtwork.description || "A custom hand-drawn sketch crafted with fine detail, highlighting rich shadow contrasts and artistic depth."}
                      </p>

                      <div className="artwork-specs-list">
                        <div className="spec-item">
                          <span className="spec-label">Style Class:</span>
                          <span className="spec-value">{activeArtwork.category}</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Dimensions / Size:</span>
                          <span className="spec-value">{activeArtwork.size || 'A4'} ({activeArtwork.orientation || 'Vertical'})</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Medium:</span>
                          <span className="spec-value">{activeArtwork.type} Pencil</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Paper Class:</span>
                          <span className="spec-value">220 GSM Acid-Free Archival</span>
                        </div>
                      </div>

                      <div className="spotlight-actions">
                        <button 
                          className="btn-primary" 
                          onClick={() => handleCommissionClick(activeArtwork)}
                        >
                          Commission Similar Work
                        </button>
                        <button 
                          className="btn-secondary" 
                          onClick={() => setSelectedArtwork(activeArtwork)}
                        >
                          Inspect Details
                        </button>
                      </div>

                      {/* Spotlight Navigation Arrows */}
                      <div className="spotlight-nav">
                        <button className="nav-arrow-btn" onClick={handlePrev} title="Previous Masterpiece">←</button>
                        <span className="nav-fraction">
                          {String(activeIndex + 1).padStart(2, '0')} / {String(filteredArtworks.length).padStart(2, '0')}
                        </span>
                        <button className="nav-arrow-btn" onClick={handleNext} title="Next Masterpiece">→</button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Filmstrip Reels */}
                  <div className="filmstrip-container">
                    <span className="filmstrip-title">Exhibition Catalogue ({filteredArtworks.length})</span>
                    <div className="filmstrip-scroll">
                      {filteredArtworks.map((art, idx) => (
                        <div 
                          key={art.id} 
                          className={`filmstrip-card ${idx === activeIndex ? 'active' : ''}`}
                          onClick={() => setActiveIndex(idx)}
                        >
                          <img src={art.image} alt={art.title} className="filmstrip-thumb" />
                          <div className="filmstrip-overlay">
                            <span className="filmstrip-index">{idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Exhibition Masonry Grid Mode */
            <div className="exhibition-masonry-wrapper module-fade-in" key={`grid-${filter}`}>
              <div className="masonry-grid">
                {filteredArtworks.map((art, idx) => (
                  <div 
                    key={art.id} 
                    className="masonry-card glass"
                    onClick={() => setSelectedArtwork(art)}
                  >
                    <div className="masonry-image-wrapper">
                      <img src={art.image} alt={art.title} className="masonry-image" />
                      <div className="masonry-hover-overlay">
                        <div className="hover-content">
                          <span className="hover-category">{art.type} • {art.category}</span>
                          <h3 className="hover-title serif">{art.title}</h3>
                          <button className="btn-inspect-mini">Inspect</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="empty-gallery glass module-fade-in">
            <span>🎨</span>
            <p>Masterpieces are being prepared... Check back soon!</p>
          </div>
        )}

        <ArtworkDetail 
          artwork={selectedArtwork} 
          onClose={() => setSelectedArtwork(null)} 
        />
      </div>
    </section>
  );
};

export default Gallery;
