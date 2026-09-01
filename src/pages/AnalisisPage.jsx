import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  IconInfoCircle, 
  IconBolt, 
  IconX, 
  IconPlus, 
  IconCertificate, 
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconBrain,
  IconHeart,
  IconTarget,
  IconChevronDown
} from '@tabler/icons-react';

const MASTER_SKILLS = [
  // Programming & Scripting Languages
  "JavaScript", "TypeScript", "Python", "Go (Golang)", "Java", "PHP", "Ruby", "Rust", "C++", "C#", "Kotlin", "Swift", "Dart", "R", "Scala", "Shell Scripting",
  // Front-End Frameworks & Tech
  "React.js", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Tailwind CSS", "Bootstrap", "HTML5 & CSS3", "SASS/SCSS", "Redux Toolkit", "GraphQL",
  // Back-End Frameworks & Tech
  "Node.js", "Express.js", "NestJS", "Laravel", "Symfony", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET Core", "Ruby on Rails", "Fiber",
  // Mobile Development
  "Flutter", "React Native", "Android Studio", "SwiftUI", "Jetpack Compose",
  // Database & Caching
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "MariaDB", "Oracle Database", "Microsoft SQL Server", "Firebase Realtime Database", "Cassandra",
  // Cloud, DevOps & Infrastructure
  "Docker", "Kubernetes", "AWS (Amazon Web Services)", "Google Cloud Platform (GCP)", "Microsoft Azure", "CI/CD (GitHub Actions/GitLab)", "Jenkins", "Terraform", "Nginx", "Linux Server Administration", "Git & GitHub",
  // AI, Data Science & Analytics
  "Machine Learning", "Deep Learning", "Artificial Intelligence (AI)", "Data Analytics", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "OpenCV", "Tableau", "Power BI", "Apache Spark", "Hadoop", "Natural Language Processing (NLP)",
  // Cyber Security & Networking
  "Penetration Testing", "Vulnerability Assessment", "Ethical Hacking", "Network Security", "Cisco Networking", "Wireshark", "SIEM", "Firewall Configuration",
  // UI/UX & Product Management
  "Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Product Roadmap", "Agile/Scrum Methodology", "Jira", "Trello",
  // Quality Assurance & Testing
  "Manual Testing", "Automation Testing", "Selenium", "Cypress", "Appium", "Postman API Testing", "Jest"
];

const MASTER_INTERESTS = [
  "Software Engineering",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Big Data",
  "Cyber Security & Digital Forensics",
  "Cloud Computing & DevOps",
  "UI/UX Research & Design",
  "Mobile Application Development",
  "Game Development",
  "Internet of Things (IoT) & Embedded System",
  "Product Management",
  "IT Quality Assurance & Software Testing",
  "Blockchain & Web3",
  "E-Commerce & Digital Business",
  "IT Infrastructure & Network Engineering",
  "Business Intelligence & Analytics"
];

const MASTER_ROLES = [
  { id: "", label: "Rekomendasikan yang cocok (Kosongkan)" },
  { id: "front end developer", label: "Front-End Developer" },
  { id: "back end developer", label: "Back-End Developer" },
  { id: "data scientist", label: "Data Scientist" },
  { id: "data analyst", label: "Data Analyst" },
  { id: "ai engineer", label: "AI Engineer" },
  { id: "machine learning engineer", label: "Machine Learning Engineer" }
];

