import React, { useState, useEffect } from 'react';
import { Keystatic } from '@keystatic/core/ui';
import keystaticConfig from '../../keystatic.config';
import { LogOut, Lock, ArrowLeft } from 'lucide-react';

export default function KeystaticAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if we are running in development preview or localhost where Netlify Identity shouldn't block
  // We only bypass on localhost and 127.0.0.1 to let users test Netlify Identity on Cloud Run preview URLs,
  // and we NEVER bypass if there is an identity hash in the URL (e.g. password recovery).
  const hasIdentityHash = window.location.hash && (
    window.location.hash.includes('recovery_token=') ||
    window.location.hash.includes('invite_token=') ||
    window.location.hash.includes('confirmation_token=') ||
    window.location.hash.includes('email_change_token=')
  );

  const isDevPreview = 
    !hasIdentityHash && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    );

  useEffect(() => {
    // If in development preview, we automatically set a mock user to bypass
    if (isDevPreview) {
      setUser({ email: 'dev@avenuegroup.lv', user_metadata: { full_name: 'Developer Preview' } });
      setLoading(false);
      return;
    }

    const ni = (window as any).netlifyIdentity;

    if (ni) {
      initIdentity(ni);
    } else {
      // Wait a bit in case the script is still loading, but prevent infinite hang
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const currentNi = (window as any).netlifyIdentity;
        if (currentNi) {
          clearInterval(interval);
          initIdentity(currentNi);
        } else if (attempts > 15) { // Force load UI after 3 seconds to avoid "long thinking"
          clearInterval(interval);
          setLoading(false);
        }
      }, 200);
      return () => clearInterval(interval);
    }

    function initIdentity(instance: any) {
      if (!(window as any)._netlifyIdentityInitialized) {
        try {
          instance.init();
          (window as any)._netlifyIdentityInitialized = true;
        } catch (e) {
          console.log('Netlify Identity already initialized', e);
        }
      }
      
      const currentUser = instance.currentUser();
      if (currentUser) {
        // Validate and refresh the token to make sure the session is active
        currentUser.jwt()
          .then((token: string) => {
            if (token) {
              setUser(currentUser);
              setLoading(false);
            } else {
              try { instance.logout(); } catch (e) {}
              setUser(null);
              setLoading(false);
            }
          })
          .catch((err: any) => {
            console.error('Failed to validate token:', err);
            try { instance.logout(); } catch (e) {}
            setUser(null);
            setLoading(false);
          });
      } else {
        setUser(null);
        setLoading(false);
        // Auto-open login dialog for user convenience so they don't have to wait or click
        setTimeout(() => {
          try {
            instance.open('login');
          } catch (err) {
            console.error(err);
          }
        }, 300);
      }

      const handleLogin = (loggedUser: any) => {
        setUser(loggedUser);
        instance.close();
      };

      const handleLogout = () => {
        setUser(null);
      };

      instance.on('login', handleLogin);
      instance.on('logout', handleLogout);

      return () => {
        instance.off('login', handleLogin);
        instance.off('logout', handleLogout);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 text-zinc-900 font-sans p-6">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Pārbauda autorizāciju...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 text-zinc-900 font-sans p-6">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-lg p-7 shadow-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Lock className="w-5 h-5 text-zinc-600" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Satura pārvaldības sistēma</h1>
            <p className="text-xs text-zinc-500 mt-1">Autorizācija nepieciešama, lai veiktu izmaiņas</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleOpenLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-md shadow-md hover:shadow-lg border border-zinc-950 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer text-sm"
            >
              Pieslēgties ar e-pastu un paroli
            </button>

            <div className="pt-4 border-t border-zinc-100 flex justify-center">
              <a 
                href="/" 
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
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
    <div className="relative min-h-screen bg-zinc-50 text-zinc-900 font-sans">
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
