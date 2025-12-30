# AdexGenie Widget SDK - Documentation

SDK JavaScript pour intégrer un agent vocal LiveKit dans n'importe quel site web.

---

## 📦 Installation

### Option 1 : CDN / Script externe

Ajoutez le script dans votre page HTML :

```html
<script src="https://votre-domaine.com/adexgenie-widget.min.js"></script>
```

### Option 2 : Téléchargement local

1. Copiez le fichier `adexgenie-widget.min.js` dans votre projet
2. Incluez-le dans votre HTML :

```html
<script src="/path/to/adexgenie-widget.min.js"></script>
```

---

## 🚀 Utilisation rapide

### Mode Popup (par défaut)

Affiche un bouton flottant (FAB) en bas à droite. Au clic, une fenêtre de chat s'ouvre.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon Site</title>
</head>
<body>
    <!-- Votre contenu -->

    <script src="/adexgenie-widget.min.js"></script>
    <script>
        const widget = new window.AdexGenieWidget({
            agentId: 'VOTRE_AGENT_ID',
            apiUrl: 'https://monvoice.adexgenie.ai/api/agent/generate-token',
            apiKey: 'VOTRE_API_KEY'
        });
    </script>
</body>
</html>
```

### Mode Plein Écran (fullWindow)

Affiche l'agent en plein écran, idéal pour une page dédiée.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Agent Vocal</title>
</head>
<body>
    <script src="/adexgenie-widget.min.js"></script>
    <script>
        const widget = new window.AdexGenieWidget({
            agentId: 'VOTRE_AGENT_ID',
            apiUrl: 'https://monvoice.adexgenie.ai/api/agent/generate-token',
            apiKey: 'VOTRE_API_KEY',
            displayMode: 'fullWindow'
        });
    </script>
</body>
</html>
```

---

## ⚙️ Configuration

### Paramètres obligatoires

| Paramètre | Type | Description |
|-----------|------|-------------|
| `agentId` | `string` | ID unique de votre agent LiveKit |
| `apiUrl` | `string` | URL de l'API pour générer le token de connexion |
| `apiKey` | `string` | Clé API pour l'authentification (format: `pk_agent_xxx`) |

### Paramètres optionnels

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `displayMode` | `'popup' \| 'fullWindow'` | `'popup'` | Mode d'affichage du widget |
| `chatPadding` | `string` | `'0'` | Padding CSS de la fenêtre de chat |
| `flowType` | `'voice' \| 'text' \| 'audio_to_text' \| 'text_to_audio'` | Auto-détecté | Type d'interaction avec l'agent |
| `agentType` | `string` | Auto-détecté | Type d'agent (voice, text, etc.) |
| `agentName` | `string` | Auto-détecté | Nom affiché de l'agent |

---

## 📐 Modes d'affichage

### Mode `popup` (défaut)

- Bouton flottant (FAB) en bas à droite de l'écran
- Fenêtre de chat de 400x600px
- L'utilisateur clique pour ouvrir/fermer
- Idéal pour intégration sur un site existant

```javascript
new window.AdexGenieWidget({
    agentId: 'xxx',
    apiUrl: 'https://...',
    apiKey: 'pk_agent_xxx',
    displayMode: 'popup'
});
```

### Mode `fullWindow`

- Occupe 100% de la fenêtre du navigateur
- Pas de bouton FAB, connexion automatique
- Idéal pour une page dédiée à l'agent
- Affiche un bouton "Recommencer" à la fin de session

```javascript
new window.AdexGenieWidget({
    agentId: 'xxx',
    apiUrl: 'https://...',
    apiKey: 'pk_agent_xxx',
    displayMode: 'fullWindow'
});
```

---

## 🎨 Personnalisation CSS

### Padding de la fenêtre de chat

```javascript
new window.AdexGenieWidget({
    agentId: 'xxx',
    apiUrl: 'https://...',
    apiKey: 'pk_agent_xxx',
    displayMode: 'fullWindow',
    chatPadding: '20px'           // Padding uniforme
    // chatPadding: '20px 40px'   // Vertical, Horizontal
    // chatPadding: '10px 20px 30px 40px'  // Top, Right, Bottom, Left
});
```

### Classes CSS personnalisables

Le widget injecte les classes CSS suivantes que vous pouvez surcharger :

```css
/* Bouton flottant (mode popup) */
.ag-fab { }
.ag-fab:hover { }
.ag-fab.close { }

/* Container popup */
.ag-widget-container { }
.ag-widget-container.active { }

/* Container plein écran */
.ag-fullwindow-container { }
```

