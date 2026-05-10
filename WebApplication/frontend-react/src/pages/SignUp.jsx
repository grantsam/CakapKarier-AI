import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authBg from '../assets/signup-in.jpg'; 
import logoImage from '../assets/logo_cakapkarierai.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State untuk menyimpan data input
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // State untuk menyimpan pesan error
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // Validasi nama kosong dan minimal 3 karakter
    if (!formData.username.trim()) {
      newErrors.username = "Nama lengkap wajib diisi";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Nama minimal harus 3 karakter";
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Validasi password minimal 8 karakter
    if (!formData.password) {
      newErrors.password = "Kata sandi wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Kata sandi minimal harus 8 karakter";
    }

    // Validasi konfirmasi sandi
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Konfirmasi sandi tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/signup', {
        nama: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('isLoggedIn', 'true');
      }

      alert("Akun berhasil dibuat! Selamat datang.");
      navigate('/');
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Gagal mendaftar, silakan coba lagi.";
      alert(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-poppins">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex overflow-hidden max-w-5xl w-full h-full max-h-[600px]">
        
        {/* Sisi kiri - Gambar ilustrasi */}
        <div className="hidden md:block w-1/2 relative">
          <img src={authBg} alt="Auth Background" className="h-full w-full object-cover" />
        </div>

        {/* Sisi kanan - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <img src={logoImage} alt="Logo" className="h-7 w-auto" />
          </div>

          <h2 className="text-3xl font-bold text-[#004A7C] mb-1 tracking-tight">Buat Akun</h2>
          <p className="text-slate-500 mb-6 text-sm font-medium">Mari temukan potensi terbaik Anda</p>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Input nama */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text" 
                placeholder="Masukkan Nama Lengkap" 
                className={`w-full px-4 py-3 rounded-xl border ${errors.username ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm`} 
              />
              {errors.username && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.username}</p>}
            </div>

            {/* Input email */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="text" 
                placeholder="email@domain.com" 
                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm`} 
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
            </div>

            {/* Input password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Kata Sandi</label>
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password" 
                  placeholder="Minimal 8 Karakter" 
                  className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm`} 
                />
                {errors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Konfirmasi Sandi</label>
                <input 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password" 
                  placeholder="Ulangi Kata Sandi" 
                  className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm`} 
                />
                {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full ${loading ? 'bg-slate-400' : 'bg-[#004A7C]'} text-white py-3.5 rounded-full font-medium text-md mt-4 hover:bg-[#00365d] transition-all shadow-md active:scale-95`}
            >
              {loading ? 'Sedang Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="text-center mt-6 text-slate-600 text-[13px] font-reguler">
            Sudah punya akun? <Link to="/signin" className="text-[#004A7C] font-medium hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;