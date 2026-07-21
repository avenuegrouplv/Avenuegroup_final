// Avenue Group Application
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { AvenueBenefits } from './components/AvenueBenefits';
import { Services } from './components/Services';
import { FAQPage } from './components/FAQPage';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import DocumentStore from './components/DocumentStore';
import { LanguageProvider, useLanguage } from './LanguageContext';
import seoData from './data/content/seo.json';

// Sub-pages are lazy loaded to shrink initial bundle size and optimize FCP/LCP
const ServicesPage = React.lazy(() => import('./components/ServicesPage').then(module => ({ default: module.ServicesPage })));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));
const CookiePolicyPage = React.lazy(() => import('./components/CookiePolicyPage').then(module => ({ default: module.CookiePolicyPage })));
const UsefulInfoPage = React.lazy(() => import('./components/UsefulInfoPage').then(module => ({ default: module.UsefulInfoPage })));
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage'));
const TermsOfServicePage = React.lazy(() => import('./components/TermsOfServicePage'));
const ContractTemplatesPage = React.lazy(() => import('./components/ContractTemplatesPage').then(module => ({ default: module.ContractTemplatesPage })));
const CustomDynamicPage = React.lazy(() => import('./components/CustomDynamicPage').then(module => ({ default: module.CustomDynamicPage })));
const AdminPage = React.lazy(() => import('./components/AdminPage'));

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <AvenueBenefits />
      {/* <DocumentStore /> - Hidden for now */}
      <FAQPage isPreview={true} />
      <ContactPage isEmbedded={true} />
    </>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const isHomePage = location.pathname === '/' || location.pathname === '/sakums';
  const isSpecialPage = !isHomePage;

  useEffect(() => {
    // Dynamic SEO Metadata for Avenue Group routes based on language and pathname
    const path = location.pathname;
    let title = '';
    let description = '';

    if (path === '/' || path === '/sakums') {
      const seoContent = seoData.translations[language] || seoData.translations['lv'];
      title = seoContent.title;
      description = seoContent.description;
    } else if (path.startsWith('/pakalpojumi')) {
      if (language === 'lv') {
        title = 'Mūsu pakalpojumi | Avenue Group';
        description = 'Pilna servisa nekustamā īpašuma apsaimniekošana, tehniskā uzraudzība, liftu serviss un juridiskie pakalpojumi visā Latvijā.';
      } else if (language === 'ru') {
        title = 'Наши услуги | Avenue Group';
        description = 'Полный спектр услуг по управлению недвижимостью, технический надзор, обслуживание лифтов и юридическая поддержка в Латвии.';
      } else {
        title = 'Our Services | Avenue Group';
        description = 'Full-service real estate management, technical maintenance, elevator services, and legal support across Latvia.';
      }
    } else if (path.startsWith('/ligumu-paraugi')) {
      if (language === 'lv') {
        title = 'Līgumu paraugi | Avenue Group';
        description = 'Profesionāli izstrādāti juridisko līgumu paraugi tūlītējai lejupielādei. Īres, nomas un apsaimniekošanas līgumi.';
      } else if (language === 'ru') {
        title = 'Шаблоны договоров | Avenue Group';
        description = 'Профессионально подготовленные шаблоны договоров для мгновенного скачивания. Договоры аренды и управления.';
      } else {
        title = 'Contract Templates | Avenue Group';
        description = 'Professionally drafted legal contract templates available for instant download. Rental, lease, and management templates.';
      }
    } else if (path.startsWith('/noderigi')) {
      if (language === 'lv') {
        title = 'Noderīga informācija un raksti | Avenue Group';
        description = 'Aktuālie raksti un padomi par nekustamā īpašuma apsaimniekošanu, likumdošanas izmaiņām un pārvaldības tendencēm.';
      } else {
        title = 'Useful Information and Articles | Avenue Group';
        description = 'Latest news, tips, and insights on real estate management, legal changes, and property maintenance in Latvia.';
      }
    } else if (path.startsWith('/buj')) {
      if (language === 'lv') {
        title = 'Biežāk uzdotie jautājumi (BUJ) | Avenue Group';
        description = 'Atbildes uz biežāk uzdotajiem jautājumiem par nekustamo īpašumu apsaimniekošanu, pakalpojumu cenām un līguma slēgšanu.';
      } else if (language === 'ru') {
        title = 'Часто задаваемые вопросы (FAQ) | Avenue Group';
        description = 'Ответы на часто задаваемые вопросы об управлении недвижимостью, ценах и заключении договоров с Avenue Group.';
      } else {
        title = 'Frequently Asked Questions (FAQ) | Avenue Group';
        description = 'Answers to frequently asked questions about real estate management, service prices, and signing contracts in Latvia.';
      }
    } else if (path.startsWith('/kontakti')) {
      if (language === 'lv') {
        title = 'Kontakti un pieteikumi | Avenue Group';
        description = 'Sazinieties ar Avenue Group ekspertiem. Tālrunis +371 26 739 899, e-pasts services@avenuegroup.lv, Brīvības gatve 386 k-2-5A.';
      } else if (language === 'ru') {
        title = 'Контакты | Avenue Group';
        description = 'Свяжитесь со специалистами Avenue Group. Телефон +371 26 739 899, эл. почта services@avenuegroup.lv. Ждем ваших заявок!';
      } else {
        title = 'Contacts and Requests | Avenue Group';
        description = 'Contact Avenue Group property experts. Mobile +371 26 739 899, email services@avenuegroup.lv, Brivibas gatve 386.';
      }
    } else if (path.startsWith('/privatums')) {
      if (language === 'lv') {
        title = 'Privātuma politika | Avenue Group';
        description = 'SIA Avenue Group privātuma politika un lietotāju personas datu aizsardzība atbilstoši vispārīgajai datu aizsardzības regulai (GDPR).';
      } else {
        title = 'Privacy Policy | Avenue Group';
        description = 'SIA Avenue Group privacy policy, ensuring complete protection of your personal and business data under GDPR compliance.';
      }
    } else if (path.startsWith('/sikdatnes')) {
      if (language === 'lv') {
        title = 'Sīkdatņu politika | Avenue Group';
        description = 'Informācija par to, kā un kāpēc mēs izmantojam sīkdatnes (cookies) Avenue Group tīmekļa vietnes lietošanas ērtībai.';
      } else {
        title = 'Cookie Policy | Avenue Group';
        description = 'Learn about our cookie policy and how cookies are utilized to elevate your browsing experience on our platform.';
      }
    } else if (path.startsWith('/pakalpojuma-noteikumi')) {
      if (language === 'lv') {
        title = 'Pakalpojuma sniegšanas noteikumi | Avenue Group';
        description = 'SIA Avenue Group pakalpojumu sniegšanas, dokumentu iegādes un mājaslapas lietošanas noteikumi un nosacījumi.';
      } else {
        title = 'Terms of Service | Avenue Group';
        description = 'SIA Avenue Group terms of service, template purchase terms and website terms & conditions.';
      }
    }

    if (title) {
      document.title = title;
      
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
      
      // Update og:title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
      
      // Update og:description
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', description);
      }
      
      // Update twitter:title
      const twTitle = document.querySelector('meta[property="twitter:title"]');
      if (twTitle) {
        twTitle.setAttribute('content', title);
      }
      
      // Update twitter:description
      const twDesc = document.querySelector('meta[property="twitter:description"]');
      if (twDesc) {
        twDesc.setAttribute('content', description);
      }

      // Update og:url
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', `https://avenuegroup.lv${path}`);
      }

      // Dynamic Canonical URL configuration
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      const cleanPath = path === '/sakums' ? '/' : path.replace(/\/$/, "");
      canonicalLink.setAttribute('href', `https://avenuegroup.lv${cleanPath || '/'}`);
    }
  }, [location.pathname, language]);

  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-white">
        <React.Suspense fallback={
          <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-950 font-sans p-6">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="font-bold tracking-widest text-xs uppercase text-zinc-500">Uzsāk Keystatic...</div>
          </div>
        }>
          <Routes>
            <Route path="/admin/*" element={<AdminPage />} />
          </Routes>
        </React.Suspense>
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen selection:bg-yellow-200 selection:text-zinc-900 bg-[#ebebeb] text-zinc-900">
      <Header />
      <main className={isSpecialPage ? 'pt-[175px] md:pt-[215px]' : 'pt-0'}>
        <React.Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center bg-[#ebebeb] text-zinc-900 font-sans p-6">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="font-bold tracking-widest text-xs uppercase text-zinc-500">Ielādē...</div>
          </div>
        }>
          <Routes>
            {/* Public Site Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sakums" element={<Navigate to="/" replace />} />
            <Route path="/pakalpojumi" element={<ServicesPage />} />
            <Route path="/buj" element={<FAQPage />} />
            <Route path="/kontakti" element={<ContactPage />} />
            <Route path="/privatums" element={<PrivacyPolicyPage />} />
            <Route path="/sikdatnes" element={<CookiePolicyPage />} />
            <Route path="/noderigi" element={<UsefulInfoPage />} />
            <Route path="/noderigi/:slug" element={<UsefulInfoPage />} />
            <Route path="/iegade/:docId" element={<CheckoutPage />} />
            <Route path="/pakalpojuma-noteikumi" element={<TermsOfServicePage />} />
            <Route path="/ligumu-paraugi" element={<ContractTemplatesPage />} />
            <Route path="/lapa/:slug" element={<CustomDynamicPage />} />
          </Routes>
        </React.Suspense>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </LanguageProvider>
  );
};

export default App;