import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { IconInfoCircle, IconBolt } from '@tabler/icons-react';

const AnalisisPage = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/analisis/hasil');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      {/* Konten Utama */}
      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 md:p-12">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-2">
              Analisis Kesiapan Karier
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Lengkapi data berikut untuk mendapatkan analisis kesiapan karier yang akurat dan roadmap pengembangan yang personal.
            </p>
          </div>

          {/* Info Box / Tips */}
          <div className="bg-[#E0F2FE]/50 border border-teal-100 rounded-2xl p-4 flex gap-3 mb-10">
            <IconInfoCircle className="text-[#004A7C] shrink-0" size={24} />
            <p className="text-[13px] text-slate-700 leading-relaxed">
              <span className="font-bold text-[#004A7C]">Tips:</span> Semakin lengkap dan detail data yang Anda berikan, semakin akurat hasil analisis AI. Proses ini hanya membutuhkan waktu beberapa detik.
            </p>
          </div>

          {/* Form Analisis - Tambahkan onSubmit */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pendidikan Terakhir */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">
                Pendidikan Terakhir <span className="text-red-500">*</span>
              </label>
              <select required className="w-full p-3.5 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-sm">
                <option value="">Pilih Pendidikan Terakhir</option>
                <option value="sma">SMA/SMK</option>
                <option value="d3">Diploma (D3)</option>
                <option value="s1">Sarjana (S1)</option>
              </select>
            </div>

            {/* Skill yang Dikuasai */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">
                Skill yang Dikuasai <span className="text-red-500">*</span>
              </label>
              <textarea 
                required
                placeholder="Contoh: JavaScript, Python, Figma, React, SQL, Git"
                className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm"
              ></textarea>
              <p className="text-[11px] text-slate-500 italic">Pisahkan dengan koma untuk setiap skill. Cantumkan semua skill teknis yang Anda kuasai.</p>
            </div>

            {/* Minat dan Bakat */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">
                Minat dan Bakat <span className="text-red-500">*</span>
              </label>
              <textarea 
                required
                placeholder="Contoh: UI/UX Design, Back-End Developer, Data Analyst, AI Engineer, Problem Solving, Designer"
                className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm"
              ></textarea>
              <p className="text-[11px] text-slate-500 italic">Jelaskan bidang atau area yang paling Anda minati dalam dunia IT.</p>
            </div>

            {/* Pengalaman dan Sertifikasi */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Pengalaman dan Sertifikasi</label>
              <textarea 
                placeholder="Contoh: 1 tahun sebagai junior front-end developer, sertifikasi AWS, project freelance website e-commerce"
                className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm"
              ></textarea>
              <p className="text-[11px] text-slate-500 italic">Opsional - masukkan pengalaman kerja, project, atau sertifikasi yang Anda miliki.</p>
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Target Skill/Role yang Dituju</label>
              <select className="w-full p-3.5 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-sm">
                <option value="">Pilih Target Role</option>
                <option value="fe">Front-End Developer</option>
                <option value="be">Back-End Developer</option>
                <option value="ds">Data Scientist</option>
                <option value="ae">AI Engineer</option>
              </select>
              <p className="text-[11px] text-slate-500 italic">Opsional - pilih jika Anda memiliki target role tertentu. Jika tidak, AI akan merekomendasikan role terbaik berdasarkan profil Anda.</p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button 
                type="button" 
                onClick={() => navigate('/')} // Kembali ke Beranda
                className="flex-1 py-3.5 rounded-full border border-[#004A7C] text-[#004A7C] font-medium hover:bg-slate-50 transition-all text-sm active:scale-95"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3.5 rounded-full bg-[#004A7C] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#00365d] transition-all shadow-md text-sm active:scale-95"
              >
                <IconBolt size={18} /> Analisis Sekarang
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalisisPage;