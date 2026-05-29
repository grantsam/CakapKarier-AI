import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import authBg from '../assets/signup-in.jpg'; 
import logoImage from '../assets/logo_cakapkarierai.png';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Kata sandi wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Kata sandi minimal harus 8 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const token = response.data?.token || response.data?.data?.token;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        alert("Selamat datang kembali!");
        navigate('/profil'); 
      } else {
        alert("Token tidak ditemukan dalam respon server.");
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Email atau kata sandi salah";
      alert(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-poppins">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex overflow-hidden max-w-5xl w-full h-full max-h-[600px]">
        
        <div className="hidden md:block w-1/2 relative">
          <img src={authBg} alt="Auth Background" className="h-full w-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <img src={logoImage} alt="Logo" className="h-7 w-auto" />
          </div>

          <h2 className="text-3xl font-bold text-[#004A7C] mb-1 tracking-tight">Masuk</h2>
          <p className="text-slate-500 mb-8 text-sm font-medium">Selamat datang kembali</p>

          <form onSubmit={handleSignIn} className="space-y-5" noValidate>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
              <input 
                name="email"
                type="email" 
                placeholder="nama@email.com" 
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] focus:ring-1 focus:ring-[#004A7C] outline-none transition-all text-sm`} 
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] focus:ring-1 focus:ring-[#004A7C] outline-none transition-all text-sm pr-10`} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004A7C]"
                >
                  {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.password}</p>}
            </div>
            
            <div className="flex justify-between items-center text-[12px] font-medium text-[#004A7C]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-[#004A7C]" /> Ingat saya?
              </label>
              <Link to="/forget-password" className="hover:underline cursor-pointer">Lupa kata sandi</Link>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-slate-400' : 'bg-[#004A7C]'} text-white py-3.5 rounded-full font-medium text-md mt-2 hover:bg-[#00365d] transition-all shadow-md active:scale-95`}
            >
              {loading ? 'Menghubungkan...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-600 text-[13px] font-medium">
            Belum punya akun? <Link to="/signup" className="text-[#004A7C] font-medium hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;