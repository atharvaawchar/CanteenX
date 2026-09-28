const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

function getAuthHeader() {
  const token = localStorage.getItem('canteenx_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Request Failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (loginKey, password) => 
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginKey, password })
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  // Menu
  getCategories: () =>
    fetch(`${API_BASE}/menu/categories`).then(handleResponse),

  getMenuItems: (params = {}) => {
    const url = new URL(`${window.location.origin}${API_BASE}/menu/items`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    return fetch(url.toString()).then(handleResponse);
  },

  getMenuItemDetails: (id) =>
    fetch(`${API_BASE}/menu/items/${id}`).then(handleResponse),

  addMenuItem: (itemData) =>
    fetch(`${API_BASE}/menu/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(itemData)
    }).then(handleResponse),

  updateMenuItem: (id, itemData) =>
    fetch(`${API_BASE}/menu/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(itemData)
    }).then(handleResponse),

  deleteMenuItem: (id) =>
    fetch(`${API_BASE}/menu/items/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  // Slots & Tables
  getSlots: () =>
    fetch(`${API_BASE}/slots`).then(handleResponse),

  updateSlot: (id, slotData) =>
    fetch(`${API_BASE}/slots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(slotData)
    }).then(handleResponse),

  getTables: () =>
    fetch(`${API_BASE}/tables`).then(handleResponse),

  reserveTable: (table_id) =>
    fetch(`${API_BASE}/tables/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ table_id })
    }).then(handleResponse),

  updateTableStatus: (id, status) =>
    fetch(`${API_BASE}/tables/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  // Orders
  checkout: (orderData) =>
    fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(orderData)
    }).then(handleResponse),

  getMyOrders: () =>
    fetch(`${API_BASE}/orders/my-orders`, {
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  getAllOrdersAdmin: () =>
    fetch(`${API_BASE}/orders/all`, {
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  getOrderDetails: (tokenOrId) =>
    fetch(`${API_BASE}/orders/${tokenOrId}`, {
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  updateOrderStatus: (id, status) =>
    fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    }).then(handleResponse),

  scanTokenQR: (tokenNumber) =>
    fetch(`${API_BASE}/orders/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ tokenNumber })
    }).then(handleResponse),

  // Wallet
  getWallet: () =>
    fetch(`${API_BASE}/wallet`, {
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  addWalletFunds: (amount) =>
    fetch(`${API_BASE}/wallet/add-funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ amount })
    }).then(handleResponse),

  // Notifications
  getNotifications: () =>
    fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  // Admin & Announcements
  getQueueStats: () =>
    fetch(`${API_BASE}/admin/queue-stats`).then(handleResponse),

  getAnalytics: () =>
    fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeader() }
    }).then(handleResponse),

  getAnnouncements: () =>
    fetch(`${API_BASE}/admin/announcements`).then(handleResponse),

  postAnnouncement: (message) =>
    fetch(`${API_BASE}/admin/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message })
    }).then(handleResponse)
};
