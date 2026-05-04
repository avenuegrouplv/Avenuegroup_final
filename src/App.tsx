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
import DocumentStore from './components/DocumentStore';
import CheckoutPage from './components/CheckoutPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import { LanguageProvider } from './LanguageContext';

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
      <DocumentStore />
      <AvenueBenefits />
      <FAQPage isPreview={true} />
      <ContactPage isEmbedded={true} />
    </>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/sakums';
  const isSpecialPage = !isHomePage;

  return (
    <div id="top" className="min-h-screen selection:bg-zinc-700 selection:text-white bg-[#141414]">
      <Header />
      <main className={isSpecialPage ? 'pt-24 md:pt-32' : 'pt-0'}>
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
          <Route path="/iegade/:docId" element={<CheckoutPage />} />
          <Route path="/pakalpojuma-noteikumi" element={<TermsOfServicePage />} />
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