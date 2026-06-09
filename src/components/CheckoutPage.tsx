import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ArrowLeft, PackageOpen, ShieldCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { documents } from '../data/documents';

const CheckoutPage: React.FC = () => {
  const { docId } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [docName, setDocName] = useState('');
  const [docPrice, setDocPrice] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
          content: 'Pēc veiksmīgas apmaksas veikšanas, lietotājs e-pastā saņem līgumu uz norādīto e-pasta adresi. Digitālo preču rakstura dēļ, atteikuma tiesības nav izmantojamas pēc tam, kad fails ir nosūtīts pircējam.'
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
    }
  };

  useEffect(() => {
    const currentDoc = documents.find(d => d.id === docId);
    if (currentDoc) {
      setDocName(currentDoc.title.lv);
      setDocPrice(currentDoc.price);
    } else {
      setDocName('Izvēlētais dokuments');
      setDocPrice(0);
    }
    
    window.scrollTo(0, 0);
  }, [docId]);

  const handlePayment = () => {
    if (agreedToTerms && email) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
      }, 2000);
    }
  };

  return (
    <div className="bg-[#ebebeb] min-h-screen pb-20 text-zinc-900 selection:bg-yellow-250 relative overflow-hidden">

      <div className="container mx-auto px-6 max-w-xl relative z-10">
        <button
          onClick={() => navigate('/ligumu-paraugi')}
          className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'lv' ? 'Atpakaļ uz līgumiem' : 'Back to Contracts'}</span>
        </button>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-zinc-955 p-8 md:p-12 border border-zinc-200 shadow-lg text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-500"></div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-zinc-50 text-yellow-600 rounded-none border border-zinc-150 flex items-center justify-center mb-8">
                  <ShieldCheck size={40} className="stroke-[2px]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-4 uppercase">Paldies par pirkumu!</h2>
                <p className="text-zinc-650 mb-8 leading-relaxed italic font-medium">
                  Pasūtījums ir apstrādāts veiksmīgi. Dokumentu esam nosūtījuši Jums uz e-pasta adresi <strong>{email}</strong> Word (.docx) formātā.
                </p>
                <div className="w-full h-[1px] bg-zinc-150 mb-8"></div>
                <button
                  onClick={() => navigate('/ligumu-paraugi')}
                  className="bg-zinc-950 text-white px-10 py-4 font-black uppercase tracking-widest text-xs hover:bg-yellow-500 hover:text-zinc-950 transition-all"
                >
                  Atgriezties pie līgumiem
                </button>
              </div>
            </motion.div>
          ) : !isProcessing ? (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white text-zinc-950 p-6 md:p-10 border border-zinc-200 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-yellow-500"></div>
              
              <div className="mb-8 text-center border-b border-zinc-150 pb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-50 border border-zinc-150 mb-4 rounded-none">
                  <PackageOpen size={22} className="text-zinc-900" />
                </div>
                <h1 className="text-lg md:text-xl font-black italic tracking-tight mb-2 leading-snug text-zinc-950 uppercase px-4">
                  {docName}
                </h1>
                <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest italic">
                  Saņemiet tūlītēji Word (.docx) saiti e-pastā
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">
                    {language === 'lv' ? 'E-pasts līguma saņemšanai' : 'Email for file delivery'}
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="piemērs@pasts.lv"
                    className="w-full bg-zinc-50 border border-zinc-200 p-3.5 outline-none focus:border-yellow-600 transition-colors text-zinc-900 font-medium placeholder:text-zinc-350 italic"
                    required
                  />
                </div>

                <div className="flex justify-between items-center py-4 border-y border-zinc-150">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Summa paraugu bibliotēkā:</span>
                  <span className="text-xl font-black italic tracking-tighter text-zinc-950">€{docPrice.toFixed(2)}</span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group/label">
                  <div className="relative mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <div className="w-5 h-5 border-2 border-zinc-250 bg-zinc-50 transition-all peer-checked:bg-yellow-500 peer-checked:border-yellow-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center scale-0 peer-checked:scale-100 transition-transform">
                      <svg className="w-3 h-3 text-zinc-955" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tight leading-relaxed group-hover/label:text-zinc-850 transition-colors select-none italic">
                    {language === 'lv' ? (
                      <>Apliecinu, ka piekrītu <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsTermsOpen(true); }} className="text-yellow-650 underline font-extrabold hover:text-zinc-950 inline p-0 bg-transparent border-none cursor-pointer">pakalpojuma lietošanas noteikumiem</button> un patiesam dokumentu raksturam.</>
                    ) : (
                      <>I confirm that I agree to the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsTermsOpen(true); }} className="text-yellow-650 underline font-extrabold hover:text-zinc-950 inline p-0 bg-transparent border-none cursor-pointer">Terms of Service</button> policies.</>
                    )}
                  </span>
                </label>
              </div>

              <button
                disabled={!agreedToTerms || !email}
                className={`w-full font-black py-4 px-8 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs border ${
                  agreedToTerms && email
                    ? 'bg-zinc-950 text-white border-zinc-900 hover:bg-yellow-500 hover:text-zinc-950 shadow-md active:scale-[0.98]' 
                    : 'bg-zinc-50 text-zinc-350 border-zinc-200 cursor-not-allowed'
                }`}
                onClick={handlePayment}
              >
                <CreditCard size={16} />
                <span>MAKSĀT DROŠI</span>
              </button>

              <div className="mt-8 flex items-center justify-center gap-3 text-zinc-400 opacity-70">
                <ShieldCheck size={14} className="text-yellow-600" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">Prece sagatavota Stripe pieslēgšanai</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-zinc-950 p-12 border border-zinc-200 shadow-md text-center"
            >
              <div className="flex flex-col items-center py-8">
                <Loader2 className="animate-spin text-yellow-600 mb-6" size={54} />
                <h2 className="text-xl font-black italic tracking-tighter mb-3 uppercase text-zinc-950">Sagatavojam apmaksu...</h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest max-w-xs mx-auto italic font-bold">
                  Skelets tiek integrēts ar Stripe šifrēšanas sistēmu.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terms of Service Modal Overlay */}
      <AnimatePresence>
        {isTermsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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

export default CheckoutPage;
