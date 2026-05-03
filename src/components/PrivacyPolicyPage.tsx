import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Helper to get sections based on language
  const sections = (t('privacy.sections') as any) || [];

  return (
    <div className="bg-black min-h-screen pt-12 pb-24 text-gray-300">
      <div className="container mx-auto px-6 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-yellow-400 font-bold tracking-widest text-xs mb-12 hover:text-white transition-colors font-sans"
        >
          <ArrowLeft size={18} className="mr-2" /> {t('useful.backBtn')}
        </button>

        <div className="mb-16">
          <div className="flex items-center space-x-4 text-yellow-400 mb-6">
            <Shield size={48} />
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">
              {t('privacy.title')}<br />
              <span className="text-white">{t('privacy.subtitle')}</span>
            </h1>
          </div>
          <p className="text-gray-500 font-bold italic text-sm">
            {t('privacy.lastUpdated')}
          </p>
        </div>

        <div className="space-y-12 leading-relaxed text-base">
          {Array.isArray(sections) && sections.map((section: any, index: number) => (
            <section key={index} className="space-y-4">
              <h2 className="text-xl font-black italic text-white border-l-4 border-yellow-400 pl-4">
                {section.title}
              </h2>
              <p>{section.content}</p>
            </section>
          ))}
          
          {!Array.isArray(sections) && (
             <section className="space-y-4">
               <p>Informācija drīzumā tiks papildināta.</p>
             </section>
          )}
        </div>
        
        <div className="mt-12 pt-12 border-t border-white/10 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 text-black px-8 py-3 font-bold hover:bg-white transition-colors"
          >
            {t('useful.closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
