# WebApplication

Area kerja frontend dan backend aplikasi.

## Fokus
- Backend: API gateway, auth, dan integrasi AI service.
- Frontend: pengalaman pengguna untuk insight karier.

## Struktur penting
- `backend-express/`: service API utama.
- `frontend-react/`: aplikasi antarmuka pengguna.

Setiap perubahan kontrak API backend harus dikoordinasikan dengan tim frontend melalui PR dan dokumen kontrak.

## Baseline keamanan
- Simpan secret hanya di file `.env` lokal atau secret manager deployment; jangan commit `.env`.
- Gunakan `.env.example` sebagai template tanpa nilai rahasia nyata.
- Jalankan audit dependency sebelum release:
  - backend: `npm run audit:security` dari folder `WebApplication/backend-express`
  - frontend: cek dependency frontend secara manual / gunakan audit sesuai package manager yang aktif
- Jalankan verifikasi minimal sebelum deploy:
  - backend: `npm test` dari folder `WebApplication/backend-express`
  - frontend: `npm run build` dari folder `WebApplication/frontend-react`
- Pastikan `VITE_API_BASE_URL` di frontend menunjuk ke backend yang benar, dan `AI_CAREER_MATCH_URL` di backend menunjuk ke AIEngine yang aktif.
- Untuk demo capstone lokal, jalankan service berurutan: AIEngine -> backend -> frontend.
- Pastikan production memakai HTTPS, CORS allowlist eksplisit, `JWT_SECRET` kuat, dan `API_DOCS_ENABLED=false` kecuali dibutuhkan.

Laporan audit security terbaru tersedia di `SECURITY_AUDIT_REPORT.md`.
