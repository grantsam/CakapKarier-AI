import { IconChartBar, IconBolt, IconMap } from '@tabler/icons-react';

const InsightCard = ({ icon, title, desc }) => {
  return (
    <div 
      className="p-8 rounded-[2rem] border border-white/40 shadow-sm transition-all duration-500 flex flex-col items-start text-left group cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10"
      style={{
        background: 'linear-gradient(180deg, rgba(79, 209, 197, 0.25) 0%, rgba(0, 74, 124, 0.25) 70%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Icon Container */}
      <div className="bg-[#004A7C] p-2.5 rounded-lg shadow-md mb-6 text-white group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      
      {/* Judul */}
      <h3 className="text-xl font-medium text-[#004A7C] mb-3 tracking-tight">
        {title}
      </h3>
      
      {/* Deskripsi */}
      <p className="text-slate-900 text-[13px] leading-relaxed font-regular">
        {desc}
      </p>
    </div>
  );
};

const InsightSection = () => {
  const insights = [
    {
      icon: <IconChartBar size={22} stroke={2.5} />,
      title: "Skor Kesiapan Kerja",
      desc: "Menghitung tingkat kesiapan kerja berdasarkan keterampilan, pengalaman, dan kesesuaian dengan kebutuhan industri."
    },
    {
      icon: <IconBolt size={22} stroke={2.5} />,
      title: "Analisis Skill Gap",
      desc: "Mengidentifikasi keterampilan yang belum dimiliki maupun masih perlu ditingkatkan agar sesuai dengan kebutuhan industri."
    },
    {
      icon: <IconMap size={22} stroke={2.5} />,
      title: "Roadmap Pengembangan",
      desc: "Menghasilkan langkah-langkah pengembangan diri yang konkret agar dapat menyesuaikan kebutuhan industri."
    }
  ];

  return (
    <section className="py-24 bg-transparent font-poppins relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] tracking-tight">
            Dapatkan Insight Karier yang Jelas dan Terarah
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {insights.map((item, index) => (
            <InsightCard 
              key={index}
              icon={item.icon}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsightSection;