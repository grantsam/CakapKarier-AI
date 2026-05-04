import { Link } from 'react-router-dom';
import heroBg from '../../assets/bg_lp.jpg';

const Hero = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

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

      <div className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center relative z-10">
        <h1 className="text-4xl md:text-[2.75rem] font-bold text-[#004A7C] leading-tight mb-5"
            data-aos="fade-up"
            data-aos-delay="100" 
        >
          Kenali Potensimu, Rencanakan Kariermu, Wujudkan Masa Depanmu
        </h1>
        
        <p  className="text-sm md:text-base text-slate-600 max-w-2xl mb-10 leading-relaxed font-normal"
            data-aos="fade-up"
            data-aos-delay="300"
        >
          Platform berbasis AI yang menganalisis potensi diri dan memberikan roadmap karier 
          yang dipersonalisasi untuk menjadi profesional dalam bidangnya.
        </p>
        
        {/* Logika Navigasi Dinamis */}
        <Link 
          to={isLoggedIn ? "/analisis" : "/signup"}
          className="bg-[#004A7C] text-white px-10 py-3 rounded-full font-medium text-base 
                     hover:shadow-[0_0_20px_rgba(0,74,124,0.3)] transition-all active:scale-95 inline-block"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Mulai Analisis
        </Link>
      </div>
    </section>
  );
};

export default Hero;