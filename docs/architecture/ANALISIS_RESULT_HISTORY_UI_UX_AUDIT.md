# Audit UI/UX Result Analisis dan History

Tanggal audit: 2026-05-24  
Area: `AnalisisResultPage.jsx` dan `HistoryPage.jsx`  
Basis audit: source code frontend, kontrak API lokal, dan prinsip `$ui-ux-designer` dari roadmap UX Design.

## Ringkasan Eksekutif

Halaman Result Analisis sudah lebih kuat sebagai halaman keputusan karena memiliki blok kesimpulan, skor utama, gap prioritas, roadmap, dan transparansi data yang dapat dibuka. Masalah terbesar yang tersisa adalah urutan rekomendasi belum sepenuhnya mengarahkan user ke tindakan berikutnya, beberapa informasi masih berulang, dan detail debug masih muncul di console.

Halaman History sudah fungsional dan menampilkan perkembangan, tetapi masih terasa seperti daftar record. User belum dibantu memahami tren secara naratif, membandingkan hasil antar analisis, atau memilih analisis mana yang perlu dibuka lebih dulu.

Data API nyata yang digunakan untuk sanity check:

| Item | Nilai |
| --- | --- |
| Sample analysis ID | `f766e5e2-8988-4c39-b276-01f93293e674` |
| Total history | `5` |
| Latest score | `52.91` |
| Previous score | `54.95` |
| Score delta | `-2.04` |
| Latest mastered skill count | `1` |
| Predicted role | `Oracle Retail Cloud Techno Functional Consultant-Siocs` |
| Primary gap | `cloud`, prioritas `Tinggi` |
| Roadmap phases | `3` |
| Top matches | `5` |

## Audit Result Analisis Page

| ID | Prioritas | Temuan | Dampak UX | Bukti di UI/code |
| --- | --- | --- | --- | --- |
| R1 | P1 | Ringkasan dan kartu metrik mengulang skor/status dalam jarak dekat. | User melihat informasi yang sama dua kali sebelum sampai ke gap dan roadmap. Ini menambah cognitive load. | Blok `Kesimpulan` lalu kartu `Estimasi Kesiapan`. |
| R2 | P1 | Rekomendasi langkah sukses muncul setelah bagian transparansi. | User dapat masuk ke detail audit sebelum melihat langkah praktis. Urutan ideal adalah keputusan, gap, roadmap, tips, lalu transparansi. | Section tips berada setelah `Kenapa hasil ini muncul?`. |
| R3 | P1 | Roadmap tampil sebagai fase, tetapi tidak memberi status tindakan, checkpoint, atau CTA. | Roadmap mudah dibaca, tetapi user belum punya mekanisme menandai progress atau melanjutkan ke rencana belajar. | Section `Fase Roadmap Pengembangan Keterampilan`. |
| R4 | P2 | Transparansi collapsed sudah tepat, tetapi belum ada indikator bahwa isi berisi data penting seperti skill evidence dan lowongan pembanding. | Sebagian user mungkin tidak membuka evidence sehingga trust terhadap hasil tidak terbentuk. | Toggle `Kenapa hasil ini muncul?`. |
| R5 | P2 | Detail lowongan pembanding hanya menampilkan title, company, dan match percentage. | User tidak bisa mengecek alasan match secara cepat, misalnya matched/missing skills, lokasi, atau mode kerja. | Render `validTopMatches.slice(0, 3)`. |
| R6 | P2 | Empty/partial state masih generic untuk beberapa area. | Jika AI/backend mengirim field kosong sebagian, user hanya mendapat "belum tersedia" tanpa konteks apakah data tidak dikirim, tidak relevan, atau gagal diproses. | Fallback `Belum tersedia`, `Data skill belum tersedia`, `Data roadmap belum tersedia`. |
| R7 | P3 | Console debug masih ada di production-facing component. | Tidak merusak UI langsung, tetapi mengganggu observability dan berisiko mengekspos data analisis di console browser. | `console.log` pada params, data baru, dan endpoint fetch. |

## Audit History Page

| ID | Prioritas | Temuan | Dampak UX | Bukti di UI/code |
| --- | --- | --- | --- | --- |
| H1 | P1 | Ringkasan perkembangan belum memberi interpretasi perubahan skor. | User melihat `-2.04 poin`, tetapi tidak diberi arti praktis atau langkah berikutnya. | Card `Perubahan Skor`. |
| H2 | P1 | Item history memakai target/predicted role sebagai heading tanpa membedakan sumbernya. | Jika `target_role` kosong, heading bisa terlihat seperti target user padahal itu hasil prediksi katalog. | Heading item: `item.target_role || item.predicted_role`. |
| H3 | P1 | Tidak ada fitur compare antar analisis. | Klaim halaman "bandingkan hasil analisis dari waktu ke waktu" belum didukung aksi eksplisit. | Copy header menyebut bandingkan, tetapi UI hanya list dan detail. |
| H4 | P2 | Skor history ditampilkan mentah, belum dibulatkan seperti Result Page. | Inkonstensi tampilan angka dapat membuat page terasa kurang terpadu. | `formatMetric(item.readiness_score...)`. |
| H5 | P2 | Card history tidak menampilkan primary gap atau insight utama. | User harus buka detail satu per satu untuk tahu masalah utama setiap analisis. | List hanya tanggal, skill count, gap count, score. |
| H6 | P2 | Load more memakai offset dari pagination saat ini, tetapi tidak memberi konteks jumlah yang sudah tampil. | User tidak tahu "5 dari 20" atau kapan daftar selesai selain tombol hilang. | Button `Muat Riwayat Lainnya`. |
| H7 | P2 | Error state tidak menawarkan retry. | Jika fetch gagal non-401, user hanya melihat pesan error tanpa aksi pemulihan. | Error banner hanya teks. |
| H8 | P3 | Console debug navigasi masih ada. | Debug record ID tidak perlu tampil di browser console user. | `console.log("=== DEBUG NAVIGASI ===")`. |

