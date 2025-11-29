# 🚀 Démarrage Rapide - Widget LiveKit Agent

Bienvenue ! Ce guide vous aidera à démarrer avec le widget LiveKit Agent en quelques minutes.

---

## 📦 Ce qui a été créé

Un **widget JavaScript autonome** qui peut être intégré dans n'importe quel site web avec seulement **2 lignes de code**.

### Fichier Principal
- **`public/livekit-agent-widget.js`** - Le widget complet et prêt à l'emploi

### Pages de Démonstration
1. **`public/index.html`** - Hub de navigation (COMMENCEZ ICI !)
2. **`public/demo.html`** - Démonstration complète
3. **`public/minimal-example.html`** - Exemple minimal
4. **`public/integration-examples.html`** - Exemples multi-frameworks
5. **`public/test-widget.html`** - Page de tests

### Documentation
1. **`QUICK-START.md`** - Guide rapide (EN)
2. **`WIDGET-README.md`** - Documentation complète (EN)
3. **`INTEGRATION-SUMMARY.md`** - Résumé du projet
4. **`VISUAL-GUIDE.md`** - Guide visuel et design
5. **`CHANGELOG-WIDGET.md`** - Historique des versions

---

## 🎯 Démarrage en 3 Étapes

### Étape 1: Démarrer le Serveur

```bash
pnpm dev
```

Le serveur démarre sur http://localhost:3000

### Étape 2: Ouvrir le Hub de Démonstration

Ouvrez votre navigateur et allez à:
```
http://localhost:3000/index.html
```

Ou directement:
```
http://localhost:3000/demo.html
```

### Étape 3: Tester le Widget

Vous verrez **2 boutons flottants** en bas à droite :
- **💬 Bouton Popup** - Ouvre une fenêtre de chat complète
- **🎯 Bouton Inline** - Ouvre une barre de chat compacte

Cliquez sur l'un d'eux pour tester !

---

## 💡 Intégration dans Votre Site

### Code Minimal (2 lignes)

```html
<script src="livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({
        agentName: 'Mon Agent'
    });
</script>
```

### Avec Configuration Personnalisée

```html
<script src="livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({
        agentName: 'Assistant IA',
        apiEndpoint: '/api/connection-details',
        primaryColor: '#6366f1',
        darkPrimaryColor: '#818cf8'
    });
</script>
```

---

## 🎨 Personnalisation des Couleurs

### Exemples de Thèmes

```javascript
// Bleu (défaut)
primaryColor: '#002cf2'

// Vert (Support)
primaryColor: '#10b981'

// Orange (E-commerce)
primaryColor: '#f59e0b'

// Violet (Premium)
primaryColor: '#8b5cf6'

// Rouge (Urgent)
primaryColor: '#ef4444'
```

---

## 📱 Les Deux Modes

### Mode Popup (💬)
- Fenêtre flottante complète
- Taille: 360px × 480px
- Idéal pour conversations détaillées
- Interface riche avec header et contrôles

### Mode Inline (🎯)
- Barre compacte
- Taille: 360px × 80px
- Idéal pour intégration discrète
- S'agrandit lors de l'utilisation

---

## 🔧 Configuration API

Le widget nécessite un endpoint API qui retourne les détails de connexion LiveKit.

### Endpoint par Défaut
```
/api/connection-details
```

### Format de Réponse Attendu
```json
{
    "serverUrl": "wss://your-livekit-server.com",
    "participantToken": "eyJhbGc..."
}
```

### Personnaliser l'Endpoint
```javascript
LiveKitAgentWidget.init({
    agentName: 'Agent',
    apiEndpoint: 'https://api.example.com/livekit/connect'
});
```

---

## 📚 Navigation dans la Documentation

### Pour Démarrer Rapidement
1. Ouvrez `public/index.html` dans votre navigateur
2. Cliquez sur "Minimal Example"
3. Regardez le code source (2 lignes !)

### Pour Voir Toutes les Fonctionnalités
1. Ouvrez `public/demo.html`
2. Testez les deux modes (💬 et 🎯)
3. Lisez la documentation intégrée

### Pour Intégrer dans Votre Framework
1. Ouvrez `public/integration-examples.html`
2. Trouvez votre framework (React, Vue, WordPress, etc.)
3. Copiez le code d'exemple

### Pour la Documentation Complète
- **Français**: Ce fichier (GETTING-STARTED-FR.md)
- **Anglais**: QUICK-START.md et WIDGET-README.md

---

## ✨ Fonctionnalités Clés

### Isolation Complète
- ✅ Utilise Shadow DOM
- ✅ Aucun conflit CSS avec votre site
- ✅ Aucun conflit JavaScript
- ✅ Styles complètement encapsulés

### Compatibilité
- ✅ HTML pur
- ✅ React
- ✅ Vue.js
- ✅ Angular
- ✅ WordPress
- ✅ Tout framework web moderne

