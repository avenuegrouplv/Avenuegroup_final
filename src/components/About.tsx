import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import aboutNewImage from '../assets/1. Kas-notiek-ja-mainas-kopipasnieks.webp';

interface AboutProps {
  isStandalone?: boolean;
  onContactClick?: () => void;
}

export const About: React.FC<AboutProps> = ({ isStandalone = false, onContactClick }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section id="par-mums" className={`bg-white border-y border-zinc-250 overflow-hidden relative ${isStandalone ? 'pt-8 md:pt-12 pb-12 lg:pb-16' : 'pt-12 pb-10 md:pt-16 md:pb-12 lg:pb-14'}`}>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {isStandalone && (
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-yellow-600 font-bold tracking-widest text-xs mb-12 hover:text-zinc-950 transition-colors font-sans"
          >
            <ArrowLeft size={18} className="mr-2" /> {t('about.backBtn')}
          </button>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-black italic leading-none mb-10 text-zinc-950 uppercase tracking-tighter">
                {t('about.title')} <span className="text-yellow-600">{t('about.subtitle')}</span>
              </h2>
              <div className="space-y-6 text-zinc-600 text-sm md:text-base leading-relaxed">
                <p className="text-zinc-900 font-bold italic border-l-4 border-yellow-500 pl-6 my-6 bg-zinc-50 py-4 pr-4">
                  {t('about.highlight')}
                </p>
                <p>
                  {t('about.p1')}
                </p>
                <p>
                  {t('about.p2')}
                </p>
                <p>
                  {t('about.p3')}
                </p>
                <p>
                  {t('about.p4')}
                </p>
                <p className="bg-zinc-50 p-6 border border-zinc-200 italic font-bold text-zinc-800 text-sm md:text-base">
                  {t('about.p5')}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-col gap-6 h-full mt-10 lg:mt-16">
              <div className="w-24 h-0.5 bg-yellow-500 mb-2"></div>
              
              {/* Image 1: Optimized & Pre-fetched */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative h-[280px] md:h-[320px] overflow-hidden group shadow-md border border-zinc-200"
              >
                <img 
                  src="https://pub-48235835e18a4f87b5cf7fb2a1bca3b5.r2.dev/FB5.webp" 
                  alt="Avenue Group nekustamā īpašuma pārvaldības piemērs" 
                  className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent opacity-60"></div>
              </motion.div>

              {/* Image 2: Web Optimized Dimensions & Pre-fetched */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative h-[280px] md:h-[320px] overflow-hidden group shadow-md border border-zinc-200"
              >
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=55&w=600" 
                  alt="Modernā arhitektūra un nekustamais īpašums Avenue Group" 
                  className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-70"></div>
                <div className="absolute bottom-4 left-4 border-l-2 border-yellow-500 pl-3 max-w-[250px]">
                  <div className="text-sm md:text-base font-black italic text-yellow-400 mb-1 tracking-tighter">Avenue Group</div>
                  <div className="text-white text-xs md:text-sm font-medium italic leading-normal">
                    <div className="mb-1">{t('about.imageTaglineLine1')}</div>
                    <div>{t('about.imageTaglineLine2')}</div>
                  </div>
                </div>
              </motion.div>

              {/* Image 3: Latvian Image Asset with Custom Tagline */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative h-[280px] md:h-[320px] overflow-hidden group shadow-md border border-zinc-200"
              >
                <img 
                  src={aboutNewImage} 
                  alt="Avenue Group nekustamā īpašuma kopīpašuma pārvaldība" 
                  className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-70"></div>
                <div className="absolute bottom-4 left-4 border-l-2 border-yellow-500 pl-3 max-w-[250px]">
                  <div className="text-sm md:text-base font-black italic text-yellow-400 mb-1 tracking-tighter">Avenue Group</div>
                  <div className="text-white text-xs md:text-sm font-medium italic leading-normal">
                    <div className="mb-1">{t('about.image3TaglineLine1')}</div>
                    <div>{t('about.image3TaglineLine2')}</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
