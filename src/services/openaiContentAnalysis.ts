import OpenAI from "openai";
import { getApiKey } from "../utils/openaiKey";

// Analyze content: summary, ENR, sentiment, metrics
export async function analyzeContentWithOpenAI({
  veille,
  article,
}: {
  veille: {
    id: string;
    name: string;
    keywords: string[];
    sentiments: string[];
    createdAt: number;
  };
  article: {
    title: string;
    url: string;
    content: string;
  };
}): Promise<{
  summary: string;
  entities: string[];
  sentiment: string;
  metrics: Record<string, any>;
}> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Clé API OpenAI manquante.");
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  // Compose prompt for structured output
  const sys = `Tu es un assistant expert en analyse de contenu pour la veille professionnelle.`;
  const user = `Analyse l'article suivant pour la veille "${veille.name}" :
- Mots-clés de la veille : ${veille.keywords.join(", ")}
- Sentiments à surveiller : ${veille.sentiments.join(", ")}

Article :
Titre : ${article.title}
URL : ${article.url}
Contenu : ${article.content}

Donne une analyse structurée au format JSON strict :
{
  "summary": "Résumé ciblé sur les sujets de la veille",
  "entities": ["entité1", "entité2", ...],
  "sentiment": "catégorie parmi la liste ou 'autre'",
  "metrics": {
    "mentions": nombre de fois où les mots-clés sont cités,
    "concepts": ["concept1", ...]
  }
}
Réponds uniquement avec le JSON.`;

  const schema = {
    type: "object",
    properties: {
      summary: { type: "string" },
      entities: { type: "array", items: { type: "string" } },
      sentiment: { type: "string" },
      metrics: {
        type: "object",
        properties: {
          mentions: { type: "number" },
          concepts: { type: "array", items: { type: "string" } },
        },
        required: ["mentions", "concepts"],
        additionalProperties: false,
      },
    },
    required: ["summary", "entities", "sentiment", "metrics"],
    additionalProperties: false,
  };

  const response = await openai.responses.create({
    model: "gpt-4o-2024-08-06",
    input: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "content_analysis",
        schema,
        strict: true,
      },
    },
    max_output_tokens: 600,
    temperature: 0.3,
  });

  const output = response.output[0].content[0];
  if (output.type === "refusal") {
    throw new Error("Refus d'analyse par OpenAI.");
  }
  if (output.type === "output_text") {
    try {
      const parsed = JSON.parse(output.text);
      return {
        summary: parsed.summary,
        entities: parsed.entities,
        sentiment: parsed.sentiment,
        metrics: parsed.metrics,
      };
    } catch {
      throw new Error("Réponse OpenAI non conforme.");
    }
  }
  throw new Error("Réponse OpenAI inattendue.");
}
