import crypto from 'node:crypto';
import { Router } from 'express';
import { clearAuditLogs, getAuditData } from '../../middlewares/auditTracker.middleware.js';
import { sendError, sendSuccess } from '../../utils/response.js';

const router = Router();

/**
 * Validates admin key from Authorization Header OR query parameter `?key=...`.
 * Uses timingSafeEqual to avoid timing side-channels.
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
 * Returns structured metrics and log stream.
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
        vercelRegion: process.env.VERCEL_REGION || 'local',
        nodeVersion: process.version,
      },
    },
  });
});

/**
 * API: POST /api/v1/devops/clear
 * Flushes stored audit logs.
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
 * Serves an ultra-sleek, responsive, dark-mode DevOps Single Page Application.
 */
router.get('/devops/monitor', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const html = `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inbisco MitraHub — DevOps & Jury Live Monitor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
            dark: { 900: '#070a13', 800: '#0d1322', 700: '#141d33', 600: '#1f2b48' }
          }
        }
      }
    }
  </script>
  <style>
    @keyframes pulse-glow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.1); }
    }
    .pulse-dot { animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  </style>
</head>
<body class="bg-dark-900 text-slate-200 min-h-screen font-sans antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Header -->
  <header class="border-b border-dark-700 bg-dark-800/80 backdrop-blur sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-bold text-base sm:text-lg tracking-tight text-white">Inbisco MitraHub</h1>
            <span class="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">DevOps Telemetry</span>
          </div>
          <p class="text-xs text-slate-400">Jury & Web Traffic Audit Live Feed</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Live Polling Status -->
        <div class="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-600">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-dot"></span>
          <span id="pollStatus" class="text-emerald-400 font-medium">LIVE (5s)</span>
        </div>

        <!-- Controls -->
        <button id="btnManualRefresh" onclick="fetchData()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/30">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Refresh
        </button>

        <button onclick="changeKey()" class="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-300 border border-dark-600 transition" title="Ganti Admin Secret Key">
          🔑 Key
        </button>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

    <!-- Auth Prompt (Shown if key is missing or invalid) -->
    <div id="authPrompt" class="hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-900 border border-indigo-500/30 p-8 text-center max-w-md mx-auto shadow-2xl">
      <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </div>
      <h2 class="text-lg font-bold text-white mb-1">DevOps Access Gate</h2>
      <p class="text-xs text-slate-400 mb-5">Halaman ini private untuk kamu sebagai DevOps. Masukkan <code class="text-indigo-400">ADMIN_SECRET_KEY</code> untuk membuka dashboard.</p>
      <form onsubmit="handleAuthSubmit(event)" class="space-y-3">
        <input type="password" id="inputSecretKey" placeholder="Paste ADMIN_SECRET_KEY..." class="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-600 focus:border-indigo-500 rounded-xl text-sm font-mono text-white placeholder-slate-500 outline-none transition" required />
        <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/30">Masuk ke Monitor</button>
      </form>
    </div>

    <!-- Dashboard Content -->
    <div id="dashboardContent" class="space-y-6">

      <!-- JURY DETECTION BANNER -->
      <div id="juryAlertBanner" class="hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 p-4 sm:p-5 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-amber-300 text-sm sm:text-base">Aktivitas Juri / Pengunjung Terdeteksi!</h3>
            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">LIVE ALERT</span>
          </div>
          <p id="juryAlertText" class="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">Menunggu data aktivitas...</p>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- Card 1 -->
        <div class="p-4 rounded-xl bg-dark-800 border border-dark-700">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Kunjungan Juri / User</span>
            <span class="text-amber-400">🕵️</span>
          </div>
          <div id="metricJury" class="text-2xl sm:text-3xl font-extrabold text-white font-mono">0</div>
          <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span class="text-emerald-400 font-medium">Non-cron</span> human visitors
          </div>
        </div>

        <!-- Card 2 -->
        <div class="p-4 rounded-xl bg-dark-800 border border-dark-700">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Unique Visitor IPs</span>
            <span class="text-indigo-400">🌐</span>
          </div>
          <div id="metricIps" class="text-2xl sm:text-3xl font-extrabold text-white font-mono">0</div>
          <div class="text-[11px] text-slate-400 mt-1">Alamat IP unik terekam</div>
        </div>

        <!-- Card 3 -->
        <div class="p-4 rounded-xl bg-dark-800 border border-dark-700">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Requests</span>
            <span class="text-cyan-400">⚡</span>
          </div>
          <div id="metricTotal" class="text-2xl sm:text-3xl font-extrabold text-white font-mono">0</div>
          <div class="text-[11px] text-slate-400 mt-1">Termasuk cron warm-up</div>
        </div>

        <!-- Card 4 -->
        <div class="p-4 rounded-xl bg-dark-800 border border-dark-700">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Server Uptime</span>
            <span class="text-emerald-400">🟢</span>
          </div>
          <div id="metricUptime" class="text-xl sm:text-2xl font-bold text-white font-mono">-</div>
          <div id="metricRegion" class="text-[11px] text-slate-400 mt-1">Vercel Edge Node</div>
        </div>
      </div>

      <!-- TABLE & FILTER SECTION -->
      <div class="rounded-2xl bg-dark-800 border border-dark-700 overflow-hidden shadow-xl">
        <!-- Toolbar -->
        <div class="p-4 border-b border-dark-700 flex flex-wrap items-center justify-between gap-3 bg-dark-800/50">
          <div class="flex items-center gap-2">
            <h2 class="font-bold text-sm sm:text-base text-white">Live Request Stream</h2>
            <span id="logCountBadge" class="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-slate-400 font-mono">0 logs</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Filter Segmented Control -->
            <div class="bg-dark-900 p-1 rounded-xl border border-dark-700 flex items-center gap-1 text-xs font-medium">
              <button onclick="setFilter('all')" id="filterBtnAll" class="px-3 py-1 rounded-lg bg-indigo-600 text-white transition">Semua</button>
              <button onclick="setFilter('jury')" id="filterBtnJury" class="px-3 py-1 rounded-lg text-slate-400 hover:text-white transition">Hanya Juri</button>
              <button onclick="setFilter('cron')" id="filterBtnCron" class="px-3 py-1 rounded-lg text-slate-400 hover:text-white transition">Hanya Cron</button>
            </div>

            <!-- Clear Logs -->
            <button onclick="confirmClearLogs()" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition" title="Hapus Riwayat Log">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-dark-900/60 text-slate-400 border-b border-dark-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th class="py-3 px-4">Waktu (WIB)</th>
                <th class="py-3 px-4">Tipe / Kategori</th>
                <th class="py-3 px-4">Method & Path</th>
                <th class="py-3 px-4">Status & Speed</th>
                <th class="py-3 px-4">Client IP & Lokasi</th>
                <th class="py-3 px-4">Device / User Agent</th>
              </tr>
            </thead>
            <tbody id="logsTableBody" class="divide-y divide-dark-700/60">
              <tr>
                <td colspan="6" class="py-8 text-center text-slate-500">Memuat telemetri...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </main>

  <script>
    let currentKey = new URLSearchParams(window.location.search).get('key') || localStorage.getItem('inbisco_devops_key') || '';
    let activeFilter = 'all';
    let pollInterval = null;
    let cachedData = null;

    function init() {
      if (!currentKey) {
        showAuthPrompt();
      } else {
        localStorage.setItem('inbisco_devops_key', currentKey);
        hideAuthPrompt();
        fetchData();
        startPolling();
      }
    }

    function showAuthPrompt() {
      document.getElementById('authPrompt').classList.remove('hidden');
      document.getElementById('dashboardContent').classList.add('hidden');
    }

    function hideAuthPrompt() {
      document.getElementById('authPrompt').classList.add('hidden');
      document.getElementById('dashboardContent').classList.remove('hidden');
    }

    function handleAuthSubmit(e) {
      e.preventDefault();
      const val = document.getElementById('inputSecretKey').value.trim();
      if (val) {
        currentKey = val;
        localStorage.setItem('inbisco_devops_key', val);
        hideAuthPrompt();
        fetchData();
        startPolling();
      }
    }

    function changeKey() {
      localStorage.removeItem('inbisco_devops_key');
      currentKey = '';
      showAuthPrompt();
      clearInterval(pollInterval);
    }

    function startPolling() {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(fetchData, 5000);
    }

    async function fetchData() {
      if (!currentKey) return;
      try {
        const res = await fetch(\`/api/v1/devops/stats?key=\${encodeURIComponent(currentKey)}\`);
        if (res.status === 401) {
          showAuthPrompt();
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          cachedData = json.data;
          renderDashboard(json.data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }

    function renderDashboard(data) {
      const stats = data.stats || {};
      const server = data.server || {};

      document.getElementById('metricJury').innerText = stats.juryRequests || 0;
      document.getElementById('metricIps').innerText = stats.uniqueVisitors || 0;
      document.getElementById('metricTotal').innerText = stats.totalRequests || 0;
      document.getElementById('metricUptime').innerText = server.uptimeFormatted || '-';
      document.getElementById('metricRegion').innerText = 'Region: ' + (server.vercelRegion || 'iad1') + ' (' + (data.source || 'redis') + ')';

      // Jury Alert Banner
      const juryBanner = document.getElementById('juryAlertBanner');
      const juryAlertText = document.getElementById('juryAlertText');
      if (data.juryLogs && data.juryLogs.length > 0) {
        const latest = data.juryLogs[0];
        juryBanner.classList.remove('hidden');
        juryAlertText.innerHTML = \`Terakhir terdeteksi pada <strong>\${latest.timeWIB}</strong> dari <strong>\${latest.city}, \${latest.country}</strong> (IP: \${latest.ip}) membuka <code class="bg-amber-400/20 text-amber-200 px-1 py-0.5 rounded">\${latest.method} \${latest.path}</code> memakai <em>\${parseDevice(latest.userAgent)}</em>.\`;
      } else {
        juryBanner.classList.add('hidden');
      }

      renderTable();
    }

    function setFilter(filter) {
      activeFilter = filter;
      ['all', 'jury', 'cron'].forEach(f => {
        const btn = document.getElementById('filterBtn' + f.charAt(0).toUpperCase() + f.slice(1));
        if (f === filter) {
          btn.className = 'px-3 py-1 rounded-lg bg-indigo-600 text-white transition';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-slate-400 hover:text-white transition';
        }
      });
      renderTable();
    }

    function renderTable() {
      if (!cachedData) return;
      const allLogs = cachedData.allLogs || [];
      const tbody = document.getElementById('logsTableBody');

      let filtered = allLogs;
      if (activeFilter === 'jury') {
        filtered = allLogs.filter(l => l.isJury);
      } else if (activeFilter === 'cron') {
        filtered = allLogs.filter(l => !l.isJury);
      }

      document.getElementById('logCountBadge').innerText = \`\${filtered.length} logs\`;

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-500">Belum ada request untuk filter ini.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(log => {
        const is2xx = log.statusCode >= 200 && log.statusCode < 300;
        const statusBadge = is2xx
          ? '<span class="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">' + log.statusCode + '</span>'
          : '<span class="px-2 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">' + log.statusCode + '</span>';

        const typeBadge = log.isJury
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">🕵️ JURI / USER</span>'
          : (log.type === 'DEVOPS_ADMIN'
              ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">🛠️ DEVOPS</span>'
              : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/60 text-slate-400">🤖 CRON WARMUP</span>');

        const device = parseDevice(log.userAgent);

        return \`
          <tr class="hover:bg-dark-700/40 transition">
            <td class="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">\${log.timeWIB}</td>
            <td class="py-3 px-4 whitespace-nowrap">\${typeBadge}</td>
            <td class="py-3 px-4">
              <span class="font-bold text-indigo-400 mr-1.5">\${log.method}</span>
              <span class="text-white select-all">\${log.path}</span>
            </td>
            <td class="py-3 px-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                \${statusBadge}
                <span class="text-slate-400 text-[11px]">\${log.durationMs}ms</span>
              </div>
            </td>
            <td class="py-3 px-4 whitespace-nowrap">
              <div class="text-slate-200 select-all">\${log.ip}</div>
              <div class="text-[10px] text-slate-400">\${log.city || '-'}, \${log.country || 'ID'}</div>
            </td>
            <td class="py-3 px-4 text-slate-400 max-w-xs truncate" title="\${log.userAgent}">
              \${device}
            </td>
          </tr>
        \`;
      }).join('');
    }

    function parseDevice(ua) {
      if (!ua || ua === 'Unknown') return 'Unknown';
      if (ua.includes('Postman')) return 'Postman App';
      if (ua.includes('curl')) return 'cURL CLI';
      if (ua.includes('vercel-cron')) return 'Vercel Cron';
      if (ua.includes('GitHub-Hookshot')) return 'GitHub Hook';
      let os = 'OS';
      if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
      else if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

      let browser = 'Browser';
      if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Edg')) browser = 'Edge';

      return \`\${os} • \${browser}\`;
    }

    async function confirmClearLogs() {
      if (!confirm('Hapus seluruh riwayat log yang tersimpan di Redis/Memory?')) return;
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
