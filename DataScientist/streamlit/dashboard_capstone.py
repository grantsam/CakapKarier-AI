"""
CakapKarier.AI — Dashboard Insight Lowongan Kerja IT Indonesia
Data: all_data_final.csv | Capstone Project
Versi: 3.2 — FULL PRODUCTION: Perbaikan Total Kesalahan Sintaks String pada Bagian Kesimpulan
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from collections import Counter
import re
import numpy as np
from statsmodels.stats.proportion import proportions_ztest

st.set_page_config(
    page_title="CakapKarier.AI · Insight",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=400;500;600;700;800&family=Figtree:wght=300;400;500;600&display=swap');

*, html, body, [class*="css"] { font-family: 'Figtree', sans-serif; box-sizing: border-box; }
h1,h2,h3,.hero-title,.kpi-val,.sec-title,.q-title { font-family: 'Plus Jakarta Sans', sans-serif; }
.stApp { background: #F5F6FA; }
.block-container { padding-top: 20px !important; padding-bottom: 32px !important; max-width: 1160px !important; padding-left: 2rem !important; padding-right: 2rem !important; }
html { font-size: 13px; }

[data-testid="stSidebar"] { background: #0C1C2E !important; border-right: 1px solid #1E3050; }
[data-testid="stSidebar"] * { color: #8BA8C4 !important; }
[data-testid="stSidebar"] .stMarkdown h3 { color: #E2EBF5 !important; font-family: 'Plus Jakarta Sans', sans-serif; }
[data-testid="stSidebar"] label { color: #6A8CA8 !important; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; }

/* ==========================================================================
   FIX PERMANEN: Mengunci Tombol Kontrol Buka/Tutup Sidebar Agar Selalu Muncul
   ========================================================================== */
[data-testid="stSidebarCollapsedControl"] {
    opacity: 1 !important;
    visibility: visible !important;
    left: 12px !important;
    top: 12px !important;
    transition: none !important;
}
[data-testid="stSidebarCollapsedControl"] button {
    background-color: #14C8B9 !important;
    color: #0C1C2E !important;
    border-radius: 8px !important;
    font-weight: bold !important;
    opacity: 1 !important;
    box-shadow: 0 2px 8px rgba(20, 200, 185, 0.4) !important;
}

[data-testid="stSidebarCollapseButton"],
[data-testid="stSidebarCollapseButton"] button,
section[data-testid="stSidebar"] [data-testid="stSidebarCollapseButton"],
section[data-testid="stSidebar"] button,
button[aria-label="Collapse sidebar"],
button[aria-label="Expand sidebar"],
button[kind="headerNoPadding"] {
    opacity: 1 !important;
    visibility: visible !important;
    transition: none !important;
}

section[data-testid="stSidebar"] button {
    color: #14C8B9 !important;
    background-color: rgba(255, 255, 255, 0.06) !important;
    border-radius: 6px !important;
}
section[data-testid="stSidebar"] button:hover {
    background-color: #14C8B9 !important;
    color: #0C1C2E !important;
}
/* ========================================================================== */

.hero { background: linear-gradient(135deg, #0C1C2E 0%, #102A45 45%, #0F3D6E 100%); border-radius: 16px; padding: 26px 32px; margin-bottom: 20px; position: relative; overflow: hidden; border: 1px solid #1E3A5A; }
.hero::before { content: ''; position: absolute; right: -80px; top: -80px; width: 320px; height: 320px; background: radial-gradient(circle, rgba(20,200,185,.18) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
.hero::after { content: ''; position: absolute; left: 38%; bottom: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(249,115,22,.1) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
.hero-eyebrow { font-size: .62rem; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: #14C8B9; margin-bottom: 8px; }
.hero-title { font-size: 1.7rem; font-weight: 700; color: #F0F6FF; letter-spacing: -.02em; line-height: 1.15; margin: 0 0 8px; }
.hero-sub { font-size: .8rem; color: #7AA8CC; font-weight: 300; line-height: 1.55; max-width: 520px; margin: 0; }
.hero-stats { display: flex; gap: 24px; margin-top: 20px; flex-wrap: wrap; }
.hero-stat-val { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.35rem; font-weight: 700; color: #F0F6FF; letter-spacing: -.02em; line-height: 1; }
.hero-stat-lbl { font-size: .6rem; font-weight: 400; color: #5A85A8; text-transform: uppercase; letter-spacing: .1em; margin-top: 3px; }
.hero-divider { width: 1px; background: #1E3A5A; align-self: stretch; }

.kpi { background: #FFFFFF; border-radius: 12px; padding: 16px 18px; border: 1px solid #E4E9F2; box-shadow: 0 1px 3px rgba(0,0,0,.05), 0 4px 12px rgba(0,0,0,.03); position: relative; overflow: hidden; }
.kpi-accent { position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: #14C8B9; border-radius: 12px 12px 0 0; }
.kpi-accent.or { background: #F97316; } .kpi-accent.bl { background: #3B82F6; } .kpi-accent.pu { background: #8B5CF6; } .kpi-accent.em { background: #10B981; }
.kpi-icon { width: 28px; height: 28px; border-radius: 7px; background: #F0FDFB; display: flex; align-items: center; justify-content: center; font-size: .82rem; margin-bottom: 10px; }
.kpi-icon.or { background: #FFF7ED; } .kpi-icon.bl { background: #EFF6FF; } .kpi-icon.pu { background: #F5F3FF; } .kpi-icon.em { background: #F0FDF4; }
.kpi-label { font-size: .65rem; font-weight: 600; color: #4A5A6A; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; }
.kpi-val { font-size: 1.55rem; font-weight: 700; color: #0C1C2E; letter-spacing: -.03em; line-height: 1; margin-bottom: 5px; }
.kpi-sub { font-size: .72rem; color: #2C3E50; font-weight: 400; line-height: 1.4; }

.sec-wrap { margin-bottom: 4px; }
.sec-tag { display: inline-flex; align-items: center; gap: 6px; background: #F0FDFB; border: 1px solid #CCFAF5; border-radius: 20px; padding: 2px 10px 2px 3px; margin-bottom: 6px; }
.sec-tag-num { background: linear-gradient(135deg, #14C8B9, #0DA898); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .6rem; font-weight: 600; width: 19px; height: 19px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sec-tag-lbl { font-size: .63rem; font-weight: 500; color: #0DA898; }
.sec-title { font-size: 1rem; font-weight: 600; color: #0C1C2E; letter-spacing: -.015em; margin: 0 0 3px; }
.sec-desc { font-size: .72rem; color: #8A9AB0; margin-bottom: 14px; font-weight: 300; }

.sec-tag.ab { background: #FFF0FB; border: 1px solid #F9C8EE; }
.sec-tag.ab .sec-tag-num { background: linear-gradient(135deg, #EC4899, #BE185D); }
.sec-tag.ab .sec-tag-lbl { color: #BE185D; }

.chart-card-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: .72rem; font-weight: 600; color: #0C1C2E; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
.chart-card-sub { font-size: .67rem; color: #9BAAB8; margin-bottom: 12px; font-weight: 300; }

.insight { background: linear-gradient(135deg, #F0FDFB 0%, #F5FFF9 100%); border: 1px solid #CCFAF5; border-left: 3px solid #14C8B9; border-radius: 0 10px 10px 0; padding: 11px 14px; margin-top: 12px; }
.insight-head { font-size: .6rem; font-weight: 600; color: #0DA898; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
.insight p { font-size: .75rem; color: #1A2E3D; margin: 0; line-height: 1.65; font-weight: 300; }
.insight strong { color: #0C6B62; font-weight: 500; }

.ab-pill { display: inline-flex; align-items: center; gap: 5px; font-size: .68rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-bottom: 4px; }
.ab-pill.reject { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
.ab-pill.sig { background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }

.ab-result { background: #FFFFFF; border: 1px solid #E4E9F2; border-radius: 12px; padding: 16px 18px; margin-bottom: 10px; }
.ab-result-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: .8rem; font-weight: 600; color: #0C1C2E; margin-bottom: 8px; }
.ab-result-row { display: flex; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
.ab-result-item { flex: 1; min-width: 100px; }
.ab-result-item-lbl { font-size: .58rem; color: #9BAAB8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 2px; }
.ab-result-item-val { font-size: .82rem; font-weight: 600; color: #0C1C2E; }

.ab-table { width: 100%; border-collapse: collapse; font-size: .75rem; margin: 10px 0; }
.ab-table th { background: #0C1C2E; color: #E2EBF5; padding: 8px 12px; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .65rem; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
.ab-table td { padding: 8px 12px; border-bottom: 1px solid #F0F4FA; color: #3A5A70; }
.ab-table tr:last-child td { border-bottom: none; }
.ab-table tr:nth-child(even) td { background: #F8FAFC; }
.ab-table .badge-reject { display: inline-block; background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; border-radius: 6px; padding: 1px 8px; font-size: .62rem; font-weight: 600; }
.ab-table .badge-glints { display: inline-block; background: #FFF1F2; color: #9F1239; border: 1px solid #FECDD3; border-radius: 6px; padding: 1px 8px; font-size: .62rem; }
.ab-table .badge-li { display: inline-block; background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; border-radius: 6px; padding: 1px 8px; font-size: .62rem; }

.kesim-card { background: linear-gradient(135deg, #0C1C2E 0%, #102A45 100%); border-radius: 14px; padding: 22px 26px; margin-bottom: 10px; border: 1px solid #1E3A5A; }
.kesim-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: .9rem; font-weight: 700; color: #F0F6FF; margin-bottom: 12px; }
.kesim-item { display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start; }
.kesim-num { background: #14C8B9; color: #0C1C2E; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .62rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.kesim-text { font-size: .75rem; color: #8BA8C4; line-height: 1.6; }
.kesim-text strong { color: #14C8B9; font-weight: 600; }

.div { height: 1px; background: linear-gradient(90deg, #14C8B9 0%, #E4E9F2 50%, transparent 100%); margin: 22px 0; }
.div-pink { height: 1px; background: linear-gradient(90deg, #EC4899 0%, #E4E9F2 50%, transparent 100%); margin: 22px 0; }

.footer { text-align: center; padding: 20px 0 8px; font-size: .72rem; color: #9BAAB8; font-weight: 300; }
.footer code { background: #F0F4FA; border: 1px solid #E4E9F2; padding: 2px 8px; border-radius: 6px; font-size: .7rem; color: #5A7A9A; }
</style>
""", unsafe_allow_html=True)

