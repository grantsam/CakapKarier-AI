from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import pandas as pd
import streamlit as st


REPO_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = REPO_ROOT / "AIEngine" / "data" / "processed" / "career-match-v1"
JOBS_PATH = PROCESSED_DIR / "jobs_processed.csv"
METADATA_PATH = PROCESSED_DIR / "metadata.json"


@st.cache_data
def load_jobs() -> pd.DataFrame:
    jobs = pd.read_csv(JOBS_PATH)
    jobs["skills_list"] = jobs["skills"].apply(lambda value: json.loads(value) if isinstance(value, str) else [])
    return jobs


def top_skills(jobs: pd.DataFrame, limit: int = 20) -> pd.DataFrame:
    counter: Counter[str] = Counter()
    for skills in jobs["skills_list"]:
        counter.update(skills)
    return pd.DataFrame(counter.most_common(limit), columns=["skill", "count"])


st.set_page_config(page_title="CakapKarier Data Dashboard", layout="wide")
st.title("CakapKarier AI - Job Market Dashboard")

if not JOBS_PATH.exists():
    st.error(f"Processed dataset not found: {JOBS_PATH}")
    st.stop()

jobs_df = load_jobs()
metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8")) if METADATA_PATH.exists() else {}

col1, col2, col3, col4 = st.columns(4)
col1.metric("Total jobs", f"{len(jobs_df):,}")
col2.metric("Unique titles", f"{jobs_df['job_title'].nunique():,}")
col3.metric("Sources", jobs_df["source"].nunique())
col4.metric("Training pairs", f"{sum(metadata.get('pair_counts', {}).values()):,}")

st.subheader("Source Distribution")
st.bar_chart(jobs_df["source"].value_counts())

st.subheader("Role Family Distribution")
st.bar_chart(jobs_df["role_family"].value_counts())

left, right = st.columns(2)
with left:
    st.subheader("Top Locations")
    st.bar_chart(jobs_df["location"].value_counts().head(15))

with right:
    st.subheader("Work Mode")
    st.bar_chart(jobs_df["work_mode"].value_counts())

st.subheader("Top Required Skills")
skills_df = top_skills(jobs_df)
st.dataframe(skills_df, use_container_width=True)
st.bar_chart(skills_df.set_index("skill"))

st.subheader("Experience Requirement")
st.bar_chart(jobs_df["min_experience_years"].value_counts().sort_index())

st.subheader("Sample Processed Data")
st.dataframe(
    jobs_df[
        [
            "source",
            "job_title",
            "company",
            "location",
            "role_family",
            "skills_joined",
            "certifications_required_joined",
            "min_experience_years",
        ]
    ].head(50),
    use_container_width=True,
)
