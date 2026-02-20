// src/api.js

// Base URL for backend
export const API_BASE_URL = "https://tickett-management-backend.onrender.com";

  

// Get headers for requests, including Authorization if token exists
export function getAuthHeaders(token) {
  const t = token ?? localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}

// Core fetch request function
export async function apiRequest(path, options = {}) {
  const { token, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = {
    ...getAuthHeaders(token),
    ...(fetchOptions.headers || {}),
  };
  return fetch(url, { ...fetchOptions, headers });
}

// GET request
export async function apiGet(path, options = {}) {
  const res = await apiRequest(path, { ...options, method: "GET" });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// POST request
export async function apiPost(path, body, options = {}) {
  const res = await apiRequest(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// PUT request
export async function apiPut(path, body = null, options = {}) {
  const fetchOptions = { ...options, method: "PUT" };
  if (body != null) fetchOptions.body = JSON.stringify(body);
  const res = await apiRequest(path, fetchOptions);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// DELETE request (optional)
export async function apiDelete(path, options = {}) {
  const res = await apiRequest(path, { ...options, method: "DELETE" });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
