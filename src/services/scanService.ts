import { v4 as uuidv4 } from "uuid";
import { getDB } from "../utils/db";
import { analyzeContentWithOpenAI } from "./openaiContentAnalysis";

// Simulate fetching new articles for a source (mocked for demo)
async function fetchNewArticlesForSource(source: any): Promise<{ title: string; url: string; content: string }[]> {
  // In a real app, you would fetch RSS, scrape, or use APIs.
  // Here, we mock 1-2 articles per source, with unique URLs.
  const now = Date.now();
  return [
    {
      title: `Article ${now % 1000} - ${source.title || source.url}`,
      url: `${source.url}/article-${now % 1000}`,
      content: `Contenu simulé pour ${source.title || source.url} à ${new Date(now).toLocaleString()}.`,
    },
  ];
}

// Main function: scan all sources, analyze new articles, persist cards
export async function scanAndAnalyzeSources(veille: any, sources: any[]): Promise<number> {
  const db = await getDB();
  let cardCount = 0;

  for (const source of sources) {
    // 1. Fetch new articles (simulate)
    const articles = await fetchNewArticlesForSource(source);

    for (const article of articles) {
      // 2. Check if card already exists for this article (by veilleId + article.url)
      const existing = await db.get("cards", `${veille.id}:${article.url}`);
      if (existing) continue;

      // 3. Analyze content with OpenAI
      const analysis = await analyzeContentWithOpenAI({
        veille,
        article,
      });

      // 4. Persist card
      await db.put("cards", {
        id: `${veille.id}:${article.url}`,
        veilleId: veille.id,
        sourceId: source.id,
        title: article.title,
        url: article.url,
        summary: analysis.summary,
        entities: analysis.entities,
        sentiment: analysis.sentiment,
        metrics: analysis.metrics,
        createdAt: Date.now(),
      });
      cardCount++;
    }
  }
  return cardCount;
}
