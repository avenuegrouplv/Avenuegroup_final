// Avenue Group Application
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { AvenueBenefits } from './components/AvenueBenefits';
import { Services } from './components/Services';
import { ServicesPage } from './components/ServicesPage';
import { FAQPage } from './components/FAQPage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { CookiePolicyPage } from './components/CookiePolicyPage';
import { UsefulInfoPage } from './components/UsefulInfoPage';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { LanguageProvider } from './LanguageContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <About />
      <AvenueBenefits />
      <Services />
      <FAQPage isPreview={true} />
      <ContactPage isEmbedded={true} />
    </>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isSpecialPage = location.pathname !== '/' && location.pathname !== '/sakums';

  return (
    <div id="top" className="min-h-screen selection:bg-zinc-700 selection:text-white bg-[#0a0a0a]">
      <Header />
      <main className={isSpecialPage ? 'pt-24' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sakums" element={<Home />} />
          <Route path="/par-mums" element={<About isStandalone={true} />} />
          <Route path="/pakalpojumi" element={<ServicesPage />} />
          <Route path="/buj" element={<FAQPage />} />
          <Route path="/kontakti" element={<ContactPage />} />
          <Route path="/privatums" element={<PrivacyPolicyPage />} />
          <Route path="/sikdatnes" element={<CookiePolicyPage />} />
          <Route path="/noderigi" element={<UsefulInfoPage />} />
          <Route path="/noderigi/:slug" element={<UsefulInfoPage />} />
        </Routes>
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