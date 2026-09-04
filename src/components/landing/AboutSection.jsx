import { motion } from 'framer-motion';
import CharacterImage from '../../assets/man-about.png';
import { IconSearch, IconCalendarStats, IconBolt } from '@tabler/icons-react';
import { fadeInUp, staggerContainer } from '../../utils/motion';

const AboutSection = () => {
  const features = [
    {
      icon: <IconSearch size={20} className="text-teal-600" />,
      title: "Analisis mendalam",
      desc: "Sistem membaca profil, skill, pengalaman, dan target kariermu."
    },
    {
      icon: <IconCalendarStats size={20} className="text-teal-600" />,
      title: "Roadmap Terstruktur",
      desc: "Panduan bertahap yang mudah diikuti untuk mencapai targetmu."
    },
    {
      icon: <IconBolt size={20} className="text-teal-600" />,
      title: "Hasil Instan",
      desc: "Dapatkan ringkasan awal dan insight yang bisa langsung digunakan."
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-sky-60/100 via-blue-100 to-white font-poppins relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">

        {/* Kolom Kiri: Teks & Fitur List */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="lg:col-span-6 space-y-6 text-left"
        >
          <span className="text-xs font-bold tracking-widest text-teal-600 uppercase px-3.5 py-1 bg-teal-50 rounded-full border border-teal-100 inline-block">
            TENTANG CAKAPKARIER.AI
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] tracking-tight leading-tight">
            Apa itu CakapKarier AI?
          </h2>

          <div className="space-y-3 text-slate-600 leading-relaxed text-[15px]">
            <p>
              CakapKarier.AI membantu menganalisis kesiapan karier berdasarkan profil, skill, pengalaman, target role, dan katalog pembanding yang tersedia.
            </p>
            <p className="text-sm text-slate-500">
              Platform ini membantu Anda memahami posisi saat ini, gap utama, dan langkah belajar yang bisa diprioritaskan sebagai estimasi pendukung keputusan.
            </p>
          </div>

          {/* List Fitur Unggulan */}
          <div className="pt-4 space-y-5">
            {features.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100/80 shadow-sm shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-base">{item.title}</h4>
                  <p className="text-slate-500 text-sm font-normal leading-snug">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Kolom Kanan: Visual Character & Floating Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="lg:col-span-6 relative flex justify-center items-center py-6"
        >
          {/* Latar Belakang Blob Teal */}
          <div className="absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px] bg-gradient-to-tr from-teal-200/50 via-sky-200/40 to-blue-100/60 rounded-full blur-2xl -z-10" />

          <div className="relative w-full max-w-md flex justify-center items-center">

            {/* Floating Card Left: My Skills */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-4 -left-2 md:-left-6 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/80 w-36 md:w-40"
            >
              <p className="text-[11px] font-bold text-slate-700 mb-2">My Skills</p>
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-teal-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full w-[85%]" />
                </div>
                <div className="h-2.5 w-full bg-sky-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-[65%]" />
                </div>
                <div className="h-2.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[45%]" />
                </div>
              </div>
            </motion.div>

            {/* Floating Card Right Top: Target Role */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-6 -right-2 md:-right-4 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/80"
            >
              <p className="text-[10px] text-slate-400 font-medium">Target Role</p>
              <p className="text-xs font-bold text-[#004A7C]">Product Designer</p>
            </motion.div>

            {/* Floating Card Right Bottom: Growth Progress */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-2 -right-2 md:-right-4 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/80 w-36"
            >
              <p className="text-[10px] text-slate-400 font-medium">Growth Progress</p>
              <div className="flex items-baseline gap-1.5 my-0.5">
                <span className="text-lg font-bold text-teal-600">76%</span>
                <span className="text-[10px] text-emerald-500 font-semibold">↑ 12%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[76%]" />
              </div>
            </motion.div>

            {/* Gambar Karakter Utama (Ganti src ini dengan file ilustrasi 3D kamu jika ada) */}
            <div className="relative z-10 w-64 md:w-80 flex justify-center">
              <img 
                src={CharacterImage} 
                alt="Character Illustration"
                className="w-full h-auto object-contain select-none pointer-events-none"
              />
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;