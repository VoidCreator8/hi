// API helper module
const API_BASE = '/api';

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {},
      ...options,
    };

    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  // Products
  getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? '?' + query : ''}`);
  },

  getProduct(id) {
    return this.request(`/products/${id}`);
  },

  createProduct(formData) {
    return this.request('/products', {
      method: 'POST',
      body: formData,
    });
  },

  updateProduct(id, formData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  deleteProduct(id) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  },

  // Categories
  getCategories() {
    return this.request('/categories');
  },

  getCategory(id) {
    return this.request(`/categories/${id}`);
  },

  createCategory(data) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory(id, data) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory(id) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  },

  // Auth
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  verifyToken() {
    return this.request('/auth/verify');
  },
};
