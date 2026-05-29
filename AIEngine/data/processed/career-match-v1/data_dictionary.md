# Career Match Data Dictionary

| Field | Type | Description |
| --- | --- | --- |
| `job_id` | `string` | Unique internal job id from source and source row id. |
| `source` | `string` | Data origin, e.g. glints or linkedin. |
| `job_title` | `string` | Job title after text cleaning. |
| `company` | `string` | Company name. |
| `location` | `string` | Job location. |
| `job_detail` | `string` | Original job URL. |
| `description` | `string` | Cleaned job description. |
| `requirements` | `string` | Cleaned requirements text. |
| `skills_text` | `string` | Original DS skill text used as the primary skill extraction source. |
| `skills_clean_text` | `string` | Data Science cleaned skill text retained for audit/EDA traceability. |
| `skills` | `array<string>` | Extracted hard and soft skills. |
| `skills_joined` | `string` | Extracted skills joined for manual inspection and dashboard display. |
| `certifications_required` | `array<string>` | Extracted certification signals from job text. |
| `certifications_required_joined` | `string` | Certification signals joined for manual inspection and dashboard display. |
| `job_benefits` | `string` | Cleaned job benefit text from Data Science final dataset when available. |
| `min_experience_years` | `float` | Minimum required experience in years. |
| `max_experience_years` | `float` | Maximum required experience in years when available. |
| `education_level_required` | `integer` | Ordinal education level: 0 unknown, 2 diploma, 3 bachelor, 4 master. |
| `education_required` | `string` | Human-readable education label for the extracted ordinal education level. |
| `work_mode` | `string` | remote, hybrid, onsite, or unknown. |
| `role_family` | `string` | Rule-based role family used for stratification and analysis. |
| `job_text` | `string` | Combined production text input for the TensorFlow job encoder. |
| `semantic_similarity` | `float` | Unsupervised hashed text-embedding cosine similarity between candidate profile and job text. |
| `label` | `float` | Training pair target: 1 match, 0 not match. |
