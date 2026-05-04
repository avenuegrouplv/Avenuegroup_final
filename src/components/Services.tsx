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
    <section id="pakalpojumi" className="pt-12 md:pt-24 pb-12 md:pb-24 bg-[#1a1a1a] border-y border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-xl md:text-3xl font-black italic leading-none mb-6 text-white tracking-tighter whitespace-nowrap">
              {t('services.title')} <span className="text-yellow-400">{t('services.subtitle')}</span>
            </h2>
            <p className="text-gray-400 text-base italic font-medium leading-relaxed">
              {t('services.description')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s) => (
            <div 
              key={s.id} 
              className="bg-zinc-800 border border-white/5 px-6 py-6 hover:border-yellow-400 hover:shadow-2xl hover:bg-zinc-700 transition-all duration-300 group flex flex-col h-full cursor-pointer relative overflow-hidden"
              onClick={() => {
                navigate(`/Pakalpojumi?id=${s.id}`);
              }}
            >
              <div className="mb-4 transform group-hover:-translate-y-1 transition-transform duration-300 relative z-10 flex justify-center">
                {s.icon}
              </div>
              <h3 className={`font-black mb-3 italic leading-none text-white relative z-10 text-center w-full ${language === 'ru' ? 'text-lg md:text-xl font-sans tracking-normal' : 'text-sm tracking-tighter'}`}>{s.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-grow relative z-10 italic text-center">
                {s.desc}
              </p>
              <div 
                className="text-sm font-bold text-yellow-400 flex items-center justify-center group-hover:text-white transition-colors relative z-10"
              >
                {t('services.learnMore')} <ArrowRight size={21} className="ml-3 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};