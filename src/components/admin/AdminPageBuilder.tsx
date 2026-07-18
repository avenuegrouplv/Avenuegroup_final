import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  RotateCcw,
  RotateCw,
  Save,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Settings,
  Image as ImageIcon,
  Link,
  Type,
  Video,
  Grid,
  MapPin,
  HelpCircle,
  FileText,
  DollarSign,
  Heart,
  Briefcase,
  Users,
  Clock,
  MessageSquare,
  ExternalLink,
  ChevronUp,
  Columns as ColumnsIcon,
  Code,
  Layout,
  Maximize,
  Maximize2,
  X,
  Play,
  Download,
  Info
} from "lucide-react";
import { AdminMedia } from "./AdminMedia";

// Interface declarations
export interface BlockConfig {
  id: string;
  type: string;
  name: string;
  // Responsive display toggles
  showOnDesktop: boolean;
  showOnTablet: boolean;
  showOnMobile: boolean;
  
  // Settings/Content map
  settings: Record<string, any>;
}

export interface SectionConfig {
  id: string;
  name: string;
  backgroundType: "color" | "image" | "video";
  backgroundColor: string;
  backgroundImage: string;
  backgroundVideo: string;
  paddingY: "none" | "small" | "medium" | "large" | "custom";
  paddingTopCustom?: string;
  paddingBottomCustom?: string;
  marginY: "none" | "small" | "medium" | "large";
  containerWidth: "narrow" | "default" | "wide" | "full";
  columnsCount: number;
  blocks: BlockConfig[];
}

interface AdminPageBuilderProps {
  token: string;
  page: {
    slug: string;
    title: string;
    blocks?: any[];
  };
  onSave: (blocks: any[]) => void;
  onClose: () => void;
}

