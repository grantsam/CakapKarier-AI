import { motion } from 'framer-motion';
import { IconSearch, IconCalendarStats, IconBolt } from '@tabler/icons-react';
import { fadeInUp, staggerContainer } from '../../utils/motion';

const AboutSection = () => {
  const features = [
    {
      icon: <IconSearch size={20} />,
      title: "Analisis mendalam",
      desc: "Sistem membaca profil yang Anda isi"
    },
    {
      icon: <IconCalendarStats size={20} />,
      title: "Roadmap Terstruktur",
      desc: "Panduan bertahap yang mudah diikuti"
    },
    {
      icon: <IconBolt size={20} />,
      title: "Hasil Instan",
      desc: "Dapatkan ringkasan awal setelah analisis selesai"
    }
  ];

  return (
    <section className="py-24 bg-[#E0F2FE]/50 font-poppins">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] tracking-tight">
            Apa itu CakapKarier AI?
          </h2>
          <div className="space-y-4 text-slate-800 leading-relaxed text-[15px]">
            <p>
              CakapKarier.AI membantu menganalisis kesiapan karier berdasarkan profil, skill, pengalaman, target role, dan katalog pembanding yang tersedia.
            </p>
            <p>
              Platform ini membantu Anda memahami posisi saat ini, gap utama, dan langkah belajar yang bisa diprioritaskan. Hasilnya adalah estimasi pendukung keputusan, bukan penilaian final atas kemampuan Anda.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="p-10 rounded-[2.5rem] border border-white/40 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.3) 0%, rgba(0, 74, 124, 0.3) 100%)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="space-y-8">
            {features.map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="flex items-start gap-4 group">
                <div className="bg-white/40 p-2 rounded-lg text-[#004A7C] shadow-sm transition-transform group-hover:scale-110">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-[#004A7C] text-lg">{item.title}</h4>
                  <p className="text-slate-700 text-sm font-normal">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
