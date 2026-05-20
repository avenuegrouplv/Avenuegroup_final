import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, MessageSquare, Search, FileText, X, ExternalLink, Loader2, Lock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { documents, DocumentItem } from '../data/documents';

export const ContractTemplatesPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = language === 'lv' ? 'Līgumu paraugi | Avenue Group' : language === 'en' ? 'Contract Templates | Avenue Group' : 'Шаблоны договоров | Avenue Group';
  }, [language]);

  const openCenteredPopup = (url: string, title: string, w: number, h: number) => {
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.width;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    
    const newWindow = window.open(url, title, `
      scrollbars=yes,
      width=${w / systemZoom}, 
      height=${h / systemZoom}, 
      top=${top}, 
      left=${left},
      status=no,
      location=no,
      toolbar=no,
      menubar=no
    `);

    if (newWindow) newWindow.focus();
    return newWindow;
  };

  const handlePurchase = (doc: DocumentItem) => {
    setActiveDoc(doc);
    setIsCheckoutOpen(true);
    triggerCheckout();
  };

  const triggerCheckout = () => {
    const stripeUrl = 'https://buy.stripe.com/14A28lcWP2I92O95as1Fe02';
    openCenteredPopup(stripeUrl, 'AvenueGroupCheckout', 550, 800);
  };

  const filteredDocs = documents.filter((doc) => {
    const titleVal = (doc.title[language as keyof typeof doc.title] || doc.title.lv).toLowerCase();
    return titleVal.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-[#ebebeb] min-h-screen pb-24 text-zinc-900 font-sans selection:bg-yellow-200">

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'lv' ? 'Atpakaļ uz sākumu' : language === 'en' ? 'Back to Home' : 'На главную'}</span>
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-zinc-950 mb-6 uppercase pt-4">
              {language === 'lv' ? 'Dokumentu bibliotēka' : language === 'en' ? 'Document Library' : 'Библиотека документов'}
            </h1>
            <p className="text-zinc-650 text-sm md:text-base leading-relaxed">
              {language === 'lv' ? 
                'Izvēlieties juridiski sakārtotu dokumentu, iegādājieties to un nekavējoties saņemiet savā e-pastā Word (.docx) formātā.' : 
                language === 'en' ? 
                'Choose a legally prepared document model, purchase it and instantly get it in your email inbox in Word (.docx) format.' : 
                'Выберите юридически корректный шаблон документа, оплатите и мгновенно получите его на электронную почту в формате Word (.docx).'}
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full lg:max-w-md relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={language === 'lv' ? 'Meklēt līgumu...' : language === 'en' ? 'Search contracts...' : 'Поиск договоров...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-200 text-zinc-900 pl-12 pr-6 py-4 rounded-none outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredDocs.map((doc) => (
              <article
                key={doc.id}
                onClick={() => handlePurchase(doc)}
                className="group bg-white border border-zinc-200 p-3 md:p-4 flex flex-col h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 hover:border-yellow-500 cursor-pointer rounded-none relative shadow-xs"
              >
                <header className="relative">
                  {/* Decorative Word File Mockup */}
                  <div className="mb-2 relative" aria-hidden="true">
                    <div className="w-6 h-8 bg-blue-50 border border-blue-100 shadow-xs rounded-none relative overflow-hidden flex items-center justify-center">
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-600 transform translate-x-1.5 -translate-y-1.5 rotate-45"></div>
                      <div className="text-blue-600 font-serif font-black text-xs select-none">W</div>
                    </div>
                  </div>

                  <h3 className="text-xs md:text-sm font-black text-zinc-950 mb-2 leading-tight group-hover:text-blue-700 transition-colors line-clamp-3 min-h-[40px]">
                    {doc.title[language as keyof typeof doc.title] || doc.title.lv}
                  </h3>
                </header>

                <p className="sr-only">
                  {doc.title.lv} paraugs lejuplādei. Profesionāli sagatavots juridisks dokuments Word formātā.
                </p>

                <div className="mt-auto pt-3 flex flex-col gap-2 border-t border-zinc-100">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500 font-bold tracking-tight">
                      {language === 'lv' ? 'Cena:' : language === 'en' ? 'Price:' : 'Цена:'}
                    </span>
                    <span className="text-lg font-black text-zinc-950 tracking-tighter">€{doc.price.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(doc);
                    }}
                    className="w-full bg-zinc-950 hover:bg-blue-600 text-white font-black py-1.5 px-3 text-[10px] tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 rounded-none group/btn"
                  >
                    <ShoppingCart size={11} className="transition-transform group-hover/btn:-translate-y-0.5" />
                    <span>{language === 'lv' ? 'IEGĀDĀTIES' : language === 'en' ? 'PURCHASE' : 'КУПИТЬ'}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-zinc-200">
            <FileText size={36} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500 text-sm">
              {language === 'lv' ? 'Nekas netika atrasts.' : 'No documents found.'}
            </p>
          </div>
        )}

        {/* Custom Document Request */}
        <div className="mt-12 flex flex-col items-center text-center bg-white border border-zinc-200 p-6 md:p-8 shadow-xs rounded-none">
          <div className="w-8 h-[2px] bg-yellow-500 mb-4"></div>
          <h4 className="text-lg md:text-xl font-black text-zinc-950 mb-2 tracking-tight">
            {language === 'lv' ? 'Neatradi vajadzīgo dokumentu?' : language === 'en' ? "Didn't find the necessary document?" : 'Не нашли нужный документ?'}
          </h4>
          <p className="text-zinc-650 mb-5 max-w-lg text-xs md:text-sm leading-relaxed">
            {language === 'lv' ? 
              'Sazinieties ar mums, un mēs sagatavosim Jums nepieciešamo dokumentu individuālu.' : 
              language === 'en' ?
              'Contact us, and we will prepare the document you need individually.' :
              'Свяжитесь с нами, и мы подготовим нужный вам документ индивидуально.'}
          </p>
          <button 
            onClick={() => navigate('/kontakti')}
            className="group flex items-center gap-2 bg-zinc-950 text-white px-6 py-2.5 font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 rounded-none cursor-pointer"
          >
            <MessageSquare size={13} />
            <span>{language === 'lv' ? 'Sazināties ar mums' : 'Contact Us'}</span>
          </button>
        </div>
      </div>

      {/* Stripe Checkout Backdrop and Modal Popup overlay */}
      {isCheckoutOpen && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/65 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsCheckoutOpen(false)}
          />
          
          <div className="bg-white border-2 border-zinc-950 w-full max-w-md relative z-10 p-6 md:p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-none border border-yellow-100 flex items-center justify-center mb-5 animate-pulse">
              <ShoppingCart size={24} />
            </div>

            <h3 className="text-lg md:text-xl font-black text-zinc-950 mb-1 tracking-tight uppercase italic">
              {language === 'lv' ? 'Gatavojam pirkumu' : language === 'en' ? 'Preparing Checkout' : 'Оформление покупки'}
            </h3>
            
            <p className="text-xs md:text-sm font-bold text-yellow-600 mb-4 max-w-sm">
              {activeDoc.title[language as keyof typeof activeDoc.title] || activeDoc.title.lv}
            </p>

            <div className="bg-zinc-50 border border-zinc-200 py-2.5 px-4 mb-5 font-mono text-[10px] text-zinc-600 flex items-center gap-2 w-full justify-center">
              <Lock size={12} className="text-emerald-600 shrink-0" />
              <span>
                {language === 'lv' ? 'Drošs maksājums ar Stripe' : language === 'en' ? 'Secure Payment via Stripe' : 'Безопасная оплата через Stripe'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-6 font-medium">
              <Loader2 size={14} className="animate-spin text-yellow-600 shrink-0" />
              <span>
                {language === 'lv' ? 'Tiek atvērts drošs maksājuma logs...' : language === 'en' ? 'Opening secure checkout...' : 'Открывается окно оплаты...'}
              </span>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={triggerCheckout}
                className="w-full bg-zinc-950 hover:bg-yellow-600 text-white font-black py-2.5 px-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 rounded-none cursor-pointer"
              >
                <span>
                  {language === 'lv' ? 'ATVĒRT MAKSĀJUMU' : language === 'en' ? 'OPEN PAYMENT' : 'ОТКРЫТЬ ОПЛАТУ'}
                </span>
                <ExternalLink size={12} />
              </button>

              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full bg-transparent hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 border border-zinc-200 font-black py-2 px-4 text-[10px] uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer"
              >
                {language === 'lv' ? 'Atpakaļ' : language === 'en' ? 'Cancel' : 'Отмена'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
