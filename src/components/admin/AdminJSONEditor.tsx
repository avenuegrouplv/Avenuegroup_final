import React, { useState, useEffect } from "react";
import { List, Code, Plus, Trash2, ArrowUp, ArrowDown, Save, FileJson, AlertCircle, CheckCircle, Search, Link as LinkIcon, Image as ImageIcon, MessageSquare, Sparkles, Share2 } from "lucide-react";

interface AdminJSONEditorProps {
  token: string;
}

interface ContentFileInfo {
  filename: string;
  size: number;
  updatedAt: string;
  hasDraft: boolean;
}

export const AdminJSONEditor: React.FC<AdminJSONEditorProps> = ({ token }) => {
  const [files, setFiles] = useState<ContentFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [originalData, setOriginalData] = useState<any>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"form" | "raw">("form");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [rawText, setRawText] = useState<string>("");

  // Collection states if file contains array
  const [collectionKey, setCollectionKey] = useState<string | null>(null); // e.g. "articles"
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/cms/content-files", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Filter out translations.json from general editor
      setFiles(data.filter((f: any) => f.filename !== "translations.json"));
    } catch (err) {
      console.error("Failed to load content files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  const loadFile = async (filename: string) => {
    if (!filename) {
      setOriginalData(null);
      setEditedData(null);
      return;
    }
    setLoading(true);
    setMessage(null);
    setSelectedItemIndex(-1);
    setCollectionKey(null);

    try {
      const res = await fetch(`/api/cms/content-file/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const currentContent = data.draft || data.original;

      setOriginalData(data.original);
      setEditedData(currentContent);
      setRawText(JSON.stringify(currentContent, null, 2));

      // Detect if it is a collection of items
      // Checks if JSON is { "articles": [...] } or `{ "pages": [...] }`
      if (currentContent && typeof currentContent === "object" && !Array.isArray(currentContent)) {
        const keys = Object.keys(currentContent);
        if (keys.length === 1 && Array.isArray(currentContent[keys[0]])) {
          setCollectionKey(keys[0]);
          if (currentContent[keys[0]].length > 0) {
            setSelectedItemIndex(0);
          }
        }
      } else if (Array.isArray(currentContent)) {
        setCollectionKey("root_array");
        if (currentContent.length > 0) {
          setSelectedItemIndex(0);
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt faila saturu." });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const file = e.target.value;
    setSelectedFile(file);
    loadFile(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    let finalContent = editedData;

    if (activeTab === "raw") {
      try {
        finalContent = JSON.parse(rawText);
        setEditedData(finalContent);
      } catch (err) {
        setMessage({ type: "error", text: "Sintakses kļūda JSON tekstā. Nevar saglabāt." });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/cms/content-file/${selectedFile}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ draftContent: finalContent })
      });

      if (!res.ok) throw new Error("Save failed");

      setMessage({ type: "success", text: "Melnraksts veiksmīgi saglabāts! Neaizmirstiet to publicēt." });
      await fetchFiles(); // Refresh hasDraft markers
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās saglabāt melnrakstu." });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm("Vai tiešām vēlaties atcelt visas melnraksta izmaiņas šim failam?")) return;
    setLoading(true);
    try {
      await fetch(`/api/cms/content-file/${selectedFile}/draft`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadFile(selectedFile);
      setMessage({ type: "success", text: "Melnraksts atcelts. Ielādēts pēdējais publicētais stāvoklis." });
      await fetchFiles();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās atcelt melnrakstu." });
      setLoading(false);
    }
  };

  // COLLECTION HELPERS
  const getCollectionItems = (): any[] => {
    if (!editedData) return [];
    if (collectionKey === "root_array") return editedData;
    if (collectionKey) return editedData[collectionKey] || [];
    return [];
  };

  const setCollectionItems = (newItems: any[]) => {
    if (collectionKey === "root_array") {
      setEditedData(newItems);
      setRawText(JSON.stringify(newItems, null, 2));
    } else if (collectionKey) {
      const updated = { ...editedData, [collectionKey]: newItems };
      setEditedData(updated);
      setRawText(JSON.stringify(updated, null, 2));
    }
  };

  const handleFieldChange = (keyPath: string[], value: any) => {
    const updated = JSON.parse(JSON.stringify(editedData)); // Deep copy
    let curr = updated;

    for (let i = 0; i < keyPath.length - 1; i++) {
      curr = curr[keyPath[i]];
    }
    curr[keyPath[keyPath.length - 1]] = value;

    setEditedData(updated);
    setRawText(JSON.stringify(updated, null, 2));
  };

  const handleAddItem = () => {
    const items = getCollectionItems();
    // Copy the structure from first item or generate default keys
    const firstItem = items[0] || {};
    const newItem: any = {};

    Object.keys(firstItem).forEach((k) => {
      if (k === "id") {
        const maxId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
        newItem[k] = maxId + 1;
      } else if (k === "slug") {
        newItem[k] = "jauns-objekts-" + Date.now().toString().slice(-4);
      } else if (Array.isArray(firstItem[k])) {
        newItem[k] = [];
      } else if (typeof firstItem[k] === "number") {
        newItem[k] = 0;
      } else if (typeof firstItem[k] === "boolean") {
        newItem[k] = false;
      } else {
        newItem[k] = "";
      }
    });

    if (Object.keys(newItem).length === 0) {
      newItem.title = "Jauns objekts";
    }

    const updated = [...items, newItem];
    setCollectionItems(updated);
    setSelectedItemIndex(updated.length - 1);
  };

  const handleDeleteItem = (index: number) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo ierakstu?")) return;
    const items = getCollectionItems();
    const updated = items.filter((_, i) => i !== index);
    setCollectionItems(updated);
    if (selectedItemIndex >= updated.length) {
      setSelectedItemIndex(updated.length - 1);
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const items = getCollectionItems();
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setCollectionItems(updated);
    setSelectedItemIndex(targetIndex);
  };

  const items = getCollectionItems();
  const filteredItems = items.map((item, idx) => ({ item, originalIndex: idx })).filter(({ item }) => {
    if (!searchTerm) return true;
    const textToSearch = JSON.stringify(item).toLowerCase();
    return textToSearch.includes(searchTerm.toLowerCase());
  });

  // Dynamic schema form field renderer
  const renderFormFields = (item: any, keyPrefix: string[]) => {
    if (!item || typeof item !== "object") return null;

    return Object.keys(item).map((key) => {
      const val = item[key];
      const fieldPath = [...keyPrefix, key];
      const label = key.toUpperCase();

      // Skip id in input, handle it as read-only label
      if (key === "id") {
        return (
          <div key={key} className="space-y-1 bg-zinc-950/20 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-500">
              Sistēmas ID (Automātisks)
            </span>
            <div className="text-zinc-400 font-mono text-sm">{val}</div>
          </div>
        );
      }

      // If field is array of paragraphs (like "content" in blog articles)
      if (key === "content" && Array.isArray(val) && (val.length === 0 || typeof val[0] === "string")) {
        return (
          <div key={key} className="space-y-3 bg-zinc-950/25 p-5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[11px] font-sans uppercase tracking-wider font-bold text-yellow-500">
                Satura Rindkopas ({key})
              </span>
              <button
                onClick={() => handleFieldChange(fieldPath, [...val, ""])}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Pievienot Rindkopu
              </button>
            </div>
            {val.map((paragraph, pIdx) => (
              <div key={pIdx} className="flex gap-2 items-start bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-800/40">
                <textarea
                  value={paragraph}
                  onChange={(e) => {
                    const newVal = [...val];
                    newVal[pIdx] = e.target.value;
                    handleFieldChange(fieldPath, newVal);
                  }}
                  rows={2}
                  placeholder={`Rindkopa #${pIdx + 1}`}
                  className="flex-1 bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2.5 rounded-lg text-sm text-zinc-100 resize-y transition font-sans leading-relaxed"
                />
                <button
                  onClick={() => {
                    const newVal = val.filter((_, i) => i !== pIdx);
                    handleFieldChange(fieldPath, newVal);
                  }}
                  className="p-2 bg-red-950/40 hover:bg-red-900 text-red-400 rounded-lg border border-red-900/40 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        );
      }

      // Special Sub-Editor: Images array
      if (key === "images" && Array.isArray(val)) {
        return (
          <div key={key} className="space-y-4 bg-zinc-950/25 p-5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-xs font-sans uppercase tracking-wider font-bold text-yellow-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Attēlu saraksts / Galerija ({key})
              </span>
              <button
                onClick={() => handleFieldChange(fieldPath, [...val, { image: "", caption: "" }])}
                className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs px-2.5 py-1.5 rounded-lg border border-yellow-500/20 transition font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Pievienot attēlu
              </button>
            </div>
            {val.map((imgObj: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/40 relative">
                {/* Control toolbar on top right */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => {
                      const updated = [...val];
                      const temp = updated[idx];
                      updated[idx] = updated[idx - 1];
                      updated[idx - 1] = temp;
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === val.length - 1}
                    onClick={() => {
                      const updated = [...val];
                      const temp = updated[idx];
                      updated[idx] = updated[idx + 1];
                      updated[idx + 1] = temp;
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const updated = val.filter((_: any, i: number) => i !== idx);
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-300 rounded border border-red-900/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Left Thumbnail Preview */}
                <div className="w-20 h-20 bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                  {imgObj.image ? (
                    <img src={imgObj.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-600" />
                  )}
                </div>

                {/* Fields details */}
                <div className="flex-1 grid grid-cols-1 gap-3 pr-16">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Attēla URL / Ceļš</label>
                    <input
                      type="text"
                      value={imgObj.image || ""}
                      placeholder="/images/uploads/name.webp vai iekopēta saite"
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], image: e.target.value };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Paraksts / Apraksts</label>
                    <input
                      type="text"
                      value={imgObj.caption || ""}
                      placeholder="Attēla paraksts..."
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], caption: e.target.value };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200"
                    />
                  </div>
                </div>
              </div>
            ))}
            {val.length === 0 && (
              <div className="text-center py-6 text-zinc-600 text-xs">
                Nav pievienots neviens attēls. Noklikšķiniet "Pievienot attēlu", lai sāktu.
              </div>
            )}
          </div>
        );
      }

      // Special Sub-Editor: Testimonials array
      if (key === "testimonials" && Array.isArray(val)) {
        return (
          <div key={key} className="space-y-4 bg-zinc-950/25 p-5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-xs font-sans uppercase tracking-wider font-bold text-yellow-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Atsauksmes / Rekomendācijas ({key})
              </span>
              <button
                onClick={() => handleFieldChange(fieldPath, [...val, { author: "", company: "", rating: 5, text: "" }])}
                className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs px-2.5 py-1.5 rounded-lg border border-yellow-500/20 transition font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Pievienot atsauksmi
              </button>
            </div>
            {val.map((testi: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/40 relative">
                {/* Control toolbar on top right */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => {
                      const updated = [...val];
                      const temp = updated[idx];
                      updated[idx] = updated[idx - 1];
                      updated[idx - 1] = temp;
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === val.length - 1}
                    onClick={() => {
                      const updated = [...val];
                      const temp = updated[idx];
                      updated[idx] = updated[idx + 1];
                      updated[idx + 1] = temp;
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const updated = val.filter((_: any, i: number) => i !== idx);
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-300 rounded border border-red-900/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fields details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Autors / Vārds</label>
                    <input
                      type="text"
                      value={testi.author || ""}
                      placeholder="Jānis Bērziņš"
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], author: e.target.value };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Uzņēmums / Amats</label>
                    <input
                      type="text"
                      value={testi.company || ""}
                      placeholder="SIA 'Avenue Group'"
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], company: e.target.value };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Vērtējums (Zvaigznes 1-5)</label>
                    <select
                      value={testi.rating || 5}
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], rating: Number(e.target.value) };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-24 bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200 cursor-pointer"
                    >
                      <option value="5">★★★★★ (5)</option>
                      <option value="4">★★★★☆ (4)</option>
                      <option value="3">★★★☆☆ (3)</option>
                      <option value="2">★★☆☆☆ (2)</option>
                      <option value="1">★☆☆☆☆ (1)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Atsauksmes teksts</label>
                    <textarea
                      value={testi.text || ""}
                      placeholder="Atsauksmes saturs..."
                      rows={2}
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], text: e.target.value };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200"
                    />
                  </div>
                </div>
              </div>
            ))}
            {val.length === 0 && (
              <div className="text-center py-6 text-zinc-600 text-xs">
                Nav pievienota neviena atsauksme. Noklikšķiniet "Pievienot atsauksmi", lai sāktu.
              </div>
            )}
          </div>
        );
      }

      // Special Sub-Editor: Social posts array
      if (key === "posts" && Array.isArray(val)) {
        return (
          <div key={key} className="space-y-4 bg-zinc-950/25 p-5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-xs font-sans uppercase tracking-wider font-bold text-yellow-500 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Sociālo tīklu ieraksti ({key})
              </span>
              <button
                onClick={() => handleFieldChange(fieldPath, [...val, { platform: "Instagram", url: "", embed_code: "" }])}
                className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs px-2.5 py-1.5 rounded-lg border border-yellow-500/20 transition font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Pievienot ierakstu
              </button>
            </div>
            {val.map((post: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/40 relative">
                {/* Control toolbar on top right */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => {
                      const updated = [...val];
                      const temp = updated[idx];
                      updated[idx] = updated[idx - 1];
                      updated[idx - 1] = temp;
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === val.length - 1}
                    onClick={() => {
                      const updated = [...val];
                      const temp = updated[idx];
                      updated[idx] = updated[idx + 1];
                      updated[idx + 1] = temp;
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const updated = val.filter((_: any, i: number) => i !== idx);
                      handleFieldChange(fieldPath, updated);
                    }}
                    className="p-1 bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-300 rounded border border-red-900/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Platforma</label>
                    <select
                      value={post.platform || "Instagram"}
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], platform: e.target.value };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200 cursor-pointer"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Saites adrese (URL)</label>
                    <input
                      type="text"
                      value={post.url || ""}
                      placeholder="https://..."
                      onChange={(e) => {
                        const updated = [...val];
                        updated[idx] = { ...updated[idx], url: e.target.value };
                        handleFieldChange(fieldPath, updated);
                      }}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // Special Sub-Editor: Blocks list
      if (key === "blocks" && Array.isArray(val)) {
        return (
          <div key={key} className="space-y-4 bg-zinc-950/20 p-5 rounded-2xl border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-3">
              <span className="text-xs font-sans uppercase tracking-wider font-bold text-yellow-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                Modulārie lapas bloki ({val.length})
              </span>
              
              <div className="flex items-center gap-2 font-sans">
                <span className="text-[11px] text-zinc-400 font-bold">Pievienot bloku:</span>
                <select
                  value=""
                  onChange={(e) => {
                    const blockType = e.target.value;
                    if (!blockType) return;
                    let newBlock: any = { type: blockType, title: "" };
                    if (blockType === "text_block") {
                      newBlock.content = "";
                    } else if (blockType === "gallery_block") {
                      newBlock.images = [];
                    } else if (blockType === "testimonials_block") {
                      newBlock.testimonials = [];
                    } else if (blockType === "social_block") {
                      newBlock.posts = [];
                    } else if (blockType === "blog_posts_block") {
                      newBlock.count = 3;
                    } else if (blockType === "contact_form_block") {
                      newBlock.description = "";
                    }
                    handleFieldChange(fieldPath, [...val, newBlock]);
                    e.target.value = ""; // reset dropdown
                  }}
                  className="bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none px-2.5 py-1.5 rounded-lg text-xs text-zinc-100 cursor-pointer"
                >
                  <option value="">-- Izvēlēties bloka tipu --</option>
                  <option value="text_block">Teksta bloks</option>
                  <option value="gallery_block">Attēlu galerija</option>
                  <option value="testimonials_block">Atsauksmju bloks</option>
                  <option value="social_block">Sociālo tīklu bloks</option>
                  <option value="blog_posts_block">Emuāru saraksts</option>
                  <option value="contact_form_block">Saziņas forma</option>
                </select>
              </div>
            </div>

            {val.map((block: any, idx: number) => {
              const blockTitle = block.title || `Bez virsraksta`;
              let blockTypeName = "Nezināms bloks";
              if (block.type === "text_block") blockTypeName = "Teksta bloks";
              else if (block.type === "gallery_block") blockTypeName = "Attēlu galerija";
              else if (block.type === "testimonials_block") blockTypeName = "Atsauksmju bloks";
              else if (block.type === "social_block") blockTypeName = "Sociālo tīklu bloks";
              else if (block.type === "blog_posts_block") blockTypeName = "Emuāru saraksts";
              else if (block.type === "contact_form_block") blockTypeName = "Saziņas forma";

              return (
                <div key={idx} className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 space-y-4 relative">
                  {/* Block Header with operations */}
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 pr-16">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-950 text-yellow-500 font-mono">
                        {blockTypeName}
                      </span>
                      <span className="text-xs font-bold text-zinc-300 font-sans">{blockTitle}</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...val];
                          const temp = updated[idx];
                          updated[idx] = updated[idx - 1];
                          updated[idx - 1] = temp;
                          handleFieldChange(fieldPath, updated);
                        }}
                        className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === val.length - 1}
                        onClick={() => {
                          const updated = [...val];
                          const temp = updated[idx];
                          updated[idx] = updated[idx + 1];
                          updated[idx + 1] = temp;
                          handleFieldChange(fieldPath, updated);
                        }}
                        className="p-1 bg-zinc-950/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded disabled:opacity-30 border border-zinc-850 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Vai tiešām dzēst šo bloku?")) return;
                          const updated = val.filter((_: any, i: number) => i !== idx);
                          handleFieldChange(fieldPath, updated);
                        }}
                        className="p-1 bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-300 rounded border border-red-900/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Content fields */}
                  <div className="space-y-3">
                    <div className="space-y-1 font-sans">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Bloka Virsraksts (Nav obligāts)</label>
                      <input
                        type="text"
                        value={block.title || ""}
                        placeholder="Ievadiet bloka virsrakstu..."
                        onChange={(e) => {
                          const updated = [...val];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          handleFieldChange(fieldPath, updated);
                        }}
                        className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200"
                      />
                    </div>

                    {block.type === "text_block" && (
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Bloka Saturs (Atbalsta Markdown)</label>
                        <textarea
                          value={block.content || ""}
                          placeholder="Ievadiet teksta saturu..."
                          rows={6}
                          onChange={(e) => {
                            const updated = [...val];
                            updated[idx] = { ...updated[idx], content: e.target.value };
                            handleFieldChange(fieldPath, updated);
                          }}
                          className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200 leading-relaxed resize-y"
                        />
                      </div>
                    )}

                    {block.type === "gallery_block" && (
                      <div className="pt-2">
                        {renderFormFields({ images: block.images || [] }, [...fieldPath, String(idx)])}
                      </div>
                    )}

                    {block.type === "testimonials_block" && (
                      <div className="pt-2">
                        {renderFormFields({ testimonials: block.testimonials || [] }, [...fieldPath, String(idx)])}
                      </div>
                    )}

                    {block.type === "social_block" && (
                      <div className="pt-2">
                        {renderFormFields({ posts: block.posts || [] }, [...fieldPath, String(idx)])}
                      </div>
                    )}

                    {block.type === "blog_posts_block" && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Rakstu skaits, ko attēlot</label>
                        <input
                          type="number"
                          value={block.count || 3}
                          onChange={(e) => {
                            const updated = [...val];
                            updated[idx] = { ...updated[idx], count: Number(e.target.value) };
                            handleFieldChange(fieldPath, updated);
                          }}
                          className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200 font-mono"
                        />
                      </div>
                    )}

                    {block.type === "contact_form_block" && (
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Formas apraksts / paskaidrojums</label>
                        <textarea
                          value={block.description || ""}
                          placeholder="Sazinieties ar mums, aizpildot šo formu..."
                          rows={2}
                          onChange={(e) => {
                            const updated = [...val];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            handleFieldChange(fieldPath, updated);
                          }}
                          className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2 rounded-lg text-xs text-zinc-200 resize-y"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {val.length === 0 && (
              <div className="text-center py-8 text-zinc-600 text-xs italic font-sans">
                Sadaļā nav neviena bloka. Lūdzu, izmantojiet labo izvēlni, lai pievienotu blokus (tekstus, galerijas, atsauksmes u.c.).
              </div>
            )}
          </div>
        );
      }

      // If field is array of paragraphs (like "content" in blog articles)
      if (Array.isArray(val) && (val.length === 0 || typeof val[0] === "string")) {
        return (
          <div key={key} className="space-y-3 bg-zinc-950/25 p-5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[11px] font-sans uppercase tracking-wider font-bold text-yellow-500">
                Satura Rindkopas ({key})
              </span>
              <button
                onClick={() => handleFieldChange(fieldPath, [...val, ""])}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Pievienot Rindkopu
              </button>
            </div>
            {val.map((paragraph, pIdx) => (
              <div key={pIdx} className="flex gap-2 items-start bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-800/40">
                <textarea
                  value={paragraph}
                  onChange={(e) => {
                    const newVal = [...val];
                    newVal[pIdx] = e.target.value;
                    handleFieldChange(fieldPath, newVal);
                  }}
                  rows={2}
                  placeholder={`Rindkopa #${pIdx + 1}`}
                  className="flex-1 bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500/60 focus:outline-none p-2.5 rounded-lg text-sm text-zinc-100 resize-y transition font-sans leading-relaxed"
                />
                <button
                  onClick={() => {
                    const newVal = val.filter((_, i) => i !== pIdx);
                    handleFieldChange(fieldPath, newVal);
                  }}
                  className="p-2 bg-red-950/40 hover:bg-red-900 text-red-400 rounded-lg border border-red-900/40 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        );
      }

      // Standard field rendering
      if (typeof val === "boolean") {
        return (
          <div key={key} className="flex items-center justify-between bg-zinc-950/30 p-4 rounded-xl border border-zinc-800">
            <span className="text-xs font-sans uppercase tracking-wider font-bold text-zinc-400">{label}</span>
            <input
              type="checkbox"
              checked={val}
              onChange={(e) => handleFieldChange(fieldPath, e.target.checked)}
              className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
            />
          </div>
        );
      }

      if (typeof val === "number") {
        return (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-sans uppercase tracking-wider font-bold text-zinc-400">{label}</label>
            <input
              type="number"
              value={val}
              onChange={(e) => handleFieldChange(fieldPath, Number(e.target.value))}
              className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-3 rounded-xl text-sm text-zinc-100 font-mono transition"
            />
          </div>
        );
      }

      // Check if value is path to image
      const isImagePath = typeof val === "string" && (val.startsWith("/") || val.includes(".webp") || val.includes(".jpg") || val.includes(".png"));

      return (
        <div key={key} className="space-y-1.5">
          <label className="text-xs font-sans uppercase tracking-wider font-bold text-zinc-400 flex items-center justify-between">
            <span>{label}</span>
            {isImagePath && <span className="text-[10px] text-yellow-500/80 font-mono font-medium">Attēla ceļš</span>}
          </label>
          <div className="relative">
            {isImagePath ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                  className="flex-1 bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-3 rounded-xl text-sm text-zinc-100 font-sans transition"
                />
                {val && (
                  <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={val} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            ) : typeof val === "string" && val.length > 80 ? (
              <textarea
                value={val}
                onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                rows={4}
                className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-3.5 rounded-xl text-sm text-zinc-100 resize-y transition font-sans leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={val}
                onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
                className="w-full bg-zinc-950/40 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-3 rounded-xl text-sm text-zinc-100 font-sans transition"
              />
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div id="admin-json-generic-editor" className="space-y-6">
      {/* File Selector Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div className="space-y-2 flex-1">
          <label className="text-xs uppercase tracking-widest font-mono font-bold text-zinc-500">
            Satura fails
          </label>
          <div className="flex items-center gap-3">
            <select
              value={selectedFile}
              onChange={handleFileChange}
              className="bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none px-4 py-3 rounded-xl text-sm text-zinc-100 font-sans cursor-pointer min-w-[200px]"
            >
              <option value="">-- Izvēlēties failu --</option>
              {files.map((f) => (
                <option key={f.filename} value={f.filename}>
                  {f.filename} {f.hasDraft ? "🟡 (Melnraksts)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl border border-zinc-700 transition duration-150 text-sm font-semibold"
            >
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
        )}
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

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
          <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Ielādē faila saturu...</p>
        </div>
      ) : editedData ? (
        <div className="space-y-4">
          {/* Editor Mode Tabs */}
          <div className="flex border-b border-zinc-800/80">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 ${
                activeTab === "form"
                  ? "border-yellow-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <List className="w-4 h-4" />
              Vizualizēts Formu Redaktors
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 ${
                activeTab === "raw"
                  ? "border-yellow-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Code className="w-4 h-4" />
              Raw JSON Kods
            </button>
          </div>

          {activeTab === "form" ? (
            collectionKey ? (
              /* COLLECTION MASTER-DETAIL LAYOUT */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 align-top">
                {/* Master List Column */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-4 max-h-[800px] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-200">
                      Ierakstu Saraksts ({items.length})
                    </h3>
                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs px-2.5 py-1.5 rounded-lg border border-yellow-500/20 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Pievienot jaunu
                    </button>
                  </div>

                  {/* Sidebar Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Meklēt sarakstā..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500/60 focus:outline-none pl-9 pr-3 py-2.5 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {filteredItems.map(({ item, originalIndex }) => {
                      const label = item.title || item.name || item.slug || `Objekts #${originalIndex + 1}`;
                      const isSelected = selectedItemIndex === originalIndex;

                      return (
                        <div
                          key={originalIndex}
                          onClick={() => setSelectedItemIndex(originalIndex)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${
                            isSelected
                              ? "bg-yellow-500/5 border-yellow-500/40 text-yellow-500"
                              : "bg-zinc-950/20 border-transparent hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="text-xs font-bold font-sans break-all truncate max-w-[150px]">
                            {label}
                          </span>
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => moveItem(originalIndex, "up")}
                              disabled={originalIndex === 0}
                              className="p-1 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-850 disabled:opacity-30 transition"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveItem(originalIndex, "down")}
                              disabled={originalIndex === items.length - 1}
                              className="p-1 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-850 disabled:opacity-30 transition"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(originalIndex)}
                              className="p-1 bg-red-950/30 hover:bg-red-900 text-red-400 hover:text-red-300 rounded border border-red-900/30 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail Edit Column */}
                <div className="md:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
                  {selectedItemIndex !== -1 && items[selectedItemIndex] ? (
                    <>
                      <div className="border-b border-zinc-800 pb-4">
                        <h3 className="text-base font-bold text-white font-sans">
                          Labot Ierakstu:{" "}
                          <span className="text-yellow-500">
                            {items[selectedItemIndex].title || items[selectedItemIndex].name || `Ieraksts #${selectedItemIndex + 1}`}
                          </span>
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {renderFormFields(
                          items[selectedItemIndex],
                          collectionKey === "root_array"
                            ? [String(selectedItemIndex)]
                            : [collectionKey, String(selectedItemIndex)]
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 text-zinc-500 text-sm">
                      Izvēlieties ierakstu kreisajā pusē vai pievienojiet jaunu, lai sāktu rediģēšanu.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SIMPLE FLAT OBJECT FORM EDITOR */
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
                {renderFormFields(editedData, [])}
              </div>
            )
          ) : (
            /* RAW JSON EDITOR TAB */
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={22}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-4 rounded-xl text-xs text-zinc-300 font-mono leading-relaxed"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-500 text-sm flex flex-col items-center justify-center gap-3">
          <FileJson className="w-12 h-12 stroke-1 text-zinc-600" />
          <span>Lūdzu, augšā izvēlieties satura failu, kuru vēlaties labot.</span>
        </div>
      )}
    </div>
  );
};