## Solusi Lanjutan

### Result Analisis

| Masalah | Solusi | Catatan Implementasi |
| --- | --- | --- |
| R1: informasi skor berulang | Gabungkan fungsi blok `Kesimpulan` dan kartu skor, atau ubah kartu skor menjadi detail sekunder. | Pertahankan satu angka hero utama. Kartu lain fokus ke `Skill Terdeteksi` dan `Gap`. |
| R2: tips terlalu bawah | Pindahkan `Rekomendasi Langkah Sukses` sebelum transparency section. | Urutan baru: Kesimpulan, metrik, gap, roadmap, tips, transparansi. |
| R3: roadmap belum actionable | Tambahkan CTA non-substantif seperti `Gunakan fase ini sebagai rencana belajar` dan state visual "Fase 1/2/3". | Jangan menambah isi roadmap baru di frontend. Jika butuh output/checkpoint spesifik, perlu kontrak AI/backend baru. |
| R4: transparency kurang menarik untuk dibuka | Tambahkan badge kecil pada toggle, misalnya `Profil AI + lowongan pembanding`. | Tetap collapsed default agar page utama fokus. |
| R5: lowongan minim konteks | Dalam card lowongan, tampilkan lokasi dan maksimal 2 matched/missing skill jika sudah ada di payload. | Field tersedia dalam `top_matches`: `location`, `matched_skills`, `missing_skills`. |
| R6: empty state generic | Buat helper copy per area: "Backend belum mengirim roadmap" vs "Tidak ada gap terdeteksi". | Jangan menyalahkan user ketika field kosong dari model. |
| R7: console debug | Hapus console debug atau bungkus dengan environment guard development. | Hindari mengekspos payload profil di console production. |

### History

| Masalah | Solusi | Catatan Implementasi |
| --- | --- | --- |
| H1: delta tidak diinterpretasikan | Tambahkan microcopy adaptif: naik, turun, stabil, belum cukup data. | Contoh: `Skor turun 2 poin dari analisis sebelumnya. Buka detail terbaru untuk melihat gap utama.` |
| H2: heading ambigu | Pisahkan label: `Target` jika `target_role` ada, `Role prediksi` jika tidak. | Konsisten dengan Result Page yang sudah membedakan target kosong. |
| H3: tidak ada compare | Tambahkan fase pertama berupa "compare ringan" di summary, bukan fitur kompleks dulu. | Misalnya tampilkan latest vs previous score dan delta skill. Fitur compare checkbox masuk P3. |
| H4: angka tidak konsisten | Format readiness score dengan `Math.round`. | Cocokkan dengan Result Page. |
| H5: tidak ada insight utama | Tambahkan `primary_gap` jika tersedia dari API list, atau beri label "Buka detail untuk melihat gap utama". | API list saat ini belum membawa `skill_gap_analysis`, jadi jangan invent data. |
| H6: load more kurang konteks | Tambahkan teks `Menampilkan X dari Y analisis`. | Gunakan `historyItems.length` dan `pagination.total`. |
| H7: error tanpa retry | Tambahkan tombol `Coba Lagi` yang memanggil `fetchHistory()`. | Khusus error non-401. |
| H8: console debug | Hapus console debug navigasi. | Tidak memengaruhi behavior. |

## Lifecycle Implementation

### Phase 0: Baseline dan Guardrail

Prioritas: P0

- Ambil snapshot data API real untuk satu history terbaru dan satu detail result.
- Catat expected values untuk regression:
  - latest score `52.91` tampil sebagai `53`.
  - target kosong tampil sebagai `Target belum dipilih`.
  - predicted role tetap tampil sesuai payload.
  - primary gap `cloud` tetap tampil dari `skill_gap_analysis`.
- Pastikan perubahan frontend tidak menambah rekomendasi yang tidak dikirim backend/AI.

Acceptance criteria:

- Result detail dan history masih dapat fetch endpoint yang sama.
- Tidak ada perubahan kontrak API.
- Build dan lint frontend lulus.

### Phase 1: Correctness dan Copy Consistency

Prioritas: P0

