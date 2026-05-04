import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useLanguage, translations } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

interface FAQPageProps {
  isPreview?: boolean;
}

export const FAQPage: React.FC<FAQPageProps> = ({ isPreview = false }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const faqs = translations[language].faq.items;

  React.useEffect(() => {
    if (!isPreview) {
      // SEO: Set page title and description
      document.title = `${t('faq.title')} ${t('faq.subtitle')} | Avenue Group`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Biežāk uzdotie jautājumi par nekustamo īpašumu apsaimniekošanu, pārvaldību un juridisko atbalstu Avenue Group.');
      }
      window.scrollTo(0, 0);
    }

    return () => {
      if (!isPreview) {
        document.title = 'Avenue Group | Premium Property Management';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', 'Avenue Group - nekustamo īpašumu apsaimniekošanas un pārvaldības pakalpojumi komercīpašumiem un privātīpašumiem Latvijā. Profesionāls juridiskais atbalsts un individuāla pieeja.');
        }
      }
    };
  }, [isPreview, t]);

  return (
    <section id="buj" className={`bg-black ${isPreview ? 'pt-8 pb-24' : 'min-h-screen pt-24 md:pt-32 pb-24'}`}>
      <div className="container mx-auto px-6 max-w-5xl">
        {!isPreview && (
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-yellow-400 font-bold tracking-widest text-xs mb-12 hover:text-white transition-colors font-sans"
          >
            <ArrowLeft size={18} className="mr-2" /> {t('faq.backBtn')}
          </button>
        )}

        <div className="mb-16 text-center">
          <h2 className="text-xl md:text-3xl font-black italic leading-[1.15] tracking-tighter mb-8">
            {t('faq.title')} <span className="text-yellow-400">{t('faq.subtitle')}</span>
          </h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="border border-white/10 bg-[#0a0a0a] group hover:border-white/20 transition-colors">
              <button 
                className="w-full flex justify-between items-center p-8 text-left transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="flex items-start flex-grow">
                  <span className="text-lg md:text-xl font-black italic tracking-tighter pr-2 leading-tight group-hover:text-yellow-400 transition-colors">
                    {faq.q}
                  </span>
                </div>
                {openIndex === i ? (
                  <ChevronUp className="text-yellow-400 shrink-0 ml-4" size={28} />
                ) : (
                  <ChevronDown className="text-gray-600 shrink-0 ml-4 group-hover:text-yellow-400 transition-colors" size={28} />
                )}
              </button>
              {openIndex === i && (
                <div className="p-8 pt-0 text-gray-400 text-base leading-relaxed border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                  {Array.isArray(faq.a) ? (
                    <ul className="space-y-4">
                      {faq.a.map((item: any, idx: number) => (
                        <li key={idx} className={typeof item === 'object' ? 'mb-4' : ''}>
                          {typeof item === 'string' ? (
                            <span>{item}</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-white font-bold italic mb-1">• {item.title}</span>
                              <span className="text-gray-400 pl-4">{item.desc}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{faq.a}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {isPreview && (
          <div className="mt-16 text-center">
             <button 
              onClick={() => navigate('/buj')}
              className="inline-flex items-center text-yellow-400 font-black tracking-widest hover:text-white transition-colors border-b-2 border-yellow-400 pb-1"
            >
              {t('faq.viewAll')} <HelpCircle className="ml-2" size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
