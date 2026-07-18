import React, { useState, useEffect } from "react";
import {
  HelpCircle,
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
  Grid,
  Settings,
  Briefcase,
  Layers,
  Heart,
  DollarSign,
  Compass,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  X
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string; // Lucide icon string
  order: number;
}

export interface PartnerItem {
  id: string;
  name: string;
  logo: string; // URL from media library
  link: string;
  order: number;
}

interface AdminFAQProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminFAQ: React.FC<AdminFAQProps> = ({ token, showToast }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs for the combined section
  const [activeTab, setActiveTab] = useState<"faq" | "services" | "partners">("faq");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [faqCategoryFilter, setFaqCategoryFilter] = useState("all");

  // Edit states
  const [activeFaq, setActiveFaq] = useState<FAQItem | null>(null);
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [activePartner, setActivePartner] = useState<PartnerItem | null>(null);

  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);

  // Media picker
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Undo histories
  const [faqUndo, setFaqUndo] = useState<FAQItem[][]>([]);
  const [serviceUndo, setServiceUndo] = useState<ServiceItem[][]>([]);
  const [partnerUndo, setPartnerUndo] = useState<PartnerItem[][]>([]);

  // Local state for expanded accordion previews
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // FAQs
      const faqRes = await fetch("/api/cms/content-file/faqs.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (faqRes.ok) {
        const data = await faqRes.json();
        setFaqs(data.draft?.faqs || data.original?.faqs || []);
      } else {
        setFaqs(getFallbackFaqs());
      }

      // Services
      const servRes = await fetch("/api/cms/content-file/services.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (servRes.ok) {
        const data = await servRes.json();
        setServices(data.draft?.services || data.original?.services || []);
      } else {
        setServices(getFallbackServices());
      }

      // Partners
      const partRes = await fetch("/api/cms/content-file/partners.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (partRes.ok) {
        const data = await partRes.json();
        setPartners(data.draft?.partners || data.original?.partners || []);
      } else {
        setPartners(getFallbackPartners());
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackFaqs = (): FAQItem[] => [
    {
      id: "faq-1",
      question: "Kādas ir Avenue Group reaģēšanas iespējas ārkārtas situācijās?",
      answer: "Mēs nodrošinām diennakts (24/7) tehnisko palīdzību. Ārkārtas situācijās mūsu inženieru brigāde ierodas objektā 30-45 minūšu laikā Rīgas un Pierīgas teritorijā.",
      category: "Apsaimniekošana",
      order: 1
    },
    {
      id: "faq-2",
      question: "Vai jūs apkalpojat arī reģionālos komercīpašumus?",
      answer: "Jā, mēs nodrošinām pakalpojumus visā Latvijas teritorijā, tostarp Kurzeme, Vidzeme un Latgale, pateicoties mūsu reģionālajām uzturēšanas nodaļām.",
      category: "Darbības zona",
      order: 2
    }
  ];

  const getFallbackServices = (): ServiceItem[] => [
    {
      id: "serv-1",
      title: "Inženiertīklu uzturēšana",
      description: "Ventilācijas, apkures, dzesēšanas sistēmu profilaktiskās apkopes un remontdarbi komercplatībās.",
      price: "No 150 €/mēn",
      icon: "Settings",
      order: 1
    },
    {
      id: "serv-2",
      title: "Juridiskais atbalsts un pārvaldība",
      description: "Komercnomas līgumu sagatavošana, strīdu risināšana, nomas maksas indeksācija un parādu kontrole.",
      price: "No 200 €/mēn",
      icon: "Briefcase",
      order: 2
    }
  ];

  const getFallbackPartners = (): PartnerItem[] => [
    {
      id: "part-1",
      name: "Rīgas Dome",
      logo: "/images/uploads/ka-pareiza-komercipasuma-apsaimniekosana-palielina-ta-vertibu.webp",
      link: "https://riga.lv",
      order: 1
    },
    {
      id: "part-2",
      name: "Biroju Centrs Skanste",
      logo: "/images/uploads/kas-obligati-jaieklauj-komercnomas-liguma.webp",
      link: "https://skanste.lv",
      order: 2
    }
  ];

  // Undo implementations
  const pushUndo = (type: "faq" | "services" | "partners") => {
    if (type === "faq") setFaqUndo((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(faqs))]);
    if (type === "services") setServiceUndo((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(services))]);
    if (type === "partners") setPartnerUndo((prev) => [...prev.slice(-9), JSON.parse(JSON.stringify(partners))]);
  };

  const handleUndo = (type: "faq" | "services" | "partners") => {
    if (type === "faq" && faqUndo.length > 0) {
      const prev = faqUndo[faqUndo.length - 1];
      setFaqUndo((p) => p.slice(0, -1));
      setFaqs(prev);
      saveFile("faqs", { faqs: prev });
    }
    if (type === "services" && serviceUndo.length > 0) {
      const prev = serviceUndo[serviceUndo.length - 1];
      setServiceUndo((p) => p.slice(0, -1));
      setServices(prev);
      saveFile("services", { services: prev });
    }
    if (type === "partners" && partnerUndo.length > 0) {
      const prev = partnerUndo[partnerUndo.length - 1];
      setPartnerUndo((p) => p.slice(0, -1));
      setPartners(prev);
      saveFile("partners", { partners: prev });
    }
    showToast("Darbība tika atcelta!", "info");
  };

  const saveFile = async (filename: string, content: any) => {
    try {
      const res = await fetch(`/api/cms/content-file/${filename}.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: content
        })
      });
      if (!res.ok) throw new Error("Neizdevās saglabāt datus");
    } catch (err) {
      console.error(err);
      showToast("Kļūda saglabājot serverī.", "error");
    }
  };

  // Move ordering
  const handleMoveFaq = (idx: number, direction: "up" | "down") => {
    pushUndo("faq");
    const updated = [...faqs];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const temp = updated[idx].order;
    updated[idx].order = updated[targetIdx].order;
    updated[targetIdx].order = temp;

    const tempVal = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = tempVal;

    setFaqs(updated);
    saveFile("faqs", { faqs: updated });
    showToast("Secība mainīta!", "success");
  };

  const handleMoveService = (idx: number, direction: "up" | "down") => {
    pushUndo("services");
    const updated = [...services];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const temp = updated[idx].order;
    updated[idx].order = updated[targetIdx].order;
    updated[targetIdx].order = temp;

    const tempVal = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = tempVal;

    setServices(updated);
    saveFile("services", { services: updated });
    showToast("Secība mainīta!", "success");
  };

  const handleMovePartner = (idx: number, direction: "up" | "down") => {
    pushUndo("partners");
    const updated = [...partners];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const temp = updated[idx].order;
    updated[idx].order = updated[targetIdx].order;
    updated[targetIdx].order = temp;

    const tempVal = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = tempVal;

    setPartners(updated);
    saveFile("partners", { partners: updated });
    showToast("Secība mainīta!", "success");
  };

  // FAQ CRUD
  const handleCreateFaq = () => {
    const q = window.prompt("Ievadiet jaunu jautājumu:");
    if (!q) return;
    pushUndo("faq");
    const newItem: FAQItem = {
      id: "faq-" + Date.now(),
      question: q,
      answer: "Ierakstiet atbildi šeit...",
      category: "Vispārīgi",
      order: faqs.length + 1
    };
    const updated = [...faqs, newItem];
    setFaqs(updated);
    saveFile("faqs", { faqs: updated });
    setActiveFaq(newItem);
    setIsFaqOpen(true);
  };

  const handleDeleteFaq = (id: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst?")) return;
    pushUndo("faq");
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    saveFile("faqs", { faqs: updated });
    showToast("Izdzēsts!", "success");
  };

  const handleSaveFaq = () => {
    if (!activeFaq) return;
    pushUndo("faq");
    const updated = faqs.map((f) => (f.id === activeFaq.id ? activeFaq : f));
    setFaqs(updated);
    saveFile("faqs", { faqs: updated });
    setIsFaqOpen(false);
    setActiveFaq(null);
  };

  // SERVICE CRUD
  const handleCreateService = () => {
    const title = window.prompt("Ievadiet jauna pakalpojuma nosaukumu:");
    if (!title) return;
    pushUndo("services");
    const newItem: ServiceItem = {
      id: "serv-" + Date.now(),
      title,
      description: "Apraksts...",
      price: "No 100 €",
      icon: "Briefcase",
      order: services.length + 1
    };
    const updated = [...services, newItem];
    setServices(updated);
    saveFile("services", { services: updated });
    setActiveService(newItem);
    setIsServiceOpen(true);
  };

  const handleDeleteService = (id: string) => {
    if (!window.confirm("Dzēst pakalpojumu?")) return;
    pushUndo("services");
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    saveFile("services", { services: updated });
    showToast("Izdzēsts!", "success");
  };

  const handleSaveService = () => {
    if (!activeService) return;
    pushUndo("services");
    const updated = services.map((s) => (s.id === activeService.id ? activeService : s));
    setServices(updated);
    saveFile("services", { services: updated });
    setIsServiceOpen(false);
    setActiveService(null);
  };

  // PARTNER CRUD
  const handleCreatePartner = () => {
    const name = window.prompt("Ievadiet jauna partnera zīmola nosaukumu:");
    if (!name) return;
    pushUndo("partners");
    const newItem: PartnerItem = {
      id: "part-" + Date.now(),
      name,
      logo: "",
      link: "https://",
      order: partners.length + 1
    };
    const updated = [...partners, newItem];
    setPartners(updated);
    saveFile("partners", { partners: updated });
    setActivePartner(newItem);
    setIsPartnerOpen(true);
  };

  const handleDeletePartner = (id: string) => {
    if (!window.confirm("Dzēst partneri?")) return;
    pushUndo("partners");
    const updated = partners.filter((p) => p.id !== id);
    setPartners(updated);
    saveFile("partners", { partners: updated });
    showToast("Izdzēsts!", "success");
  };

  const handleSavePartner = () => {
    if (!activePartner) return;
    pushUndo("partners");
    const updated = partners.map((p) => (p.id === activePartner.id ? activePartner : p));
    setPartners(updated);
    saveFile("partners", { partners: updated });
    setIsPartnerOpen(false);
    setActivePartner(null);
  };

  const handleMediaSelected = (url: string) => {
    if (activePartner) {
      setActivePartner({ ...activePartner, logo: url });
    }
    setIsMediaOpen(false);
    showToast("Logo piesaistīts partnerim!", "success");
  };

  // Filtering
  const getFilteredFaqs = () => {
    return faqs.filter((f) => {
      const matchesSearch =
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = faqCategoryFilter === "all" || f.category === faqCategoryFilter;
      return matchesSearch && matchesCat;
    });
  };

  const faqCategories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="space-y-6">
      {/* Sub tabs nav */}
      <div className="flex border-b border-zinc-900 gap-1.5 bg-zinc-950/20 p-1.5 rounded-2xl border border-zinc-900 max-w-lg">
        <button
          onClick={() => {
            setActiveTab("faq");
            setSearchQuery("");
          }}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === "faq" ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Buj (FAQ)
        </button>

        <button
          onClick={() => {
            setActiveTab("services");
            setSearchQuery("");
          }}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === "services" ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Pakalpojumi
        </button>

        <button
          onClick={() => {
            setActiveTab("partners");
            setSearchQuery("");
          }}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === "partners" ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4" />
          Partneri
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FAQ TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "faq" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Upper Summary row */}
          <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-zinc-900 rounded-2.5xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-mono">Buj jautājumi: <span className="text-white font-bold">{faqs.length}</span></span>
              {faqUndo.length > 0 && (
                <button
                  onClick={() => handleUndo("faq")}
                  className="flex items-center gap-1 text-[10px] bg-zinc-900 px-2 py-1 hover:bg-zinc-800 text-zinc-400 rounded-lg"
                >
                  <Undo2 className="w-3 h-3" /> Atcelt ({faqUndo.length})
                </button>
              )}
            </div>

            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Meklēt jautājumos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none"
              />

              <select
                value={faqCategoryFilter}
                onChange={(e) => setFaqCategoryFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-xl text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">Visas kategorijas</option>
                {faqCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                onClick={handleCreateFaq}
                className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Pievienot
              </button>
            </div>
          </div>

          {/* Table / Accordion layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-x-auto rounded-3xl border border-zinc-900 bg-zinc-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-400 font-mono font-bold uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">Secība</th>
                    <th className="p-4">Kategorija</th>
                    <th className="p-4">Jautājums</th>
                    <th className="p-4 text-right">Darbības</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {getFilteredFaqs().map((faq, idx) => (
                    <tr key={faq.id} className="hover:bg-zinc-900/10 transition">
                      <td className="p-4 font-mono font-bold">
                        <div className="flex flex-col items-center gap-1">
                          <button disabled={faq.order === 1} onClick={() => handleMoveFaq(idx, "up")} className="text-zinc-600 hover:text-white transition disabled:opacity-20 text-[9px]">▲</button>
                          <span>{faq.order}</span>
                          <button disabled={faq.order === faqs.length} onClick={() => handleMoveFaq(idx, "down")} className="text-zinc-600 hover:text-white transition disabled:opacity-20 text-[9px]">▼</button>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-zinc-400">{faq.category}</td>
                      <td className="p-4 font-bold text-white line-clamp-1 cursor-pointer" onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}>{faq.question}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setActiveFaq(faq); setIsFaqOpen(true); }} className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteFaq(faq.id)} className="p-1.5 hover:bg-zinc-900 text-red-500 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Live Accordion Preview */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-500" />
                Interaktīvs Accordion priekšskatījums
              </h4>

              <div className="space-y-2">
                {getFilteredFaqs().map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div key={faq.id} className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20">
                      <button
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="w-full p-4 flex justify-between items-center text-left text-xs font-bold text-white hover:bg-zinc-900/10 transition"
                      >
                        <span>{faq.question}</span>
                        <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                      {isExpanded && (
                        <div className="p-4 border-t border-zinc-850/40 text-xs text-zinc-400 leading-relaxed bg-zinc-950/40 whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SERVICES TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "services" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-zinc-900 rounded-2.5xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-mono">Pakalpojumi: <span className="text-white font-bold">{services.length}</span></span>
              {serviceUndo.length > 0 && (
                <button onClick={() => handleUndo("services")} className="flex items-center gap-1 text-[10px] bg-zinc-900 px-2 py-1 hover:bg-zinc-800 text-zinc-400 rounded-lg">
                  <Undo2 className="w-3 h-3" /> Atcelt ({serviceUndo.length})
                </button>
              )}
            </div>

            <button
              onClick={handleCreateService}
              className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Jauns Pakalpojums
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((item, idx) => (
              <div key={item.id} className="bg-zinc-900/60 border border-zinc-850 rounded-2.5xl p-5 flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-mono">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-yellow-500 font-mono bg-yellow-500/10 px-2.5 py-0.5 rounded-lg">{item.price}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-500 transition">{item.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-850/40 pt-3">
                  <div className="flex items-center gap-1">
                    <button disabled={idx === 0} onClick={() => handleMoveService(idx, "up")} className="p-1 hover:bg-zinc-800 text-zinc-500 rounded disabled:opacity-20 text-[10px]">▲</button>
                    <span className="text-[10px] text-zinc-500 font-mono">{item.order}</span>
                    <button disabled={idx === services.length - 1} onClick={() => handleMoveService(idx, "down")} className="p-1 hover:bg-zinc-800 text-zinc-500 rounded disabled:opacity-20 text-[10px]">▼</button>
                  </div>

                  <div className="flex gap-1">
                    <button onClick={() => { setActiveService(item); setIsServiceOpen(true); }} className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteService(item.id)} className="p-1.5 hover:bg-zinc-800 text-red-500 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PARTNERS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "partners" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-zinc-900 rounded-2.5xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-mono">Logotipi: <span className="text-white font-bold">{partners.length}</span></span>
              {partnerUndo.length > 0 && (
                <button onClick={() => handleUndo("partners")} className="flex items-center gap-1 text-[10px] bg-zinc-900 px-2 py-1 hover:bg-zinc-800 text-zinc-400 rounded-lg">
                  <Undo2 className="w-3 h-3" /> Atcelt ({partnerUndo.length})
                </button>
              )}
            </div>

            <button
              onClick={handleCreatePartner}
              className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Pievienot Logotipu
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {partners.map((partner, idx) => (
              <div key={partner.id} className="bg-zinc-900/60 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between items-center space-y-3 relative group">
                <div className="aspect-[3/2] w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 flex items-center justify-center p-2">
                  {partner.logo ? (
                    <img src={partner.logo} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-700" />
                  )}
                </div>

                <div className="text-center">
                  <h5 className="text-[10px] font-bold text-white truncate max-w-[120px]">{partner.name}</h5>
                  <a href={partner.link} target="_blank" rel="noreferrer" className="text-[9px] text-zinc-500 hover:text-yellow-500 flex items-center justify-center gap-0.5 font-mono">
                    Vietne <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="flex items-center justify-between w-full pt-2 border-t border-zinc-850/40">
                  <div className="flex items-center gap-1">
                    <button disabled={idx === 0} onClick={() => handleMovePartner(idx, "up")} className="text-zinc-600 hover:text-white text-[9px]">▲</button>
                    <button disabled={idx === partners.length - 1} onClick={() => handleMovePartner(idx, "down")} className="text-zinc-600 hover:text-white text-[9px]">▼</button>
                  </div>

                  <div className="flex gap-1">
                    <button onClick={() => { setActivePartner(partner); setIsPartnerOpen(true); }} className="text-zinc-500 hover:text-white p-0.5"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeletePartner(partner.id)} className="text-red-500 hover:text-red-400 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* EDITORS OVERLAY POPUPS */}
      {/* ---------------------------------------------------- */}

      {/* FAQ Editor */}
      {isFaqOpen && activeFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Rediģēt jautājumu</span>
              <button onClick={() => setIsFaqOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Jautājums (Question)</label>
                <input
                  type="text"
                  value={activeFaq.question}
                  onChange={(e) => setActiveFaq({ ...activeFaq, question: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Kategorija</label>
                <input
                  type="text"
                  value={activeFaq.category}
                  onChange={(e) => setActiveFaq({ ...activeFaq, category: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Atbilde (Answer)</label>
                <textarea
                  rows={4}
                  value={activeFaq.answer}
                  onChange={(e) => setActiveFaq({ ...activeFaq, answer: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 flex justify-end gap-3">
              <button onClick={() => setIsFaqOpen(false)} className="px-4 py-2 text-xs font-bold text-zinc-400">Atcelt</button>
              <button onClick={handleSaveFaq} className="px-5 py-2.5 bg-yellow-500 text-zinc-950 font-extrabold text-xs rounded-xl">Saglabāt</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Editor */}
      {isServiceOpen && activeService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Rediģēt pakalpojumu</span>
              <button onClick={() => setIsServiceOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pakalpojuma nosaukums</label>
                  <input
                    type="text"
                    value={activeService.title}
                    onChange={(e) => setActiveService({ ...activeService, title: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pakalpojuma cena</label>
                  <input
                    type="text"
                    value={activeService.price}
                    onChange={(e) => setActiveService({ ...activeService, price: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lucide Ikona</label>
                  <input
                    type="text"
                    value={activeService.icon}
                    onChange={(e) => setActiveService({ ...activeService, icon: e.target.value })}
                    placeholder="Briefcase, Settings, etc..."
                    className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Apraksts</label>
                <textarea
                  rows={4}
                  value={activeService.description}
                  onChange={(e) => setActiveService({ ...activeService, description: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 flex justify-end gap-3">
              <button onClick={() => setIsServiceOpen(false)} className="px-4 py-2 text-xs font-bold text-zinc-400">Atcelt</button>
              <button onClick={handleSaveService} className="px-5 py-2.5 bg-yellow-500 text-zinc-950 font-extrabold text-xs rounded-xl">Saglabāt</button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Editor */}
      {isPartnerOpen && activePartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Rediģēt partneri</span>
              <button onClick={() => setIsPartnerOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Partnera logo (Logo Image)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                    {activePartner.logo ? (
                      <img src={activePartner.logo} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <button
                    onClick={() => setIsMediaOpen(true)}
                    className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 rounded-xl hover:bg-zinc-850"
                  >
                    Izvēlēties no Media
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Zīmola nosaukums</label>
                <input
                  type="text"
                  value={activePartner.name}
                  onChange={(e) => setActivePartner({ ...activePartner, name: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mājaslapas saite (Link URL)</label>
                <input
                  type="text"
                  value={activePartner.link}
                  onChange={(e) => setActivePartner({ ...activePartner, link: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                />
              </div>
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 flex justify-end gap-3">
              <button onClick={() => setIsPartnerOpen(false)} className="px-4 py-2 text-xs font-bold text-zinc-400">Atcelt</button>
              <button onClick={handleSavePartner} className="px-5 py-2.5 bg-yellow-500 text-zinc-950 font-extrabold text-xs rounded-xl">Saglabāt</button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker for Partner Logo */}
      {isMediaOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Izvēlēties partnera logo</span>
              <button onClick={() => setIsMediaOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
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
