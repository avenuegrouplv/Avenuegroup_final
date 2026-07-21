import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import faqData from '../data/content/faq.json';

interface FAQPageProps {
  isPreview?: boolean;
}

export const FAQPage: React.FC<FAQPageProps> = ({ isPreview = false }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const content = faqData.translations[language] || faqData.translations['lv'];

  const faqs = content.items || [];

  React.useEffect(() => {
    if (!isPreview) {
      document.title = `${content.title} ${content.subtitle} | Avenue Group`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Biežāk uzdotie jautājumi par nekustamo īpašumu apsaimniekošanu, pārvaldību un juridisko atbalstu Avenue Group.');
      }
      window.scrollTo(0, 0);
    }

    return () => {
      if (!isPreview) {
        document.title = 'Avenue Group | Komercīpašumu un privātīpašumu apsaimniekošana';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', 'Avenue Group - nekustamo īpašumu apsaimniekošanas un pārvaldības pakalpojumi komercīpašumiem un privātīpašumiem Latvijā. Profesionāls juridiskais atbalsts un individuāla pieeja.');
        }
      }
    };
  }, [isPreview, content]);

  return (
    <section id="buj" className={`bg-[#ebebeb] border-y border-zinc-200 relative overflow-hidden ${isPreview ? 'py-12 md:py-16' : 'min-h-screen pb-16'}`}>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        {!isPreview && (
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            <span>{content.backBtn}</span>
          </button>
        )}

        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-zinc-950 uppercase leading-none">
            {content.title} <span className="text-yellow-600">{content.subtitle}</span>
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="border border-zinc-200 bg-white hover:border-yellow-500 transition-all duration-200 shadow-sm">
              <button 
                id={`faq-btn-${i}`}
                aria-expanded={openIndex === i}
                aria-controls={`faq-panel-${i}`}
                className="w-full flex justify-between items-center py-4 px-5 md:py-4.5 md:px-6 text-left transition-colors cursor-pointer group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="flex items-start flex-grow">
                  <span className="text-sm md:text-base font-black italic tracking-tighter pr-2 leading-tight text-zinc-950 group-hover:text-yellow-600 transition-colors">
                    {faq.q}
                  </span>
                </div>
                {openIndex === i ? (
                  <ChevronUp className="text-yellow-600 shrink-0 ml-4" size={20} />
                ) : (
                  <ChevronDown className="text-zinc-400 shrink-0 ml-4 group-hover:text-yellow-600 transition-colors" size={20} />
                )}
              </button>
              {openIndex === i && (
                <div 
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  className="pb-4 px-5 md:pb-5 md:px-6 pt-0 text-zinc-650 text-xs md:text-sm leading-relaxed border-t border-zinc-100 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  {Array.isArray(faq.a) ? (
                    <ul className="space-y-2 pt-4">
                      {faq.a.map((item: any, idx: number) => (
                        <li key={idx} className={typeof item === 'object' ? 'mb-2' : ''}>
                          {typeof item === 'string' ? (
                            <span>{item}</span>
                          ) : (
                            <div className="flex flex-col">
                              {item.title ? (
                                <>
                                  <span className="text-zinc-950 font-black italic mb-0.5">• {item.title}</span>
                                  <span className="text-zinc-650 pl-4">{item.desc}</span>
                                </>
                              ) : (
                                <span className="text-zinc-650">{item.desc}</span>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="pt-4 text-zinc-600">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {isPreview && (
          <div className="mt-10 text-center">
             <button 
              onClick={() => navigate('/buj')}
              className="group inline-flex items-center gap-3 bg-white border border-zinc-250 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 shadow-sm rounded-none mx-auto cursor-pointer"
            >
              <span>{content.viewAll}</span> <HelpCircle className="text-yellow-600 group-hover:text-yellow-400 transition-colors" size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
