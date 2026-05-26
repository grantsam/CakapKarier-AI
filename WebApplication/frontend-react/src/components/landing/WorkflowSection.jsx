import { Link } from 'react-router-dom';

const WorkflowSection = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const steps = [
    {
      no: "1",
      title: "Input Data Profil",
      desc: "Masukkan informasi tentang pendidikan, skill yang dikuasai, minat & bakat, serta pengalaman atau sertifikasi yang Anda miliki.",
      subText: "Tips: Semakin lengkap data yang Anda berikan, semakin akurat hasil analisisnya."
    },
    {
      no: "2",
      title: "AI Menganalisis",
      desc: "Sistem AI kami akan memproses data Anda dan membandingkannya dengan database requirement untuk berbagai role.",
      subText: "Proses: AI mencocokkan profil Anda sesuai dengan role profesional yang dibutuhkan."
    },
    {
      no: "3",
      title: "Terima Hasil & Roadmap",
      desc: "Dapatkan skor kesiapan, daftar skill gap yang perlu ditingkatkan, dan roadmap pengembangan yang personal.",
      subText: "Output: Dashboard lengkap dengan insight actionable untuk karier Anda."
    }
  ];

  return (
    <section className="py-24 bg-white font-poppins">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Workflow */}
        <div className="text-center mb-16" data-aos="fade-down" data-aos-delay="100">
          <h2 className="text-3xl font-bold text-[#004A7C] mb-4">Bagaimana CakapKarier AI Bekerja?</h2>
          <p className="text-slate-600">Proses sederhana dalam 3 langkah untuk mendapatkan analisis karier yang komprehensif</p>
        </div>

        {/* Grid Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {steps.map((step, index) => (
            <div key={index}
              data-aos="fade-up"
              data-aos-delay={index * 200} 
              className="p-8 rounded-[2rem] border border-white/40 shadow-sm relative overflow-hidden flex flex-col h-full"
              style={{
                background: 'linear-gradient(180deg, rgba(79, 209, 197, 0.25) 0%, rgba(0, 74, 124, 0.25) 70%)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#004A7C] text-white flex items-center justify-center text-sm font-semibold">
                  {step.no}
                </span>
                <h3 className="text-lg font-semibold text-[#004A7C]">{step.title}</h3>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed mb-6 flex-grow">{step.desc}</p>
              
              {/* Highlight Box di dalam Card */}
              <div className="bg-white/40 p-4 rounded-xl border border-white/20">
                <p className="text-[14px] text-[#004A7C] leading-tight">
                  <span className="font-bold">{step.subText.split(':')[0]}:</span> {step.subText.split(':')[1]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div 
          data-aos="zoom-in"
          className="p-12 rounded-[2.5rem] border border-white/40 text-center shadow-xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.2) 0%, rgba(0, 74, 124, 0.2) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#4FD1C5]/20 blur-3xl -z-10"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] mb-4">Siap Tingkatkan Potensi Diri Anda?</h2>
          <p className="text-slate-700 mb-10 text-lg">Mari bergabung dengan ribuan profesional yang telah menemukan arah karier mereka</p>
          <Link 
            to={isLoggedIn ? "/analisis" : "/signup"} 
            className="inline-block bg-[#004A7C] text-white px-10 py-4 rounded-full font-meedium text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            {isLoggedIn ? "Mulai Analisis Sekarang" : "Daftar Gratis Sekarang"}
          </Link>
        </div>

      </div>
    </section>
  );
};

export default WorkflowSection;