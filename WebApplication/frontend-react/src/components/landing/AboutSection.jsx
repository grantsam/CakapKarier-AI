import { IconSearch, IconCalendarStats, IconBolt } from '@tabler/icons-react';

const AboutSection = () => {
  const features = [
    {
      icon: <IconSearch size={20} />,
      title: "Analisis mendalam",
      desc: "AI menganalisis profil Anda secara komprehensif"
    },
    {
      icon: <IconCalendarStats size={20} />,
      title: "Roadmap Terstruktur",
      desc: "Panduan bertahap yang mudah diikuti"
    },
    {
      icon: <IconBolt size={20} />,
      title: "Hasil Instan",
      desc: "Dapatkan insight karier dalam hitungan detik"
    }
  ];

  return (
    <section className="py-24 bg-[#E0F2FE]/50 font-poppins">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        
        {/* Kolom Kiri: Teks Deskripsi */}
        <div className="space-y-6" data-aos="fade-right" data-aos-delay="100">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] tracking-tight">
            Apa itu CakapKarier AI?
          </h2>
          <div className="space-y-4 text-slate-800 leading-relaxed text-[15px]">
            <p>
              CakapKarier.AI adalah platform inovatif yang menggunakan teknologi 
              <span className="italic font-medium"> Artificial Intelligence</span> untuk menganalisis 
              potensi diri terhadap kesiapan karier Anda berdasarkan profil, skill, pengalaman, 
              dan target yang Anda miliki.
            </p>
            <p>
              Platform ini membantu Anda memahami posisi Anda saat ini dan memberikan 
              panduan konkret untuk mencapai karier impian. Dengan analisis berbasis data 
              dan algoritma AI, kami memberikan rekomendasi yang personal dan relevan 
              untuk perjalanan karier Anda.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Card Fitur */}
        <div 
          data-aos="fade-left"
          data-aos-delay="200"
          className="p-10 rounded-[2.5rem] border border-white/40 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.3) 0%, rgba(0, 74, 124, 0.3) 100%)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="space-y-8">
            {features.map((item, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="bg-white/40 p-2 rounded-lg text-[#004A7C] shadow-sm transition-transform group-hover:scale-110">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-[#004A7C] text-lg">{item.title}</h4>
                  <p className="text-slate-700 text-sm font-regular">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;