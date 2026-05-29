import { motion } from 'framer-motion';
import { IconChartBar, IconBolt, IconMap } from '@tabler/icons-react';
import { fadeInUp, staggerContainer } from '../../utils/motion';

const InsightCard = ({ icon, title, desc }) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="p-8 rounded-[2rem] border border-white/40 shadow-sm transition-all duration-500 flex flex-col items-start text-left group cursor-pointer hover:shadow-2xl hover:shadow-blue-900/10"
      style={{
        background: 'linear-gradient(180deg, rgba(79, 209, 197, 0.25) 0%, rgba(0, 74, 124, 0.25) 70%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="bg-[#004A7C] p-2.5 rounded-lg shadow-md mb-6 text-white group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-[#004A7C] mb-3 tracking-tight">
        {title}
      </h3>

      <p className="text-slate-900 text-[13px] leading-relaxed font-normal">
        {desc}
      </p>
    </motion.div>
  );
};

const InsightSection = () => {
  const insights = [
    {
      icon: <IconChartBar size={22} stroke={2.5} />,
      title: "Skor Kesiapan Kerja",
      desc: "Menghitung tingkat kesiapan kerja berdasarkan keterampilan, pengalaman, dan kesesuaian dengan kebutuhan industri."
    },
    {
      icon: <IconBolt size={22} stroke={2.5} />,
      title: "Analisis Skill Gap",
      desc: "Mengidentifikasi keterampilan yang belum dimiliki maupun masih perlu ditingkatkan agar sesuai dengan kebutuhan industri."
    },
    {
      icon: <IconMap size={22} stroke={2.5} />,
      title: "Roadmap Pengembangan",
      desc: "Menghasilkan langkah-langkah pengembangan diri yang konkret agar dapat menyesuaikan kebutuhan industri."
    }
  ];

  return (
    <section className="py-24 bg-transparent font-poppins relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] tracking-tight">
            Dapatkan Insight Karier yang Jelas dan Terarah
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {insights.map((item, index) => (
            <InsightCard
              key={index}
              icon={item.icon}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InsightSection;
