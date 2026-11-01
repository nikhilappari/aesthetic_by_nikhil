import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { getDb, initDb } from './db.js';
import { OAuth2Client } from 'google-auth-library';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'art_website_secret_2026_key';

// Transporter for Sending OTP & Security Notifications (Pooled persistent connection)
let mailTransporter = null;
const getMailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  if (!emailUser || !emailPass) return null;

  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { 
        user: emailUser.trim(), 
        pass: emailPass.replace(/\s+/g, '') 
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000
    });
  }
  return mailTransporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  // Option A: Free Resend HTTP API (Port 443 - Never blocked on Render)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Aesthetic by Nikhil <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text
        })
      });
      if (res.ok) {
        console.log(`[RESEND API EMAIL SENT] Dispatched to: ${to}`);
        return { sent: true };
      }
    } catch (e) {
      console.error('[RESEND API ERROR]', e.message);
    }
  }

  // Option B: Free Brevo HTTP API (Port 443 - Never blocked on Render)
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Aesthetic by Nikhil', email: process.env.EMAIL_USER || 'nikhilappari2006@gmail.com' },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text
        })
      });
      if (res.ok) {
        console.log(`[BREVO API EMAIL SENT] Dispatched to: ${to}`);
        return { sent: true };
      }
    } catch (e) {
      console.error('[BREVO API ERROR]', e.message);
    }
  }

  const transporter = getMailTransporter();
  const emailUser = process.env.EMAIL_USER;

  if (transporter && emailUser) {
    try {
      await transporter.sendMail({
        from: `"Aesthetic by Nikhil" <${emailUser.trim()}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`[EMAIL SENT] Successfully dispatched to: ${to}`);
      return { sent: true };
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send via SMTP:', err.message);
      mailTransporter = null; // Reset on failure
      return { sent: false, error: err.message };
    }
  } else {
    console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    return { sent: false, simulated: true };
  }
};

// Initialize Cloudinary if credentials exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("Cloudinary Node SDK configured successfully.");
} else {
  console.log("Cloudinary credentials incomplete in .env. Falling back to local disk storage uploads.");
}

// Ensure local uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Enable CORS and parse JSON (using 50MB payload limits for handling direct Base64 if needed)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local static uploaded files
app.use('/uploads', express.static(uploadDir));

// Initialize SQLite database
initDb().then(() => {
  console.log("SQLite database initialized and seeded.");
}).catch(err => {
  console.error("Failed to initialize database:", err);
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired access token.' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator role required.' });
  }
  next();
};

/* ==================== API ENDPOINTS ==================== */

// 1. File Upload Endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    if (isCloudinaryConfigured) {
      // Upload local file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'art_website'
      });
      // Delete temporary local file
      fs.unlinkSync(req.file.path);
      return res.json({ secure_url: result.secure_url });
    } else {
      // Fallback: serve from local public uploads folder
      const localUrl = `/uploads/${req.file.filename}`;
      return res.json({ secure_url: localUrl });
    }
  } catch (error) {
    console.error('Upload endpoint failed:', error);
    return res.status(500).json({ message: 'Image upload failed.', error: error.message });
  }
});

// 2. Authentication API
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const db = await getDb();
    const userExists = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')",
      [username, passwordHash]
    );

    const newUser = { id: result.lastID, username, role: 'user' };
    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Signup failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const db = await getDb();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username.trim()]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    // Direct Login for both Admin and Customers (No OTP step)
    const now = new Date().toISOString();
    try {
      await db.run("UPDATE users SET last_login = ? WHERE id = ?", [now, user.id]);
    } catch (e) {}

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  return res.json({ user: req.user });
});


// Verify Admin 2FA OTP Code
app.post('/api/auth/verify-admin-otp', async (req, res) => {
  const { tempToken, otp } = req.body;
  if (!tempToken || !otp) {
    return res.status(400).json({ message: 'Temporary token and 6-digit OTP code are required.' });
  }

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded || !decoded.isPendingOtp || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Invalid or expired OTP session. Please log in again.' });
    }

    const db = await getDb();
    const record = await db.get(
      "SELECT * FROM otp_verifications WHERE identifier = ? AND otp_code = ? AND purpose = 'admin_login' AND used = 0 ORDER BY id DESC LIMIT 1",
      [decoded.username, otp.trim()]
    );

    if (!record) {
      return res.status(400).json({ message: 'Incorrect OTP verification code.' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
    }

    // Mark OTP as consumed
    await db.run("UPDATE otp_verifications SET used = 1 WHERE id = ?", [record.id]);

    const now = new Date().toISOString();
    try {
      await db.run("UPDATE users SET last_login = ? WHERE id = ?", [now, decoded.id]);
    } catch (e) {}

    // Issue full session token
    const fullPayload = { id: decoded.id, username: decoded.username, role: 'admin' };
    const token = jwt.sign(fullPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      user: fullPayload,
      token
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(403).json({ message: 'OTP session expired or invalid. Please re-enter your password.' });
  }
});

// Resend Admin OTP Code
app.post('/api/auth/resend-admin-otp', async (req, res) => {
  const { tempToken } = req.body;
  if (!tempToken) {
    return res.status(400).json({ message: 'Session token required.' });
  }

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded || !decoded.isPendingOtp || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Invalid OTP session.' });
    }

    const db = await getDb();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO otp_verifications (identifier, otp_code, purpose, expires_at, used, created_at) VALUES (?, ?, 'admin_login', ?, 0, ?)",
      [decoded.username, otp, expiresAt, now]
    );

    const adminEmail = process.env.ADMIN_EMAIL || 'nikhilappari2006@gmail.com';
    await sendEmail({
      to: adminEmail,
      subject: `Your New Admin Security OTP: ${otp}`,
      text: `Your new Admin Authentication Code is ${otp}.`
    });

    return res.json({
      success: true,
      message: `A new verification code has been dispatched to ${adminEmail}.`,
    });
  } catch (error) {
    return res.status(403).json({ message: 'Session expired. Please log in again.' });
  }
});

// Forgot Password: Send 6-Digit Reset Code (Users & Admin)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ message: 'Please provide your registered username or email.' });
  }

  const cleanId = identifier.trim();

  try {
    const db = await getDb();
    const user = await db.get(
      "SELECT * FROM users WHERE username = ? OR username = ? OR (role = 'admin' AND ? LIKE '%nikhil%')",
      [cleanId, cleanId.toLowerCase(), cleanId.toLowerCase()]
    );

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with that username or email.' });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO otp_verifications (identifier, otp_code, purpose, expires_at, used, created_at) VALUES (?, ?, 'password_reset', ?, 0, ?)",
      [user.username, resetOtp, expiresAt, now]
    );

        // Target email resolution
    let targetEmail = user.username.includes('@') ? user.username : 'nikhilappari2006@gmail.com';
    if (user.role === 'admin') {
      targetEmail = 'nikhilappari2006@gmail.com';
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPass) {
      return res.status(503).json({
        message: 'Email delivery is not configured on the server yet. Please add EMAIL_USER and EMAIL_PASS (Gmail App Password) in your Render dashboard environment variables.'
      });
    }

    // Fire email immediately through warm pooled connection
    sendEmail({
      to: targetEmail,
      subject: `Your Password Reset Code: ${resetOtp} • Aesthetic by Nikhil`,
      text: `Your password reset code is ${resetOtp}. It expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #0f1216; color: #f8fafc;">
          <h2 style="color: #d4af37; margin-top: 0; font-family: serif;">Password Reset Request</h2>
          <p style="font-size: 15px; color: #cbd5e1;">A password reset was requested for your <strong>${user.username}</strong> account.</p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #d4af37; background: rgba(212, 175, 55, 0.12); border: 1px dashed #d4af37; padding: 12px 24px; border-radius: 8px; font-family: monospace;">
              ${resetOtp}
            </span>
          </div>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Enter this 6-digit code on the reset screen to create a new password. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    }).catch(err => console.error('[ASYNC SEND EMAIL ERROR]', err));

    console.log(`[PASSWORD RESET CODE] For ${user.username}: ${resetOtp} -> ${targetEmail}`);

    // Respond immediately so user interface switches to Step 2 in under 100ms
    return res.json({
      success: true,
      username: user.username,
      message: `Reset verification code has been dispatched to ${targetEmail}.`,
      emailHint: targetEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Failed to process password reset request.' });
  }
});

// Step 2: Verify Reset Code independently
app.post('/api/auth/verify-reset-code', async (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) {
    return res.status(400).json({ message: 'Username and 6-digit verification code are required.' });
  }

  try {
    const db = await getDb();
    const user = await db.get(
      "SELECT * FROM users WHERE username = ? OR username = ? OR (role = 'admin' AND ? LIKE '%nikhil%')",
      [username.trim(), username.trim().toLowerCase(), username.trim().toLowerCase()]
    );

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const record = await db.get(
      "SELECT * FROM otp_verifications WHERE identifier = ? AND otp_code = ? AND purpose = 'password_reset' AND used = 0 ORDER BY id DESC LIMIT 1",
      [user.username, otp.trim()]
    );

    if (!record) {
      return res.status(400).json({ message: 'Incorrect verification code. Please check your email and try again.' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: 'This reset code has expired. Please request a new code.' });
    }

    // Generate a temporary reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { username: user.username, otpRecordId: record.id, purpose: 'password_reset_verified' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({
      success: true,
      message: 'Code verified successfully! You can now set your new password.',
      resetToken,
      username: user.username
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    return res.status(500).json({ message: 'Failed to verify reset code.' });
  }
});

