import React from 'react';
import { Building2, Hammer, Gavel, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

export const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const icons = [
    <Building2 className="w-12 h-12 text-yellow-600" />,
    <Hammer className="w-12 h-12 text-yellow-600" />,
    <Gavel className="w-12 h-12 text-yellow-600" />,
    <ShieldCheck className="w-12 h-12 text-yellow-600" />
  ];

  const services = (t('services.items') as unknown as any[]).map((item, index) => ({
    ...item,
    icon: icons[index]
  }));

  return (
    <section id="pakalpojumi" className="py-12 md:py-16 bg-[#ebebeb] border-y border-zinc-200 relative overflow-hidden">

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center mb-10 gap-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-black italic mb-6 text-zinc-950 tracking-tighter uppercase leading-none">
              {t('services.title')} <span className="text-yellow-600">{t('services.subtitle')}</span>
            </h2>
            <p className="text-zinc-650 text-base md:text-lg leading-relaxed italic font-medium">
              {t('services.description')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s) => (
            <div 
              key={s.id} 
              className="bg-white border border-zinc-200 px-5 py-4.5 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
              onClick={() => {
                navigate(`/Pakalpojumi?id=${s.id}`);
              }}
            >
              <div className="mb-3 transform group-hover:-translate-y-1 transition-transform duration-300 flex justify-center scale-90">
                {s.icon}
              </div>
              <h3 className={`font-black mb-2.5 italic leading-none text-zinc-950 text-center w-full ${language === 'ru' ? 'text-base md:text-lg font-sans tracking-normal' : 'text-xs md:text-sm tracking-tighter'}`}>
                {s.title}
              </h3>
              <p className="text-zinc-600 text-xs leading-normal mb-3.5 flex-grow italic text-center">
                {s.desc}
              </p>
              <div 
                className="text-[10px] font-black tracking-widest text-zinc-950 flex items-center justify-center group-hover:text-yellow-600 transition-colors uppercase"
              >
                {t('services.learnMore')} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