**Exemple de personnalisation :**

```html
<style>
    /* Changer la couleur du bouton FAB */
    .ag-fab {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%) !important;
    }
    
    /* Changer le border-radius du popup */
    .ag-widget-container {
        border-radius: 16px !important;
    }
</style>
```

---

## 🔊 Types de flux (flowType)

L'agent supporte différents modes d'interaction :

| flowType | Description |
|----------|-------------|
| `voice` | Audio bidirectionnel (micro + haut-parleur) |
| `text` | Chat texte uniquement |
| `audio_to_text` | L'utilisateur parle, l'agent répond en texte |
| `text_to_audio` | L'utilisateur écrit, l'agent répond en audio |

```javascript
new window.AdexGenieWidget({
    agentId: 'xxx',
    apiUrl: 'https://...',
    apiKey: 'pk_agent_xxx',
    flowType: 'voice'  // Forcer le mode vocal
});
```

> **Note :** Par défaut, le flowType est auto-détecté depuis la configuration de l'agent.

---

## 🔧 API de l'agent

### Endpoint de génération de token

Le widget appelle l'API pour obtenir un token de connexion LiveKit.

**Requête :**
```
POST {apiUrl}
Headers:
  Content-Type: application/json
  X-Agent-API-Key: {apiKey}

Body:
{
  "agent_id": "{agentId}"
}
```

**Réponse attendue :**
```json
{
  "url": "wss://livekit-server.example.com",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "participant_name": "User",
  "agent_name": "Agent",
  "agent": {
    "id": "xxx",
    "name": "Mon Agent",
    "type": "voice",
    "flow_type": "voice"
  }
}
```

---

## 🐛 Débogage

Activez les logs de débogage :

```javascript
window.AdexGenieWidgetDebug = true;

const widget = new window.AdexGenieWidget({
    agentId: 'xxx',
    apiUrl: 'https://...',
    apiKey: 'pk_agent_xxx'
});
```

Les logs apparaîtront dans la console du navigateur avec le préfixe `[AdexGenieWidget]`.

---

## 📱 Responsive

Le widget s'adapte automatiquement aux écrans mobiles :

- **Mode popup** : La fenêtre s'étend sur toute la largeur avec des marges réduites
- **Mode fullWindow** : Occupe 100% de l'écran

---

## 🔒 Sécurité

- La clé API (`apiKey`) est exposée côté client - utilisez des clés avec permissions limitées
- L'API doit avoir CORS activé pour votre domaine
- Les tokens LiveKit ont une durée de vie limitée

---

## 📋 Exemples complets

### Page dédiée à l'agent

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assistant Vocal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
    </style>
</head>
<body>
    <script src="/adexgenie-widget.min.js"></script>
    <script>
        new window.AdexGenieWidget({
            agentId: '86adb895-2473-4590-89f2-bf3cdd925c82',
            apiUrl: 'https://monvoice.adexgenie.ai/api/agent/generate-token',
            apiKey: 'pk_agent_0d45537de1ea10abc0ec',
            displayMode: 'fullWindow',
            chatPadding: '20px'
        });
    </script>
</body>
</html>
```

### Widget popup sur un site e-commerce

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ma Boutique</title>
</head>
<body>
    <header>
        <h1>Bienvenue sur Ma Boutique</h1>
    </header>
    
    <main>
        <!-- Contenu de votre site -->
    </main>

    <!-- Widget d'assistance vocale -->
    <script src="/adexgenie-widget.min.js"></script>
    <script>
        new window.AdexGenieWidget({
            agentId: 'VOTRE_AGENT_ID',
            apiUrl: 'https://monvoice.adexgenie.ai/api/agent/generate-token',
            apiKey: 'VOTRE_API_KEY',
            displayMode: 'popup',
            agentName: 'Assistant Shopping'
        });
    </script>
</body>
</html>
```

### Intégration React/Vue/Angular

```javascript
// Dans votre composant
useEffect(() => {
    // Charger le script dynamiquement
    const script = document.createElement('script');
    script.src = '/adexgenie-widget.min.js';
    script.onload = () => {
        new window.AdexGenieWidget({
            agentId: 'xxx',
            apiUrl: 'https://...',
            apiKey: 'pk_agent_xxx',
            displayMode: 'popup'
        });
    };
    document.body.appendChild(script);

    return () => {
        // Cleanup si nécessaire
        const widgetRoot = document.getElementById('adexgenie-widget-root');
        if (widgetRoot) widgetRoot.remove();
    };
}, []);
```

