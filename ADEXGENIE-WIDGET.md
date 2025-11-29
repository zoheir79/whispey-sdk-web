# 🚀 AdexGenie Widget - Documentation Complète

Widget d'Agent IA 100% personnalisé avec votre marque, sans aucune référence visible à LiveKit.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Build du Widget](#build-du-widget)
4. [Utilisation](#utilisation)
5. [Configuration](#configuration)
6. [Différences avec LiveKit](#différences-avec-livekit)
7. [Architecture](#architecture)
8. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

### Qu'est-ce que c'est ?

Le **AdexGenie Widget** est une version complètement rebrandée du widget LiveKit Agent. Il :

- ✅ **Masque complètement LiveKit** - Aucune référence visible dans la console ou le code
- ✅ **Bundle le SDK** - LiveKit SDK intégré directement (pas de CDN externe)
- ✅ **Votre marque uniquement** - Tout est sous le nom "AdexGenie"
- ✅ **Optimisé** - Minifié et bundlé avec Webpack
- ✅ **Isolation totale** - Shadow DOM pour zéro conflit

### Pourquoi ?

Vous voulez utiliser la technologie LiveKit mais avec votre propre marque, sans que vos utilisateurs voient "LiveKit" dans la console ou le code source.

---

## 📦 Installation

### Prérequis

```bash
Node.js >= 18
pnpm (recommandé) ou npm
```

### Étapes

```bash
# 1. Installer les dépendances
pnpm install

# 2. Installer Babel (si pas déjà fait)
pnpm add -D @babel/core @babel/preset-env babel-loader

# 3. Vérifier que livekit-client est installé
pnpm list livekit-client
```

---

## 🔨 Build du Widget

### Commande de Build

```bash
pnpm run build-adexgenie
```

### Ce qui se passe

1. Webpack lit `src/adexgenie-widget.js`
2. Importe et bundle le SDK LiveKit (`livekit-client`)
3. Transpile avec Babel pour compatibilité navigateurs
4. Minifie le code
5. Génère `public/adexgenie-widget.min.js`

### Fichier Généré

```
public/adexgenie-widget.min.js  (~150-200 KB minifié)
```

---

## 💻 Utilisation

### Intégration Basique

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon Site</title>
</head>
<body>
    <h1>Bienvenue</h1>

    <!-- Charger le widget -->
    <script src="adexgenie-widget.min.js"></script>
    
    <!-- Initialiser -->
    <script>
        AdexGenieWidget.init({
            agentName: 'Mon Agent IA',
            agentId: 'votre-uuid-ici'
        });
    </script>
</body>
</html>
```

### Résultat

Deux boutons flottants apparaissent en bas à droite :
- 💬 **Popup** - Ouvre une fenêtre modale
- 🎯 **Inline** - Ouvre une fenêtre intégrée

---

## ⚙️ Configuration

### Options Complètes

```javascript
AdexGenieWidget.init({
    // Requis
    agentName: 'Mon Agent IA',        // Nom affiché dans l'interface
    agentId: 'uuid-de-votre-agent',   // UUID de l'agent (REQUIS)
    
    // Optionnel
    apiEndpoint: '/api/connection-details',  // Endpoint pour récupérer le token
    primaryColor: '#002cf2',                  // Couleur principale (light mode)
    darkPrimaryColor: '#1fd5f9'               // Couleur principale (dark mode)
});
```

### Configuration API

Le widget appelle votre API pour récupérer le token JWT :

**Requête :**
```
GET /api/connection-details?agent_id=uuid
```

**Réponse attendue :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "serverUrl": "wss://orch.adexgenie.ai",
  "roomName": "agent_room_abc123",
  "participantName": "user",
  "metadata": {
    "agent_name": "MyAgent",
    "agent_id": "uuid"
  }
}
```

### Variables d'Environnement

Ajoutez dans `.env.local` :

```env
# URL de votre API qui génère les tokens JWT
AGENT_API_URL=https://votre-api.com/generate-token
```

---

## 🔄 Différences avec LiveKit

### Comparaison Technique

| Aspect | LiveKit Original | AdexGenie Widget |
|--------|-----------------|------------------|
| **Nom Global** | `window.LivekitClient` | `window.AdexGenieWidget` |
| **Classes CSS** | `.lk-*` | `.ag-*` |
| **ID Container** | `livekit-agent-widget-root` | `adexgenie-widget-root` |
| **SDK Loading** | CDN externe (`unpkg.com`) | Bundlé dans le fichier |
| **Console Logs** | `[LiveKit] ...` | `AdexGenie Widget ...` |
| **Fichier** | `livekit-agent-widget.js` | `adexgenie-widget.min.js` |

### Dans la Console

**Avant (LiveKit) :**
```javascript
> window.LivekitClient
< Object { Room: function, ... }

> console: [LiveKit] Connected to room...
```

**Après (AdexGenie) :**
```javascript
> window.AdexGenieWidget
< Object { init: function }

> console: AdexGenie Widget initialized successfully
> console: Connecting to room: wss://orch.adexgenie.ai
```

---

## 🏗️ Architecture

### Structure des Fichiers

```
d:/webapp/demoadexgenie/
├── src/
│   └── adexgenie-widget.js          # Source du widget
├── public/
│   ├── adexgenie-widget.min.js      # Widget bundlé (généré)
│   └── adexgenie-demo.html          # Page de démo
├── webpack.adexgenie.config.js      # Config Webpack
├── package.json                      # Script build-adexgenie
└── .eslintignore                     # Ignore les fichiers générés
```

### Flux de Données

```
1. Utilisateur clique sur bouton
   ↓
2. Widget appelle /api/connection-details?agent_id=uuid
   ↓
3. API Next.js appelle votre API externe
   ↓
4. Votre API génère et retourne le JWT token
   ↓
5. Widget reçoit le token
   ↓
6. Widget se connecte à LiveKit avec le token
   ↓
7. Session active
```

### Classes CSS Personnalisées

Toutes les classes CSS sont préfixées par `ag-` (AdexGenie) :

```css
.ag-floating-buttons    /* Conteneur des boutons */
.ag-float-btn           /* Bouton flottant */
.ag-popup-container     /* Popup modale */
.ag-iframe-container    /* Vue inline */
.ag-welcome             /* Écran de bienvenue */
.ag-session-active      /* Session en cours */
.ag-control-btn         /* Boutons de contrôle */
```

---

## 🚀 Déploiement

### Étape 1 : Build

```bash
pnpm run build-adexgenie
```

### Étape 2 : Vérifier le Fichier

```bash
ls -lh public/adexgenie-widget.min.js
```

Devrait être ~150-200 KB.

### Étape 3 : Déployer

Copiez `public/adexgenie-widget.min.js` sur votre serveur web ou CDN.

### Étape 4 : Intégrer

```html
<script src="https://votre-cdn.com/adexgenie-widget.min.js"></script>
<script>
    AdexGenieWidget.init({
        agentName: 'Mon Agent',
        agentId: 'uuid'
    });
</script>
```

---

## 🧪 Test Local

### Démarrer le Serveur

```bash
pnpm dev
```

### Accéder à la Démo

```
http://localhost:3000/adexgenie-demo.html
```

### Vérifier dans la Console

1. Ouvrez la console (F12)
2. Tapez `window.AdexGenieWidget`
3. Vous devriez voir l'objet du widget
4. Aucune référence à "LiveKit" ne devrait apparaître

---

## 🔧 Personnalisation Avancée

### Changer les Couleurs

```javascript
AdexGenieWidget.init({
    agentName: 'Agent',
    agentId: 'uuid',
    primaryColor: '#ff0000',        // Rouge
    darkPrimaryColor: '#ff6b6b'     // Rouge clair
});
```

### Changer l'Endpoint API

```javascript
AdexGenieWidget.init({
    agentName: 'Agent',
    agentId: 'uuid',
    apiEndpoint: 'https://api.example.com/tokens'  // API externe
});
```

### Modifier le Code Source

Le fichier source est `src/adexgenie-widget.js`. Après modification :

```bash
pnpm run build-adexgenie
```

---

## 📊 Métriques

### Taille du Fichier

- **Non minifié** : ~600 KB
- **Minifié** : ~150-200 KB
- **Gzippé** : ~50-70 KB

### Performance

- **Temps de chargement** : < 1s (sur connexion normale)
- **Temps d'initialisation** : < 100ms
- **Mémoire utilisée** : ~5-10 MB

---

## 🐛 Dépannage

### Le widget ne s'affiche pas

1. Vérifiez que le fichier est chargé :
   ```javascript
   console.log(window.AdexGenieWidget);
   ```

2. Vérifiez la console pour les erreurs

3. Assurez-vous que `agentId` est fourni

### Erreur "agentId is required"

Vous devez fournir un `agentId` :

```javascript
AdexGenieWidget.init({
    agentName: 'Agent',
    agentId: 'votre-uuid'  // ← REQUIS
});
```

### Erreur de connexion

1. Vérifiez que `AGENT_API_URL` est défini dans `.env.local`
2. Vérifiez que votre API retourne le bon format
3. Vérifiez les logs du serveur

---

## 📝 Changelog

### Version 1.0.0 (2024-11-23)

- ✅ Création du widget AdexGenie
- ✅ Bundle complet du SDK LiveKit
- ✅ Renommage de toutes les références
- ✅ Configuration Webpack
- ✅ Page de démo
- ✅ Documentation complète

---

## 🤝 Support

Pour toute question ou problème :

1. Consultez `TROUBLESHOOTING.md`
2. Vérifiez la page de diagnostic : `http://localhost:3000/diagnostic.html`
3. Consultez les logs de la console

---

## 📄 Licence

Ce widget utilise le SDK LiveKit qui est sous licence Apache 2.0.

---

**Dernière mise à jour** : 23 novembre 2024
