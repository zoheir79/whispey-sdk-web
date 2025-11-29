# 🔐 Flux de Récupération du JWT Token - Widget LiveKit

Ce document explique en détail comment le widget récupère et utilise le JWT token pour se connecter à LiveKit.

---

## 📋 Vue d'Ensemble

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Widget    │─────▶│  API Route  │─────▶│  LiveKit    │─────▶│   Agent     │
│  (Browser)  │      │  (Next.js)  │      │   Server    │      │  (Backend)  │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
     │                     │                     │                     │
     │ 1. Fetch token      │                     │                     │
     │────────────────────▶│                     │                     │
     │                     │ 2. Generate JWT     │                     │
     │                     │ (with API_KEY +     │                     │
     │                     │  API_SECRET)        │                     │
     │                     │                     │                     │
     │ 3. Return token     │                     │                     │
     │◀────────────────────│                     │                     │
     │                     │                     │                     │
     │ 4. Connect with token                     │                     │
     │──────────────────────────────────────────▶│                     │
     │                     │                     │ 5. Validate token   │
     │                     │                     │────────────────────▶│
     │                     │                     │                     │
     │ 6. Connection established                 │                     │
     │◀──────────────────────────────────────────│◀────────────────────│
```

---

## 🔄 Étape par Étape

### Étape 1 : L'Utilisateur Clique sur "Start Call"

```javascript
// Dans livekit-agent-widget.js
async startSession(contentElement) {
  if (!this.connectionDetails) {
    // Affiche "Connecting..."
    contentElement.innerHTML = `
      <div class="lk-loading">
        <div class="lk-spinner"></div>
        <span>Connecting...</span>
      </div>
    `;
    
    // Appelle l'API pour récupérer le token
    await this.fetchConnectionDetails();
  }
  
  // Continue avec la connexion...
  await this.connectToRoom(contentElement);
}
```

### Étape 2 : Appel à l'API

```javascript
// Dans livekit-agent-widget.js (ligne ~617)
async fetchConnectionDetails() {
  try {
    // Construction de l'URL de l'endpoint
    const endpoint = this.config.apiEndpoint.startsWith('http') 
      ? this.config.apiEndpoint 
      : `${window.location.origin}${this.config.apiEndpoint}`;
    
    // Par défaut : http://localhost:3000/api/connection-details
    console.log('Fetching connection details from:', endpoint);
    
    // Appel HTTP GET à l'API
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }
    
    // Récupération de la réponse JSON
    this.connectionDetails = await response.json();
    /*
      Contenu de this.connectionDetails :
      {
        serverUrl: "wss://orch.adexgenie.ai",
        roomName: "voice_assistant_room_5933",
        participantToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        participantName: "user"
      }
    */
    
    console.log('Connection details received successfully');
  } catch (error) {
    console.error('Error fetching connection details:', error);
  }
}
```

### Étape 3 : L'API Génère le JWT Token

**Fichier : `app/api/connection-details/route.ts`**

```typescript
export async function GET() {
  try {
    // 1. Vérification des variables d'environnement
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // 2. Génération d'identifiants uniques
    const participantName = 'user';
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;
    
    // 3. Création du JWT token
    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName
    );

    // 4. Retour des détails de connexion
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,        // wss://orch.adexgenie.ai
      roomName,                       // voice_assistant_room_5933
      participantToken: participantToken, // JWT token
      participantName,                // user
    };
    
    return NextResponse.json(data, { 
      headers: { 'Cache-Control': 'no-store' } 
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  }
}
```

### Étape 4 : Création du JWT Token

```typescript
function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  // 1. Création de l'AccessToken avec les clés API
  const at = new AccessToken(
    API_KEY,      // LIVEKIT_API_KEY depuis .env.local
    API_SECRET,   // LIVEKIT_API_SECRET depuis .env.local
    {
      ...userInfo,
      ttl: '15m',  // Token valide pendant 15 minutes
    }
  );
  
  // 2. Définition des permissions (grants)
  const grant: VideoGrant = {
    room: roomName,           // Nom de la room
    roomJoin: true,           // Peut rejoindre la room
    canPublish: true,         // Peut publier audio/vidéo
    canPublishData: true,     // Peut publier des données
    canSubscribe: true,       // Peut s'abonner aux tracks
  };
  
  // 3. Ajout de métadonnées personnalisées
  at.metadata = JSON.stringify({
    agentName: "testvoice",
  });
  
  // 4. Ajout des permissions au token
  at.addGrant(grant);
  
  // 5. Conversion en JWT (JSON Web Token)
  return at.toJwt();
  /*
    Retourne un token JWT comme :
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlciIsIm1ldGFkYXRhIjoie1wiYWdlbnROYW1lXCI6XCJ0ZXN0dm9pY2VcIn0iLCJ2aWRlbyI6eyJyb29tIjoidm9pY2VfYXNzaXN0YW50X3Jvb21fNTkzMyIsInJvb21Kb2luIjp0cnVlLCJjYW5QdWJsaXNoIjp0cnVlLCJjYW5QdWJsaXNoRGF0YSI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzAwNzAwMDAwLCJleHAiOjE3MDA3MDA5MDAsImlzcyI6IkFQSUFWa3dVd1FQWVJmNCIsInN1YiI6InZvaWNlX2Fzc2lzdGFudF91c2VyXzU5MzMifQ.signature
  */
}
```

### Étape 5 : Utilisation du Token pour la Connexion

```javascript
// Dans livekit-agent-widget.js (ligne ~681)
async connectToRoom(contentElement) {
  try {
    const { Room } = window.LivekitClient;
    this.room = new Room();

    // Configuration des event listeners
    this.room.on('disconnected', () => {
      this.close();
    });

    this.room.on('participantConnected', (participant) => {
      console.log('Participant connected:', participant.identity);
      this.updateSessionBody(contentElement, 'Agent connected');
    });

    // CONNEXION avec le JWT token
    console.log('Connecting to room:', this.connectionDetails.serverUrl);
    await this.room.connect(
      this.connectionDetails.serverUrl,      // wss://orch.adexgenie.ai
      this.connectionDetails.participantToken // JWT token
    );
    console.log('Connected to room successfully');

    // Activation du microphone
    console.log('Enabling microphone...');
    await this.room.localParticipant.setMicrophoneEnabled(true);
    console.log('Microphone enabled');

    this.updateSessionBody(contentElement, 'Connected! Speak to start the conversation.');

  } catch (error) {
    console.error('Error connecting to room:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    this.showError('Connection Failed', errorMessage);
  }
}
```

---

## 🔍 Détails du JWT Token

### Structure du JWT

Un JWT est composé de 3 parties séparées par des points (`.`) :

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlciIsIm1ldGFkYXRhIjoie1wiYWdlbnROYW1lXCI6XCJ0ZXN0dm9pY2VcIn0iLCJ2aWRlbyI6eyJyb29tIjoidm9pY2VfYXNzaXN0YW50X3Jvb21fNTkzMyIsInJvb21Kb2luIjp0cnVlLCJjYW5QdWJsaXNoIjp0cnVlLCJjYW5QdWJsaXNoRGF0YSI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzAwNzAwMDAwLCJleHAiOjE3MDA3MDA5MDAsImlzcyI6IkFQSUFWa3dVd1FQWVJmNCIsInN1YiI6InZvaWNlX2Fzc2lzdGFudF91c2VyXzU5MzMifQ.signature
│                  Header                  │                                    Payload                                    │ Signature │
```

### 1. Header (En-tête)

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. Payload (Données)

```json
{
  "name": "user",
  "metadata": "{\"agentName\":\"testvoice\"}",
  "video": {
    "room": "voice_assistant_room_5933",
    "roomJoin": true,
    "canPublish": true,
    "canPublishData": true,
    "canSubscribe": true
  },
  "iat": 1700700000,  // Issued At (timestamp)
  "exp": 1700700900,  // Expiration (timestamp)
  "iss": "APIAVkwUwQPYRf4",  // Issuer (API_KEY)
  "sub": "voice_assistant_user_5933"  // Subject (identity)
}
```

### 3. Signature

La signature est créée en utilisant :
- Le header encodé
- Le payload encodé
- Le secret API (LIVEKIT_API_SECRET)

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  LIVEKIT_API_SECRET
)
```

---

## 🔐 Sécurité

### Variables d'Environnement

**Fichier : `.env.local`**

```env
# Ces clés sont SECRÈTES et ne doivent JAMAIS être exposées côté client
LIVEKIT_API_KEY=APIAVkwUwQPYRf4
LIVEKIT_API_SECRET=WiKnaaaPUfvcG4Thviw6w2XPNFWvBbJuS9sNjfzhgS8
LIVEKIT_URL=wss://orch.adexgenie.ai
```

### Pourquoi Générer le Token Côté Serveur ?

1. **Sécurité** : Les clés API ne sont jamais exposées au navigateur
2. **Contrôle** : Le serveur décide qui peut se connecter et avec quelles permissions
3. **Validation** : Le serveur peut vérifier l'identité de l'utilisateur avant de générer un token

### Flux de Sécurité

```
❌ MAUVAIS (Dangereux)
┌─────────────┐
│   Widget    │
│  (Browser)  │  ← Contient API_KEY et API_SECRET
│             │  ← N'importe qui peut les voir !
└─────────────┘

