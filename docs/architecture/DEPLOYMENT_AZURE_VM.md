# Panduan Deployment Nyata: Azure VM + Vercel
## Status Real-time Infrastruktur & Konfigurasi VM CakapKarier-AI
*Terakhir Diperbarui: 2026-05-31*

Dokumen ini mendokumentasikan status terkini, konfigurasi aktual, dan detail arsitektur **Azure VM (Ubuntu 24.04 LTS)** yang digunakan untuk demo/capstone production. Dokumentasi ini dibuat agar siapapun yang melanjutkan session berikutnya langsung memahami isi perut VM tanpa perlu meraba-raba kembali.

---

## 1. Topologi Arsitektur
Sistem ini menggunakan arsitektur hybrid yang memisahkan frontend statis dengan backend & AI Engine dinamis demi keamanan dan efisiensi biaya:
*   **Frontend**: React (Vite) di-deploy ke **Vercel** (HTTPS bawaan).
*   **Reverse Proxy**: **Nginx** di Azure VM melayani port `80` (HTTP) dan `443` (HTTPS via Certbot SSL).
*   **Backend API**: Express.js berjalan di Azure VM menggunakan port lokal `3000` (diproxy oleh Nginx `/api/`).
*   **AI Engine**: FastAPI berjalan di Azure VM menggunakan port lokal `8001` (diproxy oleh Nginx `/ai/`).
*   **Database**: PostgreSQL lokal di Azure VM pada port default `5432`.

---

## 2. Spesifikasi & Kapasitas VM Aktual (Azure B2s)
Berdasarkan hasil audit sistem langsung (`free -h`, `lscpu`, `df -h`):

*   **CPU**: 2 Cores (AMD EPYC 7763 64-Core Processor)
*   **RAM Total**: **3.8 GiB** (~4 GB RAM)
*   **RAM Beban Idle/Normal**:
    *   Sistem + PostgreSQL + Nginx + PM2 Idle: **1.0 GiB** terpakai.
    *   Sisa RAM Tersedia: **2.8 GiB**.
    *   **Swap Space**: **0 Bytes** (Non-aktif).
*   **Penyimpanan**: `/dev/root` kapasitas **29 GB** (Terpakai 6.0 GB / 22%, Sisa **23 GB** kosong).
*   **Analisis Kapasitas Model Lokal**:
    Dengan sisa RAM ~2.8 GiB dan tanpa Swap, **sangat berisiko untuk menginstal LLM lokal besar (seperti Ollama + Llama 3.1 8B)** karena akan memicu out-of-memory (OOM) crash pada PostgreSQL/Backend. **Sangat disarankan menggunakan AI Provider eksternal (OpenRouter)** atau model lokal ultra-kecil (`llama3.2:1b` / `phi3`) jika terpaksa.

---

## 3. Konfigurasi Proses (PM2 Status)
Kedua layanan backend utama berjalan stabil di background dengan Process Manager PM2:

```text
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ backend            │ fork     │ 1    │ online    │ 0%       │ 85.6mb   │
│ 5  │ ai-engine          │ fork     │ 0    │ online    │ 0%       │ 716.8mb  │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```
*Catatan: Pastikan untuk menjalankan perintah `pm2 save` setelah modifikasi agar konfigurasi ini bertahan ketika VM direstart.*

---

## 4. Konfigurasi Reverse Proxy Nginx Aktual
File konfigurasi aktif berada di `/etc/nginx/sites-available/cakapkarier`. 

**PENTING (Fix untuk "Route tidak ditemukan"):**
Format proxy untuk `/api/` sengaja dibuat **tanpa** trailing slash pada `proxy_pass` agar prefix `/api` tetap diteruskan ke Express. Express secara native mendaftarkan route dengan prefix `/api/...` (seperti `/api/auth/signup`).

```nginx
server {
    listen 80;
    server_name cakapkarier.duckdns.org; # Atau IP Publik Azure VM

    # Routing ke Backend Express (Port 3000)
    location /api/ {
        # Jangan beri trailing slash di belakang 3000!
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Routing ke AIEngine FastAPI (Port 8001)
    location /ai/ {
        proxy_pass http://127.0.0.1:8001/; # Menggunakan trailing slash karena FastAPI tidak memakai prefix /ai/ secara native
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Integrasi GenAI & OpenRouter (Penyelesaian Isu Region)
### Masalah Asli:
Request langsung ke Google Gemini API dari VM Azure yang berada di regional East Asia (atau zona tertentu) diblokir oleh Google dengan pesan error:
`HTTPError 400: Bad Request - User location is not supported for the API use.`

### Solusi yang Diimplementasikan:
Menggunakan **OpenRouter** sebagai jembatan/proxy API key agar bypass pembatasan regional.

### Konfigurasi `.env` AIEngine Terkini (`~/cakapkarier/AIEngine/.env`):
```env
GENAI_PROVIDER=openrouter
GENAI_API_URL=https://openrouter.ai/api/v1/chat/completions
GENAI_MODEL=z-ai/glm-4.5-air:free # ATAU openai/gpt-oss-120b:free (Hindari model Google demi kestabilan wilayah)
GENAI_TIMEOUT_SECONDS=12
GENAI_MAX_RETRIES=0
GENAI_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx... # Isi dengan API key OpenRouter
```

### Mekanisme Fallback Cerdas:
Jika API OpenRouter mengalami kegagalan, timeout, atau credit habis, file `genai.py` memiliki fungsi `deterministic_summary` bawaan. Sistem akan otomatis menampilkan ringkasan terstruktur statis berbasis kecocokan profil tanpa merusak alur aplikasi/menyebabkan crash di frontend.

---

## 6. Checklist Verifikasi Endpoints (Smoke Test)
Jalankan perintah pengujian berikut langsung di terminal VM atau laptop lokal Anda untuk memastikan kesehatan sistem:

1.  **Verifikasi Kesehatan Backend & Database Express**:
    ```bash
    curl http://127.0.0.1:3000/health
    # Respons sukses: {"status":"UP","database":"Connected","timestamp":"..."}
    ```
2.  **Verifikasi Express via Nginx**:
    ```bash
    curl http://cakapkarier.duckdns.org/health
    ```
3.  **Verifikasi Route Register/Signup (Bukan Route tidak ditemukan!)**:
    ```bash
    curl -X POST http://127.0.0.1:3000/api/auth/signup \
      -H "Content-Type: application/json" \
      -d '{"nama":"Test","email":"test@test.com","password":"Password1!"}'
    # Harus merespons error validasi/database, BUKAN 404 "Route tidak ditemukan"
    ```
4.  **Verifikasi AIEngine FastAPI**:
    ```bash
    curl http://127.0.0.1:8001/health
    # Respons sukses: {"status":"ok","model_loaded":true,"catalog_size":...}
    ```
5.  **Verifikasi AIEngine GenAI Health (OpenRouter Status)**:
    ```bash
    curl http://127.0.0.1:8001/genai/health
    # Respons sukses: {"provider":"openrouter","api_url":"...","api_key_configured":true,...,"available":true,"sample":"ok"}
    ```

---

## 7. Instruksi Pemeliharaan Cepat
*   **Melihat Log Error Backend**: `pm2 logs backend --lines 50`
*   **Melihat Log Error AIEngine**: `pm2 logs ai-engine --lines 50`
*   **Restart Nginx**: `sudo systemctl reload nginx`
*   **Mengaktifkan Virtual Environment Python**:
    ```bash
    cd ~/cakapkarier/AIEngine
    source venv/bin/activate
    ```
*   **Mengecek Proses Port VM**: `sudo lsof -i :3000` atau `sudo lsof -i :8001`
