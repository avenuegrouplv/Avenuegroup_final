import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { customPages } from '../data/pages';
import footerData from '../data/content/footer.json';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const content = footerData.translations[language] || footerData.translations['lv'];
  
  const dynamicLinks = customPages.map((page) => ({
    name: page.title,
    href: `/lapa/${page.slug}`
  }));

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.services'), href: '/pakalpojumi' },
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
                  src={footerData.logo}
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
            <h4 className="text-white font-black italic tracking-tighter text-sm uppercase mb-6 border-l-2 border-yellow-400 pl-4">{content.aboutTitle}</h4>
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
            <h4 className="text-white font-black italic tracking-tighter text-sm uppercase mb-6 border-l-2 border-yellow-400 pl-4">{content.followTitle}</h4>
            <div className="flex space-x-4">
              <div 
                className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
                aria-label="Facebook Profile"
              >
                <Facebook size={20} />
              </div>
              <div 
                className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
                aria-label="Instagram Profile"
              >
                <Instagram size={20} />
              </div>
            </div>
          </div>

          {/* Contact Details Column */}
          <div>
            <h4 className="text-white font-black italic tracking-tighter text-sm uppercase mb-6 border-l-2 border-yellow-400 pl-4">{content.contactTitle}</h4>
            <div className="text-xs text-gray-400 space-y-2 mb-6">
              <div className="font-bold text-gray-300">{footerData.company.name}</div>
              <div className="text-[11px] text-gray-500">Reģ. Nr. {footerData.company.regNo}</div>
              <div className="text-[11px] text-gray-500">PVN Nr. {footerData.company.pvnNo}</div>
              <div className="pt-2 text-[11px] text-gray-400">{content.addressLabel}</div>
              <div>{footerData.company.addressLine1}</div>
              <div>{footerData.company.addressLine2}</div>
            </div>
            <div className="space-y-2">
              <a href={`mailto:${footerData.company.email}`} className="block text-xs text-yellow-500 hover:text-white transition-colors font-black italic underline underline-offset-4">{footerData.company.email}</a>
              <a href={`tel:${footerData.company.phone.replace(/\s+/g, '')}`} className="block text-xs text-white hover:text-yellow-400 transition-colors font-black italic">{footerData.company.phone}</a>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-gray-500 tracking-wide font-bold font-sans gap-y-4">
          <div className="text-center md:text-left leading-relaxed md:whitespace-nowrap shrink-0">
            <div>2025 &copy; {content.rights} | {footerData.company.name}</div>
          </div>
          <div className="flex space-x-4 md:space-x-6 flex-wrap justify-center gap-y-2">
            <Link 
              to="/privatums"
              className="hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              {content.privacy}
            </Link>
            <span className="text-gray-800">|</span>
            <Link 
              to="/sikdatnes"
              className="hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              {content.cookies}
            </Link>
            <span className="text-gray-800">|</span>
            <Link 
              to="/pakalpojuma-noteikumi"
              className="hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              {content.terms}
            </Link>
          </div>

          {/* Developer Section (Desktop: right bottom corner, Mobile: bottom center) */}
          <div className="flex items-center space-x-1.5 z-10 shrink-0">
            <span className="text-gray-500 text-xs font-bold italic">{content.developerLabel}</span>
            <a 
              href={footerData.developer.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-500 hover:text-white transition-colors text-xs font-black italic tracking-wider uppercase cursor-pointer"
            >
              {footerData.developer.name}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
