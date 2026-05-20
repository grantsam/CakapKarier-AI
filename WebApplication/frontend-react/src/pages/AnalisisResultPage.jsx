import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import api from '../utils/api';
import { 
  IconChartBar, 
  IconCircleCheck, 
  IconBolt, 
  IconMap, 
  IconCircleDot,
  IconCircleCheckFilled,
  IconBriefcase,
  IconAlertCircle,
  IconEye,
  IconEdit,
  IconCertificate,
  IconSchool,
  IconAlertTriangle
} from '@tabler/icons-react';

// ==========================================
// Pindahkan Fungsi Helper ke Luar Komponen (Aman dari Hoisting)
// ==========================================
const safeParse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('[')) {
      try { 
        return JSON.parse(trimmed); 
      } catch (e) { 
        console.error("Gagal parse JSON Array, fallback ke text split", e);
      }
    }
    
    if (trimmed.includes('\n')) {
      return trimmed.split('\n').map(line => line.replace(/^-\s*/, '').trim()).filter(Boolean);
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  
  if (typeof data === 'object') return [data];
  return [];
};

const safeParseObject = (data) => {
  if (!data) return {};
  if (typeof data === 'object' && !Array.isArray(data)) return data;
  
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('{')) {
      try { return JSON.parse(trimmed); } catch (e) { }
    }
    return { info_text: trimmed, education_label: trimmed, pendidikan: trimmed };
  }
  return {};
};

const AnalisisResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: historyId } = useParams();
  
  const stateAnalysisData = location.state?.data;
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(true);
  const [historyDetailError, setHistoryDetailError] = useState('');

  useEffect(() => {
    if (stateAnalysisData) {
      console.log("=== DEBUG: Data dari Navigation State ===", stateAnalysisData);
      
      const rawPayload = stateAnalysisData.response_payload || stateAnalysisData.result || stateAnalysisData;
      const parsedPayload = typeof rawPayload === 'string' ? safeParseObject(rawPayload) : rawPayload;

      setAnalysisData({
        ...stateAnalysisData,
        response_payload: parsedPayload,
        analysis_id: stateAnalysisData.id || stateAnalysisData.analysis_id,
        saved_at: stateAnalysisData.created_at || stateAnalysisData.saved_at
      });
      setLoadingHistoryDetail(false);
      return;
    }

    console.log("=== DEBUG: historyId dari useParams() ===", historyId);
    if (!historyId) {
      setLoadingHistoryDetail(false);
      return;
    }

    const fetchHistoryDetail = async () => {
      setLoadingHistoryDetail(true);
      setHistoryDetailError('');

      try {
        const URL_API = `/api/analysis/career-match/history/${historyId}`;
        console.log("=== DEBUG: Mencoba Hit Endpoint ===", URL_API);
      
        const response = await api.get(URL_API);
        console.log("=== DEBUG: Mentah dari Axios (response.data) ===", response.data);

        const envelope = response.data;
        const detail = envelope?.data || envelope;
        console.log("=== DEBUG: Setelah Ekstraksi Properti 'data' ===", detail);

        if (!detail) {
          throw new Error("Respons kosong dari server");
        }

        let finalPayload = {};
        if (detail.response_payload) {
          finalPayload = typeof detail.response_payload === 'string' 
            ? safeParseObject(detail.response_payload) 
            : detail.response_payload;
        } else if (detail.result) {
          finalPayload = typeof detail.result === 'string' ? safeParseObject(detail.result) : detail.result;
        } else {
          finalPayload = detail;
        }

        setAnalysisData({
          ...detail,
          response_payload: finalPayload,
          analysis_id: detail.id || detail.analysis_id || historyId,
          saved_at: detail.created_at || detail.saved_at,
        });

      } catch (err) {
        console.error("=== DEBUG ERROR: Gagal Fetch ===", err);
        if (err.response?.status === 401) {
          alert('Sesi Anda berakhir. Silakan login kembali.');
          navigate('/signin');
          return;
        }
        setHistoryDetailError(err.response?.data?.message || 'Gagal memuat detail riwayat analisis.');
      } finally {
        setLoadingHistoryDetail(false);
      }
    };

    fetchHistoryDetail();
  }, [historyId, navigate, JSON.stringify(stateAnalysisData)]);

  if (loadingHistoryDetail) {
    return (
      <div className="min-h-screen bg-slate-50 font-poppins flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow pt-32 pb-16 px-6 text-center max-w-md mx-auto space-y-4">
          <IconAlertCircle className="mx-auto text-[#004A7C] animate-pulse" size={48} />
          <h2 className="text-xl font-bold text-slate-800">Memuat Detail Riwayat</h2>
          <p className="text-slate-600 text-sm">Mengambil hasil analisis tersimpan dari backend.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-50 font-poppins flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow pt-32 pb-16 px-6 text-center max-w-md mx-auto space-y-4">
          <IconAlertCircle className="mx-auto text-amber-500" size={48} />
          <h2 className="text-xl font-bold text-slate-800">Data Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm">
            {historyDetailError || 'Silakan lakukan analisis kesiapan karier terlebih dahulu untuk melihat hasil.'}
          </p>
          <button 
            onClick={() => navigate(historyId ? '/riwayat' : '/analisis')}
            className="w-full py-3 bg-[#004A7C] text-white font-bold rounded-xl text-sm transition-colors hover:bg-[#00365c]"
          >
            {historyId ? 'Kembali ke Riwayat' : 'Kembali ke Form Analisis'}
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const sourceData = analysisData?.response_payload && Object.keys(analysisData.response_payload).length > 0
    ? analysisData.response_payload 
    : analysisData;
  
  const target_role = sourceData?.target_role || analysisData?.target_role;
  const predicted_role = sourceData?.predicted_role || analysisData?.predicted_role;
  const readiness_score = sourceData?.readiness_score ?? analysisData?.readiness_score;
  const readiness_status = sourceData?.readiness_status || analysisData?.readiness_status;
  const match_confidence = sourceData?.match_confidence ?? analysisData?.match_confidence;
  const mastered_skill_count = sourceData?.mastered_skill_count ?? analysisData?.mastered_skill_count;
  const skill_gap_count = sourceData?.skill_gap_count ?? analysisData?.skill_gap_count;

  const mastered_skills = safeParse(sourceData?.mastered_skills);
  const skill_gap_analysis = safeParse(sourceData?.skill_gap_analysis);
  const roadmap = safeParse(sourceData?.roadmap);
  const tips = safeParse(sourceData?.tips);
  const top_matches = safeParse(sourceData?.top_matches);
  const input_interpretation = safeParseObject(sourceData?.input_interpretation);

  const {
    education_label,
    education_level,
    experience_years,
    experience_text,
    certifications,
    skills,
    pendidikan,
    pengalaman_tahun,
    pengalaman_text,
    sertifikasi,
    explicit_skills,
    experience_derived_skills,
    certification_derived_skills,
    risk_flags,
    info_text
  } = input_interpretation || {};

  const isFiniteNumber = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  const emptyValueLabel = 'Belum tersedia';
  
  const displayEducation = education_label || pendidikan || education_level || null;
  const displayExperienceYears = isFiniteNumber(experience_years ?? pengalaman_tahun)
    ? Number(experience_years ?? pengalaman_tahun)
    : null;
  const displayExperienceText = experience_text || pengalaman_text || '';
  const displayCertifications = Array.isArray(certifications) ? certifications : (Array.isArray(sertifikasi) ? sertifikasi : []);
  const displayExplicitSkills = Array.isArray(skills) ? skills : (Array.isArray(explicit_skills) ? explicit_skills : []);
  const displayExperienceDerivedSkills = Array.isArray(experience_derived_skills) ? experience_derived_skills : [];
  const displayCertificationDerivedSkills = Array.isArray(certification_derived_skills) ? certification_derived_skills : [];
  const displayRiskFlags = Array.isArray(risk_flags) ? risk_flags.filter((flag) => flag?.message) : [];
  const displayMasteredSkills = Array.isArray(mastered_skills) ? mastered_skills : [];
  const displaySkillGapAnalysis = Array.isArray(skill_gap_analysis) ? skill_gap_analysis : [];
  const displayRoadmap = Array.isArray(roadmap) ? roadmap : [];
  const displayTips = Array.isArray(tips) ? tips.filter(Boolean) : [];
  
  const readinessScoreValue = isFiniteNumber(readiness_score) ? Number(readiness_score) : null;
  const matchConfidenceValue = isFiniteNumber(match_confidence) ? Number(match_confidence) : null;
  const confidencePercent = matchConfidenceValue !== null ? Math.round(matchConfidenceValue * 100) : null;
  
  const masteredSkillCountValue = isFiniteNumber(mastered_skill_count)
    ? Number(mastered_skill_count)
    : (displayMasteredSkills.length > 0 ? displayMasteredSkills.length : null);
    
  const skillGapCountValue = isFiniteNumber(skill_gap_count)
    ? Number(skill_gap_count)
    : (displaySkillGapAnalysis.length > 0 ? displaySkillGapAnalysis.length : null);

  const validTopMatches = Array.isArray(top_matches)
    ? top_matches
        .map((job) => ({
          ...job,
          displayTitle: job?.job_title || job?.title || job?.job_name || '',
          displayScore: isFiniteNumber(job?.match_score ?? job?.score) ? Number(job?.match_score ?? job?.score) : null,
        }))
        .filter((job) => job.displayTitle)
    : [];

  const hasCoreResult = Boolean(predicted_role) && readinessScoreValue !== null && Boolean(readiness_status);

  const getGapBadgeColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'tinggi' || p === 'high') return 'bg-red-50 text-red-500 border-red-100';
    if (p === 'menengah' || p === 'medium') return 'bg-blue-50 text-blue-500 border-blue-100';
    return 'bg-orange-50 text-orange-500 border-orange-100';
  };

  const renderMiniChips = (items, emptyText, colorClass = 'bg-slate-100 text-slate-600 border-slate-200') => (
    Array.isArray(items) && items.length > 0 ? (
      items.map((item, index) => (
        <span key={`${item}-${index}`} className={`px-1.5 py-0.5 text-[9px] rounded font-medium border ${colorClass}`}>
          {item}
        </span>
      ))
    ) : (
      <span className="text-slate-400 italic">{emptyText}</span>
    )
  );

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Judul */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-1">
                Hasil Analisis Kesiapan Karier
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium mt-2">
                <p className="text-slate-600">Target Anda: <span className="text-[#004A7C] font-semibold">{target_role || emptyValueLabel}</span></p>
                <span className="hidden md:inline text-slate-300">|</span>
                <p className="text-slate-600">Match Katalog Terkuat: <span className="text-teal-600 font-semibold">{predicted_role || emptyValueLabel}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate(historyId ? '/riwayat' : '/analisis')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all shrink-0"
            >
              <IconEdit size={16} /> {historyId ? 'Kembali ke Riwayat' : 'Perbaiki Input Data'}
            </button>
          </div>

          {!hasCoreResult && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              Sebagian output utama belum tersedia dari backend/AI model. Halaman ini hanya menampilkan field yang benar-benar dikirim.
            </div>
          )}

          {/* LAYER 1: RINGKASAN UNTUK USER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skor Kesiapan */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Estimasi Kesiapan</h3>
                  <p className="text-[10px] text-slate-400">Berdasarkan profil yang Anda isi</p>
                </div>
                <IconChartBar className="text-teal-500" size={24} />
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                {readinessScoreValue !== null ? (
                  <>
                    <span className="text-4xl font-extrabold text-teal-600">{readinessScoreValue}</span>
                    <span className="text-slate-400 font-bold text-sm">/ 100</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">{emptyValueLabel}</span>
                )}
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${readinessScoreValue ?? 0}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {readiness_status ? (
                  <>
                    Status: <span className="font-bold text-slate-700">{readiness_status}</span>.
                  </>
                ) : (
                  'Status kesiapan belum tersedia.'
                )}
                {confidencePercent !== null && (
                  <>
                    {' '}Tingkat kecocokan model sebesar <span className="font-bold text-teal-600">{confidencePercent}%</span> terhadap standar role.
                  </>
                )}
              </p>
            </div>

            {/* Skill Dikuasai */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-slate-800 text-sm">Skill Terdeteksi</h3>
                <IconCircleCheck className="text-teal-500" size={24} />
              </div>
              <div className={`${masteredSkillCountValue !== null ? 'text-4xl' : 'text-sm'} font-extrabold text-teal-600 mb-4`}>
                {masteredSkillCountValue ?? emptyValueLabel}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto pr-1">
                {displayMasteredSkills.length > 0 ? (
                  displayMasteredSkills.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-bold border border-teal-100 whitespace-nowrap">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Data skill belum tersedia</span>
                )}
              </div>
            </div>

            {/* Skill Gap Count */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-slate-800 text-sm">Kekurangan Skill (Gap)</h3>
                <IconBolt className="text-red-500" size={24} />
              </div>
              <div className={`${skillGapCountValue !== null ? 'text-4xl' : 'text-sm'} font-extrabold text-red-500 mb-4`}>
                {skillGapCountValue ?? emptyValueLabel}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Fokuskan pengembangan pada prioritas utama di bawah untuk meningkatkan nilai jual kompetensi Anda.
              </p>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconBolt className="text-[#004A7C]" size={22} />
                <h2 className="font-bold text-[#004A7C] text-base">Analisis Kesenjangan Skill Prioritas</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Menampilkan 3 Prioritas Tertinggi</span>
            </div>
            <div className="p-6 space-y-3">
              {displaySkillGapAnalysis.length > 0 ? (
                displaySkillGapAnalysis.slice(0, 3).map((item, idx) => {
                  const skillName = typeof item === 'object' && item !== null ? (item?.name || item?.skill) : item;
                  const skillReason = typeof item === 'object' && item !== null ? (item?.description || item?.reason) : '';
                  const skillPriority = typeof item === 'object' && item !== null ? item?.priority : '';

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{skillName || emptyValueLabel}</h4>
                        {skillReason && <p className="text-[11px] text-slate-500">{skillReason}</p>}
                      </div>
                      {skillPriority && (
                        <span className={`px-4 py-1 rounded-full text-[10px] font-bold border shrink-0 ${getGapBadgeColor(skillPriority)}`}>
                          {skillPriority}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">
                  {skillGapCountValue === 0 ? 'Tidak ada gap skill yang dikirim backend.' : 'Data skill gap belum tersedia.'}
                </p>
              )}
            </div>
          </div>

          {/* Roadmap Pengembangan */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <IconMap className="text-[#004A7C]" size={22} />
              <h2 className="font-bold text-[#004A7C] text-base">Fase Roadmap Pengembangan Keterampilan</h2>
            </div>
            <div className="p-8">
              <div className="relative border-l-2 border-[#004A7C] ml-3 space-y-12">
                {displayRoadmap.length > 0 ? (
                  displayRoadmap.slice(0, 3).map((step, idx) => {
                    const phase = typeof step === 'object' && step !== null ? step?.phase : `Fase ${idx + 1}`;
                    const items = typeof step === 'object' && step !== null && Array.isArray(step?.items) ? step.items.filter(Boolean) : [];
                    const description = typeof step === 'object' && step !== null ? step?.description : step;

                    return (
                      <div key={idx} className="relative pl-8">
                        <div className="absolute -left-[9px] top-0">
                          <IconCircleDot className="text-[#004A7C] bg-white rounded-full" size={16} />
                        </div>
                        {phase && <h3 className="font-bold text-slate-800 text-sm mb-3">{phase}</h3>}
                        <ul className="space-y-2">
                          {items.length > 0 ? (
                            items.map((li, i) => (
                              <li key={i} className="text-[12px] text-slate-600 flex items-start gap-2 leading-relaxed">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#004A7C] shrink-0"></span>
                                <span>{li}</span>
                              </li>
                            ))
                          ) : (
                            description && <li className="text-[12px] text-slate-600">{description}</li>
                          )}
                        </ul>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 italic pl-4">Data roadmap belum tersedia.</p>
                )}
              </div>
            </div>
          </div>

          {/* LAYER 2: DETAIL DAN TRANSPARANSI DATA */}
          <div className="border-t border-dashed border-slate-300 pt-6">
            <div className="flex items-center gap-2 mb-6">
              <IconEye className="text-slate-500" size={20} />
              <h2 className="font-bold text-slate-700 text-lg">Transparansi Data & Interpretasi Model</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kolom Interpretasi Masukan User */}
              <div className="md:col-span-1 bg-slate-100/70 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Profil yang Terbaca AI</h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex gap-2 items-start">
                    <IconSchool size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Pendidikan</p>
                      <p className="font-bold text-slate-700 uppercase">{displayEducation || emptyValueLabel}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start">
                    <IconBriefcase size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Pengalaman Kerja</p>
                      <p className="font-bold text-slate-700">
                        {displayExperienceYears !== null ? `${displayExperienceYears} Tahun` : emptyValueLabel}
                      </p>
                      {displayExperienceText && <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-3">{displayExperienceText}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 items-start">
                    <IconCertificate size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Sertifikasi</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {displayCertifications.length > 0 ? (
                          displayCertifications.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] rounded font-medium border border-amber-200">{c}</span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">{emptyValueLabel}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 space-y-3">
                    <div>
                      <p className="font-medium text-slate-400 mb-1">Skill Dicantumkan User</p>
                      <div className="flex flex-wrap gap-1">
                        {renderMiniChips(displayExplicitSkills, 'Belum tersedia', 'bg-sky-50 text-[#004A7C] border-sky-100')}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-slate-400 mb-1">Skill Dari Pengalaman</p>
                      <div className="flex flex-wrap gap-1">
                        {renderMiniChips(displayExperienceDerivedSkills, emptyValueLabel, 'bg-teal-50 text-teal-700 border-teal-100')}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-slate-400 mb-1">Skill Dari Sertifikasi</p>
                      <div className="flex flex-wrap gap-1">
                        {renderMiniChips(displayCertificationDerivedSkills, emptyValueLabel, 'bg-amber-50 text-amber-800 border-amber-100')}
                      </div>
                    </div>
                  </div>

                  {displayRiskFlags.length > 0 && (
                    <div className="border-t border-slate-200 pt-3 space-y-2">
                      <div className="flex items-center gap-1 text-amber-700">
                        <IconAlertTriangle size={14} />
                        <p className="font-bold text-[11px]">Catatan Transparansi</p>
                      </div>
                      <div className="space-y-1.5">
                        {displayRiskFlags.slice(0, 3).map((flag, index) => (
                          <p key={`${flag?.code || 'flag'}-${index}`} className="text-[10px] text-slate-500 leading-relaxed">
                            {flag.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom Lowongan Pembanding */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#004A7C] tracking-wider uppercase">Lowongan Pembanding dari Katalog</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Disajikan sebagai data uji referensi pasar, bukan jaminan final penempatan kerja.</p>
                </div>

                <div className="space-y-2">
                  {validTopMatches.length > 0 ? (
                    validTopMatches.slice(0, 3).map((job, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{job.displayTitle}</p>
                          {job?.company && <p className="text-slate-500 text-[11px]">{job.company}</p>}
                        </div>
                        {job.displayScore !== null && (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold">
                            Match: {Math.round(job.displayScore * 100)}%
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 italic text-xs">Data lowongan pembanding belum tersedia.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {displayTips.length > 0 && (
            <div className="bg-sky-50/60 border border-sky-100 rounded-[1.5rem] p-6">
              <h3 className="font-bold text-[#004A7C] mb-4 text-sm flex items-center gap-2">
                <IconCircleCheckFilled size={18} /> Rekomendasi Langkah Sukses
              </h3>
              <ul className="space-y-3">
                {displayTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[12px] text-slate-700 leading-relaxed">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#004A7C] shrink-0"></span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalisisResultPage;