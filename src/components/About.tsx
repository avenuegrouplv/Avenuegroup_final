import React from 'react';
import { ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface AboutProps {
  isStandalone?: boolean;
  onContactClick?: () => void;
}

export const About: React.FC<AboutProps> = ({ isStandalone = false, onContactClick }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section id="par-mums" className={`bg-[#1a1a1a] border-y border-white/5 overflow-hidden ${isStandalone ? 'py-12' : 'pt-24 pb-16 lg:pb-24'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        {isStandalone && (
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-yellow-400 font-bold tracking-widest text-xs mb-12 hover:text-white transition-colors font-sans"
          >
            <ArrowLeft size={18} className="mr-2" /> {t('about.backBtn')}
          </button>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl md:text-3xl font-black italic leading-none mb-10">
                {t('about.title')} <span className={language === 'ru' ? "text-white" : "text-yellow-400"}>{t('about.subtitle')}</span>
              </h2>
              <div className="space-y-6 text-gray-300 text-base leading-relaxed">
                <p className="text-white font-bold italic border-l-4 border-yellow-400 pl-6">
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
                <p className="bg-white/5 p-6 border border-white/10 italic font-bold text-white text-base">
                  {t('about.p5')}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-col gap-6 h-full mt-10 lg:mt-16">
              <div className="w-24 h-0.5 bg-yellow-400 mb-2"></div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative h-[300px] md:h-[350px] overflow-hidden group"
              >
                <img 
                  src="https://pub-48235835e18a4f87b5cf7fb2a1bca3b5.r2.dev/FB5.webp" 
                  alt="Avenue Group nekustamā īpašuma pārvaldības piemērs" 
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-80 transition-all duration-700 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative h-[300px] md:h-[350px] overflow-hidden group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200" 
                  alt="Modernā arhitektūra un nekustamais īpašums Avenue Group" 
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-80 transition-all duration-700 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 border-l-2 border-yellow-400 pl-3 max-w-[250px]">
                  <div className="text-base md:text-lg font-black italic text-yellow-400 mb-1 tracking-tighter">Avenue Group</div>
                  <div className="text-white text-sm md:text-base font-medium italic leading-normal">
                    <div className="mb-1">{t('about.imageTaglineLine1')}</div>
                    <div>{t('about.imageTaglineLine2')}</div>
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