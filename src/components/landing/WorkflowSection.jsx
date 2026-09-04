import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconClipboardCheck, IconCpu, IconTrophy, IconArrowRight } from '@tabler/icons-react';
import { isAuthenticated } from '../../utils/auth';
import Button from '../ui/Button';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import StepImage from '../../assets/start-flag.png';

const WorkflowSection = () => {
  const isLoggedIn = isAuthenticated();

  const steps = [
    {
      no: "1",
      icon: <IconClipboardCheck size={28} className="text-indigo-600 group-hover:scale-110 transition-transform duration-300" />,
      title: "Input Data Profil",
      desc: "Masukkan informasi tentang pendidikan, skill yang dikuasai, minat & bakat, serta pengalaman atau sertifikasi yang Anda miliki.",
      subLabel: "Tips",
      subDesc: "Semakin lengkap data yang Anda berikan, semakin akurat hasil analisisnya.",
      badgeBg: "bg-indigo-500",
      cardBorder: "hover:border-indigo-400/80",
      glowColor: "hover:shadow-indigo-500/20",
      iconBg: "bg-indigo-50 group-hover:bg-indigo-100/80"
    },
    {
      no: "2",
      icon: <IconCpu size={28} className="text-teal-600 group-hover:scale-110 transition-transform duration-300" />,
      title: "AI Menganalisis",
      desc: "Sistem memproses profil Anda dan membandingkannya dengan katalog kebutuhan role yang tersedia.",
      subLabel: "Proses",
      subDesc: "Hasil adalah estimasi berdasarkan profil dan data pembanding yang tersedia.",
      badgeBg: "bg-teal-500",
      cardBorder: "hover:border-teal-400/80",
      glowColor: "hover:shadow-teal-500/20",
      iconBg: "bg-teal-50 group-hover:bg-teal-100/80"
    },
    {
      no: "3",
      icon: <IconTrophy size={28} className="text-amber-500 group-hover:scale-110 transition-transform duration-300" />,
      title: "Terima Hasil & Roadmap",
      desc: "Dapatkan skor kesiapan, daftar skill gap yang perlu ditingkatkan, dan roadmap pengembangan awal.",
      subLabel: "Output",
      subDesc: "Gunakan hasil sebagai panduan evaluasi, bukan keputusan final karier.",
      badgeBg: "bg-amber-500",
      cardBorder: "hover:border-amber-400/80",
      glowColor: "hover:shadow-amber-500/20",
      iconBg: "bg-amber-50 group-hover:bg-amber-100/80"
    }
  ];

  return (
    <section id="workflow" className="py-24 bg-gradient-to-b from-sky-50/60 via-white to-sky-50 font-poppins relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-sky-200/30 via-teal-100/20 to-indigo-100/30 rounded-full blur-[100px] pointer-events-none -z-0" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-20 flex flex-col items-center"
        >
          <span className="text-xs font-bold tracking-widest text-[#004A7C] uppercase mb-3 px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-sky-100 shadow-sm cursor-default hover:scale-105 transition-transform duration-300">
            CARA KERJA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] tracking-tight mb-3">
            Bagaimana CakapKarier AI Bekerja?
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl">
            Proses sederhana dalam 3 langkah untuk membaca kesiapan karier dari data yang Anda isi
          </p>
        </motion.div>

        {/* 3 Steps Process Grid */}
        <div className="relative mb-36 md:mb-40">
          <div className="hidden md:block absolute top-4 left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-sky-300/60 z-0" />

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-8 relative z-10"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Badge Angka Interaktif */}
                <div className={`w-11 h-11 rounded-full ${step.badgeBg} text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-sky-900/15 ring-4 ring-white mb-6 relative z-10 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300`}>
                  {step.no}
                </div>

                {/* Card Utama */}
                <div className={`w-full bg-white/80 backdrop-blur-md p-7 rounded-3xl border border-white/90 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col justify-between text-left ${step.cardBorder} ${step.glowColor} hover:shadow-2xl h-full`}>
                  <div>
                    <div className="mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center border border-white/80 shadow-inner transition-all duration-300`}>
                        {step.icon}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight group-hover:text-[#004A7C] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal mb-6">
                      {step.desc}
                    </p>
                  </div>

                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100/80 mt-auto group-hover:bg-sky-50/50 transition-colors duration-300">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-[#004A7C]">{step.subLabel}: </span>
                      {step.subDesc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Banner Closing Interaktif dengan Gambar Pop-Out */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-3xl bg-gradient-to-r from-sky-100/80 via-blue-50/70 to-indigo-100/80 backdrop-blur-lg p-8 md:p-12 border border-white/90 shadow-xl hover:shadow-2xl shadow-sky-900/5 flex flex-col md:flex-row items-center justify-between gap-8 group"
        >
          {/* Teks CTA */}
          <div className="text-left space-y-2 z-10 max-w-md md:max-w-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-[#004A7C] tracking-tight">
              Siap Tingkatkan Potensi Diri Anda?
            </h3>
            <p className="text-slate-600 text-sm md:text-base">
              Mulai dari satu analisis untuk melihat gap utama dan langkah belajar berikutnya.
            </p>
            <div className="pt-4">
              <Button
                as={Link}
                to={isLoggedIn ? "/analisis" : "/signup"}
                size="lg"
                className="bg-[#004A7C] hover:bg-[#00385e] text-white font-medium px-7 py-3.5 rounded-full shadow-lg shadow-blue-900/20 hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 group/btn"
              >
                {isLoggedIn ? "Mulai Analisis Sekarang" : "Daftar Gratis Sekarang"}
                <IconArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Elemen Visual Gambar Pop-Out (Keluar dari batas Box) */}
          <div className="relative md:static z-20 flex items-center justify-center w-full md:w-auto">
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              className="w-64 md:w-80 lg:w-[380px] md:absolute md:-right-4 lg:-right-8 md:bottom-0 select-none filter drop-shadow-2xl transition-all duration-300 pointer-events-auto"
            >
              <img 
                src={StepImage} 
                alt="Step Flow Illustration" 
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </div>

          {/* Ambient Light Orbs Banner */}
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-sky-300/40 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500 rounded-3xl overflow-hidden" />
        </motion.div>

      </div>
    </section>
  );
};

export default WorkflowSection;