import React, { useState, useEffect } from "react";
import {
  Layers,
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
  Link as LinkIcon,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  ChevronUp,
  X
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  newTab: boolean;
  children?: MenuItem[];
}

export interface FooterColumn {
  id: string;
  title: string;
  links: MenuItem[];
}

interface AdminMenuBuilderProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AdminMenuBuilder: React.FC<AdminMenuBuilderProps> = ({ token, showToast }) => {
  const [headerMenu, setHeaderMenu] = useState<MenuItem[]>([]);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([]);
  const [loading, setLoading] = useState(true);

  // Active section tab: Header or Footer
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");

  // Editing state for links
  const [editingMenuItem, setEditingMenuItem] = useState<{
    item: MenuItem;
    parentId?: string; // If nested
    footerColId?: string; // If footer link
  } | null>(null);

  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);

  // Undo histories
  const [undoStack, setUndoStack] = useState<{ header: MenuItem[]; footer: FooterColumn[] }[]>([]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/content-file/menus.json", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.draft || data.original || {};
        setHeaderMenu(content.headerMenu || getFallbackHeaderMenu());
        setFooterColumns(content.footerColumns || getFallbackFooterColumns());
      } else {
        setHeaderMenu(getFallbackHeaderMenu());
        setFooterColumns(getFallbackFooterColumns());
      }
    } catch (err) {
      console.error("Error loading menus:", err);
      setHeaderMenu(getFallbackHeaderMenu());
      setFooterColumns(getFallbackFooterColumns());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackHeaderMenu = (): MenuItem[] => [
    { id: "m-1", label: "Sākums", url: "/", newTab: false },
    { id: "m-2", label: "Par mums", url: "/par-mums", newTab: false },
    {
      id: "m-3",
      label: "Apsaimniekošana",
      url: "/pakalpojumi/apsaimniekosana",
      newTab: false,
      children: [
        { id: "m-3-1", label: "Inženiertīklu apkope", url: "/pakalpojumi/inzeniertikli", newTab: false },
        { id: "m-3-2", label: "Uzkopšanas serviss", url: "/pakalpojumi/uzkopsana", newTab: false }
      ]
    },
    { id: "m-4", label: "Jaunumi", url: "/blogs", newTab: false },
    { id: "m-5", label: "Kontakti", url: "/kontakti", newTab: false }
  ];

  const getFallbackFooterColumns = (): FooterColumn[] => [
    {
      id: "f-col-1",
      title: "Pakalpojumi",
      links: [
        { id: "f-1-1", label: "Apsaimniekošana", url: "/pakalpojumi/apsaimniekosana", newTab: false },
        { id: "f-1-2", label: "Juridiskā palīdzība", url: "/pakalpojumi/juridiskais-atbalsts", newTab: false }
      ]
    },
    {
      id: "f-col-2",
      title: "Uzņēmums",
      links: [
        { id: "f-2-1", label: "Par mums", url: "/par-mums", newTab: false },
        { id: "f-2-2", label: "Kontakti", url: "/kontakti", newTab: false }
      ]
    }
  ];

  const pushUndo = (currentHeader: MenuItem[], currentFooter: FooterColumn[]) => {
    setUndoStack((prev) => [
      ...prev.slice(-9),
      { header: JSON.parse(JSON.stringify(currentHeader)), footer: JSON.parse(JSON.stringify(currentFooter)) }
    ]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((p) => p.slice(0, -1));
    setHeaderMenu(prev.header);
    setFooterColumns(prev.footer);
    saveMenusState(prev.header, prev.footer, true);
    showToast("Darbība tika atcelta!", "info");
  };

  const saveMenusState = async (updatedHeader: MenuItem[], updatedFooter: FooterColumn[], isUndo = false) => {
    try {
      if (!isUndo) {
        pushUndo(headerMenu, footerColumns);
      }
      setHeaderMenu(updatedHeader);
      setFooterColumns(updatedFooter);

      const res = await fetch("/api/cms/content-file/menus.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftContent: {
            headerMenu: updatedHeader,
            footerColumns: updatedFooter
          }
        })
      });
      if (!res.ok) throw new Error("Neizdevās saglabāt izvēlnes");
      if (!isUndo) showToast("Izmaiņas saglabātas melnrakstā", "success");
    } catch (err) {
      console.error(err);
      showToast("Kļūda saglabājot izmaiņas serverī.", "error");
    }
  };

  // Header Link CRUD
  const handleAddHeaderLink = (parentId?: string) => {
    const label = window.prompt("Ievadiet jaunas saites nosaukumu:");
    if (!label) return;

    const newLink: MenuItem = {
      id: "item-" + Date.now(),
      label,
      url: "/",
      newTab: false
    };

    let updatedHeader = [...headerMenu];
    if (parentId) {
      updatedHeader = updatedHeader.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), newLink]
          };
        }
        return item;
      });
    } else {
      updatedHeader.push(newLink);
    }

    saveMenusState(updatedHeader, footerColumns);
  };

  const handleDeleteHeaderLink = (id: string, parentId?: string) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo saiti?")) return;
    let updatedHeader = [...headerMenu];
    if (parentId) {
      updatedHeader = updatedHeader.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            children: (item.children || []).filter((child) => child.id !== id)
          };
        }
        return item;
      });
    } else {
      updatedHeader = updatedHeader.filter((item) => item.id !== id);
    }
    saveMenusState(updatedHeader, footerColumns);
  };

  const handleMoveHeaderLink = (idx: number, direction: "up" | "down", parentId?: string) => {
    let updatedHeader = [...headerMenu];
    if (parentId) {
      updatedHeader = updatedHeader.map((item) => {
        if (item.id === parentId && item.children) {
          const list = [...item.children];
          const target = direction === "up" ? idx - 1 : idx + 1;
          if (target >= 0 && target < list.length) {
            const temp = list[idx];
            list[idx] = list[target];
            list[target] = temp;
          }
          return { ...item, children: list };
        }
        return item;
      });
    } else {
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target >= 0 && target < updatedHeader.length) {
        const temp = updatedHeader[idx];
        updatedHeader[idx] = updatedHeader[target];
        updatedHeader[target] = temp;
      }
    }
    saveMenusState(updatedHeader, footerColumns);
  };

  // Footer Link CRUD
  const handleAddFooterColumn = () => {
    const title = window.prompt("Ievadiet jaunas kolonnas nosaukumu:");
    if (!title) return;

    const newCol: FooterColumn = {
      id: "col-" + Date.now(),
      title,
      links: []
    };
    saveMenusState(headerMenu, [...footerColumns, newCol]);
  };

  const handleDeleteFooterCol = (id: string) => {
    if (!window.confirm("Dzēst kolonnu ar visām saitēm?")) return;
    saveMenusState(headerMenu, footerColumns.filter((col) => col.id !== id));
  };

  const handleAddFooterLink = (colId: string) => {
    const label = window.prompt("Saites nosaukums:");
    if (!label) return;

    const newLink: MenuItem = {
      id: "link-" + Date.now(),
      label,
      url: "/",
      newTab: false
    };

    const updatedFooter = footerColumns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          links: [...col.links, newLink]
        };
      }
      return col;
    });

    saveMenusState(headerMenu, updatedFooter);
  };

  const handleDeleteFooterLink = (colId: string, linkId: string) => {
    const updatedFooter = footerColumns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          links: col.links.filter((l) => l.id !== linkId)
        };
      }
      return col;
    });
    saveMenusState(headerMenu, updatedFooter);
  };

  const handleMoveFooterCol = (idx: number, direction: "left" | "right") => {
    const target = direction === "left" ? idx - 1 : idx + 1;
    if (target < 0 || target >= footerColumns.length) return;
    const updated = [...footerColumns];
    const temp = updated[idx];
    updated[idx] = updated[target];
    updated[target] = temp;
    saveMenusState(headerMenu, updated);
  };

  const handleSaveLinkEdit = () => {
    if (!editingMenuItem) return;
    const { item, parentId, footerColId } = editingMenuItem;

    if (footerColId) {
      // Edit footer item
      const updatedFooter = footerColumns.map((col) => {
        if (col.id === footerColId) {
          return {
            ...col,
            links: col.links.map((l) => (l.id === item.id ? item : l))
          };
        }
        return col;
      });
      saveMenusState(headerMenu, updatedFooter);
    } else {
      // Edit header item
      let updatedHeader = [...headerMenu];
      if (parentId) {
        updatedHeader = updatedHeader.map((m) => {
          if (m.id === parentId && m.children) {
            return {
              ...m,
              children: m.children.map((c) => (c.id === item.id ? item : c))
            };
          }
          return m;
        });
      } else {
        updatedHeader = updatedHeader.map((m) => (m.id === item.id ? item : m));
      }
      saveMenusState(updatedHeader, footerColumns);
    }

    setIsLinkEditorOpen(false);
    setEditingMenuItem(null);
  };

  // Import / Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ headerMenu, footerColumns }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "navigation_menus.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Eksports sekmīgs!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex border-b border-zinc-900 justify-between items-center bg-zinc-950/40 p-3 rounded-2.5xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("header")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "header" ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
            }`}
          >
            Galvenā Augšas Izvēlne
          </button>
          <button
            onClick={() => setActiveTab("footer")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "footer" ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
            }`}
          >
            Mājaslapas Kājenes (Footer) Saites
          </button>
        </div>

        <div className="flex items-center gap-2">
          {undoStack.length > 0 && (
            <button
              onClick={handleUndo}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Undo2 className="w-3.5 h-3.5" /> Atgriezt ({undoStack.length})
            </button>
          )}
          <button
            onClick={handleExportJSON}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
            title="Eksportēt izvēlnes uz JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HEADER BUILDER PANEL */}
      {activeTab === "header" && (
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Augšējā navigācijas izvēlne</h3>
              <p className="text-[11px] text-zinc-500">Sakārtojiet un veidojiet līdz divu līmeņu mājaslapas galvenās saites.</p>
            </div>
            <button
              onClick={() => handleAddHeaderLink()}
              className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Pievienot Sākuma Saitu
            </button>
          </div>

          <div className="space-y-3 max-w-2xl">
            {headerMenu.map((item, idx) => (
              <div key={item.id} className="space-y-2">
                {/* Main first level Link block */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-2xl group hover:border-zinc-800 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-400">
                      <LinkIcon className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {item.label}
                        {item.newTab && (
                          <span className="text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded uppercase">Jauns Logs</span>
                        )}
                      </h4>
                      <span className="text-[10px] text-zinc-500 font-mono">{item.url}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button disabled={idx === 0} onClick={() => handleMoveHeaderLink(idx, "up")} className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-white disabled:opacity-20 text-[10px]">▲</button>
                    <button disabled={idx === headerMenu.length - 1} onClick={() => handleMoveHeaderLink(idx, "down")} className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-white disabled:opacity-20 text-[10px]">▼</button>
                    
                    <button
                      onClick={() => handleAddHeaderLink(item.id)}
                      className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[10px] font-bold"
                      title="Pievienot apakšsaiti"
                    >
                      + Apakšsaite
                    </button>

                    <button
                      onClick={() => {
                        setEditingMenuItem({ item });
                        setIsLinkEditorOpen(true);
                      }}
                      className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHeaderLink(item.id)}
                      className="p-1.5 hover:bg-zinc-900 text-red-500 hover:text-red-400 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-children second level Link list block */}
                {item.children && item.children.length > 0 && (
                  <div className="pl-12 space-y-2 border-l border-zinc-900 ml-4">
                    {item.children.map((child, childIdx) => (
                      <div key={child.id} className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-zinc-900 rounded-xl group hover:border-zinc-800 transition">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                          <div>
                            <h5 className="text-[11px] font-bold text-zinc-200">{child.label}</h5>
                            <span className="text-[9px] text-zinc-500 font-mono">{child.url}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button disabled={childIdx === 0} onClick={() => handleMoveHeaderLink(childIdx, "up", item.id)} className="p-0.5 text-[9px] text-zinc-500 hover:text-white">▲</button>
                          <button disabled={childIdx === item.children!.length - 1} onClick={() => handleMoveHeaderLink(childIdx, "down", item.id)} className="p-0.5 text-[9px] text-zinc-500 hover:text-white">▼</button>
                          
                          <button
                            onClick={() => {
                              setEditingMenuItem({ item: child, parentId: item.id });
                              setIsLinkEditorOpen(true);
                            }}
                            className="p-1 hover:bg-zinc-900 text-zinc-400 rounded"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteHeaderLink(child.id, item.id)}
                            className="p-1 hover:bg-zinc-900 text-red-500 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER BUILDER PANEL */}
      {activeTab === "footer" && (
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Kājenes (Footer) struktūra</h3>
              <p className="text-[11px] text-zinc-500">Pārvaldiet saišu kolonnas mājaslapas apakšā.</p>
            </div>
            <button
              onClick={handleAddFooterColumn}
              className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Jauna Kolonna
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {footerColumns.map((col, colIdx) => (
              <div key={col.id} className="bg-zinc-950/40 border border-zinc-850 rounded-2.5xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{col.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button disabled={colIdx === 0} onClick={() => handleMoveFooterCol(colIdx, "left")} className="text-zinc-500 hover:text-white text-[10px]">◀</button>
                    <button disabled={colIdx === footerColumns.length - 1} onClick={() => handleMoveFooterCol(colIdx, "right")} className="text-zinc-500 hover:text-white text-[10px]">▶</button>
                    <button
                      onClick={() => {
                        const newTitle = window.prompt("Mainīt kolonnas nosaukumu:", col.title);
                        if (newTitle) {
                          const updated = footerColumns.map((c) => (c.id === col.id ? { ...c, title: newTitle } : c));
                          saveMenusState(headerMenu, updated);
                        }
                      }}
                      className="p-1 hover:bg-zinc-900 text-zinc-400 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFooterCol(col.id)}
                      className="p-1 hover:bg-zinc-900 text-red-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {col.links.map((link) => (
                    <div key={link.id} className="flex justify-between items-center p-2 bg-zinc-900/40 rounded-xl border border-zinc-900">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-200">{link.label}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{link.url}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingMenuItem({ item: link, footerColId: col.id });
                            setIsLinkEditorOpen(true);
                          }}
                          className="p-1 hover:bg-zinc-900 text-zinc-400 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteFooterLink(col.id, link.id)}
                          className="p-1 hover:bg-zinc-900 text-red-500 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddFooterLink(col.id)}
                    className="w-full py-2 bg-zinc-950/40 border border-zinc-850 border-dashed rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-white hover:bg-zinc-900/10 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Pievienot saiti
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT MENU LINK POPUP DIALOG */}
      {isLinkEditorOpen && editingMenuItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Rediģēt saiti</span>
              <button onClick={() => setIsLinkEditorOpen(false)} className="p-1.5 hover:bg-zinc-900 text-zinc-400 rounded-lg"><X className="w-4.5 h-4.5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Saites nosaukums (Label)</label>
                <input
                  type="text"
                  value={editingMenuItem.item.label}
                  onChange={(e) =>
                    setEditingMenuItem({
                      ...editingMenuItem,
                      item: { ...editingMenuItem.item, label: e.target.value }
                    })
                  }
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mērķa URL / Ceļš (URL)</label>
                <input
                  type="text"
                  value={editingMenuItem.item.url}
                  onChange={(e) =>
                    setEditingMenuItem({
                      ...editingMenuItem,
                      item: { ...editingMenuItem.item, url: e.target.value }
                    })
                  }
                  className="w-full bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-100 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-newtab"
                  checked={editingMenuItem.item.newTab}
                  onChange={(e) =>
                    setEditingMenuItem({
                      ...editingMenuItem,
                      item: { ...editingMenuItem.item, newTab: e.target.checked }
                    })
                  }
                  className="rounded border-zinc-800 text-yellow-500 bg-zinc-950 w-4 h-4 cursor-pointer focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="chk-newtab" className="text-xs text-zinc-300 font-bold cursor-pointer select-none">
                  Atvērt jaunā pārlūka cilnē (target="_blank")
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/80 flex justify-end gap-3">
              <button onClick={() => setIsLinkEditorOpen(false)} className="px-4 py-2 text-xs font-bold text-zinc-400">Atcelt</button>
              <button onClick={handleSaveLinkEdit} className="px-5 py-2.5 bg-yellow-500 text-zinc-950 font-extrabold text-xs rounded-xl">Saglabāt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