// Step 3: Set New Password after verification
app.post('/api/auth/reset-password', async (req, res) => {
  const { username, otp, newPassword } = req.body;
  if (!username || !otp || !newPassword) {
    return res.status(400).json({ message: 'Username, 6-digit reset code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    const db = await getDb();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username.trim()]);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const record = await db.get(
      "SELECT * FROM otp_verifications WHERE identifier = ? AND otp_code = ? AND purpose = 'password_reset' AND used = 0 ORDER BY id DESC LIMIT 1",
      [user.username, otp.trim()]
    );

    if (!record) {
      return res.status(400).json({ message: 'Invalid or incorrect reset verification code.' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: 'This reset code has expired. Please request a fresh code.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id]);
    await db.run("UPDATE otp_verifications SET used = 1 WHERE id = ?", [record.id]);

    return res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
});

// Google Auth Client ID endpoint
app.get('/api/auth/google/client-id', (req, res) => {
  return res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '655065657609-4p51158vudfvmdq2vki69vurkoqj457q.apps.googleusercontent.com' });
});

// Google Sign-In verification endpoint
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Google credential token is required.' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || '655065657609-4p51158vudfvmdq2vki69vurkoqj457q.apps.googleusercontent.com';
  if (!clientId) {
    return res.status(500).json({ message: 'Google Authentication is not configured on this server.' });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });
    const payload = ticket.getPayload();
    const { sub, email } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account must have an associated email.' });
    }

    const db = await getDb();
    
    // Check if user already exists by google_id
    let user = await db.get("SELECT * FROM users WHERE google_id = ?", [sub]);
    
    if (!user) {
      // Check if user already exists by username (email)
      user = await db.get("SELECT * FROM users WHERE username = ?", [email]);
      
      if (user) {
        // Link google_id to existing account
        await db.run("UPDATE users SET google_id = ? WHERE id = ?", [sub, user.id]);
        user.google_id = sub;
      } else {
        // Create a new user with Google identity
        const result = await db.run(
          "INSERT INTO users (username, password_hash, role, google_id) VALUES (?, NULL, 'user', ?)",
          [email, sub]
        );
        user = {
          id: result.lastID,
          username: email,
          role: 'user',
          google_id: sub
        };
      }
    }

    const tokenPayload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token
    });
  } catch (error) {
    console.error('Google verification failed:', error);
    return res.status(401).json({ message: 'Invalid Google credential token.', error: error.message });
  }
});

