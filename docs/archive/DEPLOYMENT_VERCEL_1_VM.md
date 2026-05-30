# [DEPRECATED] Panduan Deployment Final: Vercel + 1 Azure VM

> **DEPRECATED**: Dokumen ini adalah panduan setup awal. Gunakan `docs/architecture/DEPLOYMENT_AZURE_VM.md` untuk konfigurasi VM aktual yang sudah berjalan.

Berdasarkan rubrik penilaian capstone, arsitektur ini sudah memenuhi seluruh kriteria wajib, termasuk:
1. Frontend di Vercel.
2. Backend Express API.
3. AIEngine FastAPI API mandiri.
4. Database terhubung.

Semua komponen backend, AI, dan database akan di-deploy ke **1 Azure VM (B2s)** agar aman dengan budget Student Pack ($75).

---

## TAHAP 1: Membuat Azure VM

1. Login ke **Azure Portal**.
2. Cari dan buka **Virtual machines**, lalu klik **Create -> Azure virtual machine**.
3. Isi tab **Basics**:
   - **Resource group**: `rg-cakapkarier-demo` (create new).
   - **Virtual machine name**: `vm-cakapkarier`.
   - **Region**: Pilih yang terdekat (misal: `Southeast Asia`).
   - **Security type**: Standard.
   - **Image**: `Ubuntu Server 22.04 LTS - x64 Gen2`.
   - **Size**: Cari dan pilih `Standard_B2s` (2 vCPU, 4 GiB memory). *(Wajib B2s agar RAM cukup untuk TensorFlow).*
   - **Authentication type**: Password (atau SSH public key jika Anda familiar).
   - **Username**: `azureuser`.
   - **Password**: Isi dengan password kuat.
4. Di tab **Networking**:
   - **Public IP**: Biarkan default (buat baru).
   - **NIC network security group**: Advanced.
   - Buka port `22` (SSH), `80` (HTTP), `443` (HTTPS), `3000` (Backend API), dan `8001` (AIEngine API).
5. Klik **Review + create**, lalu **Create**.
6. Setelah VM selesai dibuat, catat **Public IP Address** VM tersebut.

---

## TAHAP 2: Setup Database & Environment VM

Buka terminal/command prompt di komputer lokal Anda dan akses VM via SSH:

```bash
ssh azureuser@<PUBLIC_IP_VM>
```

Masukkan password Anda saat diminta.

### 2.1 Update & Install Dependency Dasar

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nano software-properties-common wget ufw
```

### 2.2 Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

Setup database dan user:

```bash
sudo -i -u postgres

# Masuk ke PostgreSQL prompt
psql

# Di dalam prompt PostgreSQL (tanda =>), jalankan baris per baris:
CREATE DATABASE cakapkarier_db;
CREATE USER cakapkarier WITH PASSWORD 'password_super_kuat_anda';
ALTER ROLE cakapkarier SET client_encoding TO 'utf8';
ALTER ROLE cakapkarier SET default_transaction_isolation TO 'read committed';
ALTER ROLE cakapkarier SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE cakapkarier_db TO cakapkarier;
\q

exit
```

### 2.3 Install Node.js (untuk Backend)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Install PM2 (process manager):

```bash
sudo npm install -g pm2
```

### 2.4 Install Python 3.12 (untuk AIEngine)

Ubuntu 22.04 memakai Python 3.10 bawaan. AIEngine sebaiknya memakai 3.11 atau 3.12.

```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev
```

---

## TAHAP 3: Upload Code ke VM

Cara paling mudah: clone dari GitHub langsung di VM.

```bash
cd ~
git clone https://github.com/<username-anda>/<repo-cakapkarier>.git cakapkarier
cd cakapkarier
```

---

## TAHAP 4: Deploy AIEngine (FastAPI)

```bash
cd ~/cakapkarier/AIEngine

# Buat dan aktifkan virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install requirements
pip install --upgrade pip
pip install -r requirements.txt

