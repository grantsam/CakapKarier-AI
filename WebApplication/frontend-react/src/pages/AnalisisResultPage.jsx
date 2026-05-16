import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
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
  IconSchool
} from '@tabler/icons-react';

const AnalisisResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const analysisData = location.state?.data;

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-50 font-poppins flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow pt-32 pb-16 px-6 text-center max-w-md mx-auto space-y-4">
          <IconAlertCircle className="mx-auto text-amber-500" size={48} />
          <h2 className="text-xl font-bold text-slate-800">Data Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm">Silakan lakukan analisis kesiapan karier terlebih dahulu untuk melihat hasil.</p>
          <button 
            onClick={() => navigate('/analisis')}
            className="w-full py-3 bg-[#004A7C] text-white font-bold rounded-xl text-sm transition-colors hover:bg-[#00365c]"
          >
            Kembali ke Form Analisis
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const {
    target_role = 'Tidak ditentukan',
    predicted_role = 'Tidak terdeteksi',
    readiness_score = 0,
    readiness_status = 'Pending',
    match_confidence = 0,
    mastered_skills = [],
    mastered_skill_count = 0,
    skill_gap_count = 0,
    skill_gap_analysis = [],
    roadmap = [],
    tips = [],
    top_matches = [],
    input_interpretation = {}
  } = analysisData;

  const {
    pendidikan = '-',
    pengalaman_tahun = 0,
    pengalaman_text = '',
    sertifikasi = []
  } = input_interpretation || {};

  const confidencePercent = Math.round((match_confidence || 0) * 100);
  
  const getGapBadgeColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'tinggi' || p === 'high') return 'bg-red-50 text-red-500 border-red-100';
    if (p === 'menengah' || p === 'medium') return 'bg-blue-50 text-blue-500 border-blue-100';
    return 'bg-orange-50 text-orange-500 border-orange-100';
  };

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
                <p className="text-slate-600">Target Anda: <span className="text-[#004A7C] font-semibold">{target_role}</span></p>
                <span className="hidden md:inline text-slate-300">|</span>
                <p className="text-slate-600">Match Katalog Terkuat: <span className="text-teal-600 font-semibold">{predicted_role}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('/analisis')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all shrink-0"
            >
              <IconEdit size={16} /> Perbaiki Input Data
            </button>
          </div>

          {/* ========================================== */}
          {/* LAYER 1: RINGKASAN UNTUK USER             */}
          {/* ========================================== */}
          
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
                <span className="text-4xl font-extrabold text-teal-600">{readiness_score}</span>
                <span className="text-slate-400 font-bold text-sm">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div className="bg-teal-50 h-full transition-all duration-500" style={{ width: `${readiness_score}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Status: <span className="font-bold text-slate-700">{readiness_status}</span>. Tingkat kecocokan model sebesar <span className="font-bold text-teal-600">{confidencePercent}%</span> terhadap standar role.
              </p>
            </div>

            {/* Skill Dikuasai */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-slate-800 text-sm">Skill Terdeteksi</h3>
                <IconCircleCheck className="text-teal-500" size={24} />
              </div>
              <div className="text-4xl font-extrabold text-teal-600 mb-4">{mastered_skill_count}</div>
              <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto pr-1">
                {Array.isArray(mastered_skills) && mastered_skills.length > 0 ? (
                  mastered_skills.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-bold border border-teal-100 whitespace-nowrap">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Tidak ada skill yang tersemat</span>
                )}
              </div>
            </div>

            {/* Skill Gap Count */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-slate-800 text-sm">Kekurangan Skill (Gap)</h3>
                <IconBolt className="text-red-500" size={24} />
              </div>
              <div className="text-4xl font-extrabold text-red-500 mb-4">{skill_gap_count}</div>
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
              {Array.isArray(skill_gap_analysis) && skill_gap_analysis.length > 0 ? (
                skill_gap_analysis.slice(0, 3).map((item, idx) => {
                  const skillName = typeof item === 'object' ? item?.name : item;
                  const skillReason = typeof item === 'object' ? item?.reason : 'Sangat direkomendasikan untuk memenuhi kualifikasi target role.';
                  const skillPriority = typeof item === 'object' ? item?.priority : 'Tinggi';

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{skillName || 'Nama Skill'}</h4>
                        <p className="text-[11px] text-slate-500">{skillReason}</p>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-bold border shrink-0 ${getGapBadgeColor(skillPriority)}`}>
                        {skillPriority}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">Luar biasa! Tidak ada kesenjangan skill utama yang terdeteksi.</p>
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
                {Array.isArray(roadmap) && roadmap.length > 0 ? (
                  roadmap.slice(0, 3).map((step, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute -left-[9px] top-0">
                        <IconCircleDot className="text-[#004A7C] bg-white rounded-full" size={16} />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-3">{step?.phase || `Fase ${idx + 1}`}</h3>
                      <ul className="space-y-2">
                        {Array.isArray(step?.items) ? (
                          step.items.map((li, i) => (
                            <li key={i} className="text-[12px] text-slate-600 flex items-start gap-2 leading-relaxed">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-[#004A7C] shrink-0"></span>
                              <span>{li}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-[12px] text-slate-600">{step?.description || (typeof step === 'string' ? step : '')}</li>
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic pl-4">Roadmap belum dapat disusun secara detail.</p>
                )}
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* LAYER 2: DETAIL DAN TRANSPARANSI DATA     */}
          {/* ========================================== */}
          
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
                      <p className="font-bold text-slate-700 uppercase">{pendidikan}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start">
                    <IconBriefcase size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Pengalaman Kerja</p>
                      <p className="font-bold text-slate-700">{pengalaman_tahun} Tahun</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-3">{pengalaman_text || 'Tidak ada deskripsi'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start">
                    <IconCertificate size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-400">Sertifikasi</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(sertifikasi) && sertifikasi.length > 0 ? (
                          sertifikasi.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] rounded font-medium border border-amber-200">{c}</span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Tidak terdeteksi</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Lowongan Pembanding (Top Matches dari Katalog) */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#004A7C] tracking-wider uppercase">Lowongan Pembanding dari Katalog</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Disajikan sebagai data uji referensi pasar, bukan jaminan final penempatan kerja.</p>
                </div>

                <div className="space-y-2">
                  {Array.isArray(top_matches) && top_matches.length > 0 ? (
                    top_matches.slice(0, 3).map((job, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{job?.title || job?.job_name || 'Job Position'}</p>
                          <p className="text-slate-500 text-[11px]">{job?.company || 'Market Catalog Company'}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold">
                          Match: {job?.score ? `${Math.round(job.score * 100)}%` : 'N/A'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 italic text-xs">Tidak ada lowongan pembanding yang cocok di katalog saat ini.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Sukses Actionable */}
          <div className="bg-sky-50/60 border border-sky-100 rounded-[1.5rem] p-6">
            <h3 className="font-bold text-[#004A7C] mb-4 text-sm flex items-center gap-2">
              <IconCircleCheckFilled size={18} /> Rekomendasi Langkah Sukses
            </h3>
            <ul className="space-y-3">
              {(Array.isArray(tips) && tips.length > 0 ? tips : [
                'Fokus pada pemenuhan gap skill dengan kriteria prioritas "Tinggi" terlebih dahulu.',
                'Validasi pemahaman baru Anda lewat proyek portfolio nyata secara berkala.',
                'Perbarui profil data masukan Anda jika terdapat sertifikasi atau pengerjaan project baru.'
              ]).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[12px] text-slate-700 leading-relaxed">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#004A7C] shrink-0"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalisisResultPage;