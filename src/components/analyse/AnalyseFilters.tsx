import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type FiltersType = {
  veilleId: string | null;
  sentiments: string[];
  entities: string[];
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
};

type Props = {
  filters?: FiltersType; // Make optional for defensive fallback
  setFilters: (f: FiltersType) => void;
  sentiments: string[];
  entities: string[];
  veilles: { id: string; name: string }[];
};

const DEFAULT_FILTERS: FiltersType = {
  veilleId: null,
  sentiments: [],
  entities: [],
  dateFrom: null,
  dateTo: null,
  search: "",
};

export function AnalyseFilters({
  filters = DEFAULT_FILTERS,
  setFilters,
  sentiments,
  entities,
  veilles,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSentiments, setShowSentiments] = useState(false);
  const [showEntities, setShowEntities] = useState(false);

  // Defensive: If filters is undefined, show a warning and return null
  if (!filters) {
    return (
      <div className="bg-red-100 text-red-700 p-2 rounded">
        Erreur : les filtres ne sont pas initialisés.
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFilters({ ...filters, [e.target.name]: e.target.value || null });
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters({ ...filters, search: e.target.value });
  }

  function clearFilters() {
    setFilters({ ...DEFAULT_FILTERS });
  }

  function toggleSentiment(s: string) {
    setFilters({
      ...filters,
      sentiments: filters.sentiments.includes(s)
        ? filters.sentiments.filter((x) => x !== s)
        : [...filters.sentiments, s],
    });
  }

  function toggleEntity(e: string) {
    setFilters({
      ...filters,
      entities: filters.entities.includes(e)
        ? filters.entities.filter((x) => x !== e)
        : [...filters.entities, e],
    });
  }

  return (
    <div className="bg-slate-50 rounded p-4 shadow flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-slate-700">Filtres</span>
        <button
          className="ml-auto text-xs text-blue-600 underline"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? "Masquer avancé" : "Avancé"}
        </button>
        <button
          className="ml-2 text-xs text-slate-500 hover:text-red-500"
          onClick={clearFilters}
          title="Réinitialiser"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <select
          name="veilleId"
          value={filters.veilleId || ""}
          onChange={handleChange}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Tous les sujets</option>
          {veilles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        {/* Multi-select for sentiments */}
        <div className="relative">
          <button
            type="button"
            className="border rounded px-2 py-1 text-sm flex items-center gap-1 min-w-[120px]"
            onClick={() => setShowSentiments((v) => !v)}
          >
            {filters.sentiments.length === 0
              ? "Tous sentiments"
              : filters.sentiments.join(", ")}
            {showSentiments ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
          {showSentiments && (
            <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 min-w-[160px] max-h-48 overflow-auto">
              {sentiments.length === 0 && (
                <div className="text-xs text-slate-400 italic">Aucun</div>
              )}
              {sentiments.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 text-sm cursor-pointer py-1"
                >
                  <input
                    type="checkbox"
                    checked={filters.sentiments.includes(s)}
                    onChange={() => toggleSentiment(s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Multi-select for entities */}
        <div className="relative">
          <button
            type="button"
            className="border rounded px-2 py-1 text-sm flex items-center gap-1 min-w-[120px]"
            onClick={() => setShowEntities((v) => !v)}
          >
            {filters.entities.length === 0
              ? "Toutes ENR"
              : filters.entities.join(", ")}
            {showEntities ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
          {showEntities && (
            <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 min-w-[160px] max-h-48 overflow-auto">
              {entities.length === 0 && (
                <div className="text-xs text-slate-400 italic">Aucun</div>
              )}
              {entities.map((e) => (
                <label
                  key={e}
                  className="flex items-center gap-2 text-sm cursor-pointer py-1"
                >
                  <input
                    type="checkbox"
                    checked={filters.entities.includes(e)}
                    onChange={() => toggleEntity(e)}
                  />
                  <span>{e}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleSearch}
          placeholder="Recherche titre ou résumé"
          className="border rounded px-2 py-1 text-sm flex-1 min-w-[180px]"
        />
      </div>
      {showAdvanced && (
        <div className="flex gap-3 items-center">
          <label className="text-xs text-slate-600">
            Date de&nbsp;début&nbsp;:
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom || ""}
              onChange={handleChange}
              className="border rounded px-2 py-1 text-xs ml-1"
            />
          </label>
          <label className="text-xs text-slate-600">
            Date de&nbsp;fin&nbsp;:
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo || ""}
              onChange={handleChange}
              className="border rounded px-2 py-1 text-xs ml-1"
            />
          </label>
        </div>
      )}
    </div>
  );
}
