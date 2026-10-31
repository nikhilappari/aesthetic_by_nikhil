import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './LegalPage.css';

const LegalPage = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('terms')) {
      setActiveTab('terms');
    } else if (location.pathname.includes('shipping')) {
      setActiveTab('shipping');
    } else {
      setActiveTab('privacy');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="legal-page-container page-fade-in">
      <div className="legal-header">
        <span className="legal-eyebrow">Studio Transparency & Compliance</span>
        <h1 className="legal-title serif">Legal & Privacy Center</h1>
        <p className="legal-subtitle">
          At Aesthetic by Nikhil, we hold your trust, memories, and personal portrait photographs in the highest regard. 
          Here is our clear, legally compliant privacy and studio operational framework.
        </p>
        <div className="legal-meta-badge">
          <span className="dot"></span>
          <span>Effective & Last Updated: October 2026 • Version 2.4</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="legal-tabs-wrapper">
        <button 
          type="button" 
          className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
        >
          <span>🛡️ Privacy Policy</span>
        </button>
        <button 
          type="button" 
          className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => { setActiveTab('terms'); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
        >
          <span>⚖️ Terms of Service</span>
        </button>
        <button 
          type="button" 
          className={`legal-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          onClick={() => { setActiveTab('shipping'); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
        >
          <span>📦 Shipping & Revisions</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="legal-content-card glass module-fade-in" key={activeTab}>

        {/* =========================================================
            TAB 1: PRIVACY POLICY
           ========================================================= */}
        {activeTab === 'privacy' && (
          <div className="legal-tab-content">
            <div className="legal-section-block">
              <h3><span className="num">01</span> Introduction & Atelier Identity</h3>
              <p>
                Welcome to <strong>Aesthetic by Nikhil</strong> ("we", "us", "our", or "the Studio"), operated by fine portrait artist 
                <strong> Nikhil Appari</strong>, based in Hyderabad, Telangana, India. This Privacy Policy outlines our transparent practices 
                regarding the collection, processing, protection, and disclosure of personal data when you visit our website 
                (<strong>aesthetic-by-nikhil.vercel.app</strong>), commission hand-drawn portraits, or communicate with our artist studio.
              </p>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">02</span> Client Reference Photos & Absolute Confidentiality</h3>
              <p>
                We understand that portraits are created from deeply personal, sentimental photographs of loved ones, family members, pets, and cherished milestones.
              </p>
              <div className="legal-highlight-box">
                <strong>Our 100% Client Privacy Pledge:</strong>
                <p>
                  Any reference photograph you upload or send to us is treated with strict professional confidentiality. 
                  Your personal reference photos are <strong>never sold, shared, rented, or distributed</strong> to third parties or used for external advertising 
                  without your explicit prior permission. Finished sketch photos are only showcased in our portfolio with customer consent.
                </p>
              </div>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">03</span> Information We Collect</h3>
              <p>When interacting with our studio, we may collect the following categories of information:</p>
              <ul>
                <li><strong>Account Credentials:</strong> Username, email address, and encrypted passwords when creating an account directly on our platform.</li>
                <li><strong>Google OAuth Identity (Optional):</strong> If you choose "Continue with Google", we receive your verified Google email address and public name to safely authenticate your session. We do not access your contacts, Google Drive, or any unrelated account data.</li>
                <li><strong>Commission Order Data:</strong> Reference photos, preferred artistic medium (Charcoal, Graphite, or Color Pencil), paper size (A4, A3, Couple formats), framing preferences, delivery addresses, and custom dedication notes.</li>
                <li><strong>Communication Logs:</strong> Messages exchanged with the artist regarding approval drafts, quotes, and status updates in your client order dashboard.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">04</span> Third-Party Service Providers</h3>
              <p>To deliver a smooth, high-speed, and secure browsing experience, we partner with industry-standard cloud infrastructure:</p>
              <ul>
                <li><strong>Google Identity Services (OAuth 2.0):</strong> Provides safe, single-click social login with no password vulnerability.</li>
                <li><strong>Cloudinary (Encrypted Media Storage):</strong> High-resolution artwork images and reference photos are stored securely using Cloudinary's encrypted global media infrastructure.</li>
                <li><strong>Hosting & Backend Infrastructure:</strong> Our frontend is served globally via Vercel CDN, and API endpoints are powered by secure Node.js cloud servers on Render with TLS/SSL encryption.</li>
                <li><strong>WhatsApp Direct Connect:</strong> Used optionally for instant customer inquiries, frame discussions, and direct order consultations.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">05</span> Cookies & Local Storage Usage</h3>
              <p>
                We do not use tracking or advertising surveillance cookies. We only use essential browser <code>localStorage</code> to:
              </p>
              <ul>
                <li>Maintain your active login authentication token across page refreshes.</li>
                <li>Instantly cache gallery artworks so you experience 0-second page load speeds.</li>
                <li>Save your privacy cookie preferences.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">06</span> Data Retention & Your Legal Rights</h3>
              <p>
                You retain complete control over your personal data. You have the right at any time to:
              </p>
              <ul>
                <li>Request a copy of the personal details and orders associated with your profile.</li>
                <li>Request the permanent deletion of your uploaded reference photos and client profile from our active database.</li>
                <li>Opt out of any non-essential studio communications.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">07</span> Contact & Studio Grievance Officer</h3>
              <p>If you have any questions, requests, or privacy inquiries regarding your portrait commission data, please reach out directly:</p>
              <div className="legal-contact-grid">
                <div className="legal-contact-item">
                  <div className="label">Lead Artist & Founder</div>
                  <div className="value">Nikhil Appari</div>
                </div>
                <div className="legal-contact-item">
                  <div className="label">Direct Email</div>
                  <div className="value"><a href="mailto:nikhilappari2006@gmail.com">nikhilappari2006@gmail.com</a></div>
                </div>
                <div className="legal-contact-item">
                  <div className="label">Studio Phone / WhatsApp</div>
                  <div className="value"><a href="tel:+919849117467">+91 98491 17467</a></div>
                </div>
                <div className="legal-contact-item">
                  <div className="label">Location</div>
                  <div className="value">Hyderabad, Telangana, India</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: TERMS OF SERVICE
           ========================================================= */}
        {activeTab === 'terms' && (
          <div className="legal-tab-content">
            <div className="legal-section-block">
              <h3><span className="num">01</span> Commission Agreement</h3>
              <p>
                By requesting a portrait or submitting an order on Aesthetic by Nikhil, you agree to these Terms of Service. 
                Each portrait is an original, handmade work of fine art produced by Nikhil Appari using professional artist-grade charcoal, 
                graphite, or polychromos pencils on heavy 300 GSM archival paper.
              </p>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">02</span> Photo Quality & Artist Acceptance</h3>
              <p>
                Hyper-realistic portraiture depends fundamentally on the resolution, lighting, and facial clarity of the reference photo provided.
              </p>
              <ul>
                <li>The artist reserves the right to review photos before confirming an order. If a photograph is too pixelated, dimly lit, or obstructed, the artist may advise choosing a different photo to ensure a stunning result.</li>
                <li>Orders are confirmed once the custom quote and reference photo have been approved by both the artist and client.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">03</span> Work-in-Progress & Client Approval</h3>
              <div className="legal-highlight-box">
                <strong>Transparent Creation Process:</strong>
                <p>
                  Before applying permanent protective fixative or packaging, a preview of your completed portrait sketch will be shared for your review. 
                  Minor adjustments to facial highlights, shading intensity, or background tones are gladly accommodated during this stage.
                </p>
              </div>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">04</span> Intellectual Property & Artistic Copyright</h3>
              <p>
                In accordance with international visual arts standards:
              </p>
              <ul>
                <li>The client receives 100% full ownership of the original physical commissioned physical artwork, including full personal display, gifting, and home exhibition rights.</li>
                <li>The artist retains moral copyright and the right to photograph the physical sketch for studio documentation and artistic portfolio exhibition (unless private non-disclosure was requested in advance).</li>
              </ul>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: SHIPPING & REVISIONS
           ========================================================= */}
        {activeTab === 'shipping' && (
          <div className="legal-tab-content">
            <div className="legal-section-block">
              <h3><span className="num">01</span> Turnaround & Creation Timelines</h3>
              <p>
                Original fine art demands meticulous precision, layering, and patience. Our standard timelines are:
              </p>
              <ul>
                <li><strong>Single Face (A4 Format):</strong> 3 to 5 business days creation.</li>
                <li><strong>Couple / Intricate Detailing (A3 Format):</strong> 5 to 7 business days creation.</li>
                <li><strong>Priority Rush Orders:</strong> Available upon request for upcoming Birthdays or Anniversaries via direct WhatsApp consultation.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">02</span> Secure Archival Packaging</h3>
              <p>
                Every finished sketch undergoes a multi-layer protective packing protocol before dispatch:
              </p>
              <ul>
                <li><strong>UV Matte Fixative Seal:</strong> Protects charcoal and graphite pigments from smudging or atmospheric oxidation.</li>
                <li><strong>Acid-Free Glassine Overlay:</strong> Shields the paper surface from friction.</li>
                <li><strong>Rigid Armor Packaging:</strong> Framed portraits are cushioned in multi-layer bubble wrap and reinforced hardboard boxes; unframed portraits are shipped in heavy-duty crush-proof postal tubes.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">03</span> Delivery & Safe Transit Guarantee</h3>
              <p>
                We ship nationwide across India through premium courier partners (Blue Dart, DTDC, Delhivery) with real-time tracking numbers provided. 
                Domestic delivery typically takes <strong>3 to 5 business days</strong> after dispatch. In the rare event of transit damage, 
                please share an unboxing photo within 48 hours for immediate resolution.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LegalPage;
