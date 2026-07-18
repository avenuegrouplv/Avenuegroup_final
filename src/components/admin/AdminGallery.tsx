import React, { useState, useEffect } from "react";
import {
  Grid,
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
  Image as ImageIcon,
  ArrowUpDown,
  X
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";

export interface GalleryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  status: "Published" | "Draft" | "Archived";
  createdAt: string;
}

interface AdminGalleryProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminGallery: React.FC<AdminGalleryProps> = ({ token, showToast }) => {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title_asc");

  // Selected state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state
  const [activeGallery, setActiveGallery] = useState<GalleryItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Media picker modal target
  const [mediaPickerTargetIndex, setMediaPickerTargetIndex] = useState<number | "new" | null>(null);

  // Undo history stack
  const [undoStack, setUndoStack] = useState<GalleryItem[][]>([]);

  // Preview state
  const [previewGallery, setPreviewGallery] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/content-file/galleries.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGalleries(data.draft?.galleries || data.original?.galleries || []);
      } else {
        setGalleries(getFallbackGalleries());
      }
    } catch (err) {
      console.error("Error loading galleries:", err);
      setGalleries(getFallbackGalleries());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackGalleries = (): GalleryItem[] => {
    return [
      {
        id: "gal-1",
        title: "Biroju Centrs Skanste",
        slug: "biroju-centrs-skanste",
        description: "Pabeigtā biroju kompleksa iekšējie un ārējie inženiertīkli, ventilācija un dzesēšana.",
        images: [
          "/images/uploads/ka-pareiza-komercipasuma-apsaimniekosana-palielina-ta-vertibu.webp",
          "/images/uploads/kas-obligati-jaieklauj-komercnomas-liguma.webp"
        ],
        category: "Biroji",
        status: "Published",
        createdAt: "2026-06-15"
      },
      {
        id: "gal-2",
        title: "Loģistikas Parks Mārupe",
        slug: "logistikas-parks-marupe",
        description: "A klases noliktavu kompleksa fasādes, siltummezglu un teritorijas apsaimniekošanas darbi.",
        images: [
          "/images/uploads/ka-samazinat-komercipasuma-uzturesanas-izmaksas.webp"
        ],
        category: "Noliktavas",
        status: "Published",
        createdAt: "2026-06-28"
      }
    ];
  };

  const pushToHistory = (currentState: GalleryItem[]) => {
    setUndoStack((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(currentState))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setGalleries(previousState);
    saveGalleriesState(previousState, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveGalleriesState = async (updated: GalleryItem[], isUndo = false) => {
    try {
      if (!isUndo) {
        pushToHistory(galleries);
      }
      setGalleries(updated);

      const res = await fetch("/api/cms/content-file/galleries.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            galleries: updated
          }
        })
      });

      if (!res.ok) throw new Error("Failed to save to server");
      if (!isUndo) showToast("Galerija saglabāta melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Neizdevās saglabāt datus serverī.", "error");
    }
  };

  const handleCreateGallery = () => {
    const title = window.prompt("Ievadiet jaunas galerijas nosaukumu:");
    if (!title) return;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const newGal: GalleryItem = {
      id: "gal-" + Date.now(),
      title,
      slug,
      description: "Īss apraksts par projektu vai attēliem...",
      images: [],
      category: "Biroji",
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0]
    };

    const updated = [newGal, ...galleries];
    saveGalleriesState(updated);
    setActiveGallery(newGal);
    setIsEditorOpen(true);
  };

  const handleDeleteGallery = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo galeriju?")) return;
    const updated = galleries.filter((g) => g.id !== id);
    saveGalleriesState(updated);
    showToast("Galerija izdzēsta veiksmīgi.", "success");
  };

  const handleDuplicateGallery = (item: GalleryItem) => {
    const dup: GalleryItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: "gal-" + Date.now(),
      title: `${item.title} (Kopija)`,
      slug: `${item.slug}-kopija`,
      createdAt: new Date().toISOString().split("T")[0]
    };
    const updated = [dup, ...galleries];
    saveGalleriesState(updated);
    showToast("Galerija sekmīgi dublēta.", "success");
  };

  const handleSaveEditor = () => {
    if (!activeGallery) return;
    const updated = galleries.map((g) => (g.id === activeGallery.id ? activeGallery : g));
    saveGalleriesState(updated);
    setIsEditorOpen(false);
    setActiveGallery(null);
  };

  // Bulk actions
  const handleBulkStatusChange = (status: GalleryItem["status"]) => {
    if (selectedIds.length === 0) return;
    const updated = galleries.map((g) =>
      selectedIds.includes(g.id) ? { ...g, status } : g
    );
    saveGalleriesState(updated);
    setSelectedIds([]);
    showToast(`Izvēlētajām galerijām uzstādīts statuss: ${status}`, "success");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Vai tiešām vēlaties dzēst ${selectedIds.length} atlasītās galerijas?`)) return;
    const updated = galleries.filter((g) => !selectedIds.includes(g.id));
    saveGalleriesState(updated);
    setSelectedIds([]);
    showToast("Atlasītās galerijas tika izdzēstas.", "success");
  };

  // Import/Export helper
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(galleries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "galleries_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Galeriju eksports pabeigts!", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const updated = [...parsed, ...galleries];
            saveGalleriesState(updated);
            showToast(`Sekmīgi importētas ${parsed.length} galerijas!`, "success");
          } else {
            showToast("Nederīgs galerijas JSON fails.", "error");
          }
        } catch (err) {
          showToast("Kļūda lasot failu.", "error");
        }
      };
    }
  };

  // Filters & Sort
  const getFilteredGalleries = () => {
    return galleries
      .filter((g) => {
        const matchesSearch =
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || g.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "title_asc") return a.title.localeCompare(b.title);
        if (sortBy === "title_desc") return b.title.localeCompare(a.title);
        if (sortBy === "images_desc") return b.images.length - a.images.length;
        if (sortBy === "date_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  };

  const filtered = getFilteredGalleries();
  const categories = Array.from(new Set(galleries.map((g) => g.category)));

  // Media Library Selection callback
  const handleMediaSelected = (url: string) => {
    if (!activeGallery || mediaPickerTargetIndex === null) return;

    let newImages = [...(activeGallery.images || [])];
    if (mediaPickerTargetIndex === "new") {
      newImages.push(url);
    } else {
      newImages[mediaPickerTargetIndex] = url;
    }

    setActiveGallery({ ...activeGallery, images: newImages });
    setMediaPickerTargetIndex(null);
    showToast("Attēls piesaistīts projektam!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Upper summary stats ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Kopā galeriju</span>
          <span className="text-xl font-extrabold text-white mt-1">{galleries.length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono font-bold">Aktīvas</span>
          <span className="text-xl font-extrabold text-white mt-1">{galleries.filter((g) => g.status === "Published").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-mono font-bold">Melnraksti</span>
          <span className="text-xl font-extrabold text-white mt-1">{galleries.filter((g) => g.status === "Draft").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono font-bold">Vēsture</span>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs text-zinc-300 rounded-lg transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Atgriezt ({undoStack.length})
          </button>
        </div>
      </div>

      {/* Search and filtering */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 px-4 py-2.5 rounded-2xl">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Meklēt galeriju (virsraksts, apraksts, kategorija)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="all">Visi statusi</option>
              <option value="Published">Publicēts</option>
              <option value="Draft">Melnraksti</option>
              <option value="Archived">Arhivēts</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="all">Visas kategorijas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 rounded-xl focus:outline-none"
            >
              <option value="title_asc">Virsraksts (A-Z)</option>
              <option value="title_desc">Virsraksts (Z-A)</option>
              <option value="images_desc">Attēlu skaits (Lielākais)</option>
              <option value="date_desc">Izveides datums (Jaunākie)</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
                title="Eksportēt uz JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <label className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              <button
                onClick={handleCreateGallery}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Jauna Galerija
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Panel */}
        {selectedIds.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-yellow-500/90 font-bold">
              Atlasītas <span className="underline">{selectedIds.length}</span> galerijas
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleBulkStatusChange("Published")}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] text-zinc-300 font-bold rounded-lg transition"
              >
                Publicēt
              </button>
              <button
                onClick={() => handleBulkStatusChange("Draft")}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] text-zinc-300 font-bold rounded-lg transition"
              >
                Melnrakstā
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-[10px] text-red-400 font-bold rounded-lg transition"
              >
                Dzēst
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-zinc-500 hover:text-zinc-300 px-2 text-[10px] font-bold"
              >
                Atcelt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Galleries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getFilteredGalleries().map((gallery) => {
          const isSelected = selectedIds.includes(gallery.id);
          return (
            <div
              key={gallery.id}
              className={`bg-zinc-900/60 border rounded-2.5xl overflow-hidden flex flex-col justify-between p-4 space-y-4 group transition-all relative ${
                isSelected ? "border-yellow-500/80 ring-1 ring-yellow-500/10" : "border-zinc-850 hover:border-zinc-800"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    setSelectedIds(selectedIds.filter((id) => id !== gallery.id));
                  } else {
                    setSelectedIds([...selectedIds, gallery.id]);
                  }
                }}
                className="absolute top-4 left-4 z-10 rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer"
              />

              <div className="space-y-3">
                {/* Visual Cover Preview Grid */}
                <div className="aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850/60 flex items-center justify-center relative select-none">
                  {gallery.images && gallery.images.length > 0 ? (
                    <img src={gallery.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-zinc-700" />
                  )}
                  {gallery.images && gallery.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur border border-zinc-800 text-[10px] font-mono px-2 py-0.5 rounded-lg font-bold text-zinc-300">
                      +{gallery.images.length - 1} attēli
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono bg-zinc-900 px-2 py-0.5 rounded text-zinc-400 font-bold">{gallery.category}</span>
                    <span className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                      gallery.status === "Published" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {gallery.status === "Published" ? "Aktīva" : "Melnraksts"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-500 transition line-clamp-1">{gallery.title}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed h-8">{gallery.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-850/40">
                <span className="text-[10px] text-zinc-500 font-mono">{gallery.createdAt}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewGallery(gallery)}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                    title="Skatīt galeriju"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveGallery(gallery);
                      setIsEditorOpen(true);
                    }}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                    title="Labot"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateGallery(gallery)}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                    title="Dublēt"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGallery(gallery.id)}
                    className="p-1.5 hover:bg-zinc-800 text-red-500 hover:text-red-400 rounded-lg transition"
                    title="Dzēst"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GALLERY EDITOR MODAL */}
      {isEditorOpen && activeGallery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-yellow-500" />
                  Rediģēt galeriju
                </span>
                <h3 className="text-sm font-bold text-white">{activeGallery.title || "Jauna galerija"}</h3>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 max-h-[65vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nosaukums</label>
                  <input
                    type="text"
                    value={activeGallery.title}
                    onChange={(e) => setActiveGallery({ ...activeGallery, title: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">URL Slug</label>
                  <input
                    type="text"
                    value={activeGallery.slug}
                    onChange={(e) => setActiveGallery({ ...activeGallery, slug: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Kategorija</label>
                  <input
                    type="text"
                    value={activeGallery.category}
                    onChange={(e) => setActiveGallery({ ...activeGallery, category: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Izveides datums</label>
                  <input
                    type="date"
                    value={activeGallery.createdAt}
                    onChange={(e) => setActiveGallery({ ...activeGallery, createdAt: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rādīšanas statuss</label>
                  <select
                    value={activeGallery.status}
                    onChange={(e) => setActiveGallery({ ...activeGallery, status: e.target.value as GalleryItem["status"] })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="Published">Aktīva (Rādīt portfelī)</option>
                    <option value="Draft">Melnraksts (Draft)</option>
                    <option value="Archived">Arhivēta (Archived)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Apraksts</label>
                <textarea
                  rows={2}
                  value={activeGallery.description}
                  onChange={(e) => setActiveGallery({ ...activeGallery, description: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              {/* Visual Multi Image list chosen strictly from Media Library */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mājaslapā publicētie attēli</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {activeGallery.images?.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-zinc-900 rounded-xl border border-zinc-850 relative overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-1 p-1">
                        <button
                          onClick={() => setMediaPickerTargetIndex(idx)}
                          className="w-full py-0.5 bg-yellow-500 text-zinc-950 text-[9px] font-bold rounded text-center transition"
                        >
                          Nomainīt
                        </button>
                        <button
                          onClick={() => {
                            const filtered = activeGallery.images.filter((_, gIdx) => gIdx !== idx);
                            setActiveGallery({ ...activeGallery, images: filtered });
                          }}
                          className="w-full py-0.5 bg-red-600 text-white text-[9px] font-bold rounded text-center transition"
                        >
                          Dzēst
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setMediaPickerTargetIndex("new")}
                    className="aspect-square bg-zinc-950/40 border border-zinc-850 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-2 hover:bg-zinc-900/10 transition group"
                  >
                    <Plus className="w-5 h-5 text-zinc-600 group-hover:text-yellow-500 transition mb-1" />
                    <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-400">Pievienot</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 sticky bottom-0 backdrop-blur flex justify-end gap-3 z-10">
              <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition">Atcelt</button>
              <button onClick={handleSaveEditor} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition">Saglabāt</button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PICKER OVERLAY */}
      {mediaPickerTargetIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Izvēlēties attēlu projektam</span>
              <button onClick={() => setMediaPickerTargetIndex(null)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <AdminMedia token={token} onSelect={handleMediaSelected} isPickerMode={true} />
            </div>
          </div>
        </div>
      )}

      {/* GALLERY PREVIEW MODAL */}
      {previewGallery && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-3xl rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Galerija: {previewGallery.title}</span>
              <button onClick={() => setPreviewGallery(null)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <p className="text-zinc-300 font-sans leading-relaxed">{previewGallery.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previewGallery.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-zinc-900">
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