- Hapus atau guard semua `console.log` debug di `AnalisisResultPage.jsx` dan `HistoryPage.jsx`.
- Samakan formatting angka di History dengan Result:
  - readiness score dibulatkan.
  - delta score maksimal 1-2 desimal.
- Ubah heading history agar membedakan `Target` dan `Role prediksi`.
- Tambahkan retry button pada error state History.

Acceptance criteria:

- Tidak ada payload user tercetak di console browser.
- History item dengan `target_role: null` tidak lagi terlihat seperti target user.
- Error non-401 memberi aksi pemulihan.

### Phase 2: Decision-First Result Flow

Prioritas: P1

- Kurangi repetisi antara blok `Kesimpulan` dan kartu `Estimasi Kesiapan`.
- Pindahkan `Rekomendasi Langkah Sukses` ke atas transparency section.
- Tambahkan konteks ringan pada toggle transparency agar user tahu isinya evidence, bukan sekadar debug.
- Tambahkan lokasi dan matched/missing skills pada lowongan pembanding jika field tersedia.

Acceptance criteria:

- Dalam 5 detik user dapat memahami role cocok, skor, gap utama, dan langkah berikutnya.
- Transparency tetap optional dan tidak mendominasi halaman.
- Lowongan pembanding lebih mudah dipercaya karena alasan match terlihat.

### Phase 3: History as Progress Narrative

Prioritas: P1

- Tambahkan interpretasi delta skor:
  - naik: "Skor meningkat dari analisis sebelumnya."
  - turun: "Skor turun dari analisis sebelumnya."
  - nol/stabil: "Skor relatif stabil."
  - belum cukup data: "Butuh minimal dua analisis untuk melihat perubahan."
- Tambahkan `Menampilkan X dari Y analisis`.
- Tambahkan summary "analisis terbaru" yang mengarah ke detail terbaru.
- Jika API list belum menyediakan primary gap, tampilkan copy jujur: `Buka detail untuk melihat gap utama`.

Acceptance criteria:

- User memahami arah perkembangan tanpa membuka detail.
- Copy "bandingkan hasil" didukung minimal oleh latest vs previous summary.
- Load more memberi konteks jumlah data.

### Phase 4: Empty, Partial, dan Responsive State

Prioritas: P2

- Perjelas empty state per section:
  - roadmap kosong
  - gap kosong
  - skill kosong
  - lowongan pembanding kosong
- Uji label panjang pada role dan job title.
- Pastikan card history tidak overflow pada mobile.
- Pastikan tombol dan toggle tetap mudah ditekan pada viewport kecil.

Acceptance criteria:

- Tidak ada teks yang overlap pada mobile.
- Partial AI response tetap terlihat sebagai data terbatas, bukan UI rusak.
- Empty state memberi konteks yang benar.

### Phase 5: Advanced UX dan Measurement

Prioritas: P3

- Tambahkan compare mode antar dua analisis jika dibutuhkan:
  - pilih dua item history.
  - tampilkan delta score, delta skill, delta gap.
- Tambahkan event tracking frontend:
  - buka result detail.
  - buka transparency.
  - klik load more.
  - klik retry.
- Pertimbangkan saved learning plan dari roadmap jika backend mendukung.

Acceptance criteria:

- Compare mode tidak mengganggu list dasar.
- Event tracking tidak mengirim data sensitif berlebihan.
- Fitur lanjutan tetap tunduk pada data API, bukan asumsi frontend.

## Skala Prioritas

| Prioritas | Definisi | Contoh dari audit |
| --- | --- | --- |
| P0 | Menghindari misleading data, risiko privacy/debug, atau broken recovery. | Hapus console debug, retry error, label target vs prediksi. |
| P1 | Memperjelas keputusan utama dan alur user. | Reorder tips, interpretasi delta, lowongan dengan alasan match. |
| P2 | Memperbaiki empty state, responsivitas, dan polish yang memengaruhi kenyamanan. | Empty state per section, mobile overflow, copy helper. |
| P3 | Eksperimen atau fitur lanjutan. | Compare mode, analytics, saved learning plan. |

## Test Plan

- Jalankan `npm run lint` dan `npm run build` di `WebApplication/frontend-react`.
- Manual test route:
  - `/riwayat`
  - `/riwayat/f766e5e2-8988-4c39-b276-01f93293e674`
  - `/analisis/hasil` dengan `location.state.data`.
- Data scenarios:
  - `target_role` null.
  - `skill_gap_analysis` kosong.
  - `roadmap` kosong.
  - `top_matches` duplikat.
  - role/job title panjang.
  - history kosong.
  - fetch history gagal non-401.
- Responsive scenarios:
  - mobile 360px.
  - tablet.
  - desktop.

## Rekomendasi Urutan Eksekusi

1. Phase 1 terlebih dahulu karena low risk dan memperbaiki correctness.
2. Phase 2 untuk memperkuat halaman result sebagai decision page.
3. Phase 3 agar history benar-benar menjadi progress narrative.
4. Phase 4 sebagai QA pass untuk partial data dan mobile.
5. Phase 5 hanya setelah product owner membutuhkan compare/tracking lanjutan.
