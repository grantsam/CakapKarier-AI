import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import bgLp from '../assets/bg_lp.jpg';
import logoImage from '../assets/logo_cakapkarierai.png';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage({ 
        type: 'success', 
        text: response.data?.message || 'Link pemulihan kata sandi telah dikirim ke Gmail Anda!' 
      });
      setEmail('');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Email tidak terdaftar atau server error.';
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

        <h2 className="text-3xl font-bold text-[#004A7C] mb-1 tracking-tight">Lupa Kata Sandi</h2>
        <p className="text-slate-500 mb-8 text-sm font-medium">Masukkan email untuk memperbarui kata sandi</p>

        {message.text && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold mb-5 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
            <input 
              type="email" 
              required
              placeholder="nama@domain.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#004A7C] focus:ring-1 focus:ring-[#004A7C] outline-none transition-all text-sm" 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-slate-400' : 'bg-[#004A7C]'} text-white py-3.5 rounded-full font-medium text-md mt-2 hover:bg-[#00365d] transition-all shadow-md active:scale-95`}
          >
            {loading ? 'Mengirim...' : 'Verifikasi Email'}
          </button>
        </form>

        <p className="text-center mt-10 text-slate-600 text-[13px] font-medium">
          Kembali <Link to="/signin" className="text-[#004A7C] font-reguler hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;