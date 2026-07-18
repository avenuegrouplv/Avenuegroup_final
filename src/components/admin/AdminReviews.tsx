import React, { useState, useEffect } from "react";
import {
  MessageSquare,
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
  Star,
  Image as ImageIcon,
  ArrowUpDown,
  X
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";

export interface ReviewItem {
  id: string;
  name: string;
  company: string;
  position: string;
  reviewText: string;
  rating: number; // 1 to 5
  photo: string;
  order: number;
  status: "Published" | "Hidden";
}

interface AdminReviewsProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({ token, showToast }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("order_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected item list for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Media picker integration
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Undo history stack
  const [undoStack, setUndoStack] = useState<ReviewItem[][]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/content-file/reviews.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.draft?.reviews || data.original?.reviews || [];
        setReviews(list.sort((a: any, b: any) => a.order - b.order));
      } else {
        setReviews(getFallbackReviews());
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setReviews(getFallbackReviews());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackReviews = (): ReviewItem[] => {
    return [
      {
        id: "rev-1",
        name: "SIA GreenOffice Baltic",
        company: "Baltic Management",
        position: "Biroju kompleksa vadītājs",
        reviewText: "Sadarbība ar Avenue Group ir pacēlusi mūsu ēkas apsaimniekošanas kvalitāti jaunā līmenī. Tehniskie jautājumi tiek risināti ātri un profesionāli.",
        rating: 5,
        photo: "/images/uploads/kapec-labs-nomnieks-var-klut-par-problemu.webp",
        order: 1,
        status: "Published"
      },
      {
        id: "rev-2",
        name: "Artūrs Kalniņš",
        company: "Privātīpašnieks",
        position: "Investīciju direktors",
        reviewText: "Ļoti uzticams partneris komercplatību juridiskajā pārvaldībā. Visi līgumi vienmēr sakārtoti laikā un bez liekas birokrātijas.",
        rating: 5,
        photo: "",
        order: 2,
        status: "Published"
      }
    ];
  };

  const pushToHistory = (currentState: ReviewItem[]) => {
    setUndoStack((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(currentState))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setReviews(previousState);
    saveReviewsState(previousState, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveReviewsState = async (updatedReviews: ReviewItem[], isUndo = false) => {
    try {
      if (!isUndo) {
        pushToHistory(reviews);
      }
      setReviews(updatedReviews);

      const res = await fetch("/api/cms/content-file/reviews.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            reviews: updatedReviews
          }
        })
      });

      if (!res.ok) throw new Error("Neizdevās saglabāt datus serverī");
      if (!isUndo) showToast("Atsauksmes saglabātas melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Neizdevās saglabāt datus serverī.", "error");
    }
  };

  const handleCreateReview = () => {
    const name = window.prompt("Ievadiet atsauksmes devēja vārdu:");
    if (!name) return;

    const newReview: ReviewItem = {
      id: "rev-" + Date.now(),
      name,
      company: "",
      position: "",
      reviewText: "Šeit ierakstiet atsauksmes tekstu...",
      rating: 5,
      photo: "",
      order: reviews.length + 1,
      status: "Published"
    };

    const updated = [...reviews, newReview];
    saveReviewsState(updated);
    setActiveReview(newReview);
    setIsEditorOpen(true);
  };

  const handleDeleteReview = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo atsauksmi?")) return;
    const updated = reviews.filter((r) => r.id !== id);
    saveReviewsState(updated);
    showToast("Atsauksme veiksmīgi izdzēsta.", "success");
  };

  const handleDuplicateReview = (item: ReviewItem) => {
    const duplicate: ReviewItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: "rev-" + Date.now(),
      name: `${item.name} (Kopija)`,
      order: reviews.length + 1
    };
    const updated = [...reviews, duplicate];
    saveReviewsState(updated);
    showToast("Atsauksme dublēta.", "success");
  };

  const handleSaveEditor = () => {
    if (!activeReview) return;
    const updated = reviews.map((r) => (r.id === activeReview.id ? activeReview : r));
    saveReviewsState(updated);
    setIsEditorOpen(false);
    setActiveReview(null);
  };

  // Bulk actions
  const handleBulkStatusChange = (status: ReviewItem["status"]) => {
    if (selectedIds.length === 0) return;
    const updated = reviews.map((r) =>
      selectedIds.includes(r.id) ? { ...r, status } : r
    );
    saveReviewsState(updated);
    setSelectedIds([]);
    showToast(`Atlasītajām atsauksmēm nomainīts statuss: ${status}`, "success");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Vai tiešām vēlaties dzēst ${selectedIds.length} atlasītās atsauksmes?`)) return;
    const updated = reviews.filter((r) => !selectedIds.includes(r.id));
    saveReviewsState(updated);
    setSelectedIds([]);
    showToast("Atlasītās atsauksmes tika izdzēstas.", "success");
  };

  // Reorder list
  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    const updated = [...reviews];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap order property
    const tempOrder = updated[index].order;
    updated[index].order = updated[targetIdx].order;
    updated[targetIdx].order = tempOrder;

    // Swap elements in list
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    saveReviewsState(updated);
  };

  // Import/Export helper
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "reviews_export.json");
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
            const updated = [...parsed, ...reviews];
            saveReviewsState(updated);
            showToast(`Veiksmīgi importētas ${parsed.length} atsauksmes!`, "success");
          } else {
            showToast("Nederīgs faila formāts.", "error");
          }
        } catch (err) {
          showToast("Kļūda lasot failu.", "error");
        }
      };
    }
  };

  // Filter & Sort
  const getFilteredReviews = () => {
    return reviews
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.reviewText.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesRating = ratingFilter === "all" || r.rating.toString() === ratingFilter;

        return matchesSearch && matchesStatus && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === "order_asc") return a.order - b.order;
        if (sortBy === "order_desc") return b.order - a.order;
        if (sortBy === "rating_desc") return b.rating - a.rating;
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        return 0;
      });
  };

  const filtered = getFilteredReviews();
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedReviews = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleMediaSelected = (url: string) => {
    if (activeReview) {
      setActiveReview({ ...activeReview, photo: url });
    }
    setIsMediaPickerOpen(false);
    showToast("Fotoattēls veiksmīgi piesaistīts!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Upper summary ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Kopā atsauksmju</span>
          <span className="text-xl font-extrabold text-white mt-1">{reviews.length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono font-bold font-bold">Aktīvas</span>
          <span className="text-xl font-extrabold text-white mt-1">{reviews.filter((r) => r.status === "Published").length}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-mono font-bold">Paslēptas</span>
          <span className="text-xl font-extrabold text-white mt-1">{reviews.filter((r) => r.status === "Hidden").length}</span>
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

      {/* Toolbar / Search panel */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 px-4 py-2.5 rounded-2xl">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Meklēt atsauksmēs pēc vārda, uzņēmuma vai teksta..."
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
                <option value="Published">Redzamās (Published)</option>
                <option value="Hidden">Paslēptās (Hidden)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 pr-8 text-xs text-zinc-300 rounded-xl focus:outline-none"
              >
                <option value="all">Visas atzīmes</option>
                <option value="5">5 Zvaigznes</option>
                <option value="4">4 Zvaigznes</option>
                <option value="3">3 Zvaigznes</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Order */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 pr-8 text-xs text-zinc-300 rounded-xl focus:outline-none"
              >
                <option value="order_asc">Pēc secības (Augoši)</option>
                <option value="order_desc">Pēc secības (Dilstoši)</option>
                <option value="rating_desc">Pēc vērtējuma (Augstākais)</option>
                <option value="name_asc">Pēc vārda (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Import / Export / Add */}
            <div className="flex gap-2.5">
              <button
                onClick={handleExportJSON}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
                title="Eksportēt uz JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <label className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer" title="Importēt JSON failu">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              <button
                onClick={handleCreateReview}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Jauna Atsauksme
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Panel */}
        {selectedIds.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-yellow-500/90 font-bold">
              Atlasītas <span className="underline">{selectedIds.length}</span> atsauksmes
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleBulkStatusChange("Published")}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] text-zinc-300 font-bold rounded-lg transition"
              >
                Rādīt
              </button>
              <button
                onClick={() => handleBulkStatusChange("Hidden")}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] text-zinc-300 font-bold rounded-lg transition"
              >
                Paslēpt
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-[10px] text-red-400 font-bold rounded-lg transition"
              >
                Dzēst atlasītās
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
                  checked={paginatedReviews.length > 0 && paginatedReviews.every((r) => selectedIds.includes(r.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...new Set([...selectedIds, ...paginatedReviews.map((r) => r.id)])]);
                    } else {
                      setSelectedIds(selectedIds.filter((id) => !paginatedReviews.some((r) => r.id === id)));
                    }
                  }}
                  className="rounded border-zinc-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 w-4 h-4"
                />
              </th>
              <th className="p-4 w-12">Secība</th>
              <th className="p-4">Klients</th>
              <th className="p-4">Uzņēmums / Amats</th>
              <th className="p-4">Vērtējums</th>
              <th className="p-4">Atsauksmes fragments</th>
              <th className="p-4">Statuss</th>
              <th className="p-4 text-right">Darbības</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-500" />
                  Ielādē...
                </td>
              </tr>
            ) : paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  Nav atrastu atsauksmju.
                </td>
              </tr>
            ) : (
              paginatedReviews.map((review, index) => {
                const isChecked = selectedIds.includes(review.id);
                return (
                  <tr key={review.id} className="hover:bg-zinc-900/10 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedIds(selectedIds.filter((id) => id !== review.id));
                          } else {
                            setSelectedIds([...selectedIds, review.id]);
                          }
                        }}
                        className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-zinc-400">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          disabled={review.order === 1}
                          onClick={() => handleMoveOrder(index, "up")}
                          className="text-zinc-600 hover:text-white transition disabled:opacity-20 text-[9px]"
                        >
                          ▲
                        </button>
                        <span>{review.order}</span>
                        <button
                          disabled={review.order === reviews.length}
                          onClick={() => handleMoveOrder(index, "down")}
                          className="text-zinc-600 hover:text-white transition disabled:opacity-20 text-[9px]"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                          {review.photo ? (
                            <img src={review.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <span>{review.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-zinc-300">{review.company || "—"}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{review.position || "—"}</div>
                    </td>
                    <td className="p-4 text-yellow-500">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${idx < review.rating ? "fill-yellow-500" : "text-zinc-700"}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 italic line-clamp-1 max-w-xs">{review.reviewText}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono ${
                          review.status === "Published"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-zinc-800 border border-zinc-750 text-zinc-400"
                        }`}
                      >
                        {review.status === "Published" ? "Aktīvs" : "Paslēpts"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setActiveReview(review);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                          title="Labot"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateReview(review)}
                          className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                          title="Dublēt"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
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
            Rāda {(currentPage - 1) * itemsPerPage + 1} līdz {Math.min(currentPage * itemsPerPage, filtered.length)} no {filtered.length} atsauksmēm
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

      {/* EDIT MODAL DIALOG */}
      {isEditorOpen && activeReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 sticky top-0 backdrop-blur z-10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-yellow-500" />
                  Rediģēt atsauksmi
                </span>
                <h3 className="text-sm font-bold text-white">{activeReview.name || "Jauna atsauksme"}</h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Field Areas */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
              {/* Photo Input (Visual from Media Library) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Klijenta foto (Photo)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    {activeReview.photo ? (
                      <img src={activeReview.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition"
                    >
                      Izvēlēties no Media
                    </button>
                    {activeReview.photo && (
                      <button
                        onClick={() => setActiveReview({ ...activeReview, photo: "" })}
                        className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-400 text-xs font-bold rounded-xl transition"
                      >
                        Noņemt
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Vārds / Uzņēmums</label>
                <input
                  type="text"
                  value={activeReview.name}
                  onChange={(e) => setActiveReview({ ...activeReview, name: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Uzņēmums</label>
                  <input
                    type="text"
                    value={activeReview.company}
                    onChange={(e) => setActiveReview({ ...activeReview, company: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Amats</label>
                  <input
                    type="text"
                    value={activeReview.position}
                    onChange={(e) => setActiveReview({ ...activeReview, position: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Rating Star Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Vērtējums (Reitings)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setActiveReview({ ...activeReview, rating: val })}
                      className="p-1 hover:scale-110 transition text-yellow-500"
                    >
                      <Star className={`w-6 h-6 ${val <= activeReview.rating ? "fill-yellow-500" : "text-zinc-700"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rādīšanas statuss</label>
                <select
                  value={activeReview.status}
                  onChange={(e) => setActiveReview({ ...activeReview, status: e.target.value as "Published" | "Hidden" })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="Published">Aktīva (Rādīt mājaslapā)</option>
                  <option value="Hidden">Paslēpta (Nerādīt)</option>
                </select>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Atsauksme (Review Text)</label>
                <textarea
                  rows={4}
                  value={activeReview.reviewText}
                  onChange={(e) => setActiveReview({ ...activeReview, reviewText: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-yellow-500 resize-none"
                />
              </div>
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
                Saglabāt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REUSABLE MEDIA PICKER POPUP */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Izvēlēties atsauksmes fotoattēlu</span>
              </div>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
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
    </div>
  );
};
