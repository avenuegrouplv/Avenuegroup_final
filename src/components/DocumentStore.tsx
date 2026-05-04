import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowRight, MessageSquare } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { documents } from '../data/documents';

const DocumentStore: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handlePurchase = (docId: string) => {
    navigate(`/iegade/${docId}`);
  };

  return (
    <section id="veikals" className="bg-white py-24 md:py-32 overflow-hidden border-y border-zinc-200">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-black mb-6 uppercase">
              {language === 'lv' ? 'Dokumentu bibliotēka' : language === 'en' ? 'Document Library' : 'Библиотека документов'}
            </h2>
            <p className="text-zinc-600 text-lg">
              {language === 'lv' ? 
                'Iegādājieties un saņemiet tos savā epastā.' : 
                language === 'en' ? 
                'Purchase and receive them in your email.' : 
                'Приобретайте и получайте их на свой электронный адрес.'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <div className="w-12 h-[1px] bg-zinc-300"></div>
            <span className="text-sm font-bold tracking-widest uppercase">Word Docs</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {documents.map((doc) => (
            <article
              key={doc.id}
              onClick={() => handlePurchase(doc.id)}
              className="group bg-zinc-50 border border-zinc-200 p-4 flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:border-blue-600/30 cursor-pointer"
            >
              <header>
                {/* Word style icon "W" - smaller */}
                <div className="mb-4 relative" aria-hidden="true">
                  <div className="w-12 h-16 bg-white border-2 border-zinc-200 shadow-sm rounded-sm relative overflow-hidden flex items-center justify-center">
                    {/* The Blue "W" part */}
                    <div className="absolute top-0 right-0 w-4 h-4 bg-blue-600 transform translate-x-2 -translate-y-2 rotate-45"></div>
                    <div className="text-blue-600 font-serif font-black text-2xl select-none">W</div>
                    <div className="absolute bottom-2 left-1.5 right-1.5 h-[1.5px] bg-zinc-100"></div>
                    <div className="absolute bottom-3.5 left-1.5 right-1.5 h-[1.5px] bg-zinc-100"></div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors">
                  {doc.title[language as keyof typeof doc.title] || doc.title.lv}
                </h3>
              </header>

              {/* SEO hidden description */}
              <p className="sr-only">
                {doc.title.lv} paraugs lejuplādei. Profesionāli sagatavots juridisks dokuments Word formātā.
              </p>

              <div className="mt-auto pt-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium tracking-tight">Cena:</span>
                  <span className="text-xl font-black text-black tracking-tighter">€{doc.price.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(doc.id);
                  }}
                  aria-label={`${language === 'lv' ? 'Iegādāties' : 'Purchase'} ${doc.title[language as keyof typeof doc.title] || doc.title.lv}`}
                  className="w-full bg-black hover:bg-blue-700 text-white font-bold py-2 px-3 text-xs flex items-center justify-center gap-2 transition-all duration-300 group/btn"
                >
                  <ShoppingCart size={14} className="transition-transform group-hover/btn:-translate-y-0.5" />
                  <span>{language === 'lv' ? 'IEGĀDĀTIES' : language === 'en' ? 'PURCHASE' : 'КУПИТЬ'}</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Custom Document Request */}
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="w-24 h-[1px] bg-zinc-200 mb-10"></div>
          <h4 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight">
            {language === 'lv' ? 'Neatradi vajadzīgo līgumu vai dokumentu?' : 'Cant find the contract or document you need?'}
          </h4>
          <p className="text-zinc-500 mb-8 max-w-lg">
            {language === 'lv' ? 
              'Sazinies ar mums, un mēs sagatavosim Jums nepieciešamo dokumentu individuāli.' : 
              'Contact us, and we will prepare the document you need individually.'}
          </p>
          <button 
            onClick={() => navigate('/kontakti')}
            className="group flex items-center gap-3 bg-black text-white px-8 py-3 font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all duration-300"
          >
            <MessageSquare size={18} />
            <span>{language === 'lv' ? 'Sazināties ar mums' : 'Contact Us'}</span>
            <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DocumentStore;

