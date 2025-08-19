const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function getRole() {
  return localStorage.getItem('role');
}

export function setAuth({ token, role }) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    const msg = data?.error?.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return resp.json();
}

export const api = {
  register: (payload) => request('/register', { method: 'POST', body: payload }),
  login: (payload) => request('/login', { method: 'POST', body: payload }),
  slots: ({ from, to }) => {
    const qs = from && to ? `?from=${from}&to=${to}` : '';
    return request(`/slots${qs}`, { auth: false });
  },
  book: (slotId) => request('/book', { method: 'POST', body: { slotId }, auth: true }),
  myBookings: () => request('/my-bookings', { auth: true }),
  allBookings: () => request('/all-bookings', { auth: true }),
};