const MASTER_LOCATIONS = [
  "Remote (Kerja dari Rumah)",
  "Jabodetabek",
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Barat",
  "Jakarta Utara",
  "Jakarta Timur",
  "Bandung",
  "Surabaya",
  "Gresik",
  "Yogyakarta",
  "Semarang",
  "Malang",
  "Surakarta",
  "Medan",
  "Palembang",
  "Pekanbaru",
  "Batam",
  "Bandar Lampung",
  "Makassar",
  "Manado",
  "Denpasar",
  "Balikpapan",
  "Samarinda",
  "Banjarmasin",
  "Pontianak",
  "Serang",
  "Cilegon",
  "Bogor",
  "Depok",
  "Bekasi",
  "Tangerang",
  "Cirebon",
  "Sukabumi",
  "Tasikmalaya",
  "Cimahi",
  "Purwokerto",
  "Tegal",
  "Pekalongan",
  "Magelang",
  "Salatiga",
  "Kediri",
  "Madiun",
  "Blitar",
  "Pasuruan",
  "Probolinggo",
  "Kota Batu",
  "Singaraja",
  "Banda Aceh",
  "Sabang",
  "Binjai",
  "Pematangsiantar",
  "Sibolga",
  "Padang",
  "Bukittinggi",
  "Payakumbuh",
  "Dumai",
  "Tanjungpinang",
  "Jambi",
  "Sungai Penuh",
  "Bengkulu",
  "Lubuklinggau",
  "Prabumulih",
  "Pagar Alam",
  "Pangkalpinang",
  "Metro",
  "Palopo",
  "Parepare",
  "Kendari",
  "Bau-Bau",
  "Palu",
  "Gorontalo",
  "Bitung",
  "Tomohon",
  "Kotamobagu",
  "Mamuju",
  "Singkawang",
  "Palangkaraya",
  "Banjarbaru",
  "Bontang",
  "Tarakan",
  "Mataram",
  "Bima",
  "Kupang",
  "Ambon",
  "Tual",
  "Ternate",
  "Tidore Kepulauan",
  "Jayapura",
  "Sorong",
  "Manokwari",
  "Merauke",
  "Nabire",
  "Wamena"
];

const MASTER_EDUCATION = [
  { id: "sma", label: "SMA/SMK" },
  { id: "d3", label: "Diploma (D3/D4)" },
  { id: "s1", label: "Sarjana (S1)" },
  { id: "s1_non_it", label: "Sarjana Non-IT" },
  { id: "s2", label: "Magister (S2)" },
  { id: "s3", label: "Doktor (S3)" },
  { id: "none", label: "Bootcamp / Otodidak" }
];

