import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, FileText, Image as ImageIcon, Copy, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface AdminMediaProps {
  token: string;
}

interface MediaItem {
  name: string;
  url: string;
  type: "image" | "document";
  size: number;
  mtime: string;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({ token }) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/media", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMediaList(data);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  // Convert File to WebP client-side using Canvas, with robust fallback to direct Base64 reading
  const optimizeAndConvertToWebP = (file: File): Promise<{ base64: string; name: string }> => {
    return new Promise((resolve, reject) => {
      if (file.type === "application/pdf") {
        // PDF files are uploaded directly without conversion
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve({ base64, name: file.name });
        };
        reader.onerror = (err) => reject(err);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const fileDataUrl = event.target?.result as string;

        // Define fallback helper to read original file directly as Base64 if image rendering fails
        const fallbackRawBase64 = () => {
          try {
            const base64 = fileDataUrl.split(",")[1];
            // Normalize filename characters (remove Latvian diacritics, keep letters/numbers/dots/hyphens)
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const cleanName = originalNameWithoutExt
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]/g, "-") + "." + ext;

            resolve({ base64, name: cleanName });
          } catch (e) {
            reject(new Error("Failed to read raw file base64"));
          }
        };

        const img = new Image();
        img.src = fileDataUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              fallbackRawBase64();
              return;
            }

            // Responsive image scaling if extremely large
            const MAX_WIDTH = 1920;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Get optimized webp binary as base64 string
            const webpDataUrl = canvas.toDataURL("image/webp", 0.82); // 0.82 quality compression
            const base64 = webpDataUrl.split(",")[1];
            
            // Generate new WebP name with normalization
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const cleanName = originalNameWithoutExt
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]/g, "-") + ".webp";

            resolve({ base64, name: cleanName });
          } catch (canvasErr) {
            console.warn("Canvas conversion failed, falling back to original file:", canvasErr);
            fallbackRawBase64();
          }
        };
        img.onerror = (err) => {
          console.warn("Image load failed, falling back to original file:", err);
          fallbackRawBase64();
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setMessage(null);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(fileExt);
      const isPDF = file.type === "application/pdf" || fileExt === "pdf";

      if (!isImage && !isPDF) {
        failCount++;
        continue;
      }

      try {
        const { base64, name } = await optimizeAndConvertToWebP(file);
        const uploadRes = await fetch("/api/cms/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            data: base64,
            type: isPDF ? "pdf" : "image"
          })
        });

        if (uploadRes.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error("Failed to process file:", err);
        failCount++;
      }
    }

    if (successCount > 0) {
      await fetchMedia();
      setMessage({
        type: "success",
        text: `Veiksmīgi augšupielādēti ${successCount} faili!<sup>1</sup> ${
          failCount > 0 ? `Neizdevās augšupielādēt ${failCount} failus.` : ""
        }`
      });
    } else if (failCount > 0) {
      setMessage({
        type: "error",
        text: "Neizdevās augšupielādēt izvēlētos failus. Pārliecinieties, ka tie ir JPG, PNG vai PDF formātā."
      });
    }
    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Vai tiešām vēlaties neatgriezeniski dzēst failu "${item.name}"?`)) return;

    try {
      const res = await fetch(`/api/cms/media/${item.type}/${item.name}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Delete failed");

      setMediaList(mediaList.filter((m) => m.name !== item.name));
      setMessage({ type: "success", text: `Fails "${item.name}" veiksmīgi dzēsts.` });
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās izdzēst failu." });
    }
  };

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div id="admin-media-manager" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white font-sans">Mediju Bibliotēka</h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Augšupielādējiet un pārvaldiet attēlus (automātiski optimizētus un pārvērstus WebP) un PDF dokumentus.
          </p>
        </div>
        <button
          onClick={fetchMedia}
          disabled={loading}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-xl border border-zinc-700 transition duration-150 text-sm font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atjaunot Sarakstu
        </button>
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
          <span
            className="text-sm font-medium"
            dangerouslySetInnerHTML={{ __html: message.text }}
          />
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition duration-150 ${
          dragActive
            ? "border-yellow-500 bg-yellow-500/5 text-yellow-500"
            : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="bg-zinc-950/50 p-4 rounded-full border border-zinc-800 mb-4 text-yellow-500 shadow-inner">
          <Upload className="w-7 h-7" />
        </div>
        <p className="text-base font-bold text-zinc-100 font-sans">
          Ievelciet attēlus vai dokumentus šeit
        </p>
        <p className="text-xs text-zinc-500 mt-1.5 font-sans">
          vai noklikšķiniet, lai izvēlētos no datora (JPG, PNG tiks automātiski pārvērsti WebP)
        </p>
        {uploading && (
          <div className="absolute inset-0 bg-zinc-950/80 rounded-2xl flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-white">Augšupielādē un optimizē attēlus...</p>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Ielādē mediju failus...</p>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-500 text-sm">
          Nav atrasts neviens augšupielādēts mediju fails.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.name}
              className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col transition duration-150"
            >
              {/* Media Thumbnail Container */}
              <div className="aspect-square w-full bg-zinc-950 flex items-center justify-center relative overflow-hidden border-b border-zinc-800/80">
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-red-500">
                    <FileText className="w-10 h-10 stroke-1" />
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-red-950/50 border border-red-900/40 px-2 py-0.5 rounded text-red-400">
                      PDF
                    </span>
                  </div>
                )}
                {/* Hover Quick Toolbar */}
                <div className="absolute inset-0 bg-zinc-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-150">
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-lg text-zinc-300 border border-zinc-700 transition"
                    title="Kopēt saiti uz failu"
                  >
                    <Copy className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2.5 bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-red-300 rounded-lg border border-red-900/60 transition"
                    title="Dzēst failu"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <p className="text-xs font-bold text-zinc-200 break-all line-clamp-1 group-hover:text-yellow-500 transition font-sans">
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{formatSize(item.size)}</span>
                  {copiedPath === item.url ? (
                    <span className="text-emerald-500 font-bold">Kopēts!</span>
                  ) : (
                    <span>{new Date(item.mtime).toLocaleDateString("lv-LV")}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