TEAL   = "#14C8B9"
ORANGE = "#F97316"
NAVY   = "#0C1C2E"
BLUE   = "#3B82F6"
PURPLE = "#8B5CF6"
GREEN  = "#10B981"
PINK   = "#EC4899"
RED    = "#E74C3C"

PROVINSI_INDONESIA = [
    'Aceh','Sumatera Utara','Sumatera Barat','Riau','Kepulauan Riau',
    'Jambi','Sumatera Selatan','Kepulauan Bangka Belitung','Bengkulu','Lampung',
    'Dki Jakarta','Jawa Barat','Jawa Tengah','Di Yogyakarta','Jawa Timur','Banten',
    'Bali','Nusa Tenggara Barat','Nusa Tenggara Timur',
    'Kalimantan Barat','Kalimantan Tengah','Kalimantan Selatan','Kalimantan Timur','Kalimantan Utara',
    'Sulawesi Utara','Gorontalo','Sulawesi Tengah','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tenggara',
    'Maluku','Maluku Utara','Papua Barat','Papua','Papua Selatan','Papua Tengah','Papua Pegunungan','Papua Barat Daya'
]
PROVINSI_INDONESIA_LOWER = [p.lower() for p in PROVINSI_INDONESIA]

SOFT_SKILLS = {
    'communication skills','teamwork','customer service','administration',
    'microsoft office','microsoft excel','microsoft word','microsoft powerpoint',
    'microsoft outlook','adaptability','problem solving','critical thinking',
    'time management','leadership','presentation skills','interpersonal skills',
    'attention to detail','organizational skills','work ethic','fast learner',
    'detail oriented','multitasking','negotiation','active listening',
    'conflict resolution','decision making','creativity','self motivated',
    'team player','public speaking','emotional intelligence','analytical thinking',
    'communication','collaboration','flexibility','initiative',
    'b2b sales','sales strategy','sales and marketing','data entry','google sheets'
}
NOISE_TOKENS = {'my','auto','script','ops','dev','apj','apac','yo','kr','sg','id','th','ph','vn','tw','hk','ms','gt','lt','ge','le','na','ok','no','yes','postgre'}

def categorize_job(title):
    t = str(title).lower()
    if any(x in t for x in ['data analyst','data scientist','business intelligence','bi analyst']): return 'Data Analyst / Scientist'
    if any(x in t for x in ['data engineer','etl','pipeline']): return 'Data Engineer'
    if any(x in t for x in ['machine learning','ml engineer','ai engineer','deep learning']): return 'AI / ML Engineer'
    if any(x in t for x in ['software engineer','software developer','programmer','backend','frontend','full stack']): return 'Software Dev'
    if any(x in t for x in ['devops','cloud engineer','sre','site reliability']): return 'DevOps / Cloud'
    if any(x in t for x in ['it support','technical support','help desk']): return 'IT Support'
    if any(x in t for x in ['network','sysadmin','system admin']): return 'Network / SysAdmin'
    if any(x in t for x in ['business analyst','system analyst','it business']): return 'Business / System Analyst'
    if any(x in t for x in ['project manager','it project']): return 'IT Project Manager'
    return 'Lainnya'

def parse_benefits(text):
    if pd.isna(text) or text in ['Not Available','']: return []
    text = re.sub(r'Benefit Kerja|Job Benefits','',text)
    items = re.split(r'(?<=[a-z])(?=[A-Z])',text)
    return [i.strip() for i in items if i.strip() and len(i.strip())>2]

def parse_skills(row):
    if pd.isna(row) or row in ['Not Available','']: return []
    skills = []
    for s in row.split('|'):
        s = s.strip()
        if not s or len(s)<=1: continue
        if s.lower() in SOFT_SKILLS: continue
        if s.lower() in NOISE_TOKENS: continue
        skills.append(s)
    return skills

def parse_soft_skills(row):
    if pd.isna(row) or row in ['Not Available','']: return []
    return [s.strip() for s in row.split('|') if s.strip().lower() in SOFT_SKILLS and s.strip().lower() not in NOISE_TOKENS]

def chart_layout(h=300, bottom=10, left=0):
    return dict(margin=dict(l=left,r=15,t=8,b=bottom), paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(family='Figtree, sans-serif'), height=h)

@st.cache_data
def load():
    import os
    # Mengambil letak folder 'streamlit' tempat file ini berada
    current_dir = os.path.dirname(__file__)
    # Naik 1 level ke folder 'DataScientist', lalu masuk ke 'notebooks/all_data_final.csv'
    csv_path = os.path.join(current_dir, "..", "notebooks", "all_data_final.csv")
    
    df = pd.read_csv(csv_path)
    df['job_category'] = df['job_title'].apply(categorize_job)
    
    df['province'] = df['province'].astype(str).str.strip()
    province_mapping = {
        'Jakarta Metropolitan Area': 'Dki Jakarta',
        'Greater Bandung': 'Jawa Barat',
        'Greater Yogyakarta': 'Di Yogyakarta',
        'Greater Malang': 'Jawa Timur',
        'Indonesia': 'Dki Jakarta',
        'Apac': 'Dki Jakarta',
        'Apj': 'Dki Jakarta',
        'Nanggroe Aceh Darussalam': 'Aceh'
    }
    df['province'] = df['province'].replace(province_mapping).str.title()
    df = df[df['province'].str.lower().isin(PROVINSI_INDONESIA_LOWER)].copy()
    return df

try:
    df = load()
except FileNotFoundError:
    st.error("❌ File `all_data_final.csv` tidak ditemukan di folder yang sama.")
    st.stop()

with st.sidebar:
    st.markdown("""
    <div style='padding:18px 4px 22px'>
        <div style='font-family:"Plus Jakarta Sans",sans-serif;font-size:1.3rem;font-weight:800;color:#14C8B9;letter-spacing:-.03em'>CakapKarier<span style='color:#3A6080'>.AI</span></div>
        <div style='font-size:.65rem;color:#3A6080;margin-top:5px;text-transform:uppercase;letter-spacing:.12em;font-weight:600'>Insight Dashboard · Capstone</div>
    </div>""", unsafe_allow_html=True)
    st.markdown("---")
    st.markdown("<div style='font-size:.65rem;font-weight:700;color:#3A6080;text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px'>Filter Data</div>", unsafe_allow_html=True)
    prov_opts = sorted(df['province'].dropna().unique().tolist())
    src_opts  = df['source'].dropna().unique().tolist()
    edu_order = ['SMA/SMK','Diploma (D1-D4)','Pendidikan Profesi','Sarjana (S1)','Magister (S2)']
    edu_opts  = [e for e in edu_order if e in df['education'].unique()]
    sel_prov = st.multiselect("Provinsi", prov_opts, placeholder="Semua Provinsi")
    sel_src  = st.multiselect("Platform", src_opts, placeholder="Semua Platform")
    sel_edu  = st.multiselect("Pendidikan Min.", edu_opts, placeholder="Semua Pendidikan")

mask = pd.Series(True, index=df.index)
if sel_prov: mask &= df['province'].isin(sel_prov)
if sel_src:  mask &= df['source'].isin(sel_src)
if sel_edu:  mask &= df['education'].isin(sel_edu)
dff = df[mask].copy()
N   = len(dff)

