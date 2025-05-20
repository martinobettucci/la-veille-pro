import { openDB, DBSchema, IDBPDatabase } from "idb";

interface VeilleDB extends DBSchema {
  veilles: {
    key: string;
    value: {
      id: string;
      name: string;
      keywords: string[];
      sentiments: string[];
      createdAt: number;
    };
  };
  sources: {
    key: string;
    value: {
      id: string;
      veilleId: string;
      url: string;
      type: "rss" | "web" | "blog" | "forum" | "manual";
      addedAt: number;
    };
  };
  cards: {
    key: string;
    value: {
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
  };
}

let dbPromise: Promise<IDBPDatabase<VeilleDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VeilleDB>("veille-db", 1, {
      upgrade(db) {
        db.createObjectStore("veilles", { keyPath: "id" });
        db.createObjectStore("sources", { keyPath: "id" });
        db.createObjectStore("cards", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}
