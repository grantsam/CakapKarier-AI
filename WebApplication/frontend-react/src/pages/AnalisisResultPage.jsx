import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import Button from '../components/ui/Button';
import { AnalysisResultSkeleton } from '../components/ui/Skeleton';
import api from '../utils/api';
import { getRoleFamilyLabel, getTargetRoleLabel } from '../utils/careerLabels';
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
  IconAlertTriangle,
  IconChevronDown,
  IconArrowRight
} from '@tabler/icons-react';

const safeParse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('[')) {
      try { 
        return JSON.parse(trimmed); 
      } catch {
        // Fall back to plain text parsing below when backend sends malformed JSON.
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
      try {
        return JSON.parse(trimmed);
      } catch {
        return { info_text: trimmed, education_label: trimmed, pendidikan: trimmed };
      }
    }
    return { info_text: trimmed, education_label: trimmed, pendidikan: trimmed };
  }
  return {};
};

const formatDateTime = (value) => {
  if (!value) return 'Tanggal analisis belum tersedia';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal analisis belum tersedia';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const AnalisisResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const historyId = params.id || params.historyId || params.analysisId;
  
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(true);
  const [historyDetailError, setHistoryDetailError] = useState('');
  const [showTransparency, setShowTransparency] = useState(true);

  useEffect(() => {
    const handleData = async () => {
      setLoadingHistoryDetail(true);
      setHistoryDetailError('');

      if (location.state?.data) {
        const dataBaru = location.state.data;
        const rawPayload = dataBaru.response_payload || dataBaru.result || dataBaru;
        const finalPayload = typeof rawPayload === 'string' ? safeParseObject(rawPayload) : rawPayload;

        setAnalysisData({
          ...dataBaru,
          readiness_score: dataBaru.readiness_score ?? finalPayload?.readiness_score,
          mastered_skill_count: dataBaru.mastered_skill_count ?? finalPayload?.mastered_skill_count,
          skill_gap_count: dataBaru.skill_gap_count ?? finalPayload?.skill_gap_count,
          response_payload: finalPayload,
          analysis_id: dataBaru.id || dataBaru.analysis_id,
          saved_at: dataBaru.created_at || dataBaru.saved_at,
        });
        setLoadingHistoryDetail(false);
        return; 
      }

      if (!historyId) {
        setHistoryDetailError("ID riwayat analisis tidak ditemukan. Silakan kembali ke menu riwayat.");
        setLoadingHistoryDetail(false);
        return;
      }

      try {
        const URL_API = `/analysis/career-match/history/${historyId}`;

        const response = await api.get(URL_API);
        const envelope = response.data;
        const detail = envelope?.data || envelope;

        if (!detail) throw new Error("Respons kosong dari server");

        const rawPayload = detail.response_payload || detail.result || detail;
        const finalPayload = typeof rawPayload === 'string' ? safeParseObject(rawPayload) : rawPayload;

        setAnalysisData({
          ...detail,
          readiness_score: detail.readiness_score ?? finalPayload?.readiness_score,
          mastered_skill_count: detail.mastered_skill_count ?? finalPayload?.mastered_skill_count,
          skill_gap_count: detail.skill_gap_count ?? finalPayload?.skill_gap_count,
          response_payload: finalPayload,
          analysis_id: detail.id || detail.analysis_id || historyId,
          saved_at: detail.created_at || detail.saved_at,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/signin', { state: { message: 'Sesi Anda berakhir. Silakan masuk kembali.' } });
          return;
        }
        setHistoryDetailError(err.response?.data?.message || 'Gagal memuat detail riwayat analisis.');
      } finally {
        setLoadingHistoryDetail(false);
      }
    };

    handleData();
  }, [historyId, navigate, location.state?.data]);

  if (loadingHistoryDetail) {
    return (
      <div className="min-h-screen bg-slate-50 font-poppins flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow pt-32 pb-16 px-6">
          <AnalysisResultSkeleton />
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
          <Button
            onClick={() => navigate(historyId ? '/riwayat' : '/analisis')}
            fullWidth
          >
            {historyId ? 'Kembali ke Riwayat' : 'Kembali ke Form Analisis'} <IconArrowRight size={16} />
          </Button>
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
  const role_family = sourceData?.role_family || analysisData?.role_family;
  const aiSummary = typeof sourceData?.ai_summary === 'string' ? sourceData.ai_summary.trim() : '';
  const aiSummarySource = sourceData?.ai_summary_source || sourceData?.analysis_metadata?.ai_summary_source || null;
  const genaiProvider = sourceData?.genai_provider || sourceData?.analysis_metadata?.genai_provider || null;
  const genaiModel = sourceData?.genai_model || sourceData?.analysis_metadata?.genai_model || null;

  const mastered_skills = safeParse(sourceData?.mastered_skills);
  const skill_gap_analysis = safeParse(sourceData?.skill_gap_analysis);
  const roadmap = safeParse(sourceData?.roadmap);
  const recommendations = safeParse(sourceData?.recommendations);
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
    skill_levels,
    experience_derived_skills,
    certification_derived_skills,
    risk_flags
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
  const displaySkillLevels = Array.isArray(skill_levels) ? skill_levels.filter((skill) => skill?.name) : [];
  const displayExperienceDerivedSkills = Array.isArray(experience_derived_skills) ? experience_derived_skills : [];
  const displayCertificationDerivedSkills = Array.isArray(certification_derived_skills) ? certification_derived_skills : [];
  const displayRiskFlags = Array.isArray(risk_flags) ? risk_flags.filter((flag) => flag?.message) : [];
  const displayMasteredSkills = Array.isArray(mastered_skills) ? mastered_skills : [];
  const displaySkillGapAnalysis = Array.isArray(skill_gap_analysis) ? skill_gap_analysis : [];
  const displayRoadmap = Array.isArray(roadmap) ? roadmap : [];
  const displayRecommendations = Array.isArray(recommendations) ? recommendations.filter(Boolean) : [];
  const displayTips = Array.isArray(tips) ? tips.filter(Boolean) : [];
  
  const readinessScoreValue = isFiniteNumber(readiness_score) ? Number(readiness_score) : null;
  const roundedReadinessScore = readinessScoreValue !== null ? Math.round(readinessScoreValue) : null;
  const clampedReadinessPercent = readinessScoreValue !== null
    ? Math.min(100, Math.max(0, readinessScoreValue))
    : 0;
  const matchConfidenceValue = isFiniteNumber(match_confidence) ? Number(match_confidence) : null;
  const confidencePercent = matchConfidenceValue !== null ? Math.round(matchConfidenceValue * 100) : null;
  
  const masteredSkillCountValue = isFiniteNumber(mastered_skill_count)
    ? Number(mastered_skill_count)
    : (displayMasteredSkills.length > 0 ? displayMasteredSkills.length : null);
    
  const skillGapCountValue = isFiniteNumber(skill_gap_count)
    ? Number(skill_gap_count)
    : (displaySkillGapAnalysis.length > 0 ? displaySkillGapAnalysis.length : null);

  const validTopMatchesRaw = Array.isArray(top_matches)
    ? top_matches
        .map((job) => ({
          ...job,
          displayTitle: job?.job_title || job?.title || job?.job_name || '',
          displayScore: isFiniteNumber(job?.match_score ?? job?.score) ? Number(job?.match_score ?? job?.score) : null,
        }))
        .filter((job) => job.displayTitle)
    : [];

  const validTopMatches = validTopMatchesRaw.filter((job, index, array) => {
    const uniqueKey = `${job.displayTitle}|${job.company || ''}|${job.location || ''}`;
    return array.findIndex((candidate) => (
      `${candidate.displayTitle}|${candidate.company || ''}|${candidate.location || ''}` === uniqueKey
    )) === index;
  });

  const hasCoreResult = Boolean(predicted_role) && readinessScoreValue !== null && Boolean(readiness_status);
  const targetRoleLabel = getTargetRoleLabel(target_role);
  const roleFamilyLabel = getRoleFamilyLabel(role_family);
  const aiSummarySourceLabel = (() => {
    if (!aiSummarySource) return 'Ringkasan Sistem';
    if (aiSummarySource === 'deterministic_fallback') return 'Ringkasan Sistem';
    if (genaiProvider === 'gemini') return 'Ringkasan Gemini';
    return `Ringkasan ${genaiProvider || 'GenAI'}`;
  })();
  const primaryGap = displaySkillGapAnalysis[0];
  const primaryGapName = typeof primaryGap === 'object' && primaryGap !== null
    ? (primaryGap?.name || primaryGap?.skill)
    : primaryGap;
  const savedAt = analysisData?.saved_at || sourceData?.saved_at || analysisData?.created_at;
  const primaryActionText = primaryGapName
    ? <>Kuatkan skill <span className="font-bold text-amber-300">{primaryGapName}</span> sebagai prioritas pengembangan berikutnya.</>
    : 'Lanjutkan penguatan portofolio sesuai role teratas untuk menjaga kesiapan profil Anda.';

  const getGapBadgeColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'tinggi' || p === 'high') return 'bg-red-50 text-red-500 border-red-100';
    if (p === 'menengah' || p === 'medium') return 'bg-amber-50 text-amber-600 border-amber-100';
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
              <p className="text-xs text-slate-400 font-medium mb-2">
                Dianalisis pada {formatDateTime(savedAt)}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium mt-2">
                <p className="text-slate-600">
                  {target_role ? 'Target Anda' : 'Target'}: <span className="text-teal-600 font-semibold">{targetRoleLabel}</span>
                </p>
                <span className="hidden md:inline text-slate-300">|</span>
                <p className="text-slate-600">Role paling cocok saat ini: <span className="text-teal-600 font-semibold">{predicted_role || emptyValueLabel}</span></p>
                {role_family && (
                  <>
                    <span className="hidden md:inline text-slate-300">|</span>
                    <p className="text-slate-600">Kategori: <span className="text-teal-600 font-semibold">{roleFamilyLabel}</span></p>
                  </>
                )}
              </div>
              {!target_role && (
                <p className="text-xs text-slate-400 mt-1">Sistem memilih role terdekat dari katalog berdasarkan profil yang Anda isi.</p>
              )}
            </div>
            <Button
              onClick={() => navigate(historyId ? '/riwayat' : '/analisis')}
              variant="outline"
              size="sm"
              icon={IconEdit}
              className="shrink-0"
            >
              {historyId ? 'Kembali ke Riwayat' : 'Coba Analisis Lagi'}
            </Button>
          </div>

          {!hasCoreResult && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              Sebagian hasil belum tersedia. Halaman ini hanya menampilkan data analisis yang berhasil diterima.
            </div>
          )}

          {/* LAYER 1: RINGKASAN UNTUK USER */}
          <div className="bg-[#004A7C] rounded-[1.5rem] shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-full md:w-auto min-w-[150px] flex flex-col">
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  SKOR
                </span>
                <div className="flex items-baseline">
                  <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {roundedReadinessScore !== null ? roundedReadinessScore : emptyValueLabel}
                  </span>
                  <span className="text-white/60 text-sm font-semibold ml-1">/ 100</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="bg-[#FFFFFF] h-full transition-all duration-500" 
                    style={{ width: `${clampedReadinessPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="hidden md:block h-16 w-[1px] bg-white/20 mx-2" />
              <div className="space-y-2 flex-1 w-full">
                <div className="block">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center ${
                    (() => {
                      const s = readiness_status?.toLowerCase();
                      if (s === 'siap' || s === 'ready') return 'bg-teal-50 text-teal-600 border-teal-100';
                      if (s === 'cukup siap' || s === 'moderately ready') return 'bg-orange-50 text-orange-600 border-orange-100';
                      if (!s) return 'bg-slate-50 text-slate-500 border-slate-100';
                      return 'bg-red-50 text-red-600 border-red-100';
                    })()
                  }`}>
                    {readiness_status || emptyValueLabel}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white-100">
                    ROLE PALING COCOK
                  </p>
                  <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-white mt-0.5">
                    {predicted_role ? predicted_role : 'Role paling cocok belum tersedia.'}
                  </h2>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-white/90">
              <IconBolt className="text-amber-400 shrink-0" size={16} />
              <p>{primaryActionText}</p>
            </div>
          </div>

          {aiSummary && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                  <IconBolt className="text-[#004A7C]" size={20} /> Ringkasan GenAI
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                  {aiSummarySourceLabel}{genaiModel && aiSummarySource === 'provider' ? ` - ${genaiModel}` : ''}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{aiSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Dikuasai */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-slate-800 text-sm">Skill Terdeteksi</h3>
                <IconCircleCheck className="text-teal-500" size={24} />
              </div>
              <div className={`${masteredSkillCountValue !== null ? 'text-4xl' : 'text-sm'} font-extrabold text-teal-600 mb-4`}>
                {masteredSkillCountValue ?? emptyValueLabel}
              </div>
              <div className="scroll-cue flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto pr-1">
                {displayMasteredSkills.length > 0 ? (
                  displayMasteredSkills.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-medium border border-teal-100 whitespace-nowrap">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Daftar skill terdeteksi belum tersedia.</span>
                )}
              </div>
            </div>

            {/* Skill Gap Count */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconBolt className="text-[#004A7C]" size={22} />
                <h2 className="font-semibold text-black text-base">Analisis Kesenjangan Skill Prioritas</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Menampilkan 3 prioritas tertinggi</span>
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
                        <h4 className="font-semibold text-slate-800 text-sm">{skillName || emptyValueLabel}</h4>
                        {skillReason && <p className="text-[11px] text-slate-500">{skillReason}</p>}
                      </div>
                      {skillPriority && (
                        <span className={`px-4 py-1 rounded-full text-[10px] font-medium border shrink-0 ${getGapBadgeColor(skillPriority)}`}>
                          {skillPriority}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">
                  {skillGapCountValue === 0 ? 'Tidak ada gap skill yang terdeteksi.' : 'Analisis gap skill belum tersedia.'}
                </p>
              )}
            </div>
          </div>

          {/* Roadmap Pengembangan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start gap-3">
              <IconMap className="text-[#004A7C] mt-0.5" size={22} />
              <div>
                <h2 className="font-semibold text-black text-base">Fase Roadmap Pengembangan Keterampilan</h2>
                <p className="text-xs text-slate-400 mt-1">Gunakan fase ini sebagai urutan rencana belajar, lalu mulai dari fase pertama.</p>
              </div>
            </div>
            <div className="p-8">
              <div className="relative border-l-2 border-[#004A7C] ml-3 space-y-12">
                {displayRoadmap.length > 0 ? (
                  displayRoadmap.slice(0, 3).map((step, idx) => {
                    const rawPhase = typeof step === 'object' && step !== null ? (step?.phase || '') : '';
                    const cleanPhaseText = rawPhase
                      ? rawPhase.replace(/^(fase|phase)\s*\d+\s*:\s*/i, '').replace(/^(fase|phase)\s*\d+/i, '').trim()
                      : '';
                    const finalPhaseTitle = cleanPhaseText ? `Fase ${idx + 1}: ${cleanPhaseText}` : `Fase ${idx + 1}`;
                    const items = typeof step === 'object' && step !== null && Array.isArray(step?.items) ? step.items.filter(Boolean) : [];
                    const description = typeof step === 'object' && step !== null ? step?.description : step;

                    return (
                      <div key={idx} className="relative pl-8">
                        <div className="absolute -left-[9px] top-0">
                          <IconCircleDot className="text-[#004A7C] bg-white rounded-full" size={16} />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm mb-3">
                          {finalPhaseTitle}
                        </h3>
                        <ul className="space-y-2">
                          {items.length > 0 ? (
                            items.map((li, i) => (
                              <li key={i} className="text-[12px] text-slate-600 flex items-start gap-2 leading-relaxed">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#004A7C] shrink-0"></span>
                                <span>{li}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-[12px] text-slate-600">{description || 'Detail fase belum tersedia.'}</li>
                          )}
                        </ul>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 italic pl-4">Roadmap pengembangan belum tersedia.</p>
                )}
              </div>
            </div>
          </div>

          {displayRecommendations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm flex items-center gap-2">
                <IconBolt size={18} className="text-[#004A7C]" /> Rekomendasi Belajar Spesifik
              </h3>
              <ul className="space-y-3">
                {displayRecommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[12px] text-slate-700 leading-relaxed">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#004A7C] shrink-0"></span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {displayTips.length > 0 && (
            <div className="bg-[#E4F0FF] border border-sky-100 rounded-2xl p-6">
              <h3 className="font-semibold text-[#004A7C] mb-4 text-sm flex items-center gap-2">
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

          {/* LAYER 2: DETAIL DAN TRANSPARANSI DATA */}
          <div className="border-t border-dashed border-slate-300 pt-6">
            <motion.button
              type="button"
              onClick={() => setShowTransparency((current) => !current)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              aria-expanded={showTransparency}
              className={`motion-cue w-full flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all shadow-sm ${
                showTransparency
                  ? 'border-[#004A7C]/20 bg-[#E4F0FF] shadow-[#004A7C]/10'
                  : 'border-slate-200 bg-white hover:border-[#004A7C]/30 hover:bg-[#E4F0FF]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-[#004A7C] shadow-sm">
                  <IconEye size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-800 text-base">Kenapa hasil ini muncul?</h2>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[#004A7C] text-[10px] font-bold border border-[#004A7C]/10">
                      {showTransparency ? 'Sedang ditampilkan' : 'Klik untuk lihat detail'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Bagian ini otomatis terbuka agar Anda bisa langsung melihat alasan, profil terbaca, dan contoh pembanding.</p>
                </div>
              </div>
              <IconChevronDown
                className={`text-[#004A7C] transition-transform ${showTransparency ? 'rotate-180' : ''}`}
                size={22}
              />
            </motion.button>

            <AnimatePresence initial={false}>
              {showTransparency && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="overflow-hidden"
              >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Kolom Interpretasi Masukan User */}
              <div className="md:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Profil yang Terbaca Sistem</h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex gap-2 items-start">
                    <IconSchool size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Pendidikan</p>
                      <p className="font-semibold text-slate-700 uppercase">{displayEducation || emptyValueLabel}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start">
                    <IconBriefcase size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Pengalaman Kerja</p>
                      <p className="font-semibold text-slate-700">
                        {displayExperienceYears !== null ? `${displayExperienceYears} Tahun` : emptyValueLabel}
                      </p>
                      {displayExperienceText && <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-3">{displayExperienceText}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 items-start">
                    <IconCertificate size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Sertifikasi</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {displayCertifications.length > 0 ? (
                          displayCertifications.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] rounded font-medium border border-amber-100">{c}</span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">{emptyValueLabel}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 space-y-3">
                    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Validasi & Source Skill</h5>
                    <div>
                      <p className="font-medium text-slate-400 mb-1">Skill Dicantumkan User</p>
                      <div className="flex flex-wrap gap-1">
                        {renderMiniChips(displayExplicitSkills, 'Belum tersedia', 'bg-sky-50 text-[#004A7C] border-sky-100')}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-slate-400 mb-1">Level Skill Dipilih</p>
                      <div className="flex flex-wrap gap-1">
                        {displaySkillLevels.length > 0 ? (
                          displaySkillLevels.map((skill, index) => (
                            <span key={`${skill.name}-${index}`} className="px-1.5 py-0.5 text-[9px] rounded font-medium border bg-slate-100 text-slate-600 border-slate-200">
                              {skill.name}: {skill.level}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">{emptyValueLabel}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Level ini disimpan sebagai data profil; skor saat ini tetap mengikuti model AI yang tersedia.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-slate-400 mb-1">Skill yang terbaca dari pengalaman</p>
                      <div className="flex flex-wrap gap-1">
                        {renderMiniChips(
                          displayExperienceDerivedSkills,
                          'Belum ada skill teknis yang terbaca dari narasi pengalaman.',
                          'bg-teal-50 text-teal-700 border-teal-100'
                        )}
                      </div>
                      {displayExperienceDerivedSkills.length === 0 && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Tambahkan contoh proyek, tools, dan teknologi yang digunakan agar profil lebih kuat.
                        </p>
                      )}
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
                        <p className="font-semibold text-[11px]">Catatan validasi skill</p>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Beberapa skill belum ditemukan di narasi pengalaman atau proyek.
                      </p>
                      <div className="space-y-1.5">
                        {displayRiskFlags.slice(0, 3).map((flag, index) => (
                          <p key={`${flag?.code || 'flag'}-${index}`} className="text-[10px] text-slate-500 leading-relaxed">
                            {flag.skill
                              ? `${flag.skill} belum ditemukan di narasi pengalaman. Tambahkan contoh proyek yang memakai ${flag.skill} agar profil lebih kuat.`
                              : flag.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom Lowongan Pembanding */}
              <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Contoh Pembanding Katalog</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dipakai untuk menghitung kemiripan profil, bukan daftar lowongan untuk dilamar.</p>
                </div>

                <div className="space-y-2">
                  {validTopMatches.length > 0 ? (
                    validTopMatches.slice(0, 3).map((job, idx) => {
                      const matchedSkills = Array.isArray(job?.matched_skills) ? job.matched_skills.slice(0, 2) : [];
                      const missingSkills = Array.isArray(job?.missing_skills) ? job.missing_skills.slice(0, 2) : [];
                      const readinessFeatures = job?.readiness_features || {};
                      const featureChips = [
                        ['Kecocokan skill', readinessFeatures.skill_overlap],
                        ['Kecocokan pengalaman', readinessFeatures.experience_ratio],
                        ['Kecocokan pendidikan', readinessFeatures.education_match],
                        ['Kemiripan narasi', readinessFeatures.semantic_similarity],
                      ]
                        .map(([label, value]) => (
                          isFiniteNumber(value) ? `${label}: ${Math.round(Number(value) * 100)}%` : null
                        ))
                        .filter(Boolean);

                      return (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 break-words">{job.displayTitle}</p>
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-slate-500 text-[11px] mt-0.5">
                                {job?.company && <span>{job.company}</span>}
                                {job?.location && <span>{job.location}</span>}
                                {job?.role_family && <span>{getRoleFamilyLabel(job.role_family)}</span>}
                                {job?.work_mode && (
                                  <span>
                                    {job.work_mode === 'unknown' ? 'Mode kerja belum terdeteksi' : `Mode kerja: ${job.work_mode}`}
                                  </span>
                                )}
                                {isFiniteNumber(job?.required_experience_years) && (
                                  <span>Min. {Number(job.required_experience_years)} tahun</span>
                                )}
                              </div>
                            </div>
                            {job.displayScore !== null && (
                              <span className="px-2.5 py-1 bg-white text-slate-600 rounded-lg text-[10px] font-medium border border-slate-200 shrink-0">
                                Match: {Math.round(job.displayScore * 100)}%
                              </span>
                            )}
                          </div>

                          {(matchedSkills.length > 0 || missingSkills.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {matchedSkills.map((skill, skillIdx) => (
                                <span key={`matched-${skill}-${skillIdx}`} className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-medium">
                                  Cocok: {skill}
                                </span>
                              ))}
                              {missingSkills.map((skill, skillIdx) => (
                                <span key={`missing-${skill}-${skillIdx}`} className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-medium">
                                  Gap: {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          {featureChips.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                              {confidencePercent !== null && idx === 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200 text-[10px] font-medium">
                                  Keyakinan model: {confidencePercent}%
                                </span>
                              )}
                              {featureChips.map((feature) => (
                                <span key={feature} className="px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200 text-[10px] font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-slate-400 italic text-xs">Contoh pembanding belum tersedia.</div>
                  )}
                </div>
              </div>
            </div>
              </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalisisResultPage;
