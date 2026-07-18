import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Search,
  Filter,
  Check,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  FolderMinus,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Settings,
  Image as ImageIcon,
  ArrowUpDown,
  Download,
  Upload,
  Undo2,
  Eye,
  CheckCircle,
  FileText,
  Clock,
  Compass,
  Paperclip,
  X
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
  featuredImage: string;
  gallery: string[];
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  readingTime: string;
  relatedPosts: string[];
  destinationId?: string;
  status: "Draft" | "Published" | "Scheduled" | "Archived";
  scheduledDate?: string;
}

interface AdminBlogProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminBlog: React.FC<AdminBlogProps> = ({ token, showToast }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("publishDate_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected item list for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"saturs" | "seo" | "galerija">("saturs");

  // Media picker integration
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    type: "featured" | "og" | "gallery";
    index?: number;
  } | null>(null);

  // Undo history stack
  const [undoStack, setUndoStack] = useState<BlogPost[][]>([]);

  // Preview state
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchBlogsAndDestinations();
  }, []);

  const fetchBlogsAndDestinations = async () => {
    try {
      setLoading(true);
      // Fetch Blogs
      const res = await fetch("/api/cms/content-file/blog.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      let blogList: BlogPost[] = [];
      if (res.ok) {
        const data = await res.json();
        blogList = data.draft?.blogs || data.original?.blogs || [];
      } else {
        // Fallback or initialize if file doesn't exist
        blogList = getFallbackBlogs();
      }

      // Fetch Destinations to map relations
      const destRes = await fetch("/api/cms/content-file/destinations.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      let destList: any[] = [];
      if (destRes.ok) {
        const destData = await destRes.json();
        destList = destData.draft?.destinations || destData.original?.destinations || [];
      } else {
        destList = [
          { id: "riga", name: "Rīga un Pierīga" },
          { id: "kurzeme", name: "Kurzeme" },
          { id: "vidzeme", name: "Vidzeme" }
        ];
      }

      setBlogs(blogList);
      setDestinations(destList);
    } catch (err) {
      console.error("Error loading blog data:", err);
      setBlogs(getFallbackBlogs());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackBlogs = (): BlogPost[] => {
    return [
      {
        id: "post-1",
        title: "Komercīpašumu apsaimniekošanas tendences Latvijā",
        slug: "komercipasumu-apsaimniekosanas-tendences",
        category: "Apsaimniekošana",
        tags: ["Tendences", "Energoefektivitāte", "Biroji"],
        author: "Avenue Group",
        publishDate: "2026-07-10",
        featuredImage: "/images/uploads/ka-pareiza-komercipasuma-apsaimniekosana-palielina-ta-vertibu.webp",
        gallery: [],
        content: "Energoefektivitāte un viedā apsaimniekošana šodien ir svarīgākie jautājumi komercplatību īpašniekiem Latvijā. Pieaugot komunālo pakalpojumu cenām, investori meklē inovatīvus risinājumus, lai samazinātu uzturēšanas izmaksas, nezaudējot pakalpojuma kvalitāti.\n\nGalvenie fokusi:\n- Siltummezglu automatizācija un attālināta vadība.\n- Preventīvā iekārtu apkope, izmantojot IoT sensorus.\n- Zaļā sertifikācija (BREEAM, LEED), kas piesaista augstākas klases nomniekus.",
        seoTitle: "Komercīpašumu apsaimniekošana un tendences | Avenue Group",
        seoDescription: "Uzziniet par jaunākajām komercplatību apsaimniekošanas un energoefektivitātes tendencēm Latvijas tirgū.",
        readingTime: "5 min",
        relatedPosts: [],
        destinationId: "riga",
        status: "Published"
      },
      {
        id: "post-2",
        title: "Kā pareizi sagatavoties komercnomas līguma parakstīšanai?",
        slug: "komercnomas-liguma-sagatavosana",
        category: "Juridiskais Atbalsts",
        tags: ["Līgumi", "Drošības depozīts", "Komercnoma"],
        author: "Juridiskā nodaļa",
        publishDate: "2026-07-15",
        featuredImage: "/images/uploads/kas-obligati-jaieklauj-komercnomas-liguma.webp",
        gallery: [],
        content: "Komercnomas līgums ir ilgtermiņa saistības, kurās katrai detaļai ir milzīga nozīme. Pirms parakstīšanas ir svarīgi izvērtēt gan drošības depozīta apmēru, gan precīzu apsaimniekošanas izmaksu sadalījumu (Triple Net princips).\n\nNianses, kas jāpārbauda:\n1. Īres tiesību nostiprināšana Zemesgrāmatā.\n2. Vienpusējas atkāpšanās noteikumi un līgumsodi.\n3. Indeksācijas formula un termiņi.",
        seoTitle: "Komercnomas līguma sagatavošanas ceļvedis",
        seoDescription: "Profesionāli padomi un svarīgākie punkti, kas jāņem vērā pirms komercplatību nomas līguma parakstīšanas.",
        readingTime: "8 min",
        relatedPosts: ["post-1"],
        destinationId: "riga",
        status: "Draft"
      }
    ];
  };

  const pushToHistory = (currentState: BlogPost[]) => {
    setUndoStack((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(currentState))]); // Keep last 10 entries
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setBlogs(previousState);
    saveBlogsState(previousState, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveBlogsState = async (updatedBlogs: BlogPost[], isUndo = false) => {
    try {
      if (!isUndo) {
        pushToHistory(blogs);
      }
      setBlogs(updatedBlogs);

      const res = await fetch("/api/cms/content-file/blog.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            blogs: updatedBlogs
          }
        })
      });

      if (!res.ok) throw new Error("Neizdevās saglabāt datus serverī");
      if (!isUndo) showToast("Izmaiņas saglabātas melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Neizdevās sinhronizēt datus ar serveri.", "error");
    }
  };

  // CRUD Operations
  const handleCreatePost = () => {
    const title = window.prompt("Ievadiet jauna raksta nosaukumu:");
    if (!title) return;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const newPost: BlogPost = {
      id: "post-" + Date.now(),
      title,
      slug,
      category: "Apsaimniekošana",
      tags: ["Jauns"],
      author: "Admin",
      publishDate: new Date().toISOString().split("T")[0],
      featuredImage: "",
      gallery: [],
      content: "Sāciet rakstīt saturu šeit...",
      readingTime: "3 min",
      relatedPosts: [],
      status: "Draft"
    };

    const updated = [newPost, ...blogs];
    saveBlogsState(updated);
    setActivePost(newPost);
    setIsEditorOpen(true);
    setEditorTab("saturs");
  };

  const handleDeletePost = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo rakstu?")) return;
    const updated = blogs.filter((b) => b.id !== id);
    saveBlogsState(updated);
    showToast("Raksts veiksmīgi izdzēsts.", "success");
  };

  const handleDuplicatePost = (post: BlogPost) => {
    const duplicate: BlogPost = {
      ...JSON.parse(JSON.stringify(post)),
      id: "post-" + Date.now(),
      title: `${post.title} (Kopija)`,
      slug: `${post.slug}-kopija`,
      status: "Draft",
      publishDate: new Date().toISOString().split("T")[0]
    };
    const updated = [duplicate, ...blogs];
    saveBlogsState(updated);
    showToast("Raksts veiksmīgi dublēts.", "success");
  };

  const handleSaveEditor = () => {
    if (!activePost) return;
    const updated = blogs.map((b) => (b.id === activePost.id ? activePost : b));
    saveBlogsState(updated);
    setIsEditorOpen(false);
    setActivePost(null);
  };

  // Bulk actions
  const handleBulkStatusChange = (status: BlogPost["status"]) => {
    if (selectedIds.length === 0) return;
    const updated = blogs.map((b) =>
      selectedIds.includes(b.id) ? { ...b, status } : b
    );
    saveBlogsState(updated);
    setSelectedIds([]);
    showToast(`Atlasītajiem rakstiem nomainīts statuss: ${status}`, "success");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Vai tiešām vēlaties dzēst ${selectedIds.length} atlasītos rakstus?`)) return;
    const updated = blogs.filter((b) => !selectedIds.includes(b.id));
    saveBlogsState(updated);
    setSelectedIds([]);
    showToast("Atlasītie raksti tika izdzēsti.", "success");
  };

  // Import/Export helper
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "blog_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Eksports pabeigts sekmīgi!", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const updated = [...parsed, ...blogs];
            saveBlogsState(updated);
            showToast(`Veiksmīgi importēti ${parsed.length} raksti!`, "success");
          } else {
            showToast("Nederīgs faila formāts. Jābūt JSON masīvam.", "error");
          }
        } catch (err) {
          showToast("Kļūda lasot failu.", "error");
        }
      };
    }
  };

  // Filter & Sort blogs
  const getFilteredBlogs = () => {
    return blogs
      .filter((b) => {
        const matchesSearch =
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "publishDate_desc") return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        if (sortBy === "publishDate_asc") return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
        if (sortBy === "title_asc") return a.title.localeCompare(b.title);
        if (sortBy === "title_desc") return b.title.localeCompare(a.title);
        if (sortBy === "readingTime_asc") return parseInt(a.readingTime) - parseInt(b.readingTime);
        return 0;
      });
  };

  const filtered = getFilteredBlogs();
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedBlogs = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categories = Array.from(new Set(blogs.map((b) => b.category)));

  // Media picker select callback
  const handleMediaSelected = (url: string) => {
    if (!activePost || !mediaPickerTarget) return;

    if (mediaPickerTarget.type === "featured") {
      setActivePost({ ...activePost, featuredImage: url });
    } else if (mediaPickerTarget.type === "og") {
      setActivePost({ ...activePost, ogImage: url });
    } else if (mediaPickerTarget.type === "gallery") {
      const idx = mediaPickerTarget.index;
      let newGallery = [...(activePost.gallery || [])];
      if (idx !== undefined) {
        newGallery[idx] = url;
      } else {
        newGallery.push(url);
      }
      setActivePost({ ...activePost, gallery: newGallery });
    }
    setMediaPickerTarget(null);
    showToast("Attēls veiksmīgi piesaistīts!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Upper stats summary ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Kopā rakstu</span>
          <span className="text-xl font-extrabold text-white mt-1">{blogs.length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono font-bold">Publicēti</span>
          <span className="text-xl font-extrabold text-white mt-1">{blogs.filter((b) => b.status === "Published").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-mono font-bold">Melnraksti</span>
          <span className="text-xl font-extrabold text-white mt-1">{blogs.filter((b) => b.status === "Draft").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-blue-400 uppercase tracking-wider font-mono font-bold">Plānotie</span>
          <span className="text-xl font-extrabold text-white mt-1">{blogs.filter((b) => b.status === "Scheduled").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center col-span-2 lg:col-span-1">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono font-bold">Vēsture</span>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-xs text-zinc-300 rounded-lg transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Atgriezt ({undoStack.length})
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
              placeholder="Meklēt rakstus (nosaukums, birkas, kategorija)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 pr-8 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="all">Visi statusi</option>
                <option value="Published">Publicētie</option>
                <option value="Draft">Melnraksti</option>
                <option value="Scheduled">Plānotie</option>
                <option value="Archived">Arhivētie</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 pr-8 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="all">Visas kategorijas</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Order */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 pr-8 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="publishDate_desc">Jaunākie vispirms</option>
                <option value="publishDate_asc">Vecākie vispirms</option>
                <option value="title_asc">Pēc Alfabēta (A-Z)</option>
                <option value="title_desc">Pēc Alfabēta (Z-A)</option>
                <option value="readingTime_asc">Lasīšanas laiks (Īsākais)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Import / Export / Add */}
            <div className="flex gap-2.5">
              <button
                onClick={handleExportJSON}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition"
                title="Eksportēt uz JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <label className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer" title="Importēt JSON failu">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              <button
                onClick={handleCreatePost}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Jauns Raksts
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Panel */}
        {selectedIds.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-yellow-500/90 font-bold">
              Atlasīti <span className="underline">{selectedIds.length}</span> raksti
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
                onClick={() => handleBulkStatusChange("Archived")}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] text-zinc-300 font-bold rounded-lg transition"
              >
                Arhivēt
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-[10px] text-red-400 font-bold rounded-lg transition"
              >
                Dzēst atlasītos
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

      {/* Main Table List */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-900 bg-zinc-950/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-400 font-mono font-bold uppercase tracking-wider">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={paginatedBlogs.length > 0 && paginatedBlogs.every((b) => selectedIds.includes(b.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...new Set([...selectedIds, ...paginatedBlogs.map((b) => b.id)])]);
                    } else {
                      setSelectedIds(selectedIds.filter((id) => !paginatedBlogs.some((b) => b.id === id)));
                    }
                  }}
                  className="rounded border-zinc-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 w-4 h-4"
                />
              </th>
              <th className="p-4">Attēls / Nosaukums</th>
              <th className="p-4">Kategorija</th>
              <th className="p-4">Autors / Laiks</th>
              <th className="p-4">Datums</th>
              <th className="p-4">Saistītais galamērķis</th>
              <th className="p-4">Statuss</th>
              <th className="p-4 text-right">Darbības</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-500" />
                  Ielādē rakstus...
                </td>
              </tr>
            ) : paginatedBlogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  Nav atrasts neviens raksts.
                </td>
              </tr>
            ) : (
              paginatedBlogs.map((post) => {
                const isChecked = selectedIds.includes(post.id);
                return (
                  <tr key={post.id} className="hover:bg-zinc-900/10 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedIds(selectedIds.filter((id) => id !== post.id));
                          } else {
                            setSelectedIds([...selectedIds, post.id]);
                          }
                        }}
                        className="rounded border-zinc-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 w-4 h-4"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {post.featuredImage ? (
                            <img src={post.featuredImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1 hover:text-yellow-500 transition cursor-pointer" onClick={() => {
                            setActivePost(post);
                            setIsEditorOpen(true);
                          }}>
                            {post.title}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono">/{post.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 font-medium">{post.category}</td>
                    <td className="p-4 font-mono text-[10px] text-zinc-500">
                      <div>{post.author}</div>
                      <div className="flex items-center gap-1 text-[9px] text-zinc-600">
                        <Clock className="w-3 h-3" />
                        {post.readingTime}
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400">{post.publishDate}</td>
                    <td className="p-4 font-medium text-zinc-400">
                      {destinations.find((d) => d.id === post.destinationId)?.name || (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono ${
                          post.status === "Published"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : post.status === "Draft"
                            ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                            : post.status === "Scheduled"
                            ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                            : "bg-zinc-800 border border-zinc-750 text-zinc-400"
                        }`}
                      >
                        {post.status === "Published" ? "Publicēts" : post.status === "Draft" ? "Melnraksts" : post.status === "Scheduled" ? "Plānots" : "Arhivēts"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewPost(post)}
                          className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                          title="Priekšskatīt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActivePost(post);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                          title="Labot"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicatePost(post)}
                          className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                          title="Dublēt"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 hover:bg-zinc-900 text-red-500 hover:text-red-400 rounded-lg transition"
                          title="Dzēst"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 px-2">
          <span>
            Rāda {(currentPage - 1) * itemsPerPage + 1} līdz {Math.min(currentPage * itemsPerPage, filtered.length)} no {filtered.length} rakstiem
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-850 disabled:opacity-45 transition"
            >
              Iepriekšējā
            </button>
            <span className="px-3 py-1 border border-zinc-800 bg-zinc-950/60 rounded-xl font-bold text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-850 disabled:opacity-45 transition"
            >
              Nākamā
            </button>
          </div>
        </div>
      )}

      {/* EDIT/CREATE DIALOG SLIDE OVER */}
      {isEditorOpen && activePost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-4xl bg-zinc-950 border-l border-zinc-900 h-full flex flex-col justify-between shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 sticky top-0 backdrop-blur z-10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-500" />
                  Raksta redaktors
                </span>
                <h3 className="text-sm font-bold text-white">{activePost.title || "Jauns raksts"}</h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition"
              >
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
                Galvenais Saturs
              </button>
              <button
                onClick={() => setEditorTab("seo")}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${
                  editorTab === "seo" ? "border-yellow-500 text-yellow-500" : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                SEO Parametri
              </button>
              <button
                onClick={() => setEditorTab("galerija")}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${
                  editorTab === "galerija" ? "border-yellow-500 text-yellow-500" : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Raksta Galerija ({activePost.gallery?.length || 0})
              </button>
            </div>

            {/* Content Field Areas */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {editorTab === "saturs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Virsraksts / Nosaukums</label>
                      <input
                        type="text"
                        value={activePost.title}
                        onChange={(e) => setActivePost({ ...activePost, title: e.target.value })}
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">URL Slug</label>
                      <input
                        type="text"
                        value={activePost.slug}
                        onChange={(e) => setActivePost({ ...activePost, slug: e.target.value })}
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 font-mono"
                      />
                    </div>

                    {/* Meta parameters Row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Category */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Kategorija</label>
                        <input
                          type="text"
                          value={activePost.category}
                          onChange={(e) => setActivePost({ ...activePost, category: e.target.value })}
                          className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                        />
                      </div>

                      {/* Author */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Autors</label>
                        <input
                          type="text"
                          value={activePost.author}
                          onChange={(e) => setActivePost({ ...activePost, author: e.target.value })}
                          className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Reading time */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lasīšanas ilgums (piem. 5 min)</label>
                        <input
                          type="text"
                          value={activePost.readingTime}
                          onChange={(e) => setActivePost({ ...activePost, readingTime: e.target.value })}
                          className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                        />
                      </div>

                      {/* Publish Date */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Publicēšanas datums</label>
                        <input
                          type="date"
                          value={activePost.publishDate}
                          onChange={(e) => setActivePost({ ...activePost, publishDate: e.target.value })}
                          className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Status & Scheduled Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Publikācijas statuss</label>
                        <select
                          value={activePost.status}
                          onChange={(e) => setActivePost({ ...activePost, status: e.target.value as BlogPost["status"] })}
                          className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-yellow-500 cursor-pointer"
                        >
                          <option value="Draft">Melnraksts (Draft)</option>
                          <option value="Published">Publicēts (Published)</option>
                          <option value="Scheduled">Plānots (Scheduled)</option>
                          <option value="Archived">Arhivēts (Archived)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Plānotais izpildes datums</label>
                        <input
                          type="datetime-local"
                          value={activePost.scheduledDate || ""}
                          disabled={activePost.status !== "Scheduled"}
                          onChange={(e) => setActivePost({ ...activePost, scheduledDate: e.target.value })}
                          className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 disabled:opacity-40"
                        />
                      </div>
                    </div>

                    {/* Relation to Destination */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Saistītais galamērķis (Apsaimniekošanas zona)</label>
                      <select
                        value={activePost.destinationId || ""}
                        onChange={(e) => setActivePost({ ...activePost, destinationId: e.target.value || undefined })}
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 focus:outline-none"
                      >
                        <option value="">Neviens galamērķis nav izvēlēts</option>
                        {destinations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rich Content & Featured Image block */}
                  <div className="space-y-4">
                    {/* Featured Image */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Galvenais baneris (Featured Image)</label>
                      <div className="aspect-video w-full bg-zinc-900 rounded-2xl border border-zinc-850 flex items-center justify-center relative overflow-hidden group">
                        {activePost.featuredImage ? (
                          <>
                            <img src={activePost.featuredImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2">
                              <button
                                onClick={() => setMediaPickerTarget({ type: "featured" })}
                                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 text-xs font-bold rounded-lg transition"
                              >
                                Nomainīt
                              </button>
                              <button
                                onClick={() => setActivePost({ ...activePost, featuredImage: "" })}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
                              >
                                Noņemt
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 text-zinc-600" />
                            <button
                              onClick={() => setMediaPickerTarget({ type: "featured" })}
                              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold rounded-xl transition"
                            >
                              Izvēlēties no Media Library
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Raksta tagi (atdalīti ar komatu)</label>
                      <input
                        type="text"
                        value={activePost.tags?.join(", ")}
                        onChange={(e) =>
                          setActivePost({
                            ...activePost,
                            tags: e.target.value.split(",").map((t) => t.trim()).filter((t) => t !== "")
                          })
                        }
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 font-medium"
                      />
                    </div>

                    {/* Content Editor Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Raksta saturs (HTML / Markdown atbalsts)</label>
                      <textarea
                        rows={10}
                        value={activePost.content}
                        onChange={(e) => setActivePost({ ...activePost, content: e.target.value })}
                        className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 resize-none font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editorTab === "seo" && (
                <div className="space-y-5 max-w-2xl">
                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SEO Title</label>
                    <input
                      type="text"
                      value={activePost.seoTitle || ""}
                      onChange={(e) => setActivePost({ ...activePost, seoTitle: e.target.value })}
                      placeholder={activePost.title}
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={activePost.seoDescription || ""}
                      onChange={(e) => setActivePost({ ...activePost, seoDescription: e.target.value })}
                      placeholder="Ievadiet kodolīgu aprakstu meklētājiem (līdz 160 rakstzīmēm)..."
                      className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 resize-none"
                    />
                  </div>

                  {/* OG Image */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">OG (Social sharing) Image</label>
                    <div className="aspect-[1.91/1] w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-850 flex items-center justify-center relative overflow-hidden group">
                      {activePost.ogImage ? (
                        <>
                          <img src={activePost.ogImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2">
                            <button
                              onClick={() => setMediaPickerTarget({ type: "og" })}
                              className="px-3 py-1.5 bg-yellow-500 text-zinc-950 text-xs font-bold rounded-lg transition"
                            >
                              Nomainīt
                            </button>
                            <button
                              onClick={() => setActivePost({ ...activePost, ogImage: "" })}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg transition"
                            >
                              Noņemt
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4">
                          <ImageIcon className="w-6 h-6 text-zinc-600" />
                          <button
                            onClick={() => setMediaPickerTarget({ type: "og" })}
                            className="px-3 py-1.5 bg-zinc-800 text-white text-[10px] font-bold rounded-xl transition"
                          >
                            Izvēlēties OG attēlu
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Preview */}
                  <div className="bg-zinc-900/40 p-4 rounded-2.5xl border border-zinc-850 space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Google meklēšanas priekšskatījums</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-blue-400 hover:underline cursor-pointer truncate font-medium">
                        {activePost.seoTitle || activePost.title}
                      </p>
                      <p className="text-[10px] text-emerald-500 truncate font-mono">
                        https://avenuegroup.lv/blogs/{activePost.slug}
                      </p>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {activePost.seoDescription || "Lūdzu, ievadiet meta aprakstu, lai redzētu vizuālo priekšskatījumu šeit."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {editorTab === "galerija" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Raksta attēlu galerija</h4>
                    <p className="text-[11px] text-zinc-500">Pievienojiet papildus attēlus šim rakstam, kurus var attēlot slīdrādē vai raksta apakšā.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {activePost.gallery?.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-zinc-900 rounded-2xl border border-zinc-850 relative overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition gap-1.5 p-2">
                          <button
                            onClick={() => setMediaPickerTarget({ type: "gallery", index: idx })}
                            className="w-full py-1 bg-yellow-500 text-zinc-950 text-[10px] font-bold rounded text-center transition"
                          >
                            Nomainīt
                          </button>
                          <button
                            onClick={() => {
                              const newGallery = activePost.gallery.filter((_, gIdx) => gIdx !== idx);
                              setActivePost({ ...activePost, gallery: newGallery });
                            }}
                            className="w-full py-1 bg-red-600 text-white text-[10px] font-bold rounded text-center transition"
                          >
                            Noņemt
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* New item trigger button */}
                    <button
                      onClick={() => setMediaPickerTarget({ type: "gallery" })}
                      className="aspect-square bg-zinc-950/40 border border-zinc-850 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-3 hover:bg-zinc-900/10 transition group"
                    >
                      <Plus className="w-5 h-5 text-zinc-600 group-hover:text-yellow-500 transition mb-1" />
                      <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-400">Pievienot</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 sticky bottom-0 backdrop-blur flex justify-end gap-3 z-10">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition"
              >
                Atcelt
              </button>
              <button
                onClick={handleSaveEditor}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition"
              >
                Saglabāt izmaiņas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REUSABLE MEDIA PICKER POPUP DIALOG */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Izvēlēties attēlu no mediju bibliotēkas</span>
              </div>
              <button
                onClick={() => setMediaPickerTarget(null)}
                className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <AdminMedia token={token} onSelect={handleMediaSelected} isPickerMode={true} />
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW POST DIALOG */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-3xl rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Raksta Priekšskatījums (Preview)</span>
              </div>
              <button
                onClick={() => setPreviewPost(null)}
                className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {previewPost.featuredImage && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-900">
                  <img src={previewPost.featuredImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded font-bold uppercase">{previewPost.category}</span>
                <span>•</span>
                <span>{previewPost.publishDate}</span>
                <span>•</span>
                <span>{previewPost.readingTime} lasīšanai</span>
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-snug">{previewPost.title}</h1>
              <p className="text-xs text-zinc-400 font-mono">Autors: {previewPost.author}</p>
              <div className="border-t border-zinc-900 pt-4 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {previewPost.content}
              </div>
              {previewPost.gallery && previewPost.gallery.length > 0 && (
                <div className="pt-4 border-t border-zinc-900 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Papildu attēli</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {previewPost.gallery.map((gImg, idx) => (
                      <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-zinc-900">
                        <img src={gImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
