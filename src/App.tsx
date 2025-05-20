import { useEffect, useState } from "react";
import { Settings, Search, BarChart3 } from "lucide-react";
import { getApiKey, setApiKey } from "./utils/openaiKey";
import { AppDocumentation } from "../documentation/AppDocumentation";
import { VeilleList } from "./components/VeilleList";
import { VeilleDetail } from "./components/VeilleDetail";

export default function App() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedVeille, setSelectedVeille] = useState<any>(null);

  useEffect(() => {
    const key = getApiKey();
    if (!key) setShowApiKeyModal(true);
    setApiKeyState(key);
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    setApiKeyState(key);
    setShowApiKeyModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Veille Pro & Concurrentielle</h1>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={() => setShowApiKeyModal(true)}
        >
          <Settings className="w-5 h-5" />
          <span>Clé API</span>
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center gap-6">
            <BarChart3 className="w-16 h-16 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-700 text-center">
              Bienvenue dans votre assistant de veille professionnelle et concurrentielle
            </h2>
            <p className="text-slate-600 text-center">
              Créez, surveillez et analysez vos veilles en toute confidentialité.<br />
              Toutes les données et la clé API restent <b>locales</b> sur votre navigateur.
            </p>
            <AppDocumentation />
          </div>
          {!selectedVeille ? (
            <VeilleList onSelectVeille={setSelectedVeille} />
          ) : (
            <VeilleDetail veille={selectedVeille} onBack={() => setSelectedVeille(null)} />
          )}
        </div>
      </main>
      {showApiKeyModal && (
        <ApiKeyModal
          onSave={handleSaveKey}
          onClose={() => setShowApiKeyModal(false)}
          initialValue={apiKey || ""}
        />
      )}
    </div>
  );
}

function ApiKeyModal({
  onSave,
  onClose,
  initialValue,
}: {
  onSave: (key: string) => void;
  onClose: () => void;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-800">Entrer votre clé API OpenAI</h3>
        <input
          className="border rounded px-3 py-2 w-full"
          type="password"
          placeholder="sk-..."
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onSave(value)}
            disabled={!value.startsWith("sk-")}
          >
            Sauvegarder
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Votre clé API est stockée uniquement dans votre navigateur (localStorage).
        </p>
      </div>
    </div>
  );
}