// 3. Artworks API
app.get('/api/artworks', async (req, res) => {
  try {
    const db = await getDb();
    const list = await db.all("SELECT * FROM artworks ORDER BY id DESC");
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch sketches.' });
  }
});

app.post('/api/artworks', authenticateToken, requireAdmin, async (req, res) => {
  const { title, type, category, price, image, description, status, size, orientation } = req.body;
  if (!title || !type || !category || price === undefined || !image) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }

  const parsedPrice = parseInt(price);
  if (isNaN(parsedPrice)) {
    return res.status(400).json({ message: 'Price must be a valid number.' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      "INSERT INTO artworks (title, type, category, price, image, description, status, size, orientation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title, 
        type, 
        category, 
        parsedPrice, 
        image, 
        description || '', 
        status || 'Published',
        size || 'A4',
        orientation || 'Vertical'
      ]
    );
    const newArt = { 
      id: result.lastID, 
      title, 
      type, 
      category, 
      price: parsedPrice, 
      image, 
      description, 
      status: status || 'Published',
      size: size || 'A4',
      orientation: orientation || 'Vertical'
    };
    return res.status(201).json(newArt);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create artwork.' });
  }
});

app.put('/api/artworks/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, type, category, price, image, description, status, size, orientation } = req.body;

  try {
    const db = await getDb();
    const existing = await db.get("SELECT * FROM artworks WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }

    let parsedPrice = existing.price;
    if (price !== undefined) {
      parsedPrice = parseInt(price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ message: 'Price must be a valid number.' });
      }
    }

    await db.run(
      `UPDATE artworks 
       SET title = ?, type = ?, category = ?, price = ?, image = ?, description = ?, status = ?, size = ?, orientation = ? 
       WHERE id = ?`,
      [
        title !== undefined ? title : existing.title,
        type !== undefined ? type : existing.type,
        category !== undefined ? category : existing.category,
        parsedPrice,
        image !== undefined ? image : existing.image,
        description !== undefined ? description : existing.description,
        status !== undefined ? status : existing.status,
        size !== undefined ? size : existing.size,
        orientation !== undefined ? orientation : existing.orientation,
        id
      ]
    );

    const updated = await db.get("SELECT * FROM artworks WHERE id = ?", [id]);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update artwork.' });
  }
});

