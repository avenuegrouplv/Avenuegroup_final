import React, { useState, useEffect } from "react";
import {
  Folder,
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
  FileText,
  ExternalLink,
  ChevronUp,
  X
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";

export interface DocItem {
  id: string;
  title: string;
  description: string;
  url: string;
  size: string;
  category: string;
  order: number;
}

interface AdminFilesProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminFiles: React.FC<AdminFilesProps> = ({ token, showToast }) => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Media picker modal
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Undo histories
  const [undoStack, setUndoStack] = useState<DocItem[][]>([]);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/content-file/docs.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(data.draft?.docs || data.original?.docs || []);
      } else {
        setDocs(getFallbackDocs());
      }
    } catch (err) {
      console.error(err);
      setDocs(getFallbackDocs());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackDocs = (): DocItem[] => [
    {
      id: "doc-1",
      title: "Komercnomas Līguma Paraugs 2026",
      description: "Sagatavots un apstiprināts komercnomas līguma standarta paraugs Avenue Group biroju un noliktavu telpu nomniekiem.",
      url: "/images/uploads/ka-pareiza-komercipasuma-apsaimniekosana-palielina-ta-vertibu.webp",
      size: "340 KB",
      category: "Līgumi & Paraugi",
      order: 1
    },
    {
      id: "doc-2",
      title: "Ugunsdrošības Instrukcijas un Noteikumi",
      description: "Obligātās ugunsdrošības instrukcijas un iekšējās kārtības noteikumi visos Avenue Group apsaimniekotajos objektos.",
      url: "/images/uploads/kas-obligati-jaieklauj-komercnomas-liguma.webp",
      size: "1.2 MB",
      category: "Noteikumi & Drošība",
      order: 2
    }
  ];

  const pushUndo = (state: DocItem[]) => {
    setUndoStack((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(state))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((p) => p.slice(0, -1));
    setDocs(prev);
    saveDocsState(prev, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveDocsState = async (updated: DocItem[], isUndo = false) => {
    try {
      if (!isUndo) {
        pushUndo(docs);
      }
      setDocs(updated);

      const res = await fetch("/api/cms/content-file/docs.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            docs: updated
          }
        })
      });
      if (!res.ok) throw new Error("Neizdevās saglabāt serverī");
      if (!isUndo) showToast("Dokuments saglabāts melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Kļūda saglabājot datus.", "error");
    }
  };

  // Move ordering
  const handleMoveDoc = (idx: number, direction: "up" | "down") => {
    const updated = [...docs];
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= updated.length) return;

    const temp = updated[idx].order;
    updated[idx].order = updated[target].order;
    updated[target].order = temp;

    const tempVal = updated[idx];
    updated[idx] = updated[target];
    updated[target] = tempVal;

    saveDocsState(updated);
  };

  // CRUD actions
  const handleCreateDoc = () => {
    const title = window.prompt("Ievadiet jauna dokumenta nosaukumu:");
    if (!title) return;

    const newDoc: DocItem = {
      id: "doc-" + Date.now(),
      title,
      description: "Dokumenta apraksts...",
      url: "",
      size: "Nezināms",
      category: "Vispārīgi",
      order: docs.length + 1
    };

    const updated = [...docs, newDoc];
    saveDocsState(updated);
    setActiveDoc(newDoc);
    setIsEditorOpen(true);
  };

  const handleDeleteDoc = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo dokumentu?")) return;
    const updated = docs.filter((d) => d.id !== id);
    saveDocsState(updated);
    showToast("Izdzēsts!", "success");
  };

  const handleSaveEditor = () => {
    if (!activeDoc) return;
    const updated = docs.map((d) => (d.id === activeDoc.id ? activeDoc : d));
    saveDocsState(updated);
    setIsEditorOpen(false);
    setActiveDoc(null);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Dzēst ${selectedIds.length} atlasītos dokumentus?`)) return;
    const updated = docs.filter((d) => !selectedIds.includes(d.id));
    saveDocsState(updated);
    setSelectedIds([]);
    showToast("Atlasītie dokumenti izdzēsti.", "success");
  };

  const handleMediaSelected = (url: string) => {
    if (activeDoc) {
      // Set size mock if possible or let user type
      setActiveDoc({ ...activeDoc, url });
    }
    setIsMediaOpen(false);
    showToast("Fails sekmīgi piesaistīts dokumentam!", "success");
  };

  // Filters
  const getFilteredDocs = () => {
    return docs.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === "all" || d.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  };

  const categories = Array.from(new Set(docs.map((d) => d.category)));
  const filtered = getFilteredDocs();

  return (
    <div className="space-y-6">
      {/* Summary ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Dokumenti</span>
          <span className="text-xl font-extrabold text-white mt-1">{docs.length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center col-span-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Kategorijas</span>
          <span className="text-xs text-zinc-400 mt-1 truncate">{categories.join(", ") || "nav"}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Vēsture</span>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="mt-1 flex items-center justify-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs text-zinc-300 rounded-lg transition"
          >
            <Undo2 className="w-3.5 h-3.5" /> Atgriezt ({undoStack.length})
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 px-4 py-2.5 rounded-2xl">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Meklēt dokumentus pēc nosaukuma vai apraksta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 pr-8 text-xs text-zinc-300 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="all">Visas kategorijas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handleCreateDoc}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Pievienot failu
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-yellow-500/90 font-bold">
              Atlasīti <span className="underline">{selectedIds.length}</span> dokumenti
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-[10px] text-red-400 font-bold rounded-lg transition"
            >
              Dzēst atlasītos
            </button>
          </div>
        )}
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-zinc-500">Ielādē failus...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-10 text-zinc-500 font-bold">Nav atrastu dokumentu.</div>
        ) : (
          filtered.map((item, idx) => {
            const isChecked = selectedIds.includes(item.id);
            return (
              <div key={item.id} className="bg-zinc-900/50 border border-zinc-850 rounded-2.5xl p-5 flex flex-col justify-between space-y-4 group hover:border-zinc-800 transition">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
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
                      <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-950/50 border border-zinc-900 px-2 py-0.5 rounded-lg">{item.size}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold font-mono tracking-wider text-yellow-500 uppercase bg-yellow-500/10 px-2 py-0.5 rounded">{item.category}</span>
                    <h4 className="text-xs font-bold text-white group-hover:text-yellow-500 transition line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-850/40 pt-3">
                  <div className="flex items-center gap-1.5">
                    <button disabled={idx === 0} onClick={() => handleMoveDoc(idx, "up")} className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 text-[10px]">▲</button>
                    <button disabled={idx === docs.length - 1} onClick={() => handleMoveDoc(idx, "down")} className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 text-[10px]">▼</button>
                  </div>

                  <div className="flex gap-1">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition" title="Skatīt failu">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => { setActiveDoc(item); setIsEditorOpen(true); }} className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition" title="Labot datus"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteDoc(item.id)} className="p-1.5 hover:bg-zinc-800 text-red-500 rounded-lg transition" title="Dzēst dokumentu"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDITOR OVERLAY DIALOG POPUP */}
      {isEditorOpen && activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Labot dokumenta datus</span>
              <button onClick={() => setIsEditorOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Dokumenta nosaukums</label>
                <input
                  type="text"
                  value={activeDoc.title}
                  onChange={(e) => setActiveDoc({ ...activeDoc, title: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Kategorija</label>
                  <input
                    type="text"
                    value={activeDoc.category}
                    onChange={(e) => setActiveDoc({ ...activeDoc, category: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Faila izmērs (piem. 340 KB)</label>
                  <input
                    type="text"
                    value={activeDoc.size}
                    onChange={(e) => setActiveDoc({ ...activeDoc, size: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Saites / faila piesaiste (File URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={activeDoc.url}
                    onChange={(e) => setActiveDoc({ ...activeDoc, url: e.target.value })}
                    className="flex-1 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-400 focus:outline-none font-mono"
                  />
                  <button
                    onClick={() => setIsMediaOpen(true)}
                    className="px-3.5 py-3 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 rounded-xl hover:bg-zinc-850 shrink-0"
                  >
                    Izvēlēties failu
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Apraksts</label>
                <textarea
                  rows={3}
                  value={activeDoc.description}
                  onChange={(e) => setActiveDoc({ ...activeDoc, description: e.target.value })}
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

      {/* MEDIA SELECTOR DIALOG */}
      {isMediaOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Izvēlēties dokumenta failu</span>
              <button onClick={() => setIsMediaOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <AdminMedia token={token} onSelect={handleMediaSelected} isPickerMode={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
