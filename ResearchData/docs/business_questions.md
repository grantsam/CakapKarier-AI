# Business Questions - CakapKarier AI

Pertanyaan bisnis yang dapat diukur dari final clean dataset Data Science gabungan Glints dan LinkedIn:

1. Role pekerjaan IT apa yang paling sering muncul di pasar kerja?
2. Skill apa yang paling banyak diminta oleh lowongan IT?
3. Bagaimana distribusi pengalaman minimum yang diminta perusahaan?
4. Bagaimana distribusi work mode: remote, hybrid, onsite, dan unknown?
5. Lokasi mana yang memiliki jumlah lowongan IT paling banyak?
6. Seberapa besar kesiapan kandidat terhadap role tertentu berdasarkan pengalaman, skill, dan sertifikasi?

Solusi utama yang dikembangkan:

> Career readiness and matching system yang memprediksi role paling relevan, readiness score, top job matches, skill gap, dan rekomendasi pengembangan skill.

Catatan data dan label:

Dataset final sudah melalui gathering, assessing, cleaning, transforming, feature engineering awal, merging, EDA, dan export final dataset oleh tim Data Science. Dataset saat ini berisi data lowongan, bukan histori kandidat berlabel. Karena itu, model MVP memakai weak/synthetic supervision untuk membentuk pasangan kandidat-lowongan dengan label `match` dan `not_match`.
