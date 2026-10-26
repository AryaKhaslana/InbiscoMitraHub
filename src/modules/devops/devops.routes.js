import crypto from 'node:crypto';
import { Router } from 'express';
import { clearAuditLogs, getAuditData } from '../../middlewares/auditTracker.middleware.js';
import { sendError, sendSuccess } from '../../utils/response.js';

const router = Router();

/**
 * Validates admin key from Authorization Header OR query parameter `?key=...`.
 * Uses timingSafeEqual to prevent timing side-channel attacks.
 */
function verifyDevopsAuth(req) {
  const expectedSecret = process.env.ADMIN_SECRET_KEY;
  if (!expectedSecret) return false;

  let providedToken = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.slice(7).trim();
  } else if (typeof req.query.key === 'string') {
    providedToken = req.query.key.trim();
  }

  if (!providedToken) return false;

  const providedDigest = crypto.createHash('sha256').update(providedToken, 'utf8').digest();
  const expectedDigest = crypto.createHash('sha256').update(expectedSecret, 'utf8').digest();

  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

/**
 * API: GET /api/v1/devops/stats
 * Returns structured metrics and log stream for the DevOps console.
 */
router.get('/api/v1/devops/stats', async (req, res) => {
  if (!verifyDevopsAuth(req)) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Invalid or missing DevOps Secret Key',
      errors: [{ field: 'key', message: 'Provide valid Bearer token or ?key= query parameter' }],
    });
  }

  const data = await getAuditData();
  const uptimeSeconds = process.uptime();

  return sendSuccess(res, {
    statusCode: 200,
    message: 'DevOps metrics retrieved successfully',
    data: {
      ...data,
      server: {
        uptimeSeconds,
        uptimeFormatted: `${Math.floor(uptimeSeconds / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
        environment: process.env.NODE_ENV || 'production',
        vercelRegion: process.env.VERCEL_REGION || 'iad1 (US-East)',
        nodeVersion: process.version,
        memoryUsageMb: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
      },
    },
  });
});

/**
 * API: POST /api/v1/devops/clear
 * Flushes stored audit logs (Admin only).
 */
router.post('/api/v1/devops/clear', async (req, res) => {
  if (!verifyDevopsAuth(req)) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Invalid or missing DevOps Secret Key',
    });
  }

  await clearAuditLogs();
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Audit logs cleared successfully',
    data: { cleared: true, clearedAt: new Date().toISOString() },
  });
});

/**
 * WEB UI: GET /devops/monitor
 * High-performance, anti-slop, industrial telemetry console for PT Inbisco Niagatama Semesta.
 */
router.get('/devops/monitor', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inbisco MitraHub — DevOps Telemetry & Jury Monitor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          },
          colors: {
            surface: {
              DEFAULT: '#090d16',
              raised: '#0f172a',
              card: '#131d33',
              border: '#1e293b',
              borderLight: '#334155',
            },
            amberAccent: '#f59e0b',
          }
        }
      }
    }
  </script>
  <style>
    /* Custom Scrollbar for Dense Telemetry */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #090d16; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }
    .badge-tab { transition: all 0.15s ease-in-out; }
  </style>
</head>
<body class="bg-surface text-slate-200 min-h-screen font-sans antialiased selection:bg-amberAccent selection:text-black">

  <!-- TOP APP BAR -->
  <header class="border-b border-surface-border bg-surface-raised sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      
      <!-- Brand & Identity -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-surface-card border border-surface-border flex items-center justify-center font-mono text-amber-400 font-bold text-sm tracking-tighter">
          INB
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-bold text-sm sm:text-base tracking-tight text-white">Inbisco MitraHub</h1>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-slate-400 uppercase tracking-wider">DevOps Telemetry</span>
          </div>
          <div class="text-[11px] text-slate-400 flex items-center gap-2">
            <span>PT Inbisco Niagatama Semesta</span>
            <span class="text-slate-600">•</span>
            <span id="headerEnvTag" class="text-emerald-400 font-mono">Production (iad1)</span>
          </div>
        </div>
      </div>

      <!-- Quick Control Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Polling Indicator & Rate Control -->
        <div class="flex items-center gap-2 bg-surface border border-surface-border rounded-lg px-2.5 py-1 text-xs font-mono">
          <span id="pulseIndicator" class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <select id="selectPollRate" onchange="updatePollRate()" class="bg-transparent text-slate-300 focus:outline-none cursor-pointer">
            <option value="5000" class="bg-surface-card text-white">Auto: 5s</option>
            <option value="3000" class="bg-surface-card text-white">Auto: 3s</option>
            <option value="10000" class="bg-surface-card text-white">Auto: 10s</option>
            <option value="0" class="bg-surface-card text-white">Pause</option>
          </select>
        </div>

        <button onclick="fetchData()" id="btnRefresh" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-card hover:bg-surface-border text-slate-200 border border-surface-border transition flex items-center gap-1.5" title="Refresh Sekarang">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <button onclick="openAuthModal()" class="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-surface-card hover:bg-surface-border text-slate-300 border border-surface-border transition flex items-center gap-1.5" title="Ganti Secret Key">
          <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          <span class="hidden sm:inline">Auth</span>
        </button>
      </div>

    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

    <!-- AUTH GATE MODAL / OVERLAY -->
    <div id="authGateModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-surface-raised border border-surface-border rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            🔒
          </div>
          <div>
            <h2 class="text-base font-bold text-white">DevOps Authentication</h2>
            <p class="text-xs text-slate-400">Endpoint ini terisolasi untuk tim teknis.</p>
          </div>
        </div>
        
        <form onsubmit="handleAuthSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">ADMIN_SECRET_KEY</label>
            <div class="relative">
              <input type="password" id="inputSecretKey" placeholder="inbisco_adm_..." class="w-full px-3 py-2 bg-surface border border-surface-border focus:border-amber-500 rounded-lg text-xs font-mono text-white placeholder-slate-600 outline-none transition pr-10" required />
              <button type="button" onclick="togglePasswordVisibility()" class="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300">👁️</button>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Key tersimpan di browser session lu, gak bakal dikirim ke pihak ketiga.</p>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" onclick="closeAuthModal()" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition">Tutup</button>
            <button type="submit" class="px-4 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition font-bold">Verifikasi & Akses</button>
          </div>
        </form>
      </div>
    </div>

    <!-- JURY ALERT CARD (Dynamic) -->
    <div id="juryAlertCard" class="hidden border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 sm:p-5 flex items-start gap-4">
      <div class="w-9 h-9 rounded bg-amber-500/20 text-amber-400 flex-shrink-0 flex items-center justify-center font-bold text-base">
        ⚡
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-amber-400 text-sm tracking-tight">Kunjungan Juri Terdeteksi</h3>
          <span id="juryTimeDiffBadge" class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">Barusan</span>
        </div>
        <p id="juryAlertDetails" class="text-xs text-slate-300 mt-1 font-mono leading-relaxed">
          Menunggu telemetri...
        </p>
      </div>
    </div>

    <!-- METRICS GRID -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      
      <!-- Metric 1: Juri / Human Requests -->
      <div class="p-4 rounded-xl bg-surface-raised border border-surface-border">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-medium">Juri / User Hits</span>
          <span class="text-amber-400 font-mono text-[11px]">Human</span>
        </div>
        <div id="valJuryRequests" class="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">0</div>
        <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Traffic non-cron</span>
        </div>
      </div>

      <!-- Metric 2: Unique Visitor IPs -->
      <div class="p-4 rounded-xl bg-surface-raised border border-surface-border">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-medium">Unique Visitors</span>
          <span class="text-slate-400 font-mono text-[11px]">IPs</span>
        </div>
        <div id="valUniqueIps" class="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">0</div>
        <div class="text-[11px] text-slate-400 mt-1">Perangkat terpisah</div>
      </div>

      <!-- Metric 3: Total Traffic -->
      <div class="p-4 rounded-xl bg-surface-raised border border-surface-border">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-medium">Total Requests</span>
          <span class="text-slate-400 font-mono text-[11px]">Throughput</span>
        </div>
        <div id="valTotalRequests" class="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">0</div>
        <div class="text-[11px] text-slate-400 mt-1">Termasuk warmup pings</div>
      </div>

      <!-- Metric 4: System Health & Latency -->
      <div class="p-4 rounded-xl bg-surface-raised border border-surface-border">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-medium">Runtime Status</span>
          <span class="text-emerald-400 font-mono text-[11px]">Healthy</span>
        </div>
        <div id="valAvgLatency" class="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">- ms</div>
        <div id="valServerUptime" class="text-[11px] text-slate-400 mt-1 font-mono">Uptime: -</div>
      </div>

    </div>

    <!-- TELEMETRY FEED & CONTROLS -->
    <div class="rounded-xl bg-surface-raised border border-surface-border overflow-hidden">
      
      <!-- Toolbar -->
      <div class="p-4 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 bg-surface/40">
        
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 bg-surface border border-surface-border p-1 rounded-lg text-xs font-mono">
          <button onclick="setFilter('all')" id="tabAll" class="px-3 py-1 rounded bg-surface-border text-white font-medium">Semua (<span id="countAll">0</span>)</button>
          <button onclick="setFilter('jury')" id="tabJury" class="px-3 py-1 rounded text-slate-400 hover:text-white font-medium">Juri (<span id="countJury">0</span>)</button>
          <button onclick="setFilter('cron')" id="tabCron" class="px-3 py-1 rounded text-slate-400 hover:text-white font-medium">Warmup (<span id="countCron">0</span>)</button>
          <button onclick="setFilter('error')" id="tabError" class="px-3 py-1 rounded text-slate-400 hover:text-white font-medium">Error (<span id="countError">0</span>)</button>
        </div>

        <!-- Search & Action Toolbar -->
        <div class="flex items-center gap-2 flex-grow sm:flex-grow-0 justify-end">
          <div class="relative w-full sm:w-56">
            <input type="text" id="searchInput" oninput="handleSearch()" placeholder="Cari IP, endpoint, kota..." class="w-full bg-surface border border-surface-border focus:border-slate-500 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 placeholder-slate-600 outline-none transition" />
          </div>

          <button onclick="exportLogsJson()" class="px-2.5 py-1 text-xs rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white hover:bg-surface-border transition flex items-center gap-1 font-mono" title="Export Log ke format JSON">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export
          </button>

          <button onclick="confirmClearLogs()" class="px-2.5 py-1 text-xs rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition font-mono" title="Bersihkan riwayat log">
            Reset
          </button>
        </div>

      </div>

      <!-- Log Table (Desktop) -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-surface/80 text-slate-400 border-b border-surface-border uppercase tracking-wider text-[10px]">
            <tr>
              <th class="py-2.5 px-4">Waktu</th>
              <th class="py-2.5 px-4">Klasifikasi</th>
              <th class="py-2.5 px-4">Request Endpoint</th>
              <th class="py-2.5 px-4">Status & Latency</th>
              <th class="py-2.5 px-4">Client IP / Origin</th>
              <th class="py-2.5 px-4">Device Environment</th>
            </tr>
          </thead>
          <tbody id="logsTableBody" class="divide-y divide-surface-border/60">
            <tr>
              <td colspan="6" class="py-12 text-center text-slate-500 font-sans text-xs">Memuat data telemetri real-time...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Info -->
      <div class="px-4 py-2.5 border-t border-surface-border text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 bg-surface/30">
        <div class="flex items-center gap-2">
          <span>Penyimpanan: <strong id="footerStorageType" class="text-slate-300 font-mono">Upstash Redis</strong></span>
          <span>•</span>
          <span id="footerMemoryUsage">RAM: - MB</span>
        </div>
        <div id="footerLastSync" class="font-mono text-slate-500">
          Sync terakhir: -
        </div>
      </div>

    </div>

  </main>

  <script>
    let currentKey = new URLSearchParams(window.location.search).get('key') || localStorage.getItem('inbisco_devops_key') || '';
    let pollTimer = null;
    let pollIntervalMs = 5000;
    let activeFilter = 'all';
    let searchQuery = '';
    let rawLogs = [];
    let summaryStats = {};

    function init() {
      if (!currentKey) {
        openAuthModal();
      } else {
        localStorage.setItem('inbisco_devops_key', currentKey);
        fetchData();
        startPolling();
      }
    }

    function openAuthModal() {
      document.getElementById('authGateModal').classList.remove('hidden');
    }

    function closeAuthModal() {
      if (currentKey) {
        document.getElementById('authGateModal').classList.add('hidden');
      }
    }

    function togglePasswordVisibility() {
      const input = document.getElementById('inputSecretKey');
      input.type = input.type === 'password' ? 'text' : 'password';
    }

    function handleAuthSubmit(e) {
      e.preventDefault();
      const val = document.getElementById('inputSecretKey').value.trim();
      if (val) {
        currentKey = val;
        localStorage.setItem('inbisco_devops_key', val);
        document.getElementById('authGateModal').classList.add('hidden');
        fetchData();
        startPolling();
      }
    }

    function updatePollRate() {
      const select = document.getElementById('selectPollRate');
      pollIntervalMs = Number(select.value);
      startPolling();
    }

    function startPolling() {
      if (pollTimer) clearInterval(pollTimer);
      const dot = document.getElementById('pulseIndicator');
      if (pollIntervalMs > 0) {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
        pollTimer = setInterval(fetchData, pollIntervalMs);
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-slate-600';
      }
    }

    async function fetchData() {
      if (!currentKey) return;
      try {
        const res = await fetch(\`/api/v1/devops/stats?key=\${encodeURIComponent(currentKey)}\`);
        if (res.status === 401) {
          openAuthModal();
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          renderTelemetry(json.data);
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
      }
    }

    function renderTelemetry(data) {
      summaryStats = data.stats || {};
      rawLogs = data.allLogs || [];
      const server = data.server || {};

      // Metric Cards
      document.getElementById('valJuryRequests').innerText = summaryStats.juryRequests || 0;
      document.getElementById('valUniqueIps').innerText = summaryStats.uniqueVisitors || 0;
      document.getElementById('valTotalRequests').innerText = summaryStats.totalRequests || 0;
      document.getElementById('valServerUptime').innerText = 'Uptime: ' + (server.uptimeFormatted || '0m');
      document.getElementById('footerStorageType').innerText = data.source === 'redis' ? 'Upstash Redis (Stateful)' : 'In-Memory (Fallback)';
      document.getElementById('footerMemoryUsage').innerText = 'RSS: ' + (server.memoryUsageMb || '-') + ' MB';
      document.getElementById('footerLastSync').innerText = 'Sync: ' + new Date().toLocaleTimeString('id-ID');

      // Compute Average Latency from current log sample
      if (rawLogs.length > 0) {
        const sumDuration = rawLogs.reduce((acc, curr) => acc + (Number(curr.durationMs) || 0), 0);
        const avg = (sumDuration / rawLogs.length).toFixed(1);
        document.getElementById('valAvgLatency').innerText = avg + ' ms';
      }

      // Jury Alert Card
      const alertCard = document.getElementById('juryAlertCard');
      const alertDetails = document.getElementById('juryAlertDetails');
      const juryLogs = data.juryLogs || [];
      if (juryLogs.length > 0) {
        const latest = juryLogs[0];
        alertCard.classList.remove('hidden');
        document.getElementById('juryTimeDiffBadge').innerText = formatRelativeTime(latest.timestamp);
        alertDetails.innerHTML = \`
          Terakhir terdeteksi pada <strong class="text-white">\${latest.timeWIB}</strong> dari 
          <span class="text-amber-300 font-bold">\${latest.city || 'Sidoarjo/Jatim'}, \${latest.country || 'ID'}</span> 
          (IP: \${latest.ip}). Membuka <span class="bg-surface px-1.5 py-0.5 rounded border border-surface-border text-white">\${latest.method} \${latest.path}</span> 
          menggunakan <span class="text-slate-300">\${parseDeviceLabel(latest.userAgent)}</span>.
        \`;
      } else {
        alertCard.classList.add('hidden');
      }

      // Counts for Filter Tabs
      document.getElementById('countAll').innerText = rawLogs.length;
      document.getElementById('countJury').innerText = rawLogs.filter(l => l.isJury).length;
      document.getElementById('countCron').innerText = rawLogs.filter(l => !l.isJury).length;
      document.getElementById('countError').innerText = rawLogs.filter(l => l.statusCode >= 400).length;

      renderTable();
    }

    function setFilter(type) {
      activeFilter = type;
      ['all', 'jury', 'cron', 'error'].forEach(t => {
        const btn = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (t === type) {
          btn.className = 'px-3 py-1 rounded bg-surface-border text-white font-medium';
        } else {
          btn.className = 'px-3 py-1 rounded text-slate-400 hover:text-white font-medium';
        }
      });
      renderTable();
    }

    function handleSearch() {
      searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
      renderTable();
    }

    function renderTable() {
      const tbody = document.getElementById('logsTableBody');
      let filtered = rawLogs;

      // Filter category
      if (activeFilter === 'jury') filtered = filtered.filter(l => l.isJury);
      else if (activeFilter === 'cron') filtered = filtered.filter(l => !l.isJury);
      else if (activeFilter === 'error') filtered = filtered.filter(l => l.statusCode >= 400);

      // Search query filter
      if (searchQuery) {
        filtered = filtered.filter(l => 
          (l.path && l.path.toLowerCase().includes(searchQuery)) ||
          (l.ip && l.ip.includes(searchQuery)) ||
          (l.city && l.city.toLowerCase().includes(searchQuery)) ||
          (l.userAgent && l.userAgent.toLowerCase().includes(searchQuery))
        );
      }

      if (filtered.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="6" class="py-12 text-center text-slate-500 font-sans">
              Tidak ada request yang sesuai dengan filter atau pencarian saat ini.
            </td>
          </tr>
        \`;
        return;
      }

      tbody.innerHTML = filtered.map(log => {
        // Status code styling
        const statusClass = log.statusCode >= 200 && log.statusCode < 300
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : (log.statusCode >= 400 && log.statusCode < 500
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              : 'text-rose-400 bg-rose-500/10 border-rose-500/20');

        // Classification badge
        const badgeClass = log.isJury
          ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">JURI / VISITOR</span>'
          : (log.type === 'DEVOPS_ADMIN'
              ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/60 text-slate-300">DEVOPS</span>'
              : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500">CRON WARMUP</span>');

        // Latency class
        const latencyClass = log.durationMs > 500 ? 'text-amber-400 font-bold' : 'text-slate-400';

        return \`
          <tr class="hover:bg-surface-card transition">
            <td class="py-2.5 px-4 text-slate-300 whitespace-nowrap">
              <div>\${log.timeWIB}</div>
              <div class="text-[10px] text-slate-500">\${formatRelativeTime(log.timestamp)}</div>
            </td>
            <td class="py-2.5 px-4 whitespace-nowrap">\${badgeClass}</td>
            <td class="py-2.5 px-4">
              <span class="font-bold text-slate-300 mr-1.5">\${log.method}</span>
              <span class="text-slate-200 select-all">\${log.path}</span>
            </td>
            <td class="py-2.5 px-4 whitespace-nowrap">
              <span class="px-1.5 py-0.5 rounded text-[11px] font-bold border \${statusClass}">\${log.statusCode}</span>
              <span class="ml-1.5 \${latencyClass}">\${log.durationMs}ms</span>
            </td>
            <td class="py-2.5 px-4 whitespace-nowrap">
              <div class="text-slate-200 select-all">\${log.ip}</div>
              <div class="text-[10px] text-slate-500">\${log.city || '-'}, \${log.country || 'ID'}</div>
            </td>
            <td class="py-2.5 px-4 text-slate-400 max-w-xs truncate" title="\${log.userAgent}">
              \${parseDeviceLabel(log.userAgent)}
            </td>
          </tr>
        \`;
      }).join('');
    }

    function parseDeviceLabel(ua) {
      if (!ua || ua === 'Unknown') return 'Unknown Client';
      if (ua.includes('Inbisco-DevOps-Warmup')) return 'GitHub Actions Cron';
      if (ua.includes('Postman')) return 'Postman App';
      if (ua.includes('curl')) return 'cURL CLI';
      if (ua.includes('HeadlessChrome')) return 'Vercel Deployment Bot';

      let os = '';
      if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
      else if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

      let browser = '';
      if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Edg')) browser = 'Edge';

      if (os && browser) return \`\${os} • \${browser}\`;
      return os || browser || ua.slice(0, 24);
    }

    function formatRelativeTime(isoString) {
      if (!isoString) return '-';
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 5) return 'Barusan';
      if (diffSec < 60) return diffSec + 'd lalu';
      if (diffSec < 3600) return Math.floor(diffSec / 60) + 'm lalu';
      return Math.floor(diffSec / 3600) + 'j lalu';
    }

    function exportLogsJson() {
      const blob = new Blob([JSON.stringify(rawLogs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inbisco-audit-logs-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    async function confirmClearLogs() {
      if (!confirm('Hapus seluruh riwayat log yang tersimpan di Upstash Redis? Tindakan ini tidak bisa dibatalkan.')) return;
      try {
        await fetch(\`/api/v1/devops/clear?key=\${encodeURIComponent(currentKey)}\`, { method: 'POST' });
        fetchData();
      } catch (err) {
        alert('Gagal membersihkan log: ' + err.message);
      }
    }

    window.onload = init;
  </script>
</body>
</html>`;

  return res.status(200).send(html);
});

export default router;