const MultiSelectContainer = ({ 
  label, placeholder, items, selectedItems, inputValue, setInputValue, 
  showDropdown, setShowDropdown, onAdd, onRemove, type, containerRef, required = true, icon: Icon 
}) => {
  const safeItems = Array.isArray(items) ? items : [];
  const fieldId = `${type}-combobox`;
  const listboxId = `${type}-listbox`;
  
  const filteredItems = safeItems.filter(i => {
    const itemString = typeof i === 'string' ? i : (i.label || i.name || '');
    const isMatched = itemString.toLowerCase().includes(inputValue.toLowerCase());
    
    const isAlreadySelected = selectedItems.some(selected => {
      const selectedName = typeof selected === 'string' ? selected : selected.name;
      return selectedName.toLowerCase() === itemString.toLowerCase();
    });

    return isMatched && !isAlreadySelected;
  });

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
        {Icon && <Icon size={18} className="text-slate-600" />}
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </label>
      
      <div 
        onClick={() => setShowDropdown(true)}
        className="w-full p-2.5 min-h-[52px] bg-white rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-[#004A7C] flex flex-wrap gap-2 cursor-text transition-all"
      >
        {selectedItems.map((item) => {
          const itemName = typeof item === 'string' ? item : item.name;
          return (
            <div key={itemName} className="flex items-center gap-2 bg-sky-50 text-[#004A7C] pl-3 pr-2 py-1 rounded-full text-[11px] font-bold border border-sky-100">
              <span>{itemName}</span>
              {type === 'skill' && (
                <select 
                  className="bg-white border border-sky-200 text-[10px] rounded px-1 py-0.5 outline-none text-slate-600 cursor-pointer"
                  value={item.level || 'Basic'}
                  onChange={(e) => onAdd({ ...item, level: e.target.value }, 'update_skill')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              )}
              <button
                type="button"
                aria-label={`Hapus ${itemName}`}
                onClick={(e) => { e.stopPropagation(); onRemove(item, type); }}
                className="rounded-full p-0.5 text-[#004A7C] hover:text-red-500"
              >
                <IconX size={14} className="hover:text-red-500 transition-colors" />
              </button>
            </div>
          );
        })}
        <input
          id={fieldId}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-required={required}
          className="flex-grow outline-none text-sm p-1 min-w-[120px] bg-transparent"
          placeholder={selectedItems.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!showDropdown) setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowDropdown(false);
              return;
            }
            if (e.key === 'Enter' && showDropdown) {
              e.preventDefault();
              const nextItem = filteredItems[0];
              if (nextItem) {
                const itemValue = typeof nextItem === 'string' ? nextItem : (nextItem.label || nextItem.name);
                onAdd(type === 'skill' ? { name: itemValue, level: 'Basic' } : itemValue, type);
              } else if (inputValue.trim()) {
                onAdd(type === 'skill' ? { name: inputValue.trim(), level: 'Basic' } : inputValue.trim(), type);
              }
            }
          }}
        />
      </div>

      {showDropdown && (
        <div id={listboxId} role="listbox" className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto p-2 scrollbar-thin">
          {filteredItems.map(item => {
            const itemValue = typeof item === 'string' ? item : (item.label || item.name);
            return (
              <button
                type="button"
                role="option"
                aria-selected="false"
                key={itemValue}
                onClick={() => onAdd(type === 'skill' ? { name: itemValue, level: 'Basic' } : itemValue, type)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-700 transition-colors"
              >
                {itemValue}
              </button>
            );
          })}
          {filteredItems.length === 0 && !inputValue && (
            <div className="px-4 py-2 text-xs text-slate-400 italic">Tidak ada data ditemukan</div>
          )}
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

const SearchableSelect = ({ label, placeholder, items, value, onChange, icon: Icon, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const fieldId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-select`;
  const listboxId = `${fieldId}-listbox`;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filtered = items.filter(item => {
    const text = typeof item === 'string' ? item : item.label;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const selectedLabel = items.find(item => {
    const val = typeof item === 'string' ? item : item.id;
    return val === value;
  });
  
  const displayValue = selectedLabel ? (typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label) : "";

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label id={`${fieldId}-label`} className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
        {Icon && <Icon size={18} className="text-slate-600" />}
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(true);
          }
          if (event.key === 'Escape') setIsOpen(false);
        }}
        aria-labelledby={`${fieldId}-label`}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className="w-full p-4 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] flex items-center justify-between cursor-pointer shadow-sm transition-all text-sm"
      >
        <span className={displayValue ? "text-slate-800" : "text-slate-400"}>
          {displayValue || placeholder}
        </span>
        <IconChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-2">
          <input 
            type="text"
            placeholder="Cari..."
            aria-label={`Cari ${label}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#004A7C]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
              if (e.key === 'Enter' && filtered[0]) {
                e.preventDefault();
                const itemVal = typeof filtered[0] === 'string' ? filtered[0] : filtered[0].id;
                onChange(itemVal);
                setIsOpen(false);
                setSearch("");
              }
            }}
          />
          <div id={listboxId} role="listbox" className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filtered.map((item) => {
              const itemVal = typeof item === 'string' ? item : item.id;
              const itemLbl = typeof item === 'string' ? item : item.label;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={value === itemVal}
                  key={itemVal}
                  onClick={() => {
                    onChange(itemVal);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${value === itemVal ? 'bg-sky-50 text-[#004A7C] font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  {itemLbl}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-2 text-xs text-slate-400 italic text-center">Data tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const parseExperienceYears = (text) => {
  const matches = [...String(text || '').matchAll(/(\d+(?:[.,]\d+)?)\s*(tahun|year|years|yr|yrs|bulan|month|months)/gi)];
  if (!matches.length) return 0;

  const totalYears = matches.reduce((sum, match) => {
    const value = Number(String(match[1]).replace(',', '.'));
    if (!Number.isFinite(value)) return sum;
    const unit = match[2].toLowerCase();
    return sum + (unit === 'bulan' || unit.startsWith('month') ? value / 12 : value);
  }, 0);

  return Math.round(totalYears * 100) / 100;
};

const AnalisisPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [availableSkills] = useState(MASTER_SKILLS);
  const [availableEducation] = useState(MASTER_EDUCATION);
  const [availableRoles] = useState(MASTER_ROLES);
  const [availableLocations] = useState(MASTER_LOCATIONS);
  const [availableInterests] = useState(MASTER_INTERESTS);

  const [formData, setFormData] = useState({ 
    pendidikan_terakhir: '', 
    experience_years: '',
    pengalaman_text: '', 
    target_role: '', 
    preferred_location: '', 
    sertifikasi: [],
    use_genai: false
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
    const handleClickOutside = (e) => {
      if (skillRef.current && !skillRef.current.contains(e.target)) setShowSkillDots(false);
      if (interestRef.current && !interestRef.current.contains(e.target)) setShowInterestDots(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = (item, type) => {
    if (type === 'skill') {
      if (!selectedSkills.find(s => s.name.toLowerCase() === item.name.toLowerCase())) {
        setSelectedSkills([...selectedSkills, item]);
      }
      setSkillInput("");
      setShowSkillDots(false);
    } else if (type === 'update_skill') {
      setSelectedSkills(selectedSkills.map(s => s.name === item.name ? item : s));
    } else if (type === 'interest') {
      const itemString = typeof item === 'string' ? item : (item.label || item.name);
      if (!selectedInterests.some(i => i.toLowerCase() === itemString.toLowerCase())) {
        setSelectedInterests([...selectedInterests, itemString]);
      }
      setInterestInput("");
      setShowInterestDots(false);
    }
  };

  const removeItem = (item, type) => {
    if (type === 'skill') {
      setSelectedSkills(selectedSkills.filter(i => i.name !== item.name));
    } else {
      setSelectedInterests(selectedInterests.filter(i => i !== item));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (selectedSkills.length === 0) {
      setFormError("Tambahkan minimal satu skill agar sistem bisa menghitung kesiapan karier.");
      skillRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const manualYears = Number(formData.experience_years);
      const calculatedYears =
        formData.experience_years !== '' && Number.isFinite(manualYears)
          ? manualYears
          : parseExperienceYears(formData.pengalaman_text);

      const payload = {
        education_level: formData.pendidikan_terakhir, 
        skills: selectedSkills.map((skill) => ({
          name: skill.name,
          level: skill.level || 'Basic'
        })),
        interests: selectedInterests,
        experience_text: formData.pengalaman_text,
        experience_years: calculatedYears,
        certifications: formData.sertifikasi,
        target_role: formData.target_role,
        preferred_location: formData.preferred_location,
        top_k: 5,
        use_genai: Boolean(formData.use_genai)
      };

      const response = await api.post('/analysis/career-match', payload);
      navigate('/analisis/hasil', { state: { data: response.data.data } }); 
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/signin', { state: { message: 'Sesi Anda berakhir. Silakan masuk kembali.' } });
      } else {
        setFormError(error.response?.data?.message || "Gagal melakukan analisis. Periksa input Anda lalu coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 px-6">
        <Card className="max-w-4xl mx-auto p-8 md:p-12 rounded-[2.5rem]">

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#004A7C] mb-2">Analisis Kesiapan Karier</h1>
            <p className="text-slate-500 text-sm md:text-base">Lengkapi data untuk mendapatkan estimasi kesiapan dan roadmap pengembangan awal.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 mb-10 items-center">
            <div className="p-2 bg-white rounded-xl shadow-sm text-amber-600">
              <IconInfoCircle size={24} />
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              <span className="font-bold text-amber-700">Agar hasil lebih relevan:</span> Isi skill, level, durasi pengalaman, dan contoh proyek sejujur mungkin. Jika ada skill penting, sebutkan juga di narasi pengalaman agar sistem punya konteks yang cukup.
            </p>
          </div>

          {formError && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">Profil Dasar</h2>
              <p className="text-xs text-slate-500 mt-1">Data ini menjadi konteks awal sebelum skill dan pengalaman dibandingkan dengan katalog role.</p>
            </div>

            {/* Pendidikan Terakhir */}
            <div className="space-y-2">
              <label htmlFor="education-level" className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <IconSchool size={18} className="text-slate-600" />
                <span>Pendidikan Terakhir <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <select 
                  id="education-level"
                  required 
                  value={formData.pendidikan_terakhir}
                  onChange={(e) => setFormData({...formData, pendidikan_terakhir: e.target.value})}
                  className={`w-full p-4 pr-12 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm cursor-pointer appearance-none transition-all ${
                    formData.pendidikan_terakhir ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  <option value="" disabled hidden className="text-slate-400">Pilih Jenjang</option>
                  {availableEducation.map((edu) => {
                    const val = edu.id || edu;
                    const lbl = edu.label || edu;
                    return (
                      <option key={val} value={val} className="text-slate-800 bg-white">
                        {lbl}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-3 pt-2">
              <h2 className="text-base font-bold text-slate-800">Skill & Pengalaman</h2>
              <p className="text-xs text-slate-500 mt-1">Tambahkan skill utama, levelnya, dan pengalaman nyata yang mendukung klaim tersebut.</p>
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
              icon={IconBrain}
            />

            {/* Minat */}
            <MultiSelectContainer 
              label="Bidang Minat"
              placeholder="Ketik minat Anda..."
              items={availableInterests}
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
              icon={IconHeart}
            />

            {/* Pengalaman */}
            <div className="space-y-4 pt-2">
              <label htmlFor="experience-text" className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <IconBriefcase size={18} className="text-slate-600" />
                <span>Riwayat Pengalaman Kerja / Proyek <span className="text-red-500">*</span></span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                <div className="space-y-2">
                  <label htmlFor="experience-years" className="block text-xs font-semibold text-slate-600">
                    Total Tahun Pengalaman
                  </label>
                  <input
                    id="experience-years"
                    type="number"
                    min="0"
                    max="60"
                    step="0.1"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    placeholder="Contoh: 1.5"
                    className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-[12px] text-slate-600 leading-relaxed flex items-start gap-2">
                  <IconInfoCircle size={18} className="text-[#004A7C] shrink-0 mt-0.5" />
                  <p>
                    Angka tahun dipakai sebagai durasi utama. Narasi pengalaman tetap dibaca sebagai konteks proyek, role, dan skill pendukung.
                  </p>
                </div>
              </div>
              <textarea 
                id="experience-text"
                required
                value={formData.pengalaman_text}
                onChange={(e) => setFormData({...formData, pengalaman_text: e.target.value})}
                placeholder="Contoh: 2 tahun sebagai Frontend Developer di PT ABC memimpin 3 proyek React..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none min-h-[120px] text-sm resize-y shadow-sm placeholder:text-slate-400"
              />
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-[12px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-[#004A7C]">Petunjuk Input:</span> Jika angka tahun dikosongkan, sistem akan mencoba membaca durasi dari narasi pengalaman.
              </div>
            </div>

            {/* Sertifikasi */}
            <div className="space-y-3">
              <label htmlFor="certification-input" className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <IconCertificate size={18} className="text-slate-600" />
                <span>Sertifikasi</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input 
                    id="certification-input"
                    type="text"
                    placeholder="Contoh: AWS Certified"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#004A7C] outline-none text-sm"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => { if(certInput.trim()) { setFormData({...formData, sertifikasi: [...formData.sertifikasi, certInput.trim()]}); setCertInput(""); } }}
                  className="rounded-xl px-5"
                  aria-label="Tambah sertifikasi"
                >
                  <IconPlus size={24} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sertifikasi.map((cert, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-amber-100">
                    <IconCertificate size={14} /> {cert}
                    <button type="button" aria-label={`Hapus sertifikasi ${cert}`} onClick={() => setFormData({...formData, sertifikasi: formData.sertifikasi.filter((_, i) => i !== idx)})}>
                      <IconX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border-b border-slate-100 pb-3 pt-2">
              <h2 className="text-base font-bold text-slate-800">Preferensi Analisis</h2>
              <p className="text-xs text-slate-500 mt-1">Pilih target role atau lokasi jika Anda ingin analisis diarahkan ke kebutuhan tertentu.</p>
            </div>

            {/* Role & Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Role */}
              <SearchableSelect 
                label="Target Role yang Dituju"
                placeholder="Rekomendasikan yang cocok"
                items={availableRoles}
                value={formData.target_role}
                onChange={(val) => setFormData({...formData, target_role: val})}
                icon={IconTarget}
              />

              {/* Lokasi */}
              <SearchableSelect 
                label="Preferensi Lokasi"
                placeholder="Pilih Lokasi"
                items={availableLocations}
                value={formData.preferred_location}
                onChange={(val) => setFormData({...formData, preferred_location: val})}
                icon={IconMapPin}
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <IconBolt size={18} className="text-[#004A7C]" />
                  <h3 className="text-sm font-bold text-slate-800">Ringkasan GenAI</h3>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Aktifkan jika ingin hasil analisis menyertakan ringkasan naratif tambahan saat layanan tersedia.
                </p>
              </div>
              <button
                type="button"
                aria-pressed={formData.use_genai}
                onClick={() => setFormData({ ...formData, use_genai: !formData.use_genai })}
                className={`relative h-8 w-14 rounded-full border transition-colors shrink-0 ${
                  formData.use_genai ? 'bg-[#004A7C] border-[#004A7C]' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <span
                  className={`absolute left-0 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    formData.use_genai ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-10">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={loading}
                loading={loading}
                icon={IconBolt}
                className="flex-1"
              >
                Mulai Analisis
              </Button>
            </div>
          </form>
        </Card>
      </main>
      <Footer/>
    </div>
  );
};

export default AnalisisPage;