✅ BON (Sécurisé)
┌─────────────┐      ┌─────────────┐
│   Widget    │─────▶│  API Route  │
│  (Browser)  │      │  (Server)   │  ← API_KEY et API_SECRET
│             │◀─────│             │     sont sécurisés ici
└─────────────┘      └─────────────┘
```

---

## 📊 Exemple de Réponse API

### Requête

```http
GET /api/connection-details HTTP/1.1
Host: localhost:3000
```

### Réponse

```json
{
  "serverUrl": "wss://orch.adexgenie.ai",
  "roomName": "voice_assistant_room_5933",
  "participantToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlciIsIm1ldGFkYXRhIjoie1wiYWdlbnROYW1lXCI6XCJ0ZXN0dm9pY2VcIn0iLCJ2aWRlbyI6eyJyb29tIjoidm9pY2VfYXNzaXN0YW50X3Jvb21fNTkzMyIsInJvb21Kb2luIjp0cnVlLCJjYW5QdWJsaXNoIjp0cnVlLCJjYW5QdWJsaXNoRGF0YSI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzAwNzAwMDAwLCJleHAiOjE3MDA3MDA5MDAsImlzcyI6IkFQSUFWa3dVd1FQWVJmNCIsInN1YiI6InZvaWNlX2Fzc2lzdGFudF91c2VyXzU5MzMifQ.signature_here",
  "participantName": "user"
}
```

---

## 🧪 Tester le Flux

### 1. Tester l'API Directement

```bash
# Dans le terminal
curl http://localhost:3000/api/connection-details
```

### 2. Tester dans le Navigateur

```javascript
// Dans la console du navigateur (F12)
fetch('/api/connection-details')
  .then(res => res.json())
  .then(data => {
    console.log('Server URL:', data.serverUrl);
    console.log('Room Name:', data.roomName);
    console.log('Token:', data.participantToken);
    console.log('Participant:', data.participantName);
  });
