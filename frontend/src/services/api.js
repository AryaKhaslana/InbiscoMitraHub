/**
 * Inbisco MitraHub & SupplySync API Client
 * Seamlessly interfaces with all 26 backend endpoints.
 */

const API_BASE = '/api/v1';

async function fetchJson(endpoint, options = {}) {
  const token = localStorage.getItem('inbisco_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Storefront & Public
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return fetchJson(`/products${searchParams ? `?${searchParams}` : ''}`);
  },
  registerStore: (payload) => fetchJson('/stores/register', { method: 'POST', body: JSON.stringify(payload) }),
  lookupStore: (phone) => fetchJson('/stores/lookup', { method: 'POST', body: JSON.stringify({ phone }) }),
  createOrder: (payload) => fetchJson('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  trackOrder: (trackingCode) => fetchJson(`/orders/track/${encodeURIComponent(trackingCode)}`),

  // Auth & Dual-Role Session
  login: (username, password, role) =>
    fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),

  // Internal Depo Krian Admin Operations
  getAdminKpi: () => fetchJson('/admin/kpi'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/admin/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (orderIdentifier, status, note) =>
    fetchJson(`/admin/orders/${encodeURIComponent(orderIdentifier)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),
  getFefoInventory: () => fetchJson('/admin/inventory/fefo'),
  updateProductStock: (productIdentifier, payload) =>
    fetchJson(`/admin/products/${encodeURIComponent(productIdentifier)}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getAdminStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/admin/stores${query ? `?${query}` : ''}`);
  },
  verifyStore: (storeIdentifier, isVerified) =>
    fetchJson(`/admin/stores/${encodeURIComponent(storeIdentifier)}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    }),
  syncSap: () => fetchJson('/admin/sync-sap', { method: 'POST' }),
  getDailyManifest: () => fetchJson('/admin/manifest/daily'),
  getDistributorDirectory: () => fetchJson('/admin/distributors'),

  // SupplySync HQ Intelligence
  getStockoutRisk: () => fetchJson('/admin/stockout-risk'),
  getRestockRecommendations: () => fetchJson('/admin/restock-recommendations'),
  batchApprovePo: (recommendationIds = []) =>
    fetchJson('/admin/batch-approve-po', {
      method: 'POST',
      body: JSON.stringify({ recommendationIds }),
    }),
  crossDepotTransfer: (payload) =>
    fetchJson('/admin/cross-depot-transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  runWhatIfSimulation: (payload) =>
    fetchJson('/simulation/what-if', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Distributor Operations
  submitDailySales: (payload) =>
    fetchJson('/distributor/sales', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDailySales: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/distributor/sales${query ? `?${query}` : ''}`);
  },
  getInboundDeliveries: () => fetchJson('/distributor/inbound-deliveries'),
  confirmInboundArrival: (doNumber, payload = {}) =>
    fetchJson(`/distributor/inbound-deliveries/${encodeURIComponent(doNumber)}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
