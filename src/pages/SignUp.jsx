import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import authBg from '../assets/signup-in.jpg'; 
import { setAuthToken } from '../utils/auth';
import logoImage from '../assets/logo_cakapkarierai.png';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormMessage('');
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Nama lengkap wajib diisi";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Nama minimal harus 3 karakter";
    }

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
    setFormMessage('');
    try {
      const response = await api.post('/auth/signup', {
        nama: formData.username,
        email: formData.email,
        password: formData.password
      });

      const token = response.data?.token || response.data?.data?.token;
      
      if (token) {
        if (typeof setAuthToken === 'function') {
          setAuthToken(token);
        } else {
          localStorage.setItem('token', token);
        }
      
        navigate('/profil');
      } else {
          navigate('/signin', { 
        state: { success: 'Akun berhasil dibuat! Silakan masuk dengan email dan kata sandi Anda.' } 
        });
      }

    } catch (error) {
      const serverMessage = error.response?.data?.message || "Gagal mendaftar, silakan coba lagi.";
      setFormMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-poppins">
      <Card className="rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex overflow-hidden max-w-5xl w-full h-full max-h-[600px]">
        
        <div className="hidden md:block w-1/2 relative">
          <img src={authBg} alt="Auth Background" className="h-full w-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <img src={logoImage} alt="Logo" className="h-7 w-auto" />
          </div>

          <h2 className="text-3xl font-bold text-[#004A7C] mb-1 tracking-tight">Buat Akun</h2>
          <p className="text-slate-500 mb-6 text-sm font-medium">Mari temukan potensi terbaik Anda</p>

          {formMessage && (
            <div role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formMessage}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            <div>
              <label htmlFor="signup-name" className="block text-[13px] font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
              <input 
                id="signup-name"
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text" 
                placeholder="Masukkan Nama Lengkap" 
                className={`w-full px-4 py-3 rounded-xl border ${errors.username ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm`} 
              />
              {errors.username && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
              <input 
                id="signup-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="text" 
                placeholder="email@domain.com" 
                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm`} 
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="relative">
                <label htmlFor="signup-password" className="block text-[13px] font-medium text-slate-700 mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <input 
                    id="signup-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"} 
                    placeholder="Minimal 8 Karakter" 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm pr-10`} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004A7C]"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label htmlFor="signup-confirm-password" className="block text-[13px] font-medium text-slate-700 mb-1.5">Konfirmasi Sandi</label>
                <div className="relative">
                  <input 
                    id="signup-confirm-password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Ulangi Kata Sandi" 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'} focus:border-[#004A7C] outline-none transition-all text-sm pr-10`} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004A7C]"
                    aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi sandi' : 'Tampilkan konfirmasi sandi'}
                  >
                    {showConfirmPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.confirmPassword}</p>}
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-4"
            >
              Daftar
            </Button>
          </form>

          <p className="text-center mt-6 text-slate-600 text-[13px] font-normal">
            Sudah punya akun? <Link to="/signin" className="text-[#004A7C] font-medium hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