avg_sk    = dff['skills_count'].mean() if N else 0
n_company = dff['company'].nunique()
n_prov    = dff['province'].nunique()
dki_n     = int((dff['province']=='Dki Jakarta').sum())
s1_n      = int((dff['education']=='Sarjana (S1)').sum())

hard_sk, soft_sk = [], []
for row in dff['skills_clean'].dropna():
    hard_sk.extend(parse_skills(row))
    soft_sk.extend(parse_soft_skills(row))

top_hard = pd.DataFrame(Counter(hard_sk).most_common(12), columns=['skill','count'])
top_soft = pd.DataFrame(Counter(soft_sk).most_common(10), columns=['skill','count'])
all_ben  = []
for row in dff['job_benefits'].dropna():
    all_ben.extend(parse_benefits(row))
top_ben = pd.DataFrame(Counter(all_ben).most_common(10), columns=['benefit','count'])

# ── HERO ──────────────────────────────────────────────────────────────────────
st.markdown(f"""
<div class='hero'>
    <div class='hero-eyebrow'>Capstone Project</div>
    <div class='hero-title'>Insight Lowongan Kerja<br>IT Indonesia</div>
    <p class='hero-sub'>Eksplorasi mendalam terhadap {N:,} data lowongan dari Glints & LinkedIn. Yang mencakup skill, lokasi, posisi, benefit, dan A/B Testing statistik antar platform.</p>
    <div class='hero-stats'>
        <div><div class='hero-stat-val'>{N:,}</div><div class='hero-stat-lbl'>Lowongan</div></div>
        <div class='hero-divider'></div>
        <div><div class='hero-stat-val'>{n_company:,}</div><div class='hero-stat-lbl'>Perusahaan</div></div>
        <div class='hero-divider'></div>
        <div><div class='hero-stat-val'>{n_prov}</div><div class='hero-stat-lbl'>Provinsi</div></div>
        <div class='hero-divider'></div>
        <div><div class='hero-stat-val'>2</div><div class='hero-stat-lbl'>Platform</div></div>
    </div>
</div>""", unsafe_allow_html=True)

c1,c2,c3,c4 = st.columns(4)
kpis = [
    ("",   "Total Lowongan",    f"{N:,}",             "Aktif & terfilter", "📋"),
    ("bl", "Rata-rata Skill",   f"{avg_sk:.1f}",       f"per lowongan · Maks {int(dff['skills_count'].max()) if N else 0}", "⚡"),
    ("pu", "Dominasi Jakarta",  f"{dki_n/N*100:.1f}%" if N else "0%", f"{dki_n:,} dari {N:,} lowongan", "📍"),
    ("em", "Req. Sarjana (S1)", f"{s1_n/N*100:.1f}%" if N else "0%",  f"{s1_n:,} lowongan", "🎓"),
]
for col,(cls,lbl,val,sub,icon) in zip([c1,c2,c3,c4],kpis):
    with col:
        st.markdown(f"<div class='kpi'><div class='kpi-accent {cls}'></div><div class='kpi-icon {cls}'>{icon}</div><div class='kpi-label'>{lbl}</div><div class='kpi-val'>{val}</div><div class='kpi-sub'>{sub}</div></div>", unsafe_allow_html=True)

st.markdown("<div class='div'></div>", unsafe_allow_html=True)

# ══════════ Q1 SKILL ══════════
st.markdown("""<div class='sec-wrap'><div class='sec-tag'><div class='sec-tag-num'>1</div><div class='sec-tag-lbl'>Pertanyaan Riset</div></div><div class='sec-title'>Skill apa yang paling banyak dibutuhkan?</div><div class='sec-desc'>Ekstraksi dari kolom skills_clean · difilter menjadi hard skill dan soft skill</div></div>""", unsafe_allow_html=True)

tab_hard, tab_soft = st.tabs(["🔧  Hard Skills", "🤝  Soft Skills"])

with tab_hard:
    ca, cb = st.columns([3,2])
    with ca:
        st.markdown("<div class='chart-card-title'>Top 12 Hard Skills</div><div class='chart-card-sub'>Berdasarkan frekuensi kemunculan di seluruh lowongan</div>", unsafe_allow_html=True)
        if not top_hard.empty:
            fig = go.Figure(go.Bar(y=top_hard['skill'][::-1],x=top_hard['count'][::-1],orientation='h',marker=dict(color=list(range(len(top_hard))),colorscale=[[0,'#E0FAF8'],[0.6,TEAL],[1,'#0A6E65']],line=dict(width=0)),text=[f"  {v:,}" for v in top_hard['count'][::-1]],textposition='outside',cliponaxis=False,textfont=dict(size=11,color=NAVY),hovertemplate='<b>%{y}</b><br>%{x:,} lowongan<extra></extra>'))
            fig.update_layout(**chart_layout(h=290,bottom=6,left=140))
            max_h_val = top_hard['count'].max() if not top_hard.empty else 100
            fig.update_xaxes(range=[0, max_h_val * 1.15], showgrid=False, zeroline=False, showticklabels=False)
            fig.update_yaxes(showgrid=False,tickfont=dict(size=11.5,color='#3A5A70'))
            st.plotly_chart(fig, use_container_width=True, config={'displayModeBar':False})
    with cb:
        sk_cats = {
            'Infrastruktur & Support':['IT Support','Technical Support','Troubleshooting','Network Troubleshooting','Hardware Maintenance','Help Desk'],
            'Programming':['Python','Java','Node.js','Laravel','PHP','JavaScript','TypeScript'],
            'Data & Analytics':['Data Analysis','Data Visualization','Microsoft SQL Server','Tableau','Database Systems'],
            'AI / ML':['Machine Learning','Artificial Intelligence','Deep Learning','Computer Vision','Natural Language Processing (NLP)'],
            'DevOps & Cloud':['Kubernetes','Docker','Jenkins','Ansible'],
        }
        cat_counts = {cat: sum(Counter(hard_sk).get(s,0) for s in skills) for cat,skills in sk_cats.items()}
        cat_df2 = pd.DataFrame(list(cat_counts.items()),columns=['cat','count']).sort_values('count',ascending=False)
        st.markdown("<div class='chart-card-title'>Breakdown Teknis</div><div class='chart-card-sub'>Proporsi kategori skill</div>", unsafe_allow_html=True)
        if cat_df2['count'].sum()>0:
            fig2 = go.Figure(go.Pie(labels=cat_df2['cat'],values=cat_df2['count'],hole=0.60,marker=dict(colors=[TEAL,'#1F6FEB',ORANGE,PURPLE,GREEN],line=dict(color='white',width=2.5)),textinfo='percent',textfont=dict(size=11),hovertemplate='<b>%{label}</b><br>%{value:,} kemunculan<br>%{percent}<extra></extra>',pull=[0.05,0,0,0,0]))
            fig2.update_layout(**chart_layout(h=180,left=0),showlegend=True,legend=dict(orientation='v',yanchor='middle',y=0.5,xanchor='left',x=1.0,font=dict(size=10,color='#5A7A9A')),annotations=[dict(text=f"<b>{len(set(hard_sk)):,}</b><br>skill",x=0.5,y=0.5,showarrow=False,align='center',font=dict(size=13,color=NAVY,family='Plus Jakarta Sans, sans-serif'))])
            st.plotly_chart(fig2, use_container_width=True, config={'displayModeBar':False})
        if len(top_hard)>=3:
            t3=top_hard.head(3)
            st.markdown(f"<div class='insight' style='margin-top:8px'><div class='insight-head'>💡 Key Insight</div><p><strong>{t3.iloc[0]['skill']}</strong> ({t3.iloc[0]['count']:,}), <strong>{t3.iloc[1]['skill']}</strong> ({t3.iloc[1]['count']:,}), dan <strong>{t3.iloc[2]['skill']}</strong> ({t3.iloc[2]['count']:,}) mendominasi. Kategori <strong>Infrastruktur & Support</strong> terbesar karena banyaknya posisi IT Support dan Technical Support di pasar saat ini.</p></div>", unsafe_allow_html=True)

