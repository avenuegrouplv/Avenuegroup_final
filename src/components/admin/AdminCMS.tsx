import React, { useState, useEffect } from "react";
import {
  Lock,
  User,
  LogOut,
  FolderOpen,
  Languages,
  Image as ImageIcon,
  Send,
  Users,
  Terminal,
  Settings,
  Shield,
  Menu,
  X,
  Compass,
  CheckCircle,
  AlertCircle,
  Globe,
  Database,
  FileJson
} from "lucide-react";

import { AdminTranslations } from "./AdminTranslations";
import { AdminMedia } from "./AdminMedia";
import { AdminJSONEditor } from "./AdminJSONEditor";
import { AdminPublish } from "./AdminPublish";
import { AdminUsers } from "./AdminUsers";
import { AdminLogs } from "./AdminLogs";

type CMSView = "pages" | "articles" | "documents" | "json" | "translations" | "media" | "publish" | "users" | "logs" | "settings";

export const AdminCMS: React.FC = () => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("cms_auth_token"));
  const [userEmail, setUserEmail] = useState<string | null>(sessionStorage.getItem("cms_user_email"));
  const [userRole, setUserRole] = useState<string | null>(sessionStorage.getItem("cms_user_role"));

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState<CMSView>("pages");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<any>({
    sections: {
      texts: true,
      destinations: true,
      blogs: true,
      reviews: true,
      galleries: true,
      seo: true,
      contacts: true,
      menus: true,
      footer: true,
      allJson: true
    }
  });

  // Developer settings states
  const [savedSettings, setSavedSettings] = useState<any>({
    githubToken: "",
    githubRepo: "",
    githubBranch: "main"
  });
  const [devSettingsSaved, setDevSettingsSaved] = useState(false);

  // Check login session details on mount
  useEffect(() => {
    if (token) {
      // Validate token & load configurations
      fetch("/api/cms/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Session expired or invalid response");
          }
          return res.json();
        })
        .then((data) => {
          setUserEmail(data.email);
          setUserRole(data.role);
          fetchCMSConfig(token);
        })
        .catch(() => {
          handleLogout();
        });
    }

    // Load Fallback settings from localStorage
    try {
      const localDev = localStorage.getItem("cms_dev_settings");
      if (localDev) {
        setSavedSettings(JSON.parse(localDev));
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchCMSConfig = (authToken: string) => {
    fetch("/api/cms/config", {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid CMS configuration response");
        }
        return res.json();
      })
      .then((data) => {
        if (data.sections) {
          setConfig(data);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);

    try {
      const res = await fetch("/api/cms/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "CMS serveris šajā vidē nav pieejams. Satura rediģēšanai, lūdzu, izmantojiet savu izstrādes/priekšskatījuma saiti (Development/Shared App URL), kurā visas izmaiņas tiks saglabātas un automātiski sinhronizētas."
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Pieslēgšanās neizdevās");
      }

      setToken(data.token);
      setUserEmail(data.email);
      setUserRole(data.role);

      sessionStorage.setItem("cms_auth_token", data.token);
      sessionStorage.setItem("cms_user_email", data.email);
      sessionStorage.setItem("cms_user_role", data.role);

      fetchCMSConfig(data.token);
    } catch (err: any) {
      setAuthError(err.message || "Nepareizs e-pasts vai parole.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (token) {
      fetch("/api/cms/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setToken(null);
    setUserEmail(null);
    setUserRole(null);
    sessionStorage.removeItem("cms_auth_token");
    sessionStorage.removeItem("cms_user_email");
    sessionStorage.removeItem("cms_user_role");
  };

  const saveDeveloperSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("cms_dev_settings", JSON.stringify(savedSettings));
      setDevSettingsSaved(true);
      setTimeout(() => setDevSettingsSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSectionConfig = (sectionName: string) => {
    const updatedConfig = {
      ...config,
      sections: {
        ...config.sections,
        [sectionName]: !config.sections[sectionName]
      }
    };
    setConfig(updatedConfig);

    // Save configuration server-side
    fetch("/api/cms/config", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedConfig)
    }).catch((err) => console.error("Failed to save config server-side:", err));
  };

  // Render Login view if unauthenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 relative select-none">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#121215] border border-zinc-800 p-8 rounded-3xl shadow-2xl relative space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2.5xl font-black text-white tracking-tight font-sans">
              Pieslēgties CMS
            </h1>
            <p className="text-xs text-zinc-500">
              Ievadiet savus piekļuves datus, lai veiktu lapas izmaiņas.
            </p>
          </div>

          {authError && (
            <div className="bg-red-950/40 border border-red-900/60 p-4 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2.5 leading-relaxed font-sans animate-shake whitespace-pre-line">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-wider font-bold text-zinc-500">
                E-pasts
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vards.uzvards@avenuegroup.lv"
                  className="w-full bg-[#18181b] border border-zinc-800 focus:border-yellow-500 focus:outline-none pl-11 pr-4 py-3 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 transition duration-150 font-sans"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-wider font-bold text-zinc-500">
                Parole
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#18181b] border border-zinc-800 focus:border-yellow-500 focus:outline-none pl-11 pr-4 py-3 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 transition duration-150 font-sans"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 py-3 rounded-xl font-bold transition duration-150 text-sm shadow-lg shadow-yellow-500/10 cursor-pointer select-none active:scale-[0.98]"
            >
              {loggingIn ? "Savieno..." : "Pieslēgties sistēmai"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active view dispatcher helper
  const renderActiveView = () => {
    // If client tries to access admin-only view, bypass and force pages
    if (userRole !== "admin" && ["json", "users", "logs", "settings"].includes(currentView)) {
      return <AdminJSONEditor token={token!} defaultFile="pages.json" hideSelector={true} />;
    }

    switch (currentView) {
      case "pages":
        return <AdminJSONEditor token={token!} defaultFile="pages.json" hideSelector={true} />;
      case "articles":
        return <AdminJSONEditor token={token!} defaultFile="articles.json" hideSelector={true} />;
      case "documents":
        return <AdminJSONEditor token={token!} defaultFile="documents.json" hideSelector={true} />;
      case "json":
        return <AdminJSONEditor token={token!} />;
      case "translations":
        return <AdminTranslations token={token!} onLogAction={() => {}} />;
      case "media":
        return <AdminMedia token={token!} />;
      case "publish":
        return <AdminPublish token={token!} />;
      case "users":
        return <AdminUsers token={token!} currentUserEmail={userEmail || ""} />;
      case "logs":
        return <AdminLogs token={token!} />;
      case "settings":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 align-top">
            {/* System Sections Toggle Configuration */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-yellow-500" />
                CMS Sadaļu Konfigurācija
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Ieslēdziet vai izslēdziet konkrētas CMS sadaļas, kas būs pieejamas Klientiem satura rediģēšanai.
              </p>

              <div className="space-y-2.5 divide-y divide-zinc-800/40">
                {Object.keys(config.sections).map((sec) => (
                  <div key={sec} className="flex items-center justify-between pt-2.5">
                    <span className="text-xs font-mono text-zinc-300 uppercase">
                      {sec.replace(/([A-Z])/g, " $1")}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.sections[sec]}
                      onChange={() => toggleSectionConfig(sec)}
                      className="w-4.5 h-4.5 accent-yellow-500 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Developer Settings Form */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 relative">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-red-500 animate-pulse" />
                Sistēmas savienojuma iestatījumi
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Šie dati tiek droši saglabāti <strong>tikai un vienīgi Jūsu pārlūka atmiņā</strong> un nekad netiek rādīti parastajiem lietotājiem. Tie nepieciešami tiešai satura sinhronizācijai ar tiešsaistes lapu.
              </p>

              {devSettingsSaved && (
                <div className="bg-emerald-950/40 border border-emerald-800 p-3.5 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 font-sans">
                  <CheckCircle className="w-4.5 h-4.5" />
                  Sinhronizācijas iestatījumi saglabāti lokāli!
                </div>
              )}

              <form onSubmit={saveDeveloperSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-bold text-zinc-400">Sinhronizācijas Ceļš (Repo)</label>
                  <input
                    type="text"
                    value={savedSettings.githubRepo}
                    onChange={(e) => setSavedSettings({ ...savedSettings, githubRepo: e.target.value })}
                    placeholder="lietotajs/krātuve"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-100 font-mono transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-bold text-zinc-400">Sinhronizācijas Kanāls</label>
                  <input
                    type="text"
                    value={savedSettings.githubBranch}
                    onChange={(e) => setSavedSettings({ ...savedSettings, githubBranch: e.target.value })}
                    placeholder="main"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-100 font-mono transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-bold text-zinc-400">Sistēmas piekļuves atslēga</label>
                  <input
                    type="password"
                    value={savedSettings.githubToken}
                    onChange={(e) => setSavedSettings({ ...savedSettings, githubToken: e.target.value })}
                    placeholder="atslega_••••••••••••••••••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-100 font-mono transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-zinc-950 py-2.5 rounded-xl transition text-xs font-bold"
                >
                  Saglabāt Pārlūkprogrammā
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return <AdminJSONEditor token={token} />;
    }
  };

  return (
    <div id="integrated-cms-app-root" className="min-h-screen bg-[#0c0c0e] text-[#fafafa] flex font-sans select-none relative">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111113] border-r border-zinc-850 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:h-screen flex flex-col justify-between ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6 py-6 flex-1 flex flex-col">
          {/* Sidebar Top Logo */}
          <div className="px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-500 flex items-center justify-center text-zinc-950 font-black text-sm">
                A
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-sm">Avenue CMS</span>
                <span className="text-[9px] block text-zinc-500 font-mono leading-none">Internal v1.0</span>
              </div>
            </div>
            <button className="lg:hidden text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="mx-4 p-3 bg-zinc-950/40 rounded-2xl border border-zinc-850/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-zinc-200 truncate leading-none mb-1">{userEmail}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-yellow-500 font-mono uppercase bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded leading-none">
                <Shield className="w-2.5 h-2.5" />
                {userRole === "admin" ? "Administrators" : "Klients"}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => {
                setCurrentView("pages");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                currentView === "pages"
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Lapas un Bloki
            </button>

            <button
              onClick={() => {
                setCurrentView("articles");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                currentView === "articles"
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
              }`}
            >
              <FileJson className="w-4 h-4" />
              Emuāri un Raksti
            </button>

            <button
              onClick={() => {
                setCurrentView("documents");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                currentView === "documents"
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
              }`}
            >
              <Compass className="w-4 h-4" />
              Līgumi un Dokumenti
            </button>

            <div className="h-px bg-zinc-850/60 my-2.5 mx-3" />

            {config.sections.texts && (
              <button
                onClick={() => {
                  setCurrentView("translations");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                  currentView === "translations"
                    ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
                }`}
              >
                <Languages className="w-4 h-4" />
                Valodu Tulkojumi
              </button>
            )}

            <button
              onClick={() => {
                setCurrentView("media");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                currentView === "media"
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Mediju Bibliotēka
            </button>

            <button
              onClick={() => {
                setCurrentView("publish");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                currentView === "publish"
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
              }`}
            >
              <Send className="w-4 h-4" />
              Melnraksti / Publicēt
            </button>

            {/* Admin only views */}
            {userRole === "admin" && (
              <>
                <div className="h-px bg-zinc-850 my-3 mx-3" />

                {config.sections.allJson && (
                  <button
                    onClick={() => {
                      setCurrentView("json");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                      currentView === "json"
                        ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
                    }`}
                  >
                    <Database className="w-4 h-4 text-purple-500" />
                    Uzlabotais JSON Redaktors
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentView("users");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                    currentView === "users"
                      ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Lietotāji
                </button>

                <button
                  onClick={() => {
                    setCurrentView("logs");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                    currentView === "logs"
                      ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  Sistēmas Žurnāls
                </button>

                <button
                  onClick={() => {
                    setCurrentView("settings");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                    currentView === "settings"
                      ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20 border border-transparent"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  CMS Iestatījumi
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-zinc-850">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Iziet no sistēmas
          </button>
        </div>
      </aside>

      {/* Main Panel Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header bar */}
        <header className="lg:hidden bg-[#111113] border-b border-zinc-850 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded bg-yellow-500 flex items-center justify-center text-zinc-950 font-black text-xs">
              A
            </div>
            <span className="font-extrabold text-white text-sm">Avenue CMS</span>
          </div>
          <button className="text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Pane container */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
