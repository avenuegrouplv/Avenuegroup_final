import React, { useState, useEffect } from "react";
import {
  Languages,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Search,
  Filter,
  Check,
  ChevronDown,
  RefreshCw,
  Info,
  Download,
  Upload,
  Undo2,
  Eye,
  Settings,
  HelpCircle,
  X
} from "lucide-react";

export interface TranslationKey {
  id: string;
  key: string;
  lv: string;
  en: string;
  ru: string;
}

interface AdminTranslationsProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminTranslations: React.FC<AdminTranslationsProps> = ({ token, showToast }) => {
  const [translations, setTranslations] = useState<TranslationKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Active translation language filter tab
  const [activeLang, setActiveLang] = useState<"all" | "lv" | "en" | "ru">("all");

  // UI Search/Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state
  const [activeKey, setActiveKey] = useState<TranslationKey | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Undo histories
  const [undoStack, setUndoStack] = useState<TranslationKey[][]>([]);

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/content-file/translations.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTranslations(data.draft?.translations || data.original?.translations || []);
      } else {
        setTranslations(getFallbackTranslations());
      }
    } catch (err) {
      console.error(err);
      setTranslations(getFallbackTranslations());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackTranslations = (): TranslationKey[] => [
    { id: "tr-1", key: "header_call_us", lv: "Zvaniet mums", en: "Call us", ru: "Звоните нам" },
    { id: "tr-2", key: "button_more", lv: "Uzzināt vairāk", en: "Learn more", ru: "Узнать больше" },
    { id: "tr-3", key: "footer_address", lv: "Brīvības gatve 386 k-2-5A, Rīga", en: "Brivibas alley 386 k-2-5A, Riga", ru: "Бривибас гатве 386 к-2-5А, Рига" }
  ];

  const pushUndo = (state: TranslationKey[]) => {
    setUndoStack((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(state))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((p) => p.slice(0, -1));
    setTranslations(prev);
    saveTranslationsState(prev, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveTranslationsState = async (updated: TranslationKey[], isUndo = false) => {
    try {
      if (!isUndo) {
        pushUndo(translations);
      }
      setTranslations(updated);

      const res = await fetch("/api/cms/content-file/translations.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            translations: updated
          }
        })
      });

      if (!res.ok) throw new Error("Failed to save to server");
      if (!isUndo) showToast("Lokalizācijas saglabātas melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Kļūda saglabājot serverī.", "error");
    }
  };

  // CRUD actions
  const handleCreateKey = () => {
    const key = window.prompt("Ievadiet jaunu lokalizācijas atslēgu (piem. button_submit):");
    if (!key) return;

    // Check duplication
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "_");
    if (translations.some((t) => t.key === cleanKey)) {
      showToast("Šāda atslēga jau eksistē!", "warning");
      return;
    }

    const newKey: TranslationKey = {
      id: "tr-" + Date.now(),
      key: cleanKey,
      lv: "",
      en: "",
      ru: ""
    };

    const updated = [newKey, ...translations];
    saveTranslationsState(updated);
    setActiveKey(newKey);
    setIsEditorOpen(true);
  };

  const handleDeleteKey = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo lokalizācijas atslēgu?")) return;
    const updated = translations.filter((t) => t.id !== id);
    saveTranslationsState(updated);
    showToast("Atslēga izdzēsta.", "success");
  };

  const handleSaveEditor = () => {
    if (!activeKey) return;
    const updated = translations.map((t) => (t.id === activeKey.id ? activeKey : t));
    saveTranslationsState(updated);
    setIsEditorOpen(false);
    setActiveKey(null);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Vai tiešām vēlaties dzēst ${selectedIds.length} atlasītās atslēgas?`)) return;
    const updated = translations.filter((t) => !selectedIds.includes(t.id));
    saveTranslationsState(updated);
    setSelectedIds([]);
    showToast("Atlasītās atslēgas tika izdzēstas.", "success");
  };

  // Export / Import
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(translations, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "translations_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Tulkojumi veiksmīgi eksportēti!", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const updated = [...parsed, ...translations];
            saveTranslationsState(updated);
            showToast(`Veiksmīgi importētas ${parsed.length} atslēgas!`, "success");
          } else {
            showToast("Nederīgs tulkojumu fails.", "error");
          }
        } catch (err) {
          showToast("Kļūda lasot failu.", "error");
        }
      };
    }
  };

  // Filter keys
  const getFilteredTranslations = () => {
    return translations.filter((t) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        t.key.toLowerCase().includes(query) ||
        t.lv.toLowerCase().includes(query) ||
        t.en.toLowerCase().includes(query) ||
        t.ru.toLowerCase().includes(query);
      return matchesSearch;
    });
  };

  const filtered = getFilteredTranslations();

  return (
    <div className="space-y-6">
      {/* Top summary header ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Kopā atslēgu</span>
          <span className="text-xl font-extrabold text-white mt-1">{translations.length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono font-bold font-bold">Latviski aizpildīts</span>
          <span className="text-xl font-extrabold text-white mt-1">{translations.filter((t) => t.lv.trim() !== "").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-mono font-bold">Angliski aizpildīts</span>
          <span className="text-xl font-extrabold text-white mt-1">{translations.filter((t) => t.en.trim() !== "").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono font-bold">Vēsture</span>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs text-zinc-300 rounded-lg transition"
          >
            <Undo2 className="w-3.5 h-3.5" /> Atgriezt ({undoStack.length})
          </button>
        </div>
      </div>

      {/* Toolbar / Search panel */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 px-4 py-2.5 rounded-2xl">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Meklēt tulkojumu pēc atslēgas, latviešu, angļu vai krievu vērtības..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
              title="Eksportēt uz JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <label className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer" title="Importēt no JSON">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={handleCreateKey}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Jauna Atslēga
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-yellow-500/90 font-bold">
              Atlasītas <span className="underline">{selectedIds.length}</span> atslēgas
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-[10px] text-red-400 font-bold rounded-lg transition"
            >
              Dzēst atlasītās
            </button>
          </div>
        )}
      </div>

      {/* Translations Table list */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-900 bg-zinc-950/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-400 font-mono font-bold uppercase tracking-wider">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((t) => selectedIds.includes(t.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...new Set([...selectedIds, ...filtered.map((t) => t.id)])]);
                    } else {
                      setSelectedIds(selectedIds.filter((id) => !filtered.some((t) => t.id === id)));
                    }
                  }}
                  className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="p-4 w-48">Lokalizācijas Atslēga</th>
              <th className="p-4">Latviešu (LV)</th>
              <th className="p-4">English (EN)</th>
              <th className="p-4">Русский (RU)</th>
              <th className="p-4 text-right w-24">Darbības</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">Ielādē tulkojumus...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">Nav atrastu lokalizācijas atslēgu.</td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <tr key={item.id} className="hover:bg-zinc-900/10 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedIds(selectedIds.filter((id) => id !== item.id));
                          } else {
                            setSelectedIds([...selectedIds, item.id]);
                          }
                        }}
                        className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-mono text-white text-[11px] font-bold break-all">
                      {item.key}
                    </td>
                    <td className="p-4 text-zinc-300 font-sans max-w-xs truncate">{item.lv || <span className="text-zinc-600 italic">tukšs</span>}</td>
                    <td className="p-4 text-zinc-300 font-sans max-w-xs truncate">{item.en || <span className="text-zinc-600 italic">tukšs</span>}</td>
                    <td className="p-4 text-zinc-300 font-sans max-w-xs truncate">{item.ru || <span className="text-zinc-600 italic">tukšs</span>}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => {
                            setActiveKey(item);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                          title="Labot"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKey(item.id)}
                          className="p-1.5 hover:bg-zinc-900 text-red-500 hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EDITOR DIALOG POPUP */}
      {isEditorOpen && activeKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Labot tulkojumu atslēgu</span>
              <button onClick={() => setIsEditorOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Atslēgas sistēmas nosaukums (Key)</label>
                <input
                  type="text"
                  value={activeKey.key}
                  disabled
                  className="w-full bg-zinc-950/40 border border-zinc-900 p-3 rounded-xl text-xs text-zinc-500 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Latviešu (LV)</label>
                <textarea
                  rows={2}
                  value={activeKey.lv}
                  onChange={(e) => setActiveKey({ ...activeKey, lv: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">English (EN)</label>
                <textarea
                  rows={2}
                  value={activeKey.en}
                  onChange={(e) => setActiveKey({ ...activeKey, en: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Русский (RU)</label>
                <textarea
                  rows={2}
                  value={activeKey.ru}
                  onChange={(e) => setActiveKey({ ...activeKey, ru: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 resize-none leading-relaxed"
                />
              </div>
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 flex justify-end gap-3">
              <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-xs font-bold text-zinc-400">Atcelt</button>
              <button onClick={handleSaveEditor} className="px-5 py-2.5 bg-yellow-500 text-zinc-950 font-extrabold text-xs rounded-xl">Saglabāt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
