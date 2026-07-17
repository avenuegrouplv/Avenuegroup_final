import React, { useState, useEffect } from "react";
import { ListFilter, Search, RefreshCw, Terminal, Eye, ShieldAlert } from "lucide-react";

interface AdminLogsProps {
  token: string;
}

interface AuditLog {
  timestamp: string;
  email: string;
  action: string;
  details: string;
}

export const AdminLogs: React.FC<AdminLogsProps> = ({ token }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.email.toLowerCase().includes(search.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    if (actionFilter === "all") return matchesSearch;
    return log.action === actionFilter && matchesSearch;
  });

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act === "publish") return "bg-emerald-950/40 border-emerald-900/60 text-emerald-400";
    if (act.includes("delete") || act.includes("discard")) return "bg-red-950/40 border-red-900/60 text-red-400";
    if (act.includes("create") || act.includes("update")) return "bg-sky-950/40 border-sky-900/60 text-sky-400";
    if (act === "login") return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    return "bg-zinc-950/40 border-zinc-800 text-zinc-400";
  };

  return (
    <div id="admin-audit-logs" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 p-3 rounded-full border border-yellow-500/20 text-yellow-500">
            <Terminal className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-sans">Sistēmas Žurnāls</h2>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Reāllaika pārskats par visām lietotāju un administratoru darbībām CMS sistēmā.
            </p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl border border-zinc-700 transition text-sm font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atjaunināt Žurnālu
        </button>
      </div>

      {/* Filters Pane */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Meklēt pēc lietotāja, darbības vai detaļām..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500 focus:outline-none pl-11 pr-4 py-3 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 transition font-sans"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 focus:border-yellow-500 focus:outline-none px-4 py-3 rounded-xl text-sm text-zinc-100 font-sans cursor-pointer"
        >
          <option value="all">Visas darbības</option>
          {uniqueActions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase bg-zinc-950/40 font-mono">
                <th className="py-4 px-6 w-1/5">Laiks</th>
                <th className="py-4 px-6 w-1/5">Lietotājs</th>
                <th className="py-4 px-6 w-1/5">Darbība</th>
                <th className="py-4 px-6 w-2/5">Detaļas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500 text-sm">
                    <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Ielādē ierakstus...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500 text-sm">
                    Nav atrasts neviens atbilstošs žurnāla ieraksts.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/10 transition duration-100 align-top">
                    <td className="py-4 px-6 font-mono text-xs text-zinc-500">
                      {new Date(log.timestamp).toLocaleString("lv-LV")}
                    </td>
                    <td className="py-4 px-6 font-sans text-xs font-bold text-zinc-300 truncate max-w-[150px]">
                      {log.email}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-sans text-xs text-zinc-400 leading-relaxed break-all">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
