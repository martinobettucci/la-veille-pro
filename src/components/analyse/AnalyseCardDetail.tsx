import { X, ExternalLink, Info } from "lucide-react";
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

type Props = {
  card: Card;
  onClose: () => void;
};

export function AnalyseCardDetail({ card, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
          onClick={onClose}
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h2>
        <div className="text-xs text-slate-500 mb-2">
          <span className="font-semibold">Date :</span> {format(card.createdAt, "dd/MM/yyyy HH:mm")}
        </div>
        <div className="mb-3">
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 underline"
          >
            Voir la source <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
        <div className="mb-3">
          <span className="font-semibold text-slate-700">Résumé :</span>
          <div className="text-slate-700 text-sm mt-1">{card.summary}</div>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-slate-700">Entités nommées (ENR) :</span>
          <div className="text-slate-600 text-sm mt-1">
            {card.entities.length > 0 ? card.entities.join(", ") : <span className="italic text-slate-400">Aucune</span>}
          </div>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-slate-700">Sentiment :</span>
          <span className="ml-2 text-slate-600">{card.sentiment}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-slate-700">Métriques :</span>
          <div className="text-slate-600 text-sm mt-1">
            {Object.keys(card.metrics).length > 0
              ? Object.entries(card.metrics).map(([k, v]) => (
                  <span key={k} className="inline-block mr-2">
                    <span className="font-medium">{k}:</span> {String(v)}
                  </span>
                ))
              : <span className="italic text-slate-400">Aucune</span>}
          </div>
        </div>
        <div className="mt-4">
          <Info className="inline w-4 h-4 text-blue-400 mr-1" />
          <span className="text-xs text-slate-500">
            Accès rapide aux nouveaux contenus : surveillez régulièrement pour détecter de nouvelles cartes.
          </span>
        </div>
      </div>
    </div>
  );
}
