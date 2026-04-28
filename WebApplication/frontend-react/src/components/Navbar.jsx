import { useState, useEffect } from 'react';
import { IconArrowRight, IconLogout, IconMenu2, IconX } from '@tabler/icons-react';
import logoImage from '../assets/logo_cakapkarierai.png';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Status login real-time dari localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  // Sinkronisasi status login jika ada perubahan di storage
  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setIsOpen(false);
    navigate('/');
  };

  // Proteksi Menu: Jika belum login, hanya Beranda yang bisa diakses
  const handleNavClick = (path) => {
    if (!isLoggedIn && path !== '/') {
      navigate('/signup');
    } else {
      navigate(path);
    }
    setIsOpen(false); // Tutup menu mobile setelah klik
  };

  // Helper untuk class menu aktif
  const getMenuClass = (path) => {
    const isActive = location.pathname === path;
    return `px-5 py-2 rounded-full cursor-pointer transition-all duration-300 font-semibold text-sm
      ${isActive 
        ? 'bg-[#004A7C] text-white shadow-md scale-105' 
        : 'text-slate-700 hover:text-[#004A7C] hover:bg-white/50'}`;
  };

  return (
    <header className="fixed top-0 left-0 w-full p-4 z-[100] flex justify-center font-poppins">
      <nav 
        className="w-full max-w-6xl flex justify-between items-center px-6 py-2.5 rounded-full shadow-xl border border-white/40 backdrop-blur-2xl relative"
        style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(224, 242, 254, 0.7) 100%)' }}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer z-[101]" onClick={() => navigate('/')}>
          <img src={logoImage} alt="Logo" className="h-7 w-auto" />
        </div>

        {/* Hamburger Mobile */}
        <button 
          className="lg:hidden p-2 text-[#004A7C] z-[101]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IconX size={28} /> : <IconMenu2 size={28} />}
        </button>

        {/* Menu Navigasi (Desktop & Mobile) */}
        <ul className={`
          fixed lg:static top-[80px] left-4 right-4 lg:top-auto lg:left-auto lg:right-auto
          flex flex-col lg:flex-row gap-4 lg:gap-2 items-center
          bg-white/95 lg:bg-transparent p-8 lg:p-0 rounded-[2rem] lg:rounded-none shadow-2xl lg:shadow-none
          transition-all duration-500 ease-in-out z-[100]
          ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-[150%] lg:translate-y-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto'}
        `}>
          <li onClick={() => handleNavClick('/')} className={getMenuClass('/')}>Beranda</li>
          
          {/* Menu yang diproteksi */}
          <li onClick={() => handleNavClick('/analisis')} className={getMenuClass('/analisis')}>Analisis</li>
          <li onClick={() => handleNavClick('/riwayat')} className={getMenuClass('/riwayat')}>Riwayat</li>
          <li onClick={() => handleNavClick('/profil')} className={getMenuClass('/profil')}>Profil</li>

          {/* Tombol Keluar (Hanya tampil di mobile saat login) */}
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="lg:hidden w-full mt-4 bg-red-50 text-red-600 px-6 py-3 rounded-full text-sm font-bold flex justify-center items-center gap-2"
            >
              Keluar <IconLogout size={18} />
            </button>
          )}
        </ul>

        {/* Desktop Action Button */}
        <div className="hidden lg:block">
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="bg-[#004A7C] text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#00365d] transition-all shadow-lg active:scale-95 group"
            >
              Keluar <IconLogout size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/signup')}
              className="bg-[#004A7C] text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#00365d] transition-all shadow-lg active:scale-95 group"
            >
              Daftar Sekarang <IconArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;