import OpenAI from "openai";
import { getApiKey } from "./openaiKey";

let openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
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