### Design
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Dark mode automatique
- ✅ Animations fluides
- ✅ Interface moderne

### Performance
- ✅ Fichier unique (~23 KB)
- ✅ Charge LiveKit SDK à la demande
- ✅ Optimisé pour la production
- ✅ Animations GPU-accelerated

---

## 🧪 Tester Localement

### 1. Page de Test Automatique
```
http://localhost:3000/test-widget.html
```
Cette page exécute des tests automatiques pour vérifier que tout fonctionne.

### 2. Test Manuel
1. Ouvrez n'importe quelle page de démo
2. Cliquez sur le bouton 💬 (Popup)
3. Cliquez sur "Start Call"
4. Autorisez l'accès au microphone
5. Parlez avec l'agent !

### 3. Test sur Mobile
1. Trouvez l'adresse réseau (affichée au démarrage du serveur)
2. Ouvrez sur votre mobile: `http://192.168.x.x:3000/demo.html`
3. Testez les deux modes

---

## 🚀 Déploiement en Production

### 1. Fichiers à Déployer
- `livekit-agent-widget.js` (requis)
- Votre endpoint API (requis)

### 2. Optimisation (Optionnel)
```bash
pnpm run build-widget
```
Cela crée `livekit-agent-widget.min.js` (version minifiée)

### 3. Configuration Serveur
- Activez la compression GZIP
- Configurez le cache navigateur
- Utilisez HTTPS pour la production

---

## 🎯 Cas d'Usage

### Site E-commerce
```javascript
LiveKitAgentWidget.init({
    agentName: 'Assistant Shopping',
    primaryColor: '#f59e0b' // Orange
});
```

### Site de Support
```javascript
LiveKitAgentWidget.init({
    agentName: 'Support Client',
    primaryColor: '#10b981' // Vert
});
```

### Application SaaS
```javascript
LiveKitAgentWidget.init({
    agentName: 'Assistant IA',
    primaryColor: '#8b5cf6' // Violet
});
```

---

## 🐛 Dépannage

### Le widget ne s'affiche pas ?
1. Ouvrez la console du navigateur (F12)
2. Vérifiez qu'il n'y a pas d'erreurs
3. Vérifiez que le fichier JS est bien chargé
4. Vérifiez que `init()` est appelé après le chargement

### Erreur de connexion ?
1. Testez l'endpoint: http://localhost:3000/api/connection-details
2. Vérifiez les variables d'environnement (.env.local)
3. Vérifiez que le serveur LiveKit est accessible

### Le bouton ne réagit pas ?
1. Vérifiez la console pour les erreurs JavaScript
2. Testez dans un autre navigateur
3. Videz le cache du navigateur (Ctrl+F5)

---

## 📖 Ressources

### Documentation Locale
- `QUICK-START.md` - Guide rapide (EN)
- `WIDGET-README.md` - Documentation complète (EN)
- `VISUAL-GUIDE.md` - Guide visuel
- `INTEGRATION-SUMMARY.md` - Résumé du projet

### Exemples
- `public/demo.html` - Démo complète
- `public/minimal-example.html` - Exemple minimal
- `public/integration-examples.html` - Multi-frameworks
- `public/test-widget.html` - Tests

### Ressources LiveKit
- Documentation: https://docs.livekit.io
- GitHub: https://github.com/livekit
- Community Slack: https://livekit.io/join-slack

---

## 🎉 Prochaines Étapes

### 1. Explorez les Démos
Visitez http://localhost:3000/index.html pour voir toutes les démos disponibles.

### 2. Testez l'Intégration
Copiez le code dans une de vos pages et testez.

### 3. Personnalisez
Changez les couleurs et le nom de l'agent selon vos besoins.

### 4. Déployez
Quand vous êtes prêt, déployez le widget sur votre site en production.

---

## 💬 Support

### Questions ?
- Consultez la documentation complète dans `WIDGET-README.md`
- Regardez les exemples dans `public/integration-examples.html`
- Testez avec `public/test-widget.html`

### Besoin d'Aide ?
- Vérifiez la console du navigateur pour les erreurs
- Consultez le guide de dépannage ci-dessus
- Rejoignez la communauté LiveKit Slack

---

## ✅ Checklist de Démarrage

- [ ] Serveur démarré (`pnpm dev`)
- [ ] Page de démo ouverte (http://localhost:3000/demo.html)
- [ ] Boutons flottants visibles (💬 et 🎯)
- [ ] Test du mode Popup réussi
- [ ] Test du mode Inline réussi
- [ ] Code d'intégration copié
- [ ] Personnalisation testée (couleurs, nom)
- [ ] Documentation lue
- [ ] Prêt pour l'intégration !

---

**Félicitations ! Vous êtes prêt à intégrer le widget LiveKit Agent sur votre site !** 🎉

---

**Version:** 1.0.0  
**Dernière mise à jour:** 23 novembre 2024  
**Langue:** Français
