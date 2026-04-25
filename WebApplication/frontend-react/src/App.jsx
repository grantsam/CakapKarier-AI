import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import AnalisisPage from './pages/AnalisisPage';
import AnalisisResultPage from './pages/AnalisisResultPage';
import HistoryPage from './pages/HistoryPage';
import ProfilPage from './pages/ProfilPage';
import EditProfilPage from './pages/EditProfilPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/analisis" element={<AnalisisPage />} />
        <Route path="/analisis/hasil" element={<AnalisisResultPage />} />
        <Route path="/riwayat" element={<HistoryPage />} />
        <Route path="/profil" element={<ProfilPage />} />
        <Route path="/profil/edit" element={<EditProfilPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;