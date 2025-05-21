import { useEffect, useMemo, useState } from "react";
import { AnalyseDashboard } from "../components/analyse/AnalyseDashboard";
import { SentimentTimelineDashboard } from "../components/analyse/SentimentTimelineDashboard";
import { getDB } from "../utils/db";

export default function AnalysePage() {
  // Centralize filter state here for both dashboards
  const [filters, setFilters] = useState<{
    veilleId: string | null;
    sentiments: string[];
    entities: string[];
    dateFrom: string | null;
    dateTo: string | null;
    search: string;
  }>({
    veilleId: null,
    sentiments: [],
    entities: [],
    dateFrom: null,
    dateTo: null,
    search: "",
  });

  const [allSentiments, setAllSentiments] = useState<string[]>([]);
  const [allEntities, setAllEntities] = useState<string[]>([]);
  const [veilles, setVeilles] = useState<{ id: string; name: string; keywords: string[]; sentiments: string[]; createdAt: number }[]>([]);

  useEffect(() => {
    loadMeta();
  }, []);

  async function loadMeta() {
    const db = await getDB();
    const cards = await db.getAll("cards");
    const veilles = await db.getAll("veilles");
    setVeilles(veilles);

    // Aggregate all unique sentiments/entities from cards
    const sentimentSet = new Set<string>();
    const entitySet = new Set<string>();
    cards.forEach((c: any) => {
      if (c.sentiment) sentimentSet.add(c.sentiment);
      if (c.entities) c.entities.forEach((e: string) => entitySet.add(e));
    });
    setAllSentiments(Array.from(sentimentSet));
    setAllEntities(Array.from(entitySet));
  }

  return (
    <div>
      <AnalyseDashboard
        filters={filters}
        setFilters={setFilters}
        allSentiments={allSentiments}
        allEntities={allEntities}
        veilles={veilles}
      />
      <SentimentTimelineDashboard
        filters={filters}
        allSentiments={allSentiments}
        allEntities={allEntities}
        veilles={veilles}
      />
    </div>
  );
}
