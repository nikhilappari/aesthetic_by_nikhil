import React from 'react';
import './CertificateModal.css';

const CertificateModal = ({ artwork, request, onClose }) => {
  if (!artwork && !request) return null;

  const item = artwork || request;
  const title = item.title || item.type || 'Custom Portrait Commission';
  const image = item.image || (item.images && item.images[0]) || '/artist_workspace.png';
  const rawId = item.id || 1;
  const formattedSerial = `AN-CERT-2026-${String(rawId).padStart(4, '0')}`;
  
  const medium = item.type === 'Color' 
    ? 'Faber-Castell Polychromos & Caran d\'Ache Luminance' 
    : 'Nitram Fine Art Charcoal & Faber-Castell 9000 Graphite';

  const size = item.size 
    ? `${item.size} Archival Format`
    : (item.category && item.category.includes('Couple') ? 'A3 Format (297 × 420 mm)' : 'A4 Archival Format (210 × 297 mm)');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cert-modal-overlay" onClick={onClose}>
      <div className="cert-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Action Header */}
        <div className="cert-actions-bar">
          <div className="cert-badge-tag">
            <span>⚜️ Archival Collector Document</span>
          </div>
          <div className="cert-action-buttons">
            <button type="button" className="cert-btn-print" onClick={handlePrint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Print / Save PDF</span>
            </button>
            <button type="button" className="cert-btn-close" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        {/* Archival Certificate Sheet */}
        <div className="cert-sheet">
          {/* Corner Filigrees */}
          <div className="cert-corner cert-corner-tl" />
          <div className="cert-corner cert-corner-tr" />
          <div className="cert-corner cert-corner-bl" />
          <div className="cert-corner cert-corner-br" />

          {/* Header */}
          <div className="cert-header">
            <div className="cert-logo-seal">
              <img src="/favicon.png" alt="Aesthetic by Nikhil Seal" />
            </div>
            <p className="cert-studio-title">Aesthetic by Nikhil • Atelier of Fine Art</p>
            <h1 className="cert-main-heading">Certificate of Authenticity</h1>
            <p className="cert-sub-heading">Original Hand-Drawn Portraiture • Unique Edition</p>
            <div className="cert-divider-line" />
          </div>

          {/* Statement */}
          <p className="cert-statement">
            "This document affirms and guarantees that the artwork described herein is a genuine, 
            one-of-a-kind original hand-drawn masterpiece, personally executed by fine artist Nikhil Appari. 
            Created with the finest artist-grade pigments on museum-grade acid-free archival substrate, 
            engineered to preserve color, contrast, and emotion for over a century."
          </p>

          {/* Details & Miniature Showcase */}
          <div className="cert-details-grid">
            <div className="cert-artwork-frame">
              <img src={image} alt={title} />
            </div>

            <div className="cert-specs-table">
              <div className="cert-spec-item">
                <span className="cert-spec-label">Artwork Title / Subject</span>
                <span className="cert-spec-value gold">{title}</span>
              </div>
              <div className="cert-spec-item">
                <span className="cert-spec-label">Certificate Serial ID</span>
                <span className="cert-spec-value gold">{formattedSerial}</span>
              </div>
              <div className="cert-spec-item">
                <span className="cert-spec-label">Artist / Conservator</span>
                <span className="cert-spec-value">Nikhil Appari</span>
              </div>
              <div className="cert-spec-item">
                <span className="cert-spec-label">Creation Medium</span>
                <span className="cert-spec-value">{medium}</span>
              </div>
              <div className="cert-spec-item">
                <span className="cert-spec-label">Archival Substrate</span>
                <span className="cert-spec-value">300 GSM 100% Cotton Cold-Pressed</span>
              </div>
              <div className="cert-spec-item">
                <span className="cert-spec-label">Dimensions / Scale</span>
                <span className="cert-spec-value">{size}</span>
              </div>
              <div className="cert-spec-item">
                <span className="cert-spec-label">Preservation Sealing</span>
                <span className="cert-spec-value">UV-Proof Matte Archival Fixative</span>
              </div>
              <div className="cert-spec-item">
                <span className="cert-spec-label">Studio Origin</span>
                <span className="cert-spec-value">Hyderabad, India</span>
              </div>
            </div>
          </div>

          {/* Footer & Validation */}
          <div className="cert-footer">
            <div className="cert-wax-seal">
              <div className="wax-seal-circle">
                <span className="wax-seal-star">★</span>
                <span className="wax-seal-inner">AN</span>
                <span className="wax-seal-inner" style={{ fontSize: '0.45rem' }}>VERIFIED</span>
              </div>
              <div className="wax-seal-text">
                <strong>ARCHIVAL GRADE GUARANTEED</strong>
                <span>Acid-Free • 100+ Years Longevity</span>
              </div>
            </div>

            <div className="cert-signature-block">
              <div className="cert-signature-line">Nikhil Appari</div>
              <div className="cert-signee-name">Nikhil Appari</div>
              <div className="cert-signee-title">Founder & Principal Portrait Artist</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
