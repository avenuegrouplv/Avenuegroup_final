import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Globe,
  Eye,
  EyeOff,
  Search,
  Filter,
  Check,
  ChevronDown,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Layout,
  RefreshCw,
  FolderMinus,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Settings
} from "lucide-react";
import { AdminPageBuilder } from "./AdminPageBuilder";

interface PageData {
  slug: string;
  title: string;
  content?: string;
  status?: "draft" | "published" | "hidden" | "archived";
  order?: number;
  blocks?: any[];
}

interface AdminPagesProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminPages: React.FC<AdminPagesProps> = ({ token, showToast }) => {
  // States
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Builder integration
  const [activeEditingPage, setActiveEditingPage] = useState<PageData | null>(null);

  // Preview interactive modal state
  const [previewPage, setPreviewPage] = useState<PageData | null>(null);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Inline Quick Editors
  const [inlineEditingSlug, setInlineEditingSlug] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSlug, setEditedSlug] = useState("");
  const [editedOrder, setEditedOrder] = useState(0);

  // Load pages on mount
  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/content-file/pages.json", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Neizdevās ielādēt lapas");
      
      const data = await res.json();
      
      // Original pages.json fallback
      const originalPages = data.draft?.pages || data.original?.pages || [];
      
      // Inject fallback status & order if they don't exist
      const mappedPages = originalPages.map((p: any, index: number) => ({
        ...p,
        status: p.status || "published",
        order: p.order || index + 1,
        blocks: p.blocks || []
      }));

      // Sort by order
      mappedPages.sort((a: PageData, b: PageData) => (a.order || 0) - (b.order || 0));
      setPages(mappedPages);
    } catch (err: any) {
      console.error(err);
      showToast("Kļūda ielādējot lapas. Izmanto rezerves datus.", "error");
      
      // Offline fallback state to keep app alive
      const fallback: PageData[] = [
        { slug: "sakumlapa", title: "Sākumlapa", status: "published", order: 1, blocks: [] },
        { slug: "par-mums", title: "Par Mums", status: "published", order: 2, blocks: [] },
        { slug: "pakalpojumi", title: "Pakalpojumi", status: "published", order: 3, blocks: [] },
        { slug: "galerijas", title: "Galerijas", status: "published", order: 4, blocks: [] }
      ];
      setPages(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Save changes back to pages.json
  const savePagesState = async (updatedPages: PageData[]) => {
    try {
      // Sort before saving
      const sorted = [...updatedPages].sort((a, b) => (a.order || 0) - (b.order || 0));
      setPages(sorted);

      const res = await fetch("/api/cms/content-file/pages.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            pages: sorted
          }
        })
      });

      if (!res.ok) throw new Error("Neizdevās saglabāt izmaiņas serverī");
      showToast("Lapas stāvoklis saglabāts melnrakstā", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Neizdevās saglabāt izmaiņas mākoņserverī.", "error");
    }
  };

  // --- Actions ---

  // 1. Create page
  const handleCreatePage = () => {
    const title = window.prompt("Ievadiet jaunas lapas nosaukumu:");
    if (!title) return;

    // Slugify
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[ā]/g, "a")
      .replace(/[ē]/g, "e")
      .replace(/[ī]/g, "i")
      .replace(/[ōū]/g, "u")
      .replace(/[š]/g, "s")
      .replace(/[ģ]/g, "g")
      .replace(/[ķ]/g, "k")
      .replace(/[ļ]/g, "l")
      .replace(/[ž]/g, "z")
      .replace(/[č]/g, "c")
      .replace(/[ņ]/g, "n")
      .replace(/[^a-z0-9\-]/g, "-")
      .replace(/-+/g, "-");

    if (pages.some(p => p.slug === slug)) {
      showToast("Lapa ar šādu URL jau eksistē!", "error");
      return;
    }

    const newPage: PageData = {
      title,
      slug: slug || `lapa-${Date.now()}`,
      status: "draft",
      order: pages.length + 1,
      blocks: [
        {
          id: `b_${Date.now()}`,
          type: "hero",
          name: "Sākuma Baneris",
          settings: {
            title: `Laipni lūdzam lapā ${title}`,
            subtitle: "Izveidojiet profesionālu saturu ar vizuālo Page Builder.",
            buttonText: "Sazināties",
            buttonLink: "/kontakti"
          }
        }
      ]
    };

    const nextPages = [...pages, newPage];
    savePagesState(nextPages);
    showToast(`Lapa "${title}" sekmīgi izveidota!`, "success");
  };

  // 2. Duplicate page
  const handleDuplicatePage = (pageToDuplicate: PageData) => {
    const duplicated: PageData = {
      ...JSON.parse(JSON.stringify(pageToDuplicate)),
      title: `${pageToDuplicate.title} (Kopija)`,
      slug: `${pageToDuplicate.slug}-kopija-${Date.now().toString(36).substr(0, 3)}`,
      status: "draft",
      order: pages.length + 1
    };

    const nextPages = [...pages, duplicated];
    savePagesState(nextPages);
    showToast(`Lapa "${pageToDuplicate.title}" veiksmīgi nokopēta!`, "success");
  };

  // 3. Delete page
  const handleDeletePage = (slug: string) => {
    if (slug === "sakumlapa" || slug === "index") {
      showToast("Sākumlapu nevar izdzēst!", "error");
      return;
    }

    if (!window.confirm("Vai tiešām vēlaties neatgriezeniski dzēst šo lapu?")) return;

    const nextPages = pages.filter(p => p.slug !== slug);
    // Recalculate order
    const reordered = nextPages.map((p, idx) => ({ ...p, order: idx + 1 }));
    savePagesState(reordered);
    showToast("Lapa sekmīgi dzēsta", "success");
  };

  // 4. Quick edit save
  const handleSaveInlineEdit = (slug: string) => {
    if (!editedTitle.trim()) {
      showToast("Nosaukums nedrīkst būt tukšs!", "error");
      return;
    }

    const nextPages = pages.map(p => {
      if (p.slug === slug) {
        return {
          ...p,
          title: editedTitle,
          slug: editedSlug || p.slug,
          order: Number(editedOrder) || p.order
        };
      }
      return p;
    });

    savePagesState(nextPages);
    setInlineEditingSlug(null);
    showToast("Lapas pamatdati veiksmīgi atjaunināti!", "success");
  };

  // 5. Change order manually
  const handleMovePageOrder = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === pages.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...pages];

    // Swap order values
    const tempOrder = updated[index].order || index + 1;
    updated[index].order = updated[targetIdx].order || targetIdx + 1;
    updated[targetIdx].order = tempOrder;

    savePagesState(updated);
  };

  // 6. Update Status Directly
  const handleQuickStatusChange = (slug: string, newStatus: PageData["status"]) => {
    const nextPages = pages.map(p => {
      if (p.slug === slug) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    savePagesState(nextPages);
    showToast(`Lapas statuss nomainīts uz: ${newStatus}`, "info");
  };

  // --- Filtering & Search ---
  const filteredPages = pages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* --- HEADER CONTROLS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-500" />
            Vizuālo Lapu Pārvaldība (Pages)
          </h2>
          <p className="text-xs text-zinc-500">
            Izveidojiet, kārtojiet un vizuāli rediģējiet mājaslapas sadaļas ar Elementor tipa rīku.
          </p>
        </div>
        
        <button
          onClick={handleCreatePage}
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-black text-xs rounded-xl transition cursor-pointer self-start sm:self-center shadow-lg shadow-yellow-500/10"
        >
          <Plus className="w-4 h-4" />
          Izveidot Jaunu Lapu
        </button>
      </div>

      {/* --- FILTERS & SEARCH ROW --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-2xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Meklēt lapas pēc nosaukuma..."
            className="w-full bg-zinc-950/60 border border-zinc-850 pl-9 pr-4 py-2 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5 font-mono">
            <Filter className="w-3.5 h-3.5" /> Filtrēt:
          </span>
          {[
            { key: "all", label: "Visas" },
            { key: "published", label: "Published" },
            { key: "draft", label: "Draft" },
            { key: "hidden", label: "Hidden" },
            { key: "archived", label: "Archived" }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === f.key
                  ? "bg-yellow-500 text-zinc-950"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- PAGES GRID --- */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Ielādē vietnes lapu struktūru...</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-850 bg-zinc-900/10 rounded-2xl text-center space-y-2">
          <p className="text-xs font-bold text-zinc-400">Netika atrasta neviena lapa</p>
          <p className="text-[10px] text-zinc-600 max-w-sm mx-auto">Izveidojiet jaunu lapu vai atiestatiet meklēšanas filtrus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPages.map((pageItem, index) => {
            const isInlineEditing = inlineEditingSlug === pageItem.slug;

            return (
              <div
                key={pageItem.slug}
                className="bg-zinc-900/40 border border-zinc-850/80 rounded-2.5xl p-5 space-y-4 hover:border-zinc-700/60 transition group relative overflow-hidden"
              >
                {/* Visual Accent Badge */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500/20" />

                <div className="flex items-start justify-between">
                  <div className="space-y-1 pl-1">
                    {isInlineEditing ? (
                      <div className="space-y-2 max-w-xs">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                          placeholder="Lapas virsraksts"
                        />
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                          <span>URL: /</span>
                          <input
                            type="text"
                            value={editedSlug}
                            onChange={(e) => setEditedSlug(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                          <span>Secība:</span>
                          <input
                            type="number"
                            value={editedOrder}
                            onChange={(e) => setEditedOrder(parseInt(e.target.value))}
                            className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white w-16"
                          />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveInlineEdit(pageItem.slug)}
                            className="px-2 py-1 bg-yellow-500 text-zinc-950 font-bold text-[10px] rounded"
                          >
                            Saglabāt
                          </button>
                          <button
                            onClick={() => setInlineEditingSlug(null)}
                            className="px-2 py-1 bg-zinc-800 text-zinc-400 font-bold text-[10px] rounded"
                          >
                            Atcelt
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          {pageItem.title}
                          <span className="text-[10px] text-zinc-500 font-mono font-normal">#{pageItem.order}</span>
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-500 truncate max-w-xs">
                          URL: <span className="text-yellow-500/80">/{pageItem.slug}</span>
                        </p>
                      </>
                    )}
                    
                    <p className="text-[10px] text-zinc-500 mt-2">
                      Sastāv no: <span className="text-zinc-300 font-bold font-mono">{pageItem.blocks?.length || 0} dizaina blokiem</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider border ${
                      pageItem.status === "published"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : pageItem.status === "draft"
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                        : pageItem.status === "hidden"
                        ? "bg-zinc-800 border-zinc-700 text-zinc-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {pageItem.status || "draft"}
                    </span>
                  </div>
                </div>

                {/* Bottom interactive action menu */}
                <div className="pt-4 border-t border-zinc-850/60 flex items-center justify-between gap-2 text-xs">
                  
                  {/* Status quick switcher dropdown */}
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850 text-[10px]">
                    {["draft", "published", "hidden", "archived"].map(st => (
                      <button
                        key={st}
                        onClick={() => handleQuickStatusChange(pageItem.slug, st as any)}
                        className={`px-2 py-0.5 rounded capitalize font-bold transition ${
                          pageItem.status === st ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setInlineEditingSlug(pageItem.slug);
                        setEditedTitle(pageItem.title);
                        setEditedSlug(pageItem.slug);
                        setEditedOrder(pageItem.order || 0);
                      }}
                      className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition"
                      title="Labot nosaukumu un URL"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicatePage(pageItem)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition"
                      title="Dublēt lapu"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setPreviewPage(pageItem)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition"
                      title="Priekšskatījums"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setActiveEditingPage(pageItem)}
                      className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-black text-[11px] rounded-xl transition active:scale-95 flex items-center gap-1 shadow-md shadow-yellow-500/5"
                    >
                      <Layout className="w-3.5 h-3.5" />
                      Vizuālais Builder
                    </button>

                    <button
                      onClick={() => handleDeletePage(pageItem.slug)}
                      className="p-2 bg-zinc-950 hover:bg-red-950/40 border border-zinc-850 hover:border-red-900/30 text-zinc-600 hover:text-red-400 rounded-xl transition"
                      title="Dzēst lapu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- FULLSCREEN INTEGRATED PAGE BUILDER TRANSITION --- */}
      {activeEditingPage && (
        <AdminPageBuilder
          token={token}
          page={activeEditingPage}
          onSave={async (updatedBlocks) => {
            // Update blocks for the currently editing page
            const updatedList = pages.map(p => {
              if (p.slug === activeEditingPage.slug) {
                return { ...p, blocks: updatedBlocks };
              }
              return p;
            });
            await savePagesState(updatedList);
          }}
          onClose={() => {
            setActiveEditingPage(null);
            fetchPages();
          }}
        />
      )}

      {/* --- PREVIEW VIEWPORT DEVICE MODAL --- */}
      {previewPage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col font-sans text-zinc-200">
          <header className="h-16 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-widest font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded uppercase">
                Preview Mode
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <h1 className="text-sm font-bold text-white">Lapas "{previewPage.title}" Priekšskatījums</h1>
            </div>

            {/* Viewport resizing handles */}
            <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-2xl gap-1">
              <button
                onClick={() => setPreviewViewport("desktop")}
                className={`p-2 rounded-xl transition ${
                  previewViewport === "desktop" ? "bg-zinc-800 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewViewport("tablet")}
                className={`p-2 rounded-xl transition ${
                  previewViewport === "tablet" ? "bg-zinc-800 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewViewport("mobile")}
                className={`p-2 rounded-xl transition ${
                  previewViewport === "mobile" ? "bg-zinc-800 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setPreviewPage(null)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-bold transition"
            >
              Aizvērt
            </button>
          </header>

          {/* Interactive display area */}
          <div className="flex-1 bg-zinc-950/80 overflow-y-auto p-8 flex justify-center items-start">
            <div
              className="bg-[#0c0c0e] border border-zinc-900 min-h-[500px] transition-all duration-300 shadow-2xl rounded-2xl p-6"
              style={{
                width: previewViewport === "desktop" ? "100%" : previewViewport === "tablet" ? "768px" : "390px"
              }}
            >
              {previewPage.blocks && previewPage.blocks.length > 0 ? (
                <div className="space-y-8">
                  {previewPage.blocks.map((block: any, idx: number) => {
                    const isHiddenOnCurrent = 
                      (previewViewport === "desktop" && block.showOnDesktop === false) ||
                      (previewViewport === "tablet" && block.showOnTablet === false) ||
                      (previewViewport === "mobile" && block.showOnMobile === false);

                    if (isHiddenOnCurrent) return null;

                    return (
                      <div key={idx} className="space-y-4">
                        {block.type === "hero" && (
                          <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-zinc-850 p-6">
                            <h2 className="text-3xl font-black text-white">{block.settings?.title}</h2>
                            <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">{block.settings?.subtitle}</p>
                            {block.settings?.buttonText && (
                              <button className="px-5 py-2.5 bg-yellow-500 text-zinc-950 font-bold text-xs rounded-xl mt-6">{block.settings?.buttonText}</button>
                            )}
                          </div>
                        )}

                        {block.type === "text" && (
                          <div className="text-zinc-300 text-xs leading-relaxed prose prose-invert" dangerouslySetInnerHTML={{ __html: block.settings?.content || "" }} />
                        )}

                        {block.type === "image" && (
                          <div className="flex flex-col items-center">
                            {block.settings?.imageUrl && (
                              <img src={block.settings.imageUrl} className="max-h-96 w-auto rounded-xl object-cover" />
                            )}
                            {block.settings?.caption && <p className="text-[10px] text-zinc-500 mt-2 italic">{block.settings.caption}</p>}
                          </div>
                        )}

                        {block.type === "gallery" && (
                          <div className="grid grid-cols-3 gap-3">
                            {block.settings?.images?.map((g: any, i: number) => (
                              <img key={i} src={g.image} className="w-full h-24 object-cover rounded-lg" />
                            ))}
                          </div>
                        )}

                        {block.type === "faq" && (
                          <div className="space-y-2">
                            {block.settings?.items?.map((item: any, i: number) => (
                              <div key={i} className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl text-xs">
                                <h4 className="font-bold text-white">{item.q}</h4>
                                <p className="text-zinc-400 mt-1">{item.a}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center text-zinc-500 text-xs italic">
                  Šai lapai vēl nav izveidots neviens dizaina bloks. Atveriet Vizuālo Builder, lai sāktu veidošanu!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
