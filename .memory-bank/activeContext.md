# Active Context: Inbisco MitraHub

## 1. Current Focus
Seluruh 15 endpoint REST API (7 Public + 8 Admin) dan 6 putaran Security Hardening telah selesai, teruji otomatis, dan terdokumentasi lengkap di `README.md` serta `.memory-bank/progress.md` sebagai panduan integrasi untuk Frontend (Raka).

## 2. Recent Additions
- Menambahkan endpoint **`POST /api/v1/stores/lookup`** (`{ "phone": "0812..." }`) dengan rate-limit ketat (10 req/m) dan redaksi PII (`id`, `name`, `district`, `isVerified`) agar warung lama yang sudah diverifikasi Admin bisa mengambil kembali `storeId` mereka saat hendak checkout di Frontend tanpa membocorkan `storeId` di halaman publik.
- Menyusun Master Handover & Progress Document di `README.md` dan `.memory-bank/progress.md`.

## 3. Immediate Next Steps
1. Deploy perubahan terbaru (`POST /api/v1/stores/lookup` & `Cache-Control: no-store`) ke Vercel (`vercel --prod` atau `git push`).
2. Bagikan file `README.md` ke Raka (Frontend Developer) sebagai acuan kontrak API.
