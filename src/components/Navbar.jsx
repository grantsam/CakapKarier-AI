import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowRight, IconLogout, IconMenu2, IconX } from '@tabler/icons-react';
import logoImage from '../assets/logo_cakapkarierai.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth, isAuthenticated, subscribeAuthChange } from '../utils/auth';
import Button from './ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    return subscribeAuthChange(setIsLoggedIn);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    setIsOpen(false);
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';

  const menuItems = isLandingPage && !isLoggedIn
    ? [
        { label: 'Beranda', path: '#hero' },
        { label: 'Insight', path: '#insight' },
        { label: 'Tentang', path: '#about' },
        { label: 'Cara Kerja', path: '#workflow' },
      ]
    : [
        { label: 'Analisis', path: '/analisis' },
        { label: 'Riwayat', path: '/riwayat' },
        { label: 'Profil', path: '/profil' },
      ];

  const handleNavClick = (path) => {
    if (path.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(path);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(path);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const isMenuActive = (path) => {
    if (path.startsWith('#')) return false;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getMenuClass = (path) => {
    const isActive = isMenuActive(path);

    return `relative px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#004A7C]/30
      ${isActive
        ? 'bg-[#004A7C] text-white shadow-md'
        : 'text-slate-700 hover:text-[#004A7C] hover:bg-white/70'}`;
  };

  const renderMenuItem = (item) => (
    <motion.li
      key={item.path}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => handleNavClick(item.path)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleNavClick(item.path);
        }
      }}
      tabIndex={0}
      className={getMenuClass(item.path)}
    >
      {item.label}
    </motion.li>
  );

  return (
    <header className="fixed top-0 left-0 w-full p-3 sm:p-4 z-[100] flex justify-center font-poppins">
      <nav
        className="w-full max-w-6xl flex justify-between items-center px-4 sm:px-6 py-2.5 rounded-full shadow-xl border border-white/40 backdrop-blur-2xl relative"
        style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(224, 242, 254, 0.82) 100%)' }}
        aria-label="Navigasi utama"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 cursor-pointer z-[101] focus:outline-none focus:ring-2 focus:ring-[#004A7C]/30 rounded-full"
          onClick={() => navigate(isLoggedIn ? '/analisis' : '/')}
          aria-label="Ke halaman utama"
        >
          <img src={logoImage} alt="Logo CakapKarier AI" className="h-7 w-auto" />
        </motion.button>

        <button
          type="button"
          className="lg:hidden p-2 text-[#004A7C] z-[101] rounded-full hover:bg-white/70 transition-colors focus:outline-none focus:ring-2 focus:ring-[#004A7C]/30"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
        >
          {isOpen ? <IconX size={28} /> : <IconMenu2 size={28} />}
        </button>

        <ul className="hidden lg:flex flex-row gap-2 items-center">
          {menuItems.map(renderMenuItem)}
        </ul>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              id="mobile-nav-menu"
              initial={{ opacity: 0, y: -18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="fixed top-[76px] left-3 right-3 flex flex-col gap-3 items-stretch bg-white/95 p-5 rounded-[1.75rem] shadow-2xl border border-slate-100 lg:hidden z-[100]"
            >
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`${getMenuClass(item.path)} w-full text-center`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}

              <li className="pt-2">
                {isLoggedIn ? (
                  <Button
                    onClick={handleLogout}
                    variant="danger"
                    fullWidth
                    className="justify-center"
                  >
                    Keluar <IconLogout size={18} />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleNavClick('/signin')}
                    variant="default"
                    fullWidth
                    className="justify-center bg-[#004A7C] text-white"
                  >
                    Masuk Akun <IconArrowRight size={18} />
                  </Button>
                )}
              </li>
            </motion.ul>
          )}
        </AnimatePresence>

        <div className="hidden lg:block">
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              icon={IconLogout}
              className="group"
            >
              Keluar
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/signin')}
                variant="secondary"
                className="text-[#004A7C] font-semibold"
              >
                Masuk
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                icon={IconArrowRight}
                className="group bg-[#004A7C] text-white"
              >
                Daftar
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;