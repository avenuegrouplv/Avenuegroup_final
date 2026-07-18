import React, { useState, useEffect } from "react";
import { Sliders, CheckCircle, AlertCircle, Save, Settings, Globe, FileType, ShieldAlert } from "lucide-react";

interface AdminSettingsProps {
  token: string;
}

interface SystemSettingsData {
  cmsName: string;
  logo: string;
  favicon: string;
  adminEmail: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  maxFileSizeMb: number;
  allowedFileTypes: string[];
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ token }) => {
  const [settings, setSettings] = useState<SystemSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/system-settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt sistēmas iestatījumus." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/cms/system-settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setMessage({ type: "success", text: "Globālie sistēmas iestatījumi saglabāti sekmīgi!" });
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās saglabāt sistēmas iestatījumus." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-950/20 rounded-3xl border border-zinc-900">
        <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Ielādē platformas parametrus...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div id="admin-system-settings" className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl">
        <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-yellow-500" />
          Sistēmas Parametri & Konfigurācija
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Pielāgojiet CMS nosaukumu, logo, noklusējuma formātus, drošības ierobežojumus un failu augšupielādes limitus.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
              : "bg-red-950/40 border-red-800/60 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-semibold">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Settings Box */}
        <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-zinc-850 pb-3">
            <Globe className="w-4 h-4 text-yellow-500" />
            Vispārīgie Uzstādījumi
          </h3>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">CMS Nosaukums</label>
              <input
                type="text"
                required
                value={settings.cmsName}
                onChange={(e) => setSettings({ ...settings, cmsName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Logo Ceļš (URL)</label>
              <input
                type="text"
                required
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Favicon Ceļš (URL)</label>
              <input
                type="text"
                required
                value={settings.favicon}
                onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Administratora Kontakta E-pasts</label>
              <input
                type="email"
                required
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Formats and File Limits Box */}
        <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-zinc-850 pb-3">
            <FileType className="w-4 h-4 text-yellow-500" />
            Lokalizācija & Failu Limiti
          </h3>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Noklusējuma Valoda</label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white cursor-pointer"
                >
                  <option value="lv">Latviešu (LV)</option>
                  <option value="en">English (EN)</option>
                  <option value="de">Deutsch (DE)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Laika Zona</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white cursor-pointer"
                >
                  <option value="Europe/Riga">Rīga (EET/EEST)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Europe/London">Londona (GMT/BST)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Datuma Formāts (PHP/Moment)</label>
              <input
                type="text"
                required
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Augšupielāžu limits (Max MB)</label>
              <input
                type="number"
                required
                value={settings.maxFileSizeMb}
                onChange={(e) => setSettings({ ...settings, maxFileSizeMb: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Atļautie Augšupielāžu Tipi</label>
              <input
                type="text"
                required
                value={settings.allowedFileTypes.join(", ")}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value.split(",").map(s => s.trim()) })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-mono"
              />
              <span className="text-[9px] text-zinc-500">Ievadiet paplašinājumus atdalītus ar komatu (piem. .jpg, .png, .pdf)</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-2xl flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-xs text-zinc-400 leading-normal">
              Šie iestatījumi tiek piemēroti visiem reģistrētajiem CMS lietotājiem un tieši ietekmē satura pārvaldības bibliotēkas un drošības filtrus.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saglabā..." : "Saglabāt Uzstādījumus"}
          </button>
        </div>
      </form>
    </div>
  );
};
