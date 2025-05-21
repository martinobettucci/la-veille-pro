/* -------------------------------------------------------------------------- */
/*  AnalyseDashboard.tsx – version blindée (“no-undefined can pass”)          */
/* -------------------------------------------------------------------------- */

import { useEffect, useMemo, useState } from "react";
import { getDB } from "../../utils/db";
import { BarChart3, Info } from "lucide-react";
import { format } from "date-fns";
import { AnalyseFilters } from "./AnalyseFilters";
import { AnalyseStats } from "./AnalyseStats";
import { AnalyseCardDetail } from "./AnalyseCardDetail";
import { Card, Veille, isValidCard } from "../../utils/types";

/* -------------------- Composant ------------------------------------------- */

export function AnalyseDashboard({
  filters,
  setFilters,
  allSentiments,
  allEntities,
  veilles = [],
}: {
  filters: {
    veilleId: string | null;
    sentiments: string[];
    entities: string[];
    dateFrom: string | null;
    dateTo: string | null;
    search: string;
  };
  setFilters: (f: any) => void;
  allSentiments: string[];
  allEntities: string[];
  veilles?: Veille[];
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  /* ---------- Chargement depuis IndexedDB ---------------------------------- */

  useEffect(() => {
    (async () => {
      const db = await getDB();
      const raw = (await db.getAll("cards")) ?? [];
      setCards(raw.filter(isValidCard)); // on stocke **uniquement** les valides
    })();
  }, []);

  /* ---------- Filtres (version reduce) ------------------------------------- */

  const filteredCards = useMemo(() => {
    return cards.reduce<Card[]>((acc, c) => {
      // sécurité supplémentaire
      if (!isValidCard(c)) return acc;

      if (filters.veilleId && c.veilleId !== filters.veilleId) return acc;
      if (
        filters.sentiments.length > 0 &&
        !filters.sentiments.includes(c.sentiment)
      )
        return acc;
      if (
        filters.entities.length > 0 &&
        !c.entities.some((e) => filters.entities.includes(e))
      )
        return acc;
      if (
        filters.dateFrom &&
        c.createdAt < new Date(filters.dateFrom).getTime()
      )
        return acc;
      if (
        filters.dateTo &&
        c.createdAt > new Date(filters.dateTo).getTime()
      )
        return acc;
      if (
        filters.search &&
        !c.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !c.summary.toLowerCase().includes(filters.search.toLowerCase())
      )
        return acc;

      acc.push(c); // Tous les garde-fous sont passés ⇒ on garde la carte
      return acc;
    }, []);
  }, [cards, filters]);

  /* ---------- Regroupement par veille (reduce idem) ------------------------ */

  const cardsByVeille = useMemo(() => {
    return filteredCards.reduce<Record<string, Card[]>>((map, c) => {
      (map[c.veilleId] ||= []).push(c);
      return map;
    }, {});
  }, [filteredCards]);

  /* ---------- Options de menu --------------------------------------------- */

  const veilleOptions = useMemo(
    () => veilles.map((v) => ({ id: v.id, name: v.name })),
    [veilles]
  );

  /* ---------- Rendu -------------------------------------------------------- */

  return (
    <section className="w-full max-w-5xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-blue-600" />
        Analyse
      </h1>

      <p className="text-slate-600 mb-6">
        Toutes les cartes générées lors de la surveillance, avec filtres et
        statistiques globales.
      </p>

      {/* Filtres */}
      <div className="mb-6">
        <AnalyseFilters
          filters={filters}
          setFilters={setFilters}
          sentiments={allSentiments}
          entities={allEntities}
          veilles={veilleOptions}
        />
      </div>

      {/* Statistiques globales */}
      <AnalyseStats cards={filteredCards} />

      {/* Liste par veille */}
      <div className="mt-8">
        {Object.keys(cardsByVeille).length === 0 && (
          <div className="text-slate-500 italic flex items-center gap-2">
            <Info className="w-5 h-5" />
            Aucune carte ne correspond aux filtres sélectionnés.
          </div>
        )}

        {Object.entries(cardsByVeille).map(([veilleId, veilleCards]) => {
          const veille = veilles.find((v) => v.id === veilleId);
          return (
            <div key={veilleId} className="mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {veille ? veille.name : "Sujet inconnu"}
              </h2>

              <ul className="space-y-3">
                {veilleCards.map((card) => (
                  <li
                    key={card.id}
                    className="bg-white rounded shadow p-4 cursor-pointer hover:bg-blue-50 transition"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {card.title}
                      </a>
                      <span className="text-xs text-slate-400 ml-2">
                        {format(card.createdAt, "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 mb-1">
                      {card.summary}
                    </div>

                    <div className="text-xs text-slate-500 mb-1">
                      <span className="font-semibold">ENR :</span>{" "}
                      {card.entities.length > 0 ? (
                        card.entities.join(", ")
                      ) : (
                        <span className="italic">aucune</span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mb-1">
                      <span className="font-semibold">Sentiment :</span>{" "}
                      {card.sentiment}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Détail d’une carte */}
      {selectedCard && (
        <AnalyseCardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </section>
  );
}
