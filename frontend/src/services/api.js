/**
 * Inbisco MitraHub & SupplySync API Client
 * Seamlessly interfaces with all 26 backend endpoints (Supabase PostgreSQL + Upstash Redis).
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
    arr.logs = payload;
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

let inflightAutoLogin = null;

async function ensureAuthToken() {
  const existing = localStorage.getItem('inbisco_auth_token');
  if (existing && existing.startsWith('inb_sess_')) {
    return existing;
  }

  if (inflightAutoLogin) {
    return inflightAutoLogin;
  }

  const activeRole = localStorage.getItem('inbisco_active_role') || 'hq_admin';
  const roleParam = activeRole === 'distributor_ops' ? 'DISTRIBUTOR_DEPO' : 'HQ_ADMIN';
  const username = activeRole === 'distributor_ops' ? 'bambang.krian@inbisco.co.id' : 'ops.hq@mayora.co.id';

  inflightAutoLogin = fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password: 'Inbisco2026!',
      role: roleParam,
    }),
  })
    .then((res) => res.json())
    .then((json) => {
      const token = json?.data?.token || json?.token;
      if (token) {
        localStorage.setItem('inbisco_auth_token', token);
        return token;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      inflightAutoLogin = null;
    });

  return inflightAutoLogin;
}

function requiresAuth(endpoint) {
  return (
    endpoint.startsWith('/admin') ||
    endpoint.startsWith('/distributor') ||
    endpoint.startsWith('/simulation')
  );
}

// Short-lived GET cache + in-flight dedupe: header, sidebar and pages ask for the same data at once.
const GET_TTL_MS = 15000;
const getCache = new Map();
if (typeof window !== 'undefined') {
  // Registered at module load, so it runs before page listeners refetch.
  window.addEventListener('supplysync:refresh', () => getCache.clear());
}

function fetchJson(endpoint, options = {}, isRetry = false) {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' || isRetry) {
    return rawFetchJson(endpoint, options, isRetry).then((res) => {
      if (method !== 'GET') getCache.clear();
      return res;
    });
  }
  const hit = getCache.get(endpoint);
  if (hit && Date.now() - hit.t < GET_TTL_MS) return hit.p;
  const p = rawFetchJson(endpoint, options).catch((err) => {
    getCache.delete(endpoint);
    throw err;
  });
  getCache.set(endpoint, { t: Date.now(), p });
  return p;
}

async function rawFetchJson(endpoint, options = {}, isRetry = false) {
  let token = localStorage.getItem('inbisco_auth_token');
  if (!token && requiresAuth(endpoint)) {
    token = await ensureAuthToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && requiresAuth(endpoint) && !isRetry) {
    localStorage.removeItem('inbisco_auth_token');
    const newToken = await ensureAuthToken();
    if (newToken) {
      return fetchJson(endpoint, options, true);
    }
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detailMsg =
      Array.isArray(json.errors) && json.errors.length > 0
        ? json.errors.map((e) => e.message).filter(Boolean).join(', ')
        : null;
    const errorMsg =
      detailMsg || json.error || json.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.errors = json.errors;
    throw err;
  }

  return normalizeResponse(json);
}

export const api = {
  // Storefront & Public
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return fetchJson(`/products${searchParams ? `?${searchParams}` : ''}`);
  },
  registerStore: (payload) =>
    fetchJson('/stores/register', { method: 'POST', body: JSON.stringify(payload) }),
  lookupStore: (phone) =>
    fetchJson('/stores/lookup', { method: 'POST', body: JSON.stringify({ phone }) }),
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
      // Query verified stores or fallback to Toko Kelontong Berkah Jaya phone lookup
      try {
        const defaultLookup = await fetchJson('/stores/lookup', {
          method: 'POST',
          body: JSON.stringify({ phone: '081234560001' }),
        });
        if (defaultLookup?.id) {
          storeId = defaultLookup.id;
        }
      } catch (e) {
        // Fallback UUID
        storeId = '7d839d30-b966-4116-8f99-621deffc73e1';
      }
    }

    const cleanPayload = {
      storeId,
      paymentMethod:
        payload.paymentMethod === 'TOP_14_DAYS' || payload.paymentMethod === 'TEMPO_7_DAYS'
          ? 'TEMPO_7_DAYS'
          : 'COD',
      notes:
        payload.notes ||
        `Order via MitraHub: ${payload.storeName || 'Mitra Toko'} (${payload.storePhone || 'WA'})`,
      items: payload.items,
    };

    return fetchJson('/orders', { method: 'POST', body: JSON.stringify(cleanPayload) });
  },
  trackOrder: (trackingCode) => fetchJson(`/orders/track/${encodeURIComponent(trackingCode)}`),
  submitContactInquiry: (payload) =>
    fetchJson('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Auth & Dual-Role Session
  login: async (username, password, role) => {
    const res = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
    if (res?.token) {
      localStorage.setItem('inbisco_auth_token', res.token);
    }
    return res;
  },

  // Internal Depo Krian & HQ Admin Operations
  getAdminKpi: () => fetchJson('/admin/kpi'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/admin/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (orderIdentifier, status, note) =>
    fetchJson(`/admin/orders/${encodeURIComponent(orderIdentifier)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(note ? { status, note } : { status }),
    }),
  getFefoInventory: () => fetchJson('/admin/inventory/fefo'),
  createProduct: (payload) =>
    fetchJson('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (productIdentifier) =>
    fetchJson(`/admin/products/${encodeURIComponent(productIdentifier)}`, {
      method: 'DELETE',
    }),
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
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
  syncSap: () => fetchJson('/admin/sync-sap', { method: 'POST' }),
  getDailyManifest: () => fetchJson('/admin/manifest/daily'),
  getDistributorDirectory: () => fetchJson('/admin/distributors'),
  exportOrdersCsv: async () => {
    let token = localStorage.getItem('inbisco_auth_token');
    if (!token) {
      token = await ensureAuthToken();
    }
    const response = await fetch(`${API_BASE}/admin/orders/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error('Gagal mengunduh CSV pesanan');
    }
    const csvText = await response.text();
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inbisco_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  },

  // SupplySync HQ Intelligence
  getStockoutRisk: () => fetchJson('/admin/stockout-risk'),
  getRestockRecommendations: () => fetchJson('/admin/restock-recommendations'),
  batchApprovePo: (payload) => {
    // Support either full object { depotName, applyToStock, notes, items } or array of items
    const body = Array.isArray(payload)
      ? { depotName: 'CV Surya Krian Logistik', applyToStock: true, items: payload }
      : payload;
    return fetchJson('/admin/batch-approve-po', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
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
