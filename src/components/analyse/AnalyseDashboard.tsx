import { useEffect, useMemo, useState } from "react";
import { getDB } from "../../utils/db";
import { BarChart3, Filter, Search, X, Info, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { AnalyseFilters } from "./AnalyseFilters";
import { AnalyseStats } from "./AnalyseStats";
import { AnalyseCardDetail } from "./AnalyseCardDetail";

type Card = {
  id: string;
  veilleId: string;
  sourceId: string;
  title: string;
  url: string;
  summary: string;
  entities: string[];
  sentiment: string;
  metrics: Record<string, any>;
  createdAt: number;
};

type Veille = {
  id: string;
  name: string;
  keywords: string[];
  sentiments: string[];
  createdAt: number;
};

export function AnalyseDashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [veilles, setVeilles] = useState<Veille[]>([]);
  const [filters, setFilters] = useState<{
    veilleId: string | null;
    sentiment: string | null;
    entity: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    search: string;
  }>({
    veilleId: null,
    sentiment: null,
    entity: null,
    dateFrom: null,
    dateTo: null,
    search: "",
  });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const db = await getDB();
    const allCards = await db.getAll("cards");
    const allVeilles = await db.getAll("veilles");
    setCards(allCards);
    setVeilles(allVeilles);
  }

  // Filtering logic
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (filters.veilleId && card.veilleId !== filters.veilleId) return false;
      if (filters.sentiment && card.sentiment !== filters.sentiment) return false;
      if (filters.entity && !card.entities.includes(filters.entity)) return false;
      if (filters.dateFrom && card.createdAt < new Date(filters.dateFrom).getTime()) return false;
      if (filters.dateTo && card.createdAt > new Date(filters.dateTo).getTime()) return false;
      if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase()) && !card.summary.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [cards, filters]);

  // Group by veille
  const cardsByVeille = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const card of filteredCards) {
      if (!map[card.veilleId]) map[card.veilleId] = [];
      map[card.veilleId].push(card);
    }
    return map;
  }, [filteredCards]);

  // All unique sentiments and entities for filters
  const allSentiments = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => set.add(c.sentiment));
    return Array.from(set);
  }, [cards]);
  const allEntities = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => c.entities.forEach((e) => set.add(e)));
    return Array.from(set);
  }, [cards]);

  // All veilles for filter dropdown
  const veilleOptions = useMemo(() => {
    return veilles.map((v) => ({ id: v.id, name: v.name }));
  }, [veilles]);

  return (
    <section className="w-full max-w-5xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-blue-600" />
        Analyse
      </h1>
      <p className="text-slate-600 mb-6">
        Toutes les cartes générées lors de la surveillance, avec filtres et statistiques globales.
      </p>
      <div className="mb-6">
        <AnalyseFilters
          filters={filters}
          setFilters={setFilters}
          sentiments={allSentiments}
          entities={allEntities}
          veilles={veilleOptions}
        />
      </div>
      <AnalyseStats cards={filteredCards} />
      <div className="mt-8">
        {Object.keys(cardsByVeille).length === 0 && (
          <div className="text-slate-500 italic flex items-center gap-2">
            <Info className="w-5 h-5" />
            Aucune carte ne correspond aux filtres sélectionnés.
          </div>
        )}
        {Object.entries(cardsByVeille).map(([veilleId, cards]) => {
          const veille = veilles.find((v) => v.id === veilleId);
          return (
            <div key={veilleId} className="mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {veille ? veille.name : "Sujet inconnu"}
              </h2>
              <ul className="space-y-3">
                {cards.map((card) => (
                  <li
                    key={card.id}
                    className="bg-white rounded shadow p-4 cursor-pointer hover:bg-blue-50 transition"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <a href={card.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {card.title}
                      </a>
                      <span className="text-xs text-slate-400 ml-2">{format(card.createdAt, "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-1">{card.summary}</div>
                    <div className="text-xs text-slate-500 mb-1">
                      <span className="font-semibold">ENR :</span> {card.entities.join(", ") || <span className="italic">aucune</span>}
                    </div>
                    <div className="text-xs text-slate-500 mb-1">
                      <span className="font-semibold">Sentiment :</span> {card.sentiment}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {selectedCard && (
        <AnalyseCardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </section>
  );
}
