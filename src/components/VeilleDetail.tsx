import { useEffect, useState } from "react";
import { getDB } from "../utils/db";
import { ScanSourcesButton } from "./scan/ScanSourcesButton";
import { CardList } from "./scan/CardList";
import { Globe, Rss, BookOpen, MessageCircle, Plus } from "lucide-react";

type Veille = {
  id: string;
  name: string;
  keywords: string[];
  sentiments: string[];
  createdAt: number;
};

type SourceType = "rss" | "web" | "blog" | "forum" | "manual";

type Source = {
  id: string;
  veilleId: string;
  url: string;
  type: SourceType;
  addedAt: number;
  title?: string;
  description?: string;
};

const typeIcons: Record<SourceType, JSX.Element> = {
  rss: <Rss className="w-5 h-5 text-orange-500" />,
  web: <Globe className="w-5 h-5 text-blue-500" />,
  blog: <BookOpen className="w-5 h-5 text-green-500" />,
  forum: <MessageCircle className="w-5 h-5 text-purple-500" />,
  manual: <Plus className="w-5 h-5 text-slate-500" />,
};

export function VeilleDetail({ veille, onBack }: { veille: Veille; onBack: () => void }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    loadSources();
    // eslint-disable-next-line
  }, [veille.id, refresh]);

  async function loadSources() {
    const db = await getDB();
    const all = await db.getAll("sources");
    setSources(all.filter((s) => s.veilleId === veille.id));
  }

  function handleScanComplete() {
    setRefresh((r) => r + 1);
  }

  return (
    <section className="w-full max-w-3xl mx-auto mt-8">
      <button
        className="mb-4 text-blue-600 underline"
        onClick={onBack}
      >
        &larr; Retour à la liste des veilles
      </button>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{veille.name}</h2>
      <div className="mb-4 text-slate-600">
        <span className="font-semibold">Mots-clés :</span> {veille.keywords.join(", ") || <span className="italic">aucun</span>}
        <br />
        <span className="font-semibold">Sentiments :</span> {veille.sentiments.join(", ") || <span className="italic">aucun</span>}
      </div>
      <h3 className="text-lg font-semibold text-blue-700 mb-2">Sources surveillées</h3>
      <ul className="space-y-2 mb-6">
        {sources.length === 0 && (
          <li className="text-slate-500 italic">Aucune source associée à cette veille.</li>
        )}
        {sources.map((s) => (
          <li key={s.id} className="bg-white rounded shadow flex items-center gap-3 p-3">
            {typeIcons[s.type]}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline font-medium">
              {s.title || s.url}
            </a>
            <span className="text-xs text-slate-500">{s.description}</span>
          </li>
        ))}
      </ul>
      <ScanSourcesButton veille={veille} sources={sources} onScanComplete={handleScanComplete} />
      <CardList veilleId={veille.id} />
    </section>
  );
}
