# 📸 Guide Visuel - Widget LiveKit Agent

## 🎯 Vue d'ensemble

Le widget LiveKit Agent offre **deux modes d'interaction** accessibles via des boutons flottants en bas à droite de votre page.

```
┌─────────────────────────────────────────┐
│                                         │
│         Votre Site Web                  │
│                                         │
│                                         │
│                              ┌────┐     │
│                              │ 💬 │ ← Popup
│                              └────┘     │
│                              ┌────┐     │
│                              │ 🎯 │ ← Inline
│                              └────┘     │
└─────────────────────────────────────────┘
```

---

## 💬 Mode Popup

### Apparence
```
┌─────────────────────────────────────────┐
│                                         │
│                              ┌─────────┐│
│                              │    ×    ││
│                              │         ││
│                              │  Agent  ││
│                              │         ││
│                              │ [Start] ││
│                              │         ││
│                              │ 🎤  📞  ││
│                              └─────────┘│
│                              ┌────┐     │
│                              │ 💬 │     │
│                              └────┘     │
└─────────────────────────────────────────┘
```

### Caractéristiques
- **Taille**: 360px × 480px
- **Position**: Bas-droite, au-dessus du bouton
- **Contenu**: 
  - Header avec nom de l'agent
  - Zone de conversation
  - Contrôles audio (micro, fin d'appel)
  - Bouton de fermeture (×)

### États

#### 1. État Initial (Bienvenue)
```
┌──────────────────────┐
│         ×            │
│                      │
│    [Agent Name]      │
│                      │
│  Start a conversation│
│   with our AI agent  │
│                      │
│    [Start Call]      │
│                      │
└──────────────────────┘
```

#### 2. État Connexion
```
┌──────────────────────┐
│         ×            │
│                      │
│    [Agent Name]      │
│                      │
│       ⟳              │
│   Connecting...      │
│                      │
└──────────────────────┘
```

#### 3. État Actif
```
┌──────────────────────┐
│  [Agent Name]    ×   │
├──────────────────────┤
│                      │
│  Connected!          │
│  Speak to start...   │
│                      │
├──────────────────────┤
│    🎤      📞        │
└──────────────────────┘
```

---

## 🎯 Mode Inline

### Apparence
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                    ┌──────────────────┐ │
│                    │ ×  [Start Call]  │ │
│                    └──────────────────┘ │
│                              ┌────┐     │
│                              │ 🎯 │     │
│                              └────┘     │
└─────────────────────────────────────────┘
```

### Caractéristiques
- **Taille**: 360px × 80px (compact)
- **Position**: Bas-droite, au-dessus du bouton
- **Style**: Barre arrondie (border-radius: 40px)
- **Contenu**: Bouton de démarrage et contrôles

### États

#### 1. État Initial
```
┌────────────────────────┐
│  ×    [Start Call]     │
└────────────────────────┘
```

#### 2. État Actif
```
┌────────────────────────┐
│  [Agent]  ×  🎤  📞   │
└────────────────────────┘
```

---

## 🎨 Personnalisation Visuelle

### Couleurs par Défaut

**Mode Clair**
- Bouton principal: `#002cf2` (Bleu LiveKit)
- Fond popup: `#ffffff` (Blanc)
- Texte: `#1f2937` (Gris foncé)

**Mode Sombre** (automatique)
- Bouton principal: `#1fd5f9` (Cyan)
- Fond popup: `#1f2937` (Gris foncé)
- Texte: `#f9fafb` (Blanc cassé)

### Exemples de Thèmes

#### Thème Vert (Support)
```javascript
LiveKitAgentWidget.init({
    agentName: 'Support',
    primaryColor: '#10b981',
    darkPrimaryColor: '#34d399'
});
```
```
┌────┐
│ 💬 │ ← Vert
└────┘
```

#### Thème Orange (E-commerce)
```javascript
LiveKitAgentWidget.init({
    agentName: 'Shopping',
    primaryColor: '#f59e0b',
    darkPrimaryColor: '#fbbf24'
});
```
```
┌────┐
│ 💬 │ ← Orange
└────┘
```

#### Thème Violet (Premium)
```javascript
LiveKitAgentWidget.init({
    agentName: 'Premium',
    primaryColor: '#8b5cf6',
    darkPrimaryColor: '#a78bfa'
});
```
```
┌────┐
│ 💬 │ ← Violet
└────┘
```

---

## 📱 Responsive Design

### Desktop (> 768px)
```
┌─────────────────────────────────────────┐
│                                         │
│         Contenu de la page              │
│                                         │
│                              ┌─────────┐│
│                              │ Widget  ││
│                              │ 360px   ││
│                              └─────────┘│
│                              ┌────┐     │
│                              │ 💬 │     │
│                              └────┘     │
└─────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────────┐
│                      │
│   Contenu mobile     │
│                      │
│  ┌────────────────┐  │
│  │    Widget      │  │
│  │   Full width   │  │
│  └────────────────┘  │
│        ┌────┐        │
│        │ 💬 │        │
│        └────┘        │
└──────────────────────┘
```

---

## 🔄 Flux d'Interaction

### Scénario Popup

```
1. Utilisateur clique sur 💬
   ↓
2. Overlay apparaît (fond semi-transparent)
   ↓
3. Popup s'anime (slide up + fade in)
   ↓
4. Affichage écran de bienvenue
   ↓
5. Utilisateur clique "Start Call"
   ↓
6. Connexion à LiveKit
   ↓
7. Activation du microphone
   ↓
8. Session active
   ↓
9. Utilisateur peut:
   - Parler avec l'agent
   - Couper/activer le micro (🎤)
   - Terminer l'appel (📞)
   - Fermer (×)
```

### Scénario Inline

```
1. Utilisateur clique sur 🎯
   ↓
2. Barre inline apparaît (slide up + fade in)
   ↓
3. Affichage bouton "Start Call"
   ↓
4. Utilisateur clique "Start Call"
   ↓
5. Connexion à LiveKit
   ↓
6. Barre affiche les contrôles
   ↓
7. Session active (même que popup)
```

---

## 🎭 Animations

### Entrée
- **Type**: Slide up + Fade in
- **Durée**: 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

```
Opacity: 0 → 1
TranslateY: 20px → 0
```

### Sortie
- **Type**: Slide down + Fade out
- **Durée**: 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

```
Opacity: 1 → 0
TranslateY: 0 → 20px
```

### Hover sur boutons
- **Type**: Scale + Shadow
- **Durée**: 200ms

```
Scale: 1 → 1.1
Shadow: 4px → 6px
```

---

## 🎪 Tooltips

Les boutons flottants affichent des tooltips au survol:

```
┌────────────────┐  ┌────┐
│ Open Popup Chat│  │ 💬 │
└────────────────┘  └────┘

┌────────────────┐  ┌────┐
│ Open Inline Chat│ │ 🎯 │
└────────────────┘  └────┘
```

**Style**:
- Fond: `rgba(0, 0, 0, 0.8)`
- Texte: Blanc
- Position: À gauche du bouton
- Animation: Fade in (300ms)

---

## 🔍 Z-Index Hierarchy

```
Overlay:     999998
Popup/Inline: 999999
Buttons:     999999
```

Garantit que le widget est toujours au-dessus du contenu de la page.

---

## 📐 Dimensions Exactes

### Boutons Flottants
- Taille: `60px × 60px`
- Border-radius: `50%` (cercle parfait)
- Gap entre boutons: `12px`
- Distance du bord: `20px`

### Popup
- Largeur: `360px`
- Hauteur: `480px`
- Border-radius: `28px`
- Distance du bas: `100px` (au-dessus des boutons)

### Inline
- Largeur: `360px`
- Hauteur: `80px`
- Border-radius: `40px`
- Distance du bas: `100px`

### Mobile
- Largeur: `auto` (avec marges de 10px)
- Hauteur: Identique
- Border-radius: Identique

---

## 🎨 Palette de Couleurs Complète

### Bleu (Défaut)
```
Primary:      #002cf2
Primary Dark: #1fd5f9
Hover:        #0024c2
Active:       #001a92
```

### Vert (Support)
```
Primary:      #10b981
Primary Dark: #34d399
Hover:        #059669
Active:       #047857
```

### Orange (E-commerce)
```
Primary:      #f59e0b
Primary Dark: #fbbf24
Hover:        #d97706
Active:       #b45309
```

### Violet (Premium)
```
Primary:      #8b5cf6
Primary Dark: #a78bfa
Hover:        #7c3aed
Active:       #6d28d9
```

### Rouge (Urgent)
```
Primary:      #ef4444
Primary Dark: #f87171
Hover:        #dc2626
Active:       #b91c1c
```

---

## 🌓 Mode Sombre

Le widget détecte automatiquement le mode sombre via:
```css
@media (prefers-color-scheme: dark) {
  /* Styles sombres */
}
```

### Changements Automatiques
- Fond: Blanc → Gris foncé (`#1f2937`)
- Texte: Gris foncé → Blanc cassé (`#f9fafb`)
- Bordures: Gris clair → Gris moyen (`#374151`)
- Boutons: Ajustement automatique de la luminosité

---

## 📊 Hiérarchie Visuelle

```
┌─────────────────────────────────────┐
│  Header (Nom Agent + Fermer)        │ ← Niveau 1
├─────────────────────────────────────┤
│                                     │
│  Zone Principale                    │ ← Niveau 2
│  (Contenu / Messages)               │
│                                     │
├─────────────────────────────────────┤
│  Contrôles (Micro, Fin d'appel)     │ ← Niveau 3
└─────────────────────────────────────┘
```

---

## ✨ Points Clés

1. **Isolation**: Shadow DOM garantit zéro conflit
2. **Accessibilité**: Tooltips et labels clairs
3. **Performance**: Animations GPU-accelerated
4. **UX**: Feedback visuel immédiat
5. **Responsive**: S'adapte à tous les écrans
6. **Thématique**: Dark mode automatique
7. **Personnalisation**: Couleurs configurables
8. **Simplicité**: 2 lignes de code pour intégrer

---

**Le widget est conçu pour être visuellement attrayant, performant et facile à intégrer !** 🎨✨
