import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, FolderKanban, Globe } from "lucide-react";
import { getDB } from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { SourceResearch } from "./SourceResearch";

type Veille = {
  id: string;
  name: string;
  keywords: string[];
  sentiments: string[];
  createdAt: number;
};

export function VeilleList({ onSelectVeille }: { onSelectVeille: (veille: Veille) => void }) {
  const [veilles, setVeilles] = useState<Veille[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Veille | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVeille, setSelectedVeille] = useState<Veille | null>(null);

  useEffect(() => {
    loadVeilles();
  }, []);

  async function loadVeilles() {
    const db = await getDB();
    const all = await db.getAll("veilles");
    setVeilles(all.sort((a, b) => b.createdAt - a.createdAt));
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette veille ?")) return;
    const db = await getDB();
    await db.delete("veilles", id);
    loadVeilles();
  }

  function handleEdit(veille: Veille) {
    setEditing(veille);
    setShowForm(true);
  }

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  async function handleSave(veille: Veille) {
    try {
      const db = await getDB();
      await db.put("veilles", veille);
      setShowForm(false);
      setEditing(null);
      setError(null);
      loadVeilles();
    } catch (e) {
      setError("Erreur lors de la sauvegarde.");
    }
  }

  function handleSourceResearch(veille: Veille) {
    setSelectedVeille(veille);
  }

  function handleSourcesAdded() {
    setSelectedVeille(null);
    // Optionally, refresh sources list or show a toast
  }

  function handleGoToDetail(veille: Veille) {
    onSelectVeille(veille);
  }

  return (
    <section className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
          <FolderKanban className="w-6 h-6" />
          Mes veilles
        </h2>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4" />
          Nouvelle veille
        </button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {showForm && (
        <VeilleForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      {selectedVeille ? (
        <SourceResearch veille={selectedVeille} onSourcesAdded={handleSourcesAdded} />
      ) : (
        <ul className="space-y-3">
          {veilles.length === 0 && (
            <li className="text-slate-500 italic">Aucune veille créée pour l’instant.</li>
          )}
          {veilles.map((v) => (
            <li
              key={v.id}
              className="bg-white rounded shadow flex flex-col md:flex-row md:items-center justify-between p-4 gap-2"
            >
              <div>
                <div className="font-semibold text-slate-800">{v.name}</div>
                <div className="text-xs text-slate-500">
                  Mots-clés: {v.keywords.join(", ") || <span className="italic">aucun</span>}
                  <br />
                  Sentiments: {v.sentiments.join(", ") || <span className="italic">aucun</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  className="p-2 rounded hover:bg-blue-100"
                  title="Sources"
                  onClick={() => handleSourceResearch(v)}
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  className="p-2 rounded hover:bg-blue-100"
                  title="Détail"
                  onClick={() => handleGoToDetail(v)}
                >
                  <FolderKanban className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  className="p-2 rounded hover:bg-blue-100"
                  title="Modifier"
                  onClick={() => handleEdit(v)}
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  className="p-2 rounded hover:bg-red-100"
                  title="Supprimer"
                  onClick={() => handleDelete(v.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function VeilleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Veille | null;
  onSave: (veille: Veille) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [keywords, setKeywords] = useState(initial?.keywords.join(", ") || "");
  const [sentiments, setSentiments] = useState(initial?.sentiments.join(", ") || "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de la veille est requis.");
      return;
    }
    const veille: Veille = {
      id: initial?.id || uuidv4(),
      name: name.trim(),
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      sentiments: sentiments
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      createdAt: initial?.createdAt || Date.now(),
    };
    onSave(veille);
  }

  return (
    <form
      className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 flex flex-col gap-3"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nom de la veille <span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mots-clés (séparés par des virgules)
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="ex: IA, innovation, concurrence"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Sentiments à surveiller (séparés par des virgules)
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={sentiments}
          onChange={(e) => setSentiments(e.target.value)}
          placeholder="ex: positif, négatif, neutre, autre"
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Sauvegarder
        </button>
      </div>
    </form>
  );
}
