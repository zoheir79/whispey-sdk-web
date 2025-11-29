# 🔧 Guide de Dépannage - Widget LiveKit Agent

Ce guide vous aidera à résoudre les problèmes courants avec le widget LiveKit Agent.

---

## 🛠️ Outil de Diagnostic

**Avant tout**, utilisez l'outil de diagnostic intégré :

```
http://localhost:3000/diagnostic.html
```

Cet outil effectue des vérifications automatiques et affiche des logs détaillés en temps réel.

---

## ❌ Problèmes Courants

### 1. Le widget ne s'affiche pas

#### Symptômes
- Aucun bouton flottant visible
- Rien ne se passe après l'intégration

#### Solutions

**A. Vérifier le chargement du script**
```javascript
// Ouvrez la console (F12) et tapez :
console.log(window.LiveKitAgentWidget);
// Devrait afficher: {init: ƒ}
```

**B. Vérifier l'ordre des scripts**
```html
<!-- ✅ CORRECT -->
<script src="livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({ agentName: 'Agent' });
</script>

<!-- ❌ INCORRECT - init appelé trop tôt -->
<script>
    LiveKitAgentWidget.init({ agentName: 'Agent' });
</script>
<script src="livekit-agent-widget.js"></script>
```

**C. Vérifier le chemin du fichier**
```html
<!-- Assurez-vous que le chemin est correct -->
<script src="/livekit-agent-widget.js"></script>
<!-- ou -->
<script src="./livekit-agent-widget.js"></script>
```

**D. Vérifier la console pour les erreurs**
1. Ouvrez la console (F12)
2. Recherchez les erreurs en rouge
3. Vérifiez qu'il n'y a pas d'erreur 404 (fichier non trouvé)

---

### 2. Erreur "Error connecting to agent: {}"

#### Symptômes
- Message d'erreur vide dans la console
- Connexion échoue sans message clair

#### Solutions

**A. Vérifier l'endpoint API**
```bash
# Testez l'endpoint directement
curl http://localhost:3000/api/connection-details
```

Devrait retourner :
```json
{
    "serverUrl": "wss://...",
    "roomName": "...",
    "participantToken": "...",
    "participantName": "..."
}
```

**B. Vérifier les variables d'environnement**

Fichier `.env.local` :
```env
LIVEKIT_API_KEY=votre_api_key
LIVEKIT_API_SECRET=votre_api_secret
LIVEKIT_URL=wss://votre-serveur.livekit.cloud
```

**C. Redémarrer le serveur**
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez
pnpm dev
```

**D. Vérifier les logs du serveur**
Regardez la console où vous avez lancé `pnpm dev` pour voir les erreurs côté serveur.

---

### 3. Le SDK LiveKit ne se charge pas

#### Symptômes
- Message "SDK Error" dans le widget
- Console affiche "Failed to load LiveKit SDK"

#### Solutions

**A. Vérifier la connexion internet**
Le widget charge le SDK depuis CDN. Vérifiez votre connexion.

**B. Vérifier le blocage par pare-feu/antivirus**
Certains pare-feu bloquent les scripts externes.

**C. Utiliser une version locale du SDK**

Modifiez le widget pour charger une version locale :
```javascript
// Dans livekit-agent-widget.js, ligne ~56
script.src = '/path/to/local/livekit-client.umd.min.js';
```

**D. Vérifier la console réseau**
1. Ouvrez DevTools (F12)
2. Onglet "Network"
3. Rechargez la page
4. Cherchez `livekit-client` dans la liste
5. Vérifiez le statut (devrait être 200)

---

### 4. Erreur de microphone

#### Symptômes
- "Permission denied" dans la console
- Le microphone ne s'active pas
- Erreur "NotAllowedError"

#### Solutions

**A. Vérifier les permissions du navigateur**
1. Cliquez sur l'icône de cadenas dans la barre d'adresse
2. Vérifiez que le microphone est autorisé
3. Rechargez la page

**B. Utiliser HTTPS**
Les navigateurs modernes requièrent HTTPS pour accéder au microphone (sauf localhost).

**C. Tester les permissions**
```javascript
// Dans la console
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log('Microphone OK'))
    .catch(err => console.error('Microphone error:', err));
```

**D. Vérifier qu'un microphone est connecté**
```javascript
// Dans la console
navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const mics = devices.filter(d => d.kind === 'audioinput');
        console.log('Microphones:', mics);
    });
