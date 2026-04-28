import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { IconUserCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const EditProfilPage = () => {
  const navigate = useNavigate();

  const handleSave = (e) => {
    e.preventDefault();
    navigate('/profil');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Card Container */}
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Header Profil (Biru Muda) */}
            <div className="bg-[#E0F2FE]/40 p-8 flex items-center gap-5 border-b border-slate-100">
              <div className="bg-white p-1 rounded-full shadow-sm">
                <IconUserCircle size={80} className="text-[#004A7C]" stroke={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#004A7C]">Nama User</h2>
                <p className="text-slate-500 font-medium">user@email.com</p>
              </div>
            </div>

            {/* Area Form */}
            <div className="p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
              
              <div className="space-y-5">
                {/* Input Nama Lengkap */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <input 
                    type="text" 
                    defaultValue="Nama Lengkap User"
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#004A7C] focus:border-transparent outline-none font-regular text-slate-800 transition-all"
                  />
                </div>

                {/* Input Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input 
                    type="email" 
                    defaultValue="user@email.com"
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#004A7C] focus:border-transparent outline-none font-regular text-slate-800 transition-all"
                  />
                </div>

                {/* Input Nomor Telepon */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nomor Telepon</label>
                  <input 
                    type="text" 
                    defaultValue="628123456789"
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#004A7C] focus:border-transparent outline-none font-regular text-slate-800 transition-all"
                  />
                </div>

                {/* Input Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea 
                    rows="5"
                    defaultValue="Mahasiswa yang minat dalam bidang AI Engineer"
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#004A7C] focus:border-transparent outline-none font-regular text-slate-800 resize-none transition-all"
                  ></textarea>
                </div>
              </div>

              {/* Tombol Batal & Simpan */}
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
                  className="flex-1 py-3.5 rounded-full bg-[#004A7C] text-white font-medium hover:bg-[#00365d] transition-all shadow-md text-sm"
                >
                  Simpan Perubahan
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