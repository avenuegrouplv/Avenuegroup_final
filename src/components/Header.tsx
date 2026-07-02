import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(offset > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isLangDropdownOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.lang-dropdown-container')) {
          setIsLangDropdownOpen(false);
        }
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isLangDropdownOpen]);

  // Ordered strictly as requested:
  // 1) home -> 2) services -> 3) templates -> 4) useful -> 5) faq -> 6) contact
  const navLinks = [
    { id: 'home', name: t('nav.home'), href: '/' },
    { id: 'services', name: t('nav.services'), href: '/pakalpojumi' },
    { id: 'templates', name: t('nav.templates'), href: '/ligumu-paraugi' },
    { id: 'useful', name: language === 'lv' ? 'Noderīgi' : language === 'en' ? 'Useful info' : 'Полезно', href: '/noderigi' },
    { id: 'faq', name: t('nav.faq'), href: '/buj' },
    { id: 'contact', name: t('nav.contact'), href: '/kontakti' },
  ];

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const currentPath = location.pathname;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#141414]/95 backdrop-blur-md border-b border-zinc-800 shadow-md py-1' 
          : 'bg-[#141414]/85 backdrop-blur-sm py-2'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-end items-center min-h-[90px] md:min-h-[110px] relative">
        <Link 
          to="/" 
          onClick={handleLinkClick}
          className="absolute left-4 md:left-[1.2cm] top-1/2 -translate-y-1/2"
        >
          <img
            src="https://pub-48235835e18a4f87b5cf7fb2a1bca3b5.r2.dev/Logo%20PNG2.webp"
            alt="Avenue Group Logo"
            loading="eager"
            fetchPriority="high"
            width={230}
            height={80}
            className="h-[65px] md:h-[80px] w-auto object-contain transition-transform"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Desktop Nav */}
        <nav 
          aria-label="Galvenā navigācija"
          className="hidden md:flex items-center space-x-6 lg:space-x-8 lg:mr-4 xl:mr-8"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.id} 
              to={link.href}
              onClick={handleLinkClick}
              className={`text-sm lg:text-base font-black uppercase tracking-tight transition-all duration-200 pb-1 border-b-2 ${
                currentPath === link.href
                  ? 'text-yellow-500 border-yellow-500'
                  : 'text-zinc-100 border-transparent hover:text-yellow-400 hover:border-yellow-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/kontakti" 
            onClick={handleLinkClick}
            className="bg-yellow-500 text-zinc-950 hover:bg-white hover:text-zinc-950 px-5 py-2.5 rounded-none font-black text-xs uppercase tracking-widest transition-colors shadow-sm"
          >
            {t('contact.contactBtn')}
          </Link>

          {/* Custom Language Dropdown on Far Right */}
          <div className="relative lang-dropdown-container ml-2">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              aria-expanded={isLangDropdownOpen}
              aria-haspopup="true"
              aria-label="Mainīt valodu / Change language"
              className="flex items-center space-x-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 text-sm font-bold uppercase hover:bg-zinc-850 hover:text-white transition-all cursor-pointer rounded-none"
            >
              <span className="text-base select-none">
                {language === 'lv' ? '🇱🇻' : language === 'en' ? '🇬🇧' : '🇷🇺'}
              </span>
              <span className="tracking-widest">
                {language === 'lv' ? 'LV' : language === 'en' ? 'ENG' : 'RUS'}
              </span>
              <svg 
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-[#18181b] border border-zinc-700 shadow-xl py-1 z-[110] animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => { setLanguage('lv'); setIsLangDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center space-x-3 cursor-pointer"
                >
                  <span className="text-base">🇱🇻</span>
                  <span>LV</span>
                </button>
                <button
                  onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center space-x-3 cursor-pointer"
                >
                  <span className="text-base">🇬🇧</span>
                  <span>ENG</span>
                </button>
                <button
                  onClick={() => { setLanguage('ru'); setIsLangDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center space-x-3 cursor-pointer"
                >
                  <span className="text-base">🇷🇺</span>
                  <span>RUS</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <button 
            className="text-white focus:outline-none" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Aizvērt izvēlni" : "Atvērt izvēlni"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          id="mobile-menu"
          role="region"
          aria-label="Mobilā izvēlne"
          className="md:hidden absolute top-full left-0 right-0 bg-[#141414] border-b border-zinc-800 shadow-xl p-6 flex flex-col space-y-4 items-end animate-in fade-in slide-in-from-top-4 duration-250"
        >
          {navLinks.map((link) => (
            <div key={link.id} className="w-full text-right">
              <Link 
                to={link.href}
                onClick={handleLinkClick}
                className={`text-base font-black uppercase tracking-tight transition-all duration-200 pb-1 border-b-2 inline-block ${
                  currentPath === link.href
                    ? 'text-yellow-500 border-yellow-500'
                    : 'text-zinc-100 border-transparent hover:text-yellow-500 hover:border-yellow-500'
                }`}
              >
                {link.name}
              </Link>
            </div>
          ))}
          <Link 
            to="/kontakti"
            onClick={handleLinkClick}
            className="w-full bg-yellow-500 text-zinc-950 px-8 py-3 rounded-none text-center font-black text-xs tracking-widest uppercase hover:bg-white transition-colors"
          >
            {t('contact.contactBtn')}
          </Link>
          
          {/* Mobile Language Switcher inside Menu */}
          <div className="flex items-center justify-around w-full pt-4 border-t border-zinc-800">
            <button 
              onClick={() => { setLanguage('lv'); setIsMenuOpen(false); }}
              className={`flex items-center space-x-2 text-sm font-bold transition-colors py-2 px-3 bg-zinc-900 border ${language === 'lv' ? 'text-yellow-500 border-yellow-500' : 'text-zinc-400 border-zinc-800 hover:text-white'}`}
            >
              <span>🇱🇻</span>
              <span>LV</span>
            </button>
            <button 
              onClick={() => { setLanguage('ru'); setIsMenuOpen(false); }}
              className={`flex items-center space-x-2 text-sm font-bold transition-colors py-2 px-3 bg-zinc-900 border ${language === 'ru' ? 'text-yellow-500 border-yellow-500' : 'text-zinc-400 border-zinc-800 hover:text-white'}`}
            >
              <span>🇷🇺</span>
              <span>RUS</span>
            </button>
            <button 
              onClick={() => { setLanguage('en'); setIsMenuOpen(false); }}
              className={`flex items-center space-x-2 text-sm font-bold transition-colors py-2 px-3 bg-zinc-900 border ${language === 'en' ? 'text-yellow-500 border-yellow-500' : 'text-zinc-400 border-zinc-800 hover:text-white'}`}
            >
              <span>🇬🇧</span>
              <span>ENG</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
