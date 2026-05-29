import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { IconUserCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ProfileSkeleton } from '../components/ui/Skeleton';
import { clearAuth, getAuthToken, isTokenUsable } from '../utils/auth';

const EditProfilPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [initialData, setInitialData] = useState({
    nama: '',
    email: ''
  });

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomor_telepon: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        const token = getAuthToken();
        if (!isTokenUsable(token)) {
          navigate('/signin');
          return;
        }

        const response = await api.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        const profilePayload = response.data?.data || response.data;
        
        const dataProfil = {
          nama: profilePayload?.nama || '',
          email: profilePayload?.email || '',
          nomor_telepon: profilePayload?.nomor_telepon || '',
          bio: profilePayload?.bio || ''
        };

        setFormData(dataProfil);

        setInitialData({
          nama: profilePayload?.nama || '',
          email: profilePayload?.email || ''
        });

      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error("Gagal mengambil data profil:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearAuth();
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi";
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = "Nama minimal harus 3 karakter";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      const token = getAuthToken();
      await api.put('/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage("Profil berhasil diperbarui!");
      setTimeout(() => {
        navigate('/profil');
      }, 1500);
    } catch (error) {
      console.error("Eror saat update profil:", error);
      
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          const fieldName = err.path || err.param;
          if (fieldName) backendErrors[fieldName] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        setGeneralError(error.response?.data?.message || "Gagal memperbarui profil. Coba lagi.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-poppins">
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
        <div className="max-w-4xl mx-auto">
          <Card as="form" onSubmit={handleSave} className="rounded-[2rem] overflow-hidden">
            
            {/* Bagian Header yang diperbaiki menggunakan initialData */}
            <div className="bg-[#E0F2FE]/40 p-8 flex items-center gap-5 border-b border-slate-100">
              <div className="bg-white p-1 rounded-full shadow-sm shrink-0">
                <IconUserCircle size={80} className="text-[#004A7C]" stroke={1.5} />
              </div>
              <div className="truncate">
                <h2 className="text-xl font-bold text-[#004A7C] truncate">{initialData.nama || 'User'}</h2>
                <p className="text-slate-500 font-medium truncate">{initialData.email || '-'}</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
              
              {generalError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                  {generalError}
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl text-sm font-medium animate-pulse">
                  {successMessage}
                </div>
              )}

              <div className="space-y-5">
                {/* Input Nama */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Nama Lengkap</label>
                  <input 
                    name="nama"
                    type="text" 
                    value={formData.nama}
                    onChange={handleChange}
                    disabled={saving}
                    className={`w-full p-3.5 bg-white border ${errors.nama ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'} rounded-xl focus:ring-4 focus:border-[#004A7C] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400`}
                  />
                  {errors.nama && <p className="text-red-500 text-xs font-medium mt-1">{errors.nama}</p>}
                </div>

                {/* Input Email */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saving}
                    className={`w-full p-3.5 bg-white border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'} rounded-xl focus:ring-4 focus:border-[#004A7C] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400`}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-medium mt-1">{errors.email}</p>}
                </div>

                {/* Input Nomor Telepon */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Nomor Telepon</label>
                  <input 
                    name="nomor_telepon"
                    type="text" 
                    value={formData.nomor_telepon}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Contoh: 628123456789"
                    className={`w-full p-3.5 bg-white border ${errors.nomor_telepon ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'} rounded-xl focus:ring-4 focus:border-[#004A7C] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400`}
                  />
                  {errors.nomor_telepon && <p className="text-red-500 text-xs font-medium mt-1">{errors.nomor_telepon}</p>}
                </div>

                {/* Input Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Bio</label>
                  <textarea 
                    name="bio"
                    rows="5"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    className="w-full p-3.5 bg-white border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-[#004A7C] rounded-xl outline-none resize-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                  ></textarea>
                </div>
              </div>

              {/* Group Button */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate('/profil')}
                  disabled={saving}
                  variant="outline"
                  fullWidth
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  loading={saving}
                  fullWidth
                  className="flex-1"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProfilPage;