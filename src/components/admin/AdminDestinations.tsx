import React, { useState, useEffect } from "react";
import {
  Compass,
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
  MapPin,
  Image as ImageIcon,
  Grid,
  Settings,
  X
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";
import { GalleryItem } from "./AdminGallery";

export interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  galleryId?: string; // Linked Gallery from AdminGallery
  description: string;
  coordinates: {
    lat: string;
    lng: string;
    mapUrl?: string;
  };
  status: "Published" | "Draft" | "Archived";
  seoTitle?: string;
  seoDescription?: string;
}

interface AdminDestinationsProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminDestinations: React.FC<AdminDestinationsProps> = ({ token, showToast }) => {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name_asc");

  // Selected item list for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state
  const [activeDest, setActiveDest] = useState<DestinationItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"saturs" | "seo">("saturs");

  // Media picker target
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Undo history stack
  const [undoStack, setUndoStack] = useState<DestinationItem[][]>([]);

  // Preview state
  const [previewDest, setPreviewDest] = useState<DestinationItem | null>(null);

  useEffect(() => {
    fetchDestinationsAndGalleries();
  }, []);

  const fetchDestinationsAndGalleries = async () => {
    try {
      setLoading(true);
      // Fetch Destinations
      const res = await fetch("/api/cms/content-file/destinations.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      let destList: DestinationItem[] = [];
      if (res.ok) {
        const data = await res.json();
        destList = data.draft?.destinations || data.original?.destinations || [];
      } else {
        destList = getFallbackDestinations();
      }

      // Fetch Galleries to allow linking
      const gallRes = await fetch("/api/cms/content-file/galleries.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      let gallList: GalleryItem[] = [];
      if (gallRes.ok) {
        const gallData = await gallRes.json();
        gallList = gallData.draft?.galleries || gallData.original?.galleries || [];
      }

      setDestinations(destList);
      setGalleries(gallList);
    } catch (err) {
      console.error("Error loading destinations:", err);
      setDestinations(getFallbackDestinations());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackDestinations = (): DestinationItem[] => {
    return [
      {
        id: "riga",
        name: "Rīga un Pierīga",
        slug: "riga-un-pieriga",
        image: "/images/uploads/ka-pareiza-komercipasuma-apsaimniekosana-palielina-ta-vertibu.webp",
        galleryId: "gal-1",
        description: "Avenue Group galvenais darbības reģions ar lielāko apsaimniekojamo komercplatību blīvumu, inženiertīklu uzturēšanas brigādēm un operatīvo reaģēšanu 24/7.",
        coordinates: {
          lat: "56.9496",
          lng: "24.1052",
          mapUrl: "https://maps.google.com/?q=Riga"
        },
        status: "Published",
        seoTitle: "Komercplatību apsaimniekošana Rīgā un Pierīgā",
        seoDescription: "Profesionāli apsaimniekošanas un inženiertīklu uzturēšanas pakalpojumi komercīpašumiem Rīgā. Operatīva uzturēšana un diennakts palīdzības dienests."
      },
      {
        id: "kurzeme",
        name: "Kurzemes reģions",
        slug: "kurzemes-regionas",
        image: "/images/uploads/ka-samazinat-komercipasuma-uzturesanas-izmaksas.webp",
        galleryId: "gal-2",
        description: "Kurzemes lielākās pilsētas - Liepāja, Ventspils un Saldus. Apkalpojam industriālos parkus un tirdzniecības centrus reģionā.",
        coordinates: {
          lat: "56.5047",
          lng: "21.0108",
          mapUrl: "https://maps.google.com/?q=Liepaja"
        },
        status: "Published"
      }
    ];
  };

  const pushToHistory = (currentState: DestinationItem[]) => {
    setUndoStack((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(currentState))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setDestinations(previousState);
    saveDestinationsState(previousState, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveDestinationsState = async (updated: DestinationItem[], isUndo = false) => {
    try {
      if (!isUndo) {
        pushToHistory(destinations);
      }
      setDestinations(updated);

      const res = await fetch("/api/cms/content-file/destinations.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            destinations: updated
          }
        })
      });

      if (!res.ok) throw new Error("Failed to save destinations on server");
      if (!isUndo) showToast("Galamērķi saglabāti melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Neizdevās saglabāt datus serverī.", "error");
    }
  };

  const handleCreateDestination = () => {
    const name = window.prompt("Ievadiet jaunas zonas / galamērķa nosaukumu:");
    if (!name) return;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const newDest: DestinationItem = {
      id: "dest-" + Date.now(),
      name,
      slug,
      image: "",
      description: "Šīs zonas pakalpojumu apraksts...",
      coordinates: {
        lat: "56.9",
        lng: "24.1",
        mapUrl: ""
      },
      status: "Draft"
    };

    const updated = [newDest, ...destinations];
    saveDestinationsState(updated);
    setActiveDest(newDest);
    setIsEditorOpen(true);
    setEditorTab("saturs");
  };

  const handleDeleteDestination = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo zonu?")) return;
    const updated = destinations.filter((d) => d.id !== id);
    saveDestinationsState(updated);
    showToast("Zona izdzēsta sekmīgi.", "success");
  };

  const handleDuplicateDestination = (item: DestinationItem) => {
    const dup: DestinationItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: "dest-" + Date.now(),
      name: `${item.name} (Kopija)`,
      slug: `${item.slug}-kopija`,
      status: "Draft"
    };
    const updated = [dup, ...destinations];
    saveDestinationsState(updated);
    showToast("Zona sekmīgi dublēta.", "success");
  };

  const handleSaveEditor = () => {
    if (!activeDest) return;
    const updated = destinations.map((d) => (d.id === activeDest.id ? activeDest : d));
    saveDestinationsState(updated);
    setIsEditorOpen(false);
    setActiveDest(null);
  };

  // Bulk Actions
  const handleBulkStatusChange = (status: DestinationItem["status"]) => {
    if (selectedIds.length === 0) return;
    const updated = destinations.map((d) =>
      selectedIds.includes(d.id) ? { ...d, status } : d
    );
    saveDestinationsState(updated);
    setSelectedIds([]);
    showToast(`Atlasītajām zonām nomainīts statuss: ${status}`, "success");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Vai tiešām vēlaties dzēst ${selectedIds.length} atlasītās zonas?`)) return;
    const updated = destinations.filter((d) => !selectedIds.includes(d.id));
    saveDestinationsState(updated);
    setSelectedIds([]);
    showToast("Atlasītās zonas tika izdzēstas.", "success");
  };

  // Export/Import
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(destinations, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "destinations_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Eksports sekmīgs!", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const updated = [...parsed, ...destinations];
            saveDestinationsState(updated);
            showToast(`Veiksmīgi importētas ${parsed.length} zonas!`, "success");
          } else {
            showToast("Nederīgs faila formāts.", "error");
          }
        } catch (err) {
          showToast("Kļūda lasot failu.", "error");
        }
      };
    }
  };

  // Filtering & Sorting
  const getFilteredDestinations = () => {
    return destinations
      .filter((d) => {
        const matchesSearch =
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || d.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "name_desc") return b.name.localeCompare(a.name);
        return 0;
      });
  };

  const filtered = getFilteredDestinations();

  const handleMediaSelected = (url: string) => {
    if (activeDest) {
      setActiveDest({ ...activeDest, image: url });
    }
    setIsMediaPickerOpen(false);
    showToast("Banera attēls piesaistīts zonai!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Upper summary stats ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Kopā zonas</span>
          <span className="text-xl font-extrabold text-white mt-1">{destinations.length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono font-bold">Publicētas</span>
          <span className="text-xl font-extrabold text-white mt-1">{destinations.filter((d) => d.status === "Published").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-mono font-bold">Melnraksti</span>
          <span className="text-xl font-extrabold text-white mt-1">{destinations.filter((d) => d.status === "Draft").length}</span>
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

      {/* Search and Toolbar */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 px-4 py-2.5 rounded-2xl">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Meklēt zonas un reģionus pēc nosaukuma, apraksta..."
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
              <option value="Published">Aktīvās</option>
              <option value="Draft">Melnraksti</option>
              <option value="Archived">Arhivētās</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 rounded-xl focus:outline-none"
            >
              <option value="name_asc">Pēc Alfabēta (A-Z)</option>
              <option value="name_desc">Pēc Alfabēta (Z-A)</option>
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
                onClick={handleCreateDestination}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Pievienot Zonu
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Panel */}
        {selectedIds.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-yellow-500/90 font-bold">
              Atlasītas <span className="underline">{selectedIds.length}</span> zonas
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

      {/* Grid of Destination Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((dest) => {
          const isSelected = selectedIds.includes(dest.id);
          const linkedGallery = galleries.find((g) => g.id === dest.galleryId);
          return (
            <div
              key={dest.id}
              className={`bg-zinc-900/60 border rounded-2.5xl overflow-hidden flex flex-col justify-between p-4 space-y-4 group transition relative ${
                isSelected ? "border-yellow-500" : "border-zinc-850 hover:border-zinc-800"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    setSelectedIds(selectedIds.filter((id) => id !== dest.id));
                  } else {
                    setSelectedIds([...selectedIds, dest.id]);
                  }
                }}
                className="absolute top-4 left-4 z-10 rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer"
              />

              <div className="space-y-3">
                <div className="aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 flex items-center justify-center relative">
                  {dest.image ? (
                    <img src={dest.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-zinc-700" />
                  )}
                  {linkedGallery && (
                    <div className="absolute top-2 right-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Grid className="w-3 h-3" />
                      Saites Galerija
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-mono">/{dest.slug}</span>
                    <span className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                      dest.status === "Published" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {dest.status === "Published" ? "Aktīvs" : "Melnraksts"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-500 transition">{dest.name}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">{dest.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono bg-zinc-950/40 p-2 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Lat: {dest.coordinates.lat || "—"}</span> • <span>Lng: {dest.coordinates.lng || "—"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-850/40">
                <button
                  onClick={() => setPreviewDest(dest)}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Skatīt
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setActiveDest(dest);
                      setIsEditorOpen(true);
                      setEditorTab("saturs");
                    }}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                    title="Labot"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateDestination(dest)}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                    title="Dublēt"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDestination(dest.id)}
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

      {/* EDITOR DIALOG SLIDE OVER */}
      {isEditorOpen && activeDest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-900 h-full flex flex-col justify-between shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 sticky top-0 backdrop-blur z-10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-yellow-500" />
                  Rediģēt darbības zonu
                </span>
                <h3 className="text-sm font-bold text-white">{activeDest.name || "Jauna zona"}</h3>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Tabs Nav */}
            <div className="flex border-b border-zinc-900 bg-zinc-950/40 px-5 gap-1.5">
              <button
                onClick={() => setEditorTab("saturs")}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${
                  editorTab === "saturs" ? "border-yellow-500 text-yellow-500" : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Galvenā Informācija
              </button>
              <button
                onClick={() => setEditorTab("seo")}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${
                  editorTab === "seo" ? "border-yellow-500 text-yellow-500" : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                SEO Parametri
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {editorTab === "saturs" && (
                <>
                  {/* Image banner */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Zonas galvenais attēls (Featured Image)</label>
                    <div className="aspect-video w-full bg-zinc-900 rounded-2xl border border-zinc-850 flex items-center justify-center relative overflow-hidden group">
                      {activeDest.image ? (
                        <>
                          <img src={activeDest.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2">
                            <button
                              onClick={() => setIsMediaPickerOpen(true)}
                              className="px-3 py-1.5 bg-yellow-500 text-zinc-950 text-xs font-bold rounded-lg transition"
                            >
                              Nomainīt
                            </button>
                            <button
                              onClick={() => setActiveDest({ ...activeDest, image: "" })}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg transition"
                            >
                              Noņemt
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="w-8 h-8 text-zinc-600" />
                          <button
                            onClick={() => setIsMediaPickerOpen(true)}
                            className="px-3.5 py-2 bg-zinc-800 text-white text-[11px] font-bold rounded-xl transition"
                          >
                            Izvēlēties no Media Library
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name and Slug */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Zonas nosaukums</label>
                      <input
                        type="text"
                        value={activeDest.name}
                        onChange={(e) => setActiveDest({ ...activeDest, name: e.target.value })}
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">URL Slug</label>
                      <input
                        type="text"
                        value={activeDest.slug}
                        onChange={(e) => setActiveDest({ ...activeDest, slug: e.target.value })}
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Linked Gallery Portfolio folder */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Piesaistītā mājaslapas projektu galerija</label>
                    <select
                      value={activeDest.galleryId || ""}
                      onChange={(e) => setActiveDest({ ...activeDest, galleryId: e.target.value || undefined })}
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="">Neviena (Lapa rādīs noklusēto saturu)</option>
                      {galleries.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title} ({g.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Coordinates & Google Map Links */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ģeogrāfiskais platums (Latitude)</label>
                      <input
                        type="text"
                        value={activeDest.coordinates.lat}
                        onChange={(e) =>
                          setActiveDest({
                            ...activeDest,
                            coordinates: { ...activeDest.coordinates, lat: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ģeogrāfiskais garums (Longitude)</label>
                      <input
                        type="text"
                        value={activeDest.coordinates.lng}
                        onChange={(e) =>
                          setActiveDest({
                            ...activeDest,
                            coordinates: { ...activeDest.coordinates, lng: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Google Maps meklēšanas URL</label>
                    <input
                      type="text"
                      value={activeDest.coordinates.mapUrl || ""}
                      onChange={(e) =>
                        setActiveDest({
                          ...activeDest,
                          coordinates: { ...activeDest.coordinates, mapUrl: e.target.value }
                        })
                      }
                      placeholder="Piemēram, https://maps.google.com/?q=..."
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rādīšanas statuss</label>
                    <select
                      value={activeDest.status}
                      onChange={(e) => setActiveDest({ ...activeDest, status: e.target.value as DestinationItem["status"] })}
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="Published">Aktīva (Rādīt kartē)</option>
                      <option value="Draft">Melnraksts (Draft)</option>
                      <option value="Archived">Arhivēta (Archived)</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Zonas pakalpojumu detalizēts apraksts</label>
                    <textarea
                      rows={5}
                      value={activeDest.description}
                      onChange={(e) => setActiveDest({ ...activeDest, description: e.target.value })}
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </>
              )}

              {editorTab === "seo" && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SEO Title (Zonas lapa)</label>
                    <input
                      type="text"
                      value={activeDest.seoTitle || ""}
                      onChange={(e) => setActiveDest({ ...activeDest, seoTitle: e.target.value })}
                      placeholder={activeDest.name}
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SEO Description</label>
                    <textarea
                      rows={4}
                      value={activeDest.seoDescription || ""}
                      onChange={(e) => setActiveDest({ ...activeDest, seoDescription: e.target.value })}
                      placeholder="Ievadiet meklētāju meklēšanas rezultātu aprakstu..."
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 sticky bottom-0 backdrop-blur flex justify-end gap-3 z-10">
              <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition">Atcelt</button>
              <button onClick={handleSaveEditor} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition">Saglabāt</button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA LIBRARY OVERLAY PICKER */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Izvēlēties galamērķa banera attēlu</span>
              <button onClick={() => setIsMediaPickerOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <AdminMedia token={token} onSelect={handleMediaSelected} isPickerMode={true} />
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW DIALOG */}
      {previewDest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-2xl rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Zona: {previewDest.name}</span>
              <button onClick={() => setPreviewDest(null)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {previewDest.image && (
                <div className="aspect-video rounded-xl overflow-hidden border border-zinc-900">
                  <img src={previewDest.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <h3 className="text-sm font-bold text-white">Apraksts</h3>
              <p className="text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">{previewDest.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
