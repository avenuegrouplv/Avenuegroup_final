import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scroll } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import termsData from '../data/content/terms.json';

const TermsOfServicePage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const currentLang = (language === 'lv' || language === 'en' || language === 'ru') ? language : 'lv';
  const t_terms = termsData.translations[currentLang] || termsData.translations.lv;

  return (
    <div className="bg-[#ebebeb] min-h-screen pb-24 text-zinc-800 relative overflow-hidden">

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'lv' ? 'Atpakaļ' : 'Back'}</span>
        </button>

        <div className="mb-12">
          <div className="flex items-center space-x-3 text-yellow-600 mb-4 h-12">
            <Scroll size={36} />
            <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter text-zinc-950 uppercase leading-none">
              {t_terms.title}
            </h1>
          </div>
          <p className="text-zinc-400 text-xs italic font-semibold">{t_terms.lastUpdated}</p>
        </div>

        <div className="space-y-6 bg-white p-6 md:p-10 border border-zinc-200 shadow-sm">
          {t_terms.sections.map((section: any, idx: number) => (
            <div key={idx} className="space-y-3 pb-6 border-b border-zinc-100 last:border-none last:pb-0">
              <h2 className="text-base md:text-lg font-black italic text-zinc-950 uppercase tracking-tight">{section.title}</h2>
              <p className="text-zinc-650 text-sm md:text-base leading-relaxed italic">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-12 border-t border-zinc-200 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-zinc-950 text-white hover:bg-yellow-500 hover:text-zinc-950 px-8 py-3.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            {language === 'lv' ? 'Aizvērt' : language === 'en' ? 'Close' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