```

---

### 5. Connexion WebSocket échoue

#### Symptômes
- "WebSocket connection failed"
- Erreur de connexion au serveur LiveKit

#### Solutions

**A. Vérifier l'URL du serveur**
```javascript
// Dans .env.local
LIVEKIT_URL=wss://votre-serveur.livekit.cloud
// Doit commencer par wss:// (pas ws://)
```

**B. Vérifier que le serveur LiveKit est accessible**
```bash
# Testez la connexion
curl -I https://votre-serveur.livekit.cloud
```

**C. Vérifier les tokens**
Les tokens LiveKit expirent après 15 minutes par défaut. Rafraîchissez la page.

**D. Vérifier le pare-feu**
Assurez-vous que le port WebSocket (443) n'est pas bloqué.

---

### 6. Le widget s'affiche mais ne fonctionne pas

#### Symptômes
- Boutons visibles mais clics sans effet
- Interface figée

#### Solutions

**A. Vérifier les erreurs JavaScript**
Ouvrez la console (F12) et cherchez les erreurs.

**B. Vérifier les conflits CSS**
Le widget utilise Shadow DOM, mais vérifiez quand même :
```javascript
// Dans la console
const widget = document.getElementById('livekit-agent-widget-root');
console.log(widget.shadowRoot); // Devrait afficher le shadow root
```

**C. Vérifier les event listeners**
```javascript
// Dans la console
const widget = document.getElementById('livekit-agent-widget-root');
const buttons = widget.shadowRoot.querySelectorAll('.lk-float-btn');
console.log('Buttons:', buttons.length); // Devrait être 2
```

---

### 7. Problèmes de style/affichage

#### Symptômes
- Widget mal positionné
- Couleurs incorrectes
- Responsive ne fonctionne pas

#### Solutions

**A. Vérifier le z-index**
Le widget utilise `z-index: 999999`. Si d'autres éléments ont un z-index supérieur, ils peuvent le recouvrir.

**B. Vérifier les styles personnalisés**
```javascript
LiveKitAgentWidget.init({
    agentName: 'Agent',
    primaryColor: '#002cf2', // Vérifiez le format hexadécimal
    darkPrimaryColor: '#1fd5f9'
});
```

**C. Vider le cache du navigateur**
```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```

---

## 🔍 Outils de Diagnostic

### Console du Navigateur (F12)

**Onglets importants :**
- **Console** : Erreurs JavaScript et logs
- **Network** : Requêtes réseau et leur statut
- **Application** : Stockage, permissions, etc.

### Logs Détaillés

Le widget affiche maintenant des logs détaillés :
```
Loading LiveKit SDK...
LiveKit SDK loaded successfully
Fetching connection details from: http://localhost:3000/api/connection-details
Connection details received successfully
Connecting to room: wss://...
Connected to room successfully
Enabling microphone...
Microphone enabled
```

### Page de Diagnostic

Utilisez la page de diagnostic intégrée :
```
http://localhost:3000/diagnostic.html
```

Fonctionnalités :
- ✅ Vérification du système
- ✅ Test de l'API
- ✅ Test du SDK
- ✅ Statut du widget
- ✅ Logs en temps réel

---

## 📋 Checklist de Dépannage

Suivez cette checklist dans l'ordre :

- [ ] **1. Vérifier que le serveur est démarré**
  ```bash
  pnpm dev
  ```

- [ ] **2. Vérifier que le fichier widget existe**
  ```
  public/livekit-agent-widget.js
  ```

- [ ] **3. Ouvrir la page de diagnostic**
  ```
  http://localhost:3000/diagnostic.html
  ```

- [ ] **4. Vérifier la console du navigateur**
  - Pas d'erreurs 404
  - Pas d'erreurs JavaScript
  - Widget initialisé

- [ ] **5. Tester l'API**
  ```
  http://localhost:3000/api/connection-details
  ```

- [ ] **6. Vérifier les variables d'environnement**
  - `.env.local` existe
  - LIVEKIT_URL est défini
  - LIVEKIT_API_KEY est défini
  - LIVEKIT_API_SECRET est défini

- [ ] **7. Vérifier les permissions**
  - Microphone autorisé
  - HTTPS ou localhost

- [ ] **8. Tester dans un autre navigateur**
  - Chrome
  - Firefox
  - Edge

- [ ] **9. Vider le cache**
  - Ctrl + Shift + Delete
  - Cocher "Cached images and files"

- [ ] **10. Redémarrer le serveur**
  ```bash
  # Ctrl+C puis
  pnpm dev
  ```

---

## 🐛 Problèmes Spécifiques

### Erreur : "LIVEKIT_URL is not defined"

**Cause :** Variables d'environnement non chargées

**Solution :**
1. Créez `.env.local` à la racine du projet
2. Ajoutez les variables :
   ```env
   LIVEKIT_API_KEY=votre_key
   LIVEKIT_API_SECRET=votre_secret
   LIVEKIT_URL=wss://votre-serveur.livekit.cloud
   ```
3. Redémarrez le serveur

---

### Erreur : "Failed to fetch connection details"

**Cause :** L'endpoint API ne répond pas

**Solution :**
1. Vérifiez que le serveur Next.js est démarré
2. Testez l'endpoint :
   ```bash
   curl http://localhost:3000/api/connection-details
   ```
3. Vérifiez les logs du serveur

---

### Erreur : "Shadow DOM not supported"

**Cause :** Navigateur trop ancien

**Solution :**
Mettez à jour votre navigateur vers :
- Chrome 53+
- Firefox 63+
- Safari 10.1+
- Edge 79+

---

### Le widget fonctionne en local mais pas en production

**Causes possibles :**
1. HTTPS non configuré
2. Variables d'environnement non définies
3. Fichier widget non déployé
4. CORS mal configuré

**Solutions :**
1. Configurez HTTPS sur votre serveur
2. Définissez les variables d'environnement en production
3. Vérifiez que `livekit-agent-widget.js` est déployé
4. Configurez CORS si nécessaire

---

## 📞 Obtenir de l'Aide

### 1. Collectez les Informations

Avant de demander de l'aide, collectez :
- Version du navigateur
- Système d'exploitation
- Messages d'erreur exacts (console)
- Logs du serveur
- Configuration utilisée

### 2. Utilisez l'Outil de Diagnostic

```
http://localhost:3000/diagnostic.html
```

Faites une capture d'écran des résultats.

### 3. Vérifiez la Documentation

- `QUICK-START.md` - Guide rapide
- `WIDGET-README.md` - Documentation complète
- `INTEGRATION-SUMMARY.md` - Vue d'ensemble

### 4. Ressources LiveKit

- Documentation : https://docs.livekit.io
- GitHub : https://github.com/livekit
- Community Slack : https://livekit.io/join-slack

---

## 🔄 Réinitialisation Complète

Si rien ne fonctionne, essayez une réinitialisation complète :

```bash
# 1. Arrêtez le serveur (Ctrl+C)

