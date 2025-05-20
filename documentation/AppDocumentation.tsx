export function AppDocumentation() {
  return (
    <section className="mt-8 bg-white rounded-lg shadow p-6 text-slate-700">
      <h3 className="text-lg font-bold mb-2">À propos de l’application</h3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>
          <b>100% front-end</b> : aucune donnée n’est transmise ailleurs que chez OpenAI.
        </li>
        <li>
          <b>Clé API OpenAI</b> : paramétrable, stockée localement, jamais partagée.
        </li>
        <li>
          <b>Veilles, sources, cartes</b> : tout est persistant dans IndexedDB/localStorage.
        </li>
        <li>
          <b>Analyse IA</b> : tous les résumés, entités, sentiments sont générés via l’API OpenAI (StructuredOutput).
        </li>
        <li>
          <b>UI/UX</b> : interface responsive, professionnelle, dashboard analytique.
        </li>
      </ul>
      <div className="mt-4 text-xs text-slate-500">
        <b>Confidentialité :</b> toutes vos données restent sur votre navigateur.
      </div>
    </section>
  );
}