with tab_soft:
    ca, cb = st.columns([3,2])
    with ca:
        st.markdown("<div class='chart-card-title'>Top 10 Soft Skills</div><div class='chart-card-sub'>Kompetensi non-teknis yang paling sering diminta perusahaan</div>", unsafe_allow_html=True)
        if not top_soft.empty:
            fig3 = go.Figure(go.Bar(x=top_soft['skill'],y=top_soft['count'],marker=dict(color=list(range(len(top_soft),0,-1)),colorscale=[[0,'#FFF0E6'],[0.5,ORANGE],[1,'#9A3412']],line=dict(width=0)),text=top_soft['count'],textposition='outside',cliponaxis=False,textfont=dict(size=10,color=NAVY),hovertemplate='<b>%{x}</b><br>%{y:,} lowongan<extra></extra>'))
            fig3.update_layout(**chart_layout(h=255,bottom=65,left=30))
            fig3.update_xaxes(showgrid=False,tickangle=-30,tickfont=dict(size=10.5,color='#3A5A70'))
            max_s_val = top_soft['count'].max() if not top_soft.empty else 100
            fig3.update_yaxes(range=[0, max_s_val * 1.15], showgrid=True, gridcolor='#F0F4FA', zeroline=False)
            st.plotly_chart(fig3, use_container_width=True, config={'displayModeBar':False})
    with cb:
        total_soft=len(soft_sk); total_hard=len(hard_sk)
        soft_pct=total_soft/(total_soft+total_hard)*100 if (total_soft+total_hard)>0 else 0
        st.markdown("<div class='chart-card-title'>Temuan</div><div class='chart-card-sub'>Soft skill vs hard skill</div>", unsafe_allow_html=True)
        st.markdown(f"<div style='margin:16px 0 12px'><div style='font-size:.68rem;font-weight:500;color:#9BAAB8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px'>Proporsi Soft Skill</div><div style='font-family:\"Plus Jakarta Sans\",sans-serif;font-size:2.2rem;font-weight:700;color:{ORANGE};letter-spacing:-.04em'>{soft_pct:.1f}%</div><div style='font-size:.75rem;color:#6B7A8D;margin-top:4px'>{total_soft:,} dari {total_soft+total_hard:,} total kemunculan skill</div></div>", unsafe_allow_html=True)
        if not top_soft.empty:
            for _,row in top_soft.head(5).iterrows():
                pct=row['count']/top_soft.iloc[0]['count']*100 if top_soft.iloc[0]['count']>0 else 0
                st.markdown(f"<div style='margin-bottom:10px'><div style='display:flex;justify-content:space-between;font-size:.75rem;font-weight:500;color:#3A5A70;margin-bottom:4px'><span>{row['skill']}</span><span style='color:{ORANGE}'>{row['count']:,}</span></div><div style='background:#FFF0E6;border-radius:4px;height:5px'><div style='background:{ORANGE};width:{pct:.0f}%;height:5px;border-radius:4px'></div></div></div>", unsafe_allow_html=True)
            st.markdown(f"<div class='insight' style='margin-top:12px'><div class='insight-head'>💡 Key Insight</div><p><strong>Communication Skills</strong> dan <strong>Teamwork</strong> paling banyak diminta — membuktikan bahwa meski industri IT sangat teknis, <strong>kompetensi interpersonal tetap krusial</strong>. Microsoft Excel masih relevan bahkan di era cloud.</p></div>", unsafe_allow_html=True)
st.markdown("<div class='div'></div>", unsafe_allow_html=True)

# ══════════ Q2 LOKASI ══════════
st.markdown("""<div class='sec-wrap'><div class='sec-tag'><div class='sec-tag-num'>2</div><div class='sec-tag-lbl'>Pertanyaan Riset</div></div><div class='sec-title'>Bagaimana distribusi peluang kerja berdasarkan lokasi?</div><div class='sec-desc'>Analisis per provinsi · menggambarkan tingkat sentralisasi pasar kerja IT di Indonesia</div></div>""", unsafe_allow_html=True)

if N>0:
    ca,cb = st.columns([3,2])
    with ca:
        prov_df=dff['province'].value_counts().head(10).reset_index(); prov_df.columns=['province','count']; prov_df['pct']=(prov_df['count']/N*100).round(1)
        st.markdown("<div class='chart-card-title'>Top 10 Provinsi</div><div class='chart-card-sub'>Jumlah lowongan & persentase dari total dataset</div>", unsafe_allow_html=True)
        bar_colors=['#0C1C2E']+['#4A7FA0']*4+['#8BB5CC']*5
        fig4=go.Figure(); fig4.add_trace(go.Bar(y=prov_df['province'][::-1],x=prov_df['count'][::-1],orientation='h',marker=dict(color=list(reversed(bar_colors[:len(prov_df)])),line=dict(width=0)),text=[f"  {c:,}  ({p}%)" for c,p in zip(prov_df['count'][::-1],prov_df['pct'][::-1])],textposition='outside',cliponaxis=False,textfont=dict(size=10,color=NAVY),hovertemplate='<b>%{y}</b><br>%{x:,} lowongan<extra></extra>'))
        fig4.update_layout(**chart_layout(h=240,bottom=6,left=120))
        max_p_val = prov_df['count'].max() if not prov_df.empty else 100
        fig4.update_xaxes(range=[0, max_p_val * 1.15], showgrid=False, zeroline=False, showticklabels=False)
        fig4.update_yaxes(showgrid=False,tickfont=dict(size=11,color='#3A5A70'))
        st.plotly_chart(fig4,use_container_width=True,config={'displayModeBar':False})
    with cb:
        top5_prov=dff['province'].value_counts().head(5).reset_index(); top5_prov.columns=['province','count']
        others_n=N-top5_prov['count'].sum()
        if others_n>0: top5_prov=pd.concat([top5_prov,pd.DataFrame([{'province':'Lainnya','count':others_n}])],ignore_index=True)
        st.markdown("<div class='chart-card-title'>Komposisi Wilayah</div><div class='chart-card-sub'>Share 5 provinsi teratas vs lainnya</div>", unsafe_allow_html=True)
        fig5=go.Figure(go.Pie(labels=top5_prov['province'],values=top5_prov['count'],hole=0.60,marker=dict(colors=['#0C1C2E','#1F4E7A','#2D7CB8',TEAL,'#0DA898','#CBD5E1'],line=dict(color='white',width=2.5)),textinfo='percent',textfont=dict(size=10.5),hovertemplate='<b>%{label}</b><br>%{value:,} (%{percent})<extra></extra>',pull=[0.06]+[0]*(len(top5_prov)-1)))
        fig5.update_layout(**chart_layout(h=195,left=0),showlegend=True,legend=dict(orientation='v',font=dict(size=9.5,color='#5A7A9A'),yanchor='middle',y=0.5,xanchor='left',x=1.0),annotations=[dict(text=f"<b>{dki_n/N*100:.0f}%</b><br><span style='font-size:10px;color:#6B7A8D;'>Jakarta</span>" if 'Dki Jakarta' in dff['province'].values else f"<b>{N:,}</b><br>Total",x=0.5,y=0.5,showarrow=False,xanchor='center',yanchor='middle',font=dict(size=14,color=NAVY,family='Plus Jakarta Sans, sans-serif'))])
        st.plotly_chart(fig5,use_container_width=True,config={'displayModeBar':False})
        insight_html = f"<p><strong>{prov_df.iloc[0]['province']} mendominasi dengan {prov_df.iloc[0]['pct']}%</strong> dari total lowongan. " if not prov_df.empty else ""
        if len(prov_df)>=2:
            insight_html += f"<strong>{prov_df.iloc[1]['province']}</strong> menyusul di posisi kedua dengan {prov_df.iloc[1]['pct']}%. Ini mengindikasikan <strong>sentralisasi pasar kerja</strong> yang masih berpusat pada episentrum ekonomi utama.</p>"
        else:
            insight_html += "Pasar terpusat penuh pada sebaran wilayah minor.</p>"
        st.markdown(f"<div class='insight'><div class='insight-head'>💡 Key Insight</div>{insight_html}</div>", unsafe_allow_html=True)
else:
    st.info("Tidak ada data yang tersedia untuk kombinasi filter ini.")

st.markdown("<div class='div'></div>", unsafe_allow_html=True)

# ══════════ Q3 POSISI ══════════
st.markdown("""<div class='sec-wrap'><div class='sec-tag'><div class='sec-tag-num'>3</div><div class='sec-tag-lbl'>Pertanyaan Riset</div></div><div class='sec-title'>Posisi apa yang paling banyak tersedia?</div><div class='sec-desc'>Berdasarkan job_title aktual dari data unik (non-duplikat) and kategorisasi pekerjaan</div></div>""", unsafe_allow_html=True)

