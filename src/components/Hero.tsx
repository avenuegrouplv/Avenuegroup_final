import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import homepageData from '../data/content/homepage.json';

export const Hero: React.FC = () => {
  const { language } = useLanguage();
  const heroContent = homepageData.hero.translations[language] || homepageData.hero.translations['lv'];
  const mainImage = homepageData.hero.image;

  return (
    <section id="sakums" className="relative w-full h-screen min-h-[600px] flex items-center md:items-end justify-center overflow-hidden m-0 p-0">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-[#141414] h-full w-full overflow-hidden">
        <img 
          src={mainImage} 
          alt="Avenue Group - nekustamo īpašumu apsaimniekošanas un pārvaldības pakalpojumi Latvijā" 
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          style={{ objectPosition: 'center center' }}
        />
      </div>
      
      {/* Light Gradient Overlay to ensure header readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/20" />

      <div className="container mx-auto px-6 relative z-20 pb-12 md:pb-20">
        {/* Localized dark area for better text contrast */}
        <div className="max-w-4xl mx-auto text-center bg-black/40 backdrop-blur-[2px] p-6 md:p-10 border border-white/5 shadow-2xl">
          <h1 className="text-2xl md:text-5xl font-black leading-[1.1] tracking-tighter mb-4 italic text-white drop-shadow-2xl">
            {heroContent.title} <br />
            <span className="text-yellow-400">{heroContent.subtitle}</span>
          </h1>
          <p className="text-xl md:text-3xl text-white mb-8 max-w-3xl mx-auto leading-relaxed italic font-bold drop-shadow-lg">
            {heroContent.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/kontakti"
              className="bg-yellow-400 text-black px-6 py-3 font-sans font-black tracking-widest flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all group text-xs shadow-[0_10px_30px_rgba(179,130,7,0.3)] border-2 border-transparent sm:w-64"
            >
              {heroContent.contactBtn}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/pakalpojumi"
              className="border-2 border-white text-white px-6 py-3 font-sans font-black tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center text-xs backdrop-blur-md sm:w-64"
            >
              {heroContent.servicesBtn}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};