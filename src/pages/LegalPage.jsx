import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
        <span className="legal-eyebrow">Digital Personal Data Protection Act (India) 2023 Compliant</span>
        <h1 className="legal-title serif">Legal & Privacy Center</h1>
        <p className="legal-subtitle">
          At Aesthetic by Nikhil, we hold your trust, sentimental memories, and personal portrait photographs in the highest regard. 
          Here is our statutory Privacy Notice and operational framework in full accordance with the DPDP Act, 2023.
        </p>
        <div className="legal-meta-badge">
          <span className="dot"></span>
          <span>DPDP Act (India) Notice • Version 2026.1-DPDP • Effective October 2026</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="legal-tabs-wrapper">
        <button 
          type="button" 
          className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
        >
          <span>🛡️ DPDP Privacy Notice</span>
        </button>
        <button 
          type="button" 
          className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => { setActiveTab('terms'); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
        >
          <span>⚖️ Terms & Data Protection</span>
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
            TAB 1: PRIVACY POLICY (DPDP ACT SECTION 5 NOTICE)
           ========================================================= */}
        {activeTab === 'privacy' && (
          <div className="legal-tab-content">
            <div className="legal-section-block">
              <h3>
                <span className="num">01</span> Introduction & Data Fiduciary Identity
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                This Privacy Notice is issued by <strong>Aesthetic by Nikhil</strong> ("the Atelier", "we", "us", or "our"), 
                operating as a <strong>Data Fiduciary</strong> under Section 2(i) of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</strong>. 
                Our atelier is founded and led by portrait artist <strong>Nikhil Appari</strong>, located in Hyderabad, Telangana, India.
              </p>
              <p>
                This Notice governs the collection, processing, storage, and erasure of digital personal data across our web application 
                (<code>aesthetic-by-nikhil.vercel.app</code>), custom commissioned portrait workflows, client messaging systems, and customer support channels.
              </p>
            </div>

            <div className="legal-section-block" id="pledge">
              <h3>
                <span className="num">02</span> Client Reference Photographs & Biometric Safeguards
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                We recognize that reference photos uploaded for commissioned drawings depict unique human facial likenesses, loved ones, 
                family members, and cherished life events.
              </p>
              <div className="legal-highlight-box">
                <strong>Our 100% Client Privacy Pledge:</strong>
                <p>
                  Your reference photographs are treated with strict confidentiality. We process uploaded photos 
                  <strong> solely and exclusively</strong> for the artistic hand-drawing of your commissioned portrait. 
                  Reference photos are <strong>never sold, licensed, fed into artificial intelligence training datasets, 
                  or disclosed to third parties</strong>. Photographs of finished physical artworks are only displayed in our public studio portfolio 
                  if you have provided explicit, unticked opt-in consent during order submission.
                </p>
              </div>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">03</span> Data Inventory, Lawful Purposes & Retention Schedules (Sec 5 & 6)
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                Pursuant to Section 5(1) of the DPDP Act 2023, the table below provides an itemized summary of the personal data collected, 
                the specified lawful purpose for each item, the legal basis of processing, third-party processors, and retention durations:
              </p>

              <div className="dpdp-table-container">
                <table className="dpdp-table">
                  <thead>
                    <tr>
                      <th>Personal Data Element</th>
                      <th>Specified Lawful Purpose</th>
                      <th>Legal Basis</th>
                      <th>Data Processors</th>
                      <th>Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Account Credentials</strong><br />Username, email, bcrypt password hash</td>
                      <td>Account creation, security authentication, order tracking access</td>
                      <td>Consent (Sec 6(1))</td>
                      <td>Render Cloud Server, PostgreSQL/SQLite</td>
                      <td>Until account deletion requested by user</td>
                    </tr>
                    <tr>
                      <td><strong>Google OAuth Identity</strong><br />Google account sub ID, verified email, name</td>
                      <td>Single-click frictionless authentication</td>
                      <td>Consent (Sec 6(1))</td>
                      <td>Google LLC (GSI), Backend DB</td>
                      <td>Until account deletion requested by user</td>
                    </tr>
                    <tr>
                      <td><strong>Reference Photographs</strong><br />High-resolution portrait reference photos</td>
                      <td>Artistic analysis and manual rendering of hand-drawn sketches</td>
                      <td>Explicit Consent (Sec 6(1))</td>
                      <td>Cloudinary Inc. (Encrypted storage)</td>
                      <td>Purged 30 days post-dispatch or upon erasure request</td>
                    </tr>
                    <tr>
                      <td><strong>Physical Delivery Details</strong><br />Recipient name, shipping address, phone number</td>
                      <td>Physical packaging, insured dispatch, and home delivery of portrait</td>
                      <td>Contractual Performance & Legitimate Uses (Sec 7(b))</td>
                      <td>Courier Partners (Blue Dart, DTDC, Delhivery)</td>
                      <td>1 year for tax, accounting & transit dispute resolution</td>
                    </tr>
                    <tr>
                      <td><strong>Order Messages & Chats</strong><br />Customer-artist feedback and preview revisions</td>
                      <td>Draft approval and custom specification adherence</td>
                      <td>Contractual Performance</td>
                      <td>Cloud Database</td>
                      <td>Retained with order record for warranty reference</td>
                    </tr>
                    <tr>
                      <td><strong>Consent Audit Trail</strong><br />Timestamp, purpose string, IP address, user-agent</td>
                      <td>Statutory proof of free and informed consent under Section 6</td>
                      <td>Compliance with Law (Sec 6 & Sec 8)</td>
                      <td>Internal Consent Log Database</td>
                      <td>3 years to satisfy statutory audit standards</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">04</span> Third-Party Data Processors & Infrastructure Safeguards
              </h3>
              <p>We engage only vetted, reputable cloud processors bound by confidentiality obligations:</p>
              <ul>
                <li><strong>Cloudinary Inc. (Encrypted Media Storage):</strong> Uploaded portrait reference photos are hosted over secure HTTPS with AES-256 server-side encryption.</li>
                <li><strong>Google LLC (Google Identity Services):</strong> Safe OAuth 2.0 token verification without storing user Google passwords or accessing unrelated Google services.</li>
                <li><strong>Vercel & Render Cloud Infrastructure:</strong> Serves frontend and backend services with end-to-end TLS 1.3 encryption and DDoS mitigation.</li>
                <li><strong>Courier Logistics Providers (Blue Dart, DTDC):</strong> Receive only recipient shipping names, addresses, and phone numbers exclusively for physical delivery execution.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">05</span> Cookies & Local Storage Gating
              </h3>
              <p>
                We respect your digital autonomy. We do not deploy third-party cross-site advertising trackers or surveillance beacons. 
                Our platform uses strictly necessary local storage:
              </p>
              <ul>
                <li><strong>Essential Session Tokens:</strong> Retains your encrypted authentication token across browser tabs.</li>
                <li><strong>Artwork Cache:</strong> High-performance caching for instant offline gallery viewing speeds. Gated behind your consent banner preferences.</li>
                <li><strong>Pending Commission Drafts:</strong> Temporary storage of draft sketch selections so you do not lose progress during login.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">06</span> Rights of Data Principals (Sections 11–14, DPDP Act 2023)
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>As a Data Principal under Indian law, you possess enforceable statutory rights:</p>
              <ul>
                <li><strong>Right to Access Summary (Section 11):</strong> Request a complete summary of your personal data processed by the Atelier, along with the identities of all third-party processors.</li>
                <li><strong>Right to Correction & Updating (Section 12):</strong> Request the rectification of inaccurate, incomplete, or out-of-date personal data.</li>
                <li><strong>Right to Erasure (Section 12):</strong> Instruct us to permanently delete your uploaded reference photographs and client account records once the sketch commission has been fulfilled.</li>
                <li><strong>Right to Withdraw Consent (Section 6(4)):</strong> Withdraw your consent at any time with the same ease with which it was granted. Withdrawal does not affect lawful processing prior to notice.</li>
                <li><strong>Right to Nominate (Section 14):</strong> Nominate any individual to exercise your data rights in the event of death or incapacity.</li>
                <li><strong>Right of Grievance Redressal (Section 13):</strong> Register a formal complaint with our Data Protection & Grievance Redressal Officer.</li>
              </ul>

              <div className="rights-cta-box glass">
                <div className="rights-cta-text">
                  <h4>Exercise Your Statutory Data Rights</h4>
                  <p>Submit an automated request to access, correct, erase, or withdraw consent for your portrait data.</p>
                </div>
                <Link to="/data-rights" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Open Data Rights Portal →
                </Link>
              </div>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">07</span> Data Protection & Grievance Redressal Officer
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                In compliance with Section 8(9) and Section 13 of the DPDP Act 2023, Aesthetic by Nikhil has designated 
                the following Grievance Redressal Officer to handle all inquiries, privacy complaints, and rights requests:
              </p>
              
              <div className="legal-contact-grid">
                <div className="legal-contact-item">
                  <div className="label">Grievance Officer</div>
                  <div className="value">Nikhil Appari</div>
                </div>
                <div className="legal-contact-item">
                  <div className="label">Official Email</div>
                  <div className="value"><a href="mailto:nikhilappari2006@gmail.com">nikhilappari2006@gmail.com</a></div>
                </div>
                <div className="legal-contact-item">
                  <div className="label">Phone / WhatsApp</div>
                  <div className="value"><a href="tel:+919849117467">+91 98491 17467</a></div>
                </div>
                <div className="legal-contact-item">
                  <div className="label">Atelier Location</div>
                  <div className="value">Hyderabad, Telangana - 500001, India</div>
                </div>
              </div>

              <div className="legal-highlight-box" style={{ marginTop: '1.5rem' }}>
                <strong>Statutory Redressal Timelines & Appeal to DPBI:</strong>
                <p>
                  Our Grievance Officer will acknowledge your communication within <strong>48 hours</strong> and resolve 
                  your grievance within a maximum of <strong>30 calendar days</strong>. If we fail to resolve your grievance within 30 days, 
                  or if you are dissatisfied with our response, you are legally entitled under Section 13(3) of the DPDP Act 
                  to file an appeal before the <strong>Data Protection Board of India (DPBI)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: TERMS OF SERVICE & DATA PROTECTION CLAUSES
           ========================================================= */}
        {activeTab === 'terms' && (
          <div className="legal-tab-content">
            <div className="legal-section-block">
              <h3>
                <span className="num">01</span> Commission Agreement
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                By requesting a custom portrait or submitting an order on Aesthetic by Nikhil, you agree to these Terms of Service. 
                Each portrait is an original, handmade work of fine art produced by Nikhil Appari using professional artist-grade charcoal, 
                graphite, or polychromos pencils on heavy 300 GSM archival paper.
              </p>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">02</span> Reference Photo Authority & Third-Party Rights
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                When uploading reference photographs of family members, children, or third parties, you expressly represent and warrant that:
              </p>
              <ul>
                <li>You possess all necessary rights, legal consent, and authority from every identifiable individual depicted in the reference photo to provide their likeness to Aesthetic by Nikhil for artistic portrait rendering.</li>
                <li>In the case of photographs featuring minors (individuals under 18 years of age), you warrant that you are the lawful parent or legal guardian giving verifiable parental consent under Section 9 of the DPDP Act 2023.</li>
                <li>You indemnify and hold harmless Aesthetic by Nikhil against any privacy, likeness, or copyright claims arising from photographs provided without authorization.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">03</span> Work-in-Progress, Approvals & Revisions
              </h3>
              <div className="legal-highlight-box">
                <strong>Transparent Creation Process:</strong>
                <p>
                  Before applying permanent protective fixative or packaging, a digital preview of your completed portrait sketch will be shared in your client order tracking dashboard for review. 
                  Minor adjustments to facial highlights, shading intensity, or background tones are accommodated during this stage.
                </p>
              </div>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">04</span> Intellectual Property & Artistic Copyright
              </h3>
              <p>In accordance with visual arts standards and Indian copyright legislation:</p>
              <ul>
                <li><strong>Physical Artwork Ownership:</strong> The client receives 100% full ownership of the original physical commissioned physical drawing, including full private display, gifting, and home exhibition rights.</li>
                <li><strong>Moral Attribution & Portfolio Rights:</strong> The artist retains moral authorship. Photographs of the physical drawing will only be published in our atelier portfolio if you ticked the portfolio consent checkbox during checkout. If you chose non-disclosure, the artwork remains completely confidential.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">05</span> Data Protection, Consent Withdrawal & Consequences (Sec 6(4))
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                Under Section 6(4) of the DPDP Act 2023, you have the right to withdraw consent for processing at any time:
              </p>
              <ul>
                <li><strong>Withdrawal Prior to Sketch Commencement:</strong> If consent is withdrawn prior to the artist commencing physical drawing, the commission will be cancelled and reference photos permanently deleted.</li>
                <li><strong>Withdrawal During Active Commission:</strong> Because physical portraiture consumes non-recoverable fine art materials and manual artist labor, withdrawal of consent after drawing has commenced constitutes cancellation of the order, subject to reimbursement for materials and labor accrued up to the date of withdrawal.</li>
                <li><strong>Erasure Post-Delivery:</strong> Once physical delivery is confirmed, you may submit an erasure request through our <Link to="/data-rights" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Data Rights Portal</Link>, and your digital reference photos will be expunged from cloud storage within 30 days.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3>
                <span className="num">06</span> Dispute Resolution, DPBI & Jurisdiction
                <span className="lawyer-review-badge">⚖️ [NEEDS LAWYER REVIEW]</span>
              </h3>
              <p>
                Any data protection complaints or grievances must first be submitted to our designated Grievance Officer at 
                <code>nikhilappari2006@gmail.com</code>. In the event a resolution cannot be reached within 30 days, 
                data protection disputes may be escalated to the <strong>Data Protection Board of India (DPBI)</strong> pursuant to Section 27 of the DPDP Act. 
                All commercial and contractual matters shall be governed exclusively by the laws of India, subject to the jurisdiction of courts in Hyderabad, Telangana.
              </p>
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
              <p>Original fine art demands meticulous precision, layering, and patience. Our standard timelines are:</p>
              <ul>
                <li><strong>Single Face (A4 Format):</strong> 3 to 5 business days creation.</li>
                <li><strong>Couple / Intricate Detailing (A3 Format):</strong> 5 to 7 business days creation.</li>
                <li><strong>Priority Rush Orders:</strong> Available upon request for upcoming Birthdays or Anniversaries via direct WhatsApp consultation.</li>
              </ul>
            </div>

            <div className="legal-section-block">
              <h3><span className="num">02</span> Secure Archival Packaging</h3>
              <p>Every finished sketch undergoes a multi-layer protective packing protocol before dispatch:</p>
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
                please share an unboxing photo within 48 hours for immediate replacement or repair resolution.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LegalPage;
