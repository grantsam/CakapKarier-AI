import { BrowserRouter, Navigate, Route, Routes, useLocation, Outlet } from 'react-router-dom';
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

function ProtectedRoute() {
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/analisis" replace />;
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
      className="w-full h-full"
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
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/signup" element={<PublicOnlyRoute><PageWrapper><SignUp /></PageWrapper></PublicOnlyRoute>} />
        <Route path="/signin" element={<PublicOnlyRoute><PageWrapper><SignIn /></PageWrapper></PublicOnlyRoute>} />
        <Route path="/forget-password" element={<PublicOnlyRoute><PageWrapper><ForgetPassword /></PageWrapper></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><PageWrapper><ResetPassword /></PageWrapper></PublicOnlyRoute>} />

        {/* PROTECTED USER ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/analisis" element={<PageWrapper><AnalisisPage /></PageWrapper>} />
          <Route path="/analisis/hasil" element={<PageWrapper><AnalisisResultPage /></PageWrapper>} />
          <Route path="/riwayat" element={<PageWrapper><HistoryPage /></PageWrapper>} />
          <Route path="/riwayat/:id" element={<PageWrapper><AnalisisResultPage /></PageWrapper>} />
          <Route path="/profil" element={<PageWrapper><ProfilPage /></PageWrapper>} />
          <Route path="/profil/edit" element={<PageWrapper><EditProfilPage /></PageWrapper>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
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