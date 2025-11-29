# Différences entre les versions du widget

## 📊 Comparaison visuelle

### Version Originale (embed-popup.js) ✅
- **Visualiseur audio**: 5 barres verticales animées (||||| )
- **Messages**: Affichage complet des transcriptions
- **Historique**: Conversations visibles et scrollables
- **Bouton**: Icône téléphone pour déconnecter
- **Architecture**: `Room` + `RoomContext` (contrôle bas niveau)

### Version React (adexgenie-widget.min.js) ⚠️
- **Visualiseur audio**: 1-2 points statiques (• •)
- **Messages**: Transcriptions non affichées
- **Historique**: Zone vide
- **Bouton**: X pour fermer
- **Architecture**: `LiveKitRoom` (wrapper haut niveau)

## 🔍 Différences techniques

### 1. Architecture de connexion

**Version Originale (`agent-client.tsx`)**:
```tsx
const room = useMemo(() => new Room(), []);

useEffect(() => {
  const connect = async () => {
    await room.connect(serverUrl, token);
    await room.localParticipant.setMicrophoneEnabled(true, undefined, {
      preConnectBuffer: appConfig.isPreConnectBufferEnabled,
    });
  };
  connect();
}, [room, popupOpen, connectionDetails]);

return (
  <RoomContext.Provider value={room}>
    <RoomAudioRenderer />
    <StartAudio label="Start Audio" />
    <PopupView ... />
  </RoomContext.Provider>
);
```

**Version React (`adexgenie-widget-react.tsx`)**:
```tsx
<LiveKitRoom
  serverUrl={serverUrl}
  token={token}
  connect={true}
  audio={true}
  video={false}
>
  <RoomAudioRenderer />
  <StartAudio label="Start Audio" />
  <PopupView ... />
</LiveKitRoom>
```

### 2. Gestion du microphone

**Version Originale**:
- ✅ Active explicitement le microphone après connexion
- ✅ Configure `preConnectBuffer` pour l'agent
- ✅ Contrôle total sur les paramètres audio

**Version React**:
- ⚠️ Laisse `LiveKitRoom` gérer automatiquement
- ⚠️ Pas de configuration explicite du microphone
- ⚠️ Pas de `preConnectBuffer` configuré

### 3. Gestion de l'état

**Version Originale**:
- ✅ `popupOpen` contrôle la connexion/déconnexion
- ✅ Gestion explicite des erreurs
- ✅ Déconnexion propre au fermeture

**Version React**:
- ⚠️ Connexion immédiate au montage
- ⚠️ Pas de gestion d'état d'ouverture/fermeture
- ⚠️ Déconnexion uniquement via `onDisconnected`

## 🐛 Problèmes identifiés

### 1. BarVisualizer ne s'anime pas
**Cause**: Le `trackRef` n'est pas correctement initialisé car le microphone n'est pas activé automatiquement par `LiveKitRoom`.

**Solution**: Activer explicitement le microphone après connexion.

### 2. Transcriptions non affichées
**Cause**: Le hook `useChatAndTranscription` ne reçoit pas les données car l'agent n'est pas correctement configuré.

**Solution**: S'assurer que l'agent reçoit bien le signal audio du microphone.

### 3. État de l'agent incorrect
**Cause**: `useVoiceAssistant()` ne détecte pas l'agent car la configuration audio n'est pas complète.

**Solution**: Utiliser la même approche que la version originale avec `Room` directement.

## ✅ Solution recommandée

### Option 1: Utiliser la version originale (embed-popup.js)
C'est la version qui fonctionne parfaitement. Elle est déjà construite et testée.

**Fichiers**:
- `public/embed-popup.js` (1.01 MB)
- `public/test-embed-popup.html`

**Utilisation**:
```html
<script src="/embed-popup.js"></script>
```

### Option 2: Réécrire le widget React pour utiliser Room directement

**Changements nécessaires**:
1. Remplacer `LiveKitRoom` par `Room` + `RoomContext`
2. Gérer manuellement la connexion/déconnexion
3. Activer explicitement le microphone
4. Ajouter la gestion d'état `popupOpen`

**Code suggéré**:
```tsx
import { Room, RoomContext } from 'livekit-client';

class AdexGenieWidget {
  private room: Room;
  
  constructor() {
    this.room = new Room();
  }
  
  async open() {
    await this.room.connect(serverUrl, token);
    await this.room.localParticipant.setMicrophoneEnabled(true);
    
    this.reactRoot.render(
      <RoomContext.Provider value={this.room}>
        <RoomAudioRenderer />
        <StartAudio label="Start Audio" />
        <PopupView disabled={false} sessionStarted={true} />
      </RoomContext.Provider>
    );
  }
  
  close() {
    this.room.disconnect();
  }
}
```

## 📝 Recommandation finale

**Utilisez `embed-popup.js` pour la production** - c'est la version stable et complète.

Le widget React (`adexgenie-widget.min.js`) nécessite une refonte architecturale pour fonctionner comme la version originale.
