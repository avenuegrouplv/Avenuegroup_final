import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb, ExternalLink, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { articles, type Article } from '../data/articles';

export const UsefulInfoPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (slug) {
      const article = articles.find(a => a.slug === slug);
      if (article) {
        setSelectedArticle(article);
        window.scrollTo(0, 0);
      } else {
        // If slug doesn't exist, redirect to list
        navigate('/noderigi', { replace: true });
      }
    } else {
      setSelectedArticle(null);
    }
  }, [slug, navigate]);

  const handleArticleClick = (article: Article) => {
    navigate(`/noderigi/${article.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    navigate('/noderigi');
  };

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-24 text-gray-300 font-sans">
      <div className="container mx-auto px-6 max-w-7xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-yellow-400 font-bold tracking-widest text-xs mb-12 hover:text-white transition-colors uppercase"
        >
          <ArrowLeft size={18} className="mr-2" /> {t('useful.backBtn')}
        </button>

        <div className="mb-16">
          <div className="flex items-center space-x-4 text-yellow-400 mb-6">
            <Lightbulb size={48} className="flex-shrink-0" />
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase">
              {t('useful.title')}
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl text-lg">
            Noderīgi raksti un juridiskie padomi nekustamo īpašumu apsaimniekošanā un pārvaldībā.
          </p>
        </div>

        {!selectedArticle ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleArticleClick(article)}
                className="group bg-white/5 border border-white/10 flex flex-col aspect-square h-auto hover:border-yellow-400 hover:bg-white/10 transition-all duration-300 rounded-sm overflow-hidden cursor-pointer relative"
              >
                {/* Article Image */}
                <div className="h-[72%] bg-zinc-800 relative overflow-hidden flex-shrink-0">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                </div>

                <div className="p-3 flex flex-col flex-grow justify-end pb-2 overflow-hidden">
                  <h2 className="text-white text-[12px] font-bold leading-tight group-hover:text-yellow-400 transition-colors line-clamp-3 uppercase tracking-tight">
                    {article.title}
                  </h2>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden"
          >
            {/* Article Banner Image */}
            <div className="w-full h-[200px] md:h-[300px] relative">
              <img 
                src={selectedArticle.image} 
                alt={selectedArticle.title}
                loading="eager"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30" />
            </div>

            <div className="p-6 md:p-12 max-w-3xl mx-auto -mt-16 relative z-10">
              <div className="bg-zinc-900 p-6 md:p-10 border border-white/5 shadow-2xl">
                <div className="text-yellow-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-4 flex items-center">
                  <span className="w-8 h-[1px] bg-yellow-400 mr-3"></span>
                  Noderīga informācija
                </div>
                <h2 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase mb-10 leading-none">
                  {selectedArticle.title}
                </h2>
                
                <div className="space-y-6 text-gray-300 leading-relaxed text-base">
                  {selectedArticle.content.map((paragraph, i) => (
                    <p key={i} className={paragraph.trim().startsWith('•') ? "pl-4 border-l-2 border-yellow-400/30" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-12 flex justify-start">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center text-yellow-400 font-bold tracking-widest text-xs hover:text-white transition-colors uppercase"
                  >
                    <ArrowLeft size={18} className="mr-2" /> Atpakaļ uz sarakstu
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        

      </div>
    </div>
  );
};