app.delete('/api/artworks/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const existing = await db.get("SELECT * FROM artworks WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }
    await db.run("DELETE FROM artworks WHERE id = ?", [id]);
    return res.json({ message: 'Artwork deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete artwork.' });
  }
});

// 4. Transformation API
app.get('/api/transformation', async (req, res) => {
  try {
    const db = await getDb();
    const trans = await db.get("SELECT * FROM transformation WHERE id = 1");
    return res.json(trans || {});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch transformation settings.' });
  }
});

app.put('/api/transformation', authenticateToken, requireAdmin, async (req, res) => {
  const { before, after, title, subtitle } = req.body;
  try {
    const db = await getDb();
    await db.run(
      `UPDATE transformation 
       SET before = ?, after = ?, title = ?, subtitle = ? 
       WHERE id = 1`,
      [before || '', after || '', title || '', subtitle || '']
    );
    const updated = await db.get("SELECT * FROM transformation WHERE id = 1");
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to save transformation settings.' });
  }
});

// 5. Pricing Settings API
app.get('/api/pricing', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM pricing");
    const pricingObj = {};
    rows.forEach(r => {
      pricingObj[r.key] = r.value;
    });
    return res.json(pricingObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch pricing Settings.' });
  }
});

app.put('/api/pricing', authenticateToken, requireAdmin, async (req, res) => {
  const pricingData = req.body; // Key-value object
  try {
    const db = await getDb();
    for (const [key, value] of Object.entries(pricingData)) {
      await db.run(
        "INSERT INTO pricing (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [key, String(value)]
      );
    }
    
    // Fetch and return the updated state
    const rows = await db.all("SELECT * FROM pricing");
    const pricingObj = {};
    rows.forEach(r => {
      pricingObj[r.key] = r.value;
    });
    return res.json(pricingObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to save pricing configurations.' });
  }
});

// 6. Client Requests / Orders API
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    let requests;
    if (req.user.role === 'admin') {
      requests = await db.all("SELECT * FROM client_requests ORDER BY date DESC");
    } else {
      requests = await db.all("SELECT * FROM client_requests WHERE name = ? ORDER BY date DESC", [req.user.username]);
    }
    
    // Parse JSON stringified images and messages lists
    const parsedRequests = requests.map(r => ({
      ...r,
      images: JSON.parse(r.images || '[]'),
      messages: JSON.parse(r.messages || '[]')
    }));

    return res.json(parsedRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch client requests.' });
  }
});

