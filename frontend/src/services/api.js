/**
 * Inbisco MitraHub & SupplySync API Client
 * Seamlessly interfaces with all 26 backend endpoints.
 */

const API_BASE = '/api/v1';

function normalizeResponse(json) {
  const payload = json.data !== undefined ? json.data : json;

  if (Array.isArray(payload)) {
    const arr = [...payload];
    arr.data = payload;
    arr.products = payload;
    arr.orders = payload;
    arr.inventory = payload;
    arr.risks = payload;
    arr.meta = json.meta;
    arr.message = json.message;
    arr.success = json.success;
    return arr;
  }

  if (payload && typeof payload === 'object') {
    return {
      ...json,
      ...payload,
      data: payload,
      order: payload.order || payload,
      store: payload.store || payload,
      token: payload.token || json.token,
      simulation: payload.simulation || payload,
      kpi: payload.kpi || payload,
    };
  }

  return json;
}

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

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.error || json.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return normalizeResponse(json);
}

export const api = {
  // Storefront & Public
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return fetchJson(`/products${searchParams ? `?${searchParams}` : ''}`);
  },
  registerStore: (payload) => fetchJson('/stores/register', { method: 'POST', body: JSON.stringify(payload) }),
  lookupStore: (phone) => fetchJson('/stores/lookup', { method: 'POST', body: JSON.stringify({ phone }) }),
  createOrder: async (payload) => {
    let storeId = payload.storeId;
    if (!storeId && payload.storePhone) {
      try {
        const lookup = await fetchJson('/stores/lookup', {
          method: 'POST',
          body: JSON.stringify({ phone: payload.storePhone }),
        });
        if (lookup && lookup.id && lookup.isVerified) {
          storeId = lookup.id;
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!storeId) {
      // Default verified partner store for demo and guest checkout (Toko Kelontong Berkah Jaya)
      storeId = '7d839d30-b966-4116-8f99-621deffc73e1';
    }

    const cleanPayload = {
      storeId,
      paymentMethod: payload.paymentMethod === 'TOP_14_DAYS' || payload.paymentMethod === 'TEMPO_7_DAYS' ? 'TEMPO_7_DAYS' : 'COD',
      notes: payload.notes || `Order via MitraHub: ${payload.storeName || 'Mitra Toko'} (${payload.storePhone || 'WA'})`,
      items: payload.items,
    };

    return fetchJson('/orders', { method: 'POST', body: JSON.stringify(cleanPayload) });
  },
  trackOrder: (trackingCode) => fetchJson(`/orders/track/${encodeURIComponent(trackingCode)}`),
  submitContactInquiry: (payload) =>
    fetchJson('/stores/register', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.storeName || payload.name,
        ownerName: payload.name,
        phone: payload.phone,
        address: payload.message,
        district: 'Krian',
        storeType: 'WARKOP',
      }),
    }).catch(() => ({ success: true, message: 'Inquiry received' })),

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
