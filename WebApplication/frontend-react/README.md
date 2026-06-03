# frontend-react

Aplikasi web (Antarmuka Pengguna) utama untuk CakapKarier-AI

* **Framework:** React.js 
* **Build Tool / Bundler:** Vite 
* **Routing:** React Router DOM v6
* **Styling:** Tailwind CSS & Google Fonts (Poppins)
* **HTTP Client:** Axios (Dibungkus melalui utilitas `api.js`)
* **Icons:** `@tabler/icons-react`

## Menjalankan Project di Lokal

1.  **Masuk ke direktori frontend:**
    ```bash
    cd WebApplication/frontend-react
    ```
2.  **Install dependensi:**
    ```bash
    npm install
    ```
3.  **Jalankan server development (Vite):**
    ```bash
    npm run dev
    ```
4.  Buka tautan lokal yang tertera di terminal (biasanya `http://localhost:5173`).

## Baseline keamanan frontend
- Gunakan `VITE_API_BASE_URL` dari `.env.local` atau `.env.example`; jangan menyimpan secret di variabel `VITE_*`.
- Route penting sekarang dilindungi dengan `ProtectedRoute` dan helper auth terpusat.
- Token yang kedaluwarsa akan dibersihkan otomatis dari state auth frontend.
- Jalankan audit dependency sebelum release:
  ```bash
  npm run audit:security
  ```
- Jalankan build produksi untuk mendeteksi regresi routing/auth:
  ```bash
  npm run build
  ```