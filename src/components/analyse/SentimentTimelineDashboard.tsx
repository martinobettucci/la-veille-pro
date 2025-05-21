import { useEffect, useMemo, useRef, useState } from "react";
import { getDB } from "../../utils/db";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, BarElement } from "chart.js";
import { format, subDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Download, Filter, Calendar, BarChart3 } from "lucide-react";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, BarElement);

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

const PERIODS = [
  { label: "7 derniers jours", value: 7 },
  { label: "30 derniers jours", value: 30 },
  { label: "90 derniers jours", value: 90 },
  { label: "Personnalisé...", value: "custom" },
];

function getColorFromString(str: string) {
  // Generate a pastel color from string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 65%)`;
}

export function SentimentTimelineDashboard({
  filters,
  allSentiments,
  allEntities,
  veilles,
}: {
  filters: {
    veilleId: string | null;
    sentiments: string[];
    entities: string[];
    dateFrom: string | null;
    dateTo: string | null;
    search: string;
  };
  allSentiments: string[];
  allEntities: string[];
  veilles: Veille[];
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [period, setPeriod] = useState<number | "custom">(30);
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  // In-memory cache for aggregation
  const cacheRef = useRef<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const db = await getDB();
    const allCards = await db.getAll("cards");
    setCards(allCards);
  }

  // Filter cards by veille and period and filters
  const filteredCards = useMemo(() => {
    let filtered = cards;
    if (filters.veilleId) filtered = filtered.filter(c => c.veilleId === filters.veilleId);
    if (filters.sentiments.length > 0) filtered = filtered.filter(c => filters.sentiments.includes(c.sentiment));
    if (filters.entities.length > 0) filtered = filtered.filter(c => c.entities.some(e => filters.entities.includes(e)));
    if (filters.dateFrom) filtered = filtered.filter(c => c.createdAt >= new Date(filters.dateFrom).getTime());
    if (filters.dateTo) filtered = filtered.filter(c => c.createdAt <= new Date(filters.dateTo).getTime());
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(s) ||
          c.summary.toLowerCase().includes(s)
      );
    }

    let from: Date, to: Date;
    if (period === "custom" && customFrom && customTo) {
      from = startOfDay(new Date(customFrom));
      to = startOfDay(new Date(customTo));
    } else if (typeof period === "number") {
      to = startOfDay(new Date());
      from = subDays(to, period - 1);
    } else {
      to = startOfDay(new Date());
      from = subDays(to, 29);
    }
    filtered = filtered.filter(c => {
      const d = startOfDay(new Date(c.createdAt));
      return (!from || !isBefore(d, from)) && (!to || !isAfter(d, to));
    });
    return filtered;
  }, [cards, filters, period, customFrom, customTo]);

  // Aggregate: group by date + sentiment (from current filter selection)
  const timeline = useMemo(() => {
    // Use cache key based on filters
    const cacheKey = JSON.stringify({
      veilleId: filters.veilleId,
      sentiments: filters.sentiments,
      entities: filters.entities,
      period,
      customFrom,
      customTo,
      search: filters.search,
    });
    if (cacheRef.current[cacheKey]) return cacheRef.current[cacheKey];

    // Get all dates in range
    let from: Date, to: Date;
    if (period === "custom" && customFrom && customTo) {
      from = startOfDay(new Date(customFrom));
      to = startOfDay(new Date(customTo));
    } else if (typeof period === "number") {
      to = startOfDay(new Date());
      from = subDays(to, period - 1);
    } else {
      to = startOfDay(new Date());
      from = subDays(to, 29);
    }
    const days: string[] = [];
    let d = from;
    while (!isAfter(d, to)) {
      days.push(format(d, "yyyy-MM-dd"));
      d = subDays(d, -1);
    }

    // Sentiments to show: from filter, or all if none selected
    const sentimentsToShow =
      filters.sentiments.length > 0 ? filters.sentiments : allSentiments;

    // Group cards
    const byDay: Record<string, Record<string, Card[]>> = {};
    for (const day of days) {
      byDay[day] = {};
      for (const s of sentimentsToShow) {
        byDay[day][s] = [];
      }
    }
    for (const c of filteredCards) {
      const day = format(startOfDay(new Date(c.createdAt)), "yyyy-MM-dd");
      if (byDay[day] && byDay[day][c.sentiment]) {
        byDay[day][c.sentiment].push(c);
      }
    }

    // Prepare chart data
    const datasets = sentimentsToShow.map(s => ({
      label: s,
      data: days.map(day => byDay[day][s].length),
      borderColor: getColorFromString(s),
      backgroundColor: getColorFromString(s) + "33",
      fill: false,
      tension: 0.2,
      pointRadius: 4,
      pointHoverRadius: 7,
    }));

    const chartData = {
      labels: days,
      datasets,
      byDay,
    };

    cacheRef.current[cacheKey] = chartData;
    return chartData;
  }, [
    filteredCards,
    filters.veilleId,
    filters.sentiments,
    filters.entities,
    filters.search,
    period,
    customFrom,
    customTo,
    allSentiments,
  ]);

  // Export as PNG
  const chartRef = useRef<any>(null);
  function handleExportPNG() {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement("a");
      a.href = url;
      a.download = "sentiment-timeline.png";
      a.click();
    }
  }

  // Export as CSV
  function handleExportCSV() {
    const { labels, datasets } = timeline;
    let csv = "Date," + datasets.map((d: any) => d.label).join(",") + "\n";
    for (let i = 0; i < labels.length; i++) {
      csv += labels[i];
      for (const d of datasets) {
        csv += "," + d.data[i];
      }
      csv += "\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sentiment-timeline.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Handle click on point: show cards for that day/sentiment
  const [selectedDay, setSelectedDay] = useState<{ date: string; sentiment: string } | null>(null);
  function handlePointClick(e: any) {
    if (!chartRef.current) return;
    const points = chartRef.current.getElementsAtEventForMode(
      e.nativeEvent,
      "nearest",
      { intersect: true },
      true
    );
    if (points.length > 0) {
      const { datasetIndex, index } = points[0];
      const date = timeline.labels[index];
      const sentiment = timeline.datasets[datasetIndex].label;
      setSelectedDay({ date, sentiment });
    }
  }

  // UI
  return (
    <section className="w-full max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        Évolution temporelle des sentiments
      </h2>
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filters.veilleId || ""}
            onChange={e => {
              // propagate veilleId change
              filters.veilleId = e.target.value || null;
            }}
          >
            <option value="">Toutes les veilles</option>
            {veilles.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={period}
            onChange={e => setPeriod(e.target.value === "custom" ? "custom" : Number(e.target.value))}
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {period === "custom" && (
            <>
              <input
                type="date"
                className="border rounded px-2 py-1 text-xs"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
              />
              <span className="text-xs">→</span>
              <input
                type="date"
                className="border rounded px-2 py-1 text-xs"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
              />
            </>
          )}
        </div>
        <button
          className="ml-auto flex items-center gap-1 text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
          onClick={handleExportPNG}
          title="Exporter en PNG"
        >
          <Download className="w-4 h-4" />
          PNG
        </button>
        <button
          className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
          onClick={handleExportCSV}
          title="Exporter en CSV"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>
      <div className="bg-white rounded shadow p-4">
        <Line
          ref={chartRef}
          data={{
            labels: timeline.labels,
            datasets: timeline.datasets,
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: "top" },
              tooltip: {
                enabled: true,
                callbacks: {
                  title: (items) => {
                    const d = items[0].label;
                    return format(new Date(d), "dd/MM/yyyy");
                  },
                  label: (item) => {
                    const sentiment = item.dataset.label;
                    const count = item.parsed.y;
                    return `${sentiment}: ${count} carte${count > 1 ? "s" : ""}`;
                  },
                },
              },
            },
            onClick: handlePointClick,
            scales: {
              x: {
                title: { display: true, text: "Date" },
                grid: { display: false },
              },
              y: {
                title: { display: true, text: "Nombre de cartes" },
                beginAtZero: true,
                grid: { color: "#f1f5f9" },
                ticks: { stepSize: 1 },
              },
            },
          }}
        />
      </div>
      {selectedDay && (
        <div className="mt-4 bg-slate-50 rounded p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-slate-700">
              {format(new Date(selectedDay.date), "dd/MM/yyyy")} — {selectedDay.sentiment}
            </span>
            <button
              className="ml-auto text-xs text-slate-500 hover:text-red-500"
              onClick={() => setSelectedDay(null)}
            >
              Fermer
            </button>
          </div>
          <ul className="space-y-2">
            {timeline.byDay[selectedDay.date][selectedDay.sentiment].length === 0 && (
              <li className="italic text-slate-400">Aucune carte</li>
            )}
            {timeline.byDay[selectedDay.date][selectedDay.sentiment].map((card: Card) => (
              <li key={card.id} className="bg-white rounded shadow p-2">
                <a href={card.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {card.title}
                </a>
                <div className="text-xs text-slate-500">{card.summary}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
