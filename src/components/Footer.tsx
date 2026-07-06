import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { customPages } from '../data/pages';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const developerLabel = language === 'lv' ? 'Izstrādātājs:' : language === 'en' ? 'Developer:' : 'Разработчик:';
  
  const dynamicLinks = customPages.map((page) => ({
    name: page.title,
    href: `/lapa/${page.slug}`
  }));

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.services'), href: '/pakalpojumi' },
    { name: t('nav.templates'), href: '/ligumu-paraugi' },
    { name: language === 'lv' ? 'Noderīgi' : language === 'en' ? 'Useful info' : 'Полезно', href: '/noderigi' },
    { name: t('nav.faq'), href: '/buj' },
    { name: t('nav.contact'), href: '/kontakti' },
    ...dynamicLinks
  ];

  return (
    <footer className="bg-[#1a1a1a] border-t border-white/5 pt-12 pb-8 text-gray-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-12 mb-6">
          {/* Logo Column */}
          <div className="flex flex-col">
            <div className="mb-8">
              <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                <img
                  src="https://pub-48235835e18a4f87b5cf7fb2a1bca3b5.r2.dev/Logo%20PNG2.webp"
                  alt="Avenue Group Logo"
                  loading="lazy"
                  decoding="async"
                  width={330}
                  height={116}
                  className="h-[100px] md:h-[116px] w-auto object-contain transition-transform"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </div>
          </div>

          {/* Nav Links Column */}
          <div className="lg:pl-20">
            <h4 className="text-white font-black italic tracking-tighter text-sm uppercase mb-6 border-l-2 border-yellow-400 pl-4">{t('footer.aboutTitle')}</h4>
            <ul className="space-y-1.5">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-xs font-bold italic"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Columns */}
          <div className="lg:pl-10">
            <h4 className="text-white font-black italic tracking-tighter text-sm uppercase mb-6 border-l-2 border-yellow-400 pl-4">{t('footer.followTitle')}</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61576913053177" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all"
                aria-label="Facebook Profile"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all"
                aria-label="Instagram Profile"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Contact Details Column */}
          <div>
            <h4 className="text-white font-black italic tracking-tighter text-sm uppercase mb-6 border-l-2 border-yellow-400 pl-4">{t('footer.contactTitle')}</h4>
            <div className="flex flex-col">
              <div className="text-xs text-gray-300 font-bold italic mb-0.5">SIA "Avenue Group"</div>
              <div className="text-[9px] text-gray-500 tracking-tighter font-bold mb-0.5">Reģ.Nr. 40203647938</div>
              <div className="text-[9px] text-gray-500 tracking-tighter font-bold mb-2">PVN Nr. LV40203647938</div>
              <div className="text-[10px] text-gray-400 font-bold mb-0.5">{t('footer.addressLabel')}</div>
              <div className="text-[10px] text-gray-500 font-bold mb-0.5">Brīvības gatve 386 k-2-5A</div>
              <div className="text-[10px] text-gray-500 font-bold mb-6">Rīga, LV-1024</div>
              <div className="space-y-2">
                <a href="mailto:services@avenuegroup.lv" className="block text-xs text-yellow-500 hover:text-white transition-colors font-black italic underline underline-offset-4">services@avenuegroup.lv</a>
                <a href="tel:+37126739899" className="block text-xs text-white hover:text-yellow-400 transition-colors font-black italic">+371 26 739 899</a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-gray-500 tracking-wide font-bold font-sans relative">
          <div className="text-center md:text-left leading-relaxed mb-4 md:mb-0 md:whitespace-nowrap shrink-0">
            <div>2025 &copy; {t('footer.rights')} | SIA "Avenue Group"</div>
          </div>
          <div className="flex space-x-4 md:space-x-6 flex-wrap justify-center md:absolute md:left-1/2 md:-translate-x-1/2 gap-y-2">
            <Link 
              to="/privatums"
              className="hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              {t('footer.privacy')}
            </Link>
            <span className="text-gray-800">|</span>
            <Link 
              to="/sikdatnes"
              className="hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              {t('footer.cookies')}
            </Link>
            <span className="text-gray-800">|</span>
            <Link 
              to="/pakalpojuma-noteikumi"
              className="hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              {language === 'lv' ? 'Lietošanas noteikumi' : language === 'en' ? 'Terms of Service' : 'Правила'}
            </Link>
          </div>

          {/* Developer Section (Desktop: right bottom corner, Mobile: bottom center) */}
          <div className="flex items-center space-x-1.5 mt-6 md:mt-0 z-10">
            <span className="text-gray-500 text-xs font-bold italic">{developerLabel}</span>
            <a 
              href="https://www.facebook.com/profile.php?id=100088834779537" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-500 hover:text-white transition-colors text-xs font-black italic tracking-wider uppercase cursor-pointer"
            >
              SageOn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