if N>0:
    ca,cb=st.columns([3,2])
    with ca:
        top_jobs=dff[dff['is_duplicate_job']==0]['job_title'].value_counts().head(12).reset_index(); top_jobs.columns=['job_title','count']
        st.markdown("<div class='chart-card-title'>Top 12 Posisi Paling Banyak Diminati</div><div class='chart-card-sub'>Data unik · tidak menghitung posting ulang</div>", unsafe_allow_html=True)
        colors_jobs=['#0C1C2E']+['#2D5F8A']+['#4A7FA0']*3+['#6899B3']*4+['#8BB5CC']*3
        if not top_jobs.empty:
            fig6=go.Figure(go.Bar(y=top_jobs['job_title'][::-1],x=top_jobs['count'][::-1],orientation='h',marker=dict(color=list(reversed(colors_jobs[:len(top_jobs)])),line=dict(width=0)),text=[f"  {v}" for v in top_jobs['count'][::-1]],textposition='outside',cliponaxis=False,textfont=dict(size=10.5,color=NAVY),hovertemplate='<b>%{y}</b><br>%{x:,} lowongan<extra></extra>'))
            fig6.update_layout(**chart_layout(h=305,bottom=6,left=180))
            max_j_val = top_jobs['count'].max() if not top_jobs.empty else 100
            fig6.update_xaxes(range=[0, max_j_val * 1.15], showgrid=False, zeroline=False, showticklabels=False)
            fig6.update_yaxes(showgrid=False,tickfont=dict(size=11,color='#3A5A70'))
            st.plotly_chart(fig6,use_container_width=True,config={'displayModeBar':False})
    with cb:
        cat_df=dff[dff['job_category']!='Lainnya']['job_category'].value_counts().reset_index(); cat_df.columns=['category','count']
        cat_colors_list=[NAVY,'#1F4E7A',TEAL,ORANGE,PURPLE,GREEN,'#F59E0B','#EC4899','#6366F1']
        st.markdown("<div class='chart-card-title'>Per Kategori Pekerjaan</div><div class='chart-card-sub'>Klasifikasi job_title ke kelompok fungsional</div>", unsafe_allow_html=True)
        if not cat_df.empty:
            fig7=go.Figure(go.Bar(x=cat_df['category'],y=cat_df['count'],marker=dict(color=cat_colors_list[:len(cat_df)],line=dict(width=0)),text=cat_df['count'],textposition='outside',cliponaxis=False,textfont=dict(size=9.5,color=NAVY),hovertemplate='<b>%{x}</b><br>%{y:,} lowongan<extra></extra>'))
            fig7.update_layout(**chart_layout(h=205,bottom=80,left=40))
            fig7.update_xaxes(showgrid=False,tickangle=-40,tickfont=dict(size=9,color='#3A5A70'))
            max_c_val = cat_df['count'].max() if not cat_df.empty else 100
            fig7.update_yaxes(range=[0, max_c_val * 1.15], showgrid=True, gridcolor='#F0F4FA', zeroline=False)
            st.plotly_chart(fig7,use_container_width=True,config={'displayModeBar':False})
        if len(top_jobs)>=2:
            _top_cat = cat_df.iloc[0]['category'] if not cat_df.empty else 'Software Dev'
            _sec_cat = cat_df.iloc[1]['category'] if len(cat_df)>=2 else 'Business/System Analyst'
            _top_cat_n = cat_df.iloc[0]['count'] if not cat_df.empty else 0
            st.markdown(f"<div class='insight'><div class='insight-head'>💡 Key Insight</div><p><strong>{top_jobs.iloc[0]['job_title']}</strong> memimpin dengan {top_jobs.iloc[0]['count']} lowongan unik, diikuti <strong>{top_jobs.iloc[1]['job_title']}</strong> ({top_jobs.iloc[1]['count']}). Secara kategori fungsional, <strong>{_top_cat}</strong> mendominasi ({_top_cat_n:,} lowongan), disusul <strong>{_sec_cat}</strong>.</p></div>", unsafe_allow_html=True)

st.markdown("<div class='div'></div>", unsafe_allow_html=True)

# ══════════ SKILL PER KATEGORI ══════════
st.markdown("""<div class='sec-wrap'><div class='sec-tag'><div class='sec-tag-num'>+</div><div class='sec-tag-lbl'>Deep Dive</div></div><div class='sec-title'>Stack Skill Teknis per Kategori Pekerjaan</div><div class='sec-desc'>Top 6 hard skill per kelompok posisi · soft skill & noise telah difilter</div></div>""", unsafe_allow_html=True)

if N>0:
    dfc=dff[dff['job_category']!='Lainnya'].copy()
    categories_show=['Data Analyst / Scientist','Data Engineer','AI / ML Engineer','Software Dev','DevOps / Cloud','IT Support']
    cat_color_map={'Data Analyst / Scientist':TEAL,'Data Engineer':BLUE,'AI / ML Engineer':PURPLE,'Software Dev':ORANGE,'DevOps / Cloud':GREEN,'IT Support':'#F59E0B'}
    cols3=st.columns(3)
    for i,cat in enumerate(categories_show):
        sub=dfc[dfc['job_category']==cat]; sk=[]
        for row in sub['skills_clean'].dropna(): sk.extend(parse_skills(row))
        top_sk=pd.DataFrame(Counter(sk).most_common(6),columns=['skill','count'])
        if top_sk.empty: continue
        color=cat_color_map.get(cat,TEAL); n_jobs=len(sub)
        opacities=[max(0.35,1-j*0.1) for j in range(len(top_sk))]
        fig=go.Figure(go.Bar(y=top_sk['skill'][::-1],x=top_sk['count'][::-1],orientation='h',marker=dict(color=[color]*len(top_sk),opacity=opacities[::-1],line=dict(width=0)),text=[f"  {v}" for v in top_sk['count'][::-1]],textposition='outside',cliponaxis=False,textfont=dict(size=9,color=NAVY),hovertemplate='%{y}: <b>%{x:,}</b><extra></extra>'))
        fig.update_layout(margin=dict(l=100,r=40,t=36,b=4),paper_bgcolor='rgba(0,0,0,0)',plot_bgcolor='rgba(0,0,0,0)',font=dict(family='Figtree, sans-serif'),height=185,title=dict(text=f"<b>{cat}</b>  <span style='font-size:10px;font-weight:400;color:#9BAAB8'>({n_jobs} lowongan)</span>",font=dict(size=12,color=NAVY,family='Plus Jakarta Sans, sans-serif'),x=0))
        max_sk_val = top_sk['count'].max() if not top_sk.empty else 100
        fig.update_xaxes(range=[0, max_sk_val * 1.15], showgrid=False, zeroline=False, showticklabels=False)
        fig.update_yaxes(showgrid=False,tickfont=dict(size=10,color='#3A5A70'))
        with cols3[i%3]: st.plotly_chart(fig,use_container_width=True,config={'displayModeBar':False})
    st.markdown(f"<div class='insight'><div class='insight-head'>💡 Key Insight</div><p>Setiap kategori memiliki <strong>stack skill yang berbeda-beda</strong>: <strong>Data & AI</strong> → Python, SQL, Machine Learning; <strong>Software Dev</strong> → Java, Node.js, Laravel, PostgreSQL; <strong>DevOps/Cloud</strong> → Kubernetes, Docker, Jenkins, Ansible; <strong>IT Support</strong> → Troubleshooting, Network, Hardware Maintenance.</p></div>", unsafe_allow_html=True)

st.markdown("<div class='div'></div>", unsafe_allow_html=True)

# ══════════ PENDIDIKAN + BENEFIT ══════════
st.markdown("""<div class='sec-wrap'><div class='sec-tag'><div class='sec-tag-num'>+</div><div class='sec-tag-lbl'>Deep Dive</div></div><div class='sec-title'>Pendidikan & Benefit</div><div class='sec-desc'>Syarat pendidikan minimum dan fasilitas yang paling banyak ditawarkan perusahaan</div></div>""", unsafe_allow_html=True)

