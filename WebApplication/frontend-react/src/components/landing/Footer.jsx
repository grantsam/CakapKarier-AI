import logoImage from '../../assets/logo_cakapkarierai.png';

const Footer = () => {
  return (
    <footer className="bg-[#E0F2FE]/50 pt-16 pb-8 font-poppins">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Kolom 1: Logo & Deskripsi */}
          <div className="space-y-4">
            
            {/* 2. Ganti div teks 'C' dengan img logo */}
            <div className="flex items-center gap-2.5">
              <img 
                src={logoImage} 
                alt="CakapKarier.AI Logo" 
                className="h-9 w-auto object-contain"
              />
            </div>
            
            <p className="text-slate-700 text-sm leading-relaxed max-w-xs">
              Platform analisis potensi diri untuk kesiapan karier berbasis AI sesuai kebutuhan industri.
            </p>
          </div>

          {/* Kolom 2: Produk */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#004A7C] text-lg">Produk</h4>
            <ul className="space-y-2 text-slate-700 text-sm font-medium">
              <li className="hover:text-[#004A7C] cursor-pointer transition-colors">Analisis Kesiapan Karier</li>
              <li className="hover:text-[#004A7C] cursor-pointer transition-colors">Tes Potensi Diri</li>
              <li className="hover:text-[#004A7C] cursor-pointer transition-colors">Roadmap Karier</li>
            </ul>
          </div>

          {/* Kolom 3: Perusahaan */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#004A7C] text-lg">Perusahaan</h4>
            <ul className="space-y-2 text-slate-700 text-sm font-medium">
              <li className="hover:text-[#004A7C] cursor-pointer transition-colors">Tentang Kami</li>
              <li className="hover:text-[#004A7C] cursor-pointer transition-colors">Kontak</li>
              <li className="hover:text-[#004A7C] cursor-pointer transition-colors">FAQ</li>
            </ul>
          </div>
        </div>

        {/* Garis Pemisah & Copyright */}
        <div className="border-t border-slate-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm font-medium flex items-center gap-1">
            <span className="text-lg">©</span> 2026 CakapKarier.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;