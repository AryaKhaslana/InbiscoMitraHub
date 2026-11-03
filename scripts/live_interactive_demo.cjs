const puppeteer = require('/tmp/node_modules/puppeteer-core');

const CHROMIUM_BIN = '/nix/store/7d79gfynv59x9lv4dd3n6haqw5kl4jcq-chromium-154.0.8037.57/bin/chromium';
const BASE_URL = 'https://inbisco-mitrahub.vercel.app';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runLiveVisualDemo() {
  console.log('===========================================================');
  console.log('🎬 INBISCO MITRAHUB — LIVE BROWSER AUTOMATION DEMO');
  console.log('Jendela browser akan muncul di layar desktop KDE kamu!');
  console.log('===========================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_BIN,
    headless: false, // TAMPIL LANGSUNG DI LAYAR!
    slowMo: 80,      // Diperlambat agar mata manusia bisa melihat kursor & ketikan
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1280,850',
      '--window-position=100,50'
    ]
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // -------------------------------------------------------------
    // TOUR 1: BERANDA UTAMA & LIVE TRACKING AWB
    // -------------------------------------------------------------
    console.log('📍 [Tour 1] Membuka Beranda Utama...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await sleep(2000);

    console.log('   Scrolling melihat showcase fitur beranda...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await sleep(1500);

    console.log('   Mencoba fitur Lacak Resi AWB...');
    await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('INB-2610-KR06'));
      if (chip) chip.click();
    });
    await sleep(2500);

    // -------------------------------------------------------------
    // TOUR 2: KATALOG PRODUK GROSIR & ORDER KARTONAN
    // -------------------------------------------------------------
    console.log('📍 [Tour 2] Pindah ke Katalog Produk Grosir Mayora (/products)...');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    console.log('   Membuka modal detail produk Roma Biskuit Kelapa...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pesan Kartonan'));
      if (btn) btn.click();
    });
    await sleep(2000);

    console.log('   Menambah kuantitas dus (+)...');
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const plusBtn = document.querySelector('button:has(svg.lucide-plus)');
        if (plusBtn) plusBtn.click();
      });
      await sleep(600);
    }
    await sleep(2000);

    // Tutup modal
    await page.keyboard.press('Escape');
    await sleep(1000);

    // -------------------------------------------------------------
    // TOUR 3: FORMULIR PENDAFTARAN MITRA & AUTO-FILL SAMPLE
    // -------------------------------------------------------------
    console.log('📍 [Tour 3] Masuk ke Formulir Pendaftaran Mitra (/partnership)...');
    await page.goto(`${BASE_URL}/partnership`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    console.log('   Menerapkan Auto-Fill Uji Form "Toko Berkah Barokah (Krian)"...');
    await page.evaluate(() => {
      const presetBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Toko Berkah'));
      if (presetBtn) presetBtn.click();
    });
    await sleep(1800);

    console.log('   Loncat ke Langkah 4 (Ringkasan Data & Verifikasi)...');
    await page.evaluate(() => {
      const jumpBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Loncat ke Ringkasan'));
      if (jumpBtn) jumpBtn.click();
    });
    await sleep(2000);

    console.log('   Mengirim formulir pendaftaran kemitraan...');
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Kirim Formulir Pendaftaran') || b.innerText.includes('Konfirmasi'));
      if (submitBtn) submitBtn.click();
    });
    await sleep(3000); // Lihat pop-up sukses dan kop surat mitra resmi!

    // -------------------------------------------------------------
    // TOUR 4: DASHBOARD ADMIN GUDANG DEPO KRIAN & FEFO MATRIX
    // -------------------------------------------------------------
    console.log('📍 [Tour 4] Membuka Portal Login Admin (/login)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    console.log('   Memilih akun demo "Admin Depo Krian" & Masuk...');
    await page.evaluate(() => {
      const depoBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Depo Krian') || b.innerText.includes('Gudang'));
      if (depoBtn) depoBtn.click();
    });
    await sleep(1000);

    await page.evaluate(() => {
      const loginSubmit = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Masuk Portal'));
      if (loginSubmit) loginSubmit.click();
    });
    await sleep(3000);

    console.log('   Melihat tabel inventaris stok FEFO (Merah/Kuning/Hijau)...');
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await sleep(3000);

    console.log('\n✨ [SELESAI] Demo otomatis selesai dieksekusi dengan sempurna!');
    console.log('Browser akan tetap terbuka selama 15 detik agar kamu bisa melihat-lihat...');
    await sleep(15000);

  } catch (err) {
    console.error('Error saat demo:', err);
  } finally {
    await browser.close();
    console.log('Browser ditutup. Selesai!');
  }
}

runLiveVisualDemo();