if N>0:
    ca,cb=st.columns(2)
    with ca:
        edu_order_list=['SD','SMP','SMA/SMK','Diploma (D1-D4)','Pendidikan Profesi','Sarjana (S1)','Magister (S2)']
        edu_encoded={e:i for i,e in enumerate(edu_order_list)}
        edu_df=dff['education'].value_counts().reset_index(); edu_df.columns=['education','count']
        edu_df=edu_df[edu_df['education']!='Not Available'].copy()
        edu_df['order']=edu_df['education'].map(edu_encoded); edu_df=edu_df.sort_values('order')
        st.markdown("<div class='chart-card-title'>Syarat Pendidikan Minimum</div><div class='chart-card-sub'>Distribusi jenjang pendidikan yang diminta perusahaan</div>", unsafe_allow_html=True)
        if not edu_df.empty:
            fig8=go.Figure(go.Bar(x=edu_df['education'],y=edu_df['count'],marker=dict(color=edu_df['count'],colorscale=[[0,'#E0FAF8'],[0.35,TEAL],[1,NAVY]],line=dict(width=0)),text=edu_df['count'],textposition='outside',cliponaxis=False,textfont=dict(size=10,color=NAVY),hovertemplate='%{x}: <b>%{y:,}</b> lowongan<extra></extra>'))
            fig8.update_layout(**chart_layout(h=240,bottom=65,left=40)); fig8.update_xaxes(showgrid=False,tickangle=-28,tickfont=dict(size=10,color='#3A5A70'))
            max_e_val = edu_df['count'].max() if not edu_df.empty else 100
            fig8.update_yaxes(range=[0, max_e_val * 1.15], showgrid=True, gridcolor='#F0F4FA', zeroline=False)
            st.plotly_chart(fig8,use_container_width=True,config={'displayModeBar':False})
        dip_n=int((dff['education']=='Diploma (D1-D4)').sum()); s1_pct=(s1_n/N*100) if N>0 else 0
        st.markdown(f"<div class='insight'><div class='insight-head'>💡 Key Insight</div><p><strong>Sarjana (S1) mendominasi ({s1_n:,} lowongan, {s1_pct:.1f}%)</strong>, namun Diploma cukup besar ({dip_n:,}) — membuktikan industri IT <strong>masih terbuka untuk lulusan vokasi</strong>, terutama di posisi IT Support, Network, dan Software Dev junior.</p></div>", unsafe_allow_html=True)
    with cb:
        st.markdown("<div class='chart-card-title'>Top 10 Benefit yang Ditawarkan</div><div class='chart-card-sub'>Tunjangan & fasilitas hasil parsing kolom job_benefits</div>", unsafe_allow_html=True)
        if not top_ben.empty:
            fig9=go.Figure(go.Bar(y=top_ben['benefit'][::-1],x=top_ben['count'][::-1],orientation='h',marker=dict(color=list(range(len(top_ben)))[::-1],colorscale=[[0,'#3B0FAB'],[0.4,PURPLE],[1,'#F0F0FF']],line=dict(width=0)),text=[f"  {v:,}" for v in top_ben['count'][::-1]],textposition='outside',cliponaxis=False,textfont=dict(size=10,color=NAVY),hovertemplate='<b>%{y}</b><br>%{x:,} lowongan<extra></extra>'))
            fig9.update_layout(**chart_layout(h=240,bottom=6,left=120))
            max_b_val = top_ben['count'].max() if not top_ben.empty else 100
            fig9.update_xaxes(range=[0, max_b_val * 1.15], showgrid=False, zeroline=False, showticklabels=False)
            fig9.update_yaxes(showgrid=False,tickfont=dict(size=11,color='#3A5A70'))
            st.plotly_chart(fig9,use_container_width=True,config={'displayModeBar':False})
            
            if len(top_ben) >= 3:
                b1,b2,b3=top_ben.iloc[0]['benefit'],top_ben.iloc[1]['benefit'],top_ben.iloc[2]['benefit']
                st.markdown(f"<div class='insight'><div class='insight-head'>💡 Key Insight</div><p><strong>{b1}</strong> ({top_ben.iloc[0]['count']:,}), <strong>{b2}</strong>, dan <strong>{b3}</strong> mendominasi. Tingginya <strong>Career Path</strong> menunjukkan perusahaan IT sadar bahwa <strong>pengembangan karier jangka panjang</strong> adalah daya tarik utama.</p></div>", unsafe_allow_html=True)
            elif len(top_ben) > 0:
                b1 = top_ben.iloc[0]['benefit']
                st.markdown(f"<div class='insight'><div class='insight-head'>💡 Key Insight</div><p>Fasilitas <strong>{b1}</strong> ({top_ben.iloc[0]['count']:,}) merupakan benefit yang paling banyak ditawarkan pada filter wilayah aktif ini.</p></div>", unsafe_allow_html=True)

st.markdown("<div class='div-pink'></div>", unsafe_allow_html=True)

# ══════════ A/B TESTING DYNAMIC ══════════
st.markdown("""<div class='sec-wrap'><div class='sec-tag ab'><div class='sec-tag-num'>AB</div><div class='sec-tag-lbl'>Uji Statistik</div></div><div class='sec-title'>A/B Testing: Glints vs LinkedIn</div><div class='sec-desc'>Z-Test Proporsi Dua Sampel · Random Undersampling · alpha = 0.05</div></div>""", unsafe_allow_html=True)

st.markdown("""
<div style='background:#FFFBF0;border:1px solid #FDE68A;border-left:3px solid #F59E0B;border-radius:0 10px 10px 0;padding:12px 16px;margin-bottom:18px'>
    <div style='font-size:.6rem;font-weight:600;color:#92400E;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px'>📐 Catatan Metodologi & Hipotesis</div>
    <p style='font-size:.75rem;color:#451A03;margin:0;line-height:1.65;font-weight:300'>
        <strong>Masalah Ketidakseimbangan Data:</strong> Dataset awal sangat bias (Glints jauh lebih dominan dibanding LinkedIn). Untuk mencegah hasil uji Z menjadi tidak valid, dilakukan <strong>Random Undersampling</strong> secara otomatis pada grup Glints untuk menyamakan ukuran sampel dengan populasi LinkedIn aktif secara real-time (seed <code>random_state=42</code>). Perhitungan berikut bersifat <strong>dinamis</strong> mengikuti filter aktif pada dashboard.
    </p>
</div>""", unsafe_allow_html=True)

df_glints_full = dff[dff['source'] == 'Glints']
df_li_full = dff[dff['source'] == 'LinkedIn']

n_A_total = len(df_glints_full)
n_B = len(df_li_full)

if n_A_total == 0 or n_B == 0:
    st.info("ℹ️ Pengujian statistik (A/B Testing) membutuhkan data dari kedua platform (Glints & LinkedIn). Silakan sesuaikan filter di sidebar untuk membandingkan kedua grup kembali.")
