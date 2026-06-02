# DataScientist

Area kerja Data Science untuk proyek CakapKarier.AI[cite: 1].

## Fokus
- Dataset lifecycle: raw -> interim -> processed[cite: 1].
- Eksperimen, pembersihan data, dan evaluasi model[cite: 1].
- Dokumentasi data dictionary dan business questions[cite: 1].

## Struktur Penting (Sesuai image_b5b03c.png)
- `data/`: Berisi file bursa kerja mentah hasil scraping dari Glints dan LinkedIn[cite: 1].
- `docs/`: Dokumentasi acuan bisnis dan metadata[cite: 1].
  - `business_questions.md`: Daftar pertanyaan bisnis terukur hasil sinkronisasi dashboard[cite: 1].
  - `data_dictionary.csv`: Kamus data dan deskripsi variabel skema data[cite: 1].
- `notebooks/`: Area eksperimen interaktif dan penyimpanan berkas rujukan utama[cite: 1].
  - `Data_Scientist_FINAL_FIX.ipynb`: Notebook proses EDA, cleaning, dan analisis statistik[cite: 1].
  - `all_data_final.csv`: Dataset gabungan final yang sudah bersih dan dibaca oleh dashboard[cite: 1].
- `streamlit/`: Direktori penyusunan skrip aplikasi dashboard interaktif[cite: 1].

## Artefak Data Science Terkait
* **Final Clean Dataset:** `notebooks/all_data_final.csv`[cite: 1]
* **Data Dictionary:** `docs/data_dictionary.csv`[cite: 1]
* **Business Questions:** `docs/business_questions.md`[cite: 1]
* **Streamlit Dashboard:** `streamlit/dashboard_capstone.py`[cite: 1]

> **Catatan Jalur Data:** Skrip dashboard Streamlit dikonfigurasi untuk membaca dataset final yang bersih langsung dari path `notebooks/all_data_final.csv`[cite: 1].

## Cara Menjalankan Dashboard

Masuk ke direktori utama proyek, pastikan dependensi telah terinstal, lalu jalankan perintah Streamlit berikut[cite: 1]:

```bash
cd DataScientist
python -m pip install -r requirements.txt
streamlit run streamlit/dashboard_capstone.py