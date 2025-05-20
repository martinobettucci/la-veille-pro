import OpenAI from "openai";
import { z } from "zod";
import { getApiKey } from "../utils/openaiKey";

// --- 1. Define schemas for each structured output use case ---

// Source suggestion schema
export const SourceSuggestionSchema = z.object({
  url: z.string().url(),
  type: z.enum(["rss", "web", "blog", "forum"]),
  title: z.string(),
  description: z.string(),
});
export const SourceSuggestionsObjectSchema = z.object({
  suggestions: z.array(SourceSuggestionSchema),
});

// --- 2. Singleton OpenAI client ---
let openai: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API key not set");
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return openai;
}

// --- 3. Structured Output: Source Suggestions ---
/**
 * Get source suggestions for a veille using OpenAI Structured Outputs.
 * @param params { keywords: string[], sentiments: string[] }
 * @returns { suggestions: SourceSuggestion[], refusal?: string }
 */
export async function getSourceSuggestions({
  keywords,
  sentiments,
}: {
  keywords: string[];
  sentiments: string[];
}): Promise<{ suggestions: z.infer<typeof SourceSuggestionSchema>[]; refusal?: string }> {
  const openai = getOpenAIClient();

  // Compose prompt
  const sys = `Tu es un assistant expert en veille professionnelle et concurrentielle.`;
  const user = `Pour la veille suivante :
- Mots-clés : ${keywords.join(", ")}
- Sentiments à surveiller : ${sentiments.join(", ")}

Propose une liste de 5 à 10 sources pertinentes (sites web, flux RSS, blogs, forums) à surveiller, au format JSON strict :
{
  "suggestions": [
    {
      "url": "...",
      "type": "rss|web|blog|forum",
      "title": "...",
      "description": "..."
    }
  ]
}
Ne propose que des sources réelles, variées, et connues. Pas de doublons. Réponds uniquement avec le JSON.`;

  // Structured Output: JSON Schema (root object)
  const schema = {
    type: "object",
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            url: { type: "string" }, // Removed "format": "uri"
            type: { type: "string", enum: ["rss", "web", "blog", "forum"] },
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["url", "type", "title", "description"],
          additionalProperties: false,
        },
        minItems: 1,
        maxItems: 10,
      },
    },
    required: ["suggestions"],
    additionalProperties: false,
  };

  try {
    // Use the latest gpt-4o-2024-08-06 model for Structured Outputs
    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06",
      input: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "source_suggestions",
          schema,
          strict: true,
        },
      },
      max_output_tokens: 800,
      temperature: 0.7,
    });

    // Handle refusal or output
    const output = response.output[0].content[0];
    if (output.type === "refusal") {
      return { suggestions: [], refusal: output.refusal };
    }
    if (output.type === "output_text") {
      // Validate with Zod
      const parsed = SourceSuggestionsObjectSchema.safeParse(JSON.parse(output.text));
      if (!parsed.success) {
        throw new Error("Réponse OpenAI non conforme au schéma.");
      }
      return { suggestions: parsed.data.suggestions };
    }
    throw new Error("Réponse OpenAI inattendue.");
  } catch (e: any) {
    // Handle OpenAI errors, refusals, or schema mismatches
    throw new Error(
      "Erreur lors de la génération des suggestions : " +
        (e?.message || e?.toString() || "Erreur inconnue")
    );
  }
}
