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
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

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

/* ======================================================= */

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server is running live on http://localhost:${PORT}`);
});
