# ResearchData

Area kerja Data Scientist.

## Fokus
- Dataset lifecycle: raw -> interim -> processed.
- Eksperimen dan evaluasi model.
- Dokumentasi data dictionary dan feature schema.

## Struktur penting
- `data/`: data mentah hingga siap training.
- `notebooks/`: eksplorasi dan modeling.
- `experiments/`: hasil eksperimen reproducible.
- `scripts/`: utilitas preprocessing/validasi.
- `docs/`: data contract dan catatan analisis.

## Artefak Data Science Terkait AIEngine

- Final clean dataset: `../AIEngine/data/raw/all_data_clean.csv`
- Data dictionary DS: `../AIEngine/data/raw/Data_Dictionary.xlsx`
- Business questions: `docs/business_questions.md`
- Data dictionary: `docs/data_dictionary.md`
- Streamlit dashboard: `dashboard/streamlit_app.py`

Dashboard membaca output processed dari `AIEngine/data/processed/career-match-v1/jobs_processed.csv`.

Jalankan dashboard:

```bash
cd ResearchData
python -m pip install -r requirements.txt
streamlit run dashboard/streamlit_app.py
```
