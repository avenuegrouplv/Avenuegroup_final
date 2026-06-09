import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, MessageSquare, Search, FileText, Globe, X, Lock, ShieldCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { documents, DocumentItem } from '../data/documents';

export const ContractTemplatesPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocForPayment, setSelectedDocForPayment] = useState<DocumentItem | null>(null);
  const [agreedToTermsOfService, setAgreedToTermsOfService] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const termsContent = {
    lv: {
      title: 'Pakalpojuma lietošanas noteikumi',
      lastUpdated: 'Pēdējās izmaiņas: 2026. gada marts',
      sections: [
        {
          title: '1. Vispārīgie noteikumi',
          content: 'Šie noteikumi nosaka kārtību, kādā tiek veikti pirkumi interneta vietnē avenuegroup.lv. Veicot pirkumu, lietotājs apliecina, ka ir iepazinies ar šiem noteikumiem un piekrīt tiem.'
        },
        {
          title: '2. Pakalpojuma raksturs un atbildības ierobežojums',
          content: 'Visi Bibliotēkas sadaļā iegādājamie dokumentu paraugi ir izstrādāti līgumi, kuri satur visus noteikumus, kādus tipiski šādi līgumi satur. Šie dokumenti NAV uzskatāmi par juridisku konsultāciju. Pakalpojuma sniedzējs neuzņemas nekādu atbildību par šo dokumentu izmantošanu konkrētā klienta specifiskajā situācijā vai par jebkādiem zaudējumiem, kas var rasties dokumentu izmantošanas rezultātā.'
        },
        {
          title: '3. Dokumentu stāvoklis un izmaiņas',
          content: 'Dokuments tiek iegādāts tādā stāvoklī, kāds tas ir ("as-is"). Produkta cenā NAV iekļautas nekādas izmaiņas līgumā, pielāgojumi konkrētai situācijai vai juridiskas konsultācijas. Ja lietotājam ir nepieciešams pielāgots līgums vai juridiska palīdzība, lūdzam sazināties ar mums, izmantojot kontaktu sadaļu, lai vienotos par individuālu pakalpojumu.'
        },
        {
          title: '4. Preces saņemšana',
          content: 'Pēc veiksmīgas apmaksas veikšanas, lietotājs e-pastā saņem līgumu uz norādīto e-pasta adresi. Digitālo preču rakstura dēļ, atteikuma tiesības nav izmantojamas pēc tam, kad fails id nosūtīts pircējam.'
        },
        {
          title: '5. Intelektuālais īpašums',
          content: 'Iegādātie dokumenti ir paredzēti pircēja personīgai vai viņa pārstāvētā uzņēmuma iekšējai lietošanai. Dokumentu tālākpārdošana vai publiska izplatīšana bez Pakalpojuma sniedzēja rakstiskas piekrišanas ir aizliegta.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: March 2026',
      sections: [
        {
          title: '1. General Terms',
          content: 'These terms define the ordering procedure on the avenuegroup.lv website. By making a purchase, the user confirms they have read and agree to these terms.'
        },
        {
          title: '2. Nature of Service and Limitation of Liability',
          content: 'All document templates available in the Library section are developed contracts containing all provisions typically found in such contracts. These documents are NOT to be considered legal advice. The service provider assumes no responsibility for the use of these documents in the specific situation of a client or for any damages that may arise from the use of the documents.'
        },
        {
          title: '3. Document Condition and Modifications',
          content: 'The document is purchased as-is. The price does NOT include any modifications to the contract, tailoring to a specific situation, or legal consultations. If the user requires a customized contract or legal assistance, please contact us via the contact section to arrange an individual service.'
        },
        {
          title: '4. Receipt of Goods',
          content: 'After successful payment, the user receives the contract at the specified email address. Due to the nature of digital goods, the right of withdrawal is not applicable after the file has been sent to the buyer.'
        },
        {
          title: '5. Intellectual Property',
          content: 'Purchased documents are intended for the buyers personal or internal company use. Resale or public distribution of the documents without the written consent of the Service Provider is prohibited.'
        }
      ]
    },
    ru: {
      title: 'Условия предоставления услуг',
      lastUpdated: 'Последнее обновление: март 2026 г.',
      sections: [
        {
          title: '1. Общие положения',
          content: 'Настоящие условия определяют порядок совершения покупок на сайте avenuegroup.lv. Совершая покупку, пользователь подтверждает, что ознакомился с настоящими условиями и согласен с ними.'
        },
        {
          title: '2. Характер услуг и ограничение ответственности',
          content: 'Все шаблоны документов, доступные в разделе Библиотека, представляют собой разработанные договоры, содержащие все типичные положения. Эти документы НЕ являются юридической консультацией. Провайдер не несет ответственности за использование этих документов в конкретной ситуации клиента или за любые убытки, возникшие в результате использования документов.'
        },
        {
          title: '3. Состояние документов и изменения',
          content: 'Документ приобретается в состоянии как есть ("as-is"). Цена продукта НЕ включает в себя изменения документа, его адаптацию под конкретную ситуацию или юридические консультации. Если пользователю требуется индивидуальный договор или юридическая помощь, пожалуйста, свяжитесь с нами через контакты.'
        },
        {
          title: '4. Получение товара',
          content: 'После успешной оплаты пользователь получает договор на указанный адрес электронной почты. В силу специфики цифровых товаров право на отказ не применяется после отправки файла покупателю.'
        },
        {
          title: '5. Интеллектуальная собственность',
          content: 'Приобретенные документы предназначены для личного использования покупателем или внутреннего использования его компании. Перепродажа или публичное распространение документов без письменного согласия Провайдера запрещены.'
        }
      ]
    }
  };

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
    setSelectedDocForPayment(doc);
    setAgreedToTermsOfService(false);
    // Track facebook pixel - InitiateCheckout
    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout', {
          content_name: doc.title[language as keyof typeof doc.title] || doc.title.lv,
          value: doc.price,
          currency: 'EUR'
        });
      }
    } catch (e) {
      console.error('FB Pixel error:', e);
    }
  };

  const triggerCheckout = () => {
    const stripeUrl = 'https://buy.stripe.com/8x2aER2ib82t3SdgTa1Fe03';
    
    // Track facebook pixel - Purchase
    try {
      if (selectedDocForPayment && typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          content_name: selectedDocForPayment.title[language as keyof typeof selectedDocForPayment.title] || selectedDocForPayment.title.lv,
          value: selectedDocForPayment.price,
          currency: 'EUR'
        });
      }
    } catch (e) {
      console.error('FB Pixel error:', e);
    }

    openCenteredPopup(stripeUrl, 'AvenueGroupCheckout', 550, 800);
  };

  const filteredDocs = documents.filter((doc) => {
    const titleVal = (doc.title[language as keyof typeof doc.title] || doc.title.lv).toLowerCase();
    return titleVal.includes(searchTerm.toLowerCase());
  });

  const totalPrice = selectedDocForPayment ? selectedDocForPayment.price : 0;
  const basePrice = totalPrice / 1.21;
  const vatAmount = totalPrice - basePrice;

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
                'Izvēlieties juridiski sakārtotu dokumentu, iegādājieties to un saņemiet savā e-pastā Word (.docx) formātā. Dokumentu paraugu cenas norādītas ar PVN.' : 
                language === 'en' ? 
                'Choose a legally prepared document model, purchase it and instantly get it in your email inbox in Word (.docx) format. Document template prices are inclusive of VAT.' : 
                'Выберите юридически корректный шаблон документа, оплатите и мгновенно получите его на электронную почту в формате Word (.docx). Цены на шаблоны документов указаны с учетом НДС.'}
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full lg:max-w-md">
            <div className="relative">
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
                  {/* Decorative Word File Mockup or Service Icon */}
                  <div className="mb-2 relative" aria-hidden="true">
                    {doc.isService ? (
                      <div className="w-6 h-8 bg-amber-50 border border-amber-100 shadow-xs rounded-none relative overflow-hidden flex items-center justify-center">
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-600 transform translate-x-1.5 -translate-y-1.5 rotate-45"></div>
                        <Globe size={12} className="text-amber-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-8 bg-blue-50 border border-blue-100 shadow-xs rounded-none relative overflow-hidden flex items-center justify-center">
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-600 transform translate-x-1.5 -translate-y-1.5 rotate-45"></div>
                        <div className="text-blue-600 font-serif font-black text-xs select-none">W</div>
                      </div>
                    )}
                  </div>

                  <h3 
                    title={doc.title[language as keyof typeof doc.title] || doc.title.lv}
                    className="text-xs md:text-sm font-black text-zinc-950 mb-2 leading-tight group-hover:text-blue-700 transition-colors line-clamp-3 min-h-[40px]"
                  >
                    {doc.title[language as keyof typeof doc.title] || doc.title.lv}
                  </h3>
                </header>

                <p className="sr-only">
                  {doc.isService 
                    ? `${doc.title[language as keyof typeof doc.title] || doc.title.lv} pakalpojums.` 
                    : `${doc.title.lv} paraugs lejuplādei. Profesionāli sagatavots juridisks dokuments Word formātā.`}
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
              'Sazinieties ar mums, un mēs sagatavosim Jums nepieciešamo dokumentu individuāli.' : 
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

      {/* Checkout Modal Overlay */}
      {selectedDocForPayment && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto pt-24 sm:pt-32 md:pt-40">
          {/* Backdrop with elegant blur */}
          <div 
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedDocForPayment(null)}
          />
          
          {/* Modal Container */}
          <div 
            id="checkout-modal"
            className="relative bg-white border border-zinc-200 shadow-2xl max-w-lg w-full flex flex-col rounded-none overflow-hidden z-10 mb-8"
          >
            {/* Header with Title and explicit Close button */}
            <div className="border-b border-zinc-100 p-4 md:p-6 bg-zinc-50 flex justify-between items-center gap-4">
              <div className="flex-1">
                <span className="text-xs font-black text-zinc-950 uppercase tracking-wider block">
                  {selectedDocForPayment.isService 
                    ? (language === 'lv' ? 'Pakalpojuma apmaksa' : language === 'en' ? 'Service Payment' : 'Оплата услуги')
                    : (language === 'lv' ? 'Dokumenta parauga apmaksa' : language === 'en' ? 'Document Template Payment' : 'Оплата шаблона документа')
                  }
                </span>
              </div>
              <button
                id="close-checkout-modal"
                onClick={() => setSelectedDocForPayment(null)}
                className="text-zinc-400 hover:text-zinc-950 p-2 hover:bg-zinc-100 transition-colors rounded-none -mt-1 -mr-1 flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px]"
                aria-label={language === 'lv' ? 'Aizvērt' : 'Close'}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Product Info Section */}
              <div className="flex flex-col gap-3 bg-zinc-50/50 p-4 border border-zinc-100">
                <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {language === 'lv' ? 'Pakalpojuma apraksts:' : language === 'en' ? 'Service description:' : 'Описание услуги:'}
                  </span>
                  <span className="text-xs font-bold text-zinc-800 leading-normal">
                    {selectedDocForPayment.title[language as keyof typeof selectedDocForPayment.title] || selectedDocForPayment.title.lv}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-zinc-650">
                  <span>
                    {selectedDocForPayment.isService 
                      ? (language === 'lv' ? 'Maksa par pakalpojumu' : language === 'en' ? 'Service fee' : 'Плата за услугу')
                      : (language === 'lv' ? 'Maksa par dokumenta paraugu' : language === 'en' ? 'Document template fee' : 'Плата за шаблон документа')
                    }
                  </span>
                  <span className="font-bold text-zinc-800">
                    €{basePrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-650 pb-3 border-b border-zinc-100/80">
                  <span>
                    {language === 'lv' ? 'PVN 21%' : language === 'en' ? 'VAT 21%' : 'НДС 21%'}
                  </span>
                  <span className="font-bold text-zinc-800">
                    €{vatAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-end pt-1">
                  <span className="text-xs font-bold text-zinc-950">
                    {language === 'lv' ? 'Kopā apmaksai (ar PVN):' : language === 'en' ? 'Total to Pay (inc. VAT):' : 'Итого к оплате (вкл. НДС):'}
                  </span>
                  <span className="text-2xl font-black text-zinc-950 tracking-tighter">
                    €{selectedDocForPayment.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Secure Payment Reassurance */}
              <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100/50 p-4 text-xs text-zinc-650 leading-relaxed">
                <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-800 mb-0.5">
                    {language === 'lv' ? 'Maksājumu drošību garantē Stripe' : language === 'en' ? 'Secure Payment by Stripe' : 'Безопасность платежей гарантирует Stripe'}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {selectedDocForPayment.isService
                      ? (language === 'lv' 
                          ? 'Pēc priekšapmaksas veikšanas mūsu komanda nekavējoties sazināsies ar Jums norādītajā e-pastā/tālrunī, lai uzsāktu darbu.'
                          : language === 'en'
                          ? 'After the prepayment is made, our team will immediately contact you via the specified email/phone to start the work.'
                          : 'После произведения предоплаты наша команда немедленно свяжется с вами по указанному адресу электронной почты/телефону для начала работы.')
                      : (language === 'lv'
                          ? 'Pēc veiksmīgas apmaksas dokuments tiks automātiski nosūtīts uz Jūsu norādīto e-pastu Word (.docx) formātā.'
                          : language === 'en'
                          ? 'After successful payment, the document will be automatically sent to your specified email in Word (.docx) format.'
                          : 'После успешной оплаты документ будет автоматически отправлен на указанную вами электронную почту в формате Word (.docx).')
                    }
                  </p>
                </div>
              </div>

              {/* Agree to Terms of Service Checkbox */}
              <div className="flex items-start gap-4 bg-zinc-50 border border-zinc-200 p-4">
                <label htmlFor="terms-of-service" className="relative mt-0.5 shrink-0 cursor-pointer flex items-center">
                  <input 
                    id="terms-of-service"
                    type="checkbox" 
                    className="peer sr-only"
                    checked={agreedToTermsOfService}
                    onChange={(e) => setAgreedToTermsOfService(e.target.checked)}
                  />
                  <div className="w-5 h-5 border-2 border-zinc-400 bg-white transition-all peer-checked:bg-yellow-500 peer-checked:border-yellow-500 hover:border-zinc-500"></div>
                  <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center scale-0 peer-checked:scale-100 transition-transform pointer-events-none">
                    <svg className="w-3 h-3 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </label>
                <span className="text-xs md:text-sm font-sans font-normal text-zinc-950 tracking-wide leading-relaxed">
                  {language === 'lv' ? (
                    <>
                      Apliecinu, ka esmu iepazinies ar{' '}
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsTermsOpen(true); }}
                        className="text-yellow-600 underline font-semibold hover:text-zinc-950 transition-colors inline p-0 bg-transparent border-none cursor-pointer"
                      >
                        Pakalpojuma lietošanas noteikumiem
                      </button>
                      , un tiem piekrītu.
                    </>
                  ) : language === 'en' ? (
                    <>
                      I confirm that I have read the{' '}
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsTermsOpen(true); }}
                        className="text-yellow-600 underline font-semibold hover:text-zinc-950 transition-colors inline p-0 bg-transparent border-none cursor-pointer"
                      >
                        Terms of Service
                      </button>
                      , and agree to them.
                    </>
                  ) : (
                    <>
                      Я подтверждаю, что ознакомился с{' '}
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsTermsOpen(true); }}
                        className="text-yellow-600 underline font-semibold hover:text-zinc-950 transition-colors inline p-0 bg-transparent border-none cursor-pointer"
                      >
                        Условиями предоставления услуг
                      </button>
                      , и согласен с ними.
                    </>
                  )}
                </span>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-col gap-3">
                <button
                  id="checkout-modal-pay-button"
                  disabled={!agreedToTermsOfService}
                  onClick={() => {
                    if (agreedToTermsOfService) {
                      triggerCheckout();
                    }
                  }}
                  className={`w-full font-black py-4 px-6 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 rounded-none shadow-xs min-h-[48px] ${
                    agreedToTermsOfService
                      ? 'bg-zinc-950 hover:bg-blue-600 text-white cursor-pointer'
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                  }`}
                >
                  <Lock size={14} />
                  <span>
                    {language === 'lv' ? 'Veikt apmaksu ar karti' : language === 'en' ? 'Pay with card' : 'Оплатить картой'}
                  </span>
                  <ExternalLink size={12} className="opacity-60" />
                </button>

                <button
                  id="checkout-modal-cancel-button"
                  onClick={() => setSelectedDocForPayment(null)}
                  className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800 font-bold py-3 px-6 text-xs uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer min-h-[44px]"
                >
                  {language === 'lv' ? 'Atcelt darījumu' : language === 'en' ? 'Cancel Transaction' : 'Отменить сделку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal Overlay */}
      <AnimatePresence>
        {isTermsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#ebebeb] text-zinc-900 w-full max-w-2xl max-h-[85vh] flex flex-col border border-zinc-200 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[5px] bg-yellow-500"></div>
              
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-zinc-200">
                <div className="flex items-center space-x-3 text-yellow-600 mb-2 h-8">
                  <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-zinc-950 uppercase leading-none">
                    {termsContent[language as keyof typeof termsContent]?.title || termsContent.lv.title}
                  </h2>
                </div>
                <p className="text-zinc-500 text-[10px] font-semibold italic">
                  {termsContent[language as keyof typeof termsContent]?.lastUpdated || termsContent.lv.lastUpdated}
                </p>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                {(termsContent[language as keyof typeof termsContent] || termsContent.lv).sections.map((section, idx) => (
                  <div key={idx} className="space-y-3 pb-6 border-b border-zinc-250 last:border-none last:pb-0">
                    <h3 className="text-xs md:text-sm font-black italic text-zinc-950 uppercase tracking-tight border-l-4 border-yellow-500 pl-3">
                      {section.title}
                    </h3>
                    <p className="text-zinc-650 text-xs md:text-sm leading-relaxed italic">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Modal Footer / Close Button */}
              <div className="p-6 bg-white border-t border-zinc-200 flex justify-center">
                <button
                  onClick={() => setIsTermsOpen(false)}
                  className="bg-zinc-950 text-white hover:bg-yellow-500 hover:text-zinc-950 px-12 py-3.5 font-black text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer"
                >
                  {language === 'lv' ? 'Aizvērt' : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