# 2. Nettoyez les dépendances
rm -rf node_modules
rm -rf .next

# 3. Réinstallez
pnpm install

# 4. Vérifiez .env.local
cat .env.local

# 5. Redémarrez
pnpm dev
```

---

## 📊 Codes d'Erreur Courants

| Code | Signification | Solution |
|------|---------------|----------|
| 404 | Fichier non trouvé | Vérifiez le chemin du fichier |
| 500 | Erreur serveur | Vérifiez les logs du serveur |
| CORS | Problème de domaine | Configurez CORS |
| NotAllowedError | Permission refusée | Autorisez le microphone |
| NetworkError | Problème réseau | Vérifiez la connexion |

---

## ✅ Tests de Validation

### Test 1 : Widget Chargé
```javascript
console.log(window.LiveKitAgentWidget); // Devrait afficher un objet
```

### Test 2 : Container Créé
```javascript
console.log(document.getElementById('livekit-agent-widget-root')); // Devrait afficher un élément
```

### Test 3 : Shadow DOM
```javascript
const widget = document.getElementById('livekit-agent-widget-root');
console.log(widget.shadowRoot); // Devrait afficher le shadow root
```

### Test 4 : Boutons
```javascript
const widget = document.getElementById('livekit-agent-widget-root');
const buttons = widget.shadowRoot.querySelectorAll('.lk-float-btn');
console.log(buttons.length); // Devrait afficher 2
```

### Test 5 : API
```bash
curl http://localhost:3000/api/connection-details
# Devrait retourner un JSON avec serverUrl, roomName, etc.
```

---

**Si le problème persiste après avoir suivi ce guide, utilisez l'outil de diagnostic et consultez la documentation LiveKit.**

---

**Dernière mise à jour :** 23 novembre 2024
