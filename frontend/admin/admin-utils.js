const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }

function requireAdmin() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) { window.location.href = 'admin-login.html'; return null; }
  if (user.role !== 'admin') { window.location.href = '../login.html'; return null; }
  return user;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'admin-login.html';
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...options.headers }
  });
  const data = await res.json();
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'admin-login.html';
    return;
  }
  if (!res.ok) throw new Error(data.message);
  return data;
}

function formatCurrency(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
