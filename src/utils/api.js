/**
 * Utility client to handle all API communications with the backend.
 * Automatically injects authorization tokens and simplifies fetch syntax.
 */

const getAuthHeaders = () => {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: Status ${response.status}`);
  }
  return response.json();
};

export const api = {
  /**
   * Send a GET request to the backend.
   */
  async get(url, timeoutMs = 60000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out for ${url}`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  },

  /**
   * Send a POST request to the backend.
   */
  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  /**
   * Send a PUT request to the backend.
   */
  async put(url, data) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  /**
   * Send a DELETE request to the backend.
   */
  async delete(url) {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  /**
   * Upload a physical file to the backend via multi-part form data.
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getAuthHeaders(), // Browser automatically sets Content-Type boundary
      body: formData
    });
    return handleResponse(res);
  },

  /**
   * Fetch the active Google Auth Client ID configured on the backend.
   */
  async getGoogleClientId() {
    return this.get('/api/auth/google/client-id');
  },

  /**
   * Send Google credential payload to backend for token exchange and session creation.
   */
  async loginWithGoogle(credential) {
    return this.post('/api/auth/google', { credential });
  },

  /**
   * Record explicit consent record in compliance with DPDP Act (India) 2023 Section 6.
   */
  async recordConsent(data) {
    try {
      return await this.post('/api/consent', data);
    } catch (e) {
      console.warn('Consent recording failed non-fatally:', e);
      return { success: false };
    }
  },

  /**
   * Submit a statutory Data Principal Rights request (DPDP Act Sections 11, 12, 13).
   */
  async submitDataRightsRequest(data) {
    return this.post('/api/data-rights', data);
  },

  /**
   * Fetch all Data Principal Rights requests (Admin only).
   */
  async getDataRightsRequests() {
    return this.get('/api/data-rights');
  },

  /**
   * Update status/admin notes of a Data Principal Rights request (Admin only).
   */
  async updateDataRightsRequest(id, data) {
    return this.put(`/api/data-rights/${id}`, data);
  },

  /**
   * Record page visit for site traffic analytics (WhatsApp status, social clicks, etc.)
   */
  async recordVisit(data) {
    try {
      return await this.post('/api/analytics/visit', data);
    } catch (e) {
      // Non-fatal analytics ping
      return { success: false };
    }
  },

  /**
   * Fetch visitor analytics stats (Admin only)
   */
  async getAnalyticsStats() {
    return this.get('/api/analytics/stats');
  },

  /**
   * Fetch registered customers directory and login statistics (Admin only)
   */
  async getAdminUsers() {
    return this.get('/api/admin/users');
  },

  /**
   * Verify Admin 2FA OTP code
   */
  async verifyAdminOtp(data) {
    return this.post('/api/auth/verify-admin-otp', data);
  },

  /**
   * Resend Admin 2FA OTP code
   */
  async resendAdminOtp(data) {
    return this.post('/api/auth/resend-admin-otp', data);
  },

  /**
   * Request 6-digit Password Reset code (Users & Admin)
   */
  async forgotPassword(data) {
    return this.post('/api/auth/forgot-password', data);
  },

    /**
   * Verify 6-digit Password Reset code (Step 2)
   */
  async verifyResetCode(data) {
    return this.post('/api/auth/verify-reset-code', data);
  },

  /**
   * Reset password with 6-digit verification code
   */
  async resetPassword(data) {
    return this.post('/api/auth/reset-password', data);
  }
};
