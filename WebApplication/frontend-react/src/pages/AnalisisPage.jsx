import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { 
  IconInfoCircle, 
  IconBolt, 
  IconX, 
  IconPlus, 
  IconCertificate, 
  IconMapPin
} from '@tabler/icons-react';

// Reusable MultiSelect Container
const MultiSelectContainer = ({ 
  label, placeholder, items, selectedItems, inputValue, setInputValue, 
  showDropdown, setShowDropdown, onAdd, onRemove, type, containerRef, required = true 
}) => {
  const safeItems = Array.isArray(items) ? items : [];
  
  const filteredItems = safeItems.filter(i => 
    i.toLowerCase().includes(inputValue.toLowerCase()) && 
    !selectedItems.some(selected => (typeof selected === 'string' ? selected : selected.name) === i)
  );

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="block text-sm font-semibold text-slate-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div 
        onClick={() => setShowDropdown(true)}
        className="w-full p-2.5 min-h-[52px] bg-white rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-[#004A7C] flex flex-wrap gap-2 cursor-text transition-all"
      >
        {selectedItems.map((item, index) => {
          const itemName = typeof item === 'string' ? item : item.name;
          return (
            <div key={index} className="flex items-center gap-2 bg-sky-50 text-[#004A7C] pl-3 pr-2 py-1 rounded-full text-[11px] font-bold border border-sky-100">
              <span>{itemName}</span>
              {type === 'skill' && (
                <select 
                  className="bg-white border border-sky-200 text-[10px] rounded px-1 py-0.5 outline-none text-slate-600 cursor-pointer"
                  value={item.level}
                  onChange={(e) => onAdd({ ...item, level: e.target.value }, 'update_skill')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(item, type); }}>
                <IconX size={14} className="hover:text-red-500 transition-colors" />
              </button>
            </div>
          );
        })}
        <input
          type="text"
          className="flex-grow outline-none text-sm p-1 min-w-[120px] bg-transparent"
          placeholder={selectedItems.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!showDropdown) setShowDropdown(true);
          }}
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
          {filteredItems.slice(0, 10).map(item => (
            <div
              key={item}
              onClick={() => onAdd(type === 'skill' ? { name: item, level: 'Basic' } : item, type)}
              className="px-4 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-700 transition-colors"
            >
              {item}
            </div>
          ))}
          {inputValue && (
            <button
              type="button"
              onClick={() => onAdd(type === 'skill' ? { name: inputValue, level: 'Basic' } : inputValue, type)}
              className="w-full text-left px-4 py-3 text-[#004A7C] font-bold text-sm bg-sky-50 rounded-lg flex items-center gap-2 mt-1"
            >
              <IconPlus size={16} /> Tambah "{inputValue}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const AnalisisPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [availableSkills, setAvailableSkills] = useState([]);
  const staticInterests = ["UI/UX Design", "Back-End Developer", "Data Analyst", "AI Engineer", "Mobile Developer"];

  // Inisialisasi state sesuai dengan kebutuhan payload Swagger
  const [formData, setFormData] = useState({ 
    pendidikan_terakhir: '', 
    pengalaman_text: '', 
    pengalaman_tahun: '', 
    target_role: '', 
    preferred_location: '', 
    sertifikasi: [] 
  });
  
  const [certInput, setCertInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillDots, setShowSkillDots] = useState(false);
  const skillRef = useRef(null);

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [showInterestDots, setShowInterestDots] = useState(false);
  const interestRef = useRef(null);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const res = await api.get('/analysis/skills'); 
        setAvailableSkills(res.data); 
      } catch {
        setAvailableSkills(["Python", "SQL", "Machine Learning", "TensorFlow", "React", "JavaScript"]);
      }
    };
    fetchDataset();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (skillRef.current && !skillRef.current.contains(e.target)) setShowSkillDots(false);
      if (interestRef.current && !interestRef.current.contains(e.target)) setShowInterestDots(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = (item, type) => {
    if (type === 'skill') {
      if (!selectedSkills.find(s => s.name === item.name)) setSelectedSkills([...selectedSkills, item]);
      setSkillInput("");
    } else if (type === 'update_skill') {
      setSelectedSkills(selectedSkills.map(s => s.name === item.name ? item : s));
    } else if (type === 'interest') {
      if (!selectedInterests.includes(item)) setSelectedInterests([...selectedInterests, item]);
      setInterestInput("");
    }
  };

  const removeItem = (item, type) => {
    if (type === 'skill') setSelectedSkills(selectedSkills.filter(i => i.name !== item.name));
    else setSelectedInterests(selectedInterests.filter(i => i !== item));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (selectedSkills.length === 0) return alert("Mohon isi skill minimal satu.");

  setLoading(true);
    try {
      const payload = {
        education_level: formData.pendidikan_terakhir,
        skills: selectedSkills.map(s => s.name),
        interests: selectedInterests,
        experience_text: formData.pengalaman_text,
        experience_years: Number(formData.pengalaman_tahun || 0),
        certifications: formData.sertifikasi,
        target_role: formData.target_role,
        preferred_location: formData.preferred_location,
        top_k: 5,
        use_genai: false
      };

      const response = await api.post('/analysis/career-match', payload);
    
      navigate('/analisis/hasil', { state: { data: response.data.data } }); 
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Sesi Anda berakhir. Silakan login kembali.");
        navigate('/login');
      } else {
        alert(error.response?.data?.message || "Gagal melakukan analisis.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12">
          
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-2">Analisis Kesiapan Karier</h1>
            <p className="text-slate-500 text-sm md:text-base">Lengkapi data untuk mendapatkan roadmap karier berbasis AI.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 mb-10 items-center">
            <div className="p-2 bg-white rounded-xl shadow-sm text-amber-600">
              <IconInfoCircle size={24} />
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              <span className="font-bold text-amber-700">Peringatan Akurasi:</span> Kualitas roadmap Anda bergantung pada kejujuran data. Masukan yang tidak akurat akan menghasilkan rekomendasi yang tidak relevan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pendidikan Terakhir */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Pendidikan Terakhir <span className="text-red-500">*</span>
              </label>
              <select 
                required 
                value={formData.pendidikan_terakhir}
                onChange={(e) => setFormData({...formData, pendidikan_terakhir: e.target.value})}
                className="w-full p-4 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm cursor-pointer appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/271/271238.png')] bg-[length:12px] bg-[right_1.5rem_center] bg-no-repeat"
              >
                <option value="">Pilih Jenjang</option>
                <option value="sma">SMA/SMK</option>
                <option value="d3">Diploma (D3)</option>
                <option value="s1">Sarjana (S1)</option>
                <option value="s2">Magister (S2)</option>
                <option value="s3">Doktor (S3)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Skill */}
            <MultiSelectContainer 
              label="Skill yang Dikuasai"
              placeholder="Cari skill (contoh: Python)..."
              items={availableSkills}
              selectedItems={selectedSkills}
              inputValue={skillInput}
              setInputValue={setSkillInput}
              showDropdown={showSkillDots}
              setShowDropdown={setShowSkillDots}
              onAdd={handleAddItem}
              onRemove={removeItem}
              type="skill"
              containerRef={skillRef}
              required={true}
            />

            {/* Minat */}
            <MultiSelectContainer 
              label="Bidang Minat"
              placeholder="Ketik minat Anda..."
              items={staticInterests}
              selectedItems={selectedInterests}
              inputValue={interestInput}
              setInputValue={setInterestInput}
              showDropdown={showInterestDots}
              setShowDropdown={setShowInterestDots}
              onAdd={handleAddItem}
              onRemove={removeItem}
              type="interest"
              containerRef={interestRef}
              required={false}
            />

            {/* Pengalaman */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
              <div className="md:col-span-1 space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Tahun Pengalaman <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  required min="0" placeholder="0"
                  value={formData.pengalaman_tahun}
                  onChange={(e) => setFormData({...formData, pengalaman_tahun: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm shadow-sm"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="block text-sm font-semibold text-slate-800">Pengalaman Relevan <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  value={formData.pengalaman_text}
                  onChange={(e) => setFormData({...formData, pengalaman_text: e.target.value})}
                  placeholder="Jelaskan peran Anda, perusahaan, atau proyek utama..."
                  className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none min-h-[100px] text-sm resize-y"
                ></textarea>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Jelaskan pengalaman kerja, proyek, atau organisasi yang benar-benar memakai skill terkait. Tahun pengalaman tidak otomatis berlaku untuk semua skill yang dicantumkan.
                </p>
              </div>
            </div>

            {/* Sertifikasi */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-800">Sertifikasi</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <IconCertificate className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Contoh: AWS Certified"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => { if(certInput) { setFormData({...formData, sertifikasi: [...formData.sertifikasi, certInput]}); setCertInput(""); } }}
                  className="px-5 bg-[#004A7C] text-white rounded-xl hover:bg-[#00365d] transition-all"
                >
                  <IconPlus size={24} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sertifikasi.map((cert, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-amber-100">
                    <IconCertificate size={14} /> {cert}
                    <button type="button" onClick={() => setFormData({...formData, sertifikasi: formData.sertifikasi.filter((_, i) => i !== idx)})}>
                      <IconX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Role & Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">Target Role yang Dituju</label>
                <select 
                  value={formData.target_role}
                  onChange={(e) => setFormData({...formData, target_role: e.target.value})}
                  className="w-full p-4 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm cursor-pointer appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/271/271238.png')] bg-[length:12px] bg-[right_1.5rem_center] bg-no-repeat"
                >
                  <option value="">Rekomendasikan yang cocok</option>
                  <option value="ae">AI Engineer</option>
                  <option value="ds">Data Scientist</option>
                  <option value="fe">Front-End Developer</option>
                  <option value="be">Back-End Developer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <IconMapPin size={16} /> Preferensi Lokasi
                </label>
                <select 
                  value={formData.preferred_location}
                  onChange={(e) => setFormData({...formData, preferred_location: e.target.value})}
                  className="w-full p-4 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm cursor-pointer appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/271/271238.png')] bg-[length:12px] bg-[right_1.5rem_center] bg-no-repeat"
                >
                  <option value="">Pilih Lokasi</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-row gap-4 pt-10">
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="flex-1 py-4 rounded-[2rem] border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm active:scale-95"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-4 rounded-[2rem] bg-[#004A7C] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#00365d] transition-all shadow-lg text-sm active:scale-95 disabled:bg-slate-400"
              >
                {loading ? "Proses..." : <><IconBolt size={20} /> Mulai Analisis</>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default AnalisisPage;
