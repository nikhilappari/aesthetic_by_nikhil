# Personal Data Breach Incident Response Runbook
## Aesthetic by Nikhil • DPDP Act (India) 2023 Compliance
**Document Ref:** SEC-RUNBOOK-DPDP-2026-V1  
**Statutory Basis:** Section 8(6) & Section 2(u), Digital Personal Data Protection Act, 2023  
**Designated Incident Commander / DPO:** Nikhil Appari (Lead Artist & Data Fiduciary)  
**Emergency Contact:** `nikhilappari2006@gmail.com` • `+91 98491 17467`  
**Atelier Location:** Hyderabad, Telangana, India  
**Last Updated:** October 2026  

---

## 1. Overview & Statutory Mandate

Under **Section 2(u)** of the Digital Personal Data Protection Act (DPDP Act), 2023:
> *"Personal data breach" means any unauthorised processing of personal data or accidental disclosure, acquisition, sharing, use, alteration, destruction of or loss of access to personal data, that compromises the confidentiality, integrity or availability of personal data.*

Under **Section 8(6)** of the DPDP Act, 2023:
> *"In the event of a personal data breach, the Data Fiduciary shall give the Board and each affected Data Principal, intimation of such breach, in such form and manner as may be prescribed."*

**Statutory Time Limit:** Notification to the **Data Protection Board of India (DPBI)** and affected users must occur **within 72 hours** of becoming aware of the breach. Failure to notify or implement reasonable security safeguards carries statutory financial penalties up to **₹200 Crore – ₹250 Crore** under the Schedule to the Act.

---

## 2. Incident Response Workflow & Timelines

```
[HOUR 0 - 6]   → Phase 1: Detection, Verification & Immediate Technical Containment
[HOUR 6 - 24]  → Phase 2: Forensic Impact Assessment & Data Principal Scoping
[HOUR 24 - 48] → Phase 3: Drafting & Submitting Formal Intimation to DPBI (Within 72h max)
[HOUR 48 - 72] → Phase 4: Intimation to Affected Data Principals (Users)
[HOUR 72+]    → Phase 5: Root Cause Analysis (RCA), Permanent Remediation & Audit
```

---

## 3. Phase 1: Detection, Verification & Immediate Containment (0–6 Hours)

1. **Verify Authenticity of Incident:**
   - Confirm whether the event is an actual breach (e.g. compromised database credentials, exposed Cloudinary bucket, unauthorized admin access) or a false alarm.
2. **Immediate Technical Isolation:**
   - **Rotate Secrets Immediately:**
     - In Render/production environment: Immediately regenerate and redeploy `JWT_SECRET`.
     - In Cloudinary: Rotate `CLOUDINARY_API_SECRET` and regenerate unsigned upload preset names if leaked.
     - In PostgreSQL: Rotate database connection string (`DATABASE_URL`).
     - In Google Cloud Console: Review OAuth client activity and rotate client secrets if compromised.
   - **Session Termination:**
     - Invalidate all active user JWT tokens by bumping secret version.
   - **Preserve Digital Evidence:**
     - Take snapshots of server logs, request headers, IP trails, and SQLite/Postgres logs before restarting instances.

---

## 4. Phase 2: Forensic Assessment & Risk Scoping (6–24 Hours)

Quantify the scope of compromise by querying the backend database:
- **Number of affected Data Principals:** Total count of user records, order records, or uploaded photos accessed.
- **Categories of personal data exposed:**
  - Category A: High Risk (Reference photos, facial images of adults/children, customer address/phone).
  - Category B: Moderate Risk (Email addresses, usernames, hashed passwords).
  - Category C: Low Risk (Anonymized order status, non-personal sketch IDs).
- **Determine Exposure Vector:**
  - SQL injection, unauthorized API route, leaked environment variables, compromised third-party processor.

---

## 5. Phase 3: Formal Notice to Data Protection Board of India (DPBI)
*Must be submitted within 72 hours of discovery.*

### DPBI Breach Intimation Form Template

```markdown
FORM OF INTIMATION OF PERSONAL DATA BREACH
(Under Section 8(6) of the Digital Personal Data Protection Act, 2023)

To:
The Data Protection Board of India (DPBI)
New Delhi, India
Email: intimation@dpbi.gov.in / emergency-breach@dpbi.gov.in

1. PARTICULARS OF THE DATA FIDUCIARY:
   a. Name: Aesthetic by Nikhil (Proprietor: Nikhil Appari)
   b. Legal Status: Fine Art Atelier / Sole Proprietorship
   c. Address: Hyderabad, Telangana - 500001, India
   d. Contact Email: nikhilappari2006@gmail.com
   e. Contact Phone: +91 98491 17467
   f. Designated Grievance / Data Protection Officer: Nikhil Appari

2. NATURE AND TIMELINE OF THE PERSONAL DATA BREACH:
   a. Date & Time breach was detected: [YYYY-MM-DD HH:MM IST]
   b. Estimated Date & Time breach occurred: [YYYY-MM-DD HH:MM IST]
   c. Circumstances of discovery: [e.g., Internal security audit / Anomaly in server logs / Third-party disclosure]
   d. Nature of breach: [e.g., Unauthorized acquisition / Accidental exposure / Database credential compromise]

3. SCOPE AND IMPACT OF THE BREACH:
   a. Categories of personal data involved: [e.g., User emails, client shipping addresses, commission reference photos]
   b. Approximate number of Data Principals affected: [e.g., 42 registered clients]
   c. Potential harm or risk to Data Principals: [e.g., Risk of phishing, exposure of private portrait reference photographs]

4. TECHNICAL AND MITIGATING ACTIONS TAKEN:
   a. Containment measures deployed: [e.g., Compromised credentials rotated within 2 hours, sessions terminated, cloud storage permissions restricted]
   b. Third-party processors involved: [e.g., Cloudinary Inc. / Render Cloud Hosting]
   c. Current security status: Breach fully contained; vulnerability patched in build [vX.X].

5. COMMUNICATION TO AFFECTED DATA PRINCIPALS:
   a. Status of intimation: Direct individual communications initiated on [YYYY-MM-DD] via verified registered email.
   b. Mode: Direct email and prominent notification in order tracking dashboard.

6. DECLARATION:
   I, Nikhil Appari, Data Protection Officer for Aesthetic by Nikhil, hereby certify that the information 
   provided above is true and complete to the best of my knowledge.

   Signed: Nikhil Appari
   Date: [YYYY-MM-DD]
   Place: Hyderabad, India
```

---

## 6. Phase 4: Direct Notice to Affected Data Principals (Users)
*Sent without delay to all affected individuals in plain, transparent language.*

### User Notification Email Template

```text
Subject: Important Privacy Notice regarding your Aesthetic by Nikhil account

Dear [Customer Name],

We are writing to inform you of a personal data security incident that may have involved 
some of your information stored with Aesthetic by Nikhil, in transparent compliance with 
Section 8(6) of India's Digital Personal Data Protection Act, 2023.

WHAT HAPPENED:
On [Date], our security audit detected [brief, honest summary: e.g. unauthorized access 
to an encrypted database file / an unintended configuration in our image storage system]. 
Our technical team acted immediately to contain the issue within [X] hours.

WHAT INFORMATION WAS INVOLVED:
According to our forensic review, the data potentially accessed may have included:
- [List specific items, e.g., Your registered username and email address]
- [e.g., Your shipping address and contact telephone number for portrait delivery]
- [e.g., Reference photo uploaded for order #ORD-XXXX]
NOTE: Your payment card/banking details were NEVER involved, as all transactions are 
handled externally through certified secure payment gateways and are never stored on our servers.

WHAT WE HAVE DONE:
- Immediately rotated all server access credentials and cryptographic keys.
- Terminated all active user sessions to prevent unauthorized profile access.
- Reported this incident formally to the Data Protection Board of India (DPBI) as required by law.
- Strengthened our storage encryption and API firewalls.

WHAT YOU SHOULD DO:
1. When you next log in to your account at aesthetic-by-nikhil.vercel.app, please update 
   your password.
2. Be cautious of unsolicited messages or calls from anyone claiming to represent our studio 
   asking for OTPs, passwords, or banking information. We will NEVER ask for your password.

YOUR RIGHTS UNDER THE DPDP ACT 2023:
You have the right to request a complete summary of your records or instruct us to 
permanently delete your uploaded reference photos and account profile at any time. 
You can submit a direct request via our Data Rights Portal:
https://aesthetic-by-nikhil.vercel.app/data-rights

CONTACT OUR GRIEVANCE OFFICER:
If you have any questions or concerns, please contact me directly:
Nikhil Appari
Data Protection & Grievance Redressal Officer
Email: nikhilappari2006@gmail.com
Direct Phone / WhatsApp: +91 98491 17467
Atelier: Hyderabad, Telangana, India

We deeply value your trust and sincerely apologize for any concern this incident may cause.

Warm regards,
Nikhil Appari
Founder & Lead Artist, Aesthetic by Nikhil
```

---

## 7. Phase 5: Post-Incident Review & Remediation (24–168 Hours)

1. **Root Cause Analysis (RCA):**
   - Document the technical flaw, misconfiguration, or external vector that allowed the breach.
2. **Code & Infrastructure Hardening:**
   - Enforce stricter input sanitization, file magic byte checking for uploads, and multi-factor admin access.
3. **Audit Log Archival:**
   - Preserve all breach incident records, timestamps, board correspondences, and user communication logs for **minimum 3 years** to satisfy statutory review by the DPBI.