export const AdminPageBuilder: React.FC<AdminPageBuilderProps> = ({
  token,
  page,
  onSave,
  onClose
}) => {
  // --- States ---
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  // Interactive Viewports
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  // Sidebar config tab
  const [activeTab, setActiveTab] = useState<"content" | "style" | "responsive">("content");
  
  // Media library integration helper
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    sectionId?: string;
    blockId?: string;
    settingKey: string;
    isMulti?: boolean;
  } | null>(null);

  // Block Templates
  const [savedTemplates, setSavedTemplates] = useState<{ id: string; name: string; block: BlockConfig }[]>([]);

  // Undo / Redo system
  const [history, setHistory] = useState<SectionConfig[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Autosave Draft feedback
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Rich text styling helper in Text / Rich Text blocks
  const [textSelection, setTextSelection] = useState({ start: 0, end: 0 });

  // Accordion open states in editors
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    text: true,
    general: true
  });

  // Load block templates from localStorage
  useEffect(() => {
    const templates = localStorage.getItem("cms_block_templates");
    if (templates) {
      try {
        setSavedTemplates(JSON.parse(templates));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Initialize Page sections
  useEffect(() => {
    if (page.blocks && page.blocks.length > 0) {
      // If flat blocks, convert to section-based layout automatically
      const converted: SectionConfig[] = [
        {
          id: "sec_initial",
          name: "Galvenā Sekcija",
          backgroundType: "color",
          backgroundColor: "#00000000",
          backgroundImage: "",
          backgroundVideo: "",
          paddingY: "medium",
          marginY: "none",
          containerWidth: "default",
          columnsCount: 1,
          blocks: page.blocks.map((b: any, index: number) => ({
            id: b.id || `block_${Date.now()}_${index}`,
            type: b.type || "text",
            name: getBlockFriendlyName(b.type),
            showOnDesktop: b.showOnDesktop !== false,
            showOnTablet: b.showOnTablet !== false,
            showOnMobile: b.showOnMobile !== false,
            settings: b.settings || b // fallback to flat structure
          }))
        }
      ];
      setSections(converted);
      pushHistory(converted);
    } else {
      // Default initial layout
      const initial: SectionConfig[] = [
        {
          id: "sec_hero",
          name: "Sākuma baneris",
          backgroundType: "color",
          backgroundColor: "#070708",
          backgroundImage: "",
          backgroundVideo: "",
          paddingY: "none",
          marginY: "none",
          containerWidth: "full",
          columnsCount: 1,
          blocks: [
            {
              id: "b_hero_1",
              type: "hero",
              name: "Hero Baneris",
              showOnDesktop: true,
              showOnTablet: true,
              showOnMobile: true,
              settings: {
                title: "Profesionāla Īpašumu Apsaimniekošana",
                subtitle: "Uzticiet sava nekustamā īpašuma ikdienas rūpes Avenue Group ekspertiem.",
                buttonText: "Sazināties ar mums",
                buttonLink: "/kontakti",
                bgImage: "",
                height: "600px",
                alignment: "center",
                textColor: "#ffffff",
                overlayOpacity: 0.4,
                padding: "80px",
                margin: "0px",
                borderRadius: "0px",
                animation: "fade-in"
              }
            }
          ]
        },
        {
          id: "sec_content",
          name: "Satura Sekcija",
          backgroundType: "color",
          backgroundColor: "transparent",
          backgroundImage: "",
          backgroundVideo: "",
          paddingY: "medium",
          marginY: "none",
          containerWidth: "default",
          columnsCount: 1,
          blocks: [
            {
              id: "b_text_1",
              type: "text",
              name: "Rich Text Saturs",
              showOnDesktop: true,
              showOnTablet: true,
              showOnMobile: true,
              settings: {
                content: "<h2>Mūsu misija ir sniegt augstākās klases servisu</h2><p>Mēs Avenue Group nodrošinām pilna cikla komercīpašumu un dzīvojamo māju apsaimniekošanu, inženiertehnisko sistēmu uzturēšanu un avārijas dienestu atbalstu 24/7.</p><ul><li>Inženiertehniskie risinājumi un sistēmu auditi</li><li>Profesionāla telpu un teritoriju uzkopšana</li><li>Finanšu vadība un juridiskais atbalsts</li></ul>",
                textColor: "#d4d4d8",
                fontSize: "16px",
                padding: "20px"
              }
            }
          ]
        }
      ];
      setSections(initial);
      pushHistory(initial);
    }
  }, [page]);

  // --- History (Undo/Redo) Core ---
  const pushHistory = (newSections: SectionConfig[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, JSON.parse(JSON.stringify(newSections))]);
    setHistoryIndex(nextHistory.length);
    setAutosaveStatus("unsaved");
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setSections(JSON.parse(JSON.stringify(history[prevIndex])));
      setAutosaveStatus("unsaved");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setSections(JSON.parse(JSON.stringify(history[nextIndex])));
      setAutosaveStatus("unsaved");
    }
  };

  // --- Autosave effect ---
  useEffect(() => {
    if (autosaveStatus === "unsaved") {
      setAutosaveStatus("saving");
      const timer = setTimeout(() => {
        // Save current sections layout as draft content
        onSave(sections);
        setAutosaveStatus("saved");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sections, autosaveStatus]);

  // --- Helpers & Visual Config mappings ---
  function getBlockFriendlyName(type: string): string {
    const names: Record<string, string> = {
      hero: "Hero baneris",
      text: "Vienkāršs teksts",
      richtext: "Rich Text redaktors",
      image: "Attēla bloks",
      gallery: "Galerijas bloks",
      slider: "Attēlu karuselis",
      video: "Video atskaņotājs",
      faq: "Biežāk uzdotie jautājumi (FAQ)",
      testimonials: "Atsauksmju bloks",
      pricing: "Cenu tabulas",
      services: "Pakalpojumu bloks",
      features: "Priekšrocību režģis",
      partners: "Partneru logo",
      cards: "Informatīvās kartītes",
      team: "Komandas biedri",
      timeline: "Laika līnija",
      statistics: "Statistikas skaitļi",
      cta: "Aicinājums rīkoties (CTA)",
      map: "Google karte",
      contact: "Kontaktu forma",
      accordion: "Akordeons",
      tabs: "Satura cilnes (Tabs)",
      columns: "Vairākas kolonnas",
      spacer: "Atstarpe (Spacer)",
      divider: "Atdalītājsvītra",
      buttons: "Pogu grupa",
      icons: "Ikonu tīkls",
      banner: "Reklāmas baneris",
      quote: "Citāts",
      html: "Pielāgots HTML kods",
      custom: "Pielāgots bloks"
    };
    return names[type] || "Pielāgots bloks";
  }

  // Generate initial settings based on block type
  const getInitialBlockSettings = (type: string): Record<string, any> => {
    const defaults: Record<string, Record<string, any>> = {
      hero: {
        title: "Jauns Virsraksts",
        subtitle: "Apakšvirsraksta teksts šeit",
        buttonText: "Uzzināt vairāk",
        buttonLink: "#",
        bgImage: "",
        mobileBgImage: "",
        videoBg: "",
        height: "500px",
        alignment: "center",
        textColor: "#ffffff",
        overlayOpacity: 0.5,
        padding: "40px",
        margin: "0px",
        borderRadius: "0px"
      },
      text: {
        content: "<p>Šeit varat rakstīt un formatēt jebkuru tekstu.</p>",
        textColor: "#d4d4d8",
        fontSize: "16px",
        padding: "15px",
        margin: "0px"
      },
      richtext: {
        content: "<h3>Profesionāli pakalpojumi</h3><p>Mēs piedāvājam labāko risinājumu Jūsu biznesam.</p>",
        textColor: "#fafafa",
        padding: "20px"
      },
      image: {
        imageUrl: "",
        width: "100%",
        altText: "Attēla apraksts",
        caption: "Paraksts zem attēla",
        linkUrl: "",
        crop: "none",
        position: "center",
        borderRadius: "12px",
        padding: "10px"
      },
      gallery: {
        images: [],
        layout: "grid", // grid, masonry, slider, lightbox
        columns: 3,
        spacing: "16px",
        borderRadius: "8px"
      },
      slider: {
        images: [],
        autoplay: true,
        interval: 4000,
        showArrows: true,
        showDots: true
      },
      video: {
        videoUrl: "",
        aspectRatio: "16:9",
        autoplay: false,
        loop: false,
        controls: true,
        thumbnail: ""
      },
      faq: {
        items: [
          { q: "Cik ātri reaģē avārijas dienests?", a: "Mūsu avārijas brigāde Rīgā un tās apkārtnē ierodas 30-40 minūšu laikā no pieteikuma saņemšanas." },
          { q: "Kādas ir apsaimniekošanas izmaksas?", a: "Tās tiek aprēķinātas individuāli pēc objekta platības un nepieciešamajiem pakalpojumiem." }
        ],
        textColor: "#e4e4e7",
        layout: "accordion"
      },
      testimonials: {
        items: [
          { author: "Jānis Bērziņš", company: "Rīgas Ofisi SIA", text: "Izcila atsaucība un augsta atbildības sajūta no Avenue Group puses jau 3 gadus.", rating: 5 },
          { author: "Kristīne Kalniņa", company: "Privātmājas īpašniece", text: "Komunālo sistēmu remonts tika veikts ātri un kvalitatīvi. Paldies meistaram!", rating: 5 }
        ],
        style: "cards"
      },
      pricing: {
        plans: [
          { name: "Standarta", price: "0.45 €/m²", features: ["Teritorijas uzkopšana", "Zāles pļaušana", "24/7 dispečerdienests"], popular: false },
          { name: "Premium", price: "0.85 €/m²", features: ["Viss Standarta pakotnē", "Inženiersistēmu apkope", "Juridiskais atbalsts"], popular: true }
        ]
      },
      services: {
        items: [
          { title: "Inženiertehniskā apkope", desc: "Siltummezglu, ventilācijas un elektroapgādes regulāra apkope.", icon: "Briefcase" },
          { title: "Teritoriju uzkopšana", desc: "Ikdienas uzkopšana, sniega tīrīšana un apzaļumošanas darbi.", icon: "Check" }
        ],
        columns: 2
      },
      features: {
        items: [
          { title: "24/7 Atbalsts", desc: "Dispečerdienests un avārijas brigādes strādā bez brīvdienām." },
          { title: "Pieredze", desc: "Vairāk kā 10 gadu sekmīgs darbs nekustamo īpašumu sfērā." }
        ]
      },
      partners: {
        logos: [],
        height: "60px",
        animation: "slide"
      },
      cards: {
        items: [
          { title: "Energoefektivitāte", desc: "Samaziniet apkures rēķinus līdz pat 30% ar mūsu risinājumiem.", image: "", link: "#" }
        ]
      },
      team: {
        members: [
          { name: "Māris Ozols", role: "Vadošais inženieris", photo: "" }
        ]
      },
      timeline: {
        events: [
          { year: "2016", title: "Uzņēmuma dibināšana", desc: "Sākām ar 3 objektu apsaimniekošanu." },
          { year: "2026", title: "Līderi tirgū", desc: "Pārsniegta 500,000 m² apsaimniekotā platība." }
        ]
      },
      statistics: {
        stats: [
          { number: "150+", label: "Apsaimniekotie objekti" },
          { number: "24/7", label: "Avārijas atbalsts" }
        ]
      },
      cta: {
        title: "Vai esat gatavi optimizēt sava īpašuma tēriņus?",
        desc: "Sazinieties ar mūsu menedžeri, lai saņemtu bezmaksas konsultāciju un tāmi.",
        buttonText: "Pieteikt tāmi",
        buttonLink: "/kontakti",
        bgColor: "#18181b"
      },
      map: {
        address: "Rīga, Latvija",
        zoom: 13,
        markerTitle: "Avenue Group Galvenais Birojs"
      },
      contact: {
        title: "Sūtīt ziņojumu",
        emailRecipient: "info@avenuegroup.lv",
        showPhoneField: true
      },
      accordion: {
        items: [
          { title: "Juridiskais pamats", content: "Visi darbi tiek veikti saskaņā ar spēkā esošo likumdošanu." }
        ]
      },
      tabs: {
        items: [
          { label: "Privātīpašumi", content: "Apkope, uzkopšana un apsaimniekošana privātmājām." },
          { label: "Komercīpašumi", content: "Biroju centru, noliktavu un loģistikas parku uzturēšana." }
        ]
      },
      columns: {
        colWidths: ["1/2", "1/2"],
        spacing: "20px"
      },
      spacer: {
        height: "40px"
      },
      divider: {
        thickness: "1px",
        color: "#27272a",
        style: "solid"
      },
      buttons: {
        items: [
          { label: "Pirmā Poga", url: "#", primary: true },
          { label: "Otrā Poga", url: "#", primary: false }
        ]
      },
      icons: {
        items: [
          { name: "Heart", label: "Uzticamība" },
          { name: "Users", label: "Saziņa" }
        ]
      },
      banner: {
        title: "Karstais piedāvājums!",
        desc: "Jaunajiem klientiem pirmie 2 mēneši bez maksas.",
        badge: "Akcija"
      },
      quote: {
        text: "Kvalitāte nav nejaušība. Tas vienmēr ir inteliģentu pūļu rezultāts.",
        author: "John Ruskin"
      },
      html: {
        code: "<!-- Pievienojiet savu HTML kodu šeit -->\n<div class='p-4 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20'>\n  Sveika, pasaule!\n</div>"
      },
      custom: {
        markup: "<div class='text-center'>Pielāgots vizuālais saturs</div>"
      }
    };

    return defaults[type] || { content: "Jauns bloks" };
  };

  // --- Block Actions ---
  const handleAddBlock = (sectionId: string, type: string) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        const newBlock: BlockConfig = {
          id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type,
          name: getBlockFriendlyName(type),
          showOnDesktop: true,
          showOnTablet: true,
          showOnMobile: true,
          settings: getInitialBlockSettings(type)
        };
        return {
          ...sec,
          blocks: [...sec.blocks, newBlock]
        };
      }
      return sec;
    });
    setSections(updated);
    pushHistory(updated);
  };

  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          blocks: sec.blocks.filter(b => b.id !== blockId)
        };
      }
      return sec;
    });
    setSections(updated);
    pushHistory(updated);
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const handleDuplicateBlock = (sectionId: string, block: BlockConfig) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        const duplicated: BlockConfig = {
          ...JSON.parse(JSON.stringify(block)),
          id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        };
        const idx = sec.blocks.findIndex(b => b.id === block.id);
        const newBlocks = [...sec.blocks];
        newBlocks.splice(idx + 1, 0, duplicated);
        return {
          ...sec,
          blocks: newBlocks
        };
      }
      return sec;
    });
    setSections(updated);
    pushHistory(updated);
  };

  const handleMoveBlock = (sectionId: string, blockId: string, direction: "up" | "down") => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        const idx = sec.blocks.findIndex(b => b.id === blockId);
        if (direction === "up" && idx > 0) {
          const newBlocks = [...sec.blocks];
          const temp = newBlocks[idx];
          newBlocks[idx] = newBlocks[idx - 1];
          newBlocks[idx - 1] = temp;
          return { ...sec, blocks: newBlocks };
        }
        if (direction === "down" && idx < sec.blocks.length - 1) {
          const newBlocks = [...sec.blocks];
          const temp = newBlocks[idx];
          newBlocks[idx] = newBlocks[idx + 1];
          newBlocks[idx + 1] = temp;
          return { ...sec, blocks: newBlocks };
        }
      }
      return sec;
    });
    setSections(updated);
    pushHistory(updated);
  };

  // --- Section Actions ---
  const handleAddSection = () => {
    const newSec: SectionConfig = {
      id: `sec_${Date.now()}`,
      name: `Jauna Sekcija ${sections.length + 1}`,
      backgroundType: "color",
      backgroundColor: "transparent",
      backgroundImage: "",
      backgroundVideo: "",
      paddingY: "medium",
      marginY: "none",
      containerWidth: "default",
      columnsCount: 1,
      blocks: []
    };
    const updated = [...sections, newSec];
    setSections(updated);
    pushHistory(updated);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length === 1) return; // Prevent deleting the last section
    const updated = sections.filter(sec => sec.id !== sectionId);
    setSections(updated);
    pushHistory(updated);
    if (activeSectionId === sectionId) setActiveSectionId(null);
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (direction === "up" && idx > 0) {
      const updated = [...sections];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      setSections(updated);
      pushHistory(updated);
    }
    if (direction === "down" && idx < sections.length - 1) {
      const updated = [...sections];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      setSections(updated);
      pushHistory(updated);
    }
  };

  // --- Template Saving ---
  const handleSaveAsTemplate = (block: BlockConfig) => {
    const name = window.prompt("Ievadiet šablona nosaukumu:", `${block.name} Šablons`);
    if (!name) return;

    const newTemplate = {
      id: `tmpl_${Date.now()}`,
      name,
      block: JSON.parse(JSON.stringify(block))
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem("cms_block_templates", JSON.stringify(updated));
  };

  const handleLoadTemplate = (sectionId: string, template: BlockConfig) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        const restored: BlockConfig = {
          ...JSON.parse(JSON.stringify(template)),
          id: `b_${Date.now()}`
        };
        return {
          ...sec,
          blocks: [...sec.blocks, restored]
        };
      }
      return sec;
    });
    setSections(updated);
    pushHistory(updated);
  };

  // --- Setting updates ---
  const handleUpdateBlockSetting = (settingKey: string, val: any) => {
    if (!activeBlockId) return;
    const updated = sections.map(sec => {
      return {
        ...sec,
        blocks: sec.blocks.map(b => {
          if (b.id === activeBlockId) {
            return {
              ...b,
              settings: {
                ...b.settings,
                [settingKey]: val
              }
            };
          }
          return b;
        })
      };
    });
    setSections(updated);
    // Silent autosave, don't flood history with every keypress on inputs
    // but trigger save state
    setAutosaveStatus("unsaved");
  };

  const handleUpdateBlockResponsive = (key: "showOnDesktop" | "showOnTablet" | "showOnMobile", val: boolean) => {
    if (!activeBlockId) return;
    const updated = sections.map(sec => {
      return {
        ...sec,
        blocks: sec.blocks.map(b => {
          if (b.id === activeBlockId) {
            return {
              ...b,
              [key]: val
            };
          }
          return b;
        })
      };
    });
    setSections(updated);
    pushHistory(updated);
  };

  const handleUpdateSectionSetting = (sectionId: string, key: string, val: any) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          [key]: val
        };
      }
      return sec;
    });
    setSections(updated);
    setAutosaveStatus("unsaved");
  };

  // --- Visual Rich Text format trigger ---
  const handleRichTextCommand = (command: string) => {
    if (!activeBlockId) return;
    const block = sections.flatMap(s => s.blocks).find(b => b.id === activeBlockId);
    if (!block) return;

    let currentText = block.settings.content || "";
    let formatted = currentText;

    // Direct simple replacement wrappers
    if (command === "bold") {
      formatted = `<strong>${currentText}</strong>`;
    } else if (command === "italic") {
      formatted = `<em>${currentText}</em>`;
    } else if (command === "underline") {
      formatted = `<u>${currentText}</u>`;
    } else if (command === "h2") {
      formatted = `<h2>${currentText}</h2>`;
    } else if (command === "p") {
      formatted = `<p>${currentText}</p>`;
    } else if (command === "bullet") {
      formatted = `<ul><li>Saraksta punkts 1</li><li>Saraksta punkts 2</li></ul>`;
    } else if (command === "quote") {
      formatted = `<blockquote>${currentText || "Citāts šeit..."}</blockquote>`;
    } else if (command === "emoji") {
      formatted = currentText + " ✨";
    }

    handleUpdateBlockSetting("content", formatted);
  };

  // --- Media Library Picker Select ---
  const handleMediaSelected = (url: string) => {
    if (!mediaPickerTarget) return;
    const { blockId, sectionId, settingKey, isMulti } = mediaPickerTarget;

    if (blockId) {
      if (isMulti) {
        // Multi images galleries
        const block = sections.flatMap(s => s.blocks).find(b => b.id === blockId);
        const currentImages = block?.settings[settingKey] || [];
        handleUpdateBlockSetting(settingKey, [...currentImages, { image: url, caption: "Jauns attēls" }]);
      } else {
        handleUpdateBlockSetting(settingKey, url);
      }
    } else if (sectionId) {
      handleUpdateSectionSetting(sectionId, settingKey, url);
    }
    setMediaPickerTarget(null);
  };

  // --- Find active block details safely ---
  const getActiveBlock = (): BlockConfig | null => {
    if (!activeBlockId) return null;
    for (const sec of sections) {
      const found = sec.blocks.find(b => b.id === activeBlockId);
      if (found) return found;
    }
    return null;
  };

  const getActiveSection = (): SectionConfig | null => {
    if (!activeSectionId) return null;
    return sections.find(s => s.id === activeSectionId) || null;
  };

  return (
    <div className="fixed inset-0 bg-[#070708] z-50 flex flex-col font-sans text-zinc-200">
      
      {/* --- TOP BAR --- */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 relative z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition border border-transparent hover:border-zinc-850"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded uppercase">
                Page Builder
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">Lapā: {page.title}</span>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none mt-1">Vizuālais lapu redaktors</h1>
          </div>
        </div>

        {/* Viewport resizing handles */}
        <div className="hidden md:flex bg-zinc-900 border border-zinc-850 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setViewport("desktop")}
            className={`p-2 rounded-xl transition ${
              viewport === "desktop" ? "bg-zinc-800 text-yellow-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Datora skats"
          >
            <Monitor className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`p-2 rounded-xl transition ${
              viewport === "tablet" ? "bg-zinc-800 text-yellow-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Planšetes skats"
          >
            <TabletIcon className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`p-2 rounded-xl transition ${
              viewport === "mobile" ? "bg-zinc-800 text-yellow-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Mobilā tālruņa skats"
          >
            <Smartphone className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${autosaveStatus === "saved" ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"}`} />
            {autosaveStatus === "saved" ? "Drafts saglabāts" : "Saglabā..."}
          </div>

          <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-xl">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg transition"
              title="Atpakaļ (Undo)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg transition"
              title="Uz priekšu (Redo)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onSave(sections);
              onClose();
            }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-black text-xs px-4.5 py-2.5 rounded-xl transition active:scale-95 shadow-lg shadow-yellow-500/10"
          >
            <Save className="w-4 h-4" />
            Pabeigt un saglabāt
          </button>
        </div>
      </header>

      {/* --- MAIN INTERACTIVE WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR: Block Adder & Sections Structure --- */}
        <div className="w-80 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between shrink-0">
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-6">
            
            {/* Sections control */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-yellow-500" />
                  Sekcijas un kolonas
                </span>
                <button
                  onClick={handleAddSection}
                  className="flex items-center gap-1 text-[11px] text-yellow-500 hover:text-yellow-400 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Pievienot
                </button>
              </div>

              {/* Sections list */}
              <div className="space-y-2">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      setActiveBlockId(null);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all ${
                      activeSectionId === sec.id && !activeBlockId
                        ? "bg-yellow-500/5 border-yellow-500 text-yellow-500 font-bold"
                        : "bg-zinc-900/40 border-zinc-850 text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate flex items-center gap-1.5">
                        <Layout className="w-3.5 h-3.5 shrink-0" />
                        {sec.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition" onClick={e => e.stopPropagation()}>
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(sec.id, "up")}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(sec.id, "down")}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1 hover:bg-red-950/40 text-zinc-600 hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-blocks in section */}
                    <div className="mt-2 space-y-1">
                      {sec.blocks.map(b => (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBlockId(b.id);
                            setActiveSectionId(sec.id);
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition ${
                            activeBlockId === b.id
                              ? "bg-yellow-500 text-zinc-950 font-black"
                              : "bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(sec.id, b.id);
                            }}
                            className={`p-0.5 rounded transition ${
                              activeBlockId === b.id ? "hover:bg-yellow-600 text-zinc-950" : "hover:bg-red-950/40 hover:text-red-400 text-zinc-600"
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Block Adder library list */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                Vizuālo bloku bibliotēka
              </span>

              <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                {[
                  { type: "hero", name: "Hero Baneris", icon: <Layers className="w-4 h-4" /> },
                  { type: "text", name: "Teksta bloks", icon: <Type className="w-4 h-4" /> },
                  { type: "image", name: "Attēla bloks", icon: <ImageIcon className="w-4 h-4" /> },
                  { type: "gallery", name: "Galerija", icon: <Grid className="w-4 h-4" /> },
                  { type: "video", name: "Video", icon: <Video className="w-4 h-4" /> },
                  { type: "faq", name: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
                  { type: "testimonials", name: "Atsauksmes", icon: <MessageSquare className="w-4 h-4" /> },
                  { type: "pricing", name: "Cenu tabulas", icon: <DollarSign className="w-4 h-4" /> },
                  { type: "services", name: "Pakalpojumi", icon: <Briefcase className="w-4 h-4" /> },
                  { type: "features", name: "Priekšrocības", icon: <Sparkles className="w-4 h-4" /> },
                  { type: "team", name: "Komanda", icon: <Users className="w-4 h-4" /> },
                  { type: "statistics", name: "Skaitļi", icon: <Clock className="w-4 h-4" /> },
                  { type: "map", name: "Karte", icon: <MapPin className="w-4 h-4" /> },
                  { type: "contact", name: "Kontaktu forma", icon: <FileText className="w-4 h-4" /> },
                  { type: "spacer", name: "Spacer", icon: <Maximize className="w-4 h-4" /> },
                  { type: "divider", name: "Atdalītājs", icon: <ColumnsIcon className="w-4 h-4" /> },
                  { type: "html", name: "HTML kods", icon: <Code className="w-4 h-4" /> }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => {
                      // Add to the active or first section
                      const targetSecId = activeSectionId || sections[0]?.id;
                      if (targetSecId) handleAddBlock(targetSecId, item.type);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-850 rounded-2xl text-center group transition"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-yellow-500 transition mb-2">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white transition">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Block Templates */}
            {savedTemplates.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5 mb-3">
                  <Layout className="w-3.5 h-3.5 text-yellow-500" />
                  Saraksta Šabloni
                </span>
                <div className="space-y-1.5">
                  {savedTemplates.map(tmpl => (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        const targetSecId = activeSectionId || sections[0]?.id;
                        if (targetSecId) handleLoadTemplate(targetSecId, tmpl.block);
                      }}
                      className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-xl flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <span className="truncate text-zinc-300 font-medium">{tmpl.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = savedTemplates.filter(t => t.id !== tmpl.id);
                          setSavedTemplates(updated);
                          localStorage.setItem("cms_block_templates", JSON.stringify(updated));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* --- DYNAMIC INTERACTIVE PREVIEW PLATFORM (MIDDLE CANVAS) --- */}
        <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 flex justify-center items-start transition-all">
          <div
            id="builder-preview-canvas"
            className="transition-all duration-300 shadow-3xl border border-zinc-900 bg-zinc-950 rounded-2xl overflow-hidden"
            style={{
              width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "390px",
              minHeight: "750px"
            }}
          >
            {/* Live Interactive Page Layout */}
            <div className="space-y-1">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className={`relative group/sec border-2 ${
                    activeSectionId === sec.id && !activeBlockId
                      ? "border-yellow-500/80 bg-yellow-500/[0.02]"
                      : "border-transparent hover:border-zinc-800"
                  }`}
                  style={{
                    backgroundColor: sec.backgroundType === "color" ? sec.backgroundColor : "transparent",
                    backgroundImage: sec.backgroundType === "image" && sec.backgroundImage ? `url(${sec.backgroundImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    paddingTop: sec.paddingY === "small" ? "20px" : sec.paddingY === "medium" ? "40px" : sec.paddingY === "large" ? "80px" : "0px",
                    paddingBottom: sec.paddingY === "small" ? "20px" : sec.paddingY === "medium" ? "40px" : sec.paddingY === "large" ? "80px" : "0px",
                  }}
                >
                  {/* Section Controls Toolbar */}
                  <div className="absolute right-3 top-3 opacity-0 group-hover/sec:opacity-100 flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-lg z-20 gap-1 transition">
                    <span className="text-[9px] font-bold font-mono px-2 text-zinc-500 uppercase">{sec.name}</span>
                    <button
                      onClick={() => handleUpdateSectionSetting(sec.id, "name", window.prompt("Mainīt sekcijas nosaukumu:", sec.name) || sec.name)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                      title="Pārdēvēt sekciju"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-red-950/20"
                      title="Dzēst sekciju"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Section columns Grid wrapper */}
                  <div className={`mx-auto ${sec.containerWidth === "narrow" ? "max-w-2xl" : sec.containerWidth === "default" ? "max-w-5xl" : sec.containerWidth === "wide" ? "max-w-7xl" : "max-w-full px-6"}`}>
                    <div className="grid grid-cols-1 gap-6">
                      
                      {sec.blocks.length === 0 ? (
                        <div className="p-10 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-600 text-xs">
                          Šeit nav bloku. Noklikšķiniet uz rīkjoslas, lai pievienotu pirmo bloku šajā sekcijā.
                        </div>
                      ) : (
                        sec.blocks.map((block) => {
                          const isActive = activeBlockId === block.id;
                          const isHiddenOnCurrent = 
                            (viewport === "desktop" && !block.showOnDesktop) ||
                            (viewport === "tablet" && !block.showOnTablet) ||
                            (viewport === "mobile" && !block.showOnMobile);

                          return (
                            <div
                              key={block.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBlockId(block.id);
                                setActiveSectionId(sec.id);
                              }}
                              className={`relative group/block rounded-xl border-2 transition ${
                                isActive
                                  ? "border-yellow-500/100 bg-yellow-500/[0.01]"
                                  : "border-transparent hover:border-zinc-800 bg-zinc-950/20"
                              } ${isHiddenOnCurrent ? "opacity-30 border-dashed border-red-500/30" : ""}`}
                            >
                              {/* Block controls */}
                              <div className="absolute left-2 -top-3.5 opacity-0 group-hover/block:opacity-100 flex items-center bg-yellow-500 text-zinc-950 rounded-lg py-0.5 px-2 text-[10px] font-black z-20 gap-1 transition shadow-lg">
                                <span>{block.name}</span>
                                {isHiddenOnCurrent && <EyeOff className="w-3 h-3 text-red-700" />}
                              </div>

                              <div className="absolute right-2 -top-3.5 opacity-0 group-hover/block:opacity-100 flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shadow-md z-20 gap-1 transition">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMoveBlock(sec.id, block.id, "up"); }}
                                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMoveBlock(sec.id, block.id, "down"); }}
                                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDuplicateBlock(sec.id, block); }}
                                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                                  title="Dublēt bloku"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSaveAsTemplate(block); }}
                                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                                  title="Saglabāt kā šablonu"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteBlock(sec.id, block.id); }}
                                  className="p-1 hover:bg-red-950/40 rounded text-zinc-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Live visual presentation of block types */}
                              <div className="p-4 overflow-hidden">
                                {block.type === "hero" && (
                                  <div
                                    className="text-center py-12 flex flex-col justify-center items-center rounded-xl relative"
                                    style={{
                                      minHeight: block.settings.height || "400px",
                                      backgroundImage: block.settings.bgImage ? `url(${block.settings.bgImage})` : "none",
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    }}
                                  >
                                    {block.settings.bgImage && (
                                      <div
                                        className="absolute inset-0 bg-black rounded-xl"
                                        style={{ opacity: block.settings.overlayOpacity || 0.4 }}
                                      />
                                    )}
                                    <div className="relative z-10 max-w-xl px-4">
                                      <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4" style={{ color: block.settings.textColor || "#fff" }}>
                                        {block.settings.title}
                                      </h2>
                                      <p className="text-sm md:text-base opacity-90 mb-6" style={{ color: block.settings.textColor || "#fff" }}>
                                        {block.settings.subtitle}
                                      </p>
                                      {block.settings.buttonText && (
                                        <span className="inline-block px-6 py-3 bg-yellow-500 text-zinc-950 font-bold text-xs rounded-xl shadow-lg">
                                          {block.settings.buttonText}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {block.type === "text" && (
                                  <div
                                    className="prose prose-invert max-w-none text-sm leading-relaxed"
                                    style={{ color: block.settings.textColor || "#d4d4d8" }}
                                    dangerouslySetInnerHTML={{ __html: block.settings.content || "Rakstīt tekstu..." }}
                                  />
                                )}

                                {block.type === "image" && (
                                  <div className="flex flex-col items-center">
                                    {block.settings.imageUrl ? (
                                      <img
                                        src={block.settings.imageUrl}
                                        alt={block.settings.altText}
                                        className="object-cover max-h-96 w-auto"
                                        style={{ borderRadius: block.settings.borderRadius || "8px" }}
                                      />
                                    ) : (
                                      <div className="p-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/40 text-center text-xs text-zinc-500">
                                        Noklikšķiniet, lai izvēlētos attēlu no Media Library
                                      </div>
                                    )}
                                    {block.settings.caption && (
                                      <p className="text-[11px] text-zinc-500 mt-2 italic">{block.settings.caption}</p>
                                    )}
                                  </div>
                                )}

                                {block.type === "gallery" && (
                                  <div>
                                    {block.settings.images && block.settings.images.length > 0 ? (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {block.settings.images.map((img: any, i: number) => (
                                          <div key={i} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden relative group/img">
                                            <img src={img.image} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-end p-2 transition">
                                              <span className="text-[10px] font-bold text-white truncate">{img.caption}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-8 border border-dashed border-zinc-850 rounded-xl text-center text-xs text-zinc-500 bg-zinc-900/20">
                                        Galerija ir tukša. Pievienojiet attēlus rīkjoslā.
                                      </div>
                                    )}
                                  </div>
                                )}

                                {block.type === "video" && (
                                  <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center relative">
                                    <Play className="w-12 h-12 text-yellow-500 animate-pulse" />
                                    <span className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">Video: {block.settings.videoUrl || "nav norādīts"}</span>
                                  </div>
                                )}

                                {block.type === "faq" && (
                                  <div className="space-y-3">
                                    {block.settings.items?.map((item: any, i: number) => (
                                      <div key={i} className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
                                        <h4 className="text-xs font-bold text-white flex items-center justify-between">
                                          {item.q}
                                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                                        </h4>
                                        <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{item.a}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {block.type === "testimonials" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {block.settings.items?.map((item: any, i: number) => (
                                      <div key={i} className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-2xl relative">
                                        <div className="flex text-yellow-500 mb-2">
                                          {"★".repeat(item.rating || 5)}
                                        </div>
                                        <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{item.text}"</p>
                                        <div className="mt-3 text-xs">
                                          <p className="font-bold text-white">{item.author}</p>
                                          <p className="text-[10px] text-zinc-500">{item.company}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {block.type === "pricing" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {block.settings.plans?.map((plan: any, i: number) => (
                                      <div key={i} className={`p-4 border rounded-2xl ${plan.popular ? "bg-yellow-500/10 border-yellow-500/30" : "bg-zinc-900/40 border-zinc-850"}`}>
                                        <h4 className="text-xs font-bold text-white">{plan.name}</h4>
                                        <p className="text-lg font-black text-white mt-1">{plan.price}</p>
                                        <ul className="mt-3 space-y-1.5 text-[10px] text-zinc-400">
                                          {plan.features?.map((f: string, j: number) => (
                                            <li key={j} className="flex items-center gap-1.5">
                                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                              {f}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {block.type === "map" && (
                                  <div className="bg-zinc-900/60 p-4 border border-zinc-850 rounded-2xl flex items-center justify-center gap-2 text-xs text-zinc-500">
                                    <MapPin className="w-5 h-5 text-red-500 animate-bounce" />
                                    <span>Google Map API: {block.settings.address} (Zoom: {block.settings.zoom})</span>
                                  </div>
                                )}

                                {block.type === "contact" && (
                                  <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 space-y-3 max-w-sm mx-auto">
                                    <h4 className="text-xs font-bold text-white border-b border-zinc-850 pb-2">{block.settings.title}</h4>
                                    <div className="space-y-2">
                                      <div className="h-8 bg-zinc-950 rounded border border-zinc-850" />
                                      <div className="h-12 bg-zinc-950 rounded border border-zinc-850" />
                                      <button className="w-full h-8 bg-yellow-500 rounded text-[10px] text-zinc-950 font-bold">Nosūtīt</button>
                                    </div>
                                  </div>
                                )}

                                {block.type === "spacer" && (
                                  <div className="border border-dashed border-zinc-850 rounded bg-zinc-900/20 text-center text-[10px] text-zinc-600" style={{ height: block.settings.height || "40px" }}>
                                    Atstarpe ({block.settings.height})
                                  </div>
                                )}

                                {block.type === "divider" && (
                                  <hr style={{ borderTop: `${block.settings.thickness || '1px'} ${block.settings.style || 'solid'} ${block.settings.color || '#27272a'}` }} />
                                )}

                                {block.type === "html" && (
                                  <div className="font-mono text-xs text-zinc-500 border border-zinc-850 rounded p-3 bg-zinc-950">
                                    <span className="text-[9px] uppercase tracking-wider text-yellow-500 block mb-2 font-bold">Pielāgots HTML</span>
                                    <pre className="overflow-x-auto">{block.settings.code}</pre>
                                  </div>
                                )}

                              </div>
                            </div>
                          );
                        })
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Section triggers */}
            <div className="p-6 text-center border-t border-zinc-900 bg-zinc-950/40">
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-2xl text-xs font-bold transition"
              >
                <Plus className="w-4.5 h-4.5 text-yellow-500" />
                Pievienot jaunu sekciju (Section)
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: Content & Style Customization Inspector --- */}
        <div className="w-80 border-l border-zinc-900 bg-zinc-950 flex flex-col justify-between shrink-0">
          
          {getActiveBlock() ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              
              {/* Header block info */}
              <div className="p-5 border-b border-zinc-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono tracking-wider bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded uppercase">
                    Bloka Redaktors
                  </span>
                  <button onClick={() => setActiveBlockId(null)} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">{getActiveBlock()?.name}</h3>
              </div>

              {/* Inspector Navigation tabs */}
              <div className="grid grid-cols-3 border-b border-zinc-900 text-xs font-bold text-center">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`py-3 border-b-2 transition ${
                    activeTab === "content" ? "border-yellow-500 text-yellow-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Saturs
                </button>
                <button
                  onClick={() => setActiveTab("style")}
                  className={`py-3 border-b-2 transition ${
                    activeTab === "style" ? "border-yellow-500 text-yellow-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Stils
                </button>
                <button
                  onClick={() => setActiveTab("responsive")}
                  className={`py-3 border-b-2 transition ${
                    activeTab === "responsive" ? "border-yellow-500 text-yellow-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Ierīces
                </button>
              </div>

              {/* Dynamic properties rendering */}
              <div className="p-5 space-y-5 flex-1">
                {activeTab === "content" && (
                  <div className="space-y-4">
                    
                    {/* --- HERO BLOCK EDITORS --- */}
                    {getActiveBlock()?.type === "hero" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Virsraksts</label>
                          <input
                            type="text"
                            value={getActiveBlock()?.settings.title || ""}
                            onChange={(e) => handleUpdateBlockSetting("title", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Apakšvirsraksts</label>
                          <textarea
                            value={getActiveBlock()?.settings.subtitle || ""}
                            onChange={(e) => handleUpdateBlockSetting("subtitle", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500 h-20"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Poga (Teksts)</label>
                          <input
                            type="text"
                            value={getActiveBlock()?.settings.buttonText || ""}
                            onChange={(e) => handleUpdateBlockSetting("buttonText", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Pogas adrese (Link)</label>
                          <input
                            type="text"
                            value={getActiveBlock()?.settings.buttonLink || ""}
                            onChange={(e) => handleUpdateBlockSetting("buttonLink", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500"
                          />
                        </div>

                        {/* Background selection trigger */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 block">Fona bilde (Hero)</label>
                          {getActiveBlock()?.settings.bgImage ? (
                            <div className="relative rounded-xl overflow-hidden aspect-video border border-zinc-800">
                              <img src={getActiveBlock()?.settings.bgImage} className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleUpdateBlockSetting("bgImage", "")}
                                className="absolute top-1 right-1 p-1 bg-red-600 rounded text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setMediaPickerTarget({ blockId: activeBlockId!, settingKey: "bgImage" })}
                              className="w-full py-4.5 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition rounded-xl text-xs text-zinc-500 flex flex-col items-center justify-center gap-1"
                            >
                              <ImageIcon className="w-5 h-5 text-zinc-600" />
                              Izvēlēties no Media Library
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* --- TEXT / RICH TEXT EDITORS --- */}
                    {(getActiveBlock()?.type === "text" || getActiveBlock()?.type === "richtext") && (
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">Vizuālais Saturs (Rich Text)</label>
                        
                        {/* WYSIWYG Styling Toolbar */}
                        <div className="flex flex-wrap gap-1 bg-zinc-900 border border-zinc-850 p-1 rounded-xl">
                          <button onClick={() => handleRichTextCommand("bold")} className="p-1.5 hover:bg-zinc-800 text-xs font-bold hover:text-white rounded" title="Treknraksts">B</button>
                          <button onClick={() => handleRichTextCommand("italic")} className="p-1.5 hover:bg-zinc-800 text-xs italic hover:text-white rounded" title="Slīpraksts">I</button>
                          <button onClick={() => handleRichTextCommand("underline")} className="p-1.5 hover:bg-zinc-800 text-xs underline hover:text-white rounded" title="Pasvītrots">U</button>
                          <button onClick={() => handleRichTextCommand("h2")} className="p-1.5 hover:bg-zinc-800 text-xs font-black hover:text-white rounded" title="Virsraksts H2">H2</button>
                          <button onClick={() => handleRichTextCommand("p")} className="p-1.5 hover:bg-zinc-800 text-xs hover:text-white rounded" title="Paragrāfs">P</button>
                          <button onClick={() => handleRichTextCommand("bullet")} className="p-1.5 hover:bg-zinc-800 text-xs hover:text-white rounded" title="Saraksts">List</button>
                          <button onClick={() => handleRichTextCommand("quote")} className="p-1.5 hover:bg-zinc-800 text-xs hover:text-white rounded" title="Citāts">Quote</button>
                          <button onClick={() => handleRichTextCommand("emoji")} className="p-1.5 hover:bg-zinc-800 text-xs hover:text-white rounded" title="Emoji">✨</button>
                        </div>

                        <textarea
                          value={getActiveBlock()?.settings.content || ""}
                          onChange={(e) => handleUpdateBlockSetting("content", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500 h-48 font-mono"
                          placeholder="<span>Sveiks, <b>klient!</b></span>"
                        />
                      </div>
                    )}

                    {/* --- IMAGE EDITORS --- */}
                    {getActiveBlock()?.type === "image" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 block">Attēla fails</label>
                          {getActiveBlock()?.settings.imageUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-video">
                              <img src={getActiveBlock()?.settings.imageUrl} className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleUpdateBlockSetting("imageUrl", "")}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-600 rounded text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setMediaPickerTarget({ blockId: activeBlockId!, settingKey: "imageUrl" })}
                              className="w-full py-5 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition rounded-xl text-xs text-zinc-500 flex flex-col items-center justify-center gap-1"
                            >
                              <ImageIcon className="w-5 h-5 text-zinc-600" />
                              Izvēlēties no Media Library
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Alt teksts (SEO)</label>
                          <input
                            type="text"
                            value={getActiveBlock()?.settings.altText || ""}
                            onChange={(e) => handleUpdateBlockSetting("altText", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Paraksts (Caption)</label>
                          <input
                            type="text"
                            value={getActiveBlock()?.settings.caption || ""}
                            onChange={(e) => handleUpdateBlockSetting("caption", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                          />
                        </div>
                      </>
                    )}

                    {/* --- GALLERY EDITORS --- */}
                    {getActiveBlock()?.type === "gallery" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 block">Galerijas attēli</label>
                          <button
                            onClick={() => setMediaPickerTarget({ blockId: activeBlockId!, settingKey: "images", isMulti: true })}
                            className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold rounded-xl text-xs border border-zinc-800 flex items-center justify-center gap-2 transition mb-2"
                          >
                            <Plus className="w-4 h-4 text-yellow-500" />
                            Pievienot attēlu
                          </button>

                          {/* Render thumbnails list */}
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {getActiveBlock()?.settings.images?.map((img: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-850">
                                <img src={img.image} className="w-8 h-8 rounded object-cover shrink-0" />
                                <input
                                  type="text"
                                  value={img.caption || ""}
                                  onChange={(e) => {
                                    const nextImgList = [...getActiveBlock()?.settings.images];
                                    nextImgList[idx].caption = e.target.value;
                                    handleUpdateBlockSetting("images", nextImgList);
                                  }}
                                  className="flex-1 bg-transparent border-none text-[10px] text-white focus:outline-none p-0 focus:ring-0"
                                  placeholder="Apraksts..."
                                />
                                <button
                                  onClick={() => {
                                    const nextImgList = getActiveBlock()?.settings.images.filter((_: any, i: number) => i !== idx);
                                    handleUpdateBlockSetting("images", nextImgList);
                                  }}
                                  className="p-1 text-zinc-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Izkārtojums (Layout)</label>
                          <select
                            value={getActiveBlock()?.settings.layout || "grid"}
                            onChange={(e) => handleUpdateBlockSetting("layout", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="grid">Režģis (Grid)</option>
                            <option value="masonry">Masonry</option>
                            <option value="slider">Slaideris (Slider)</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* --- FAQ EDITORS --- */}
                    {getActiveBlock()?.type === "faq" && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">FAQ Jautājumi</label>
                        {getActiveBlock()?.settings.items?.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-zinc-900 rounded-xl space-y-2 border border-zinc-850">
                            <input
                              type="text"
                              value={item.q}
                              onChange={(e) => {
                                const nextItems = [...getActiveBlock()?.settings.items];
                                nextItems[idx].q = e.target.value;
                                handleUpdateBlockSetting("items", nextItems);
                              }}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-1 text-[11px] text-white"
                              placeholder="Jautājums..."
                            />
                            <textarea
                              value={item.a}
                              onChange={(e) => {
                                const nextItems = [...getActiveBlock()?.settings.items];
                                nextItems[idx].a = e.target.value;
                                handleUpdateBlockSetting("items", nextItems);
                              }}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-1 text-[11px] text-white h-12"
                              placeholder="Atbilde..."
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* --- MAP EDITORS --- */}
                    {getActiveBlock()?.type === "map" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Adrese vai koordinātes</label>
                          <input
                            type="text"
                            value={getActiveBlock()?.settings.address || ""}
                            onChange={(e) => handleUpdateBlockSetting("address", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Tuvinājums (Zoom)</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={getActiveBlock()?.settings.zoom || 13}
                            onChange={(e) => handleUpdateBlockSetting("zoom", parseInt(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {/* --- HTML EDITORS --- */}
                    {getActiveBlock()?.type === "html" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">Pielāgots HTML kods</label>
                        <textarea
                          value={getActiveBlock()?.settings.code || ""}
                          onChange={(e) => handleUpdateBlockSetting("code", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none h-40 font-mono"
                        />
                      </div>
                    )}

                  </div>
                )}

                {activeTab === "style" && (
                  <div className="space-y-4 text-xs">
                    
                    {/* Width / Height metrics */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Izmērs (Augstums)</label>
                      <input
                        type="text"
                        value={getActiveBlock()?.settings.height || "Auto"}
                        onChange={(e) => handleUpdateBlockSetting("height", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                        placeholder="piem. 500px, 100vh, auto"
                      />
                    </div>

                    {/* Padding slider / text */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Iekšējās atstarpes (Padding)</label>
                      <input
                        type="text"
                        value={getActiveBlock()?.settings.padding || "20px"}
                        onChange={(e) => handleUpdateBlockSetting("padding", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                        placeholder="piem. 20px, 10px 30px"
                      />
                    </div>

                    {/* Margin slider / text */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Ārējās atstarpes (Margin)</label>
                      <input
                        type="text"
                        value={getActiveBlock()?.settings.margin || "0px"}
                        onChange={(e) => handleUpdateBlockSetting("margin", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                        placeholder="piem. 0px, 15px auto"
                      />
                    </div>

                    {/* Colors & Fonts */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Teksta krāsa</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={getActiveBlock()?.settings.textColor || "#ffffff"}
                          onChange={(e) => handleUpdateBlockSetting("textColor", e.target.value)}
                          className="w-8 h-8 rounded bg-transparent border-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={getActiveBlock()?.settings.textColor || ""}
                          onChange={(e) => handleUpdateBlockSetting("textColor", e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Overlay Opacity (for Hero) */}
                    {getActiveBlock()?.type === "hero" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">Fona pārklājuma caurspīdīgums (Overlay)</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={getActiveBlock()?.settings.overlayOpacity || 0.4}
                          onChange={(e) => handleUpdateBlockSetting("overlayOpacity", parseFloat(e.target.value))}
                          className="w-full accent-yellow-500"
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">{(getActiveBlock()?.settings.overlayOpacity || 0.4) * 100}%</span>
                      </div>
                    )}

                    {/* Alignment options */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Izlīdzinājums (Alignment)</label>
                      <div className="grid grid-cols-3 bg-zinc-900 border border-zinc-850 p-1 rounded-xl">
                        {["left", "center", "right"].map(align => (
                          <button
                            key={align}
                            onClick={() => handleUpdateBlockSetting("alignment", align)}
                            className={`py-1 rounded text-xs capitalize ${
                              getActiveBlock()?.settings.alignment === align ? "bg-zinc-800 text-yellow-500 font-bold" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Borders & border-radius */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Stūru noapaļojums</label>
                      <input
                        type="text"
                        value={getActiveBlock()?.settings.borderRadius || "0px"}
                        onChange={(e) => handleUpdateBlockSetting("borderRadius", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                        placeholder="piem. 8px, 12px, 50%"
                      />
                    </div>

                  </div>
                )}

                {activeTab === "responsive" && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Konfigurējiet, kurās ierīcēs šis bloks būs vizuāli redzams publiskajā vietnē.
                    </p>

                    <div className="space-y-2.5">
                      {[
                        { key: "showOnDesktop" as const, label: "Rādīt uz Datora (Desktop)", icon: <Monitor className="w-4.5 h-4.5 text-yellow-500" /> },
                        { key: "showOnTablet" as const, label: "Rādīt uz Planšetes (Tablet)", icon: <TabletIcon className="w-4.5 h-4.5 text-yellow-500" /> },
                        { key: "showOnMobile" as const, label: "Rādīt uz Mobilā (Mobile)", icon: <Smartphone className="w-4.5 h-4.5 text-yellow-500" /> }
                      ].map(item => (
                        <label key={item.key} className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 cursor-pointer hover:bg-zinc-900 transition">
                          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-200">
                            {item.icon}
                            {item.label}
                          </div>
                          <input
                            type="checkbox"
                            checked={getActiveBlock()?.[item.key] !== false}
                            onChange={(e) => handleUpdateBlockResponsive(item.key, e.target.checked)}
                            className="rounded border-zinc-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950 w-4 h-4"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : getActiveSection() ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              
              {/* Header section info */}
              <div className="p-5 border-b border-zinc-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono tracking-wider bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded uppercase">
                    Sekcijas Redaktors
                  </span>
                  <button onClick={() => setActiveSectionId(null)} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">{getActiveSection()?.name}</h3>
              </div>

              {/* Section Settings body */}
              <div className="p-5 space-y-5 text-xs">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Sekcijas nosaukums</label>
                  <input
                    type="text"
                    value={getActiveSection()?.name || ""}
                    onChange={(e) => handleUpdateSectionSetting(activeSectionId!, "name", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Konteinera platums</label>
                  <select
                    value={getActiveSection()?.containerWidth || "default"}
                    onChange={(e) => handleUpdateSectionSetting(activeSectionId!, "containerWidth", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="narrow">Šaurs (Narrow)</option>
                    <option value="default">Noklusējuma (Default)</option>
                    <option value="wide">Plats (Wide)</option>
                    <option value="full">Pilns ekrāns (Full Width)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Iekšējais polsterējums (Y padding)</label>
                  <select
                    value={getActiveSection()?.paddingY || "medium"}
                    onChange={(e) => handleUpdateSectionSetting(activeSectionId!, "paddingY", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="none">Bez atstarpes (None)</option>
                    <option value="small">Mazs (Small)</option>
                    <option value="medium">Vidējs (Medium)</option>
                    <option value="large">Liels (Large)</option>
                  </select>
                </div>

                {/* Section background type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Fona veids (Background)</label>
                  <select
                    value={getActiveSection()?.backgroundType || "color"}
                    onChange={(e) => handleUpdateSectionSetting(activeSectionId!, "backgroundType", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="color">Krāsa (Solid Color)</option>
                    <option value="image">Attēls (Background Image)</option>
                  </select>
                </div>

                {getActiveSection()?.backgroundType === "color" ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Fona krāsa</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={getActiveSection()?.backgroundColor || "#000000"}
                        onChange={(e) => handleUpdateSectionSetting(activeSectionId!, "backgroundColor", e.target.value)}
                        className="w-8 h-8 rounded bg-transparent border-none cursor-pointer"
                      />
                      <input
                        type="text"
                        value={getActiveSection()?.backgroundColor || ""}
                        onChange={(e) => handleUpdateSectionSetting(activeSectionId!, "backgroundColor", e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">Fona bilde</label>
                    {getActiveSection()?.backgroundImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-video">
                        <img src={getActiveSection()?.backgroundImage} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleUpdateSectionSetting(activeSectionId!, "backgroundImage", "")}
                          className="absolute top-1 right-1 p-1 bg-red-600 rounded text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMediaPickerTarget({ sectionId: activeSectionId!, settingKey: "backgroundImage" })}
                        className="w-full py-4 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition rounded-xl text-xs text-zinc-500 flex flex-col items-center justify-center gap-1"
                      >
                        <ImageIcon className="w-5 h-5 text-zinc-600" />
                        Izvēlēties fona bildi
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-center text-zinc-500">
                <Settings className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-300">Nav atlasīts neviens elements</p>
                <p className="text-[10px] text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Uzklikšķiniet uz jebkura bloka vai sekcijas priekšskatījuma laukā, lai pielāgotu tā saturu un dizainu.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* --- INTEGRATED FULLSCREEN MEDIA LIBRARY PICKER MODAL --- */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-6xl h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden relative"
            >
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between shrink-0 bg-zinc-900/40">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-yellow-500" />
                    Mediju Bibliotēkas Izvēle
                  </h3>
                  <p className="text-xs text-zinc-500">Izvēlieties failu no augšupielādētajiem resursiem</p>
                </div>
                <button
                  onClick={() => setMediaPickerTarget(null)}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Real Media Library Component */}
              <div className="flex-1 overflow-y-auto p-6">
                <AdminMedia
                  token={token}
                  isPickerMode={true}
                  onSelect={handleMediaSelected}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
