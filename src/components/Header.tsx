import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', name: t('nav.home'), href: '/sakums' },
    { id: 'services', name: t('nav.services'), href: '/pakalpojumi' },
    { id: 'useful', name: t('useful.title'), href: '/noderigi' },
    { id: 'faq', name: t('nav.faq'), href: '/buj' },
    { id: 'contact', name: t('nav.contact'), href: '/kontakti' },
  ];

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const currentPath = location.pathname === '/' ? '/sakums' : location.pathname;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-end items-center min-h-[138.64px] md:min-h-[151.78px]">
        <Link 
          to="/" 
          onClick={handleLinkClick}
          className="absolute top-[0.4cm] left-0 md:left-[1.8cm]"
        >
          <img
            src="https://pub-48235835e18a4f87b5cf7fb2a1bca3b5.r2.dev/Logo%20PNG.png"
            alt="Avenue Group Logo"
            loading="eager"
            fetchPriority="high"
            className="h-[120px] md:h-[140px] w-auto object-contain transition-transform"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 lg:mr-24 xl:mr-32 relative -top-[5mm]">
          {/* Language Switcher */}
          <div className="flex items-center space-x-2 mr-4 border-r border-white/10 pr-4">
            <button 
              onClick={() => setLanguage('lv')}
              className={`text-sm font-space font-bold transition-colors ${language === 'lv' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              LV
            </button>
            <span className="text-gray-600 text-sm">|</span>
            <button 
              onClick={() => setLanguage('ru')}
              className={`text-sm font-space font-bold transition-colors ${language === 'ru' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              RUS
            </button>
            <span className="text-gray-600 text-sm">|</span>
            <button 
              onClick={() => setLanguage('en')}
              className={`text-sm font-space font-bold transition-colors ${language === 'en' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              ENG
            </button>
          </div>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              onClick={handleLinkClick}
              className={`text-base font-bold transition-all duration-200 pb-1 border-b-2 ${
                currentPath === link.href
                  ? 'text-yellow-400 border-yellow-400'
                  : 'text-white border-transparent hover:text-yellow-400 hover:border-yellow-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/kontakti" 
            onClick={handleLinkClick}
            className="bg-yellow-400 text-black px-6 py-2 rounded-none font-bold text-base hover:bg-zinc-800 hover:text-white transition-colors"
          >
            {t('contact.contactBtn')}
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-4 relative -top-[5mm]">
          <button className="text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col space-y-3 items-end animate-in fade-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <div key={link.name} className="w-full text-right">
              <Link 
                to={link.href}
                onClick={handleLinkClick}
                className={`text-lg font-bold transition-all duration-200 pb-1 border-b-2 inline-block ${
                  currentPath === link.href
                    ? 'text-yellow-400 border-yellow-400'
                    : 'text-white border-transparent hover:text-yellow-400 hover:border-yellow-400'
                }`}
              >
                {link.name}
              </Link>
            </div>
          ))}
          <Link 
            to="/kontakti"
            onClick={handleLinkClick}
            className="w-auto border-2 border-yellow-400 text-yellow-400 px-8 py-2 rounded-none text-center font-bold text-sm mb-4 hover:bg-yellow-400 hover:text-black transition-colors"
          >
            {t('contact.contactBtn')}
          </Link>
          
          {/* Mobile Language Switcher inside Menu */}
          <div className="flex items-center space-x-4 justify-center w-full pt-4 border-t border-white/10">
            <button 
              onClick={() => { setLanguage('lv'); setIsMenuOpen(false); }}
              className={`text-base font-space font-bold transition-colors ${language === 'lv' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              LV
            </button>
            <span className="text-gray-600 text-base">|</span>
            <button 
              onClick={() => { setLanguage('ru'); setIsMenuOpen(false); }}
              className={`text-base font-space font-bold transition-colors ${language === 'ru' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              RUS
            </button>
            <span className="text-gray-600 text-base">|</span>
            <button 
              onClick={() => { setLanguage('en'); setIsMenuOpen(false); }}
              className={`text-base font-space font-bold transition-colors ${language === 'en' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              ENG
            </button>
          </div>
        </div>
      )}
    </header>
  );
};