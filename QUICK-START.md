# 🚀 Quick Start - Widget LiveKit Agent

## Installation Ultra-Rapide

### Étape 1: Copiez le fichier
Copiez `public/livekit-agent-widget.js` dans votre projet web.

### Étape 2: Intégrez dans votre HTML
Ajoutez ces 2 lignes avant la balise `</body>` :

```html
<script src="livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({
        agentName: 'Mon Agent'
    });
</script>
```

### Étape 3: C'est tout ! ✅

Deux boutons flottants apparaîtront en bas à droite :
- 💬 **Popup** - Interface complète
- 🎯 **Inline** - Barre compacte

---

## Exemples de Pages

### 📄 Voir les démos
- `public/demo.html` - Démonstration complète avec documentation
- `public/minimal-example.html` - Exemple minimal

### 🌐 Tester localement
1. Démarrez votre serveur Next.js :
   ```bash
   pnpm dev
   ```

2. Ouvrez dans votre navigateur :
   - http://localhost:3000/demo.html
   - http://localhost:3000/minimal-example.html

---

## Configuration

### Minimale (requis)
```javascript
LiveKitAgentWidget.init({
    agentName: 'Support'
});
```

### Complète (optionnelle)
```javascript
LiveKitAgentWidget.init({
    agentName: 'Assistant IA',
    apiEndpoint: '/api/connection-details',
    primaryColor: '#6366f1',
    darkPrimaryColor: '#818cf8'
});
```

---

## Personnalisation des Couleurs

### Exemples de thèmes

**Bleu (défaut)**
```javascript
primaryColor: '#002cf2'
```

**Vert**
```javascript
primaryColor: '#10b981'
```

**Violet**
```javascript
primaryColor: '#8b5cf6'
```

**Orange**
```javascript
primaryColor: '#f59e0b'
```

**Rouge**
```javascript
primaryColor: '#ef4444'
```

---

## Intégration selon votre Stack

### HTML pur ✅
```html
<script src="livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({ agentName: 'Agent' });
</script>
```

### WordPress ✅
Ajoutez dans votre thème (footer.php) :
```php
<script src="<?php echo get_template_directory_uri(); ?>/js/livekit-agent-widget.js"></script>
<script>
    LiveKitAgentWidget.init({ agentName: 'Support' });
</script>
```

### React ✅
```jsx
useEffect(() => {
    const script = document.createElement('script');
    script.src = '/livekit-agent-widget.js';
    script.onload = () => {
        window.LiveKitAgentWidget.init({ agentName: 'Agent' });
    };
    document.body.appendChild(script);
}, []);
```

### Vue.js ✅
```vue
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    const script = document.createElement('script');
    script.src = '/livekit-agent-widget.js';
    script.onload = () => {
        window.LiveKitAgentWidget.init({ agentName: 'Agent' });
    };
    document.body.appendChild(script);
});
</script>
```

---

## Fonctionnalités Clés

✅ **Autonome** - Un seul fichier JavaScript  
✅ **Isolé** - Shadow DOM, zéro conflit CSS/JS  
✅ **Léger** - Charge LiveKit SDK à la demande  
✅ **Responsive** - Mobile, tablette, desktop  
✅ **Dark Mode** - Support automatique  
✅ **2 Modes** - Popup ou inline  

---

## Dépannage Rapide

### Le widget ne s'affiche pas ?
1. Vérifiez la console du navigateur (F12)
2. Assurez-vous que le fichier JS est bien chargé
3. Vérifiez que `init()` est appelé après le chargement du script

### Erreur de connexion ?
1. Vérifiez que votre endpoint API est accessible
2. Testez l'URL : `http://localhost:3000/api/connection-details`
3. Vérifiez les variables d'environnement LiveKit

### Le bouton ne réagit pas ?
1. Vérifiez qu'il n'y a pas d'erreurs JavaScript
2. Testez dans un autre navigateur
3. Videz le cache du navigateur

---

## Build & Déploiement

### Version de développement
Utilisez directement `public/livekit-agent-widget.js`

### Version de production (minifiée)
```bash
pnpm run build-widget
```
Cela créera `public/livekit-agent-widget.min.js`

### Déploiement
1. Copiez le fichier JS sur votre serveur
2. Assurez-vous que votre endpoint API est accessible
3. Testez sur une page de staging d'abord

---

## Support

📖 **Documentation complète** : Voir `WIDGET-README.md`  
🔧 **Exemples** : `public/demo.html` et `public/minimal-example.html`  
💡 **Configuration** : Voir section "Configuration" ci-dessus  

---

**Version:** 1.0.0  
**Prêt à l'emploi !** 🎉
