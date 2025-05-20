import { TrendingUp, Users, PieChart, Calendar } from "lucide-react";
import { useMemo } from "react";
import { format } from "date-fns";

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

export function AnalyseStats({ cards }: { cards: Card[] }) {
  // Stat: Nombre de cartes par sentiment
  const sentimentStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cards) {
      map[c.sentiment] = (map[c.sentiment] || 0) + 1;
    }
    return map;
  }, [cards]);

  // Stat: ENR distribution
  const entityStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cards) {
      for (const e of c.entities) {
        map[e] = (map[e] || 0) + 1;
      }
    }
    return map;
  }, [cards]);

  // Stat: Activity trend (cards per day)
  const trendStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cards) {
      const day = format(c.createdAt, "yyyy-MM-dd");
      map[day] = (map[day] || 0) + 1;
    }
    // Sort by date
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [cards]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-700">Cartes par sentiment</span>
        </div>
        <ul className="text-sm text-slate-600">
          {Object.keys(sentimentStats).length === 0 && <li className="italic text-slate-400">Aucune donnée</li>}
          {Object.entries(sentimentStats).map(([sentiment, count]) => (
            <li key={sentiment}>
              <span className="font-medium">{sentiment} :</span> {count}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-slate-700">Répartition des ENR</span>
        </div>
        <ul className="text-sm text-slate-600">
          {Object.keys(entityStats).length === 0 && <li className="italic text-slate-400">Aucune donnée</li>}
          {Object.entries(entityStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([entity, count]) => (
              <li key={entity}>
                <span className="font-medium">{entity} :</span> {count}
              </li>
            ))}
        </ul>
      </div>
      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-slate-700">Tendance d’activité</span>
        </div>
        <div className="text-xs text-slate-500 mb-1">
          <Calendar className="inline w-4 h-4 mr-1" />
          {trendStats.length} jours analysés
        </div>
        <div className="h-16 flex items-end gap-1">
          {trendStats.length === 0 && <span className="italic text-slate-400">Aucune donnée</span>}
          {trendStats.map(({ date, count }) => (
            <div key={date} className="flex flex-col items-center" title={date}>
              <div
                className="bg-blue-400 rounded-t"
                style={{
                  width: "10px",
                  height: `${Math.max(8, count * 10)}px`,
                  minHeight: "8px",
                  transition: "height 0.2s",
                }}
              ></div>
              <span className="text-[10px] text-slate-400">{date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
