// src/api/api.js
import { BASE_URL } from '../config.js';

// Helper function to get auth headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle responses and auth errors
const handleResponse = async (res) => {
  if (res.status === 401) {
    // Token expired or invalid - clear it and redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

export const addUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const getInventory = async (userId) => {
  const res = await fetch(`${BASE_URL}/inventory/${userId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addInventory = async (user_id, item_name, quantity) => {
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id, item_name, quantity }),
  });
  return handleResponse(res);
};

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};