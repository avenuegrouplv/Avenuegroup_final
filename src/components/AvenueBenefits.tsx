import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export const AvenueBenefits: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="bg-[#1a1a1a] border-b border-white/5 pb-12 md:pb-24 pt-0 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="w-72 h-[1px] bg-yellow-400 mb-16 lg:mb-24"></div>
        <div className="grid grid-cols-1 gap-16 lg:gap-24">
          {/* Question 1 */}
          <div className="space-y-10">
            <h2 className="text-xl md:text-3xl font-black italic leading-[1.15] tracking-tighter">
              {t('benefits.q1.title')} <br />
              <span className="text-yellow-400">{t('benefits.q1.subtitle')}</span>
            </h2>
            <ul className="space-y-6">
              {(t('benefits.q1.items') as unknown as {title: string, desc: string}[]).map((item, index) => (
                <li key={index} className="flex items-start gap-4 group">
                  <CheckCircle2 className="text-yellow-400 shrink-0 mt-1" size={20} />
                  <div>
                    <span className="text-white text-base md:text-lg font-bold italic block mb-2">{item.title}</span>
                    <span className="text-gray-300 text-sm md:text-base leading-snug italic font-medium">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-72 h-[1px] bg-yellow-400"></div>

          {/* Question 2 */}
          <div className="space-y-10">
            <h2 className="text-xl md:text-3xl font-black italic leading-[1.15] tracking-tighter">
              {t('benefits.q2.title')}<span className="text-yellow-400">{t('benefits.q2.subtitle')}</span>{t('benefits.q2.suffix')} <br />
              {t('benefits.q2.suffix2')}
            </h2>
            <div className="space-y-6">
              <p className="text-gray-300 text-base md:text-lg leading-relaxed italic">{t('benefits.q2.desc')}</p>
              <p className="text-white font-bold italic">{t('benefits.q2.listPrefix')}</p>
              <ul className="space-y-6">
                {(t('benefits.q2.items') as unknown as {title: string, desc: string}[]).map((item, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <CheckCircle2 className="text-yellow-400 shrink-0 mt-1" size={20} />
                    <div>
                      <span className="text-white text-base md:text-lg font-bold italic block mb-2">{item.title}</span>
                      <span className="text-gray-300 text-sm md:text-base leading-snug italic font-medium">{item.desc}</span>
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
