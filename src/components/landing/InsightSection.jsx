import { motion } from 'framer-motion';
import { IconChartBar, IconBolt, IconMap } from '@tabler/icons-react';
import { fadeInUp, staggerContainer } from '../../utils/motion';

const InsightCard = ({ icon, title, desc, bgStyle, iconBgStyle, iconColor }) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`p-8 rounded-3xl border border-white/60 shadow-sm transition-all duration-300 flex flex-col items-start text-left hover:shadow-xl hover:shadow-slate-200/50 ${bgStyle}`}
    >
      <div className={`p-3.5 rounded-2xl mb-6 shadow-sm flex items-center justify-center ${iconBgStyle} ${iconColor}`}>
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">
        {title}
      </h3>

      <p className="text-slate-600 text-sm leading-relaxed font-normal">
        {desc}
      </p>
    </motion.div>
  );
};

const InsightSection = () => {
  const insights = [
    {
      icon: <IconChartBar size={24} stroke={2.2} />,
      title: "Skor Kesiapan Kerja",
      desc: "Hitung tingkat kesiapan kerja berdasarkan skill, pengalaman, dan kesesuaian dengan kebutuhan industri.",
      bgStyle: "bg-gradient-to-b from-[#eef4ff] to-[#e0ebff]",
      iconBgStyle: "bg-[#3b82f6]",
      iconColor: "text-white"
    },
    {
      icon: <IconBolt size={24} stroke={2.2} />,
      title: "Analisis Skill Gap",
      desc: "Identifikasi keterampilan yang perlu ditingkatkan untuk menutup gap dengan karier impianmu.",
      bgStyle: "bg-gradient-to-b from-[#e6f8f6] to-[#d2f3ee]",
      iconBgStyle: "bg-[#2dd4bf]",
      iconColor: "text-white"
    },
    {
      icon: <IconMap size={24} stroke={2.2} />,
      title: "Roadmap Pengembangan",
      desc: "Dapatkan langkah konkret dan rekomendasi belajar yang sesuai kebutuhan industri terkini.",
      bgStyle: "bg-gradient-to-b from-[#fff6ed] to-[#ffebd8]",
      iconBgStyle: "bg-[#f59e0b]",
      iconColor: "text-white"
    }
  ];

  return (
    <section className="py-24 bg-transparent font-poppins relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-20 flex flex-col items-center"
        >
          <span className="text-xs font-bold tracking-widest text-[#004A7C] uppercase mb-3 px-4 py-1.5 bg-blue-50/80 rounded-full border border-blue-200/60 shadow-sm">
            FITUR UNGGULAN
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#004A7C] tracking-tight">
            Insight Karier yang Jelas dan Terarah
          </h2>
        </motion.div>

        {/* Grid Cards */}
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
              bgStyle={item.bgStyle}
              iconBgStyle={item.iconBgStyle}
              iconColor={item.iconColor}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InsightSection;