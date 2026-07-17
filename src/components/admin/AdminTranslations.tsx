import React, { useState, useEffect } from "react";
import { Search, Save, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";

interface AdminTranslationsProps {
  token: string;
  onLogAction: (action: string, details: string) => void;
}

// Helpers to flatten and unflatten objects
function flattenObject(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        Object.assign(result, flattenObject(val, newKey));
      } else {
        result[newKey] = String(val);
      }
    }
  }
  return result;
}

function unflattenObject(flat: Record<string, string>): any {
  const result: any = {};
  for (const flatKey in flat) {
    if (Object.prototype.hasOwnProperty.call(flat, flatKey)) {
      const parts = flatKey.split(".");
      let current = result;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = flat[flatKey];
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      }
    }
  }
  return result;
}

export const AdminTranslations: React.FC<AdminTranslationsProps> = ({ token }) => {
  const [flatLV, setFlatLV] = useState<Record<string, string>>({});
  const [flatRU, setFlatRU] = useState<Record<string, string>>({});
  const [flatEN, setFlatEN] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/content-file/translations.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawData = data.draft || data.original || {};

      setFlatLV(flattenObject(rawData.lv || {}));
      setFlatRU(flattenObject(rawData.ru || {}));
      setFlatEN(flattenObject(rawData.en || {}));
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt tulkojumus." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const unflatLV = unflattenObject(flatLV);
      const unflatRU = unflattenObject(flatRU);
      const unflatEN = unflattenObject(flatEN);

      const draftContent = {
        lv: unflatLV,
        ru: unflatRU,
        en: unflatEN
      };

      const res = await fetch("/api/cms/content-file/translations.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ draftContent })
      });

      if (!res.ok) throw new Error("Server error");

      setMessage({ type: "success", text: "Tulkojumi veiksmīgi saglabāti melnrakstā! Neaizmirstiet tos publicēt." });
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās saglabāt tulkojumu melnrakstu." });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm("Vai tiešām vēlaties atcelt visas nesaglabātās melnraksta izmaiņas šim failam?")) return;
    setLoading(true);
    try {
      await fetch("/api/cms/content-file/translations.json/draft", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTranslations();
      setMessage({ type: "success", text: "Melnraksts atcelts. Ielādēts pēdējais publicētais stāvoklis." });
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās atcelt melnrakstu." });
      setLoading(false);
    }
  };

  // Get unique categories (first part of flattened keys)
  const allKeys = Array.from(new Set([...Object.keys(flatLV), ...Object.keys(flatRU), ...Object.keys(flatEN)]));
  const groups = Array.from(new Set(allKeys.map((k) => k.split(".")[0]).filter(Boolean)));

  const filteredKeys = allKeys.filter((key) => {
    const matchesSearch =
      key.toLowerCase().includes(search.toLowerCase()) ||
      (flatLV[key] || "").toLowerCase().includes(search.toLowerCase()) ||
      (flatRU[key] || "").toLowerCase().includes(search.toLowerCase()) ||
      (flatEN[key] || "").toLowerCase().includes(search.toLowerCase());

    if (selectedGroup === "all") return matchesSearch;
    return key.startsWith(selectedGroup + ".") && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Ielādē tulkojumus...</p>
      </div>
    );
  }

  return (
    <div id="admin-translations-editor" className="space-y-6">
      {/* Top Banner & Control Board */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white font-sans">Valodu Tulkojumi</h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Rediģējiet visus mājaslapas tekstus trīs valodās (LV, RU, EN) vienuviet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscard}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl border border-zinc-700 transition duration-150 text-sm font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            Atcelt Melnrakstu
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 px-5 py-2.5 rounded-xl transition duration-150 text-sm font-bold shadow-md shadow-yellow-500/10"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saglabā..." : "Saglabāt Melnrakstā"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
              : "bg-red-950/40 border-red-800 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Meklēt tekstus, tulkojumus vai atslēgas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-500 focus:outline-none pl-11 pr-4 py-3 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 transition duration-150 font-sans"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 focus:border-yellow-500 focus:outline-none px-4 py-3 rounded-xl text-sm text-zinc-100 font-sans cursor-pointer"
        >
          <option value="all">Visas sadaļas</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Translations Grid Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase bg-zinc-950/40 font-mono">
                <th className="py-4 px-6 w-1/4">Sadaļa & Atslēga</th>
                <th className="py-4 px-6 w-1/4 text-yellow-500">Latviešu (LV)</th>
                <th className="py-4 px-6 w-1/4 text-sky-400">Krievu (RU)</th>
                <th className="py-4 px-6 w-1/4 text-emerald-400">Angļu (EN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500 text-sm">
                    Netika atrasts neviens tulkojums ar šādiem parametriem.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => (
                  <tr key={key} className="hover:bg-zinc-800/10 transition duration-100 align-top">
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs font-bold text-zinc-500 break-all leading-relaxed">
                        {key}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <textarea
                        value={flatLV[key] || ""}
                        onChange={(e) => setFlatLV({ ...flatLV, [key]: e.target.value })}
                        rows={1}
                        className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2.5 rounded-lg text-sm text-zinc-100 resize-y transition font-sans leading-relaxed"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <textarea
                        value={flatRU[key] || ""}
                        onChange={(e) => setFlatRU({ ...flatRU, [key]: e.target.value })}
                        rows={1}
                        className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-sky-500/60 focus:outline-none p-2.5 rounded-lg text-sm text-zinc-100 resize-y transition font-sans leading-relaxed"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <textarea
                        value={flatEN[key] || ""}
                        onChange={(e) => setFlatEN({ ...flatEN, [key]: e.target.value })}
                        rows={1}
                        className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-emerald-500/60 focus:outline-none p-2.5 rounded-lg text-sm text-zinc-100 resize-y transition font-sans leading-relaxed"
                      />
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
