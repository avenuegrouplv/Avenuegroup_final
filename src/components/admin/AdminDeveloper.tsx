import React, { useState, useEffect } from "react";
import { 
  Code, 
  Activity, 
  Globe, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Users, 
  LogOut, 
  Terminal, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  FileText 
} from "lucide-react";
import { AdminLogs } from "./AdminLogs";

interface AdminDeveloperProps {
  token: string;
}

interface DevSettings {
  github: {
    repo: string;
    branch: string;
    token: string;
  };
  netlify: {
    buildHook: string;
    siteId: string;
  };
}

interface ActiveSession {
  id: string;
  email: string;
  role: string;
  ip: string;
  userAgent: string;
  lastActivity: string;
  isCurrent: boolean;
}

interface StatusMetrics {
  cpuUsage: number;
  memoryUsageMb: number;
  memoryLimitMb: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  mediaCount: number;
  mediaBytes: number;
  activeSessions: number;
  backupCount: number;
  databaseSize: number;
}

export const AdminDeveloper: React.FC<AdminDeveloperProps> = ({ token }) => {
  const [settings, setSettings] = useState<DevSettings | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [metrics, setMetrics] = useState<StatusMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, sesRes, mRes] = await Promise.all([
        fetch("/api/cms/developer-settings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/cms/sessions", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/cms/status-metrics", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!sRes.ok || !sesRes.ok || !mRes.ok) throw new Error("Data fetch error");

      const sData = await sRes.json();
      const sesData = await sesRes.json();
      const mData = await mRes.json();

      setSettings(sData);
      setSessions(sesData);
      setMetrics(mData);
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt izstrādātāja vides datus." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/cms/developer-settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setMessage({ type: "success", text: "Mākoņpakalpojumu integrāciju dati saglabāti!" });
      await fetchAllData();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās saglabāt integrāciju datus." });
    } finally {
      setSaving(false);
    }
  };

  const handleKillSession = async (sessionId: string) => {
    if (!window.confirm("Vai tiešām vēlaties piespiedu kārtā atslēgt šo lietotāja sesiju?")) return;

    try {
      const res = await fetch(`/api/cms/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Kill failed");
      setMessage({ type: "success", text: "Aktīvā sesija tika sekmīgi evakuēta!" });
      await fetchAllData();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās pārtraukt sesiju." });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-950/20 rounded-3xl border border-zinc-900">
        <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Ielādē izstrādātāja konsoli un sensorus...</p>
      </div>
    );
  }

  return (
    <div id="admin-developer-settings" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Code className="w-5.5 h-5.5 text-yellow-500" />
            Developer Console (Izstrādātāju Konsole)
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Pārvaldiet reāllaika resursu sensorus, aktīvās lietotāju sesijas, GitHub repozitorija sinhronizāciju un Netlify build ātrdarbību.
          </p>
        </div>
        <button
          onClick={fetchAllData}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Atjaunināt sensorus
        </button>
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

      {/* Sensor Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/30 border border-zinc-850 p-4.5 rounded-2.5xl space-y-1">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">CPU Slodze</span>
              <Cpu className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-xl font-black text-white font-mono">{metrics.cpuUsage.toFixed(1)}%</p>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full rounded-full transition-all" style={{ width: `${Math.min(metrics.cpuUsage, 100)}%` }} />
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-850 p-4.5 rounded-2.5xl space-y-1">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Atmiņas lietojums</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-white font-mono">{metrics.memoryUsageMb.toFixed(0)} MB</p>
            <div className="flex justify-between text-[8.5px] text-zinc-500 font-mono">
              <span>Robeža: {metrics.memoryLimitMb} MB</span>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-850 p-4.5 rounded-2.5xl space-y-1">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Mājaslapas Faili</span>
              <HardDrive className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-xl font-black text-white font-mono">{metrics.mediaCount} faili</p>
            <p className="text-[9px] text-zinc-500 font-mono">Izmērs: {formatBytes(metrics.mediaBytes)}</p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-850 p-4.5 rounded-2.5xl space-y-1">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Sesijas & Dublējumi</span>
              <Users className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-xl font-black text-white font-mono">{metrics.activeSessions} aktīvas</p>
            <p className="text-[9px] text-zinc-500 font-mono">Glabāti dublējumi: {metrics.backupCount}</p>
          </div>
        </div>
      )}

      {/* Settings Forms */}
      {settings && (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub Config */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
              <Globe className="w-5 h-5 text-yellow-500" />
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">GitHub Integrācijas fails</h3>
                <span className="text-[9px] text-zinc-500 font-sans block">Statiskā satura repozitorija sinhronizācija</span>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Repozitorija ceļš (Owner/Repo)</label>
                <input
                  type="text"
                  placeholder="piem. avenue-group/website"
                  value={settings.github.repo}
                  onChange={(e) => setSettings({
                    ...settings,
                    github: { ...settings.github, repo: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Zars (Branch)</label>
                <input
                  type="text"
                  placeholder="main"
                  value={settings.github.branch}
                  onChange={(e) => setSettings({
                    ...settings,
                    github: { ...settings.github, branch: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  placeholder="Neatklāts personīgais marķieris"
                  value={settings.github.token}
                  onChange={(e) => setSettings({
                    ...settings,
                    github: { ...settings.github, token: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Netlify Config */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
              <Sliders className="w-5 h-5 text-yellow-500" />
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Netlify Build redeployment</h3>
                <span className="text-[9px] text-zinc-500 font-sans block">Automātiskās publicēšanas āķis un saite</span>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Netlify Site ID</label>
                <input
                  type="text"
                  placeholder="piem. a98b-76c5d..."
                  value={settings.netlify.siteId}
                  onChange={(e) => setSettings({
                    ...settings,
                    netlify: { ...settings.netlify, siteId: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Netlify Build Hook URL</label>
                <input
                  type="text"
                  placeholder="https://api.netlify.com/build_hooks/..."
                  value={settings.netlify.buildHook}
                  onChange={(e) => setSettings({
                    ...settings,
                    netlify: { ...settings.netlify, buildHook: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-200 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Sinhronizē..." : "Saglabāt integrāciju datus"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Active Sessions Manager */}
      <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-3">
          <Users className="w-4 h-4 text-yellow-500" />
          Aktīvās Lietotāju Sesijas (Active Sessions)
        </h3>

        <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-950/30">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-850 text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                <th className="p-3">E-pasts (Loma)</th>
                <th className="p-3">IP adrese</th>
                <th className="p-3">Pārlūks (User Agent)</th>
                <th className="p-3">Pēdējā aktivitāte</th>
                <th className="p-3 text-right">Darbības</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/50 text-[11px] text-zinc-300 font-sans">
              {sessions.map(s => (
                <tr key={s.id} className="hover:bg-zinc-900/10">
                  <td className="p-3 font-bold text-white flex items-center gap-1.5">
                    <span>{s.email}</span>
                    <span className="text-[8px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold leading-none">{s.role}</span>
                    {s.isCurrent && (
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold leading-none">Tu</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-zinc-400">{s.ip}</td>
                  <td className="p-3 font-mono text-zinc-500 max-w-[200px] truncate" title={s.userAgent}>{s.userAgent}</td>
                  <td className="p-3 font-mono text-zinc-400">{new Date(s.lastActivity).toLocaleString("lv-LV")}</td>
                  <td className="p-3 text-right">
                    {!s.isCurrent && (
                      <button
                        onClick={() => handleKillSession(s.id)}
                        className="p-1.5 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/10 rounded-lg transition"
                        title="Force logout"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs Frame */}
      <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl">
        <AdminLogs token={token} />
      </div>
    </div>
  );
};
