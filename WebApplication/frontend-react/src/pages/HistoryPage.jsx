import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import api from '../utils/api';
import {
  IconAlertCircle,
  IconArrowRight,
  IconBolt,
  IconCalendar,
  IconChevronDown,
  IconCircleCheck,
  IconClipboardCheck,
  IconRefresh,
  IconStars,
  IconTrendingUp
} from '@tabler/icons-react';

const HISTORY_PAGE_LIMIT = 20;

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const formatDate = (value) => {
  if (!value) return 'Tanggal belum tersedia';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal belum tersedia';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatMetric = (value, suffix = '') => {
  const numberValue = toFiniteNumber(value);
  if (numberValue === null) return 'Belum tersedia';
  return `${numberValue}${suffix}`;
};

const formatRoundedMetric = (value, suffix = '') => {
  const numberValue = toFiniteNumber(value);
  if (numberValue === null) return 'Belum tersedia';
  return `${Math.round(numberValue)}${suffix}`;
};

const formatDelta = (value) => {
  const numberValue = toFiniteNumber(value);
  if (numberValue === null) return 'Belum tersedia';
  const rounded = Math.round(numberValue * 100) / 100;
  return `${rounded > 0 ? '+' : ''}${rounded}`;
};

const getScoreDeltaInsight = (scoreDelta, totalAnalysis) => {
  if (toFiniteNumber(totalAnalysis) !== null && Number(totalAnalysis) < 2) {
    return 'Butuh minimal dua analisis untuk melihat perubahan.';
  }
  if (scoreDelta === null) return 'Belum cukup data untuk membaca tren skor.';
  if (scoreDelta > 0) return 'Skor meningkat dari analisis sebelumnya.';
  if (scoreDelta < 0) return 'Skor turun dari analisis sebelumnya. Buka detail terbaru untuk melihat gap utama.';
  return 'Skor relatif stabil dari analisis sebelumnya.';
};

