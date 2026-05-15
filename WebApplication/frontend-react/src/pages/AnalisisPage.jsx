import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { IconInfoCircle, IconBolt, IconX, IconPlus } from '@tabler/icons-react';

const AnalisisPage = () => {
  const navigate = useNavigate();
  
  // Data statis
  const staticSkills = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "React", "Figma", "SQL"];
  const staticInterests = ["UI/UX Design", "Back-End Developer", "Data Analyst", "AI Engineer", "Product Manager"];

  // state untuk skill
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillDots, setShowSkillDots] = useState(false);
  const skillRef = useRef(null);

  // state untuk minat
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [showInterestDots, setShowInterestDots] = useState(false);
  const interestRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillRef.current && !skillRef.current.contains(event.target)) setShowSkillDots(false);
      if (interestRef.current && !interestRef.current.contains(event.target)) setShowInterestDots(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = (item, type) => {
    if (type === 'skill') {
      if (!selectedSkills.includes(item)) setSelectedSkills([...selectedSkills, item]);
      setSkillInput("");
      setShowSkillDots(false);
    } else {
      if (!selectedInterests.includes(item)) setSelectedInterests([...selectedInterests, item]);
      setInterestInput("");
      setShowInterestDots(false);
    }
  };

  const removeItem = (item, type) => {
    if (type === 'skill') {
      setSelectedSkills(selectedSkills.filter(i => i !== item));
    } else {
      setSelectedInterests(selectedInterests.filter(i => i !== item));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSkills.length === 0 || selectedInterests.length === 0) {
      alert("Mohon isi skill dan minat bakat minimal satu.");
      return;
    }
    navigate('/analisis/hasil');
  };

  // helper component untuk tag input
  const MultiSelectInput = ({ 
    label, 
    placeholder, 
    items, 
    selectedItems, 
    inputValue, 
    setInputValue, 
    showDropdown, 
    setShowDropdown, 
    onAdd, 
    onRemove, 
    type,
    containerRef 
  }) => {
    const filteredItems = items.filter(i => 
      i.toLowerCase().includes(inputValue.toLowerCase()) && !selectedItems.includes(i)
    );

    return (
      <div className="space-y-2 relative" ref={containerRef}>
        <label className="block text-sm font-medium text-slate-800">
          {label} <span className="text-red-500">*</span>
        </label>
        
        {/* input area / container for tags */}
        <div 
          onClick={() => setShowDropdown(true)}
          className="w-full p-2.5 min-h-[52px] bg-white rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 flex flex-wrap gap-2 cursor-text"
        >
          {selectedItems.map(item => (
            <span key={item} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100">
              {item}
              <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(item, type); }}>
                <IconX size={14} className="hover:text-red-500" />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="flex-grow outline-none text-sm p-1 min-w-[150px]"
            placeholder={selectedItems.length === 0 ? placeholder : ""}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setShowDropdown(true); }}
          />
        </div>

        {/* dropdown list */}
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredItems.map(item => (
              <div
                key={item}
                onClick={() => onAdd(item, type)}
                className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors"
              >
                {item}
              </div>
            ))}
            
            {/* fitur "Tambah Baru" jika tidak ditemukan */}
            {inputValue && !items.some(i => i.toLowerCase() === inputValue.toLowerCase()) && (
              <div className="p-4 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Tidak ditemukan "{inputValue}"</p>
                <button
                  type="button"
                  onClick={() => onAdd(inputValue, type)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-all"
                >
                  <IconPlus size={14} /> Tambah "{inputValue}"
                </button>
              </div>
            )}
          </div>
        )}
        <p className="text-[11px] text-slate-500 italic">Klik untuk memilih dari daftar atau ketik untuk menambahkan baru</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 md:p-12">
          
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-2">Analisis Kesiapan Karier</h1>
            <p className="text-slate-500 text-sm md:text-base">Lengkapi data berikut untuk mendapatkan analisis yang akurat.</p>
          </div>

          <div className="bg-[#E0F2FE]/50 border border-teal-100 rounded-2xl p-4 flex gap-3 mb-10">
            <IconInfoCircle className="text-[#004A7C] shrink-0" size={24} />
            <p className="text-[13px] text-slate-700 leading-relaxed">
              <span className="font-bold text-[#004A7C]">Tips:</span> Semakin lengkap data, semakin akurat hasil analisis AI.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pendidikan Terakhir */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">
                Pendidikan Terakhir <span className="text-red-500">*</span>
              </label>
              <select required className="w-full p-3.5 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-sm appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/271/271238.png')] bg-[length:12px] bg-[right_1.5rem_center] bg-no-repeat">
                <option value="">Pilih Pendidikan Terakhir</option>
                <option value="sma">SMA/SMK</option>
                <option value="d3">Diploma (D3)</option>
                <option value="s1">Sarjana (S1)</option>
              </select>
            </div>

            {/* kolom skill */}
            <MultiSelectInput 
              label="Skill yang Dikuasai"
              placeholder="Pilih atau ketik skill yang Anda kuasai..."
              items={staticSkills}
              selectedItems={selectedSkills}
              inputValue={skillInput}
              setInputValue={setSkillInput}
              showDropdown={showSkillDots}
              setShowDropdown={setShowSkillDots}
              onAdd={handleAddItem}
              onRemove={removeItem}
              type="skill"
              containerRef={skillRef}
            />

            {/* kolom minat */}
            <MultiSelectInput 
              label="Minat & Bakat"
              placeholder="Pilih bidang yang Anda minati..."
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
            />

            {/* pengalaman */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Pengalaman & Sertifikasi</label>
              <textarea 
                placeholder="Contoh: 2 tahun sebagai Junior Frontend Developer di PT XYZ, Sertifikasi AWS Cloud Practitioner..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] text-sm resize-none"
              ></textarea>
              <p className="text-[11px] text-slate-500 italic">Opsional - masukkan pengalaman kerja, project, atau sertifikasi.</p>
            </div>

            {/* target role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Target Role / Skill yang Dituju</label>
              <select className="w-full p-3.5 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/271/271238.png')] bg-[length:12px] bg-[right_1.5rem_center] bg-no-repeat">
                <option value="">Pilih target role (opsional)</option>
                <option value="fe">Front-End Developer</option>
                <option value="be">Back-End Developer</option>
                <option value="ds">Data Scientist</option>
                <option value="ae">AI Engineer</option>
              </select>
              <p className="text-[11px] text-slate-500 italic">Jika tidak diisi, AI akan merekomendasikan role terbaik.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button 
                type="button" 
                onClick={() => navigate('/')}
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
      <Footer/>
    </div>
  );
};

export default AnalisisPage;