import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { isAuthenticated } from '../../utils/auth';
import Button from '../ui/Button';
import { fadeInUp, staggerContainer } from '../../utils/motion';

const Hero = () => {
  const isLoggedIn = isAuthenticated();

  // Parallax Scroll Effect
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 100]);
  const yCard = useTransform(scrollY, [0, 500], [0, -50]);

  const scrollToWorkflow = () => {
    const section = document.getElementById('workflow');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen pt-28 pb-20 flex items-center bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#f8fafc] font-poppins overflow-hidden">
      <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none -z-10">
        {/* Glow Orb Primary (Biru Tua/Navy Gravity) */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] bg-sky-400/40 rounded-full blur-[100px]"
        />

        {/* Glow Orb Secondary (Teal/Cyan Glow Kanan Bawah) */}
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[650px] bg-teal-300/40 rounded-full blur-[110px]"
        />

        {/* Glow Orb Accent (Cyan Tengah) */}
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute top-[35%] right-[25%] w-[350px] h-[350px] bg-cyan-300/35 rounded-full blur-[90px]"
        />

        {/* Ambient Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(#004A7C 1.5px, transparent 1.5px)`,
            backgroundSize: '28px 28px'
          }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Kolom Kiri - Text & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#004A7C] text-xs font-semibold mb-6 border border-sky-200/80 shadow-sm shadow-sky-100 cursor-default"
            >
              <span className="animate-pulse">✨</span>
              <span>AI-Powered Career Insight</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight"
            >
              Kenali Potensi, <br />
              Raih <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004A7C] via-cyan-600 to-teal-500">Karier Impianmu</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed font-normal"
            >
              CakapKarier AI membantumu memahami kekuatan, menemukan celah skill, dan memberi roadmap pengembangan diri yang sesuai dengan tujuan kariermu.
            </motion.p>

            {/* CTA Group Interaktif */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-10">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  as={Link}
                  to={isLoggedIn ? "/analisis" : "/signup"}
                  size="lg"
                  className="bg-[#004A7C] hover:bg-[#00385e] text-white font-medium px-8 py-4 rounded-full shadow-lg shadow-blue-900/25 transition-all duration-300 flex items-center gap-2 group"
                >
                  Mulai Analisis Gratis 
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Button>
              </motion.div>

              <motion.button
                type="button"
                onClick={scrollToWorkflow}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-700 font-medium hover:bg-white hover:border-sky-300 hover:shadow-md transition-all duration-300 group"
              >
                <span className="w-8 h-8 rounded-full bg-sky-100/80 text-[#004A7C] flex items-center justify-center text-xs font-bold pl-0.5 group-hover:bg-[#004A7C] group-hover:text-white transition-colors duration-300">▶</span>
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold">Lihat Cara Kerja</p>
                  <p className="text-[10px] text-slate-400">Pelajari alur analisis</p>
                </div>
              </motion.button>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="user" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="user" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="user" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="user" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                <strong className="text-slate-900 font-bold">1K+</strong> pengguna sudah berkembang bersama CakapKarier.AI
              </p>
            </motion.div>
          </div>

          {/* Kolom Kanan - UI Mockup Cards dengan Parallax & Dynamic Hover */}
          <motion.div 
            style={{ y: yCard }}
            variants={fadeInUp} 
            className="lg:col-span-5 relative w-full flex justify-center items-center"
          >
            {/* Sparkle 3D Kiri Atas */}
            <motion.div 
              className="absolute -top-6 -left-2 text-3xl text-amber-400 z-20 select-none filter drop-shadow-[0_2px_12px_rgba(251,191,36,0.7)]"
              animate={{ scale: [0.9, 1.3, 0.9], rotate: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              ✦
            </motion.div>

            {/* Sparkle Kanan Atas */}
            <motion.div 
              className="absolute top-4 -right-2 text-xl text-sky-400 z-20 select-none filter drop-shadow-[0_2px_12px_rgba(56,189,248,0.7)]"
              animate={{ scale: [1, 1.4, 1], rotate: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              ✦
            </motion.div>

            {/* Roket 3D Kanan Bawah */}
            <motion.div 
              className="absolute -right-8 -bottom-8 z-20 text-6xl md:text-7xl filter drop-shadow-[0_20px_25px_rgba(0,74,124,0.35)] select-none pointer-events-none"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 8, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3.5, 
                ease: "easeInOut" 
              }}
            >
              🚀
            </motion.div>

            {/* Wrapper Card Utama */}
            <div className="w-full max-w-md space-y-4 relative z-10">
              {/* Card Readiness Score */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white/85 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,74,124,0.12)] border border-white/90 hover:border-sky-200 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-500" strokeDasharray="87, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-2xl font-bold text-slate-800">87</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Readiness Score</p>
                    <h4 className="text-xl font-bold text-emerald-600 mb-2">Sangat Siap</h4>
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[87%] h-full bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sub-cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white/85 backdrop-blur-2xl p-4 rounded-xl shadow-[0_10px_30px_rgba(0,74,124,0.08)] border border-white/90 hover:border-amber-200 transition-all duration-300 flex items-center gap-3"
                >
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-500 font-bold text-lg">⚡</div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Skill Gap</h5>
                    <p className="text-[11px] text-slate-500">3 Keterampilan Perlu Ditingkatkan</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white/85 backdrop-blur-2xl p-4 rounded-xl shadow-[0_10px_30px_rgba(0,74,124,0.08)] border border-white/90 hover:border-teal-200 transition-all duration-300 flex items-center gap-3"
                >
                  <div className="p-3 bg-teal-50 rounded-lg text-teal-500 font-bold text-lg">🗺️</div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Roadmap</h5>
                    <p className="text-[11px] text-slate-500">4 Langkah Pengembangan</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;