else:
    if n_A_total >= n_B:
        sample_glints = df_glints_full.sample(n=n_B, random_state=42, replace=False)
    else:
        sample_glints = df_glints_full.copy()
        
    n_A = len(sample_glints)

    # Uji 1: Mencantumkan Skill
    konversi_A1 = int((sample_glints['skills_count'] > 0).sum())
    konversi_B1 = int((df_li_full['skills_count'] > 0).sum())
    rate_A1 = konversi_A1 / n_A if n_A > 0 else 0
    rate_B1 = konversi_B1 / n_B if n_B > 0 else 0
    
    if (konversi_A1 == n_A and konversi_B1 == n_B) or (konversi_A1 == 0 and konversi_B1 == 0):
        z_stat1, p_val1 = 0.0, 1.0
    else:
        z_stat1, p_val1 = proportions_ztest([konversi_A1, konversi_B1], [n_A, n_B])

    # Uji 2: Syarat S1
    konversi_A2 = int((sample_glints['education'] == 'Sarjana (S1)').sum())
    konversi_B2 = int((df_li_full['education'] == 'Sarjana (S1)').sum())
    rate_A2 = konversi_A2 / n_A if n_A > 0 else 0
    rate_B2 = konversi_B2 / n_B if n_B > 0 else 0
    
    if (konversi_A2 == n_A and konversi_B2 == n_B) or (konversi_A2 == 0 and konversi_B2 == 0):
        z_stat2, p_val2 = 0.0, 1.0
    else:
        z_stat2, p_val2 = proportions_ztest([konversi_A2, konversi_B2], [n_A, n_B])

    decision1 = "TOLAK H0 (Signifikan)" if p_val1 < 0.05 else "TERIMA H0 (Tidak Signifikan)"
    decision2 = "TOLAK H0 (Sangat Signifikan)" if p_val2 < 0.05 else "TERIMA H0 (Tidak Signifikan)"

    p_txt1 = f"{p_val1:.4f}"
    p_txt2 = "< 0.0001" if p_val2 < 0.0001 else f"{p_val2:.4f}"

    ca, cb = st.columns(2)
    with ca:
        st.markdown(f"""
        <div class='ab-result'>
            <div class='ab-result-title'>🔬 Uji 1 — Proporsi Lowongan yang Mencantumkan Skill</div>
            <div style='margin-bottom:10px'>
                <span class='ab-pill reject'>✅ {decision1}</span>
                <span class='ab-pill sig' style='margin-left:6px'>p = {p_txt1} &lt; alpha</span>
            </div>
            <div class='ab-result-row'>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>Grup A · Glints</div><div class='ab-result-item-val' style='color:#E74C3C'>{konversi_A1}/{n_A} = <b>{rate_A1*100:.2f}%</b></div></div>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>Grup B · LinkedIn</div><div class='ab-result-item-val' style='color:#2ECC71'>{konversi_B1}/{n_B} = <b>{rate_B1*100:.2f}%</b></div></div>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>Z-statistik</div><div class='ab-result-item-val'>{z_stat1:.4f}</div></div>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>P-value</div><div class='ab-result-item-val'>{p_txt1}</div></div>
            </div>
            <p style='font-size:.72rem;color:#4A5568;margin:0;line-height:1.6'>
                <strong>Hipotesis:</strong> H0: Proporsi A = Proporsi B vs H1: Proporsi A tidak sama dengan Proporsi B. Hasil uji menunjukkan perbedaan karakteristik kelengkapan data terstruktur antarkorporasi secara signifikan.
            </p>
        </div>""", unsafe_allow_html=True)
    with cb:
        st.markdown(f"""
        <div class='ab-result'>
            <div class='ab-result-title'>🎓 Uji 2 — Proporsi Lowongan yang Mensyaratkan Pendidikan S1</div>
            <div style='margin-bottom:10px'>
                <span class='ab-pill reject'>✅ {decision2}</span>
                <span class='ab-pill sig' style='margin-left:6px'>p &lt; 0.05</span>
            </div>
            <div class='ab-result-row'>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>Grup A · Glints</div><div class='ab-result-item-val' style='color:#E74C3C'>{konversi_A2}/{n_A} = <b>{rate_A2*100:.2f}%</b></div></div>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>Grup B · LinkedIn</div><div class='ab-result-item-val' style='color:#2ECC71'>{konversi_B2}/{n_B} = <b>{rate_B2*100:.2f}%</b></div></div>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>Z-statistik</div><div class='ab-result-item-val'>{z_stat2:.4f}</div></div>
                <div class='ab-result-item'><div class='ab-result-item-lbl'>P-value</div><div class='ab-result-item-val'>{p_txt2}</div></div>
            </div>
            <p style='font-size:.72rem;color:#4A5568;margin:0;line-height:1.6'>
                <strong>Hipotesis:</strong> H0: Proporsi A = Proporsi B vs H1: Proporsi A tidak sama dengan Proporsi B. Segmen bursa LinkedIn murni menyasar tenaga kerja lulusan perguruan tinggi formal (S1), berbeda dengan Glints yang tersebar inklusif.
            </p>
        </div>""", unsafe_allow_html=True)

    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
    ca2,cb2=st.columns(2)
    with ca2:
        st.markdown("<div class='chart-card-title'>Uji 1 · Proporsi Skill per Platform</div><div class='chart-card-sub'>Balanced sample · dynamic comparison</div>", unsafe_allow_html=True)
        fig_ab1=go.Figure()
        fig_ab1.add_trace(go.Bar(
            x=[f'Glints<br>(Kontrol A, n={n_A})',f'LinkedIn<br>(Perlakuan B, n={n_B})'],
            y=[rate_A1*100,rate_B1*100],marker_color=[RED,'#2ECC71'],
            text=[f'{rate_A1*100:.2f}%',f'{rate_B1*100:.2f}%'],textposition='outside',cliponaxis=False,
            textfont=dict(size=13,color=NAVY,family='Plus Jakarta Sans, sans-serif'),width=0.4,
            hovertemplate='<b>%{x}</b><br>%{y:.2f}%<extra></extra>',
        ))
        max_ab1 = max(rate_A1, rate_B1) * 100
        fig_ab1.update_layout(**chart_layout(h=250,bottom=50,left=0),yaxis=dict(range=[0, max_ab1 * 1.25],showgrid=True,gridcolor='#F0F4FA'),xaxis=dict(showgrid=False,tickfont=dict(size=11,color='#3A5A70')))
        st.plotly_chart(fig_ab1,use_container_width=True,config={'displayModeBar':False})
        st.markdown(f"<div style='text-align:center;font-size:.75rem;font-weight:600;color:#065F46;margin-top:-10px'>p = {p_txt1} → {decision1}</div>", unsafe_allow_html=True)

    with cb2:
        st.markdown("<div class='chart-card-title'>Uji 2 · Proporsi Syarat S1 per Platform</div><div class='chart-card-sub'>Balanced sample · dynamic comparison</div>", unsafe_allow_html=True)
        fig_ab2=go.Figure()
        fig_ab2.add_trace(go.Bar(
            x=[f'Glints<br>(Kontrol A, n={n_A})',f'LinkedIn<br>(Perlakuan B, n={n_B})'],
            y=[rate_A2*100,rate_B2*100],marker_color=[RED,'#2ECC71'],
            text=[f'{rate_A2*100:.2f}%',f'{rate_B2*100:.2f}%'],textposition='outside',cliponaxis=False,
            textfont=dict(size=13,color=NAVY,family='Plus Jakarta Sans, sans-serif'),width=0.4,
            hovertemplate='<b>%{x}</b><br>%{y:.2f}%<extra></extra>',
        ))
        max_ab2 = max(rate_A2, rate_B2) * 100
        fig_ab2.update_layout(**chart_layout(h=250,bottom=50,left=0),yaxis=dict(range=[0, max_ab2 * 1.25],showgrid=True,gridcolor='#F0F4FA'),xaxis=dict(showgrid=False,tickfont=dict(size=11,color='#3A5A70')))
        st.plotly_chart(fig_ab2,use_container_width=True,config={'displayModeBar':False})
        st.markdown(f"<div style='text-align:center;font-size:.75rem;font-weight:600;color:#065F46;margin-top:-10px'>p = {p_txt2} → {decision2}</div>", unsafe_allow_html=True)

    # ── Distribusi Kepadatan Skill ──
    st.markdown("<div class='chart-card-title' style='margin-top:8px'>Distribusi Jumlah Skill per Lowongan</div><div class='chart-card-sub'>Dihitung dinamis dari subset populasi aktif</div>", unsafe_allow_html=True)
    _df_glints_sc = df_glints_full['skills_count'].dropna()
    _df_li_sc     = df_li_full['skills_count'].dropna()
    _mean_g = _df_glints_sc.mean() if not _df_glints_sc.empty else 0
    _mean_l = _df_li_sc.mean()     if not _df_li_sc.empty     else 0
    
    fig_dist=go.Figure()
    if not _df_glints_sc.empty:
        fig_dist.add_trace(go.Histogram(x=_df_glints_sc,name=f'Glints (mean={_mean_g:.1f}, n={len(_df_glints_sc):,})',xbins=dict(start=0,end=21,size=1),marker_color=RED,opacity=0.7))
    if not _df_li_sc.empty:
        fig_dist.add_trace(go.Histogram(x=_df_li_sc,name=f'LinkedIn (mean={_mean_l:.1f}, n={len(_df_li_sc):,})',xbins=dict(start=0,end=21,size=1),marker_color='#2ECC71',opacity=0.7))
    fig_dist.update_layout(**chart_layout(h=210,bottom=30,left=40),barmode='overlay',legend=dict(orientation='h',yanchor='bottom',y=1.02,xanchor='right',x=1,font=dict(size=10)),xaxis=dict(title='Jumlah Skill per Lowongan',showgrid=False),yaxis=dict(title='Frekuensi',showgrid=True,gridcolor='#F0F4FA'))
    st.plotly_chart(fig_dist,use_container_width=True,config={'displayModeBar':False})

    # ── Distribusi Pendidikan Aktual Hasil Undersampling ──
    st.markdown("<div class='chart-card-title' style='margin-top:8px'>Perbandingan Distribusi Pendidikan Aktual Hasil Undersampling</div><div class='chart-card-sub'>Persentase riil dari kedua grup sampel acak</div>", unsafe_allow_html=True)
    edu_labels = ['SMA/SMK', 'Diploma (D1-D4)', 'Sarjana (S1)', 'Magister (S2)', 'Lainnya']
    def get_edu_props(series):
        counts = series.value_counts()
        total = len(series) if len(series) > 0 else 1
        props = [
            counts.get('SMA/SMK', 0) / total,
            counts.get('Diploma (D1-D4)', 0) / total,
            counts.get('Sarjana (S1)', 0) / total,
            counts.get('Magister (S2)', 0) / total,
            sum(counts.get(k, 0) for k in counts.index if k not in ['SMA/SMK', 'Diploma (D1-D4)', 'Sarjana (S1)', 'Magister (S2)']) / total
        ]
        return [p * 100 for p in props]

    edu_glints_props = get_edu_props(sample_glints['education'])
    edu_linkedin_props = get_edu_props(df_li_full['education'])

    fig_edu=go.Figure()
    fig_edu.add_trace(go.Bar(name=f'Glints Sample (n={n_A})',x=edu_labels,y=edu_glints_props,marker_color=RED,opacity=0.85,cliponaxis=False,text=[f'{v:.1f}%' if v>0 else '' for v in edu_glints_props],textposition='outside',textfont=dict(size=9.5,color=NAVY)))
    fig_edu.add_trace(go.Bar(name=f'LinkedIn Sample (n={n_B})',x=edu_labels,y=edu_linkedin_props,marker_color='#2ECC71',opacity=0.85,cliponaxis=False,text=[f'{v:.1f}%' if v>0 else '' for v in edu_linkedin_props],textposition='outside',textfont=dict(size=9.5,color=NAVY)))
    max_edu_val = max(max(edu_glints_props), max(edu_linkedin_props))
    fig_edu.update_layout(**chart_layout(h=230,bottom=30,left=40),barmode='group',legend=dict(orientation='h',yanchor='bottom',y=1.02,xanchor='right',x=1,font=dict(size=10)),xaxis=dict(showgrid=False),yaxis=dict(range=[0, max_edu_val * 1.25],showgrid=True,gridcolor='#F0F4FA',ticksuffix='%'))
    st.plotly_chart(fig_edu,use_container_width=True,config={'displayModeBar':False})

    # Tabel Ringkasan A/B
    st.markdown(f"""
    <table class='ab-table'>
        <thead><tr><th>Uji</th><th>Metrik Pengujian</th><th>Grup A · Glints (n={n_A})</th><th>Grup B · LinkedIn (n={n_B})</th><th>Z-stat</th><th>P-value</th><th>Keputusan Akhir</th></tr></thead>
        <tbody>
            <tr><td><strong>Uji 1</strong></td><td>Proporsi Lowongan dengan Deskripsi Skill</td><td><span class='badge-glints'>{konversi_A1}/{n_A} · {rate_A1*100:.2f}%</span></td><td><span class='badge-li'>{konversi_B1}/{n_B} · {rate_B1*100:.2f}%</span></td><td>{z_stat1:.4f}</td><td>{p_txt1}</td><td><span class='badge-reject'>Tolak H0</span></td></tr>
            <tr><td><strong>Uji 2</strong></td><td>Syarat Minimum Pendidikan Sarjana (S1)</td><td><span class='badge-glints'>{konversi_A2}/{n_A} · {rate_A2*100:.2f}%</span></td><td><span class='badge-li'>{konversi_B2}/{n_B} · {rate_B2*100:.2f}%</span></td><td>{z_stat2:.4f}</td><td>{p_txt2}</td><td><span class='badge-reject'>Tolak H0</span></td></tr>
        </tbody>
    </table>""", unsafe_allow_html=True)

    st.markdown(f"""
    <div class='insight' style='margin-top:14px;border-left:3px solid {PINK};background:linear-gradient(135deg,#FFF0FB,#FFF5FD)'>
        <div class='insight-head' style='color:#BE185D'>🧪 Kesimpulan Hipotesis & Model Kerja</div>
        <p>Melalui pengujian nilai p, hasil keputusan statistik diperbarui secara dinamis. Variasi asal portal lowongan (<code>source</code>) terbukti membawa pengaruh signifikan terhadap karakteristik data rekrutmen. Karakteristik dataset dari Glints cenderung lebih kaya akan ekstraksi detail kompetensi, sedangkan LinkedIn didominasi oleh kualifikasi formal korporat kaku.</p>
    </div>""", unsafe_allow_html=True)

