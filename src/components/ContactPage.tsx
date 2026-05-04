import React, { useState } from 'react';
import { Send, Phone, Mail, MapPin, ArrowLeft, Info, Check } from 'lucide-react';
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
      <section className={`bg-[#141414] flex items-center justify-center ${isEmbedded ? 'py-32' : 'min-h-[80vh] pt-32'}`}>
        <div className="container mx-auto px-6 max-w-2xl text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-yellow-400 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(179,130,7,0.3)]">
            <Check size={48} className="text-black stroke-[3px]" />
          </div>
          <h2 className="text-base md:text-xl font-black italic leading-tight mb-6 tracking-tighter text-white">
            {t('contact.successTitle')}
          </h2>
          <p className="text-lg text-gray-400 mb-12 font-bold italic leading-relaxed">
            {t('contact.successMessage')}
          </p>
          <button 
            onClick={() => {
              setStatus('idle');
              setFormData({ name: '', company: '', email: '', phone: '', message: '' });
              setConsent(false);
            }}
            className="text-yellow-400 font-black tracking-widest text-xs border-b-2 border-yellow-400 pb-1 hover:text-white hover:border-white transition-colors"
          >
            {t('contact.newRequestBtn')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakti" className={`bg-[#141414] relative ${isEmbedded ? 'pt-10 pb-16 border-t border-white/5' : 'min-h-screen pt-24 md:pt-32 pb-16'}`}>
      <div className="container mx-auto px-6">
        {!isEmbedded && (
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-yellow-400 font-bold tracking-widest text-xs mb-8 hover:text-white transition-colors font-sans"
          >
            <ArrowLeft size={18} className="mr-2" /> {t('contact.backBtn')}
          </button>
        )}

        {/* Centered Header Block with mixed colors */}
        <div className="max-w-4xl mb-10 text-center mx-auto">
          <h2 className="text-lg md:text-3xl font-black italic leading-[1.1] mb-10 tracking-tighter text-white">
            <div className="mb-1 md:mb-2">{t('contact.title')}</div>
            <div className="text-yellow-400">{t('contact.subtitle')}</div>
          </h2>
          <div className="text-lg md:text-xl text-gray-300 font-bold italic leading-tight max-w-3xl mx-auto">
            <div>{t('contact.formTitle')}</div>
            <div>{t('contact.formSubtitle')}</div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-16">
          <div className="w-full max-w-2xl">
            {/* Form Container with Light Gray Tone bg-zinc-800 */}
            <div className="bg-[#222222] p-4 md:p-6 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[120px]"></div>
              <h3 className="text-lg font-black italic mb-4 tracking-tighter relative z-10 text-white text-center">{t('contact.formBoxTitle')}</h3>
              
              <form 
                name="contact"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit} 
                className="space-y-4 relative z-10"
              >
                <input type="hidden" name="form-name" value="contact" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-black tracking-widest text-zinc-100 italic transition-colors">{t('contact.labelName')}</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#141414] border-b-2 border-white/20 p-3 outline-none transition-all text-white text-lg focus:bg-black/90"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-black tracking-widest text-zinc-100 italic transition-colors">{t('contact.labelCompany')}</label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full bg-[#141414] border-b-2 border-white/20 p-3 outline-none transition-all text-white text-lg focus:bg-black/90"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-black tracking-widest text-zinc-100 italic transition-colors">{t('contact.labelEmail')}</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#141414] border-b-2 border-white/20 p-3 outline-none transition-all text-white text-lg focus:bg-black/90"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-black tracking-widest text-zinc-100 italic transition-colors">{t('contact.labelPhone')}</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#141414] border-b-2 border-white/20 p-3 outline-none transition-all text-white text-lg focus:bg-black/90"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black tracking-widest text-zinc-100 italic transition-colors">{t('contact.labelMessage')}</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-[#141414] border-b-2 border-white/20 p-3 outline-none transition-all text-white text-lg resize-none focus:bg-black/90"
                    ></textarea>
                </div>

                <div className="flex items-start space-x-3 cursor-pointer group/consent" onClick={() => setConsent(!consent)}>
                  <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${consent ? 'bg-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(179,130,7,0.5)]' : 'border-white/30 bg-black group-hover/consent:border-white/60'}`}>
                    {consent && <Check size={14} className="text-black font-black" />}
                  </div>
                  <div className="text-xs text-zinc-100 font-bold tracking-widest leading-relaxed select-none italic group-hover/consent:text-white transition-colors">
                    {t('contact.consentText')}{' '}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/privatums');
                      }}
                      className="text-yellow-400 underline hover:text-white transition-colors decoration-yellow-400/50 underline-offset-4"
                    >
                      {t('contact.privacyLink')}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!consent || status === 'submitting'}
                  className={`w-full py-4 font-black tracking-widest flex items-center justify-center transition-all group text-lg shadow-2xl ${status === 'submitting' ? 'bg-zinc-700 text-zinc-400' : consent ? 'bg-zinc-700 text-white hover:bg-zinc-600 hover:scale-[1.01] active:scale-[0.99]' : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-white/5'}`}
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
                    <>{t('contact.submitBtn')} <Send size={20} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="w-full max-w-4xl text-center">
            <h3 className="text-base md:text-lg font-black italic leading-[1.15] mb-6 tracking-tighter text-white">
              {t('contact.infoTitle')} <span className="text-yellow-400">{t('contact.infoSubtitle')}</span>
            </h3>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-center space-y-8 md:space-y-0 md:space-x-16 mx-auto w-fit">
              <a href="tel:+37126739899" className="flex items-center space-x-6 group">
                <div className="w-14 h-14 bg-yellow-400 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors shadow-lg">
                  <Phone className="text-black group-hover:text-white transition-colors" size={24} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] tracking-widest text-gray-500 font-bold mb-1 italic">{t('contact.callUs')}</div>
                  <div className="text-base sm:text-lg font-black italic text-white group-hover:text-yellow-400 transition-colors">+371 26 739 899</div>
                </div>
              </a>

              <a href="mailto:services@avenuegroup.lv" className="flex items-center space-x-6 group">
                <div className="w-14 h-14 bg-yellow-400 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors shadow-lg">
                  <Mail className="text-black group-hover:text-white transition-colors" size={24} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] tracking-widest text-gray-500 font-bold mb-1 italic">{t('contact.writeUs')}</div>
                  <div className="text-base sm:text-lg font-black italic text-white group-hover:text-yellow-400 transition-colors">services@avenuegroup.lv</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
