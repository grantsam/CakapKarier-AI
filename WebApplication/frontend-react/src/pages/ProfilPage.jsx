import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { 
  IconUserCircle, 
  IconEdit, 
  IconChartBar, 
  IconHistory,
  IconChevronRight 
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
        <div className="text-[#004A7C] font-medium">Memuat profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Section 1: Profil Header & Informasi Pribadi */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Profil Biru Muda */}
            <div className="bg-[#E0F2FE]/40 p-8 flex items-center gap-5 border-b border-slate-100">
              <div className="bg-white p-1 rounded-full shadow-sm">
                <IconUserCircle size={80} className="text-[#004A7C]" stroke={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#004A7C]">{userData?.nama || 'User'}</h2>
                <p className="text-slate-500 font-medium">{userData?.email || 'email@domain.com'}</p>
              </div>
            </div>

            {/* Konten Informasi Pribadi */}
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
                <button 
                  onClick={() => navigate('/profil/edit')}
                  className="flex items-center gap-2 px-5 py-2 bg-[#004A7C] text-white rounded-full text-xs font-medium hover:bg-[#00365d] transition-all shadow-md"
                >
                  <IconEdit size={16} /> Edit Profil
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                  <p className="font-regular text-slate-800">{userData?.nama || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Email</label>
                  <p className="font-regular text-slate-800">{userData?.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
                  <p className="font-regular text-slate-800">{userData?.nomor_telepon || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Bio</label>
                  <p className="font-regular text-slate-800">{userData?.bio || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Akses Menu */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#004A7C]">Akses Menu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/analisis')}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#004A7C] transition-all group text-left"
              >
                <div className="bg-[#E0F2FE] p-3 rounded-xl text-[#004A7C] group-hover:bg-[#004A7C] group-hover:text-white transition-colors">
                  <IconChartBar size={24} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-slate-800 text-sm">Mulai Analisis</h4>
                  <p className="text-[12px] text-slate-500 font-regular">Analisis potensi dan kesiapan karier</p>
                </div>
                <IconChevronRight size={18} className="text-slate-300 group-hover:text-[#004A7C]" />
              </button>

              <button 
                onClick={() => navigate('/riwayat')}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#004A7C] transition-all group text-left"
              >
                <div className="bg-[#E0F2FE] p-3 rounded-xl text-[#004A7C] group-hover:bg-[#004A7C] group-hover:text-white transition-colors">
                  <IconHistory size={24} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-slate-800 text-sm">Lihat Riwayat</h4>
                  <p className="text-[12px] text-slate-500 font-regular">Cek analisis sebelumnya</p>
                </div>
                <IconChevronRight size={18} className="text-slate-300 group-hover:text-[#004A7C]" />
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilPage;
