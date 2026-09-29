import React, { useState } from 'react';
import ArtworkCard from './ArtworkCard';
import ArtworkDetail from './ArtworkDetail';
import './ArtworksGrid.css';

const ArtworksGrid = ({ artworks }) => {
  const [filter, setFilter] = useState('All');
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const filteredArtworks = filter === 'All' 
    ? artworks 
    : artworks.filter(art => art.type === filter);

  const filterTabs = ['All', 'Black & White', 'Color'];

  return (
    <section className="gallery-section section-padding" id="gallery">
      <div className="container">
        <div className="gallery-header">
          <h2 className="section-title">The Collection</h2>
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
        </div>
        
        <div className="artwork-grid">
          {filteredArtworks.length > 0 ? (
            filteredArtworks.map(art => (
              <div key={art.id} onClick={() => setSelectedArtwork(art)} style={{ cursor: 'pointer' }}>
                <ArtworkCard artwork={art} />
              </div>
            ))
          ) : (
            <div className="empty-gallery glass">
              <p>Masterpieces are being prepared... Check back soon!</p>
            </div>
          )}
        </div>

        <ArtworkDetail 
          artwork={selectedArtwork} 
          onClose={() => setSelectedArtwork(null)} 
          enableMagnifier={true}
        />
      </div>
    </section>
  );
};

export default ArtworksGrid;