---

## 📞 Support

Pour toute question ou problème :
- Vérifiez que votre `agentId` et `apiKey` sont corrects
- Activez le mode debug pour voir les erreurs
- Vérifiez la console du navigateur pour les erreurs CORS

---

## 📄 Changelog

### v1.0.0
- Mode `popup` avec bouton FAB
- Mode `fullWindow` plein écran
- Paramètre `chatPadding` pour personnaliser l'espacement
- Support des différents `flowType` (voice, text, audio_to_text, text_to_audio)
- Auto-détection du type d'agent depuis l'API

---

## 🔄 Workflow Complet : Connexion et Communication

### Architecture globale

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Site Web      │      │   API Backend   │      │  LiveKit Server │
│   (SDK Widget)  │      │  (Token Gen)    │      │  + Agent Python │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │  1. POST /generate-token                        │
         │  ─────────────────────>│                        │
         │                        │                        │
         │  2. {url, token}       │                        │
         │  <─────────────────────│                        │
         │                        │                        │
         │  3. WebSocket connect (wss://...)               │
         │  ───────────────────────────────────────────────>
         │                        │                        │
         │  4. Audio/Text bidirectionnel via WebRTC        │
         │  <══════════════════════════════════════════════>
         │                        │                        │
```

### Étape 1 : Initialisation du Widget

```javascript
const widget = new window.AdexGenieWidget({
    agentId: 'xxx',
    apiUrl: 'https://monvoice.adexgenie.ai/api/agent/generate-token',
    apiKey: 'pk_agent_xxx',
    displayMode: 'fullWindow'
});
```

**Ce qui se passe :**
1. Le widget crée un container DOM (`#adexgenie-widget-root`)
2. Injecte les styles CSS
3. En mode `popup` : affiche le bouton FAB
4. En mode `fullWindow` : lance directement la connexion

---

### Étape 2 : Obtention du Token LiveKit

**Requête HTTP envoyée par le SDK :**

```http
POST https://monvoice.adexgenie.ai/api/agent/generate-token
Content-Type: application/json
X-Agent-API-Key: pk_agent_xxx

{
  "agent_id": "86adb895-2473-4590-89f2-bf3cdd925c82"
}
```

**Réponse de l'API :**

```json
{
  "url": "wss://livekit.adexgenie.ai",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "participant_name": "User",
  "agent_name": "Assistant",
  "agent": {
    "id": "86adb895-2473-4590-89f2-bf3cdd925c82",
    "name": "Mon Agent",
    "type": "voice",
    "flow_type": "voice"
  }
}
```

**Le token JWT contient :**
- `room` : Nom de la room LiveKit (unique par session)
- `identity` : Identité du participant (User)
- `permissions` : Droits (publish audio, subscribe, etc.)
- `exp` : Expiration du token

---

### Étape 3 : Connexion WebSocket à LiveKit

Le SDK utilise `@livekit/components-react` pour établir la connexion :

```jsx
<LiveKitRoom
  serverUrl="wss://livekit.adexgenie.ai"
  token="eyJhbGciOiJIUzI1NiIs..."
  connect={true}
  audio={true}   // Active le microphone
  video={false}  // Pas de vidéo
>
  <RoomAudioRenderer />  // Joue l'audio de l'agent
  <PopupView />          // Interface utilisateur
</LiveKitRoom>
```

**Séquence de connexion :**
1. WebSocket vers `wss://livekit.adexgenie.ai`
2. Authentification avec le token JWT
3. Création/Rejoindre la Room
4. L'agent Python (côté serveur) rejoint automatiquement la même room
5. Négociation WebRTC pour les flux audio

---

### Étape 4 : Communication Audio (Mode Voice)

```
┌──────────────┐                    ┌──────────────┐
│   Utilisateur │                    │    Agent     │
│   (Browser)   │                    │   (Python)   │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │  [Parle dans le micro]            │
       │  ════════════════════════════════>│
       │  (WebRTC Audio Track)             │
       │                                   │
       │                    [STT: Speech-to-Text]
       │                    [LLM: Génère réponse]
       │                    [TTS: Text-to-Speech]
       │                                   │
       │  (WebRTC Audio Track)             │
       │<══════════════════════════════════│
       │  [Haut-parleur joue la réponse]   │
       │                                   │
```

**Hooks React utilisés :**
- `useVoiceAssistant()` : État de l'agent (listening, thinking, speaking)
- `useTranscriptions()` : Transcriptions STT en temps réel
- `RoomAudioRenderer` : Joue l'audio reçu de l'agent

---

### Étape 5 : Communication Texte (Chat)

```
┌──────────────┐                    ┌──────────────┐
│   Utilisateur │                    │    Agent     │
│   (Browser)   │                    │   (Python)   │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │  [Tape un message]                │
       │  room.localParticipant            │
       │    .publishData(message)          │
       │  ─────────────────────────────────>
       │  (DataChannel)                    │
       │                                   │
       │                    [LLM: Génère réponse]
       │                                   │
       │  (DataChannel ou Audio)           │
       │<───────────────────────────────────
       │  [Affiche la réponse]             │
       │                                   │
```

**Code côté SDK :**
```javascript
// Envoi d'un message texte
const { send } = useChat();
send("Bonjour, comment ça va ?");

// Réception des messages
const { chatMessages } = useChat();
```

---

### Étape 6 : Transcriptions en Temps Réel

L'agent envoie les transcriptions via le protocole LiveKit :

```javascript
// Hook pour récupérer les transcriptions
const transcriptions = useTranscriptions();

// Fusion avec les messages chat
const mergedMessages = [
  ...transcriptions.map(t => transcriptionToChatMessage(t)),
  ...chatMessages
].sort((a, b) => a.timestamp - b.timestamp);
```

**Types de transcriptions :**
- `interim` : Transcription partielle (en cours de parole)
- `final` : Transcription finale (phrase complète)

---

### Étape 7 : États de l'Agent

```javascript
const { state: agentState } = useVoiceAssistant();

// États possibles :
// - 'disconnected' : Pas connecté
// - 'connecting'   : Connexion en cours
// - 'initializing' : Agent rejoint la room
// - 'listening'    : Agent écoute l'utilisateur
// - 'thinking'     : Agent traite la requête (LLM)
// - 'speaking'     : Agent parle (TTS)
```

**Visualisation dans l'UI :**
```jsx
<BarVisualizer
  state={agentState}
  trackRef={agentAudioTrack}
/>
```

---

### Diagramme de Séquence Complet

```
User          SDK Widget       API Backend      LiveKit Server    Agent Python
 │                │                │                  │                │
 │  Click FAB     │                │                  │                │
 │───────────────>│                │                  │                │
 │                │                │                  │                │
 │                │  POST /token   │                  │                │
 │                │───────────────>│                  │                │
 │                │                │                  │                │
 │                │  {url, token}  │                  │                │
 │                │<───────────────│                  │                │
 │                │                │                  │                │
 │                │  WebSocket Connect               │                │
 │                │─────────────────────────────────>│                │
 │                │                │                  │                │
 │                │                │                  │  Agent joins   │
 │                │                │                  │<───────────────│
 │                │                │                  │                │
 │                │  Room Ready    │                  │                │
 │                │<─────────────────────────────────│                │
 │                │                │                  │                │
 │  Parle         │                │                  │                │
 │───────────────>│  Audio Track   │                  │                │
 │                │═══════════════════════════════════════════════════>│
 │                │                │                  │                │
 │                │                │                  │   STT + LLM    │
 │                │                │                  │   + TTS        │
 │                │                │                  │                │
 │                │  Audio Track   │                  │                │
 │<═══════════════════════════════════════════════════════════════════│
 │  Entend        │                │                  │                │
 │                │                │                  │                │
 │                │  Transcription │                  │                │
 │                │<═══════════════════════════════════════════════════│
 │  Voit texte    │                │                  │                │
 │<───────────────│                │                  │                │
```

---

### Résumé des Technologies

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| SDK Widget | React + TypeScript | Interface utilisateur |
| Transport | WebSocket + WebRTC | Communication temps réel |
| Audio | LiveKit Client SDK | Capture/Lecture audio |
| Messages | LiveKit DataChannel | Chat texte |
| Transcriptions | LiveKit Protocol | STT en temps réel |
| Agent | Python + LiveKit Agents | Logique IA (STT/LLM/TTS) |

---

### Fichiers Clés du SDK

| Fichier | Rôle |
|---------|------|
| `adexgenie-widget-react.tsx` | Point d'entrée, gestion connexion |
| `popup-view.tsx` | Interface chat principale |
| `use-chat-and-transcription.ts` | Hook messages + transcriptions |
| `chat-entry.tsx` | Rendu des bulles de message |
| `use-agent-control-bar.ts` | Contrôles micro/audio |
