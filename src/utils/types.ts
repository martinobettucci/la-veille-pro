/* -------------------------------------------------------------------------- */
/*  Centralized Data Types & Type Guards for Veille App                        */
/* -------------------------------------------------------------------------- */

/**
 * Card: Represents a single analysis card generated from a source.
 */
export type Card = {
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

/**
 * Veille: Represents a monitoring topic or campaign.
 */
export type Veille = {
  id: string;
  name: string;
  keywords: string[];
  sentiments: string[];
  createdAt: number;
};

/**
 * SourceType: Enumerates the types of sources.
 */
export type SourceType = "rss" | "web" | "blog" | "forum" | "manual";

/**
 * Source: Represents a monitored source for a veille.
 */
export type Source = {
  id: string;
  veilleId: string;
  url: string;
  type: SourceType;
  addedAt: number;
  title?: string;
  description?: string;
};

/**
 * Type guard: Checks if an object is a valid Card.
 */
export function isValidCard(card: unknown): card is Card {
  return (
    !!card &&
    typeof card === "object" &&
    typeof (card as Card).id === "string" &&
    typeof (card as Card).veilleId === "string" &&
    typeof (card as Card).title === "string" &&
    typeof (card as Card).createdAt === "number" &&
    Array.isArray((card as Card).entities)
  );
}

/**
 * Type guard: Checks if an object is a valid Veille.
 */
export function isValidVeille(veille: unknown): veille is Veille {
  return (
    !!veille &&
    typeof veille === "object" &&
    typeof (veille as Veille).id === "string" &&
    typeof (veille as Veille).name === "string" &&
    Array.isArray((veille as Veille).keywords) &&
    Array.isArray((veille as Veille).sentiments) &&
    typeof (veille as Veille).createdAt === "number"
  );
}

/**
 * Type guard: Checks if an object is a valid Source.
 */
export function isValidSource(source: unknown): source is Source {
  return (
    !!source &&
    typeof source === "object" &&
    typeof (source as Source).id === "string" &&
    typeof (source as Source).veilleId === "string" &&
    typeof (source as Source).url === "string" &&
    typeof (source as Source).type === "string" &&
    typeof (source as Source).addedAt === "number"
  );
}