app.post('/api/requests', authenticateToken, async (req, res) => {
  const { type, image, images, price, frame } = req.body;
  if (!type || !image || !images) {
    return res.status(400).json({ message: 'Commission type and images are required.' });
  }

  const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = new Date().toISOString().split('T')[0];

  let parsedPrice = 0;
  if (price !== undefined && price !== null) {
    const temp = parseInt(price);
    if (!isNaN(temp)) {
      parsedPrice = temp;
    }
  }

  try {
    const db = await getDb();
    await db.run(
      `INSERT INTO client_requests (id, name, type, image, images, price, frame, status, date, messages) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [
        id,
        req.user.username,
        type,
        image,
        JSON.stringify(images),
        parsedPrice,
        frame || 'Without Frame',
        date,
        JSON.stringify([])
      ]
    );

    const created = await db.get("SELECT * FROM client_requests WHERE id = ?", [id]);
    created.images = JSON.parse(created.images || '[]');
    created.messages = JSON.parse(created.messages || '[]');
    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to log your custom commission request.' });
  }
});

app.put('/api/requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, price, frame, customerApproval, adminNote, messages } = req.body;

  try {
    const db = await getDb();
    const existing = await db.get("SELECT * FROM client_requests WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Request order not found.' });
    }

    let parsedPrice = existing.price;
    if (price !== undefined) {
      parsedPrice = parseInt(price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ message: 'Price must be a valid number.' });
      }
    }

    // Role-based editing restriction
    if (req.user.role === 'admin') {
      await db.run(
        `UPDATE client_requests 
         SET status = ?, price = ?, frame = ?, customerApproval = ?, adminNote = ?, messages = ? 
         WHERE id = ?`,
        [
          status !== undefined ? status : existing.status,
          parsedPrice,
          frame !== undefined ? frame : existing.frame,
          customerApproval !== undefined ? customerApproval : existing.customerApproval,
          adminNote !== undefined ? adminNote : existing.adminNote,
          messages !== undefined ? JSON.stringify(messages) : existing.messages,
          id
        ]
      );
    } else {
      // Customers can only approve or decline quotes and add messages
      if (existing.name !== req.user.username) {
        return res.status(403).json({ message: 'Unauthorized access to this order.' });
      }
      await db.run(
        `UPDATE client_requests 
         SET customerApproval = ?, status = ?, adminNote = ?, messages = ? 
         WHERE id = ?`,
        [
          customerApproval !== undefined ? customerApproval : existing.customerApproval,
          status !== undefined ? status : existing.status,
          adminNote !== undefined ? adminNote : existing.adminNote,
          messages !== undefined ? JSON.stringify(messages) : existing.messages,
          id
        ]
      );
    }

    const updated = await db.get("SELECT * FROM client_requests WHERE id = ?", [id]);
    updated.images = JSON.parse(updated.images || '[]');
    updated.messages = JSON.parse(updated.messages || '[]');
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update order details.' });
  }
});

/* ==================== DPDP ACT (INDIA) 2023 COMPLIANCE APIS ==================== */

// 7. Consent Audit Trail API (Section 6 DPDP Act 2023)
app.post('/api/consent', async (req, res) => {
  const { identifier, purpose, consented, notice_version } = req.body;
  if (!identifier || !purpose) {
    return res.status(400).json({ message: 'Identifier (email/username) and purpose are required.' });
  }

  // Extract client IP and User Agent for consent proof
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();
  const consentFlag = consented !== false ? 1 : 0;
  const version = notice_version || '2026.1-DPDP';

  let userId = null;
  // Optional auth token check to link user_id if logged in
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded?.id || null;
    } catch (e) {
      // Unauthenticated consent (e.g. initial registration) is still valid
    }
  }

  try {
    const db = await getDb();
    await db.run(
      `INSERT INTO consent_records (user_id, identifier, purpose, consented, notice_version, ip_address, user_agent, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, identifier, purpose, consentFlag, version, ip, userAgent, timestamp]
    );

    return res.status(201).json({
      success: true,
      message: 'Consent recorded successfully in compliance with DPDP Act Section 6.',
      recordedAt: timestamp
    });
  } catch (error) {
    console.error('Consent recording error:', error);
    return res.status(500).json({ message: 'Failed to record consent record.' });
  }
});

