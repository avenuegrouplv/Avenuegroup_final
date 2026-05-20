import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Mail } from 'lucide-react';

const DocumentStore: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section id="veikals" className="bg-[#ebebeb] py-12 md:py-16 relative overflow-hidden border-y border-zinc-200">
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="bg-white border border-zinc-200 p-6 md:p-12 shadow-sm rounded-none flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-zinc-950 uppercase leading-none">
              {language === 'lv' ? 'Dokumentu bibliotēka' : language === 'en' ? 'Document Library' : 'Библиотека документов'}
            </h2>
            
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-2xl">
              {language === 'lv' ? (
                'Visi Bibliotēkas sadaļā iegādājamie dokumentu paraugi ir izstrādāti līgumi, kuri satur visus noteikumus, kādus tipiski šādi līgumi satur. Lietotājs saņem līgumu savā e-pastā.'
              ) : language === 'en' ? (
                'All document templates purchasable in the Library section are drafted contracts containing all standard clauses typical for such contracts. The user receives the contract in their email.'
              ) : (
                'Все шаблоны документов, доступные для покупки в разделе Библиотека, представляют собой разработанные договоры, содержащие все положения, типичные для таких соглашений. Пользователь получает договор на свою электронную почту.'
              )}
            </p>

            <div className="flex items-center gap-2.5 text-zinc-700 text-xs italic font-bold pt-1">
              <Mail size={16} className="text-yellow-600 shrink-0" />
              <span>{language === 'lv' ? 'Tūlītēja saņemšana e-pastā' : language === 'en' ? 'Instant email delivery' : 'Мгновенное получение по электронной почте'}</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/ligumu-paraugi')}
                className="group flex items-center gap-3 bg-zinc-950 text-white px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-yellow-500 hover:text-zinc-950 transition-all duration-300 rounded-none shadow-sm"
              >
                <span>{language === 'lv' ? 'DOTIES UZ DOKUMENTU BIBLIOTĒKU' : language === 'en' ? 'GO TO DOCUMENT LIBRARY' : 'ПЕРЕЙТИ В БИБЛИОТЕКУ ДОКУМЕНТОВ'}</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-[260px] shrink-0 flex justify-center">
            {/* Visual presentation of Word Document Stack */}
            <div className="relative w-32 h-44 select-none" aria-hidden="true">
              {/* Back Mock Card */}
              <div className="absolute top-2.5 left-2.5 w-26 h-36 bg-zinc-100 border border-zinc-200/80 -rotate-6 transition-transform group-hover:rotate-0 duration-500 shadow-sm animate-pulse"></div>
              {/* Middle Mock Card */}
              <div className="absolute top-1.5 left-1.5 w-26 h-36 bg-zinc-50 border border-zinc-200/80 rotate-3 transition-transform group-hover:rotate-0 duration-500 shadow-sm"></div>
              {/* Front Main Mock Card */}
              <div className="absolute top-0 left-0 w-26 h-36 bg-white border border-zinc-350 shadow-md flex flex-col justify-between p-2.5">
                <div className="w-6 h-8 bg-blue-50 border-2 border-blue-100 relative overflow-hidden flex items-center justify-center">
                  <div className="text-blue-600 font-serif font-black text-[10px] select-none text-center">W</div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1 bg-zinc-200 w-full rounded"></div>
                  <div className="h-1 bg-zinc-200 w-5/6 rounded"></div>
                  <div className="h-1 bg-zinc-200 w-4/6 rounded"></div>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black text-zinc-400">
                  <span>DOCX</span>
                  <span>AVENUE</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DocumentStore;
