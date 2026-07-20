import React, { useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import servicesData from '../data/content/services.json';

export const ServicesPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const scrollToId = queryParams.get('id') ? parseInt(queryParams.get('id')!) : null;

  const content = servicesData.translations[language] || servicesData.translations['lv'];
  const images = servicesData.images || [];

  const services = (content.items || []).map((item: any, index: number) => ({
    ...item,
    image: images[index] || ''
  }));

  React.useEffect(() => {
    services.forEach((service: any) => {
      if (service.image) {
        const img = new Image();
        img.src = service.image;
      }
    });
  }, [services]);

  useEffect(() => {
    document.title = `${content.title} ${content.subtitle} | Avenue Group`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', content.description || 'Avenue Group piedāvā profesionālus nekustamo īpašumu apsaimniekošanas, pārvaldības un juridiskā atbalsta pakalpojumus Latvijā.');
    }

    if (scrollToId !== undefined && scrollToId !== null) {
      setTimeout(() => {
        const el = document.getElementById(`service-${scrollToId}`);
        if (el) {
          const yOffset = -100;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      document.title = 'Avenue Group | Komercīpašumu un privātīpašumu apsaimniekošana';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Avenue Group - nekustamo īpašumu apsaimniekošanas un pārvaldības pakalpojumi komercīpašumiem un privātīpašumiem Latvijā. Profesionāls juridiskais atbalsts un individuāla pieeja.');
      }
    };
  }, [scrollToId, content]);

  return (
    <div id="pakalpojumi" className="bg-[#ebebeb] min-h-screen text-zinc-900 pb-20 relative overflow-hidden">

      {/* Page Header */}
      <section className="pb-16 border-b border-zinc-200 relative z-10">
        <div className="container mx-auto px-6">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            <span>{content.backBtn}</span>
          </button>
          <h1 className="text-3xl md:text-5xl font-black italic leading-[1.1] tracking-tighter text-zinc-950 uppercase">
            {content.title} <span className="text-yellow-600">{content.subtitle}</span>
          </h1>
          {content.description && (
            <p className="text-lg md:text-xl text-zinc-650 mt-8 max-w-3xl leading-relaxed italic font-medium">
              {content.description}
            </p>
          )}
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-24">
            {services.map((service: any, index: number) => (
              <React.Fragment key={service.id}>
                <div id={`service-${service.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start bg-white border border-zinc-200 p-6 md:p-12 shadow-sm">
                  
                  <div className="order-2 lg:order-2 flex flex-col">
                    <div className="relative overflow-hidden aspect-[16/9] w-full mb-6 border border-zinc-150">
                      <img 
                        src={service.image} 
                        alt={`${service.title} - Avenue Group`} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="h-[2px] w-full bg-yellow-500 mb-6"></div>
                    {service.costTitle && (
                      <div className="bg-zinc-50 border border-zinc-200 p-6">
                        <h3 className={`text-base font-black italic leading-none mb-3 text-zinc-950 uppercase ${language === 'ru' ? 'font-sans font-black tracking-normal md:text-lg' : ''}`}>{service.costTitle}</h3>
                        <p className="text-zinc-650 text-sm md:text-base leading-relaxed italic font-medium">
                          {service.costText}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="order-1 lg:order-1">
                    <h2 className={`text-2xl md:text-3xl font-black italic leading-none mb-8 tracking-tighter text-zinc-950 uppercase ${language === 'ru' ? 'font-sans font-black tracking-normal text-2xl md:text-3xl' : ''}`}>
                      {service.title}
                    </h2>
                    <div>
                      {service.intro && (
                        <p className="text-zinc-650 text-sm md:text-base leading-relaxed italic mb-8 whitespace-pre-line font-medium">
                          {service.intro}
                        </p>
                      )}
                      
                      <ul className="space-y-4 mb-8">
                        {service.points.map((point: string, pIdx: number) => (
                          <li key={pIdx} className="flex items-start space-x-4">
                            <CheckCircle2 className="text-yellow-600 shrink-0 mt-1" size={20} />
                            <span className="text-zinc-700 text-sm md:text-base leading-snug italic font-medium">{point}</span>
                          </li>
                        ))}
                      </ul>

                      {service.outro && (
                        <p className="text-zinc-650 text-sm md:text-base leading-relaxed italic whitespace-pre-line font-medium border-t border-zinc-100 pt-6">
                          {service.outro}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="mt-20 md:mt-28 flex flex-col items-start bg-white border border-zinc-200 p-6 md:p-8 shadow-sm">
             <div className="w-[10cm] h-[2px] bg-yellow-500 mb-6"></div>
             <p className="text-zinc-500 text-xs md:text-sm italic leading-relaxed text-left font-bold">{content.vatText}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
