import { Filter, Search, X } from "lucide-react";
import { useState } from "react";

type Props = {
  filters: {
    veilleId: string | null;
    sentiment: string | null;
    entity: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    search: string;
  };
  setFilters: (f: any) => void;
  sentiments: string[];
  entities: string[];
  veilles: { id: string; name: string }[];
};

export function AnalyseFilters({
  filters,
  setFilters,
  sentiments,
  entities,
  veilles,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFilters({ ...filters, [e.target.name]: e.target.value || null });
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters({ ...filters, search: e.target.value });
  }

  function clearFilters() {
    setFilters({
      veilleId: null,
      sentiment: null,
      entity: null,
      dateFrom: null,
      dateTo: null,
      search: "",
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
        <select
          name="sentiment"
          value={filters.sentiment || ""}
          onChange={handleChange}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Tous sentiments</option>
          {sentiments.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="entity"
          value={filters.entity || ""}
          onChange={handleChange}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Toutes ENR</option>
          {entities.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
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
