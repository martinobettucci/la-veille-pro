import { useEffect, useState } from "react";
import { getDB } from "../../utils/db";
import { BarChart3 } from "lucide-react";

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

export function CardList({ veilleId }: { veilleId: string }) {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line
  }, [veilleId]);

  async function loadCards() {
    const db = await getDB();
    const all = await db.getAll("cards");
    setCards(all.filter((c) => c.veilleId === veilleId).sort((a, b) => b.createdAt - a.createdAt));
  }

  if (cards.length === 0) {
    return (
      <div className="text-slate-500 italic mt-8">
        <BarChart3 className="inline w-5 h-5 mr-1" />
        Aucune carte d’analyse générée pour cette veille.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-blue-700 mb-4">Cartes d’analyse générées</h3>
      <ul className="space-y-4">
        {cards.map((card) => (
          <li key={card.id} className="bg-white rounded shadow p-4">
            <div className="font-bold text-slate-800 mb-1">
              <a href={card.url} target="_blank" rel="noopener noreferrer" className="underline">
                {card.title}
              </a>
            </div>
            <div className="text-sm text-slate-600 mb-2">{card.summary}</div>
            <div className="text-xs text-slate-500 mb-1">
              <span className="font-semibold">ENR :</span> {card.entities.join(", ") || <span className="italic">aucune</span>}
            </div>
            <div className="text-xs text-slate-500 mb-1">
              <span className="font-semibold">Sentiment :</span> {card.sentiment}
            </div>
            <div className="text-xs text-slate-400">
              <span className="font-semibold">Métriques :</span> {Object.entries(card.metrics).map(([k, v]) => `${k}: ${v}`).join(", ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
