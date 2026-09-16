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
  async get(url, timeoutMs = 15000) {
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
  }
};
