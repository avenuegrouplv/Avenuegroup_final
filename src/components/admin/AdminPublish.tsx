import React, { useState, useEffect } from "react";
import { Send, AlertTriangle, Eye, CheckCircle, RotateCcw, GitBranch, Github, Info, RefreshCw } from "lucide-react";

interface AdminPublishProps {
  token: string;
}

interface DraftFileInfo {
  filename: string;
  hasDraft: boolean;
}

export const AdminPublish: React.FC<AdminPublishProps> = ({ token }) => {
  const [draftFiles, setDraftFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Compare file differences
  const [compareFile, setCompareFile] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ original: any; draft: any } | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // GitHub credentials local fallback storage
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("");

  const loadFallbackCredentials = () => {
    try {
      const savedConfig = JSON.parse(localStorage.getItem("cms_dev_settings") || "{}");
      setGithubToken(savedConfig.githubToken || "");
      setGithubRepo(savedConfig.githubRepo || "");
      setGithubBranch(savedConfig.githubBranch || "main");
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/content-files", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data: DraftFileInfo[] = await res.json();
      const modified = data.filter((f) => f.hasDraft).map((f) => f.filename);
      setDraftFiles(modified);
    } catch (err) {
      console.error("Failed to load drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
    loadFallbackCredentials();
  }, [token]);

  const handleCompare = async (filename: string) => {
    setCompareFile(filename);
    setLoadingCompare(true);
    setFileDetails(null);
    try {
      const res = await fetch(`/api/cms/content-file/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFileDetails({
        original: data.original,
        draft: data.draft
      });
    } catch (err) {
      console.error("Failed to load comparison:", err);
    } finally {
      setLoadingCompare(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Vai tiešām esat pabeidzis rediģēšanu un vēlaties publicēt šīs izmaiņas tiešsaistē?")) return;
    setPublishing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/cms/publish", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          githubToken: githubToken || undefined,
          githubRepo: githubRepo || undefined,
          githubBranch: githubBranch || undefined
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Publishing failed");
      }

      if (result.githubSuccess) {
        setMessage({
          type: "success",
          text: "Izmaiņas veiksmīgi publicētas. Mājaslapa tiks atjaunināta tuvāko 1–2 minūšu laikā."
        });
        setDraftFiles([]);
        setCompareFile(null);
        setFileDetails(null);
      } else {
        setMessage({
          type: "error",
          text: `Dati saglabāti lokāli, bet neizdevās sinhronizēt ar GitHub: ${result.message}. Pārliecinieties par Developer Settings konfigurāciju un zaru saderību.`
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `Kļūda publicējot: ${err.message || err}. Konstatēts iespējams sinhronizācijas konflikts ar attālo repozitoriju. Lūdzu, mēģiniet vēlreiz vai sinhronizējiet datus Developer Settings.`
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscardAll = async () => {
    if (!window.confirm("Uzmanību! Šī darbība neatgriezeniski dzēsīs visus patreizējos melnrakstus visiem failiem. Vai turpināt?")) return;
    setLoading(true);
    try {
      for (const filename of draftFiles) {
        await fetch(`/api/cms/content-file/${filename}/draft`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setMessage({ type: "success", text: "Visi melnraksti veiksmīgi atcelti." });
      await fetchDrafts();
      setCompareFile(null);
      setFileDetails(null);
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās atcelt visus melnrakstus." });
      setLoading(false);
    }
  };

  return (
    <div id="admin-publish-dashboard" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white font-sans">Melnraksti un Publicēšana</h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Šeit Jūs varat pārskatīt visas veiktās izmaiņas pirms to publicēšanas tiešsaistē.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDrafts}
            disabled={loading}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-zinc-750 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {draftFiles.length > 0 && (
            <>
              <button
                onClick={handleDiscardAll}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 px-4 py-2.5 rounded-xl border border-zinc-700 transition text-sm font-semibold"
              >
                Atcelt Visus
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 px-5 py-2.5 rounded-xl transition text-sm font-bold shadow-md shadow-yellow-500/10"
              >
                <Send className="w-4 h-4" />
                {publishing ? "Publicē..." : "Publicēt Izmaiņas"}
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 p-5 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
              : "bg-red-950/40 border-red-800 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5.5 h-5.5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5.5 h-5.5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
          <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Meklē aktīvos melnrakstus...</p>
        </div>
      ) : draftFiles.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center space-y-4">
          <div className="bg-zinc-950/60 p-4 rounded-full border border-zinc-800 w-14 h-14 mx-auto flex items-center justify-center text-zinc-500">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200">Nav aktīvu melnrakstu</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Mājaslapā nav veiktu izmaiņu, kuras gaidītu publicēšanu. Sāciet rediģēt satura JSON failus vai tulkojumus, lai izveidotu izmaiņu melnrakstu.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-top">
          {/* Draft Files List */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-3">
              Izmainītie Satura Faili ({draftFiles.length})
            </h3>
            <div className="space-y-2">
              {draftFiles.map((file) => (
                <div
                  key={file}
                  onClick={() => handleCompare(file)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition border ${
                    compareFile === file
                      ? "bg-yellow-500/5 border-yellow-500/40 text-yellow-500"
                      : "bg-zinc-950/20 border-transparent hover:bg-zinc-800/40 text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-bold font-mono">{file}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-bold uppercase">
                      Draft
                    </span>
                    <button className="p-1 bg-zinc-950/55 hover:bg-zinc-850 rounded border border-zinc-800 text-zinc-400 hover:text-zinc-200">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diff/Compare Pane */}
          <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
            {compareFile ? (
              <>
                <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-200">
                    Melnraksta salīdzināšana: <span className="text-yellow-500 font-mono">{compareFile}</span>
                  </h3>
                  <span className="text-xs text-zinc-500">Salīdzināts ar pēdējo publicēto stāvokli</span>
                </div>

                {loadingCompare ? (
                  <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
                    <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Ielādē izmaiņu salīdzinājumu...</p>
                  </div>
                ) : fileDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Column */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-mono">
                        <span className="w-2 h-2 rounded-full bg-zinc-500" />
                        Pēdējais Publicētais
                      </div>
                      <pre className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-[10px] text-zinc-400 font-mono overflow-auto max-h-[500px] leading-relaxed">
                        {JSON.stringify(fileDetails.original, null, 2)}
                      </pre>
                    </div>

                    {/* Draft Column */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5 font-mono">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Melnraksta Izmaiņas
                      </div>
                      <pre className="bg-zinc-950 border border-yellow-500/20 p-4 rounded-xl text-[10px] text-yellow-500 font-mono overflow-auto max-h-[500px] leading-relaxed">
                        {JSON.stringify(fileDetails.draft, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-center py-20 text-zinc-500 text-sm flex flex-col items-center justify-center gap-3">
                <Eye className="w-12 h-12 stroke-1 text-zinc-600" />
                <span>Izvēlieties failu kreisajā pusē, lai redzētu salīdzinošās izmaiņas.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deploy Target Information */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 text-zinc-400">
        <Github className="w-9 h-9 stroke-1 text-zinc-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-yellow-500" />
            GitHub Integrācija
          </p>
          <p className="text-[11px] leading-relaxed">
            Pēc pogas <strong>Publicēt Izmaiņas</strong> nospiešanas saturs tiks pārrakstīts vietējā direktorijā un, ja iestatīta GitHub konfigurācija (<strong>{githubRepo || "Nav iestatīta"}</strong>, zars <strong>{githubBranch || "main"}</strong>), tas tiks nosūtīts uz repozitoriju, kas automātiski iedarbinās mājaslapas atjaunināšanu caur Netlify.
          </p>
        </div>
      </div>
    </div>
  );
};
