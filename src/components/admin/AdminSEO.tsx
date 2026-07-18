import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Check,
  ChevronDown,
  RefreshCw,
  Info,
  Download,
  Upload,
  Undo2,
  Eye,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  X
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";

export interface GlobalSEO {
  metaTitle: string;
  metaDescription: string;
  analyticsId: string;
  ogImage: string;
  allowIndexing: boolean;
  sitemapIndex: boolean;
}

interface AdminSEOProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminSEO: React.FC<AdminSEOProps> = ({ token, showToast }) => {
  const [seo, setSeo] = useState<GlobalSEO | null>(null);
  const [loading, setLoading] = useState(true);

  // Media library picker
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Undo histories
  const [undoStack, setUndoStack] = useState<GlobalSEO[]>([]);

  useEffect(() => {
    fetchSEO();
  }, []);

  const fetchSEO = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/content-file/seo.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSeo(data.draft || data.original || getFallbackSEO());
      } else {
        setSeo(getFallbackSEO());
      }
    } catch (err) {
      console.error(err);
      setSeo(getFallbackSEO());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSEO = (): GlobalSEO => ({
    metaTitle: "Avenue Group | Komercīpašumu apsaimniekošana un pārvaldība",
    metaDescription: "Avenue Group - nekustamo īpašumu apsaimniekošanas un pārvaldības pakalpojumi komercīpašumiem, inženiertīklu uzturēšanai un privātīpašumiem visā Latvijā.",
    analyticsId: "G-A1B2C3D4E5",
    ogImage: "/images/uploads/ka-pareiza-komercipasuma-apsaimniekosana-palielina-ta-vertibu.webp",
    allowIndexing: true,
    sitemapIndex: true
  });

  const pushUndo = (state: GlobalSEO) => {
    setUndoStack((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(state))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !seo) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((p) => p.slice(0, -1));
    setSeo(prev);
    saveSEOState(prev, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveSEOState = async (updated: GlobalSEO, isUndo = false) => {
    try {
      if (!isUndo && seo) {
        pushUndo(seo);
      }
      setSeo(updated);

      const res = await fetch("/api/cms/content-file/seo.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: updated
        })
      });

      if (!res.ok) throw new Error("Neizdevās saglabāt datus serverī");
      if (!isUndo) showToast("Globālie SEO uzstādījumi saglabāti melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Kļūda saglabājot serverī.", "error");
    }
  };

  const handleMediaSelected = (url: string) => {
    if (seo) {
      const updated = { ...seo, ogImage: url };
      saveSEOState(updated);
    }
    setIsMediaPickerOpen(false);
    showToast("Globālais sociālais attēls piesaistīts!", "success");
  };

  if (loading || !seo) {
    return (
      <div className="flex justify-center p-8 text-zinc-500">
        <RefreshCw className="w-6 h-6 animate-spin text-yellow-500 mr-2" />
        Lādē SEO datus...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      {/* Top summary header ribbon */}
      <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-zinc-900 rounded-2.5xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">Globālie meklētāju optimizācijas un indeksācijas parametri</span>
        </div>
        {undoStack.length > 0 && (
          <button
            onClick={handleUndo}
            className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Undo2 className="w-3.5 h-3.5" /> Atgriezt ({undoStack.length})
          </button>
        )}
      </div>

      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Meta Title */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Globālais Meta Title (Mājaslapas galvenais virsraksts)</label>
            <input
              type="text"
              value={seo.metaTitle}
              onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
              className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Globālais Meta Description (Mājaslapas apraksts meklētājos)</label>
            <textarea
              rows={4}
              value={seo.metaDescription}
              onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
              className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 resize-none leading-relaxed"
            />
          </div>

          {/* Analytics Measurement ID */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Google Analytics ID (piem. G-XXXXX)</label>
            <input
              type="text"
              value={seo.analyticsId}
              onChange={(e) => setSeo({ ...seo, analyticsId: e.target.value })}
              className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 font-mono"
            />
          </div>

          {/* Open Graph Image selected from media library */}
          <div className="space-y-2 col-span-2 border-t border-zinc-850/40 pt-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Globālais Social Sharing (Open Graph) attēls</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-14 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                {seo.ogImage ? (
                  <img src={seo.ogImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-700" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-850 text-xs font-bold text-zinc-300 rounded-xl hover:bg-zinc-800 transition"
                >
                  Izvēlēties no Media
                </button>
                {seo.ogImage && (
                  <button
                    onClick={() => setSeo({ ...seo, ogImage: "" })}
                    className="px-3.5 py-1.5 bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-bold rounded-xl hover:bg-red-900 transition"
                  >
                    Noņemt
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Advanced crawling switches */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-850/40 pt-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="chk-index"
                checked={seo.allowIndexing}
                onChange={(e) => setSeo({ ...seo, allowIndexing: e.target.checked })}
                className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer focus:ring-0 focus:ring-offset-0"
              />
              <div className="select-none">
                <label htmlFor="chk-index" className="text-xs font-bold text-white cursor-pointer">Atļaut Google indeksāciju (Robots.txt)</label>
                <p className="text-[10px] text-zinc-500">Iespējo meklēšanas dzinēju robotu piekļuvi un satura indeksāciju.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="chk-sitemap"
                checked={seo.sitemapIndex}
                onChange={(e) => setSeo({ ...seo, sitemapIndex: e.target.checked })}
                className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer focus:ring-0 focus:ring-offset-0"
              />
              <div className="select-none">
                <label htmlFor="chk-sitemap" className="text-xs font-bold text-white cursor-pointer">Automātiska Sitemap.xml ģenerācija</label>
                <p className="text-[10px] text-zinc-500">Automātiski ģenerē un uztur lapu sarakstu priekš sitemap.xml faila.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Live Search Engine preview simulation card */}
        <div className="bg-zinc-950/50 border border-zinc-850/80 rounded-2.5xl p-5 space-y-3.5">
          <h4 className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-yellow-500" /> Google search snippet simulation (Sākumlapas priekšskats)
          </h4>
          <div className="space-y-1 font-sans">
            <p className="text-sm text-[#8ab4f8] hover:underline cursor-pointer truncate font-medium">
              {seo.metaTitle || "Avenue Group"}
            </p>
            <p className="text-[11px] text-[#30e8a2] font-mono truncate">
              https://avenuegroup.lv
            </p>
            <p className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
              {seo.metaDescription || "Komercplatību inženiertīklu uzturēšana, tehniskā apsaimniekošana un juridiskais atbalsts..."}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-850/40">
          <button
            onClick={() => saveSEOState(seo)}
            className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition"
          >
            Saglabāt SEO parametrus
          </button>
        </div>
      </div>

      {/* REUSABLE MEDIA LIBRARY OVERLAY PICKER */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Izvēlēties sociālo sharing attēlu</span>
              <button onClick={() => setIsMediaPickerOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
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
