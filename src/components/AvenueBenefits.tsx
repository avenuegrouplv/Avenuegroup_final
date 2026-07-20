import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import homepageData from '../data/content/homepage.json';

export const AvenueBenefits: React.FC = () => {
  const { language } = useLanguage();
  const content = homepageData.benefits;
  const q1Content = content.q1.translations[language] || content.q1.translations['lv'];
  const q2Content = content.q2.translations[language] || content.q2.translations['lv'];
  
  return (
    <section className="bg-[#e5e5e5] border-b border-zinc-200 py-12 md:py-16 overflow-hidden relative">

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="w-72 h-[1.5px] bg-yellow-500 mb-10"></div>
        <div className="grid grid-cols-1 gap-10 lg:gap-12">
          {/* Question 1 */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black italic leading-[1.1] tracking-tighter text-zinc-950 uppercase">
              {q1Content.title} <br />
              <span className="text-yellow-600">{q1Content.subtitle}</span>
            </h2>
            <ul className="space-y-4">
              {(q1Content.items || []).map((item: any, index: number) => (
                <li key={index} className="flex items-start gap-4 group">
                  <CheckCircle2 className="text-yellow-600 shrink-0 mt-1" size={20} />
                  <div>
                    <span className="text-zinc-900 text-sm md:text-base font-black italic block mb-1">{item.title}</span>
                    <span className="text-zinc-650 text-xs md:text-sm leading-relaxed italic font-medium">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-72 h-[1.5px] bg-yellow-500"></div>

          {/* Question 2 */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black italic leading-[1.1] tracking-tighter text-zinc-950 uppercase">
              {q2Content.title}<span className="text-yellow-600">{q2Content.subtitle}</span>{q2Content.suffix} <br />
              {q2Content.suffix2}
            </h2>
            <div className="space-y-4">
              <p className="text-zinc-650 text-sm md:text-base leading-relaxed italic">{q2Content.desc}</p>
              <p className="text-zinc-900 text-sm md:text-base font-extrabold italic">{q2Content.listPrefix}</p>
              <ul className="space-y-4">
                {(q2Content.items || []).map((item: any, index: number) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <CheckCircle2 className="text-yellow-600 shrink-0 mt-1" size={20} />
                    <div>
                      <span className="text-zinc-900 text-sm md:text-base font-black italic block mb-1">{item.title}</span>
                      <span className="text-zinc-650 text-xs md:text-sm leading-relaxed italic font-medium">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
