'use client';

import Script from 'next/script';

export default function TestWidgetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            🎯 AdexGenie Widget Test
          </h1>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            Interface professionnelle moderne avec les couleurs AdexGenie
          </p>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-6 text-white">
              <h3 className="mb-2 text-xl font-semibold">✨ Design Moderne</h3>
              <p className="text-sm opacity-90">Gradient bleu cyan avec visualiseur audio animé</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 p-6 text-white">
              <h3 className="mb-2 text-xl font-semibold">💬 Chat Élégant</h3>
              <p className="text-sm opacity-90">Bulles de messages avec timestamps</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white">
              <h3 className="mb-2 text-xl font-semibold">🎨 100% Personnalisable</h3>
              <p className="text-sm opacity-90">Toutes les couleurs modifiables</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 p-6 text-white">
              <h3 className="mb-2 text-xl font-semibold">🔒 Sécurisé</h3>
              <p className="text-sm opacity-90">ServerUrl et agentName privés</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-700">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Configuration</h2>
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
              {`AdexGenie.init({
  agentId: 'demo-agent-123',
  apiUrl: 'https://api.example.com/jwt',
  apiKey: 'pk_demo_key',
  
  // Couleurs personnalisées
  primaryColor: '#00A7E1',
  secondaryColor: '#0066A1',
  accentColor: '#00D4FF'
});`}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Instructions</h2>
          <ol className="list-inside list-decimal space-y-3 text-gray-700 dark:text-gray-300">
            <li>Cliquez sur le bouton flottant 💬 ou 🎯 en bas à droite</li>
            <li>Observez l&apos;interface moderne avec gradient bleu AdexGenie</li>
            <li>Vérifiez le visualiseur audio animé dans la barre de statut</li>
            <li>Testez les bulles de messages et le champ de saisie</li>
            <li>Ouvrez la console : aucun log LiveKit visible !</li>
          </ol>
        </div>
      </div>

      {/* Charger le widget AdexGenie */}
      <Script
        src="/adexgenie-widget.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('AdexGenie widget loaded');
        }}
        onError={(e) => {
          console.error('Failed to load AdexGenie widget', e);
        }}
      />
      <Script id="adexgenie-init" strategy="lazyOnload">
        {`
          function initAdexGenie() {
            if (typeof AdexGenie !== 'undefined') {
              console.log('Initializing AdexGenie...');
              AdexGenie.init({
                agentId: 'demo-agent-123',
                apiUrl: '/api/connection-details',
                apiKey: 'pk_demo_key_12345',
                
                // Couleurs AdexGenie
                primaryColor: '#00A7E1',
                secondaryColor: '#0066A1',
                accentColor: '#00D4FF',
                successColor: '#10b981',
                dangerColor: '#dc2626'
              });
            } else {
              console.error('AdexGenie not found, retrying...');
              setTimeout(initAdexGenie, 100);
            }
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAdexGenie);
          } else {
            initAdexGenie();
          }
        `}
      </Script>
    </div>
  );
}
