import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb, FileText, Calendar, User } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { articles, type Article } from '../data/articles';

export const UsefulInfoPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (slug) {
      const article = articles.find(a => a.slug === slug);
      if (article) {
        setSelectedArticle(article);
        window.scrollTo(0, 0);
        
        // SEO: Dynamic title and description
        document.title = `${article.title} | Avenue Group`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', article.excerpt);
        }
      } else {
        navigate('/noderigi', { replace: true });
      }
    } else {
      setSelectedArticle(null);
      document.title = language === 'lv' ? 'Noderīga informācija | Avenue Group' : 'Useful Info | Avenue Group';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Noderīgi raksti un juridiskie padomi nekustamo īpašumu apsaimniekošanā un pārvaldībā.');
      }
    }

    return () => {
      document.title = 'Avenue Group | Komercīpašumu un privātīpašumu apsaimniekošana';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Avenue Group - nekustamo īpašumu apsaimniekošanas un pārvaldības pakalpojumi komercīpašumiem un privātīpašumiem Latvijā. Profesionāls juridiskais atbalsts un individuāla pieeja.');
      }
    };
  }, [slug, navigate, language]);

  const handleArticleClick = (article: Article) => {
    navigate(`/noderigi/${article.slug}`);
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    navigate('/noderigi');
  };

  return (
    <div className="bg-[#ebebeb] min-h-screen pb-24 text-zinc-900 font-sans selection:bg-yellow-250">

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Back Button points back to Līgumu bibliotēka / ligumu-paraugi catalog */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'lv' ? 'Atpakaļ uz sākumu' : language === 'en' ? 'Back to Home' : 'Назад на главную'}</span>
        </button>

        <div className="mb-16">
          <div className="flex items-center space-x-4 text-yellow-600 mb-6">
            <Lightbulb size={40} className="flex-shrink-0" />
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase">
              {language === 'lv' ? 'Noderīga informācija' : language === 'en' ? 'Useful info' : 'Полезная информация'}
            </h1>
          </div>
          <p className="text-zinc-650 max-w-2xl text-base md:text-lg leading-relaxed">
            {language === 'lv' ? 
              'Noderīgi raksti, analizēti pieredzes piemēri un profesionāli padomi nekustamo īpašumu apsaimniekošanā, pārvaldībā un juridisko procesu risināšanā.' : 
              'Useful articles, analysed cases, and professional insights into real estate management, operations, and legal matters.'}
          </p>
        </div>

        {!selectedArticle ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleArticleClick(article);
                  }
                }}
                onClick={() => handleArticleClick(article)}
                className="group bg-white border border-zinc-200 hover:border-yellow-500 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {/* Article Image - Optimized sizes, eager loading */}
                <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden flex-shrink-0 border-b border-zinc-100">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-zinc-950/5 group-hover:bg-transparent transition-colors duration-300" />
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <header>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-zinc-400 mb-3 tracking-wider">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Info</span>
                      <span className="flex items-center gap-1"><User size={12} /> Avenue</span>
                    </div>
                    <h2 className="text-zinc-900 text-sm md:text-base font-black leading-snug line-clamp-3 uppercase tracking-tight group-hover:text-blue-700 transition-colors mb-3">
                      {article.title}
                    </h2>
                  </header>
                  <p className="text-zinc-500 text-xs md:text-sm leading-relaxed line-clamp-2 mt-auto italic">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 relative overflow-hidden shadow-md max-w-4xl mx-auto">
            {/* Optimized banner image loading */}
            <div className="w-full h-[240px] md:h-[380px] relative border-b border-zinc-100">
              <img 
                src={selectedArticle.image} 
                alt={selectedArticle.title}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent" />
            </div>

            <div className="p-6 md:p-12 relative z-10">
              <div className="text-yellow-600 font-extrabold tracking-[0.2em] text-[10px] uppercase mb-4 flex items-center">
                <span className="w-8 h-[1px] bg-yellow-500 mr-3"></span>
                Noderīga informācija
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-zinc-950 italic tracking-tighter uppercase mb-8 leading-snug">
                {selectedArticle.title}
              </h1>
              
              <div className="space-y-6 text-zinc-700 leading-relaxed text-sm md:text-base border-t border-zinc-150 pt-8">
                {selectedArticle.content.map((paragraph, i) => (
                  <p key={i} className={paragraph.trim().startsWith('•') ? "pl-4 border-l-2 border-yellow-500 font-semibold text-zinc-900" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-start">
                <button
                  onClick={handleBackToList}
                  className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 shadow-sm rounded-none cursor-pointer"
                >
                  <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
                  <span>{language === 'lv' ? 'Atpakaļ uz sarakstu' : 'Back to List'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
