import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { IconUserCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditProfilPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomor_telepon: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});

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

        const { nama, email, nomor_telepon, bio } = response.data.data;
        setFormData({
          nama: nama || '',
          email: email || '',
          nomor_telepon: nomor_telepon || '',
          bio: bio || ''
        });
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        if (error.response?.status === 401) {
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3000/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Profil berhasil diperbarui!");
      navigate('/profil');
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Gagal memperbarui profil";
      alert(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
        <div className="text-[#004A7C] font-medium">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            
            <div className="bg-[#E0F2FE]/40 p-8 flex items-center gap-5 border-b border-slate-100">
              <div className="bg-white p-1 rounded-full shadow-sm">
                <IconUserCircle size={80} className="text-[#004A7C]" stroke={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#004A7C]">{formData.nama || 'User'}</h2>
                <p className="text-slate-500 font-medium">{formData.email}</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <input 
                    name="nama"
                    type="text" 
                    value={formData.nama}
                    onChange={handleChange}
                    className={`w-full p-3.5 bg-white border ${errors.nama ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-[#004A7C] outline-none transition-all`}
                  />
                  {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3.5 bg-white border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-[#004A7C] outline-none transition-all`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nomor Telepon</label>
                  <input 
                    name="nomor_telepon"
                    type="text" 
                    value={formData.nomor_telepon}
                    onChange={handleChange}
                    placeholder="Contoh: 628123456789"
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#004A7C] outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea 
                    name="bio"
                    rows="5"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#004A7C] outline-none resize-none transition-all"
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/profil')}
                  className="flex-1 py-3.5 rounded-full border border-[#004A7C] text-[#004A7C] font-medium hover:bg-slate-50 transition-all text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className={`flex-1 py-3.5 rounded-full ${saving ? 'bg-slate-400' : 'bg-[#004A7C]'} text-white font-medium hover:bg-[#00365d] transition-all shadow-md text-sm`}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProfilPage;
