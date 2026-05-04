import React, { useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const ServicesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get id from query params
  const queryParams = new URLSearchParams(location.search);
  const scrollToId = queryParams.get('id') ? parseInt(queryParams.get('id')!) : null;

  const images = [
    "/assets/apsaimniekosana.jpg",
    "/assets/remontdarbi.jpg",
    "/assets/juridiskie.jpg",
    "/assets/vip.jpg"
  ];

  const services = (t('servicesPage.items') as unknown as any[]).map((item, index) => ({
    ...item,
    image: images[index]
  }));

  React.useEffect(() => {
    services.forEach(service => {
      const img = new Image();
      img.src = service.image;
    });
  }, []);

  useEffect(() => {
    // SEO: Set page title and description
    document.title = `${t('servicesPage.title')} ${t('servicesPage.subtitle')} | Avenue Group`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t('servicesPage.description') || 'Avenue Group piedāvā profesionālus nekustamo īpašumu apsaimniekošanas, pārvaldības un juridiskā atbalsta pakalpojumus Latvijā.');
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

    // Cleanup: Reset title when leaving the component
    return () => {
      document.title = 'Avenue Group | Premium Property Management';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Avenue Group - nekustamo īpašumu apsaimniekošanas un pārvaldības pakalpojumi komercīpašumiem un privātīpašumiem Latvijā. Profesionāls juridiskais atbalsts un individuāla pieeja.');
      }
    };
  }, [scrollToId, t]);

  return (
    <div id="pakalpojumi" className="bg-[#141414] min-h-screen">
      {/* Page Header */}
      <section className="pt-24 md:pt-32 pb-16 border-b border-white/5">
        <div className="container mx-auto px-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-yellow-400 font-bold tracking-widest text-xs mb-12 hover:text-white transition-colors font-sans"
          >
            <ArrowLeft size={18} className="mr-2" /> {t('servicesPage.backBtn')}
          </button>
          <h1 className="text-lg md:text-4xl font-black italic leading-[1.15] tracking-tighter text-white">
            {t('servicesPage.title')} <span className="text-yellow-400">{t('servicesPage.subtitle')}</span>
          </h1>
          {t('servicesPage.description') && (
            <p className="text-lg text-gray-400 mt-8 max-w-3xl leading-relaxed italic font-semibold">
              {t('servicesPage.description')}
            </p>
          )}
        </div>
      </section>

      {/* Services List */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col">
            {services.map((service, index) => (
              <React.Fragment key={service.id}>
                <div id={`service-${service.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                  <div className="order-2 lg:order-2 flex flex-col">
                    <div className="relative overflow-hidden group/img aspect-[16/9] w-full mb-6">
                      <img 
                        src={service.image} 
                        alt={`${service.title} - Avenue Group`} 
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover grayscale opacity-60 group-hover/img:opacity-80 transition-all duration-700 scale-105 group-hover/img:scale-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                    <div className="h-[1px] w-full bg-yellow-400 mb-6"></div>
                    {service.costTitle && (
                      <div className="bg-zinc-900/50 p-6">
                        <h3 className={`text-base font-black italic leading-none mb-3 text-white ${language === 'ru' ? 'font-sans font-black tracking-normal md:text-lg' : ''}`}>{service.costTitle}</h3>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed italic">
                          {service.costText}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="order-1 lg:order-1">
                    <h2 className={`text-base md:text-xl font-black italic leading-none mb-8 tracking-tighter text-white ${language === 'ru' ? 'font-sans font-black tracking-normal text-2xl md:text-3xl' : ''}`}>
                      {service.title}
                    </h2>
                    <div>
                      {service.intro && (
                        <p className="text-gray-300 text-base leading-relaxed italic mb-8 whitespace-pre-line">
                          {service.intro}
                        </p>
                      )}
                      
                      <ul className="space-y-4 mb-8">
                        {service.points.map((point: string, pIdx: number) => (
                          <li key={pIdx} className="flex items-start space-x-4">
                            <CheckCircle2 className="text-yellow-400 shrink-0 mt-1" size={20} />
                            <span className="text-gray-300 text-base leading-snug italic font-medium">{point}</span>
                          </li>
                        ))}
                      </ul>

                      {service.outro && (
                        <p className="text-gray-300 text-base leading-relaxed italic whitespace-pre-line">
                          {service.outro}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {index < services.length - 1 && (
                  <div className="flex justify-center items-center gap-4 my-16 md:my-24 opacity-60">
                    <div className="w-16 md:w-24 h-[1px] bg-yellow-400"></div>
                    <div className="w-16 md:w-24 h-[1px] bg-yellow-400"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-20 md:mt-28 flex flex-col items-start">
             <div className="w-[10cm] h-[1px] bg-yellow-400 mb-6"></div>
             <p className="text-gray-400 text-xs md:text-sm italic leading-relaxed text-left">{t('servicesPage.vatText')}</p>
          </div>
        </div>
      </section>

    </div>
  );
};