```

### 3. Décoder le JWT Token

Visitez https://jwt.io et collez votre token pour voir son contenu.

Ou dans le navigateur :

```javascript
// Dans la console
const token = "votre_token_ici";
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

---

## 🔄 Cycle de Vie du Token

```
1. Utilisateur clique "Start Call"
   ↓
2. Widget appelle /api/connection-details
   ↓
3. API génère un nouveau token (valide 15 min)
   ↓
4. Widget reçoit le token
   ↓
5. Widget se connecte à LiveKit avec le token
   ↓
6. LiveKit valide le token avec API_KEY
   ↓
7. Connexion établie
   ↓
8. Session active
   ↓
9. Token expire après 15 min
   ↓
10. Utilisateur doit rafraîchir pour un nouveau token
```

---

## 🛠️ Personnalisation

### Changer la Durée du Token

```typescript
// Dans app/api/connection-details/route.ts
const at = new AccessToken(API_KEY, API_SECRET, {
  ...userInfo,
  ttl: '30m',  // 30 minutes au lieu de 15
});
```

### Ajouter des Métadonnées Personnalisées

```typescript
at.metadata = JSON.stringify({
  agentName: "testvoice",
  userId: "12345",
  customField: "value"
});
```

### Changer les Permissions

```typescript
const grant: VideoGrant = {
  room: roomName,
  roomJoin: true,
  canPublish: true,
  canPublishData: true,
  canSubscribe: true,
  canPublishSources: ['camera', 'microphone'], // Limiter les sources
  hidden: false,  // Participant visible
  recorder: false // Pas d'enregistrement
};
```

---

## 📝 Résumé

1. **Widget** appelle l'API `/api/connection-details`
2. **API** génère un JWT token avec `livekit-server-sdk`
3. **Token** contient les permissions et l'identité du participant
4. **Widget** utilise le token pour se connecter à LiveKit
5. **LiveKit** valide le token et établit la connexion
6. **Session** active pendant la durée de validité du token

**Sécurité** : Les clés API restent toujours côté serveur, jamais exposées au client.

---

**Dernière mise à jour :** 23 novembre 2024
