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
              className="bg-white text-zinc-950 p-8 md:p-12 border border-zinc-200 shadow-lg text-center relative overflow-hidden"
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
                      <>Apliecinu, ka piekrītu <Link to="/pakalpojuma-noteikumi" className="text-yellow-650 underline font-extrabold hover:text-zinc-950">pakalpojuma lietošanas noteikumiem</Link> un patiesam dokumentu raksturam.</>
                    ) : (
                      <>I confirm that I agree to the <Link to="/pakalpojuma-noteikumi" className="text-yellow-650 underline font-extrabold hover:text-zinc-950">Terms of Service</Link> policies.</>
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
    </div>
  );
};

export default CheckoutPage;
