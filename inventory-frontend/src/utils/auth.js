// Authentication utility functions

// Get auth headers with JWT token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Make authenticated fetch request
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  // If no token exists, don't make the request
  if (!token) {
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized (token expired/invalid)
  if (response.status === 401) {
    // Only redirect if we're not already on login page
    if (window.location.pathname !== '/') {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

// Logout - clear token and redirect
export const logout = (setUser) => {
  localStorage.removeItem('authToken');
  setUser(null);
};

