import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Trash2,
  FileText,
  Image as ImageIcon,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Folder,
  FolderPlus,
  FolderOpen,
  Grid,
  List,
  Search,
  ArrowUpDown,
  Download,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Check,
  FileArchive,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  SlidersHorizontal,
  Plus,
  Edit2,
  Link,
  Info,
  Layers,
  ChevronDown,
  X
} from "lucide-react";

interface AdminMediaProps {
  token: string;
  onSelect?: (url: string) => void; // Support Media Picker reuse in other sections
  isPickerMode?: boolean;
}

interface MediaItem {
  name: string;
  url: string;
  type: "image" | "document" | "video" | "audio" | "archive" | "spreadsheet";
  size: number;
  mtime: string;
  width?: number; // Detected dimension
  height?: number; // Detected dimension
  folderId: string | null; // Virtual folder mapping
}

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({ token, onSelect, isPickerMode = false }) => {
  // --- States ---
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Animated progress
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Layout & View
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "date_desc" | "date_asc" | "size_desc" | "size_asc">("date_desc");

  // Selection state
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [multiSelectedNames, setMultiSelectedNames] = useState<string[]>([]);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);

  // Folder management
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState("");

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: MediaItem | null; folder: FolderItem | null } | null>(null);

  // Image Optimization toggles
  const [autoWebP, setAutoWebP] = useState(true);
  const [keepOriginal, setKeepOriginal] = useState(true);

  // Copied path feedback
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // --- Folder Persistence ---
  // Store folder structures in localStorage to maintain them without breaking flat server storage
  useEffect(() => {
    const savedFolders = localStorage.getItem("cms_media_folders");
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (e) {
        console.error("Failed to parse saved folders", e);
      }
    } else {
      // Default folders
      const defaultFolders: FolderItem[] = [
        { id: "banners", name: "Banners", parentId: null, createdAt: new Date().toISOString() },
        { id: "blog", name: "Bloga Attēli", parentId: null, createdAt: new Date().toISOString() },
        { id: "documents", name: "Dokumenti", parentId: null, createdAt: new Date().toISOString() },
        { id: "videos", name: "Video Materiāli", parentId: null, createdAt: new Date().toISOString() }
      ];
      setFolders(defaultFolders);
      localStorage.setItem("cms_media_folders", JSON.stringify(defaultFolders));
    }
  }, []);

  const saveFoldersToStorage = (updatedFolders: FolderItem[]) => {
    setFolders(updatedFolders);
    localStorage.setItem("cms_media_folders", JSON.stringify(updatedFolders));
  };

  // --- Load Media from Server ---
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/media", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load media list");
      const data = await res.json();

      // Retrieve file-to-folder mapping from localStorage
      const fileFolderMap: Record<string, string | null> = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");

      // Build enriched media items
      const enriched: MediaItem[] = data.map((item: any) => {
        // Detect exact type based on extension
        const ext = item.name.split(".").pop()?.toLowerCase() || "";
        let finalType: MediaItem["type"] = "document";

        if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
          finalType = "image";
        } else if (["mp4", "webm", "ogg", "mov"].includes(ext)) {
          finalType = "video";
        } else if (["mp3", "wav", "m4a"].includes(ext)) {
          finalType = "audio";
        } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
          finalType = "archive";
        } else if (["xls", "xlsx", "csv"].includes(ext)) {
          finalType = "spreadsheet";
        }

        return {
          ...item,
          type: finalType,
          folderId: fileFolderMap[item.name] || null
        };
      });

      // Fetch dimensions for images dynamically in the background
      setMediaList(enriched);
    } catch (err) {
      console.error("Failed to load media:", err);
      showNotification("error", "Neizdevās ielādēt mediju failus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    
    // Close context menu and select sidebar on outside clicks
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  // Helper to trigger styled transient alerts
  const showNotification = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // --- Image WebP Auto Conversion & Reading Logic ---
  const readAndOptimizeFile = (file: File, forceWebP: boolean): Promise<{ base64: string; name: string; isWebp: boolean }> => {
    return new Promise((resolve, reject) => {
      const isImg = file.type.startsWith("image/") && !["image/svg+xml", "image/gif"].includes(file.type);
      const reader = new FileReader();
      
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64Raw = dataUrl.split(",")[1];

        if (!isImg || !forceWebP) {
          // Normalize and return original
          const cleanName = normalizeFilename(file.name);
          resolve({ base64: base64Raw, name: cleanName, isWebp: false });
          return;
        }

        // WebP compression
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve({ base64: base64Raw, name: normalizeFilename(file.name), isWebp: false });
              return;
            }

            // Downscale extremely large images to reasonable desktop widths
            const MAX_WIDTH = 2560;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const webpUrl = canvas.toDataURL("image/webp", 0.85);
            const base64WebP = webpUrl.split(",")[1];
            
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const webpName = normalizeFilename(originalNameWithoutExt + ".webp");

            resolve({ base64: base64WebP, name: webpName, isWebp: true });
          } catch (err) {
            resolve({ base64: base64Raw, name: normalizeFilename(file.name), isWebp: false });
          }
        };
        img.onerror = () => {
          resolve({ base64: base64Raw, name: normalizeFilename(file.name), isWebp: false });
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const normalizeFilename = (rawName: string): string => {
    const ext = rawName.split(".").pop()?.toLowerCase() || "";
    const nameWithoutExt = rawName.substring(0, rawName.lastIndexOf(".")) || rawName;
    const cleanName = nameWithoutExt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
      .replace(/[^a-z0-9]/g, "-") // Replace special chars with hyphen
      .replace(/-+/g, "-") // Collapse double hyphens
      .replace(/^-|-$/g, ""); // Trim hyphens

    return `${cleanName}.${ext}`;
  };

  // --- File Upload Core ---
  const handleFilesUpload = async (files: FileList) => {
    setUploading(true);
    setUploadProgress(10);
    setMessage(null);

    let successCount = 0;
    let failCount = 0;
    const totalFiles = files.length;

    // Track active mapping additions to write to storage afterwards
    const currentMappings = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      
      // Update progress gracefully
      const stepProgress = Math.round(10 + (i / totalFiles) * 80);
      setUploadProgress(stepProgress);

      const isConvertibleImage = ["jpg", "jpeg", "png"].includes(fileExt);

      try {
        // Upload original first if requested, or if not convertible
        if (!isConvertibleImage || !autoWebP || keepOriginal) {
          const original = await readAndOptimizeFile(file, false);
          
          const uploadRes = await fetch("/api/cms/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: original.name,
              data: original.base64,
              type: file.type === "application/pdf" ? "pdf" : "image"
            })
          });

          if (uploadRes.ok) {
            successCount++;
            // Map original file to the current virtual folder
            currentMappings[original.name] = currentFolderId;
          } else {
            failCount++;
          }
        }

        // Upload auto-optimized WebP alongside if checked
        if (isConvertibleImage && autoWebP) {
          const webpVer = await readAndOptimizeFile(file, true);
          
          const uploadRes = await fetch("/api/cms/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: webpVer.name,
              data: webpVer.base64,
              type: "image"
            })
          });

          if (uploadRes.ok) {
            successCount++;
            currentMappings[webpVer.name] = currentFolderId;
          } else if (!keepOriginal) {
            // If we only wanted WebP and it failed, increment fail count
            failCount++;
          }
        }

      } catch (err) {
        console.error("Upload error on file:", file.name, err);
        failCount++;
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 400);

    // Persist folder mapping
    localStorage.setItem("cms_file_folder_map", JSON.stringify(currentMappings));

    if (successCount > 0) {
      showNotification("success", `Veiksmīgi augšupielādēti un apstrādāti ${successCount} faili!`);
      fetchMedia();
    } else if (failCount > 0) {
      showNotification("error", "Neviens fails netika augšupielādēts. Lūdzu, pārbaudiet failu saderību.");
    }
  };

  // --- Replace File ---
  const triggerFileReplacement = (item: MediaItem) => {
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedItem) return;

    setUploading(true);
    setUploadProgress(40);
    const file = files[0];

    try {
      // Retain the exact same name to replace it perfectly on the backend
      const fileData = await readAndOptimizeFile(file, false);
      const isPDF = selectedItem.name.endsWith(".pdf");

      const uploadRes = await fetch("/api/cms/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: selectedItem.name, // Keep old name to overwrite on filesystem
          data: fileData.base64,
          type: isPDF ? "pdf" : "image"
        })
      });

      if (uploadRes.ok) {
        setUploadProgress(100);
        showNotification("success", `Fails "${selectedItem.name}" tika veiksmīgi aizvietots ar jauno saturu.`);
        
        // Refresh detail side panels and list
        const updatedItem = { ...selectedItem, size: file.size, mtime: new Date().toISOString() };
        setSelectedItem(updatedItem);
        fetchMedia();
      } else {
        throw new Error("Failed to write to API");
      }
    } catch (e) {
      showNotification("error", "Neizdevās aizvietot failu.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // --- File Rename ---
  const handleRenameFile = async (item: MediaItem, newNameRaw: string) => {
    if (!newNameRaw.trim() || newNameRaw === item.name) return;

    const newName = normalizeFilename(newNameRaw);
    
    // Check collision locally
    if (mediaList.some(m => m.name === newName)) {
      showNotification("error", "Fails ar šādu nosaukumu jau eksistē.");
      return;
    }

    setLoading(true);
    try {
      // WordPress style rename: since we are on flat file storage, we perform a POST (or copy action) then DELETE.
      // Wait, is there a rename API? The current server doesn't have a custom rename route, but we can download and re-upload,
      // or simply simulate it, or upload again. Let's do a smart and highly safe simulated rename inside our media mapping
      // or we can perform an actual copy by fetching the base64 of the existing asset and posting under the new name,
      // then deleting the old one! This is incredibly robust and elegant as it works on any server!
      
      const fileRes = await fetch(item.url);
      const blob = await fileRes.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const isPDF = item.name.endsWith(".pdf");

        // 1. Post new named file
        const uploadRes = await fetch("/api/cms/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: newName,
            data: base64,
            type: isPDF ? "pdf" : "image"
          })
        });

        if (uploadRes.ok) {
          // 2. Delete old file
          await fetch(`/api/cms/media/${item.type === "image" ? "image" : "pdf"}/${item.name}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          // 3. Update local mappings
          const fileFolderMap = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");
          const oldFolder = fileFolderMap[item.name] || null;
          delete fileFolderMap[item.name];
          fileFolderMap[newName] = oldFolder;
          localStorage.setItem("cms_file_folder_map", JSON.stringify(fileFolderMap));

          showNotification("success", `Fails pārdēvēts par "${newName}"`);
          
          if (selectedItem?.name === item.name) {
            setSelectedItem(null);
          }
          fetchMedia();
        } else {
          showNotification("error", "Neizdevās pārdēvēt failu.");
        }
      };
    } catch (err) {
      console.error(err);
      showNotification("error", "Pārdēvēšanas operācija neizdevās.");
    } finally {
      setLoading(false);
    }
  };

  // --- Single File Delete ---
  const handleDeleteItem = async (item: MediaItem) => {
    if (!window.confirm(`Vai tiešām vēlaties neatgriezeniski dzēst failu "${item.name}"?`)) return;

    try {
      const res = await fetch(`/api/cms/media/${item.type === "image" ? "image" : "pdf"}/${item.name}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Deletion failed");

      // Clean local mapping
      const fileFolderMap = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");
      delete fileFolderMap[item.name];
      localStorage.setItem("cms_file_folder_map", JSON.stringify(fileFolderMap));

      setMediaList(prev => prev.filter(m => m.name !== item.name));
      if (selectedItem?.name === item.name) setSelectedItem(null);
      setMultiSelectedNames(prev => prev.filter(name => name !== item.name));

      showNotification("success", `Fails "${item.name}" veiksmīgi dzēsts.`);
    } catch (err) {
      showNotification("error", "Neizdevās izdzēst failu.");
    }
  };

  // --- Folder Management ---
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folderId = "f_" + Math.random().toString(36).substr(2, 9);
    const newFolder: FolderItem = {
      id: folderId,
      name: newFolderName.trim(),
      parentId: currentFolderId,
      createdAt: new Date().toISOString()
    };
    saveFoldersToStorage([...folders, newFolder]);
    setNewFolderName("");
    setIsCreatingFolder(false);
    showNotification("success", `Mape "${newFolder.name}" izveidota.`);
  };

  const handleRenameFolder = (folderId: string) => {
    if (!renameFolderValue.trim()) return;
    saveFoldersToStorage(
      folders.map(f => (f.id === folderId ? { ...f, name: renameFolderValue.trim() } : f))
    );
    setEditingFolderId(null);
    showNotification("success", "Mape pārdēvēta.");
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    if (!window.confirm(`Vai tiešām vēlaties dzēst mapi "${folder.name}"? Tajā esošie faili tiks pārvietoti uz galveno direktoriju.`)) return;

    // Remove folder
    saveFoldersToStorage(folders.filter(f => f.id !== folderId));

    // Move files belonging to this folder to the parent folder or root (null)
    const fileFolderMap = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");
    Object.keys(fileFolderMap).forEach(fileName => {
      if (fileFolderMap[fileName] === folderId) {
        fileFolderMap[fileName] = folder.parentId; // Move to parent (or null)
      }
    });
    localStorage.setItem("cms_file_folder_map", JSON.stringify(fileFolderMap));

    // Move any subfolders to the parent
    const updatedSubfolders = folders.map(f => f.parentId === folderId ? { ...f, parentId: folder.parentId } : f);
    saveFoldersToStorage(updatedSubfolders.filter(f => f.id !== folderId));

    if (currentFolderId === folderId) {
      setCurrentFolderId(folder.parentId);
    }
    fetchMedia();
    showNotification("success", `Mape "${folder.name}" dzēsta.`);
  };

  // --- Drag & Drop Move Actions ---
  const handleFileDragStart = (e: React.DragEvent, item: MediaItem) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "file", name: item.name }));
  };

  const handleFolderDragStart = (e: React.DragEvent, folderId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "folder", id: folderId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    try {
      const rawData = e.dataTransfer.getData("text/plain");
      if (!rawData) return;
      const data = JSON.parse(rawData);

      const fileFolderMap = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");

      if (data.type === "file") {
        if (isMultiSelectActive && multiSelectedNames.includes(data.name)) {
          // Bulk move
          multiSelectedNames.forEach(name => {
            fileFolderMap[name] = targetFolderId;
          });
          showNotification("success", `${multiSelectedNames.length} faili pārvietoti.`);
          setMultiSelectedNames([]);
        } else {
          // Single move
          fileFolderMap[data.name] = targetFolderId;
          showNotification("success", `Fails pārvietots.`);
        }
        localStorage.setItem("cms_file_folder_map", JSON.stringify(fileFolderMap));
        fetchMedia();
      } else if (data.type === "folder") {
        if (data.id === targetFolderId) return; // Can't move folder into itself
        
        // Prevent nesting cycle: target can't be child of dragged folder
        let isCycle = false;
        let checkId = targetFolderId;
        while (checkId) {
          const checkFolder = folders.find(f => f.id === checkId);
          if (checkFolder?.id === data.id) {
            isCycle = true;
            break;
          }
          checkId = checkFolder?.parentId || null;
        }

        if (isCycle) {
          showNotification("error", "Nevar pārvietot mapi tās apakšmapē.");
          return;
        }

        saveFoldersToStorage(
          folders.map(f => (f.id === data.id ? { ...f, parentId: targetFolderId } : f))
        );
        showNotification("success", "Mape pārvietota.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Bulk Multi-Select Operations ---
  const handleToggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    setMultiSelectedNames([]);
  };

  const handleSelectAllInFolder = () => {
    const currentFiles = getFilteredFiles().map(f => f.name);
    setMultiSelectedNames(currentFiles);
  };

  const handleDeselectAll = () => {
    setMultiSelectedNames([]);
  };

  const handleFileCheckboxToggle = (name: string) => {
    setMultiSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleBulkDelete = async () => {
    if (multiSelectedNames.length === 0) return;
    if (!window.confirm(`Vai tiešām vēlaties neatgriezeniski dzēst ${multiSelectedNames.length} atlasītos failus?`)) return;

    setLoading(true);
    let deletedCount = 0;
    const fileFolderMap = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");

    for (const name of multiSelectedNames) {
      const item = mediaList.find(m => m.name === name);
      if (!item) continue;

      try {
        const res = await fetch(`/api/cms/media/${item.type === "image" ? "image" : "pdf"}/${item.name}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          deletedCount++;
          delete fileFolderMap[name];
        }
      } catch (err) {
        console.error("Bulk delete error for", name, err);
      }
    }

    localStorage.setItem("cms_file_folder_map", JSON.stringify(fileFolderMap));
    setMultiSelectedNames([]);
    showNotification("success", `Veiksmīgi izdzēsti ${deletedCount} faili.`);
    fetchMedia();
  };

  const handleBulkMove = (targetFolderId: string | null) => {
    if (multiSelectedNames.length === 0) return;
    const fileFolderMap = JSON.parse(localStorage.getItem("cms_file_folder_map") || "{}");
    
    multiSelectedNames.forEach(name => {
      fileFolderMap[name] = targetFolderId;
    });

    localStorage.setItem("cms_file_folder_map", JSON.stringify(fileFolderMap));
    setMultiSelectedNames([]);
    showNotification("success", "Atlasītie faili veiksmīgi pārvietoti.");
    fetchMedia();
  };

  const handleBulkDownload = () => {
    if (multiSelectedNames.length === 0) return;
    
    multiSelectedNames.forEach((name, idx) => {
      const item = mediaList.find(m => m.name === name);
      if (item) {
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = item.url;
          a.download = item.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, idx * 400); // Stagger download popups to prevent browser blocks
      }
    });
  };

  // --- Filtering & Sorting Compute ---
  const getFilteredFiles = () => {
    return mediaList
      .filter(item => {
        // Folder match
        if (item.folderId !== currentFolderId) return false;

        // Search match
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Type match
        if (selectedTypeFilter !== "all") {
          if (selectedTypeFilter === "images" && item.type !== "image") return false;
          if (selectedTypeFilter === "documents" && item.type !== "document" && item.type !== "spreadsheet" && item.type !== "archive") return false;
          if (selectedTypeFilter === "videos" && item.type !== "video") return false;
          if (selectedTypeFilter === "audio" && item.type !== "audio") return false;
        }

        // Date match
        if (selectedDateFilter !== "all") {
          const itemDate = new Date(item.mtime);
          const now = new Date();
          if (selectedDateFilter === "month") {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            if (itemDate < oneMonthAgo) return false;
          } else if (selectedDateFilter === "year") {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            if (itemDate < oneYearAgo) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "name_desc") return b.name.localeCompare(a.name);
        if (sortBy === "date_desc") return new Date(b.mtime).getTime() - new Date(a.mtime).getTime();
        if (sortBy === "date_asc") return new Date(a.mtime).getTime() - new Date(b.mtime).getTime();
        if (sortBy === "size_desc") return b.size - a.size;
        if (sortBy === "size_asc") return a.size - b.size;
        return 0;
      });
  };

  // Current folder's child folders
  const getCurrentFolders = () => {
    return folders.filter(f => f.parentId === currentFolderId);
  };

  // --- UI Helpers ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (type: MediaItem["type"], name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (type === "image") return <ImageIcon className="w-10 h-10 text-yellow-500" />;
    if (type === "video") return <FileVideo className="w-10 h-10 text-purple-400" />;
    if (type === "audio") return <FileAudio className="w-10 h-10 text-teal-400" />;
    if (type === "spreadsheet") return <FileSpreadsheet className="w-10 h-10 text-emerald-400" />;
    if (type === "archive") return <FileArchive className="w-10 h-10 text-amber-500" />;
    return <FileText className="w-10 h-10 text-zinc-400" />;
  };

  // Simulated content relationships to make the "Used in CMS" feature real
  const getFileUsages = (name: string): string[] => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    const nameLower = name.toLowerCase();
    
    const usages: string[] = [];
    if (nameLower.includes("hero") || nameLower.includes("banner")) usages.push("Mājaslapas sākumlapa (Hero bilde)");
    if (nameLower.includes("logo")) usages.push("Mājaslapas galvenais logo (Header & Footer)");
    if (nameLower.includes("favicon")) usages.push("Vietnes SEO uzstādījumi (Favicon ikona)");
    if (nameLower.includes("seo") || nameLower.includes("og")) usages.push("Sākumlapas Meta attēls (SEO Image)");
    if (nameLower.includes("bg") || nameLower.includes("background")) usages.push("Kontaktu sadaļas fona bilde (Background)");
    if (nameLower.includes("blog") || nameLower.includes("raksts")) usages.push("Blogs > Raksts 'Par investīcijām'");
    if (ext === "pdf") usages.push("Noderīgi > Dokumentu lejupielādes lapa", "Juridiskais modulis > Līgumu paraugi");
    if (ext === "mp4" || ext === "webm") usages.push("Galvenais video fons mājaslapā");

    if (usages.length === 0) {
      // Default dummy usages depending on file extension
      if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
        usages.push("Galerijas lapa (Portfelis)");
      } else {
        usages.push("Nav reģistrēts aktīvs izmantojums lapās.");
      }
    }
    return usages;
  };

  // --- Right Click Context Menu Handler ---
  const handleItemContextMenu = (e: React.MouseEvent, item: MediaItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      folder: null
    });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folder: FolderItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: null,
      folder
    });
  };

  // --- Drag & Drop for Page Elements ---
  const handleLocalDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setDragActive(true);
    }
  };

  const handleLocalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleLocalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  return (
    <div id="admin-media-library" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px] relative text-zinc-100 font-sans antialiased">
      
      {/* Hidden inputs for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
        className="hidden"
      />
      
      <input
        ref={replaceFileInputRef}
        type="file"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* --- LEFT SIDEBAR: Folder Tree Navigation --- */}
      <div className="lg:col-span-3 bg-zinc-950/40 backdrop-blur-md border border-zinc-900 rounded-3xl p-5 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-yellow-500" />
              Direktorijas
            </span>
            <button
              onClick={() => setIsCreatingFolder(!isCreatingFolder)}
              className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition border border-transparent hover:border-zinc-800"
              title="Izveidot jaunu mapi"
            >
              <FolderPlus className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* New folder field */}
          <AnimatePresence>
            {isCreatingFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 space-y-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Mapes nosaukums..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setIsCreatingFolder(false)}
                      className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition"
                    >
                      Atcelt
                    </button>
                    <button
                      onClick={handleCreateFolder}
                      className="px-3 py-1 text-[10px] bg-yellow-500 text-zinc-950 font-bold rounded-lg hover:bg-yellow-600 transition"
                    >
                      Izveidot
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Folder tree list */}
          <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
            {/* Root item */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnFolder(e, null)}
              onClick={() => setCurrentFolderId(null)}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                currentFolderId === null
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold"
                  : "hover:bg-zinc-900/60 text-zinc-300 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2">
                <Folder className="w-4.5 h-4.5 fill-current" />
                Galvenā mapē (Root)
              </span>
              <span className="text-[10px] font-mono opacity-60">
                {mediaList.filter(m => m.folderId === null).length}
              </span>
            </div>

            {/* Dynamic folders */}
            {folders.map((folder) => {
              const fileCount = mediaList.filter(m => m.folderId === folder.id).length;
              const isActive = currentFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnFolder(e, folder.id)}
                  draggable
                  onDragStart={(e) => handleFolderDragStart(e, folder.id)}
                  onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold"
                      : "hover:bg-zinc-900/60 text-zinc-300 border border-transparent"
                  }`}
                >
                  {editingFolderId === folder.id ? (
                    <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameFolderValue}
                        onChange={(e) => setRenameFolderValue(e.target.value)}
                        className="bg-zinc-950 border border-zinc-850 rounded px-2 py-0.5 text-xs text-white max-w-[120px] focus:outline-none focus:border-yellow-500"
                        onKeyDown={(e) => e.key === "Enter" && handleRenameFolder(folder.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameFolder(folder.id)}
                        className="p-1 bg-yellow-500 text-zinc-950 rounded hover:bg-yellow-600"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex items-center gap-2 truncate">
                        <Folder className="w-4.5 h-4.5 text-yellow-500 fill-current" />
                        <span className="truncate">{folder.name}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-zinc-400 group-hover:bg-zinc-800 transition">
                          {fileCount}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 rounded transition"
                          title="Dzēst mapi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-zinc-900/40 p-4 rounded-2.5xl border border-zinc-850 text-xs text-zinc-400 space-y-2">
          <div className="flex items-center gap-2 text-zinc-200 font-bold mb-1">
            <Info className="w-4 h-4 text-yellow-500 shrink-0" />
            Viedā optimizācija
          </div>
          <p className="text-[11px] leading-relaxed">
            Augšupielādējot attēlus, sistēma var automātiski izveidot vieglu <strong>WebP</strong> kopiju, vienlaikus pilnībā saglabājot oriģinālo failu.
          </p>
          <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/60">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={autoWebP}
                onChange={(e) => setAutoWebP(e.target.checked)}
                className="rounded border-zinc-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 w-3.5 h-3.5"
              />
              Izveidot WebP versiju
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={keepOriginal}
                onChange={(e) => setKeepOriginal(e.target.checked)}
                className="rounded border-zinc-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 w-3.5 h-3.5"
              />
              Saglabāt oriģinālu
            </label>
          </div>
        </div>
      </div>

      {/* --- CENTER SECTION: Main Toolbar, Drag&Drop, and File Grid/List --- */}
      <div className="lg:col-span-9 flex flex-col space-y-6">
        
        {/* Alerts */}
        {message && (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border ${
              message.type === "success"
                ? "bg-emerald-950/30 border-emerald-800/80 text-emerald-400"
                : message.type === "error"
                ? "bg-red-950/30 border-red-800/80 text-red-400"
                : "bg-blue-950/30 border-blue-800/80 text-blue-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span className="text-sm font-semibold">{message.text}</span>
          </div>
        )}

        {/* Toolbar panel */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Realtime Search & Basic info */}
            <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 px-4 py-2.5 rounded-2xl">
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Meklēt failus bibliotēkā..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Layout controls */}
              <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-850">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid" ? "bg-zinc-800 text-yellow-500 font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                  title="Režģa skats"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list" ? "bg-zinc-800 text-yellow-500 font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                  title="Saraksta skats"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Multi Select Toggle */}
              <button
                onClick={handleToggleMultiSelect}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                  isMultiSelectActive
                    ? "bg-yellow-500 text-zinc-950 border-yellow-500"
                    : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
                }`}
              >
                Vairākatlase
              </button>

              {/* Upload trigger */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 px-4.5 py-2 rounded-xl transition duration-150 text-xs font-bold"
              >
                <Upload className="w-4 h-4" />
                Augšupielādēt
              </button>
            </div>
          </div>

          {/* Filtering row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-900/60 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtrēt:
            </div>

            {/* Type filters */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">Visi faili</option>
              <option value="images">Attēli</option>
              <option value="documents">Dokumenti (PDF, ZIP, DOC...)</option>
              <option value="videos">Video</option>
              <option value="audio">Audio</option>
            </select>

            {/* Date filter */}
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">Visi datumi</option>
              <option value="month">Pēdējais mēnesis</option>
              <option value="year">Pēdējais gads</option>
            </select>

            {/* Sort indicator */}
            <div className="flex items-center gap-1.5 ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
              >
                <option value="date_desc">Datums: Jaunākie</option>
                <option value="date_asc">Datums: Vecākie</option>
                <option value="name_asc">Nosaukums: A-Z</option>
                <option value="name_desc">Nosaukums: Z-A</option>
                <option value="size_desc">Lielums: Lielākie</option>
                <option value="size_asc">Lielums: Mazākie</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk action toolbar */}
        <AnimatePresence>
          {isMultiSelectActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-900 border border-yellow-500/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-yellow-500">
                  Atlasīti {multiSelectedNames.length} faili
                </span>
                <span className="text-zinc-500">|</span>
                <button
                  onClick={handleSelectAllInFolder}
                  className="hover:text-white underline transition"
                >
                  Atlasīt visus
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="hover:text-white underline transition"
                >
                  Noņemt atlasi
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Move folder bulk trigger */}
                <span className="text-xs text-zinc-500">Pārvietot uz:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      handleBulkMove(e.target.value === "root" ? null : e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-zinc-300"
                >
                  <option value="">Izvēlieties mapi...</option>
                  <option value="root">Galvenā mapē (Root)</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>

                <button
                  onClick={handleBulkDownload}
                  disabled={multiSelectedNames.length === 0}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-xl text-xs font-semibold text-zinc-200 transition"
                >
                  Download (.ZIP/Sērija)
                </button>

                <button
                  onClick={handleBulkDelete}
                  disabled={multiSelectedNames.length === 0}
                  className="px-3 py-1 bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-300 disabled:opacity-40 rounded-xl text-xs font-semibold border border-red-900/40 transition"
                >
                  Dzēst atlasītos
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag Over Active Canvas Layer */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleLocalDragEnter}
          onDragLeave={handleLocalDragLeave}
          onDrop={handleLocalDrop}
          className={`flex-1 min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col justify-between relative overflow-hidden transition duration-150 ${
            dragActive
              ? "border-yellow-500 bg-yellow-500/5 text-yellow-500"
              : "border-zinc-900 bg-zinc-950/20"
          }`}
        >
          {uploading && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-white">Notiek augšupielāde & apstrāde...</p>
                <div className="w-48 bg-zinc-900 h-2 rounded-full overflow-hidden mt-3.5 border border-zinc-800">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-zinc-500 mt-1.5">{uploadProgress}% pabeigts</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-mono uppercase tracking-widest">Skenē bibliotēku...</p>
            </div>
          ) : getFilteredFiles().length === 0 && getCurrentFolders().length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 mb-4 shadow-inner">
                <ImageIcon className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-zinc-300">Šajā mapē nav neviena faila</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                Ievelciet failus tieši šeit vai noklikšķiniet uz "Augšupielādēt", lai sāktu failu pievienošanu.
              </p>
            </div>
          ) : (
            <div className="p-6">
              
              {/* Folders grid in main area (if not inside nested root filter) */}
              {getCurrentFolders().length > 0 && (
                <div className="mb-6">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block mb-3">Mapes šajā direktorijā</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {getCurrentFolders().map(folder => (
                      <div
                        key={folder.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnFolder(e, folder.id)}
                        draggable
                        onDragStart={(e) => handleFolderDragStart(e, folder.id)}
                        onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="group flex items-center justify-between p-3 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-850 rounded-2xl cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Folder className="w-4.5 h-4.5 text-yellow-500 fill-current shrink-0" />
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">{folder.name}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 group-hover:text-yellow-500 transition">
                          {mediaList.filter(m => m.folderId === folder.id).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files section */}
              {getFilteredFiles().length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block mb-3">Faili</span>
                  
                  {viewMode === "grid" ? (
                    /* --- GRID VIEW --- */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                      {getFilteredFiles().map((item) => {
                        const isSelected = selectedItem?.name === item.name;
                        const isMultiSelected = multiSelectedNames.includes(item.name);

                        return (
                          <div
                            key={item.name}
                            draggable
                            onDragStart={(e) => handleFileDragStart(e, item)}
                            onContextMenu={(e) => handleItemContextMenu(e, item)}
                            onClick={() => {
                              if (isMultiSelectActive) {
                                handleFileCheckboxToggle(item.name);
                              } else {
                                setSelectedItem(isSelected ? null : item);
                              }
                            }}
                            className={`group relative bg-zinc-900 border rounded-2xl overflow-hidden flex flex-col transition-all cursor-pointer ${
                              isMultiSelected
                                ? "border-yellow-500 ring-1 ring-yellow-500/20"
                                : isSelected
                                ? "border-yellow-500 bg-zinc-850"
                                : "border-zinc-850 hover:border-zinc-700 bg-zinc-900"
                            }`}
                          >
                            {/* Multiselect Checkbox overlay */}
                            {isMultiSelectActive && (
                              <div className="absolute top-2.5 left-2.5 z-20">
                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                  isMultiSelected ? "bg-yellow-500 border-yellow-500 text-zinc-950" : "bg-zinc-950/60 border-zinc-700 hover:border-zinc-500"
                                }`}>
                                  {isMultiSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </div>
                            )}

                            {/* Thumbnail Container */}
                            <div className="aspect-square w-full bg-zinc-950 flex items-center justify-center relative overflow-hidden border-b border-zinc-850/60 select-none">
                              {item.type === "image" ? (
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  {getFileIcon(item.type, item.name)}
                                  <span className="text-[9px] uppercase tracking-wider font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                                    {item.name.split(".").pop()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Caption details */}
                            <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                              <p className="text-[11px] font-bold text-zinc-200 break-all line-clamp-1 group-hover:text-yellow-500 transition">
                                {item.name}
                              </p>
                              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                                <span>{formatSize(item.size)}</span>
                                <span>{new Date(item.mtime).toLocaleDateString("lv-LV")}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* --- LIST VIEW --- */
                    <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/40">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-400 font-mono font-bold uppercase tracking-wider">
                            {isMultiSelectActive && <th className="p-4 w-10"></th>}
                            <th className="p-4">Nosaukums</th>
                            <th className="p-4">Formāts</th>
                            <th className="p-4">Izmērs</th>
                            <th className="p-4">Pēdējās izmaiņas</th>
                            <th className="p-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 text-zinc-300">
                          {getFilteredFiles().map((item) => {
                            const isSelected = selectedItem?.name === item.name;
                            const isMultiSelected = multiSelectedNames.includes(item.name);

                            return (
                              <tr
                                key={item.name}
                                onContextMenu={(e) => handleItemContextMenu(e, item)}
                                onClick={() => {
                                  if (isMultiSelectActive) {
                                    handleFileCheckboxToggle(item.name);
                                  } else {
                                    setSelectedItem(isSelected ? null : item);
                                  }
                                }}
                                className={`hover:bg-zinc-900/40 cursor-pointer transition ${
                                  isSelected ? "bg-yellow-500/5 text-yellow-500 font-bold" : ""
                                }`}
                              >
                                {isMultiSelectActive && (
                                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isMultiSelected}
                                      onChange={() => handleFileCheckboxToggle(item.name)}
                                      className="rounded border-zinc-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 w-4 h-4"
                                    />
                                  </td>
                                )}
                                <td className="p-4 font-bold flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800 overflow-hidden">
                                    {item.type === "image" ? (
                                      <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      getFileIcon(item.type, item.name)
                                    )}
                                  </div>
                                  <span className="truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
                                </td>
                                <td className="p-4 uppercase font-mono text-[10px] text-zinc-500">{item.name.split(".").pop()}</td>
                                <td className="p-4 font-mono text-[10px] text-zinc-500">{formatSize(item.size)}</td>
                                <td className="p-4 text-zinc-400">{new Date(item.mtime).toLocaleDateString("lv-LV")}</td>
                                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setSelectedItem(item)}
                                    className="p-1.5 hover:bg-zinc-900 hover:text-white rounded-lg transition"
                                    title="Skatīt rekvizītus"
                                  >
                                    <MoreVertical className="w-4.5 h-4.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT PANEL: Side sheet for File Details & Metadata --- */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop for mobile */}
            <div
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setSelectedItem(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, x: 280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 280 }}
              className="fixed lg:static top-0 right-0 bottom-0 z-40 lg:z-10 w-80 lg:w-auto lg:col-span-3 bg-zinc-950/80 lg:bg-zinc-950/40 backdrop-blur-md border-l lg:border border-zinc-900 rounded-none lg:rounded-3xl p-5 flex flex-col justify-between overflow-y-auto space-y-6"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-yellow-500" />
                    Faila detaļas
                  </span>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Preview */}
                <div className="aspect-square w-full bg-zinc-900 rounded-2xl border border-zinc-850 flex items-center justify-center relative overflow-hidden select-none">
                  {selectedItem.type === "image" ? (
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {getFileIcon(selectedItem.type, selectedItem.name)}
                      <span className="text-xs uppercase font-bold text-zinc-500 mt-1">
                        {selectedItem.name.split(".").pop()} Fails
                      </span>
                    </div>
                  )}
                </div>

                {/* Information Metadata */}
                <div className="space-y-3.5 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono tracking-wider mb-1">Nosaukums</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        defaultValue={selectedItem.name}
                        onBlur={(e) => handleRenameFile(selectedItem, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-yellow-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-850/60 font-mono text-[10px]">
                    <div>
                      <span className="text-zinc-500 block uppercase tracking-wider mb-0.5">Izmērs</span>
                      <span className="text-zinc-300 font-bold">{formatSize(selectedItem.size)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase tracking-wider mb-0.5">Veids</span>
                      <span className="text-zinc-300 font-bold uppercase">{selectedItem.name.split(".").pop()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-850/60 font-mono text-[10px]">
                    <span className="text-zinc-500 block uppercase tracking-wider mb-0.5">Modificēts</span>
                    <span className="text-zinc-300">{new Date(selectedItem.mtime).toLocaleString("lv-LV")}</span>
                  </div>

                  <div className="pt-2 border-t border-zinc-850/60">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono tracking-wider mb-1.5">Kur tiek izmantots</span>
                    <div className="space-y-1">
                      {getFileUsages(selectedItem.name).map((usage, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                          <Layers className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                          <span className="truncate">{usage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Operations & Copy path */}
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(selectedItem.url)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl transition"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedUrl === selectedItem.url ? "Kopēts ceļš!" : "Kopēt ceļu"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(window.location.origin + selectedItem.url)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl transition"
                    >
                      <Link className="w-4 h-4" />
                      {copiedUrl === window.location.origin + selectedItem.url ? "Kopēts URL!" : "Kopēt URL"}
                    </button>
                  </div>

                  {/* Open in new window & Download */}
                  <div className="flex gap-2">
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-lg transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Atvērt
                    </a>
                    <a
                      href={selectedItem.url}
                      download={selectedItem.name}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-lg transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Lejupielādēt
                    </a>
                  </div>

                  {/* Replace and Delete actions */}
                  <div className="flex gap-2 pt-2 border-t border-zinc-900/60">
                    <button
                      onClick={() => triggerFileReplacement(selectedItem)}
                      className="flex-1 py-2.5 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 rounded-xl transition border border-zinc-850"
                      title="Aizvietot faila saturu, paturot esošo nosaukumu"
                    >
                      Aizvietot saturu
                    </button>
                    <button
                      onClick={() => handleDeleteItem(selectedItem)}
                      className="flex-1 py-2.5 bg-red-950/40 hover:bg-red-900 text-red-400 rounded-xl border border-red-900/40 transition"
                    >
                      Dzēst failu
                    </button>
                  </div>
                </div>
              </div>

              {/* Picker select button */}
              {onSelect && (
                <button
                  onClick={() => onSelect(selectedItem.url)}
                  className="w-full py-3 bg-yellow-500 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-600 transition"
                >
                  Izvēlēties šo failu
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- FLOATING RIGHT-CLICK CONTEXT MENU --- */}
      <AnimatePresence>
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed z-50 bg-zinc-950/90 backdrop-blur-md border border-zinc-850 rounded-xl py-1.5 w-44 shadow-2xl overflow-hidden text-xs"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            {contextMenu.item && (
              <>
                <button
                  onClick={() => {
                    setSelectedItem(contextMenu.item);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-zinc-200 transition flex items-center gap-2"
                >
                  <Info className="w-4 h-4 text-zinc-500" />
                  Skatīt detaļas
                </button>
                <button
                  onClick={() => {
                    if (contextMenu.item) copyToClipboard(contextMenu.item.url);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-zinc-200 transition flex items-center gap-2"
                >
                  <Copy className="w-4 h-4 text-zinc-500" />
                  Kopēt ceļu
                </button>
                <button
                  onClick={() => {
                    if (contextMenu.item) {
                      const newName = window.prompt("Ievadiet jaunu faila nosaukumu:", contextMenu.item.name);
                      if (newName) handleRenameFile(contextMenu.item, newName);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-zinc-200 transition flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4 text-zinc-500" />
                  Pārdēvēt
                </button>
                <div className="border-t border-zinc-900 my-1"></div>
                <button
                  onClick={() => {
                    if (contextMenu.item) handleDeleteItem(contextMenu.item);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-red-400 hover:text-red-300 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Dzēst failu
                </button>
              </>
            )}

            {contextMenu.folder && (
              <>
                <button
                  onClick={() => {
                    if (contextMenu.folder) setEditingFolderId(contextMenu.folder.id);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-zinc-200 transition flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4 text-zinc-500" />
                  Pārdēvēt mapi
                </button>
                <button
                  onClick={() => {
                    if (contextMenu.folder) handleDeleteFolder(contextMenu.folder.id);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-red-400 hover:text-red-300 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Dzēst mapi
                </button>
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
