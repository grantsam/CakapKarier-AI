# Security Audit Report — WebApplication

**Tanggal:** 2026-05-29  
**Scope:** `WebApplication/backend-express`, `WebApplication/frontend-react`

## Ringkasan Eksekutif
Audit security pada WebApplication menemukan kelemahan utama pada auth flow frontend, hardening backend, dan hygiene konfigurasi. Perbaikan prioritas tinggi (P0 dan P1) telah diimplementasikan dan diverifikasi. Dokumentasi serta baseline operasional keamanan juga sudah diperkuat.

## Lifecycle dan Skala Prioritas

### P0 — Kritis
1. **Hilangkan auth bypass berbasis `localStorage.isLoggedIn`**
   - Status: **Selesai**
   - Tindakan:
     - helper auth dipusatkan di `frontend-react/src/utils/auth.js`
     - validasi token memakai klaim `exp`
     - flag `isLoggedIn` lama dibersihkan
     - `ProtectedRoute` ditambahkan di `frontend-react/src/App.jsx`

2. **Perkuat secret hygiene**
   - Status: **Selesai**
   - Tindakan:
     - `WebApplication/.gitignore` diperluas
     - `frontend-react/.env.example` dibuat
     - penggunaan `.env.example` didokumentasikan

### P1 — Tinggi
1. **Tambahkan security headers backend**
   - Status: **Selesai**
   - Tindakan:
     - `helmet` dipasang di `backend-express/src/index.js`

2. **Ganti rate limiter custom ke solusi standar**
   - Status: **Selesai**
   - Tindakan:
     - `backend-express/src/middleware/rateLimit.js` dimigrasikan ke `express-rate-limit`
     - unit test rate limiter diperbarui

3. **Perkuat auth request handling**
   - Status: **Selesai**
   - Tindakan:
     - `frontend-react/src/utils/api.js` hanya menyisipkan token valid
     - `401` membersihkan auth state otomatis
     - halaman profil menggunakan helper auth, bukan akses raw ke storage

### P2 — Menengah / Operasional
1. **Tambahkan baseline documentation**
   - Status: **Selesai**
   - Tindakan:
     - update `WebApplication/README.md`
     - update `backend-express/README.md`
     - update `frontend-react/README.md`

2. **Tambahkan workflow audit dependency**
   - Status: **Selesai**
   - Tindakan:
     - tambah script `audit:security` di backend dan frontend package.json

## File yang Diubah

### Frontend
- `frontend-react/src/utils/auth.js`
- `frontend-react/src/utils/api.js`
- `frontend-react/src/pages/ProfilPage.jsx`
- `frontend-react/src/pages/EditProfilPage.jsx`
- `frontend-react/src/App.jsx`
- `frontend-react/.env.example`
- `frontend-react/package.json`
- `frontend-react/README.md`

### Backend
- `backend-express/src/index.js`
- `backend-express/src/middleware/rateLimit.js`
- `backend-express/test/rateLimit.test.js`
- `backend-express/package.json`
- `backend-express/package-lock.json`
- `backend-express/README.md`

### Workspace
- `WebApplication/.gitignore`
- `WebApplication/README.md`

## Hasil Verifikasi

### Backend test
```bash
npm test --prefix WebApplication/backend-express
```
Hasil: **PASS**

### Frontend build
```bash
npm run build --prefix WebApplication/frontend-react
```
Hasil: **PASS**

### Backend dependency audit
```bash
npm audit --prefix WebApplication/backend-express --audit-level=high
```
Hasil: **0 vulnerabilities**

### Frontend dependency audit
```bash
npm run audit:security --prefix WebApplication/frontend-react
```
Hasil: **0 vulnerabilities**

## Risiko yang Masih Tersisa
1. Token frontend masih berada di browser storage. Ini sudah lebih aman dibanding flag boolean palsu, tetapi target ideal berikutnya adalah migrasi ke **HttpOnly Secure SameSite cookie**.
2. CSP ketat belum diterapkan. Saat ini baru baseline hardening dengan `helmet`; CSP production perlu disesuaikan dengan deployment final.
3. Belum ada mekanisme CSRF karena auth saat ini belum berbasis cookie HttpOnly.

## Rekomendasi Tahap Berikutnya
1. Migrasi auth token ke cookie `HttpOnly`.
2. Tambahkan CSRF strategy jika auth berbasis cookie diterapkan.
3. Tambahkan frontend security audit ke pipeline CI/CD.
4. Terapkan CSP production dan dokumentasikan allowlist final.

## Kesimpulan
Perbaikan prioritas tinggi untuk WebApplication sudah selesai diimplementasikan. Risiko terbesar—auth bypass frontend berbasis `isLoggedIn`, hardening header backend, dan rate limiting custom—sudah ditangani. Sistem kini memiliki baseline keamanan yang lebih baik, dokumentasi operasional yang lebih jelas, serta proses verifikasi yang dapat diulang.
