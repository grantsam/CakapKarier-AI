# DataScientist

Area kerja Data Science untuk proyek CakapKarier.AI

## Fokus
- Dataset lifecycle: raw -> interim -> processed.
- Eksperimen, pembersihan data, dan evaluasi model.
- Dokumentasi data dictionary dan business questions.

## Struktur Penting (Sesuai image_b5b03c.png)
- `data/`: Berisi file bursa kerja mentah hasil scraping dari Glints dan LinkedIn.
- `docs/`: Dokumentasi acuan bisnis dan metadata.
  - `business_questions.md`: Daftar pertanyaan bisnis terukur hasil sinkronisasi dashboard.
  - `data_dictionary.csv`: Kamus data dan deskripsi variabel skema data.
- `notebooks/`: Area eksperimen interaktif dan penyimpanan berkas rujukan utama.
  - `Data_Scientist_FINAL_FIX.ipynb`: Notebook proses EDA, cleaning, dan analisis statistik.
  - `all_data_final.csv`: Dataset gabungan final yang sudah bersih dan dibaca oleh dashboard.
- `streamlit/`: Direktori penyusunan skrip aplikasi dashboard interaktif.

## Artefak Data Science Terkait
* **Final Clean Dataset:** `notebooks/all_data_final.csv`
* **Data Dictionary:** `docs/data_dictionary.csv`
* **Business Questions:** `docs/business_questions.md`
* **Streamlit Dashboard:** `streamlit/dashboard_capstone.py`

> **Catatan Jalur Data:** Skrip dashboard Streamlit dikonfigurasi untuk membaca dataset final yang bersih langsung dari path `notebooks/all_data_final.csv`.

## Cara Menjalankan Dashboard

Masuk ke direktori utama proyek, pastikan dependensi telah terinstal, lalu jalankan perintah Streamlit berikut:

```bash
cd DataScientist
python -m pip install -r requirements.txt
streamlit run streamlit/dashboard_capstone.py
