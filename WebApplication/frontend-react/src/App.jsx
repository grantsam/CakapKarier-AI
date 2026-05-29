import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isAuthenticated } from './utils/auth';
import { pageVariants, pageTransition } from './utils/motion';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import AnalisisPage from './pages/AnalisisPage';
import AnalisisResultPage from './pages/AnalisisResultPage';
import HistoryPage from './pages/HistoryPage';
import ProfilPage from './pages/ProfilPage';
import EditProfilPage from './pages/EditProfilPage';
import ForgetPassword from './pages/ForgetPasswordPage';
import ResetPassword from './pages/ResetPasswordPage';

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ message: 'Silakan masuk untuk mengakses halaman ini.', from: location.pathname }}
      />
    );
  }

  return children;
}

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col min-h-screen"
    >
      {children}
    </motion.div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
        <Route path="/signin" element={<PageWrapper><SignIn /></PageWrapper>} />
        <Route path="/analisis" element={<ProtectedRoute><PageWrapper><AnalisisPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/analisis/hasil" element={<ProtectedRoute><PageWrapper><AnalisisResultPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/riwayat" element={<ProtectedRoute><PageWrapper><HistoryPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/riwayat/:id" element={<ProtectedRoute><PageWrapper><AnalisisResultPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><PageWrapper><ProfilPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/profil/edit" element={<ProtectedRoute><PageWrapper><EditProfilPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/forget-password" element={<PageWrapper><ForgetPassword /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
