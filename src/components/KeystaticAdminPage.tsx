import React, { useState, useEffect } from 'react';
import { Keystatic } from '@keystatic/core/ui';
import keystaticConfig from '../../keystatic.config';
import { LogOut, Lock, ArrowLeft } from 'lucide-react';

export default function KeystaticAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if we are running in development preview or localhost where Netlify Identity shouldn't block
  const isDevPreview = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.includes('.run.app') || 
    window.location.hostname.includes('gitpod.io');

  useEffect(() => {
    // If in development preview, we automatically set a mock user to bypass
    if (isDevPreview) {
      setUser({ email: 'dev@avenuegroup.lv', user_metadata: { full_name: 'Developer Preview' } });
      setLoading(false);
      return;
    }

    const netlifyIdentity = (window as any).netlifyIdentity;

    if (!netlifyIdentity) {
      // Wait a bit in case the script is still loading
      const interval = setInterval(() => {
        if ((window as any).netlifyIdentity) {
          clearInterval(interval);
          initIdentity();
        }
      }, 200);
      return () => clearInterval(interval);
    } else {
      initIdentity();
    }

    function initIdentity() {
      const ni = (window as any).netlifyIdentity;
      ni.init();
      
      const currentUser = ni.currentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);

      const handleLogin = (loggedUser: any) => {
        setUser(loggedUser);
        ni.close();
      };

      const handleLogout = () => {
        setUser(null);
      };

      ni.on('login', handleLogin);
      ni.on('logout', handleLogout);

      return () => {
        ni.off('login', handleLogin);
        ni.off('logout', handleLogout);
      };
    }
  }, [isDevPreview]);

  const handleOpenLogin = () => {
    const ni = (window as any).netlifyIdentity;
    if (ni) {
      ni.open('login');
    } else {
      alert('Netlify Identity paplašinājums netika atrasts. Lūdzu pārliecinieties, ka esat tiešsaistē.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-200 font-sans p-6">
        <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Pārbauda autorizāciju...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-sans p-6 relative overflow-hidden">
        {/* Subtle grid pattern background for technical clean depth, not tied to brand colors */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-7 shadow-xl relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-zinc-300" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Satura pārvaldības sistēma</h1>
            <p className="text-xs text-zinc-400 mt-1">Autorizācija nepieciešama, lai veiktu izmaiņas</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleOpenLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-200 cursor-pointer text-sm"
            >
              Pieslēgties ar e-pastu un paroli
            </button>

            <div className="pt-4 border-t border-zinc-800/80 flex justify-center">
              <a 
                href="/" 
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Atgriezties mājaslapā
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Dynamic floating logout utility */}
      <button
        onClick={() => {
          if (isDevPreview) {
            alert('Šis ir izstrādes režīms. Produkcijas vidē šī poga jūs izrakstīs.');
          } else {
            (window as any).netlifyIdentity?.logout();
          }
        }}
        className="fixed top-3 right-4 z-[9999] flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium tracking-wide bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-md shadow-sm transition-all duration-200"
      >
        <LogOut className="w-3.5 h-3.5" />
        Izrakstīties
      </button>

      <Keystatic config={keystaticConfig as any} />
    </div>
  );
}
