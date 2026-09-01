import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroBg from '../../assets/bg_lp.jpg';
import { isAuthenticated } from '../../utils/auth';
import Button from '../ui/Button';
import { fadeInUp, staggerContainer } from '../../utils/motion';

const Hero = () => {
  const isLoggedIn = isAuthenticated();

  return (
    <section
      className="relative min-h-screen pt-20 flex items-center justify-center bg-slate-50 font-poppins overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/20"></div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center relative z-10"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-4xl md:text-[2.75rem] font-bold text-[#004A7C] leading-tight mb-5"
        >
          CakapKarier.AI
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-sm md:text-base text-slate-600 max-w-2xl mb-10 leading-relaxed font-normal"
        >
          Analisis kesiapan karier berbasis profil, skill, pengalaman, dan katalog pembanding untuk membantu Anda menentukan langkah belajar berikutnya.
        </motion.p>

        <motion.div variants={fadeInUp}>
          <Button
            as={Link}
            to={isLoggedIn ? "/analisis" : "/signup"}
            size="lg"
            className="hover:shadow-[0_0_20px_rgba(0,74,124,0.3)]"
          >
            Mulai Analisis
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
