import { useEffect, useState } from "react";
import { getSourceSuggestions, SourceSuggestionSchema } from "../services/openaiService";
import { getDB } from "../utils/db";
import { Plus, RefreshCw, Globe, Rss, BookOpen, MessageCircle, Check, X, Loader2 } from "lucide-react";
import { z } from "zod";
import { Veille, Source, SourceType } from "../utils/types";

type SourceSuggestion = z.infer<typeof SourceSuggestionSchema>;

const typeIcons: Record<SourceType, JSX.Element> = {
  rss: <Rss className="w-5 h-5 text-orange-500" />,
  web: <Globe className="w-5 h-5 text-blue-500" />,
  blog: <BookOpen className="w-5 h-5 text-green-500" />,
  forum: <MessageCircle className="w-5 h-5 text-purple-500" />,
  manual: <Plus className="w-5 h-5 text-slate-500" />,
};

export function SourceResearch({ veille, onSourcesAdded }: { veille: Veille; onSourcesAdded: () => void }) {
  const [suggestions, setSuggestions] = useState<SourceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [manualUrl, setManualUrl] = useState("");
  const [manualType, setManualType] = useState<SourceType>("web");
  const [manualTitle, setManualTitle] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [addingManual, setAddingManual] = useState(false);

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line
  }, [veille.id]);

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    setRefusal(null);
    setSuggestions([]);
    setAccepted(new Set());
    setRejected(new Set());
    try {
      const { suggestions, refusal } = await getSourceSuggestions({
        keywords: veille.keywords,
        sentiments: veille.sentiments,
      });
      setSuggestions(suggestions.slice(0, 10));
      if (refusal) setRefusal(refusal);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la génération des suggestions.");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept(url: string) {
    setAccepted(new Set([...accepted, url]));
    setRejected(new Set([...rejected].filter((u) => u !== url)));
  }
  function handleReject(url: string) {
    setRejected(new Set([...rejected, url]));
    setAccepted(new Set([...accepted].filter((u) => u !== url)));
  }

  async function handleAddSelected() {
    const db = await getDB();
    const toAdd = suggestions.filter((s) => accepted.has(s.url));
    for (const s of toAdd) {
      const source: Source = {
        id: s.url,
        veilleId: veille.id,
        url: s.url,
        type: s.type as SourceType,
        addedAt: Date.now(),
        title: s.title,
        description: s.description,
      };
      await db.put("sources", source);
    }
    onSourcesAdded();
  }

  async function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    setAddingManual(true);
    try {
      const db = await getDB();
      const source: Source = {
        id: manualUrl,
        veilleId: veille.id,
        url: manualUrl,
        type: manualType,
        addedAt: Date.now(),
        title: manualTitle,
        description: manualDesc,
      };
      await db.put("sources", source);
      setManualUrl("");
      setManualTitle("");
      setManualDesc("");
      setManualType("web");
      onSourcesAdded();
    } finally {
      setAddingManual(false);
    }
  }

  return (
    <section className="w-full max-w-2xl mx-auto mt-8">
      <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center gap-2">
        <Globe className="w-6 h-6" />
        Recherche de sources pour <span className="text-slate-800">{veille.name}</span>
      </h3>
      <div className="mb-4 flex gap-2 items-center">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={fetchSuggestions}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Relancer suggestions
        </button>
        <span className="text-slate-500 text-sm">Basé sur vos mots-clés et sentiments</span>
      </div>
      {error && (<div className="text-red-600 mb-2">{error}</div>)}
      {refusal && (<div className="text-orange-600 mb-2">{refusal}</div>)}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          Génération des suggestions en cours...
        </div>
      )}
      <ul className="space-y-3 mb-6">
        {suggestions.map((s) => (
          <li
            key={s.url}
            className={`bg-white rounded shadow flex flex-col md:flex-row md:items-center justify-between p-4 gap-2 border ${
              accepted.has(s.url)
                ? "border-green-400"
                : rejected.has(s.url)
                ? "border-red-300 opacity-60"
                : "border-slate-200"
            }`}
          >
            <div>
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                {typeIcons[s.type as SourceType]}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
                  {s.title || s.url}
                </a>
              </div>
              <div className="text-xs text-slate-500">{s.description}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                className={`p-2 rounded hover:bg-green-100 ${accepted.has(s.url) ? "bg-green-200" : ""}`}
                title="Ajouter"
                onClick={() => handleAccept(s.url)}
                disabled={accepted.has(s.url)}
              >
                <Check className="w-4 h-4 text-green-600" />
              </button>
              <button
                className={`p-2 rounded hover:bg-red-100 ${rejected.has(s.url) ? "bg-red-200" : ""}`}
                title="Ignorer"
                onClick={() => handleReject(s.url)}
                disabled={rejected.has(s.url)}
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </li>
        ))}
        {suggestions.length === 0 && !loading && !refusal && (
          <li className="text-slate-500 italic">Aucune suggestion pour l’instant.</li>
        )}
      </ul>
      <div className="flex justify-end mb-8">
        <button
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          onClick={handleAddSelected}
          disabled={accepted.size === 0}
        >
          Ajouter {accepted.size} source{accepted.size > 1 ? "s" : ""} sélectionnée{accepted.size > 1 ? "s" : ""}
        </button>
      </div>
      <div className="border-t pt-6 mt-6">
        <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ajouter une source manuellement
        </h4>
        <form className="flex flex-col md:flex-row gap-3 items-stretch" onSubmit={handleAddManual}>
          <input
            className="border rounded px-3 py-2 w-full"
            type="url"
            placeholder="URL de la source"
            value={manualUrl}
            onChange={e => setManualUrl(e.target.value)}
            required
          />
          <select
            className="border rounded px-3 py-2"
            value={manualType}
            onChange={e => setManualType(e.target.value as SourceType)}
          >
            <option value="web">Site web</option>
            <option value="rss">Flux RSS</option>
            <option value="blog">Blog</option>
            <option value="forum">Forum</option>
          </select>
          <input
            className="border rounded px-3 py-2 w-full"
            type="text"
            placeholder="Titre (optionnel)"
            value={manualTitle}
            onChange={e => setManualTitle(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 w-full"
            type="text"
            placeholder="Description (optionnel)"
            value={manualDesc}
            onChange={e => setManualDesc(e.target.value)}
          />
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
            disabled={addingManual}
          >
            {addingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
          </button>
        </form>
      </div>
    </section>
  );
}