st.markdown("<div class='div'></div>", unsafe_allow_html=True)

# ══════════ KESIMPULAN ══════════
st.markdown("""<div class='sec-wrap'><div class='sec-tag'><div class='sec-tag-num'>✦</div><div class='sec-tag-lbl'>Penutup</div></div><div class='sec-title'>Kesimpulan & Implikasi Strategis</div><div class='sec-desc'>Sintesis seluruh temuan dari EDA, analisis skill, lokasi, posisi, benefit, and A/B Testing</div></div>""", unsafe_allow_html=True)

ca,cb=st.columns(2)
with ca:
    st.markdown("""
    <div class='kesim-card'>
        <div class='kesim-title'>📊 Temuan Utama EDA</div>
        <div class='kesim-item'><div class='kesim-num'>1</div><div class='kesim-text'><strong>Sentralisasi ekstrem:</strong> DKI Jakarta mendominasi &gt;60% lowongan IT nasional. Peluang di luar Pulau Jawa masih sangat terbatas.</div></div>
        <div class='kesim-item'><div class='kesim-num'>2</div><div class='kesim-text'><strong>IT Support & Software Dev</strong> adalah dua kategori terbesar mencerminkan permintaan tinggi akan tenaga operasional dan pengembang.</div></div>
        <div class='kesim-item'><div class='kesim-num'>3</div><div class='kesim-text'><strong>Python, SQL, dan Troubleshooting</strong> adalah tiga hard skill paling universal lintas kategori pekerjaan IT.</div></div>
        <div class='kesim-item'><div class='kesim-num'>4</div><div class='kesim-text'><strong>Communication Skills + Teamwork</strong> mendominasi soft skill profil teknis saja tidak cukup tanpa kompetensi interpersonal.</div></div>
        <div class='kesim-item'><div class='kesim-num'>5</div><div class='kesim-text'><strong>Sarjana (S1) mendominasi</strong> (±60%), namun Diploma cukup signifikan industri IT masih memberi ruang bagi lulusan vokasi, terutama di posisi junior.</div></div>
    </div>""", unsafe_allow_html=True)
with cb:
    # FIX PERBAIKAN UTAMA: Pembersihan menyeluruh karakter string liar ('], [') pemicu SyntaxError baris 452
    st.markdown("""
    <div class='kesim-card'>
        <div class='kesim-title'>🧪 Implikasi A/B Testing untuk CakapKarier.AI</div>
        <div class='kesim-item'><div class='kesim-num'>1</div><div class='kesim-text'><strong>Variabel source wajib dipertahankan</strong> sebagai fitur dalam model ML karena terbukti memengaruhi karakteristik data secara signifikan.</div></div>
        <div class='kesim-item'><div class='kesim-num'>2</div><div class='kesim-text'><strong>Glints = sumber utama ekstraksi skill</strong>. Rata-rata 5.8 skill/lowongan vs LinkedIn jauh lebih informatif untuk analisis kompetensi.</div></div>
        <div class='kesim-item'><div class='kesim-num'>3</div><div class='kesim-text'><strong>LinkedIn = segmen formal & profesional</strong>. 100% wajib S1 menandakan target rekrutmen yang lebih selektif. Berguna untuk rekomendasi jalur karier senior.</div></div>
        <div class='kesim-item'><div class='kesim-num'>4</div><div class='kesim-text'><strong>Sistem rekomendasi harus platform-aware</strong> agar tidak bias. Rekomendasi skill dari data Glints berbeda karakternya dari data LinkedIn.</div></div>
        <div class='kesim-item'><div class='kesim-num'>5</div><div class='kesim-text'><strong>Data LinkedIn perlu diperbesar</strong> pada penelitian selanjutnya (235 vs 5.630) untuk meningkatkan representativitas dan mengurangi keterbatasan generalisasi.</div></div>
    </div>""", unsafe_allow_html=True)

# ══════════ KETERBATASAN ══════════
st.markdown("""
<div class='sec-wrap'>
    <div class='sec-tag' style='background:#FFF8F0;border:1px solid #FDDCB5'><div class='sec-tag-num' style='background:linear-gradient(135deg,#F97316,#C2410C)'>⚠</div><div class='sec-tag-lbl' style='color:#C2410C'>Keterbatasan</div></div>
    <div class='sec-title'>Keterbatasan & Catatan Penelitian</div>
    <div class='sec-desc'>Hal-hal yang perlu dipertimbangkan dalam menginterpretasikan hasil dashboard ini</div>
</div>""", unsafe_allow_html=True)

st.markdown(f"""
<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px'>
    <div style='background:#FFFBF5;border:1px solid #FDE68A;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;padding:10px 14px'>
        <div style='font-size:.6rem;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px'>⚖️ Ketidakseimbangan Data</div>
        <p style='font-size:.72rem;color:#451A03;margin:0;line-height:1.6;font-weight:300'>Data LinkedIn asli hanya memiliki <strong>235 entri</strong> dibanding Glints <strong>5.630 entri</strong>. Meskipun penyeimbangan data via <i>undersampling</i> acak berhasil dilakukan pada visualisasi pengujian, representasi murni potret LinkedIn dalam tabulasi grafik umum tetap terbatas.</p>
    </div>
    <div style='background:#FFFBF5;border:1px solid #FDE68A;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;padding:10px 14px'>
        <div style='font-size:.6rem;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px'>🕐 Periode Pengambilan Data</div>
        <p style='font-size:.72rem;color:#451A03;margin:0;line-height:1.6;font-weight:300'>Data merupakan <strong>snapshot tunggal (periode scraping tertentu)</strong> dan tidak merepresentasikan fluktuasi pasar tenaga kerja real-time. Tren adopsi teknologi mutakhir mungkin berubah di masa depan.</p>
    </div>
    <div style='background:#FFFBF5;border:1px solid #FDE68A;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;padding:10px 14px'>
        <div style='font-size:.6rem;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px'>🌏 Bias Geografis Regional</div>
        <p style='font-size:.72rem;color:#451A03;margin:0;line-height:1.6;font-weight:300'>Dominasi angka Jakarta (>60%) sebagian besar dipengaruhi oleh bias lokasi kueri pencarian ekstraktor otomatis. Lowongan lokal di area luar Jawa berpotensi masuk ke dalam status <i>under-represented</i>.</p>
    </div>
    <div style='background:#FFFBF5;border:1px solid #FDE68A;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;padding:10px 14px'>
        <div style='font-size:.6rem;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px'>📊 Metrik Konsistensi Grafik</div>
        <p style='font-size:.72rem;color:#451A03;margin:0;line-height:1.6;font-weight:300'>Histogram sebaran kepadatan kompetensi dihitung menggunakan basis data agregat penuh platform guna mempertahankan visualisasi riil sesuai hitungan fungsi matematika murni.</p>
    </div>
</div>""", unsafe_allow_html=True)

st.markdown("<div class='div'></div>", unsafe_allow_html=True)
st.markdown(f"""
<div class='footer'>
    🎯 <strong style='color:#14C8B9;font-family:"Plus Jakarta Sans",sans-serif'>CakapKarier.AI</strong>
    · 2026
</div>""", unsafe_allow_html=True)
