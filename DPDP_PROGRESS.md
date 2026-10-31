# DPDP Act (India) Compliance Progress & Technical Audit Report
**Project:** Aesthetic by Nikhil (Portrait Atelier Web Platform)  
**Git Branch:** `compliance/dpdp` (Unpushed as instructed)  
**Applicable Law:** Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023, India)  
**Data Fiduciary:** Nikhil Appari (Lead Artist & Founder, Aesthetic by Nikhil)  
**Designated Grievance Redressal Officer:** Nikhil Appari (`nikhilappari2006@gmail.com`)  
**Audit Date:** October 2026  
**Status:** Core Compliance Architecture Implemented & Documented  

---

## 1. Executive Summary

This audit and compliance initiative implements an end-to-end governance and technical framework under the **Digital Personal Data Protection Act, 2023 (DPDP Act, India)** for the fine art portrait atelier platform **Aesthetic by Nikhil**.

The platform processes sensitive personal data, notably **high-resolution reference photographs containing facial likenesses of adults and minors**, alongside account credentials, commission notes, and delivery addresses. Under the DPDP Act:
- Bundled or pre-ticked consent is invalid (Section 6).
- Every processing activity must be tied to a specified lawful purpose (Section 5).
- Data Principals enjoy statutory rights of access, correction, erasure, consent withdrawal, and grievance redressal (Sections 11–14).
- A 72-hour notification protocol to the Data Protection Board of India (DPBI) and affected users is mandatory in the event of a breach (Section 8(6)).

---

## 2. Personal Data Mapping & Processor Inventory

| Collection Point | Personal Data Elements | Specified Lawful Purpose | DPDP Legal Basis | Third-Party Processors | Retention Period |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Sign Up** (`/api/auth/signup`, `AuthPage.jsx`) | Username, email, password (bcrypt hash) | Account authentication, order tracking security | Explicit Consent (Sec 6(1)) | Render (Compute), SQLite / Postgres | Until account deletion request |
| **Google Sign-In** (`/api/auth/google`, `AuthPage.jsx`) | Google Sub ID, verified email, display name | Single-click social authentication | Explicit Consent (Sec 6(1)) | Google LLC (GSI), Backend DB | Until account deletion request |
| **Sketch Commission Form** (`/api/requests`, `RequestSketch.jsx`) | High-resolution portrait photographs (facial likeness) | Handcrafting physical charcoal/graphite drawing | Explicit Consent (Sec 6(1) & Sec 9) | Cloudinary Inc. (Media CDN) | Purged 30 days post-dispatch or on-demand |
| **Commission Delivery** (`/api/requests`, `OrderTracking.jsx`) | Customer name, phone number, shipping address | Physical packaging, insured courier shipping | Contract Performance & Legitimate Use (Sec 7(b)) | Blue Dart, DTDC, Delhivery | 1 year for tax, accounting & transit claims |
| **Customer-Artist Chat** (`/api/requests/:id`, `OrderTracking.jsx`) | Chat messages, revision requests, timestamps | Sketch approval & custom adjustments | Contract Performance | Backend Database | Retained with order record |
| **Consent Logging Engine** (`/api/consent`) | User identifier, purpose, IP address, user-agent, timestamp | Statutory proof of voluntary, informed consent | Legal Compliance (Sec 6 & Sec 8) | Internal Database Table (`consent_records`) | Minimum 3 years for statutory audit |

---

## 3. What Was Built & Implemented

### (1) Backend Consent & Rights Infrastructure (`server/db.js` & `server/index.js`)
- **`consent_records` Table:** Stores immutable consent logs: `id`, `user_id`, `identifier`, `purpose`, `consented`, `notice_version`, `ip_address`, `user_agent`, and `timestamp`.
- **`data_rights_requests` Table:** Stores statutory rights applications: `id` (e.g. `DRR-100234`), `user_id`, `name`, `email`, `request_type`, `details`, `status`, `created_at`, `updated_at`.
- **API Endpoints:**
  - `POST /api/consent`: Captures client consent events with IP and browser audit metadata.
  - `GET /api/consent/my`: Allows authenticated users to view their consent history.
  - `POST /api/data-rights`: Accepts and logs statutory Data Principal Rights requests with an automated 30-day resolution commitment.
  - `GET /api/data-rights` & `PUT /api/data-rights/:id`: Admin endpoints to review, inspect, and update rights request statuses.
- **Client API Wrapper (`src/utils/api.js`):** Extended with `recordConsent()`, `submitDataRightsRequest()`, `getDataRightsRequests()`, and `updateDataRightsRequest()`.

### (2) Granular Opt-in Consent Checkboxes at Data Entry Points
- **Account Registration (`src/pages/AuthPage.jsx`):**
  - **Purpose 1 (Required for Service):** Unticked checkbox for processing credentials under the DPDP Privacy Notice. Sign-up cannot proceed without explicit opt-in.
  - **Purpose 2 (Granular / Optional):** Separate unticked checkbox for promotional atelier previews, anniversary reminders, and newsletters.
  - **Google OAuth Notice:** Contextual disclosure informing users that Google Sign-in authenticates identity without accessing Google Drive, contacts, or personal files.
