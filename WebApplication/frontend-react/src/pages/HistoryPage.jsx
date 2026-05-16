import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { 
  IconBolt, 
  IconTrendingUp, 
  IconClipboardCheck, 
  IconStars,
  IconCalendar,
  IconCircleCheck
} from '@tabler/icons-react';

const HistoryPage = () => {
  const navigate = useNavigate();

  const riwayatData = [
    {
      id: "hist-01",
      date: "23 April 2026",
      payloadAnalysis: {
        target_role: "Front-end Developer",
        predicted_role: "React Developer Specialist",
        readiness_score: 95,
        readiness_status: "Siap",
        match_confidence: 0.95,
        mastered_skill_count: 5,
        mastered_skills: ["HTML & CSS", "JavaScript", "React.js", "Tailwind CSS", "Git"],
        skill_gap_count: 1,
        skill_gap_analysis: [
          { name: "TypeScript", reason: "Dibutuhkan untuk standarisasi enterprise project.", priority: "Menengah" }
        ],
        roadmap: [
          { phase: "Fase 1: Pendalaman Type System", items: ["Belajar dasar TypeScript", "Migrasi mini-project ke TS"] }
        ],
        tips: ["Pertahankan performa coding Anda dan mulailah apply ke target role."],
        input_interpretation: {
          pendidikan: "S1 Informatika",
          pengalaman_tahun: 2,
          pengalaman_text: "Membangun landing page & dashboard internal.",
          sertifikasi: ["Keahlian Frontend Dicoding"]
        },
        top_matches: [
          { title: "Frontend Engineer", company: "Tech StartUp Corp", score: 0.95 }
        ]
      }
    },
    {
      id: "hist-02",
      date: "15 April 2026",
      payloadAnalysis: {
        target_role: "Front-end Developer",
        predicted_role: "Web Developer",
        readiness_score: 76,
        readiness_status: "Cukup Siap",
        match_confidence: 0.76,
        mastered_skill_count: 3,
        mastered_skills: ["HTML & CSS", "JavaScript", "Git"],
        skill_gap_count: 3,
        skill_gap_analysis: [
          { name: "React.js", reason: "Komponen framework utama target market saat ini.", priority: "Tinggi" },
          { name: "Tailwind CSS", reason: "Mempercepat proses integrasi UI/UX.", priority: "Tinggi" }
        ],
        roadmap: [
          { phase: "Fase 1: State Management & UI", items: ["Belajar React Hooks", "Implementasi utility-first CSS"] }
        ],
        input_interpretation: {
          pendidikan: "S1 Informatika",
          pengalaman_tahun: 0,
          pengalaman_text: "Baru lulus kuliah dan menguasai dasar web.",
          sertifikasi: []
        }
      }
    },
    {
      id: "hist-03",
      date: "01 April 2026",
      payloadAnalysis: {
        target_role: "Front-end Developer",
        predicted_role: "Junior Web Developer",
        readiness_score: 55,
        readiness_status: "Perlu Ditingkatkan",
        match_confidence: 0.55,
        mastered_skill_count: 2,
        mastered_skills: ["HTML & CSS"],
        skill_gap_count: 5,
        skill_gap_analysis: [
          { name: "JavaScript Dasar", reason: "Fondasi utama sebelum menyentuh framework modern.", priority: "Tinggi" }
        ],
        roadmap: [
          { phase: "Fase 1: Logika Pemrograman", items: ["Belajar ES6+", "Asynchronous JS & Fetch API"] }
        ],
        input_interpretation: {
          pendidikan: "S1 Informatika",
          pengalaman_tahun: 0,
          pengalaman_text: "Memahami HTML CSS dasar dari mata kuliah.",
          sertifikasi: []
        }
      }
    }
  ];

  // Handler fungsi untuk menavigasi sambil membawa data spesifik item riwayat tersebut
  const handleDetailClick = (analysisObj) => {
    navigate('/analisis/hasil', { state: { data: analysisObj } });
  };

  // Helper untuk menentukan warna status baris riwayat secara dinamis
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'siap') return "bg-teal-50 text-teal-600 border-teal-100";
    if (s === 'cukup siap') return "bg-orange-50 text-orange-600 border-orange-100";
    return "bg-red-50 text-red-600 border-red-100";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Judul Halaman */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-2">
              Riwayat Analisis
            </h1>
            <p className="text-slate-600 text-sm font-medium">
              Lihat perkembangan dan bandingkan hasil analisis Anda dari waktu ke waktu
            </p>
          </div>

          {/* Section 1: Ringkasan Perkembangan */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <IconBolt className="text-[#004A7C]" size={22} />
              <h2 className="font-bold text-slate-800 text-lg">Ringkasan Perkembangan</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Peningkatan Skor */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconTrendingUp size={18} className="text-[#004A7C]" /> Peningkatan Skor
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">+19</span>
                  <span className="text-slate-400 font-medium text-sm">poin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Dari analisis awal ke akhir</p>
              </div>

              {/* Total Analisis */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconClipboardCheck size={18} className="text-[#004A7C]" /> Total Analisis
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">{riwayatData.length}</span>
                  <span className="text-slate-400 font-medium text-sm">kali</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Sesi analisis tersimpan</p>
              </div>

              {/* Skill Dikuasai */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconStars size={18} className="text-[#004A7C]" /> Skill Tertinggi
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">5</span>
                  <span className="text-slate-400 font-medium text-sm">skill</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Terdeteksi di sesi terbaru</p>
              </div>
            </div>
          </div>

          {/* Section 2: Daftar Riwayat */}
          <div className="space-y-4">
            {riwayatData.map((item, idx) => {
              const data = item.payloadAnalysis;
              return (
                <div key={item.id || idx} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden p-6 relative group transition-all hover:border-[#004A7C]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 text-lg">{data?.target_role}</h3>
                        <span className={`px-4 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyle(data?.readiness_status)}`}>
                          {data?.readiness_status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                          <IconCalendar size={14} /> {item.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                          <IconCircleCheck size={14} /> {data?.mastered_skill_count || 0} skill dikuasai
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                          <IconBolt size={14} /> {data?.skill_gap_count || 0} skill gap
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-4xl font-bold text-[#004A7C]">{data?.readiness_score}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Skor Kesiapan</div>
                    </div>
                  </div>

                  {/* Tombol Lihat Detail mengarah ke hasil analisis membawa objek spesifiknya */}
                  <button 
                    onClick={() => handleDetailClick(data)}
                    className="w-full mt-6 bg-[#004A7C] text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#00365d] transition-all active:scale-[0.98]"
                  >
                    Lihat Detail
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;