// Get user consent history
app.get('/api/consent/my', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const records = await db.all(
      "SELECT id, purpose, consented, notice_version, timestamp FROM consent_records WHERE identifier = ? OR user_id = ? ORDER BY timestamp DESC",
      [req.user.username, req.user.id]
    );
    return res.json(records);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch consent records.' });
  }
});

// 8. Data Principal Rights Request API (Sections 11, 12, 13 DPDP Act 2023)
app.post('/api/data-rights', async (req, res) => {
  const { name, email, request_type, details } = req.body;
  if (!name || !email || !request_type || !details) {
    return res.status(400).json({ message: 'Name, email, request type, and details are required.' });
  }

  const validTypes = ['access', 'correction', 'erasure', 'withdrawal', 'grievance'];
  if (!validTypes.includes(request_type.toLowerCase())) {
    return res.status(400).json({ 
      message: `Invalid request type. Must be one of: ${validTypes.join(', ')}` 
    });
  }

  const id = `DRR-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  let userId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded?.id || null;
    } catch (e) {}
  }

  try {
    const db = await getDb();
    await db.run(
      `INSERT INTO data_rights_requests (id, user_id, name, email, request_type, details, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [id, userId, name.trim(), email.trim().toLowerCase(), request_type.toLowerCase(), details.trim(), now, now]
    );

    return res.status(201).json({
      success: true,
      trackingId: id,
      message: 'Your Data Principal Rights request has been registered under the DPDP Act 2023.',
      statutoryTimeline: '30 calendar days for resolution. Grievance officer acknowledgement within 48 hours.',
      grievanceOfficer: {
        name: 'Nikhil Appari',
        email: 'nikhilappari2006@gmail.com',
        phone: '+91 98491 17467'
      }
    });
  } catch (error) {
    console.error('Data rights request error:', error);
    return res.status(500).json({ message: 'Failed to register Data Principal Rights request.' });
  }
});

// Admin: View all Data Principal Rights Requests
app.get('/api/data-rights', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const requests = await db.all("SELECT * FROM data_rights_requests ORDER BY created_at DESC");
    return res.json(requests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch data rights requests.' });
  }
});

// Admin: Update status of a Data Principal Rights Request
app.put('/api/data-rights/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;
  const now = new Date().toISOString();

  try {
    const db = await getDb();
    const existing = await db.get("SELECT * FROM data_rights_requests WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await db.run(
      "UPDATE data_rights_requests SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?",
      [status || existing.status, admin_notes !== undefined ? admin_notes : existing.admin_notes, now, id]
    );

    const updated = await db.get("SELECT * FROM data_rights_requests WHERE id = ?", [id]);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update request.' });
  }
});


/* ==================== VISITOR ANALYTICS & CUSTOMER MANAGEMENT ==================== */

