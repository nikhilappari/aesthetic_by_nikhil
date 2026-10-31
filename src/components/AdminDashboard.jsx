import React, { useState, useEffect, useRef } from 'react';
import './AdminDashboard.css';
import { uploadToCloudinary } from '../utils/cloudinary';
import { api } from '../utils/api';

const AdminDashboard = ({ artworks, setArtworks, transformation, setTransformation, saveTransformation, pricing, setPricing, savePricing, clientRequests = [], updateRequest, reloadRequests, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [adminTypedMessage, setAdminTypedMessage] = useState('');
  const adminChatMessagesRef = useRef(null);

  // Auto-scroll admin chat to bottom
  useEffect(() => {
    if (adminChatMessagesRef.current) {
      const container = adminChatMessagesRef.current;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }, [selectedRequest?.messages]);

  const handleAdminSendMessage = (e) => {
    e.preventDefault();
    if (!adminTypedMessage.trim() || !selectedRequest) return;

    const newMessage = {
      sender: user ? user.username : 'Artist',
      text: adminTypedMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedRequest = {
      ...selectedRequest,
      messages: [...(selectedRequest.messages || []), newMessage]
    };

    setSelectedRequest(updatedRequest);
    if (updateRequest) {
      updateRequest(updatedRequest);
    }
    setAdminTypedMessage('');
  };

  // Sync selectedRequest with background changes from polling
  useEffect(() => {
    if (selectedRequest) {
      const updated = clientRequests.find(r => r.id === selectedRequest.id);
      if (updated && JSON.stringify(updated.messages) !== JSON.stringify(selectedRequest.messages)) {
        setSelectedRequest(updated);
      }
    }
  }, [clientRequests, selectedRequest]);

  // Cloudinary upload loading states
  // Visitor Analytics & Customer Directory States
  const [visitorStats, setVisitorStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    todayUnique: 0,
    referrers: [],
    recentVisits: []
  });

  const [customerData, setCustomerData] = useState({
    stats: {
      totalUsers: 0,
      googleUsers: 0,
      directUsers: 0,
      activeToday: 0
    },
    users: []
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');

  const loadAnalyticsAndUsers = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.allSettled([
        api.getAnalyticsStats(),
        api.getAdminUsers()
      ]);
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setVisitorStats(analyticsRes.value);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value) {
        setCustomerData(usersRes.value);
      }
    } catch (err) {
      console.warn("Could not load analytics/users:", err);
    }
  };

  useEffect(() => {
    loadAnalyticsAndUsers();
  }, [activeTab]);

  const isUserActiveRecently = (lastLogin) => {
    if (!lastLogin) return false;
    const diffHours = (new Date() - new Date(lastLogin)) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const filteredCustomers = (customerData.users || []).filter(cust => {
    const matchesSearch = !customerSearch.trim() || 
      cust.username.toLowerCase().includes(customerSearch.trim().toLowerCase());
    
    if (!matchesSearch) return false;

    if (customerFilter === 'google') return Boolean(cust.google_id);
    if (customerFilter === 'direct') return !cust.google_id && cust.role !== 'admin';
    if (customerFilter === 'active') return isUserActiveRecently(cust.last_login);
    return true;
  });

  const [isUploadingSketch, setIsUploadingSketch] = useState(false);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);

  // For the admin table, we'll treat all artworks as 'Published' by default if they don't have a status
  const galleryItems = artworks.map(item => ({
    ...item,
    status: item.status || 'Published'
  }));

  const [newSketch, setNewSketch] = useState({
    title: '',
    category: 'Charcoal',
    price: '',
    status: 'Published',
    image: '',
    description: '',
    type: 'Black & White', // Mapping status to type for the gallery
    size: 'A4',
    orientation: 'Vertical'
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this sketch?")) {
      setArtworks(prev => prev.filter(item => item.id !== id));
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setNewSketch(item);
    setShowUploadModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploadingSketch(true);
      try {
        let url;
        if (pricing?.cloudinaryCloudName && pricing?.cloudinaryUploadPreset) {
          url = await uploadToCloudinary(file, pricing.cloudinaryCloudName, pricing.cloudinaryUploadPreset);
        } else {
          const res = await api.uploadFile(file);
          url = res.secure_url;
        }
        setNewSketch(prev => ({ ...prev, image: url }));
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Upload Failed: ${error.message}`);
      } finally {
        setIsUploadingSketch(false);
      }
    }
  };

  const handleTransformationChange = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const setUploading = type === 'before' ? setIsUploadingBefore : setIsUploadingAfter;
      setUploading(true);
      try {
        let url;
        if (pricing?.cloudinaryCloudName && pricing?.cloudinaryUploadPreset) {
          url = await uploadToCloudinary(file, pricing.cloudinaryCloudName, pricing.cloudinaryUploadPreset);
        } else {
          const res = await api.uploadFile(file);
          url = res.secure_url;
        }
        setTransformation(prev => ({ ...prev, [type]: url }));
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Upload Failed: ${error.message}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSketch.image) {
      alert("Please upload an image for the sketch.");
      return;
    }
    const type = newSketch.category.toLowerCase().includes('color') ? 'Color' : 'Black & White';
    const sketchWithMeta = { ...newSketch, type };

    if (editingItem) {
      setArtworks(prev => prev.map(item => item.id === editingItem.id ? { ...sketchWithMeta, id: item.id } : item));
    } else {
      setArtworks(prev => {
        const id = prev.length > 0 ? Math.max(...prev.map(a => a.id)) + 1 : 1;
        return [...prev, { ...sketchWithMeta, id }];
      });
    }
    closeModal();
    alert(editingItem ? "Sketch updated successfully!" : "Sketch uploaded successfully!");
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setEditingItem(null);
    setNewSketch({ title: '', category: 'Charcoal', price: '', status: 'Published', image: '', description: '', type: 'Black & White', size: 'A4', orientation: 'Vertical' });
  };

  const liveNewRequests = clientRequests.filter(r => r.status === 'Pending' || r.status === 'Accepted').length;
  const liveInProgress = clientRequests.filter(r => r.status === 'In Progress').length;
  const liveCompleted = clientRequests.filter(r => r.status === 'Completed').length;
  const liveRevenue = clientRequests
    .filter(r => r.status === 'Completed')
    .reduce((sum, r) => sum + (r.price || 0), 0);

  const stats = [
    { label: "New Requests", value: liveNewRequests, icon: "📥" },
    { label: "In Progress", value: liveInProgress, icon: "🎨" },
    { label: "Completed", value: liveCompleted, icon: "✅" },
    { label: "Revenue (MTD)", value: `₹${liveRevenue.toLocaleString('en-IN')}`, icon: "💰" }
  ];

  const allRequests = clientRequests || [];

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if ((tabName === 'requests' || tabName === 'overview') && reloadRequests) {
      reloadRequests();
    }
    if (tabName === 'overview' || tabName === 'customers') {
      loadAnalyticsAndUsers();
    }
  };

  return (
    <section className="admin-section">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3 className="serif">Artist Console</h3>
          <p>Welcome, Nikhil</p>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>Overview</button>
          <button className={`admin-nav-item ${activeTab === 'sketches' ? 'active' : ''}`} onClick={() => handleTabChange('sketches')}>Manage Sketches</button>
          <button className={`admin-nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => handleTabChange('requests')}>
            Client Requests
            {liveNewRequests > 0 && <span className="nav-badge-count">{liveNewRequests}</span>}
          </button>
          <button className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => handleTabChange('customers')}>
            Customer Accounts
            {customerData.stats.totalUsers > 0 && (
              <span className="nav-badge-count" style={{ background: '#22c55e' }}>{customerData.stats.totalUsers}</span>
            )}
          </button>
          <button className={`admin-nav-item ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => handleTabChange('pricing')}>Pricing & Settings</button>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="btn-logout">Logout</button>
        </div>
      </div>

      <div className="admin-main">
        {activeTab === 'overview' && (
          <div className="admin-tab-content">
            <h2 className="admin-page-title">Dashboard Overview</h2>
            <div className="admin-stats-grid">
              {stats.map(stat => (
                <div key={stat.label} className="admin-stat-card glass">
                  <span className="stat-icon">{stat.icon}</span>
                  <div className="stat-info">
                    <p className="stat-label">{stat.label}</p>
                    <h3 className="stat-value">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Website Visitors & WhatsApp Traffic Card */}
            <div className="traffic-analytics-box glass mt-2">
              <div className="traffic-header">
                <h3 className="traffic-title">
                  <span>👁️</span> Live Website Visitors & WhatsApp Traffic
                </h3>
                <button type="button" className="btn-secondary-small" onClick={loadAnalyticsAndUsers} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                  ↻ Refresh Live Counts
                </button>
              </div>

              <div className="admin-stats-grid">
                <div className="admin-stat-card glass" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
                  <span className="stat-icon">👁️</span>
                  <div className="stat-info">
                    <p className="stat-label">Total Site Visits</p>
                    <h3 className="stat-value">{visitorStats.totalVisits || 0}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All website page views</span>
                  </div>
                </div>

                <div className="admin-stat-card glass" style={{ borderLeft: '3px solid #60a5fa' }}>
                  <span className="stat-icon">👥</span>
                  <div className="stat-info">
                    <p className="stat-label">Unique People Visited</p>
                    <h3 className="stat-value" style={{ color: '#60a5fa' }}>{visitorStats.uniqueVisitors || 0}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distinct contacts/devices</span>
                  </div>
                </div>

                <div className="admin-stat-card glass" style={{ borderLeft: '3px solid #22c55e' }}>
                  <span className="stat-icon">📅</span>
                  <div className="stat-info">
                    <p className="stat-label">Visits Today</p>
                    <h3 className="stat-value" style={{ color: '#22c55e' }}>{visitorStats.todayVisits || 0}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({visitorStats.todayUnique || 0} unique today)</span>
                  </div>
                </div>

                <div className="admin-stat-card glass" style={{ borderLeft: '3px solid #c084fc' }}>
                  <span className="stat-icon">🔐</span>
                  <div className="stat-info">
                    <p className="stat-label">Registered Customers</p>
                    <h3 className="stat-value" style={{ color: '#c084fc' }}>{customerData.stats.totalUsers || 0}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{customerData.stats.activeToday || 0} logged in today</span>
                  </div>
                </div>
              </div>

              <div className="referral-grid">
                <div className="referral-card">
                  <span className="referral-icon">📱</span>
                  <div className="referral-info">
                    <p>WhatsApp / Status Link Clicks</p>
                    <h4>
                      {(visitorStats.referrers || []).filter(r => r.referrer && r.referrer.toLowerCase().includes('whatsapp')).reduce((acc, curr) => acc + curr.count, 0) || visitorStats.todayVisits || 0} visits
                    </h4>
                  </div>
                </div>
                <div className="referral-card">
                  <span className="referral-icon">🌐</span>
                  <div className="referral-info">
                    <p>Google OAuth Customers</p>
                    <h4>{customerData.stats.googleUsers || 0} accounts</h4>
                  </div>
                </div>
                <div className="referral-card">
                  <span className="referral-icon">🔑</span>
                  <div className="referral-info">
                    <p>Direct Email Accounts</p>
                    <h4>{customerData.stats.directUsers || 0} accounts</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card glass mt-2">
              <h4 className="card-header">Recent Activity</h4>
              <div className="activity-list">
                {clientRequests.length > 0 ? (
                  [...clientRequests]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 3)
                    .map(act => (
                      <div key={act.id} className="activity-item">
                        <div className={`activity-dot ${act.status.toLowerCase().replace(' ', '-')}`}></div>
                        <p>
                          Order <strong>#{act.id}</strong> from <strong>{act.name}</strong> is <strong>{act.status}</strong>.
                          {act.customerApproval && ` (Customer: ${act.customerApproval})`}
                        </p>
                        <span className="activity-time">{act.date}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-dim text-center py-1" style={{ fontSize: '0.9rem' }}>No recent request activity.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sketches' && (
          <div className="admin-tab-content">
            <div className="admin-header-row">
              <h2 className="admin-page-title">Manage Sketches</h2>
              <button className="btn-primary-small" onClick={() => setShowUploadModal(true)}>+ Upload New Sketch</button>
            </div>
            <div className="admin-card glass">
              <div className="admin-table">
                <div className="table-head">
                  <span>Artwork</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {galleryItems.map(item => (
                  <div key={item.id} className="table-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid var(--border-color)' }}></div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="semibold">{item.title}</span>
                        <span className="text-dim" style={{ fontSize: '0.72rem', marginTop: '2px', color: 'var(--text-secondary)' }}>
                          {item.size || 'A4'} • {item.orientation || 'Vertical'}
                        </span>
                      </div>
                    </div>
                    <span>{item.category}</span>
                    <span>₹{item.price}</span>
                    <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => openEditModal(item)}>✏️</button>
                      <button className="icon-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* ... requests and pricing tabs remain same ... */}
        {activeTab === 'requests' && (
          <div className="admin-tab-content">
            <h2 className="admin-page-title">Client Requests</h2>
            <div className="admin-card glass">
              <div className="admin-table requests-table">
                <div className="table-head">
                  <span>ID</span>
                  <span>Customer</span>
                  <span>Request Type</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {allRequests.map(req => (
                  <div key={req.id} className="table-row">
                    <span className="text-dim">{req.id}</span>
                    <span className="semibold">{req.name}</span>
                    <span>{req.type}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <span className={`status-pill ${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span>
                      {req.customerApproval === 'Approved' && (
                        <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>✓ Agreed</span>
                      )}
                      {req.customerApproval === 'Declined' && (
                        <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>✗ Declined</span>
                      )}
                      {req.status === 'Accepted' && !req.customerApproval && (
                        <span style={{ fontSize: '0.65rem', color: '#d7b46a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>⏳ Awaiting User</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {req.images && req.images.length > 0 ? (
                        req.images.map((img, idx) => (
                          <a key={idx} href={img} download={`Reference_${req.id}_${idx + 1}.png`} className="icon-btn" title={`Download Photo ${idx + 1}`} style={{ fontSize: '0.9rem' }}>
                            ⬇️{idx + 1}
                          </a>
                        ))
                      ) : req.image ? (
                        <a href={req.image} download={`Reference_${req.id}.png`} className="icon-btn" title="Download Reference Photo">⬇️</a>
                      ) : null}
                      <button className="btn-table-action" onClick={() => setSelectedRequest(req)}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="admin-tab-content">
            <h2 className="admin-page-title">Pricing & Settings</h2>
            <div className="admin-card glass max-w-600">
              <h4 className="card-header">Base Pricing Manager</h4>
              <div className="pricing-grid">
                <div className="form-group">
                  <label>A4 Charcoal Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.charcoalA4} 
                    onChange={(e) => setPricing(prev => ({...prev, charcoalA4: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Charcoal Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.charcoalA3} 
                    onChange={(e) => setPricing(prev => ({...prev, charcoalA3: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Charcoal Couple (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.charcoalCouple} 
                    onChange={(e) => setPricing(prev => ({...prev, charcoalCouple: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Graphite Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.graphiteA4} 
                    onChange={(e) => setPricing(prev => ({...prev, graphiteA4: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Graphite Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.graphiteA3} 
                    onChange={(e) => setPricing(prev => ({...prev, graphiteA3: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Graphite Couple (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.graphiteCouple} 
                    onChange={(e) => setPricing(prev => ({...prev, graphiteCouple: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Color Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.colorA4} 
                    onChange={(e) => setPricing(prev => ({...prev, colorA4: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Color Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.colorA3} 
                    onChange={(e) => setPricing(prev => ({...prev, colorA3: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Color Couple (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.colorCouple} 
                    onChange={(e) => setPricing(prev => ({...prev, colorCouple: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Normal Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA4Normal} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA4Normal: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Premium Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA4Premium} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA4Premium: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Normal Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA3Normal} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA3Normal: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Premium Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA3Premium} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA3Premium: e.target.value}))}
                  />
                </div>
              </div>
              <button 
                className="btn-primary mt-2" 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerText;
                  btn.innerText = "Saving Changes...";
                  btn.disabled = true;
                  btn.style.opacity = "0.7";
                  
                  try {
                    if (savePricing) {
                      await savePricing(pricing);
                    }
                    btn.innerText = "Changes Saved Live!";
                    btn.style.background = "#008080";
                    btn.style.color = "white";
                  } catch (err) {
                    alert("Failed to save pricing: " + err.message);
                    btn.innerText = "Error Saving";
                  }
                  
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.opacity = "1";
                    btn.style.background = "";
                    btn.style.color = "";
                  }, 2000);
                }}
              >
                Save Pricing Changes
              </button>
            </div>

            <div className="admin-card glass max-w-600 mt-2">
              <h4 className="card-header">Cloudinary Storage Settings</h4>
              <p className="text-dim mb-2" style={{ fontSize: '0.9rem' }}>
                Configure Cloudinary to store images securely in the cloud. This avoids local browser storage limitations (10MB limit) and supports higher resolution photos.
              </p>
              
              <div className="pricing-grid">
                <div className="form-group">
                  <label>Cloud Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. dxyz12345" 
                    value={pricing.cloudinaryCloudName || ''} 
                    onChange={(e) => setPricing(prev => ({...prev, cloudinaryCloudName: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Upload Preset (Unsigned)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. art_web_preset" 
                    value={pricing.cloudinaryUploadPreset || ''} 
                    onChange={(e) => setPricing(prev => ({...prev, cloudinaryUploadPreset: e.target.value}))}
                  />
                </div>
              </div>

              <div className="cloudinary-instructions mt-2 glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span className="semibold" style={{ color: 'var(--text-accent)' }}>Setup Guide:</span>
                <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                  <li>Create a free account at <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-accent)', textDecoration: 'underline' }}>cloudinary.com</a>.</li>
                  <li>Copy your <strong>Cloud Name</strong> from the console dashboard and paste it above.</li>
                  <li>Go to <strong>Settings &gt; Upload API</strong>, scroll to <strong>Upload presets</strong>, and click <strong>Add upload preset</strong>.</li>
                  <li>Set the <strong>Signing Mode</strong> to <strong>Unsigned</strong> and click <strong>Save</strong>.</li>
                  <li>Copy the resulting <strong>Upload Preset name</strong> and paste it above.</li>
                </ol>
              </div>

              <button 
                className="btn-primary mt-2" 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerText;
                  btn.innerText = "Saving Settings...";
                  btn.disabled = true;
                  btn.style.opacity = "0.7";
                  
                  try {
                    if (savePricing) {
                      await savePricing(pricing);
                    }
                    btn.innerText = "Settings Saved Live!";
                    btn.style.background = "#008080";
                    btn.style.color = "white";
                  } catch (err) {
                    alert("Failed to save Cloudinary settings: " + err.message);
                    btn.innerText = "Error Saving";
                  }
                  
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.opacity = "1";
                    btn.style.background = "";
                    btn.style.color = "";
                  }, 2000);
                }}
              >
                Save Cloudinary Settings
              </button>
            </div>
          </div>
        )}
      </div>


        {activeTab === 'customers' && (
          <div className="admin-tab-content">
            <div className="admin-header-row">
              <h2 className="admin-page-title">Customer Accounts & Login Management</h2>
              <button className="btn-secondary-small" onClick={loadAnalyticsAndUsers} style={{ padding: '6px 14px' }}>
                ↻ Refresh Directory
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="admin-stats-grid mb-2">
              <div className="admin-stat-card glass">
                <span className="stat-icon">👥</span>
                <div className="stat-info">
                  <p className="stat-label">Total Customers</p>
                  <h3 className="stat-value">{customerData.stats.totalUsers}</h3>
                </div>
              </div>
              <div className="admin-stat-card glass">
                <span className="stat-icon">🌐</span>
                <div className="stat-info">
                  <p className="stat-label">Google OAuth</p>
                  <h3 className="stat-value">{customerData.stats.googleUsers}</h3>
                </div>
              </div>
              <div className="admin-stat-card glass">
                <span className="stat-icon">🔑</span>
                <div className="stat-info">
                  <p className="stat-label">Email / Password</p>
                  <h3 className="stat-value">{customerData.stats.directUsers}</h3>
                </div>
              </div>
              <div className="admin-stat-card glass">
                <span className="stat-icon">⚡</span>
                <div className="stat-info">
                  <p className="stat-label">Active / Logged In Today</p>
                  <h3 className="stat-value" style={{ color: '#22c55e' }}>{customerData.stats.activeToday}</h3>
                </div>
              </div>
            </div>

            {/* Directory Card */}
            <div className="admin-card glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search customer by username / email..." 
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  style={{ flexGrow: 1, minWidth: '260px', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['all', 'google', 'direct', 'active'].map(f => (
                    <button 
                      key={f}
                      type="button" 
                      onClick={() => setCustomerFilter(f)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        background: customerFilter === f ? 'var(--accent-gold)' : 'rgba(255,255,255,0.04)',
                        color: customerFilter === f ? '#0b0b0e' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {f === 'all' && `All (${customerData.users.length})`}
                      {f === 'google' && `Google (${customerData.stats.googleUsers})`}
                      {f === 'direct' && `Email (${customerData.stats.directUsers})`}
                      {f === 'active' && `Active Today (${customerData.stats.activeToday})`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer / Email</th>
                      <th>Login Method</th>
                      <th>Role</th>
                      <th>Signed Up</th>
                      <th>Last Login / Activity</th>
                      <th>Orders Placed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(cust => (
                        <tr key={cust.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: cust.google_id ? '#4285F4' : 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                                {cust.username.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{cust.username}</strong>
                              </div>
                            </div>
                          </td>
                          <td>
                            {cust.google_id ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(66, 133, 244, 0.15)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600 }}>
                                🌐 Google OAuth
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600 }}>
                                🔑 Email / Password
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', color: cust.role === 'admin' ? 'var(--accent-gold)' : 'inherit' }}>
                              {cust.role}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {cust.created_at ? new Date(cust.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active client'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {cust.last_login ? new Date(cust.last_login).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Not logged in yet'}
                            </span>
                          </td>
                          <td>
                            <span style={{ padding: '3px 9px', borderRadius: '12px', background: cust.order_count > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)', color: cust.order_count > 0 ? '#4ade80' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                              {cust.order_count} {cust.order_count === 1 ? 'order' : 'orders'}
                            </span>
                          </td>
                          <td>
                            {isUserActiveRecently(cust.last_login) ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>
                                <span className="user-status-dot active"></span> Active recently
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                <span className="user-status-dot offline"></span> Offline
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                          No customer accounts found matching your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {showUploadModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass">
            <h3 className="serif mb-2">{editingItem ? 'Modify Artwork' : 'Upload New Artwork'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Artwork Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. The Golden Hour" 
                    required 
                    value={newSketch.title}
                    onChange={(e) => setNewSketch({...newSketch, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newSketch.category}
                    onChange={(e) => setNewSketch({...newSketch, category: e.target.value})}
                    className="admin-select"
                  >
                    <option value="Charcoal">Charcoal</option>
                    <option value="Graphite">Graphite</option>
                    <option value="Color Pencil">Color Pencil</option>
                    <option value="Oil Painting">Oil Painting</option>
                    <option value="Digital Sketch">Digital Sketch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Starting Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="1500" 
                    required 
                    value={newSketch.price}
                    onChange={(e) => setNewSketch({...newSketch, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={newSketch.status}
                    onChange={(e) => setNewSketch({...newSketch, status: e.target.value})}
                  >
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dimensions / Size</label>
                  <select 
                    value={newSketch.size || 'A4'}
                    onChange={(e) => setNewSketch({...newSketch, size: e.target.value})}
                  >
                    <option value="A4">A4 Size</option>
                    <option value="A3">A3 Size</option>
                    <option value="A4 & A3">Both A4 & A3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Canvas Orientation</label>
                  <select 
                    value={newSketch.orientation || 'Vertical'}
                    onChange={(e) => setNewSketch({...newSketch, orientation: e.target.value})}
                  >
                    <option value="Vertical">Vertical (Portrait)</option>
                    <option value="Horizontal">Horizontal (Landscape)</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Upload Artwork Photo</label>
                  <div className="file-upload-wrapper">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                      id="sketch-upload"
                      disabled={isUploadingSketch}
                    />
                    <label htmlFor="sketch-upload" className="file-label" style={{ opacity: isUploadingSketch ? 0.6 : 1, cursor: isUploadingSketch ? 'not-allowed' : 'pointer' }}>
                      {isUploadingSketch ? 'Uploading to Cloudinary...' : newSketch.image ? 'Change Photo' : 'Choose File'}
                    </label>
                    {isUploadingSketch && (
                      <div className="upload-loader-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="spinner"></div>
                        <span className="upload-loader-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Uploading to Cloudinary...</span>
                      </div>
                    )}
                    {!isUploadingSketch && newSketch.image && (
                      <div className="image-preview-container">
                        <img src={newSketch.image} alt="Preview" className="upload-preview" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Artwork Description</label>
                  <textarea 
                    placeholder="Describe the soul of this artwork..." 
                    rows="3"
                    value={newSketch.description}
                    onChange={(e) => setNewSketch({...newSketch, description: e.target.value})}
                    className="admin-textarea"
                  ></textarea>
                </div>
              </div>
              <div className="modal-actions mt-2">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary-small">{editingItem ? 'Save Changes' : 'Confirm Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass admin-two-column-modal" style={{ maxWidth: '900px', width: '90%' }}>
            <h3 className="serif mb-2">Request Details: {selectedRequest.id}</h3>
            
            <div className="admin-modal-columns" style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              
              {/* Left Column: Details and Updates */}
              <div className="admin-modal-left" style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-grid mb-2">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <p className="semibold">{selectedRequest.name}</p>
                  </div>
                  <div className="form-group">
                    <label>Customer Approval</label>
                    <p className="semibold">
                      {selectedRequest.customerApproval === 'Approved' ? (
                        <span style={{ color: '#4ade80', fontWeight: '600' }}>✅ Approved & Confirmed</span>
                      ) : selectedRequest.customerApproval === 'Declined' ? (
                        <span style={{ color: '#ef4444', fontWeight: '600' }}>❌ Declined Quote</span>
                      ) : selectedRequest.status === 'Accepted' ? (
                        <span style={{ color: '#d7b46a', fontWeight: '600' }}>⏳ Awaiting Decision</span>
                      ) : (
                        <span className="text-dim">Pending Quote Review</span>
                      )}
                    </p>
                  </div>
                  <div className="form-group full-width">
                    <label>Portrait Type & Frame</label>
                    <p>{selectedRequest.type} | Frame: {selectedRequest.frame || 'N/A'}</p>
                  </div>
                </div>

                <div className="form-group full-width mb-2">
                  <label>Reference Photos</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {selectedRequest.images && selectedRequest.images.length > 0 ? (
                      selectedRequest.images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={img} alt={`Reference ${idx + 1}`} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                          <a href={img} download={`Reference_${selectedRequest.id}_${idx + 1}.png`} className="icon-btn" title="Download" style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>⬇️</a>
                        </div>
                      ))
                    ) : selectedRequest.image ? (
                      <div style={{ position: 'relative' }}>
                        <img src={selectedRequest.image} alt="Reference" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                        <a href={selectedRequest.image} download={`Reference_${selectedRequest.id}.png`} className="icon-btn" title="Download" style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>⬇️</a>
                      </div>
                    ) : (
                      <p className="text-dim">No photos provided.</p>
                    )}
                  </div>
                </div>

                <div className="form-grid mb-2">
                  <div className="form-group">
                    <label>Final Price (₹)</label>
                    <input 
                      type="number" 
                      value={selectedRequest.price || 0}
                      onChange={(e) => setSelectedRequest({...selectedRequest, price: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      value={selectedRequest.status}
                      onChange={(e) => setSelectedRequest({...selectedRequest, status: e.target.value})}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width mb-2">
                  <label>Message to Customer (Price/Reference Note)</label>
                  <textarea 
                    rows="3"
                    placeholder="Explain the price update or details regarding the reference image..." 
                    value={selectedRequest.adminNote || ''}
                    onChange={(e) => setSelectedRequest({...selectedRequest, adminNote: e.target.value})}
                    className="admin-textarea"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.8rem', outline: 'none', resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="modal-actions mt-auto pt-2">
                  <button type="button" className="btn-ghost" onClick={() => setSelectedRequest(null)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn-primary-small"
                    onClick={() => {
                      if (updateRequest) {
                        updateRequest(selectedRequest);
                      }
                      alert("Request updated successfully!");
                      setSelectedRequest(null);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Right Column: Chat/Discussion */}
              <div className="admin-modal-right" style={{ flex: '1', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
                <h4 className="chat-title" style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💬 Discussion with {selectedRequest.name}
                </h4>
                
                <div className="admin-chat-box" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '350px', width: '100%' }}>
                  <div className="admin-chat-messages" ref={adminChatMessagesRef} style={{ flex: '1', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {selectedRequest.messages && selectedRequest.messages.length > 0 ? (
                      selectedRequest.messages.map((msg, index) => {
                        const isSelf = msg.sender === (user?.username || 'Artist') || msg.sender === 'Artist' || msg.sender === 'aesthetic_by_nikhil';
                        const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={index} className={`chat-message ${isSelf ? 'self' : 'other'}`} style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%', alignSelf: isSelf ? 'flex-end' : 'flex-start' }}>
                            <div className="message-meta" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px', display: 'flex', gap: '6px', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                              <span className="message-sender" style={{ fontWeight: '600', color: isSelf ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{msg.sender}</span>
                              <span className="message-time">{formattedTime}</span>
                            </div>
                            <div className="chat-bubble" style={{ 
                              padding: '0.6rem 0.9rem', 
                              fontSize: '0.85rem', 
                              lineHeight: '1.4', 
                              borderRadius: '10px', 
                              wordBreak: 'break-word',
                              background: isSelf ? 'linear-gradient(135deg, var(--accent-gold) 0%, #b8954f 100%)' : 'rgba(255,255,255,0.05)',
                              color: isSelf ? '#0d0d0d' : 'var(--text-primary)',
                              border: isSelf ? 'none' : '1px solid var(--border-color)',
                              borderBottomRightRadius: isSelf ? '2px' : '10px',
                              borderBottomLeftRadius: isSelf ? '10px' : '2px',
                              fontWeight: isSelf ? '500' : 'normal'
                            }}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="chat-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: '0.5', gap: '6px' }}>
                        <span>💬</span>
                        <p style={{ margin: 0 }}>No messages yet. Send a note to start the conversation!</p>
                      </div>
                    )}
                  </div>
                  
                  <form className="chat-input-area" onSubmit={handleAdminSendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                    <textarea
                      placeholder="Type a message to client..."
                      value={adminTypedMessage}
                      onChange={(e) => setAdminTypedMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAdminSendMessage(e);
                        }
                      }}
                      style={{ flex: '1', background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.8rem 1rem', fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'inherit', height: '50px' }}
                    />
                    <button 
                      type="submit" 
                      className="btn-send-message" 
                      disabled={!adminTypedMessage.trim()}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', padding: '0 1.2rem', cursor: 'pointer', fontSize: '0.9rem', borderLeft: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
              
            </div>
            
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
