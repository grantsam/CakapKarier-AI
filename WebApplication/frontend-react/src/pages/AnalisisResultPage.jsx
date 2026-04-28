import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { 
  IconChartBar, 
  IconCircleCheck, 
  IconBolt, 
  IconMap, 
  IconCircleDot,
  IconCircleCheckFilled
} from '@tabler/icons-react';

const AnalisisResultPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Judul */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-1">
              Hasil Analisis Kesiapan Karier
            </h1>
            <p className="text-slate-600 text-ml font-medium">Target Role: Frontend Developer</p>
          </div>

          {/* Section 1: Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skor Kesiapan */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-800">Skor Kesiapan</h3>
                <IconChartBar className="text-teal-500" size={24} />
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-extrabold text-teal-600">80</span>
                <span className="text-slate-400 font-bold">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-teal-500 h-full w-[80%]"></div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Anda memiliki kesiapan yang baik untuk role ini. Tingkatkan skill gap untuk meningkatkan peluang.
              </p>
            </div>

            {/* Skill Dikuasai */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-800">Skill Dikuasai</h3>
                <IconCircleCheck className="text-teal-500" size={24} />
              </div>
              <div className="text-4xl font-extrabold text-teal-600 mb-4">4</div>
              <div className="flex flex-wrap gap-2">
                {['HTML', 'CSS', 'JavaScript', 'Git'].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-medium border border-teal-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Gap */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-800">Skill Gap</h3>
                <IconBolt className="text-red-500" size={24} />
              </div>
              <div className="text-4xl font-extrabold text-red-500 mb-4">5</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Skill yang perlu dikembangkan untuk meningkatkan kesiapan karier Anda.
              </p>
            </div>
          </div>

          {/* Section 2: Skill Gap Analysis */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <IconBolt className="text-[#004A7C]" size={22} />
              <h2 className="font-bold text-[#004A7C] text-lg">Skill Gap Analysis</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { name: 'TypeScript', level: 'Tinggi', color: 'bg-red-50 text-red-500 border-red-100' },
                { name: 'TypeScript', level: 'Tinggi', color: 'bg-red-50 text-red-500 border-red-100' },
                { name: 'TypeScript', level: 'Menengah', color: 'bg-blue-50 text-blue-500 border-blue-100' },
                { name: 'TypeScript', level: 'Menengah', color: 'bg-blue-50 text-blue-500 border-blue-100' },
                { name: 'TypeScript', level: 'Rendah', color: 'bg-orange-50 text-orange-500 border-orange-100' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-[11px] text-slate-500">Essential for modern frontend development</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${item.color}`}>
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Roadmap Pengembangan */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <IconMap className="text-[#004A7C]" size={22} />
              <h2 className="font-bold text-[#004A7C] text-lg">Roadmap Pengembangan</h2>
            </div>
            <div className="p-8">
              <div className="relative border-l-2 border-[#004A7C] ml-3 space-y-12">
                {[
                  { 
                    phase: 'Fase 1: Pendahuluan (1-2 bulan)', 
                    items: ['Pelajari TypeScript fundamentals dan migrate React project ke TypeScript', 'Kuasai Jest dan React Testing Library untuk unit & integration testing', 'Bangun 2-3 project portfolio dengan TypeScript'] 
                  },
                  { 
                    phase: 'Fase 2: Menengah (2-3 bulan)', 
                    items: ['Pelajari state management dengan Redux Toolkit atau Zustand', 'Implementasi testing coverage minimal 80% di project', 'Kontribusi ke open source project untuk pengalaman real-world'] 
                  },
                  { 
                    phase: 'Fase 3: Lanjutan (3-4 bulan)', 
                    items: ['Pelajari TypeScript fundamentals dan migrate React project ke TypeScript', 'Kuasai Jest dan React Testing Library untuk unit & integration testing', 'Bangun 2-3 project portfolio dengan TypeScript'] 
                  }
                ].map((step, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute -left-[9px] top-0">
                      <IconCircleDot className="text-[#004A7C] bg-white rounded-full" size={16} />
                    </div>
                    <h3 className="font-medium text-slate-800 text-sm mb-3">{step.phase}</h3>
                    <ul className="space-y-2">
                      {step.items.map((li, i) => (
                        <li key={i} className="text-[12px] text-slate-600 flex items-start gap-2">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                          {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Sukses */}
          <div className="bg-[#E0F2FE]/50 border border-teal-100 rounded-[1.5rem] p-6">
            <h3 className="font-bold text-[#004A7C] mb-4 text-sm">Tips Sukses</h3>
            <ul className="space-y-3">
              {[
                'Fokus pada skill dengan prioritas "Tinggi" terlebih dahulu untuk impact maksimal',
                'Bangun portofolio project yang mendemonstrasikan skill baru Anda',
                'Update profil secara berkala untuk mendapatkan analisis yang lebih akurat'
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[12px] text-slate-700">
                  <IconCircleCheckFilled className="text-[#004A7C] shrink-0" size={18} />
                  {tip}
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