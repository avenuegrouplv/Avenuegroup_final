import React, { useState, useEffect } from "react";
import {
  Mail,
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
  Phone,
  Settings,
  Share2,
  X
} from "lucide-react";

export interface FormSubmission {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  date: string;
  status: "Jauns" | "Izskatīts" | "Arhivēts";
}

export interface CompanyContacts {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  coordinates: {
    lat: string;
    lng: string;
  };
  socials: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface AdminFormsProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminForms: React.FC<AdminFormsProps> = ({ token, showToast }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [contacts, setContacts] = useState<CompanyContacts | null>(null);
  const [loading, setLoading] = useState(true);

  // Sub section tabs: Forms Submissions vs Contacts configuration
  const [activeTab, setActiveTab] = useState<"submissions" | "contacts">("submissions");

  // UI Search/Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detailed view
  const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(null);

  // Undo histories
  const [submissionsUndo, setSubmissionsUndo] = useState<FormSubmission[][]>([]);

  useEffect(() => {
    fetchFormsData();
  }, []);

  const fetchFormsData = async () => {
    try {
      setLoading(true);
      // Submissions
      const resSub = await fetch("/api/cms/content-file/submissions.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resSub.ok) {
        const data = await resSub.json();
        setSubmissions(data.draft?.submissions || data.original?.submissions || []);
      } else {
        setSubmissions(getFallbackSubmissions());
      }

      // Contacts
      const resCon = await fetch("/api/cms/content-file/contacts.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resCon.ok) {
        const data = await resCon.json();
        setContacts(data.draft || data.original || getFallbackContacts());
      } else {
        setContacts(getFallbackContacts());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSubmissions = (): FormSubmission[] => [
    {
      id: "sub-1",
      name: "Jānis Bērziņš",
      email: "janis@berzins.lv",
      interest: "Apsaimniekošana",
      message: "Labdien! Vēlos uzzināt par Avenue Group iespējām apsaimniekot mūsu biroju ēku Skanstē. Kopējā platība ir ap 2500 m2.",
      date: "2026-07-17, 10:15",
      status: "Jauns"
    },
    {
      id: "sub-2",
      name: "Kristīne Ozola",
      email: "kristine@ozols.lv",
      interest: "Juridiskais atbalsts",
      message: "Sveiki! Nepieciešama konsultācija par komercnomas līguma pārskatīšanu pirms parakstīšanas. Paldies!",
      date: "2026-07-16, 16:40",
      status: "Izskatīts"
    }
  ];

  const getFallbackContacts = (): CompanyContacts => ({
    phone: "+371 20000000",
    email: "info@avenuegroup.lv",
    address: "Brīvības gatve 386 k-2-5A, Rīga, LV-1006",
    workingHours: "P.-P. 09:00 - 18:00",
    coordinates: { lat: "56.9852", lng: "24.2054" },
    socials: {
      facebook: "https://facebook.com/avenuegroup",
      linkedin: "https://linkedin.com/company/avenuegroup"
    }
  });

  const pushSubmissionsUndo = (state: FormSubmission[]) => {
    setSubmissionsUndo((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(state))]);
  };

  const handleUndo = () => {
    if (submissionsUndo.length === 0) return;
    const prev = submissionsUndo[submissionsUndo.length - 1];
    setSubmissionsUndo((p) => p.slice(0, -1));
    setSubmissions(prev);
    saveSubmissions(prev);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveSubmissions = async (updated: FormSubmission[]) => {
    try {
      setSubmissions(updated);
      await fetch("/api/cms/content-file/submissions.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ draftContent: { submissions: updated } })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const saveContacts = async (updated: CompanyContacts) => {
    try {
      setContacts(updated);
      const res = await fetch("/api/cms/content-file/contacts.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ draftContent: updated })
      });
      if (res.ok) {
        showToast("Kontaktinformācija saglabāta melnrakstā!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Kļūda saglabājot kontaktus", "error");
    }
  };

  // Submission actions
  const handleDeleteSubmission = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst pieteikumu?")) return;
    pushSubmissionsUndo(submissions);
    const updated = submissions.filter((s) => s.id !== id);
    saveSubmissions(updated);
    showToast("Pieteikums izdzēsts.", "success");
  };

  const handleBulkStatusChange = (status: FormSubmission["status"]) => {
    if (selectedIds.length === 0) return;
    pushSubmissionsUndo(submissions);
    const updated = submissions.map((s) =>
      selectedIds.includes(s.id) ? { ...s, status } : s
    );
    saveSubmissions(updated);
    setSelectedIds([]);
    showToast("Statusi veiksmīgi nomainīti!", "success");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Dzēst ${selectedIds.length} atlasītos pieteikumus?`)) return;
    pushSubmissionsUndo(submissions);
    const updated = submissions.filter((s) => !selectedIds.includes(s.id));
    saveSubmissions(updated);
    setSelectedIds([]);
    showToast("Pieteikumi izdzēsti.", "success");
  };

  // Export submissions to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "submissions_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Pieteikumi veiksmīgi eksportēti!", "success");
  };

  // Filtering
  const getFilteredSubmissions = () => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.interest.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="space-y-6">
      {/* Sub tabs ribbon */}
      <div className="flex border-b border-zinc-900 justify-between items-center bg-zinc-950/40 p-3 rounded-2.5xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "submissions" ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            Klientu Pieteikumi (Formas Inbox)
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "contacts" ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            Uzņēmuma Kontakti un Kartes dati
          </button>
        </div>

        {activeTab === "submissions" && (
          <div className="flex items-center gap-2">
            {submissionsUndo.length > 0 && (
              <button
                onClick={handleUndo}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs rounded-xl flex items-center gap-1"
              >
                <Undo2 className="w-3.5 h-3.5" /> Atgriezt ({submissionsUndo.length})
              </button>
            )}
            <button
              onClick={handleExportJSON}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
              title="Eksportēt uz JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUBMISSIONS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "submissions" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Toolbar */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 px-4 py-2.5 rounded-2xl">
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Meklēt pieteikumu pēc vārda, e-pasta, intereses vai ziņas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 pr-8 text-xs text-zinc-300 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="all">Visi statusi</option>
                  <option value="Jauns">Jaunie</option>
                  <option value="Izskatīts">Izskatītie</option>
                  <option value="Arhivēts">Arhivētie</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-yellow-500/90 font-bold">
                  Atlasīti <span className="underline">{selectedIds.length}</span> pieteikumi
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleBulkStatusChange("Izskatīts")}
                    className="px-3 py-1 bg-zinc-900 text-[10px] text-zinc-300 font-bold rounded-lg transition hover:bg-zinc-850"
                  >
                    Atzīmēt kā "Izskatīts"
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("Arhivēts")}
                    className="px-3 py-1 bg-zinc-900 text-[10px] text-zinc-300 font-bold rounded-lg transition hover:bg-zinc-850"
                  >
                    Arhivēt
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-950/60 text-red-400 text-[10px] font-bold rounded-lg transition hover:bg-red-900"
                  >
                    Dzēst
                  </button>
                  <button onClick={() => setSelectedIds([])} className="text-zinc-500 hover:text-zinc-300 px-2 text-[10px] font-bold">Atcelt</button>
                </div>
              </div>
            )}
          </div>

          {/* Submissions Table list */}
          <div className="overflow-x-auto rounded-3xl border border-zinc-900 bg-zinc-950/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-400 font-mono font-bold uppercase tracking-wider">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={filteredSubmissions.length > 0 && filteredSubmissions.every((s) => selectedIds.includes(s.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...new Set([...selectedIds, ...filteredSubmissions.map((s) => s.id)])]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => !filteredSubmissions.some((s) => s.id === id)));
                        }
                      }}
                      className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Sūtītājs</th>
                  <th className="p-4">E-pasts</th>
                  <th className="p-4">Interese</th>
                  <th className="p-4">Ziņojums</th>
                  <th className="p-4">Datums</th>
                  <th className="p-4">Statuss</th>
                  <th className="p-4 text-right">Darbības</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-500">Ielādē...</td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-500">Nav saņemts neviens pieteikums.</td>
                  </tr>
                ) : (
                  filteredSubmissions.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className="hover:bg-zinc-900/10 transition">
                        <td className="p-4">
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
                            className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4"
                          />
                        </td>
                        <td className="p-4 font-bold text-white">{item.name}</td>
                        <td className="p-4 text-zinc-400 font-mono">{item.email}</td>
                        <td className="p-4 text-zinc-400 font-bold">{item.interest}</td>
                        <td className="p-4 text-zinc-500 max-w-xs truncate">{item.message}</td>
                        <td className="p-4 font-mono text-[10px] text-zinc-500">{item.date}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono ${
                              item.status === "Jauns"
                                ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                                : item.status === "Izskatīts"
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800 border border-zinc-750 text-zinc-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => {
                                setActiveSubmission(item);
                                if (item.status === "Jauns") {
                                  // Auto set to Izskatīts on open
                                  const updated = submissions.map((s) => (s.id === item.id ? { ...s, status: "Izskatīts" as const } : s));
                                  saveSubmissions(updated);
                                }
                              }}
                              className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                              title="Atvērt ziņu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(item.id)}
                              className="p-1.5 hover:bg-zinc-900 text-red-500 hover:text-red-400 rounded-lg transition"
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
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTACTS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "contacts" && contacts && (
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6 max-w-3xl animate-fadeIn">
          <div>
            <h3 className="text-sm font-bold text-white">Uzņēmuma kontaktinformācija</h3>
            <p className="text-[11px] text-zinc-500">Mājaslapas kontaktu sadaļas, kājenes un interaktīvās kartes konfigurācija.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-yellow-500" /> Kontakttālrunis
              </label>
              <input
                type="text"
                value={contacts.phone}
                onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
                className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-yellow-500" /> Kontakt-epasts
              </label>
              <input
                type="email"
                value={contacts.email}
                onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
                className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-yellow-500" /> Ofisa / Uzņēmuma Adrese
              </label>
              <input
                type="text"
                value={contacts.address}
                onChange={(e) => setContacts({ ...contacts, address: e.target.value })}
                className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Darba laiks</label>
              <input
                type="text"
                value={contacts.workingHours}
                onChange={(e) => setContacts({ ...contacts, workingHours: e.target.value })}
                className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Karte (Latitude)</label>
              <input
                type="text"
                value={contacts.coordinates.lat}
                onChange={(e) => setContacts({ ...contacts, coordinates: { ...contacts.coordinates, lat: e.target.value } })}
                className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Karte (Longitude)</label>
              <input
                type="text"
                value={contacts.coordinates.lng}
                onChange={(e) => setContacts({ ...contacts, coordinates: { ...contacts.coordinates, lng: e.target.value } })}
                className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5 col-span-2 border-t border-zinc-850/40 pt-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-yellow-500" /> Sociālie tīkli
              </label>
              <div className="space-y-2 mt-2">
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-zinc-500 w-24">Facebook</span>
                  <input
                    type="text"
                    value={contacts.socials.facebook || ""}
                    onChange={(e) => setContacts({ ...contacts, socials: { ...contacts.socials, facebook: e.target.value } })}
                    className="flex-1 bg-zinc-900/60 border border-zinc-800 p-2 rounded-xl text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-zinc-500 w-24">LinkedIn</span>
                  <input
                    type="text"
                    value={contacts.socials.linkedin || ""}
                    onChange={(e) => setContacts({ ...contacts, socials: { ...contacts.socials, linkedin: e.target.value } })}
                    className="flex-1 bg-zinc-900/60 border border-zinc-800 p-2 rounded-xl text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-850/40">
            <button
              onClick={() => saveContacts(contacts)}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-zinc-950 font-extrabold text-xs rounded-xl transition"
            >
              Saglabāt kontaktus
            </button>
          </div>
        </div>
      )}

      {/* DETAILED VIEW POPUP FOR SUBMISSIONS */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Klienta pieteikums</span>
              <button onClick={() => setActiveSubmission(null)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 border-b border-zinc-900 pb-3">
                <div>
                  <h5 className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Sūtītājs</h5>
                  <p className="font-bold text-white text-xs mt-0.5">{activeSubmission.name}</p>
                </div>
                <div>
                  <h5 className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">E-pasts</h5>
                  <p className="font-bold text-yellow-500 text-xs mt-0.5 font-mono">{activeSubmission.email}</p>
                </div>
                <div>
                  <h5 className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Interese / Tēma</h5>
                  <p className="font-bold text-zinc-200 mt-0.5">{activeSubmission.interest}</p>
                </div>
                <div>
                  <h5 className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Saņemšanas laiks</h5>
                  <p className="text-zinc-400 mt-0.5 font-mono">{activeSubmission.date}</p>
                </div>
              </div>

              <div>
                <h5 className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1.5">Ziņojuma saturs</h5>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/40 text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeSubmission.message}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 flex justify-end">
              <button onClick={() => setActiveSubmission(null)} className="px-5 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold">Aizvērt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
