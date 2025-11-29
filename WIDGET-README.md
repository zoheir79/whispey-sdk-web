# 🎯 AdexGenie Widget - Interface Professionnelle Moderne

Un widget JavaScript autonome et isolé pour intégrer un agent IA conversationnel sur n'importe quelle page HTML.

## 🚀 Caractéristiques

- ✅ **Design Professionnel** - Interface moderne inspirée de LiveKit
- ✅ **Gradients Élégants** - Couleurs de marque AdexGenie (#00A7E1)
- ✅ **Visualiseur Audio** - Barres animées en temps réel
- ✅ **Bulles de Messages** - Chat moderne avec timestamps
- ✅ **100% Personnalisable** - Toutes les couleurs modifiables
- ✅ **Isolé** - Utilise Shadow DOM pour éviter les conflits CSS/JS
- ✅ **Responsive** - Fonctionne sur mobile, tablette et desktop
- ✅ **Sécurisé** - ServerUrl et agentName privés (fournis par API)

## 📦 Installation

### Méthode 1: Fichier local

1. Copiez `adexgenie-widget.min.js` dans votre dossier `public/` ou `static/`
2. Ajoutez le code d'intégration à votre page HTML

### Méthode 2: CDN (à venir)

```html
<script src="https://cdn.example.com/adexgenie-widget.min.js"></script>
```

## 🎯 Utilisation Basique

Ajoutez simplement ces deux balises `<script>` à votre page HTML :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ma Page</title>
</head>
<body>
    <!-- Votre contenu -->
    
    <!-- Widget AdexGenie -->
    <script src="adexgenie-widget.min.js"></script>
    <script>
        AdexGenie.init({
            agentId: 'abc-123-def-456',
            apiUrl: 'https://api.example.com/generate-jwt',
            apiKey: 'pk_live_abc123xyz'
        });
    </script>
</body>
</html>
```

C'est tout ! Le widget apparaîtra automatiquement avec deux boutons flottants en bas à droite.

## ⚙️ Configuration

### Options disponibles

```javascript
AdexGenie.init({
    // Requis
    agentId: 'abc-123',           // UUID de votre agent
    apiUrl: 'https://...',        // URL de votre API JWT
    apiKey: 'pk_live_...',        // Clé API publique
    
    // Optionnel - Personnalisation des couleurs
    primaryColor: '#00A7E1',      // Bleu cyan principal
    secondaryColor: '#0066A1',    // Bleu foncé
    accentColor: '#00D4FF',       // Cyan clair
    successColor: '#10b981',      // Vert
    dangerColor: '#dc2626',       // Rouge
    backgroundColor: '#f8f9fa',   // Fond clair
    surfaceColor: '#ffffff',      // Surface blanche
    textColor: '#1f2937',         // Texte sombre
    textLightColor: '#6b7280',    // Texte gris
    borderColor: '#e5e7eb'        // Bordures
});
```

### Exemples de configuration

#### Configuration minimale
```javascript
AdexGenie.init({
    agentId: 'demo-agent-123',
    apiUrl: 'https://api.example.com/jwt',
    apiKey: 'pk_demo_key'
});
```

#### Configuration avec couleurs personnalisées
```javascript
AdexGenie.init({
    agentId: 'demo-agent-123',
    apiUrl: 'https://api.example.com/jwt',
    apiKey: 'pk_demo_key',
    primaryColor: '#6366f1',      // Violet
    accentColor: '#818cf8'        // Violet clair
});
```

## 🎨 Interface Moderne

### Barre de Statut Professionnelle
- **Gradient bleu** : Couleurs de marque AdexGenie
- **Visualiseur audio** : 5 barres animées en temps réel
- **Bouton END** : Rouge professionnel pour terminer l'appel
- **Status indicator** : "Agent listening" avec animation

### Chat Moderne
- **Bulles de messages** : Design élégant avec coins arrondis
- **Messages agent** : Fond blanc, alignés à gauche
- **Messages utilisateur** : Gradient cyan, alignés à droite
- **Timestamps** : Affichage discret de l'heure

### Contrôles Élégants
- **Bouton micro** : Contrôle vocal avec feedback visuel
- **Champ de saisie** : Input arrondi avec focus bleu
- **Bouton d'envoi** : Gradient cyan avec icône flèche
- **Animations fluides** : Micro-interactions sur tous les éléments

## 🔧 API Endpoint

Le widget nécessite un endpoint API qui retourne les détails de connexion :

### Format de Requête
```http
POST https://api.example.com/generate-jwt
Headers:
  Content-Type: application/json
  X-API-Key: pk_live_abc123xyz
Body:
{
  "agent_id": "abc-123-def-456"
}
```

### Format de Réponse
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "serverUrl": "wss://orch.adexgenie.ai",
  "roomName": "agent_room_abc123",
  "agentName": "Mon Agent IA",
  "participantName": "user",
  "metadata": {}
}
```

### Exemple d'implémentation (Next.js)

```typescript
// app/api/connection-details/route.ts
import { AccessToken } from 'livekit-server-sdk';

export async function GET() {
    const roomName = `room-${Math.random().toString(36).substring(7)}`;
    const participantName = `user-${Math.random().toString(36).substring(7)}`;

    const token = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: participantName,
        }
    );

    token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
    });

    return Response.json({
        serverUrl: process.env.LIVEKIT_URL,
        participantToken: await token.toJwt(),
    });
}
```

## 🎯 Intégration avec différents frameworks

### HTML pur
```html
<script src="livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({ agentName: 'Agent' });
</script>
```

### React
```jsx
useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = '/livekit-agent-widget.js';
    script1.onload = () => {
        window.LiveKitAgentWidget.init({
            agentName: 'React Agent'
        });
    };
    document.body.appendChild(script1);
    
    return () => {
        document.body.removeChild(script1);
    };
}, []);
```

### Vue.js
```vue
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    const script = document.createElement('script');
    script.src = '/livekit-agent-widget.js';
    script.onload = () => {
        window.LiveKitAgentWidget.init({
            agentName: 'Vue Agent'
        });
    };
    document.body.appendChild(script);
});
</script>
```

### WordPress
```php
// Dans functions.php ou un plugin
function add_livekit_widget() {
    ?>
    <script src="<?php echo get_template_directory_uri(); ?>/js/livekit-agent-widget.js"></script>
    <script>
        LiveKitAgentWidget.init({
            agentName: 'Support WordPress'
        });
    </script>
    <?php
}
add_action('wp_footer', 'add_livekit_widget');
```

## 🔒 Isolation et Sécurité

### Shadow DOM
Le widget utilise Shadow DOM pour une isolation complète :
- ✅ Aucun conflit CSS avec votre site
- ✅ Aucun conflit JavaScript
- ✅ Styles encapsulés
- ✅ Événements isolés

### Sécurité
- Les tokens sont générés côté serveur
- Communication sécurisée via WebSocket (WSS)
- Aucune donnée sensible stockée côté client

## 📱 Responsive Design

Le widget s'adapte automatiquement :

- **Desktop** : Positionnement fixe en bas à droite
- **Mobile** : Largeur adaptative avec marges réduites
- **Tablette** : Optimisation pour écrans moyens

## 🎨 Personnalisation Avancée

### Couleurs personnalisées
```javascript
LiveKitAgentWidget.init({
    agentName: 'Agent',
    primaryColor: '#8b5cf6',      // Violet
    darkPrimaryColor: '#a78bfa'   // Violet clair
});
```

### Modification du widget (avancé)

Pour personnaliser davantage, vous pouvez modifier directement `livekit-agent-widget.js` :

1. **Styles** : Modifiez la section `injectStyles()`
2. **Icônes** : Changez les emojis dans `createFloatingButtons()`
3. **Textes** : Personnalisez les messages dans les templates HTML

## 🐛 Dépannage

### Le widget ne s'affiche pas
- Vérifiez que le fichier JS est bien chargé (console du navigateur)
- Vérifiez qu'il n'y a pas d'erreurs JavaScript
- Assurez-vous que `LiveKitAgentWidget.init()` est appelé après le chargement du script

### Erreur de connexion
- Vérifiez que votre endpoint API est accessible
- Vérifiez que les tokens sont valides
- Vérifiez la configuration de votre serveur LiveKit

### Conflits CSS
- Le widget utilise Shadow DOM, les conflits sont normalement impossibles
- Si problème, vérifiez que le Shadow DOM est supporté par le navigateur

## 📊 Compatibilité Navigateurs

- ✅ Chrome 53+
- ✅ Firefox 63+
- ✅ Safari 10.1+
- ✅ Edge 79+
- ✅ Opera 40+

## 📝 Exemples

### Exemple 1: Page de support
```html
<!DOCTYPE html>
<html>
<head>
    <title>Support Client</title>
</head>
<body>
    <h1>Besoin d'aide ?</h1>
    <p>Notre agent IA est disponible 24/7</p>
    
    <script src="livekit-agent-widget.js"></script>
    <script>
        LiveKitAgentWidget.init({
            agentName: 'Support Client',
            primaryColor: '#10b981'
        });
    </script>
</body>
</html>
```

### Exemple 2: Site e-commerce
```html
<script src="livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({
        agentName: 'Assistant Shopping',
        apiEndpoint: '/api/livekit/connect',
        primaryColor: '#f59e0b'
    });
</script>
```

## 🚀 Déploiement

### Production
1. Minifiez le fichier JS pour de meilleures performances
2. Activez la compression GZIP sur votre serveur
3. Utilisez un CDN pour une distribution globale
4. Configurez le cache navigateur approprié

### Fichiers à déployer
- `livekit-agent-widget.js` (requis)
- Votre endpoint API de connexion (requis)

## 📄 Licence

Ce widget est fourni tel quel. Adaptez-le selon vos besoins.

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les exemples fournis
3. Vérifiez la console du navigateur pour les erreurs

## 🔄 Mises à jour

Pour mettre à jour le widget :
1. Remplacez le fichier `livekit-agent-widget.js`
2. Videz le cache du navigateur
3. Testez sur une page de développement d'abord

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2024
