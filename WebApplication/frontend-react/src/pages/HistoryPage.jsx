import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import api from '../utils/api';
import {
  IconAlertCircle,
  IconBolt,
  IconCalendar,
  IconCircleCheck,
  IconClipboardCheck,
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

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ limit: HISTORY_PAGE_LIMIT, offset: 0, total: 0, has_next: false });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async ({ offset = 0, append = false } = {}) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await api.get('/analysis/career-match/history', {
        params: {
          limit: HISTORY_PAGE_LIMIT,
          offset
        }
      });

      const nextItems = Array.isArray(response.data?.data) ? response.data.data : [];
      setHistoryItems((previousItems) => (append ? [...previousItems, ...nextItems] : nextItems));
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
  };

  useEffect(() => {
    let isMounted = true;

    api.get('/analysis/career-match/history', {
      params: {
        limit: HISTORY_PAGE_LIMIT,
        offset: 0
      }
    })
      .then((response) => {
        if (!isMounted) return;
        const nextItems = Array.isArray(response.data?.data) ? response.data.data : [];
        setHistoryItems(nextItems);
        setSummary(response.data?.summary || null);
        setPagination(response.data?.pagination || {
          limit: HISTORY_PAGE_LIMIT,
          offset: 0,
          total: nextItems.length,
          has_next: false
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.response?.status === 401) {
          alert('Sesi Anda berakhir. Silakan login kembali.');
          navigate('/signin');
          return;
        }
        setError(err.response?.data?.message || 'Gagal memuat riwayat analisis.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleDetailClick = (analysisId) => {
    navigate(`/riwayat/${analysisId}`);
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'siap') return 'bg-teal-50 text-teal-600 border-teal-100';
    if (s === 'cukup siap') return 'bg-orange-50 text-orange-600 border-orange-100';
    if (!s) return 'bg-slate-50 text-slate-500 border-slate-100';
    return 'bg-red-50 text-red-600 border-red-100';
  };

  const latestSkillCount = summary?.latest_mastered_skill_count;
  const scoreDelta = toFiniteNumber(summary?.score_delta);
  const totalAnalysis = loading && !summary ? null : (summary?.total_analysis ?? pagination.total);

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
                    {scoreDelta !== null ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta}` : 'Belum tersedia'}
                  </span>
                  {scoreDelta !== null && <span className="text-slate-400 font-medium text-sm">poin</span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Dari dua analisis terakhir</p>
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
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Terdeteksi di analisis terbaru</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm flex items-center gap-2">
              <IconAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
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
                        <h3 className="font-bold text-slate-800 text-lg">{item.target_role || item.predicted_role || 'Target belum tersedia'}</h3>
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
                          <IconCircleCheck size={14} /> {formatMetric(item.mastered_skill_count, ' skill dikuasai')}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                          <IconBolt size={14} /> {formatMetric(item.skill_gap_count, ' skill gap')}
                        </div>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <div className="text-4xl font-bold text-[#004A7C]">
                        {formatMetric(item.readiness_score)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Skor Kesiapan</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDetailClick(item.id)}
                    className="w-full mt-6 bg-[#004A7C] text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#00365d] transition-all active:scale-[0.98]"
                  >
                    Lihat Detail
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
                  className="px-5 py-2.5 bg-[#004A7C] text-white rounded-xl font-medium text-sm hover:bg-[#00365d] transition-all"
                >
                  Mulai Analisis
                </button>
              </div>
            )}
          </div>

          {!loading && pagination.has_next && (
            <button
              onClick={() => fetchHistory({ offset: pagination.offset + pagination.limit, append: true })}
              disabled={loadingMore}
              className="w-full py-3 rounded-xl border border-slate-200 bg-white text-[#004A7C] font-bold text-sm hover:bg-slate-50 disabled:text-slate-400"
            >
              {loadingMore ? 'Memuat...' : 'Muat Riwayat Lainnya'}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
