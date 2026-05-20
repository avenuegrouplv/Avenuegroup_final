import React, { useState } from 'react';
import { Send, Phone, Mail, ArrowLeft, Check } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

interface ContactPageProps {
  isEmbedded?: boolean;
}

export const ContactPage: React.FC<ContactPageProps> = ({ isEmbedded = false }) => {
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;

    setStatus('submitting');

    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...formData
        }).toString()
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Sūtīšanas kļūda:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className={`bg-[#ebebeb] flex items-center justify-center ${isEmbedded ? 'py-32' : 'min-h-[80vh] pb-16'}`}>
        <div className="container mx-auto px-6 max-w-2xl text-center animate-in zoom-in duration-500 relative z-10">
          <div className="w-24 h-24 bg-yellow-400 flex items-center justify-center mx-auto mb-10 shadow-lg rounded-none">
            <Check size={48} className="text-zinc-950 stroke-[3px]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic mb-6 tracking-tighter text-zinc-950 uppercase leading-none">
            {t('contact.successTitle')}
          </h2>
          <p className="text-lg text-zinc-650 mb-12 font-bold italic leading-relaxed">
            {t('contact.successMessage')}
          </p>
          <button 
            onClick={() => {
              setStatus('idle');
              setFormData({ name: '', company: '', email: '', phone: '', message: '' });
              setConsent(false);
            }}
            className="text-yellow-600 font-black tracking-widest text-xs border-b-2 border-yellow-650 pb-1 hover:text-zinc-950 transition-colors"
          >
            {t('contact.newRequestBtn')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakti" className={`bg-[#ebebeb] relative overflow-hidden ${isEmbedded ? 'py-12 md:py-16 border-t border-zinc-200' : 'min-h-screen pb-16'}`}>

      <div className="container mx-auto px-6 relative z-10">
        {!isEmbedded && (
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            <span>{t('contact.backBtn')}</span>
          </button>
        )}

        {/* Centered Header Block */}
        <div className="max-w-4xl mb-12 text-center mx-auto">
          <h2 className="text-3xl md:text-4xl font-black italic leading-none mb-8 tracking-tighter text-zinc-950 uppercase">
            <div className="mb-2">{t('contact.title')}</div>
            <div className="text-yellow-600">{t('contact.subtitle')}</div>
          </h2>
          <div className="text-lg md:text-xl text-zinc-600 font-extrabold italic leading-snug max-w-3xl mx-auto">
            <div>{t('contact.formTitle')}</div>
            <div>{t('contact.formSubtitle')}</div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-16">
          <div className="w-full max-w-2xl">
            {/* Form Container with Premium Light Card style */}
            <div className="bg-white p-6 md:p-10 border border-zinc-250 shadow-md relative overflow-hidden rounded-none">
              <h3 className="text-xl font-black italic mb-8 tracking-tighter relative z-10 text-zinc-900 text-center uppercase">{t('contact.formBoxTitle')}</h3>
              
              <form 
                name="contact"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit} 
                className="space-y-6 relative z-10"
              >
                <input type="hidden" name="form-name" value="contact" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase italic transition-colors">{t('contact.labelName')}</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 p-3 outline-none transition-all text-zinc-900 text-base focus:bg-white focus:border-yellow-600 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase italic transition-colors">{t('contact.labelCompany')}</label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 p-3 outline-none transition-all text-zinc-900 text-base focus:bg-white focus:border-yellow-600 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase italic transition-colors">{t('contact.labelEmail')}</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 p-3 outline-none transition-all text-zinc-900 text-base focus:bg-white focus:border-yellow-600 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase italic transition-colors">{t('contact.labelPhone')}</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 p-3 outline-none transition-all text-zinc-900 text-base focus:bg-white focus:border-yellow-600 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black tracking-widest text-zinc-500 uppercase italic transition-colors">{t('contact.labelMessage')}</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-zinc-50 border-b-2 border-zinc-200 p-3 outline-none transition-all text-zinc-900 text-base resize-none focus:bg-white focus:border-yellow-600 focus:ring-0"
                  ></textarea>
                </div>

                <div className="flex items-start space-x-3 cursor-pointer group/consent" onClick={() => setConsent(!consent)}>
                  <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${consent ? 'bg-yellow-500 border-yellow-500 shadow-sm' : 'border-zinc-300 bg-white group-hover/consent:border-zinc-500'}`}>
                    {consent && <Check size={14} className="text-zinc-950 font-bold" />}
                  </div>
                  <div className="text-[11px] text-zinc-650 font-semibold tracking-wide leading-relaxed select-none italic group-hover/consent:text-zinc-900 transition-colors">
                    {t('contact.consentText')}{' '}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/privatums');
                      }}
                      className="text-yellow-600 underline hover:text-zinc-900 transition-colors decoration-yellow-600/50 underline-offset-4"
                    >
                      {t('contact.privacyLink')}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!consent || status === 'submitting'}
                  className={`w-full py-4 font-black tracking-widest flex items-center justify-center transition-all group text-sm uppercase ${status === 'submitting' ? 'bg-zinc-200 text-zinc-400' : consent ? 'bg-zinc-950 text-white hover:bg-yellow-500 hover:text-zinc-950 hover:scale-[1.005] active:scale-[0.995]' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'}`}
                >
                  {status === 'submitting' ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('contact.submitting')}
                    </span>
                  ) : (
                    <>{t('contact.submitBtn')} <Send size={16} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="w-full max-w-4xl text-center">
            <h3 className="text-xl font-black italic leading-none mb-6 tracking-tighter text-zinc-950 uppercase">
              {t('contact.infoTitle')} <span className="text-yellow-600">{t('contact.infoSubtitle')}</span>
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mx-auto w-fit">
              <a href="tel:+37126739899" className="flex items-center space-x-6 group bg-white border border-zinc-200 p-4 md:px-8 shadow-sm hover:border-yellow-500 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-yellow-500 flex items-center justify-center shrink-0 group-hover:bg-zinc-950 transition-colors rounded-none shadow-sm">
                  <Phone className="text-zinc-950 group-hover:text-white transition-colors animate-pulse" size={24} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] tracking-widest text-zinc-400 font-black uppercase mb-1 italic">{t('contact.callUs')}</div>
                  <div className="text-base sm:text-lg font-black italic text-zinc-950 group-hover:text-yellow-600 transition-colors">+371 26 739 899</div>
                </div>
              </a>

              <a href="mailto:services@avenuegroup.lv" className="flex items-center space-x-6 group bg-white border border-zinc-200 p-4 md:px-8 shadow-sm hover:border-yellow-500 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-yellow-500 flex items-center justify-center shrink-0 group-hover:bg-zinc-950 transition-colors rounded-none shadow-sm">
                  <Mail className="text-zinc-950 group-hover:text-white transition-colors" size={24} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] tracking-widest text-zinc-400 font-black uppercase mb-1 italic">{t('contact.writeUs')}</div>
                  <div className="text-base sm:text-lg font-black italic text-zinc-950 group-hover:text-yellow-600 transition-colors">services@avenuegroup.lv</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
