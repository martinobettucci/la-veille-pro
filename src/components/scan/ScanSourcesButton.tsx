import { useState } from "react";
import { scanAndAnalyzeSources } from "../../services/scanService";
import { Loader2, BarChart3 } from "lucide-react";

type Veille = {
  id: string;
  name: string;
  keywords: string[];
  sentiments: string[];
  createdAt: number;
};

type Source = {
  id: string;
  veilleId: string;
  url: string;
  type: string;
  addedAt: number;
  title?: string;
  description?: string;
};

export function ScanSourcesButton({
  veille,
  sources,
  onScanComplete,
}: {
  veille: Veille;
  sources: Source[];
  onScanComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleScan() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const count = await scanAndAnalyzeSources(veille, sources);
      setResult(`${count} carte${count > 1 ? "s" : ""} générée${count > 1 ? "s" : ""}.`);
      onScanComplete();
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-8">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        onClick={handleScan}
        disabled={loading || sources.length === 0}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
        Lancer l’analyse des sources
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {result && <div className="text-green-700 mt-2">{result}</div>}
    </div>
  );
}
