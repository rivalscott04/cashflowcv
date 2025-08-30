// API Base Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw new Error(data.error?.message || 'An error occurred');
  }
  
  return data;
};

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(credentials),
    });
    
    const data = await handleResponse(response);
    
    // Store token and user data
    if (data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },
  
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: createHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  verifyToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  create: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(transactionData),
    });
    
    return handleResponse(response);
  },
  
  update: async (id, transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(transactionData),
    });
    
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/transactions/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/categories`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  }
};

// Files API
export const filesAPI = {
  upload: async (files, onProgress) => {
    const formData = new FormData();
    
    // Add files to FormData
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }
    
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return handleResponse(response);
  },
  
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/files${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  download: async (id) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/files/${id}/download`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Download failed');
    }
    
    return response; // Return response for blob handling
  }
};

// Settings API
export const settingsAPI = {
  // User settings
  getUserSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/user`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getUserSetting: async (key) => {
    const response = await fetch(`${API_BASE_URL}/settings/user/${key}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  updateUserSetting: async (key, value, type = 'string') => {
    const response = await fetch(`${API_BASE_URL}/settings/user/${key}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ value, type }),
    });
    
    return handleResponse(response);
  },
  
  deleteUserSetting: async (key) => {
    const response = await fetch(`${API_BASE_URL}/settings/user/${key}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  // Company settings
  getCompanySettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getCompanySetting: async (key) => {
    const response = await fetch(`${API_BASE_URL}/settings/company/${key}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
  
  updateCompanySetting: async (key, value, type = 'string') => {
    const response = await fetch(`${API_BASE_URL}/settings/company/${key}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ value, type }),
    });
    
    return handleResponse(response);
  }
};

// Reports API
const reportsAPI = {
  generatePDF: async (reportType, startDate, endDate, companyHeader = null) => {
    const response = await fetch(`${API_BASE_URL}/reports/generate-pdf`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        reportType,
        startDate,
        endDate,
        companyHeader
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    
    // Return blob for PDF download
    return response.blob();
  }
};

// Export default API object
const api = {
  auth: authAPI,
  transactions: transactionsAPI,
  files: filesAPI,
  settings: settingsAPI,
  reports: reportsAPI
};

export default api;