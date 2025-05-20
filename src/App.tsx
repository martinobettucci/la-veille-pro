import { useState } from "react";
import { VeilleList } from "./components/VeilleList";
import { VeilleDetail } from "./components/VeilleDetail";
import { AnalyseDashboard } from "./components/analyse";

export default function App() {
  const [selectedVeille, setSelectedVeille] = useState<any>(null);
  const [tab, setTab] = useState<"veilles" | "analyse">("veilles");

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow p-4 flex items-center gap-6">
        <h1 className="text-2xl font-bold text-blue-700">Veille Pro &amp; Concu</h1>
        <nav className="ml-8 flex gap-4">
          <button
            className={`font-semibold ${tab === "veilles" ? "text-blue-700 underline" : "text-slate-600"}`}
            onClick={() => setTab("veilles")}
          >
            Veilles
          </button>
          <button
            className={`font-semibold ${tab === "analyse" ? "text-blue-700 underline" : "text-slate-600"}`}
            onClick={() => setTab("analyse")}
          >
            Analyse
          </button>
        </nav>
      </header>
      <main>
        {tab === "veilles" && (
          selectedVeille ? (
            <VeilleDetail veille={selectedVeille} onBack={() => setSelectedVeille(null)} />
          ) : (
            <VeilleList onSelectVeille={setSelectedVeille} />
          )
        )}
        {tab === "analyse" && <AnalyseDashboard />}
      </main>
    </div>
  );
}
