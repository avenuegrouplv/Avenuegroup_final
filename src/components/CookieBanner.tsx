import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link, useLocation } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem('avenue_group_cookies_accepted_v2');
    const isHome = location.pathname === '/' || location.pathname === '/Sakums';
    
    // Only show if consent not given AND we are on the home page
    if (!consent && isHome) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleAccept = () => {
    localStorage.setItem('avenue_group_cookies_accepted_v2', 'true');
    setIsVisible(false);
    setTimeout(() => setIsRendered(false), 1000);
  };

  const handleReject = () => {
    localStorage.setItem('avenue_group_cookies_accepted_v2', 'false');
    setIsVisible(false);
    setTimeout(() => setIsRendered(false), 1000);
  };

  if (!isRendered) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[100] p-3 md:p-6 transition-all duration-1000 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <div className="container mx-auto max-w-[1080px]">
        <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start justify-between gap-6 md:gap-10 relative overflow-hidden">
          {/* Akcenta līnija */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-white transition-colors absolute top-4 right-4 md:top-6 md:right-6"
            aria-label="Aizvērt"
          >
            <X size={20} />
          </button>

          <div className="flex-1 pr-6 md:pr-12">
            <h4 className="text-white font-bold italic tracking-wide text-lg md:text-xl mb-4">{t('cookieBanner.title')}</h4>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
              {t('cookieBanner.description')} 
              {t('cookieBanner.policyLink') && (
                <Link 
                  to="/sikdatnes"
                  className="text-[#D4AF37] underline hover:text-white transition-colors ml-1 font-bold"
                >
                  {t('cookieBanner.policyLink')}
                </Link>
              )}
            </p>
          </div>

          <div className="flex flex-col space-y-2 w-full md:w-64 shrink-0 mt-4 md:mt-8 md:mr-8">
            <button 
              onClick={handleAccept}
              className="w-full border border-[#D4AF37] text-[#D4AF37] px-6 py-3 font-semibold tracking-wide text-sm hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              {t('cookieBanner.acceptBtn')}
            </button>
            <button 
              onClick={handleReject}
              className="w-full bg-[#1a1a1a] text-white px-6 py-3 font-semibold tracking-wide text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              {t('cookieBanner.rejectBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