- **Sketch Commission Upload (`src/components/RequestSketch.jsx`):**
  - **Purpose 1 (Required for Service):** Unticked checkbox consenting to cloud storage and processing of uploaded reference photos solely for drawing and delivery.
  - **Purpose 2 (Optional, Unbundled):** Separate unticked checkbox granting permission for studio portfolio exhibition. Leaving this unchecked enforces private non-disclosure.

### (3) Consent Banner & Local Storage Gating (`src/components/CookieConsent.jsx`)
- Upgraded cookie banner with DPDP Act (India) compliance framing.
- Explicit choice between "Accept All Storage" and "Strictly Essential Only".
- Choosing "Strictly Essential Only" automatically wipes non-essential cached performance data (`cached_artworks`, `cached_transformation`, `cached_pricing`) from `localStorage`.
- Direct links to the Privacy Notice and the Data Rights Request Portal.

### (4) DPDP Section 5 Privacy Notice Page (`src/pages/LegalPage.jsx`)
- Complete overhaul of the Privacy Policy tab into a formal **Section 5 Statutory Notice**:
  - Full atelier identity and Data Fiduciary declaration.
  - Client Reference Photos & Biometric Safeguards pledge.
  - Comprehensive Data Inventory Table (data element, lawful purpose, legal basis, processors, retention schedule).
  - Third-party processors disclosure (Cloudinary, Google, Render, Vercel, logistics partners).
  - Detailed explanation of Data Principal Rights (Sections 11–14).
  - Prominent CTA button linking directly to the Data Rights Portal.
  - Designated Data Protection & Grievance Redressal Officer contact details, 48h acknowledgement, 30-day resolution timeline, and DPBI appeal rights.

### (5) Data Protection Clauses in Terms of Service (`src/pages/LegalPage.jsx`)
- Added Section 02 on **Reference Photo Authority & Third-Party Rights**: Customer warrants they have obtained consent from all photographed individuals, including verifiable parental consent for minors under Section 9.
- Added Section 05 on **Data Protection & Consent Withdrawal Consequences (Section 6(4))**: Clear rules on withdrawal prior to drawing vs. in-flight commissions consuming non-recoverable fine art supplies and labor.
- Added Section 06 on **Dispute Resolution & DPBI Jurisdiction**: Mandates Grievance Officer review before escalation to the Data Protection Board of India or Hyderabad courts.

### (6) Interactive Data Principal Rights Request Portal (`src/pages/DataRightsPage.jsx` & `.css`)
- Interactive portal at `/data-rights` and `/rights-request`.
- Allows users to request:
  - Right to Access Summary of Data (Section 11)
  - Right to Correction of Inaccurate Data (Section 12)
  - Right to Erasure of Photos & Profile (Section 12)
  - Withdrawal of Processing Consent (Section 6(4))
  - Grievance Redressal / Complaint (Section 13)
- Generates a tracking ID (`DRR-XXXXXX`), sets up the 30-day statutory countdown, and displays designated Grievance Officer details.

### (7) Footer Transparency (`src/components/Footer.jsx`)
- Added dedicated DPDP Act compliance badge.
- Added direct links to "Privacy Notice (DPDP)" and "Data Rights Request".
- Published Grievance Officer contact details (`nikhilappari2006@gmail.com`).

### (8) Statutory Breach Response Runbook (`BREACH_RUNBOOK.md`)
- Complete operational incident response protocol for personal data breaches under Section 8(6).
- 5-phase incident handling lifecycle: Detection & Containment (0–6h), Forensic Scoping (6–24h), DPBI Notification (within 72h), User Notification (within 72h), and Post-Mortem / RCA.
- Complete, ready-to-use notification templates:
  - **Formal DPBI Intimation Form** (ready for regulatory filing).
  - **Direct Data Principal Notification Email Template** (plain language, non-evasive, with user mitigation steps).

---

## 4. Technical Security Gaps Flagged

During this audit, the following technical security vulnerabilities were identified in the current codebase that should be resolved prior to full-scale enterprise launch:

1. **Hardcoded Fallback JWT Secret (`server/index.js`):**
   - *Risk:* Line 22 uses `process.env.JWT_SECRET || 'art_website_secret_2026_key'`. If `.env` is unmounted or omitted on production, the server falls back to a publicly known symmetric secret, allowing forged authentication tokens.
   - *Remediation:* Enforce a startup check that crashes the backend process if `JWT_SECRET` is not set or is shorter than 32 characters in production mode.
