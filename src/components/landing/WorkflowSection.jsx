import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isAuthenticated } from '../../utils/auth';
import Button from '../ui/Button';
import { fadeInUp, staggerContainer } from '../../utils/motion';

const WorkflowSection = () => {
  const isLoggedIn = isAuthenticated();

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
      desc: "Sistem memproses profil Anda dan membandingkannya dengan katalog kebutuhan role yang tersedia.",
      subText: "Proses: Hasil adalah estimasi berdasarkan profil dan data pembanding yang tersedia."
    },
    {
      no: "3",
      title: "Terima Hasil & Roadmap",
      desc: "Dapatkan skor kesiapan, daftar skill gap yang perlu ditingkatkan, dan roadmap pengembangan awal.",
      subText: "Output: Gunakan hasil sebagai panduan evaluasi, bukan keputusan final karier."
    }
  ];

  return (
    <section className="py-24 bg-white font-poppins">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-[#004A7C] mb-4">Bagaimana CakapKarier AI Bekerja?</h2>
          <p className="text-slate-600">Proses sederhana dalam 3 langkah untuk membaca kesiapan karier dari data yang Anda isi</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-24"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="p-8 rounded-[2rem] border border-white/40 shadow-sm relative overflow-hidden flex flex-col h-full transition-shadow hover:shadow-xl"
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

              <div className="bg-white/40 p-4 rounded-xl border border-white/20">
                <p className="text-[14px] text-[#004A7C] leading-tight">
                  <span className="font-bold">{step.subText.split(':')[0]}:</span> {step.subText.split(':')[1]}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="p-8 md:p-12 rounded-[2.5rem] border border-white/40 text-center shadow-xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.2) 0%, rgba(0, 74, 124, 0.2) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#4FD1C5]/20 blur-3xl -z-10"></div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] mb-4">Siap Tingkatkan Potensi Diri Anda?</h2>
          <p className="text-slate-700 mb-10 text-base md:text-lg">Mulai dari satu analisis untuk melihat gap utama dan langkah belajar berikutnya.</p>
          <Button
            as={Link}
            to={isLoggedIn ? "/analisis" : "/signup"}
            size="lg"
            className="hover:shadow-2xl hover:scale-105"
          >
            {isLoggedIn ? "Mulai Analisis Sekarang" : "Daftar Gratis Sekarang"}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkflowSection;
