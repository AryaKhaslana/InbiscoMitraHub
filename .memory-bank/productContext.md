# Product Context: Inbisco MitraHub

## 1. Masalah Utama yang Diselesaikan
Pada distribusi FMCG tradisional di wilayah Sidoarjo & Krian:
1. **Ketergantungan Kanvaser Manual:** Warung kelontong dan warkop sering kehabisan stok barang cepat laku (*fast-moving* seperti Kopi Torabika, Roma Kelapa, Beng-Beng, Energen, Le Minerale) karena harus menunggu jadwal kunjungan sales kanvaser mingguan.
2. **Risiko Barang Kedaluwarsa di Gudang (Dead Stock):** Gudang distributor membutuhkan visibilitas *First Expired, First Out* (FEFO) berdasarkan *batch number* dan tanggal kedaluwarsa agar stok berumur pendek segera didistribusikan terlebih dahulu.
3. **Inefisiensi Pengiriman Logistik:** Admin gudang membutuhkan pengelompokan pesanan berdasarkan klaster kecamatan di Sidoarjo (Krian, Taman, Waru, Candi, Sidoarjo, dll.) agar rute armada pengiriman optimal.

## 2. User Personas & Workflows
### A. Pemilik Warung / Warkop UMKM (Public User)
- Membuka katalog produk Mayora tanpa hambatan login rumit.
- Mendaftarkan toko/warung baru dengan nomor WhatsApp/HP unik dan titik kecamatan di Sidoarjo.
- Memilih produk dalam satuan karton/dus, memilih metode pembayaran (`COD` atau `TEMPO_7_DAYS`), dan mendapatkan nomor resi (`INB-YYMM-XXXX`).
- Melacak status pengiriman menggunakan nomor resi.

### B. Admin Operasional & Gudang Inbisco (Internal User)
- Memantau metrik harian (Omzet hari ini, total order, toko aktif, antrean pengiriman, produk terlaris).
- Memverifikasi pendaftaran mitra warung baru (kelayakan kredit/tempo & validitas lokasi).
- Memproses status pesanan secara berurutan (`PENDING -> CONFIRMED -> PACKING -> DISPATCHED -> COMPLETED`) atau membatalkan pesanan (`CANCELLED` dari `PENDING`/`CONFIRMED`).
- Memantau inventaris gudang dengan urutan FEFO dan menambah/memperbarui stok produk.

