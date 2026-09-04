# Business Questions & Solution — CakapKarier.AI

## 📋 Pertanyaan Bisnis (Dapat Diukur Secara Aktual)

Berdasarkan dataset final hasil pembersihan dan penggabungan (*final clean dataset*) bursa lowongan kerja IT Indonesia dari platform Glints dan LinkedIn, berikut adalah pertanyaan bisnis yang dianalisis dan dibuktikan secara terukur pada dashboard:

1. **Analisis Segmentasi Posisi**
   * *Pertanyaan:* Posisi pekerjaan (*job title*) IT apa yang paling sering muncul dan memiliki ketersediaan peluang tertinggi di pasar kerja saat ini, baik secara spesifik maupun kelompok fungsional?
   * *Metrik Pengukuran:* Frekuensi volume lowongan unik (`is_duplicate_job == 0`) pada kolom `job_title` dan distribusi proporsi berdasarkan hasil klasifikasi variabel `job_category`.

2. **Analisis Kebutuhan Kompetensi Kerja**
   * *Pertanyaan:* Kualifikasi teknis (*hard skills*) dan kompetensi non-teknis (*soft skills*) apa yang paling banyak diminta oleh pemberi kerja, serta bagaimana variasi spesifikasi *stack skill* utama pada tiap-tiap kategori profesi IT?
   * *Metrik Pengukuran:* Ekstraksi frekuensi kata kunci dari kolom `skills_clean` (setelah memfilter komponen *noise*) yang dipisahkan berdasarkan kategori keahlian, dilengkapi pemetaan *top 6 skills* per `job_category`.

3. **Analisis Kualifikasi Akademis**
   * *Pertanyaan:* Bagaimana profil persyaratan tingkat pendidikan minimum yang ditetapkan oleh industri dalam menyerap tenaga kerja di sektor IT Indonesia?
   * *Metrik Pengukuran:* Distribusi volume dan persentase data pada kolom kualifikasi pendidikan (`education`), diurutkan berdasarkan hirarki jenjang (SMA/SMK, Diploma, S1, hingga S2).

4. **Analisis Geografis dan Distribusi Pasar**
   * *Pertanyaan:* Lokasi provinsi mana yang memiliki jumlah lowongan IT paling banyak dan seberapa besar tingkat sentralisasi wilayah pada pasar kerja IT nasional?
   * *Metrik Pengukuran:* Perhitungan volume lowongan kerja per wilayah pada kolom `province` serta analisis pangsa pasar (*share market*) wilayah utama menggunakan visualisasi komposisi persentase.

5. **Uji Komparatif Antarplatform (A/B Testing Statistik)**
   * *Pertanyaan:* Apakah terdapat perbedaan signifikan secara statistik antara karakteristik data lowongan kerja yang dipublikasikan di platform Glints dan LinkedIn dalam hal kelengkapan deskripsi kerja (*skills*) dan standarisasi kualifikasi formal (syarat Sarjana S1)?
   * *Metrik Pengukuran:* Nilai *Z-statistic* dan *P-value* melalui metode **Z-Test Proporsi Dua Sampel** yang dihitung secara dinamis setelah melalui proses penyeimbangan data menggunakan *Random Undersampling*.

Solusi utama yang dikembangkan:

> Career readiness and matching system yang memprediksi role paling relevan, readiness score, top job matches, skill gap, dan rekomendasi pengembangan skill.

Catatan data dan label:

* **Kondisi Dataset:** Dataset final yang dihasilkan oleh tim Data Science merupakan data pasif bursa lowongan kerja (*supply-side* perusahaan) dan **tidak berisi riwayat atau data profil kandidat/pelamar nyata berlabel**.
* **Strategi Pengembangan Model MVP:** Mengingat keterbatasan ketiadaan label historis pelamar, pemodelan sistem pencocokan (*matching system*) pada tahap MVP ini dikembangkan menggunakan pendekatan **Weak/Synthetic Supervision**. 
* **Mekanisme Labeling:** Sistem mensintesis profil pasangan kandidat-lowongan secara terprogram berdasarkan kedekatan fitur tekstual kualifikasi, lalu membentuk label biner buatan (`match` dan `not_match`) sebagai basis data latih awal bagi model pembelajaran mesin (*machine learning*).
