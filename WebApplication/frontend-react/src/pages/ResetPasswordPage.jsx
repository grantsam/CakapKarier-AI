import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import bgLp from '../assets/bg_lp.jpg';
import logoImage from '../assets/logo_cakapkarierai.png';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      return setMessage({ type: 'error', text: 'Kata sandi minimal harus 8 karakter' });
    }
    if (password !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Kata sandi verifikasi tidak cocok!' });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/reset-password', { token, password });
      setMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui! Mengalihkan...' });
      setTimeout(() => navigate('/signin'), 2500);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Token tidak valid atau telah kadaluarsa.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-poppins px-6"
      style={{ backgroundImage: `url(${bgLp})` }}
    >
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 md:p-14 max-w-lg w-full text-left">
        <div className="flex justify-start mb-8">
          <img src={logoImage} alt="Logo" className="h-7 w-auto" />
        </div>

        <h2 className="text-3xl font-bold text-[#004A7C] mb-1 tracking-tight">Perbarui Kata Sandi</h2>
        <p className="text-slate-500 mb-8 text-sm font-medium">Masukkan kata sandi baru akun Anda</p>

        {message.text && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold mb-5 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Minimal 8 Karakter" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#004A7C] focus:ring-1 focus:ring-[#004A7C] outline-none transition-all text-sm pr-10" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004A7C]"
              >
                {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="text-left">
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Verifikasi Kata Sandi</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Minimal 8 Karakter" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#004A7C] focus:ring-1 focus:ring-[#004A7C] outline-none transition-all text-sm pr-10" 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004A7C]"
              >
                {showConfirmPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-slate-400' : 'bg-[#004A7C]'} text-white py-3.5 rounded-full font-medium text-md mt-4 hover:bg-[#00365d] transition-all shadow-md active:scale-95`}
          >
            {loading ? 'Memproses...' : 'Ubah Kata Sandi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;