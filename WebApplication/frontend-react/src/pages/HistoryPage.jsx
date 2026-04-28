import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { 
  IconBolt, 
  IconTrendingUp, 
  IconClipboardCheck, 
  IconStars,
  IconCalendar,
  IconCircleCheck,
  IconArrowRight
} from '@tabler/icons-react';

const HistoryPage = () => {
  // Data dummy untuk riwayat
  const riwayatData = [
    {
      role: "Front-end Developer",
      status: "Siap",
      statusColor: "bg-teal-50 text-teal-600 border-teal-100",
      date: "23 April 2026",
      skillDikuasai: 3,
      skillGap: 3,
      skor: 95
    },
    {
      role: "Front-end Developer",
      status: "Cukup Siap",
      statusColor: "bg-orange-50 text-orange-600 border-orange-100",
      date: "23 April 2026",
      skillDikuasai: 3,
      skillGap: 3,
      skor: 76
    },
    {
      role: "Front-end Developer",
      status: "Perlu Ditingkatkan",
      statusColor: "bg-red-50 text-red-600 border-red-100",
      date: "23 April 2026",
      skillDikuasai: 3,
      skillGap: 3,
      skor: 55
    }
  ];

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
                  <IconTrendingUp size={18} className="text-[#004A7C]-500" /> Peningkatan Skor
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">+7</span>
                  <span className="text-slate-400 font-medium text-sm">poin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Sejak analisis terakhir</p>
              </div>

              {/* Total Analisis */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconClipboardCheck size={18} className="text-[#004A7C]-500" /> Total Analisis
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">3</span>
                  <span className="text-slate-400 font-medium text-sm">kali</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">Sejak analisis terakhir</p>
              </div>

              {/* Skill Dikuasai */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-600 font-medium text-sm flex items-center gap-2 mb-4">
                  <IconStars size={18} className="text-[#004A7C]-500" /> Skill Dikuasai
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#004A7C]">4</span>
                  <span className="text-slate-400 font-medium text-sm">skill</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-regular">+1 sejak terakhir</p>
              </div>
            </div>
          </div>

          {/* Section 2: Daftar Riwayat */}
          <div className="space-y-4">
            {riwayatData.map((item, idx) => (
              <div key={idx} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden p-6 relative group transition-all hover:border-[#004A7C]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-800 text-lg">{item.role}</h3>
                      <span className={`px-4 py-0.5 rounded-full text-[10px] font-medium border ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 items-center">
                      <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                        <IconCalendar size={14} /> {item.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                        <IconCircleCheck size={14} /> {item.skillDikuasai} skill dikuasai
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                        <IconBolt size={14} /> {item.skillGap} skill gap
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-bold text-[#004A7C]">{item.skor}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Skor Kesiapan</div>
                  </div>
                </div>

                {/* Tombol Lihat Detail */}
                <button className="w-full mt-6 bg-[#004A7C] text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#00365d] transition-all active:scale-[0.98]">
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;