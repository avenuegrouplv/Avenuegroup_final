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
      // Simulates redirect to Stripe or payment process
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
      }, 2000);
    }
  };

  return (
    <div className="bg-[#141414] min-h-screen pt-24 pb-16 text-white selection:bg-blue-500/30">
      <div className="container mx-auto px-6 max-w-xl">
        <button
          onClick={() => navigate('/#veikals')}
          className="group flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 mb-8"
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'lv' ? 'Atpakaļ' : 'Back'}</span>
        </button>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-black p-12 md:p-16 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter mb-4">Paldies par pirkumu!</h2>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  Pasūtījums ir apstrādāts veiksmīgi. Līgums ir nosūtīts uz Jūsu norādīto e-pasta adresi <strong>{email}</strong>.
                </p>
                <div className="w-full h-[1px] bg-zinc-100 mb-8"></div>
                <button
                  onClick={() => navigate('/')}
                  className="bg-black text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all"
                >
                  Atgriezties sākumā
                </button>
              </div>
            </motion.div>
          ) : !isProcessing ? (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-black p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900"></div>
              
              <div className="mb-10 text-center border-b border-zinc-100 pb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-50 mb-6 rounded-full">
                  <PackageOpen size={24} className="text-zinc-900" />
                </div>
                <h1 className="text-xl font-bold italic tracking-tighter mb-2 leading-tight px-4">
                  {docName}
                </h1>
                <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">
                  Microsoft Word vai LibreOffice
                </p>
              </div>

              <div className="space-y-8 mb-10">
                {/* Email Input */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                    {language === 'lv' ? 'E-pasts faila saņemšanai' : 'Email for file delivery'}
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="piemērs@pasts.lv"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 outline-none focus:border-black transition-colors text-zinc-900 font-medium placeholder:text-zinc-300"
                    required
                  />
                </div>

                <div className="flex justify-between items-center py-6 border-y border-zinc-100">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Summa:</span>
                  <span className="text-xl font-black italic tracking-tighter">€{docPrice.toFixed(2)}</span>
                </div>

                <label className="flex items-start gap-4 cursor-pointer group/label">
                  <div className="relative mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <div className="w-5 h-5 border-2 border-zinc-200 bg-zinc-50 transition-all peer-checked:bg-black peer-checked:border-black"></div>
                    <div className="absolute inset-0 flex items-center justify-center scale-0 peer-checked:scale-100 transition-transform">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tight leading-relaxed group-hover/label:text-zinc-800 transition-colors">
                    {language === 'lv' ? (
                      <>Apliecinu, ka esmu iepazinies un piekrītu <Link to="/pakalpojuma-noteikumi" className="text-blue-600 hover:underline">lietošanas noteikumiem</Link> un atrunai.</>
                    ) : (
                      <>I confirm that I have read and agree to the <Link to="/pakalpojuma-noteikumi" className="text-blue-600 hover:underline">Terms of Service</Link> and disclaimer.</>
                    )}
                  </span>
                </label>
              </div>

              <button
                disabled={!agreedToTerms || !email}
                className={`w-full font-black py-4 px-8 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm ${
                  agreedToTerms && email
                    ? 'bg-black text-white hover:bg-blue-700 shadow-xl active:scale-[0.98]' 
                    : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                }`}
                onClick={handlePayment}
              >
                <CreditCard size={18} />
                <span>MAKSĀT</span>
              </button>

              <div className="mt-8 flex items-center justify-center gap-4 text-zinc-300 px-2 opacity-50">
                <ShieldCheck size={14} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Droši norēķini ar SSL šifrēšanu</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-black p-12 shadow-2xl text-center"
            >
              <div className="flex flex-col items-center py-12">
                <Loader2 className="animate-spin text-zinc-900 mb-8" size={64} />
                <h2 className="text-2xl font-black italic tracking-tighter mb-4">Sagatavojam apmaksu...</h2>
                <p className="text-zinc-400 text-xs uppercase tracking-widest max-w-xs mx-auto">
                  Jūs tiekat pāradresēts uz drošu norēķinu vidi.
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
