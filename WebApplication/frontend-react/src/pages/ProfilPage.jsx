import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ProfileSkeleton } from '../components/ui/Skeleton';
import { 
  IconUserCircle, 
  IconEdit, 
  IconChartBar, 
  IconHistory,
  IconChevronRight 
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { clearAuth, getAuthToken, isTokenUsable } from '../utils/auth';

const ProfilPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        const token = getAuthToken();
        if (!isTokenUsable(token)) {
          console.warn("Token tidak ditemukan di localStorage, mengalihkan ke signin...");
          navigate('/signin', { state: { message: 'Silakan masuk untuk melihat profil.' } });
          return;
        }

        const response = await api.get('/user/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          signal: controller.signal
        });

        console.log("Data user yang berhasil diambil:", response.data);

        const profilePayload = response.data?.data;
        
        if (profilePayload) {
          setUserData(profilePayload);
        } else {
          console.error("Respons sukses tapi properti 'data' kosong:", response.data);
        }

      } catch (error) {
        if (api.isCancel && api.isCancel(error)) return;
        
        console.error("Gagal mengambil data profil. Detail Error:", error.response || error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearAuth();
          navigate('/signin', { state: { message: 'Sesi Anda berakhir. Silakan masuk kembali.' } });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 px-6">
          <ProfileSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Section 1: Profil Header & Informasi Pribadi */}
          <Card variant="elevated" className="rounded-[2rem] overflow-hidden">
            <div className="bg-[#E0F2FE]/40 p-8 flex items-center gap-5 border-b border-slate-100">
              <div className="bg-white p-1 rounded-full shadow-md">
                <IconUserCircle size={80} className="text-[#004A7C]" stroke={1.5} />
              </div>
              <div>
                {/* DIUBAH: fallback menggunakan tanda strip (-) agar terlihat jika data kosong */}
                <h2 className="text-xl font-bold text-[#004A7C]">{userData?.nama || '-'}</h2>
                <p className="text-slate-500 font-medium">{userData?.email || 'Memuat email...'}</p>
              </div>
            </div>

            {/* Konten Informasi Pribadi */}
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
                <Button
                  onClick={() => navigate('/profil/edit')}
                  size="sm"
                  icon={IconEdit}
                >
                  Edit Profil
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                  <p className="font-normal text-slate-800">{userData?.nama || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Email</label>
                  <p className="font-normal text-slate-800">{userData?.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
                  <p className="font-normal text-slate-800">{userData?.nomor_telepon || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-slate-400 uppercase tracking-wider">Bio</label>
                  <p className="font-normal text-slate-800">{userData?.bio || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Akses Menu */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#004A7C]">Akses Menu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                interactive
                onClick={() => navigate('/analisis')}
                className="flex items-center gap-4 p-5 group text-left outline-none focus-visible:ring-2 focus-visible:ring-[#004A7C]/30"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/analisis')}
              >
                <div className="bg-[#E0F2FE] p-3 rounded-xl text-[#004A7C] group-hover:bg-[#004A7C] group-hover:text-white transition-colors">
                  <IconChartBar size={24} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-slate-800 text-sm">Mulai Analisis</h4>
                  <p className="text-[12px] text-slate-500 font-normal">Analisis potensi dan kesiapan karier</p>
                </div>
                <IconChevronRight size={18} className="text-slate-300 group-hover:text-[#004A7C] transition-colors" />
              </Card>

              <Card
                interactive
                onClick={() => navigate('/riwayat')}
                className="flex items-center gap-4 p-5 group text-left outline-none focus-visible:ring-2 focus-visible:ring-[#004A7C]/30"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/riwayat')}
              >
                <div className="bg-[#E0F2FE] p-3 rounded-xl text-[#004A7C] group-hover:bg-[#004A7C] group-hover:text-white transition-colors">
                  <IconHistory size={24} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-slate-800 text-sm">Lihat Riwayat</h4>
                  <p className="text-[12px] text-slate-500 font-normal">Cek analisis sebelumnya</p>
                </div>
                <IconChevronRight size={18} className="text-slate-300 group-hover:text-[#004A7C] transition-colors" />
              </Card>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilPage;
