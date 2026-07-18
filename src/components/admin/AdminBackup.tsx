import React, { useState, useEffect } from "react";
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Clock, 
  History, 
  ShieldAlert, 
  Play, 
  FileArchive, 
  X 
} from "lucide-react";

interface AdminBackupProps {
  token: string;
}

interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

interface AutoBackupSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  maxBackups: number;
}

export const AdminBackup: React.FC<AdminBackupProps> = ({ token }) => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [autoBackup, setAutoBackup] = useState<AutoBackupSettings>({
    enabled: false,
    frequency: "daily",
    maxBackups: 10
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/backups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load backups");
      const data = await res.json();
      setBackups(data.backups);
      if (data.autoBackup) {
        setAutoBackup(data.autoBackup);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt sistēmas dublējumu datus." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [token]);

  const handleCreateBackup = async () => {
    setProcessing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cms/backups", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backup failed");

      setMessage({ type: "success", text: `Sistēmas dublējums sekmīgi pabeigts: ${data.filename}` });
      await fetchBackups();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Neizdevās izveidot dublējumu." });
    } finally {
      setProcessing(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!window.confirm(`BRĪDINĀJUMS: Vai tiešām vēlaties atjaunot sistēmas stāvokli no dublējuma "${filename}"? Visi pašreizējie nesaglabātie satura faili, lietotāji un iestatījumi tiks aizstāti!`)) {
      return;
    }

    setProcessing(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/cms/backups/${filename}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");

      setMessage({ type: "success", text: `Sistēmas stāvoklis sekmīgi atjaunots no: ${filename}. Lapai tiks veikta pilna pārlāde.` });
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Neizdevās atjaunot sistēmas stāvokli." });
      setProcessing(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!window.confirm(`Vai tiešām vēlaties dzēst dublējuma failu "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/cms/backups/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setMessage({ type: "success", text: `Dublējuma fails "${filename}" veiksmīgi dzēsts.` });
      await fetchBackups();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Neizdevās izdzēst dublējumu." });
    }
  };

  const handleSaveAutoBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cms/backups/auto", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(autoBackup)
      });
      if (!res.ok) throw new Error("Auto backup save failed");

      setMessage({ type: "success", text: "Automātiskās dublēšanas iestatījumi saglabāti sekmīgi!" });
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās saglabāt iestatījumus." });
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
  };

  if (loading && backups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-950/20 rounded-3xl border border-zinc-900">
        <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Ielādē sistēmas arhīva moduli...</p>
      </div>
    );
  }

  return (
    <div id="admin-backup-manager" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-yellow-500" />
            Backup Manager (Sistēmas Rezerves Kopijas)
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Veidojiet, lejupielādējiet un atjaunojiet pilnus CMS datu struktūras arhīvus (lapas, lomas, pieteikumus, bildes, tulkojumus).
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={processing}
          className="flex items-center gap-1.5 px-4.5 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          {processing ? "Arhivē..." : "Izveidot Dublējumu Tagad"}
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
          <span className="text-xs font-semibold flex-1 leading-normal">{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-zinc-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 align-top">
        {/* Backups List Column */}
        <div className="lg:col-span-8 bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <History className="w-4 h-4 text-yellow-500" />
              Glabāto Kopiju Arhīvs ({backups.length})
            </h3>
            <button onClick={fetchBackups} className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> pārlādēt
            </button>
          </div>

          {backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-850 rounded-2xl">
              <FileArchive className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-xs font-sans">Nav atrasta neviena rezerves kopija.</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Nospiediet augšējo pogu, lai veiktu pirmo dublējumu.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map(b => (
                <div key={b.filename} className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-800 transition">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white font-mono break-all">{b.filename}</p>
                    <div className="flex items-center gap-2.5 text-[10px] text-zinc-500 font-mono">
                      <span>{formatSize(b.size)}</span>
                      <span>•</span>
                      <span>{new Date(b.createdAt).toLocaleString("lv-LV")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/api/cms/backups/${b.filename}/download?token=${token}`}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg border border-zinc-800 transition flex items-center gap-1 text-[10px] font-bold font-sans"
                      title="Lejupielādēt ZIP failu"
                    >
                      <Download className="w-3.5 h-3.5" />
                      lejupielādēt
                    </a>

                    <button
                      onClick={() => handleRestoreBackup(b.filename)}
                      className="px-3 py-2 bg-zinc-900 hover:bg-yellow-500 hover:text-zinc-950 text-zinc-400 rounded-lg border border-zinc-850 transition text-[10px] font-bold"
                      title="Atjaunot sistēmas stāvokli no šī faila"
                    >
                      Atjaunot sistēmu
                    </button>

                    <button
                      onClick={() => handleDeleteBackup(b.filename)}
                      className="p-2 bg-red-950/20 hover:bg-red-950/50 text-red-400 border border-red-900/10 rounded-lg transition"
                      title="Dzēst failu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto Backup Configuration Column */}
        <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-3">
            <Clock className="w-4 h-4 text-yellow-500" />
            Automātiskā Dublēšana
          </h3>

          <form onSubmit={handleSaveAutoBackup} className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-850">
              <span className="text-xs font-semibold text-zinc-300">Iespējot Auto-dublējumus</span>
              <input
                type="checkbox"
                checked={autoBackup.enabled}
                onChange={(e) => setAutoBackup({ ...autoBackup, enabled: e.target.checked })}
                className="w-4.5 h-4.5 accent-yellow-500 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Biežums (Frequency)</label>
              <select
                disabled={!autoBackup.enabled}
                value={autoBackup.frequency}
                onChange={(e) => setAutoBackup({ ...autoBackup, frequency: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white cursor-pointer disabled:opacity-40"
              >
                <option value="daily">Katru dienu (Daily)</option>
                <option value="weekly">Reizi nedēļā (Weekly)</option>
                <option value="monthly">Reizi mēnesī (Monthly)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Maksimālais kopiju skaits</label>
              <input
                disabled={!autoBackup.enabled}
                type="number"
                min="3"
                max="50"
                value={autoBackup.maxBackups}
                onChange={(e) => setAutoBackup({ ...autoBackup, maxBackups: parseInt(e.target.value) || 10 })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white disabled:opacity-40"
              />
              <span className="text-[8.5px] text-zinc-500">Vecākās kopijas tiks automātiski dzēstas, pārsniedzot šo skaitu.</span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/10"
            >
              <Save className="w-4 h-4" />
              Saglabāt Uzstādījumus
            </button>
          </form>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex gap-2.5">
            <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 leading-normal">
              Automātiskie dublējumi darbojas uz fona un tiek saglabāti diska mapē <code className="text-zinc-400 font-mono">/src/data/backups/</code> pirms svarīgām sistēmas manipulācijām un publicēšanas cikliem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