// Record a site visit (called on page load)
app.post('/api/analytics/visit', async (req, res) => {
  const { visitorId, path, referrer } = req.body;
  if (!visitorId) {
    return res.status(400).json({ message: 'visitorId required' });
  }

  const userAgent = req.headers['user-agent'] || 'unknown';
  const cleanReferrer = referrer || req.headers['referer'] || 'direct';
  const now = new Date().toISOString();

  try {
    const db = await getDb();
    await db.run(
      "INSERT INTO site_visits (visitor_id, path, referrer, user_agent, created_at) VALUES (?, ?, ?, ?, ?)",
      [visitorId, path || '/', cleanReferrer, userAgent, now]
    );
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Analytics visit error:', error);
    return res.status(500).json({ message: 'Failed to record visit' });
  }
});

// Admin: Get visitor analytics statistics
app.get('/api/analytics/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];

    const totalRow = await db.get("SELECT COUNT(*) as count FROM site_visits");
    const uniqueRow = await db.get("SELECT COUNT(DISTINCT visitor_id) as count FROM site_visits");
    const todayRow = await db.get("SELECT COUNT(*) as count FROM site_visits WHERE created_at LIKE ?", [`${today}%`]);
    const todayUniqueRow = await db.get("SELECT COUNT(DISTINCT visitor_id) as count FROM site_visits WHERE created_at LIKE ?", [`${today}%`]);

    // Top referral sources (e.g. WhatsApp, Instagram, Direct)
    const referrers = await db.all(
      "SELECT referrer, COUNT(*) as count FROM site_visits GROUP BY referrer ORDER BY count DESC LIMIT 5"
    );

    const recentVisits = await db.all(
      "SELECT id, visitor_id, path, referrer, created_at FROM site_visits ORDER BY created_at DESC LIMIT 15"
    );

    return res.json({
      totalVisits: totalRow?.count || 0,
      uniqueVisitors: uniqueRow?.count || 0,
      todayVisits: todayRow?.count || 0,
      todayUnique: todayUniqueRow?.count || 0,
      referrers: referrers || [],
      recentVisits: recentVisits || []
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Admin: Get all registered customers and login/order stats
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.all(
      `SELECT u.id, u.username, u.role, u.google_id, u.created_at, u.last_login,
              (SELECT COUNT(*) FROM client_requests WHERE name = u.username) as order_count
       FROM users u
       ORDER BY u.id DESC`
    );

    const today = new Date().toISOString().split('T')[0];
    const totalUsers = users.length;
    const googleUsers = users.filter(u => u.google_id).length;
    const directUsers = users.filter(u => !u.google_id && u.role !== 'admin').length;
    const activeToday = users.filter(u => u.last_login && u.last_login.startsWith(today)).length;

    return res.json({
      stats: {
        totalUsers,
        googleUsers,
        directUsers,
        activeToday
      },
      users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ message: 'Failed to fetch customer directory' });
  }
});

/* ======================================================= */


// Diagnostic Email Endpoint to inspect Render SMTP live status
app.get('/api/diagnostic/email', async (req, res) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  const results = {};

  const portsToTest = [
    { name: 'port_465_ssl', host: 'smtp.gmail.com', port: 465, secure: true },
    { name: 'port_587_tls', host: 'smtp.gmail.com', port: 587, secure: false },
    { name: 'port_25_plain', host: 'smtp.gmail.com', port: 25, secure: false }
  ];

  for (const p of portsToTest) {
    try {
      const transporter = nodemailer.createTransport({
        host: p.host,
        port: p.port,
        secure: p.secure,
        auth: { user: emailUser.trim(), pass: emailPass.replace(/\s+/g, '') },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 5000
      });
      await transporter.verify();
      results[p.name] = 'VERIFIED_SUCCESS';
    } catch (err) {
      results[p.name] = err.message + ' (' + (err.code || 'NO_CODE') + ')';
    }
  }

  return res.json({
    emailUser: emailUser ? emailUser.trim().replace(/(.{2})(.*)(@.*)/, "$1***$3") : null,
    hasPass: !!emailPass,
    results
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server is running live on http://localhost:${PORT}`);
});