const getRoleDisplay = (item) => {
  const targetRole = item.target_role || item.result?.target_role;
  if (targetRole) {
    return { label: 'Target', title: targetRole };
  }

  const predictedRole = item.predicted_role || item.result?.predicted_role;
  if (predictedRole) {
    return { label: 'Role prediksi', title: predictedRole };
  }

  return { label: 'Role', title: 'Belum tersedia' };
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ limit: HISTORY_PAGE_LIMIT, offset: 0, total: 0, has_next: false });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  const fetchHistory = useCallback(async ({ offset = 0, append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');

    try {
      const response = await api.get('/analysis/career-match/history', {
        params: { limit: HISTORY_PAGE_LIMIT, offset }
      });

      const nextItems = Array.isArray(response.data?.data) ? response.data.data : [];
      setHistoryItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setSummary(response.data?.summary || null);
      setPagination(response.data?.pagination || {
        limit: HISTORY_PAGE_LIMIT,
        offset,
        total: nextItems.length,
        has_next: false
      });
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        navigate('/signin');
        return;
      }
      setError(err.response?.data?.message || 'Gagal memuat riwayat analisis.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchHistory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchHistory]);

  const handleDetailClick = (item) => {
    const uuidValid = item.analysis_id || item.result?.id || item.result?.analysis_id || item.id;
    
    navigate(`/riwayat/${uuidValid}`);
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'siap' || s === 'ready') return 'bg-teal-50 text-teal-600 border-teal-100';
    if (s === 'cukup siap' || s === 'moderately ready') return 'bg-orange-50 text-orange-600 border-orange-100';
    if (!s) return 'bg-slate-50 text-slate-500 border-slate-100';
    return 'bg-red-50 text-red-600 border-red-100';
  };

  const latestSkillCount = summary?.latest_mastered_skill_count;
  const masteredSkillDelta = toFiniteNumber(summary?.mastered_skill_delta);
  const scoreDelta = toFiniteNumber(summary?.score_delta);
  const totalAnalysis = loading && !summary ? null : (summary?.total_analysis ?? pagination.total);
  const latestItem = historyItems[0] || null;
  const latestRoleDisplay = latestItem ? getRoleDisplay(latestItem) : null;
  const scoreDeltaInsight = getScoreDeltaInsight(scoreDelta, totalAnalysis);

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-2">
              Riwayat Analisis
            </h1>
            <p className="text-slate-600 text-sm font-medium">
              Lihat perkembangan dan bandingkan hasil analisis Anda dari waktu ke waktu
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <IconBolt className="text-[#004A7C]" size={22} />
              <h2 className="font-bold text-slate-800 text-lg">Ringkasan Perkembangan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconTrendingUp size={18} className="text-[#004A7C]" /> Perubahan Skor
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">
                    {formatDelta(scoreDelta)}
                  </span>
                  {scoreDelta !== null && <span className="text-slate-400 font-medium text-sm">poin</span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">{scoreDeltaInsight}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconClipboardCheck size={18} className="text-[#004A7C]" /> Total Analisis
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">
                    {formatMetric(totalAnalysis)}
                  </span>
                  {toFiniteNumber(totalAnalysis) !== null && <span className="text-slate-400 font-medium text-sm">kali</span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Sesi analisis tersimpan</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconStars size={18} className="text-[#004A7C]" /> Skill Sesi Terbaru
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">
                    {formatMetric(latestSkillCount)}
                  </span>
                  {toFiniteNumber(latestSkillCount) !== null && <span className="text-slate-400 font-medium text-sm">skill</span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">
                  {masteredSkillDelta !== null
                    ? `${masteredSkillDelta > 0 ? '+' : ''}${masteredSkillDelta} skill dibanding analisis sebelumnya`
                    : 'Terdeteksi di analisis terbaru'}
                </p>
              </div>
            </div>

            {latestItem && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Analisis terbaru</p>
                  <h3 className="font-bold text-slate-800 text-base mt-1 break-words">
                    {latestRoleDisplay?.label}: <span className="text-[#004A7C]">{latestRoleDisplay?.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Buka detail untuk melihat gap utama dan roadmap dari hasil terbaru.
                  </p>
                </div>
                <button
                  onClick={() => handleDetailClick(latestItem)}
                  className="motion-cue px-4 py-2.5 bg-[#004A7C] text-white rounded-xl font-bold text-xs hover:bg-[#00365d] transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  Lihat Analisis Terbaru <IconArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconAlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchHistory()}
                className="motion-cue px-4 py-2 rounded-xl bg-white text-red-600 border border-red-100 font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <IconRefresh size={14} /> Coba Lagi
              </button>
            </div>
          )}

          <div className="space-y-4">
            {!loading && historyItems.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <h2 className="font-bold text-slate-800">Daftar Riwayat</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Menampilkan {historyItems.length} dari {formatMetric(totalAnalysis)} analisis
                </p>
              </div>
            )}
            {loading ? (
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-8 text-sm text-slate-500 text-center">
                Memuat riwayat analisis...
              </div>
            ) : historyItems.length > 0 ? (
              historyItems.map((item) => (
                <div key={item.id} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden p-6 relative group transition-all hover:border-[#004A7C]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{getRoleDisplay(item).label}</p>
                          <h3 className="font-bold text-slate-800 text-lg break-words">
                            {getRoleDisplay(item).title}
                          </h3>
                        </div>
                        {item.readiness_status && (
                          <span className={`px-4 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyle(item.readiness_status)}`}>
                            {item.readiness_status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                          <IconCalendar size={14} /> {formatDate(item.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                          <IconCircleCheck size={14} /> {formatMetric(item.mastered_skill_count ?? item.result?.mastered_skill_count, ' skill dikuasai')}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                          <IconBolt size={14} /> {formatMetric(item.skill_gap_count ?? item.result?.skill_gap_count, ' skill gap')}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">Buka detail untuk melihat gap utama dari analisis ini.</p>
                    </div>

                    <div className="md:text-right">
                      <div className="text-4xl font-bold text-[#004A7C]">
                        {formatRoundedMetric(item.readiness_score ?? item.result?.readiness_score)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Skor Kesiapan</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDetailClick(item)}
                    className="motion-cue w-full mt-6 bg-[#004A7C] text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#00365d] transition-all active:scale-[0.98]"
                  >
                    Lihat Detail <IconArrowRight size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-8 text-center space-y-3">
                <IconClipboardCheck className="mx-auto text-slate-300" size={42} />
                <h3 className="font-bold text-slate-700">Belum Ada Riwayat</h3>
                <p className="text-sm text-slate-500">Riwayat akan muncul setelah Anda menjalankan analisis karier.</p>
                <button
                  onClick={() => navigate('/analisis')}
                  className="motion-cue px-5 py-2.5 bg-[#004A7C] text-white rounded-xl font-medium text-sm hover:bg-[#00365d] transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  Mulai Analisis <IconArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {!loading && pagination.has_next && (
            <button
              onClick={() => fetchHistory({ offset: pagination.offset + pagination.limit, append: true })}
              disabled={loadingMore}
              className="motion-cue w-full py-3 rounded-xl border border-slate-200 bg-white text-[#004A7C] font-bold text-sm hover:bg-slate-50 disabled:text-slate-400 flex items-center justify-center gap-2"
            >
              {loadingMore ? 'Memuat...' : 'Muat Riwayat Lainnya'} {!loadingMore && <IconChevronDown size={16} />}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