2. **Missing Anti-Automation / CAPTCHA on Public Endpoints:**
   - *Risk:* `/api/auth/signup` and `/api/data-rights` accept unauthenticated POST requests without CAPTCHA or rate-limiting. A malicious actor could flood the database with spam rights requests or automated accounts.
   - *Remediation:* Integrate Cloudflare Turnstile or Google reCAPTCHA v3 on public registration and rights submission forms.
3. **Unsigned Cloudinary Upload Preset & Client-Side File Uploads:**
   - *Risk:* `src/utils/cloudinary.js` uses unsigned upload presets directly from the client browser. Any visitor inspecting network traffic could reuse the upload preset to upload arbitrary files to the studio's Cloudinary storage.
   - *Remediation:* Transition to signed uploads where the backend server signs an upload timestamp using `CLOUDINARY_API_SECRET` and validates the user's session before authorizing upload.
4. **Missing MIME Magic-Byte Validation on File Uploads:**
   - *Risk:* The local multer upload handler in `server/index.js` only relies on file extensions and declared MIME types (`image/*`). An attacker could upload malicious polyglot scripts or executable payloads masked as `.png`.
   - *Remediation:* Validate actual file buffer magic bytes using a library like `file-type` before accepting uploads.
5. **Transport Security (HTTPS Enforcement):**
   - *Risk:* Local development runs on plain HTTP (`http://localhost:5000`). While Vercel and Render enforce HTTPS automatically at the reverse-proxy layer, the Express app lacks `helmet` middleware for HTTP Strict Transport Security (HSTS) headers.
   - *Remediation:* Add `helmet` middleware to set `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and secure CSP policies.

---

## 5. Items Tagged `[NEEDS LAWYER REVIEW]`

The following clauses and statutory definitions have been marked in `LegalPage.jsx` and this report for formal legal counsel review:

1. **Parental Consent Warranty under Section 9 (Minors):**
   - *Clause:* Customer warrants they are the legal parent or guardian of any minor depicted in reference photos, granting verifiable consent.
   - *Review Point:* Review whether an explicit parental declaration checkbox or age verification gate should be added for portrait orders involving minors.
2. **Consent Withdrawal & In-Flight Commissions (Section 6(4)):**
   - *Clause:* Withdrawal of consent after physical sketch drawing has commenced obligates the customer to reimburse materials and labor costs accrued up to the date of withdrawal.
   - *Review Point:* Review interplay between DPDP Section 6(4) (unconditional right to withdraw consent) and Indian Contract Act, 1872 regarding custom commissioned personal service contracts.
3. **Customer Indemnity for Third-Party Likeness Claims:**
   - *Clause:* Customer indemnifies Aesthetic by Nikhil against third-party claims arising from unauthorized submission of a person's photo.
   - *Review Point:* Review enforceability of consumer indemnity provisions under the Consumer Protection Act, 2019 and DPDP Act.
4. **Data Retention & Tax Audit Schedule:**
   - *Clause:* Retaining shipping addresses and order invoices for 1 year post-delivery to satisfy Indian tax and accounting obligations (Section 7(b) legitimate use).
   - *Review Point:* Ensure alignment with GST and Income Tax retention requirements (typically 6–8 years for financial transactions).
5. **Grievance Redressal Timeline:**
   - *Clause:* 48-hour acknowledgement and 30-calendar-day resolution timeline with escalation to the Data Protection Board of India (DPBI).
   - *Review Point:* Confirm final notified rules under DPDP Act when DPBI operational rules are gazetted.

---

## 6. Open Action Items & Roadmap

- [x] Create git branch `compliance/dpdp` (unpushed).
- [x] Create `consent_records` audit table and `data_rights_requests` table in database.
- [x] Expose `/api/consent` and `/api/data-rights` backend endpoints.
- [x] Add opt-in consent checkboxes (unticked, granular) to `AuthPage.jsx`.
- [x] Add opt-in photo processing and portfolio checkboxes to `RequestSketch.jsx`.
- [x] Gate non-essential browser caching behind `CookieConsent.jsx`.
- [x] Publish comprehensive DPDP Privacy Notice in `LegalPage.jsx`.
- [x] Add Data Protection and Portrait Confidentiality clauses to Terms in `LegalPage.jsx`.
- [x] Build interactive Data Principal Rights portal at `/data-rights` (`DataRightsPage.jsx`).
- [x] Publish Grievance Officer contacts in `Footer.jsx` and `LegalPage.jsx`.
- [x] Create incident response runbook with DPBI & user notice templates in `BREACH_RUNBOOK.md`.
- [x] Flag technical security gaps in `DPDP_PROGRESS.md`.
- [ ] *Next Phase:* Implement signed backend Cloudinary uploads and file magic-byte validation.
- [ ] *Next Phase:* Integrate CAPTCHA (Turnstile) on public authentication and rights submission endpoints.
- [ ] *Next Phase:* Obtain formal sign-off from legal counsel on clauses marked `[NEEDS LAWYER REVIEW]`.