# Buat file .env
nano .env
```

Isi `.env` AIEngine:

```env
GENAI_PROVIDER=gemini
GENAI_API_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
GENAI_MODEL=gemini-2.5-flash-lite
GENAI_TIMEOUT_SECONDS=8
GENAI_MAX_RETRIES=1
GENAI_API_KEY=isi_dengan_key_gemini_anda
```
*(Tekan `Ctrl+X`, `Y`, `Enter` untuk save)*

**Jalankan dengan PM2 agar hidup terus di background:**

```bash
# Pastikan masih di folder AIEngine dan venv masih aktif
pm2 start "venv/bin/uvicorn career_match.app:app --app-dir services/career-match/src --host 0.0.0.0 --port 8001" --name ai-engine
```

Cek apakah hidup:
```bash
curl http://127.0.0.1:8001/health
```
*(Jika muncul JSON "status": "ok", lanjut ke Tahap 5)*

---

## TAHAP 5: Deploy Backend Express

```bash
cd ~/cakapkarier/WebApplication/backend-express

# Install node_modules
npm install

# Buat file .env
nano .env
```

Isi `.env` Backend:

```env
PORT=3000
NODE_ENV=production
TRUST_PROXY=true
API_DOCS_ENABLED=false
DEBUG_ERRORS=false
JSON_BODY_LIMIT=256kb

# Ganti dengan domain Vercel Anda nanti setelah deploy frontend
FRONTEND_URL=https://cakapkarier.vercel.app
CORS_ORIGINS=https://cakapkarier.vercel.app,http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=cakapkarier
DB_PASSWORD=password_super_kuat_anda
DB_NAME=cakapkarier_db
DB_SSL=false

JWT_SECRET=bikin_secret_panjang_acak_minimal_32_karakter
JWT_EXPIRES_IN=1h

AI_CAREER_MATCH_URL=http://127.0.0.1:8001
AI_REQUEST_TIMEOUT_MS=30000

# Opsional: Jika mau test fitur email
# SMTP_HOST=smtp.gmail.com
# ...
```
*(Tekan `Ctrl+X`, `Y`, `Enter` untuk save)*

**Jalankan Backend dengan PM2:**

```bash
pm2 start src/index.js --name backend
```

Simpan status PM2 agar otomatis hidup waktu VM restart:
```bash
pm2 save
pm2 startup
# (Copy paste command yang muncul di layar, lalu enter)
```

Cek apakah backend hidup:
```bash
curl http://127.0.0.1:3000/health
```

---

## TAHAP 6: Setup Nginx Reverse Proxy (Supaya API bisa diakses)

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/cakapkarier
```

Isi file Nginx:
*(Ganti `IP_VM_ANDA` dengan Public IP VM Azure)*

```nginx
server {
    listen 80;
    server_name IP_VM_ANDA;

    # Backend Express
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # AIEngine FastAPI (memenuhi rubrik API mandiri)
    location /ai/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan config Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/cakapkarier /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Cek dari luar
Buka browser di laptop Anda, cek:
- `http://<PUBLIC_IP_VM>/api/health`
- `http://<PUBLIC_IP_VM>/ai/health`

Jika keduanya merespons JSON, setup server Anda **SUKSES**.

---

## TAHAP 7: Deploy Frontend React ke Vercel

1. Login ke Vercel Dashboard (vercel.com).
2. Add New Project -> Import dari GitHub.
3. Root Directory: `WebApplication/frontend-react`.
4. Tambahkan Environment Variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `http://<PUBLIC_IP_VM>/api`
   *(Gunakan IP public VM Anda. Jika nanti pasang domain HTTPS, ganti urlnya di sini).*
5. Klik **Deploy**.
6. Setelah selesai, copy URL Vercel yang diberikan (misal: `https://cakapkarier.vercel.app`).

### Update CORS Backend (Wajib!)
Kembali ke VM, edit `.env` backend untuk mengizinkan domain Vercel tadi:

```bash
cd ~/cakapkarier/WebApplication/backend-express
nano .env
```

Ubah baris CORS:
```env
FRONTEND_URL=https://cakapkarier.vercel.app
CORS_ORIGINS=https://cakapkarier.vercel.app
```

Restart backend:
```bash
pm2 restart backend
```

---

## TAHAP 8: Smoke Test End-to-End

Buka aplikasi frontend di URL Vercel, lalu coba:
1. Register user baru (ini memastikan PostgreSQL bekerja).
2. Login.
3. Isi data profil dan submit analisis (ini memastikan Backend berhasil memanggil AIEngine).
4. Hasil muncul (ini memastikan AIEngine Inference jalan).

### Selamat! Proyek Capstone Anda sudah Production-Ready.
