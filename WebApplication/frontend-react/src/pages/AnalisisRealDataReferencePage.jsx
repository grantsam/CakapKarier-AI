import { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import api from '../utils/api';
import {
  IconBolt,
  IconChartBar,
  IconCircleCheck,
  IconCircleCheckFilled,
  IconMap,
} from '@tabler/icons-react';

const initialForm = {
  education_level: 's1',
  skills: 'Python, SQL, Machine Learning, TensorFlow',
  interests: 'AI Engineer, Data Analyst, Problem Solving',
  experience_years: 1,
  experience_text: '1 tahun project machine learning untuk klasifikasi data dan dashboard analitik.',
  certifications: 'TensorFlow Developer',
  target_role: 'ai engineer',
  top_k: 5,
};

const roleLabels = {
  '': 'Rekomendasi AI',
  'front end developer': 'Front-End Developer',
  'back end developer': 'Back-End Developer',
  'data scientist': 'Data Scientist',
  'data analyst': 'Data Analyst',
  'ai engineer': 'AI Engineer',
  'machine learning engineer': 'Machine Learning Engineer',
};

const AnalisisRealDataReferencePage = () => {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const readinessWidth = useMemo(() => {
    const score = Number(result?.readiness_score || 0);
    return `${Math.max(0, Math.min(100, score))}%`;
  }, [result]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'top_k' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/analysis/career-match', form);
      setResult(response.data.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Analisis gagal diproses');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold text-teal-600 mb-2">Reference Page - Real API Contract</p>
              <h1 className="text-2xl font-bold text-[#004A7C]">Analisis Kesiapan Karier</h1>
              <p className="text-sm text-slate-500 mt-2">
                Halaman ini adalah acuan integrasi FE untuk memakai endpoint backend
                <span className="font-semibold"> /api/analysis/career-match</span>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Pendidikan Terakhir</label>
                <select
                  name="education_level"
                  value={form.education_level}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sma">SMA/SMK</option>
                  <option value="d3">Diploma (D3)</option>
                  <option value="s1">Sarjana (S1)</option>
                  <option value="s2">Magister (S2)</option>
                  <option value="s3">Doktor (S3)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Skill yang Dikuasai</label>
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 min-h-[96px] text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Minat dan Bakat</label>
                <textarea
                  name="interests"
                  value={form.interests}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 min-h-[96px] text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Pengalaman Relevan</label>
                <textarea
                  name="experience_text"
                  value={form.experience_text}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 min-h-[96px] text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">Tahun Pengalaman</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={form.experience_years}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">Sertifikasi</label>
                  <input
                    name="certifications"
                    value={form.certifications}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">Target Role</label>
                  <select
                    name="target_role"
                    value={form.target_role}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">Jumlah Match</label>
                  <input
                    name="top_k"
                    type="number"
                    min="1"
                    max="20"
                    value={form.top_k}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#004A7C] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#00365d] disabled:opacity-60"
              >
                <IconBolt size={18} />
                {isLoading ? 'Memproses Analisis' : 'Analisis dengan Real Backend'}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#004A7C] mb-1">Identitas Integrasi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 mt-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Frontend payload</p>
                  <p className="font-medium">Form Indonesia</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Backend endpoint</p>
                  <p className="font-medium">POST /api/analysis/career-match</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">AI endpoint</p>
                  <p className="font-medium">POST /predict/web</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Auth</p>
                  <p className="font-medium">Bearer token</p>
                </div>
              </div>
            </div>

            {result ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-slate-800">Skor Kesiapan</h3>
                      <IconChartBar className="text-teal-500" size={22} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-3xl font-extrabold text-teal-600">
                        {Math.round(result.readiness_score)}
                      </span>
                      <span className="text-slate-400 font-bold">/ 100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full" style={{ width: readinessWidth }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-3">{result.readiness_status}</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-slate-800">Skill Dikuasai</h3>
                      <IconCircleCheck className="text-teal-500" size={22} />
                    </div>
                    <p className="text-3xl font-extrabold text-teal-600">{result.mastered_skill_count}</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-slate-800">Skill Gap</h3>
                      <IconBolt className="text-red-500" size={22} />
                    </div>
                    <p className="text-3xl font-extrabold text-red-500">{result.skill_gap_count}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-bold text-[#004A7C] mb-4">Role dan Skill</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Prediksi role: <span className="font-semibold">{result.predicted_role}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.mastered_skills?.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs border border-teal-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-bold text-[#004A7C] mb-4">Skill Gap Analysis</h2>
                  <div className="space-y-3">
                    {result.skill_gap_analysis?.map((item) => (
                      <div key={item.name} className="rounded-xl border border-slate-100 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <IconMap className="text-[#004A7C]" size={20} />
                    <h2 className="font-bold text-[#004A7C]">Roadmap</h2>
                  </div>
                  <div className="space-y-5">
                    {result.roadmap?.map((phase) => (
                      <div key={phase.phase}>
                        <h3 className="font-medium text-sm text-slate-800 mb-2">{phase.phase}</h3>
                        <ul className="space-y-2">
                          {phase.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                              <IconCircleCheckFilled className="text-[#004A7C] shrink-0" size={16} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-sm text-slate-500">
                Submit form untuk melihat struktur real response dari backend dan AIEngine.
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalisisRealDataReferencePage;
