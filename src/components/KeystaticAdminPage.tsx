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
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white font-sans p-6">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm uppercase tracking-widest text-zinc-400">Pārbauda autorizāciju...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white font-sans p-6 relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Avenue Group</h1>
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Administrācijas panelis</p>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-800/40 border border-zinc-800/80 rounded-lg p-4 text-center">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Sistēmas piekļuve ir ierobežota. Lai veiktu izmaiņas mājaslapas saturā, lūdzu, autorizējieties.
              </p>
            </div>

            <button
              onClick={handleOpenLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-yellow-500 text-zinc-950 font-semibold rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-200 cursor-pointer text-sm tracking-wide uppercase"
            >
              Pieslēgties ar e-pastu un paroli
            </button>

            <div className="pt-4 border-t border-zinc-800/60 flex justify-center">
              <a 
                href="/" 
                className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
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
        className="fixed top-3 right-4 z-[9999] flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md shadow-md transition-all duration-200"
      >
        <LogOut className="w-3.5 h-3.5" />
        Izrakstīties ({user.email})
      </button>

      <Keystatic config={keystaticConfig as any} />
    </div>
  );
}
