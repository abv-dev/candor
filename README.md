# Candor

Dashboard + overlay factuel temps réel pour League of Legends.

**Principe** : zéro IA, zéro interprétation. L'app lit le Live Client Data API officiel de Riot (`https://127.0.0.1:2999/liveclientdata/allgamedata`) et affiche les faits. Le joueur garde son cerveau.

## Deux vues

- **Dashboard** — fenêtre plein écran avec scoreboard broadcast (OTP-style), guide joueur centré sur toi, live feed events.
- **Micro overlay** — fenêtre transparente always-on-top (~300×240) avec 5-6 infos clés, posée dans un coin de l'écran pendant que tu joues.

## Stack

- Frontend : React 18 + Vite + TypeScript
- Backend natif : Tauri 2 (Rust)
- Data : Riot Live Client Data API (port 2999) + Data Dragon CDN (images)

## Dev web-only (sans Tauri, depuis n'importe où)

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173/. Le mode mock est activé par défaut (game simulée qui tourne, pas besoin de LoL ouvert).

## Build Windows natif (pour usage en game)

### Prérequis (une fois)

Sur ton Windows 10 :

```powershell
# Rust
winget install --id Rustlang.Rustup

# Visual Studio Build Tools (workload "Desktop development with C++")
winget install --id Microsoft.VisualStudio.2022.BuildTools

# WebView2 (préinstallé sur Win10 récent, sinon)
winget install --id Microsoft.EdgeWebView2Runtime

# Node.js v20 LTS si pas déjà
# https://nodejs.org/
```

Redémarre le terminal après l'install de Rust.

### Clone + install

```powershell
git clone git@github.com:abv-dev/candor.git
cd candor
npm install
```

### Générer les icônes (placeholder → toutes tailles)

```powershell
npx tauri icon src-tauri/icons/icon.png
```

Ça crée `icon.ico`, `icon.icns`, les tailles 32/128/128@2x à partir du PNG source.

### Lancer en mode dev Tauri (pendant que LoL est ouvert)

```powershell
npm run tauri:dev
```

Deux fenêtres s'ouvrent :
1. Dashboard (fenêtre normale)
2. Overlay transparent (coin haut-gauche, always-on-top)

L'app se connecte au Live Client API via une commande Rust qui bypass le cert self-signed.

### Build du .msi installable

```powershell
npm run tauri:build
```

Le `.msi` atterrit dans `src-tauri/target/release/bundle/msi/`. Double-clique pour installer — l'app apparaît dans le menu démarrer.

## Mises à jour automatiques

L'app **vérifie au démarrage** si une nouvelle version est dispo sur GitHub. Si oui, elle télécharge, installe et redémarre toute seule. Tu n'as jamais besoin de réinstaller manuellement.

### Flow

```
dev pousse un tag          → GitHub Actions build .msi sur Windows runner
push git tag v0.2.0          ↓
                             signe le bundle avec la clé privée (secret GH)
                             ↓
                             crée GitHub Release + publie .msi + latest.json
                             ↓
app chez l'user détecte la new version au prochain lancement
                             ↓
download + install + restart (toutes les étapes automatiques)
```

### Setup (une fois, avant le premier release)

**1. Secrets GitHub** — ajoute-les dans Settings → Secrets and variables → Actions :

| Secret | Valeur |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | contenu de `~/.tauri/coach-lol-live.key` (signature key conservée, on n'en change pas — les updates restent signées par la même clé) (base64) |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | vide (pas de password) |

**2. Repo public** — les releases sont accessibles à l'URL `releases/latest/download/...` sans auth. Pour que l'auto-update marche sans token embarqué, **le repo doit être public**. (Le code n'a aucun secret — les clés sont dans ton home + GitHub secrets.)

### Publier une nouvelle version

```bash
# Bump la version (édite src-tauri/tauri.conf.json + package.json)
# Ex : "version": "0.1.0" → "0.2.0"

git add -A
git commit -m "Bump v0.2.0"
git tag v0.2.0
git push && git push --tags
```

GitHub Actions prend le relais. 5-10 min plus tard ton Windows détectera l'update au prochain démarrage de l'app.

## Structure

```
src/
  App.tsx                 # détecte ?view=micro pour l'overlay, sinon dashboard
  main.tsx
  components/
    Dashboard.tsx         # vue plein écran (scoreboard + guide + events)
    MicroOverlay.tsx      # vue compacte in-game
    BroadcastScoreboard.tsx
    TeamPanel.tsx
    PlayerCard.tsx
    PlayerGuide.tsx       # section centrée sur le joueur actif
    GameHeader.tsx
    ObjectiveBar.tsx
    LiveFeed.tsx
    AlertList.tsx
    ChampionImage.tsx     # images Data Dragon
    ItemImage.tsx
  logic/
    goldCalc.ts           # items value (somme items_db, 100% factuel)
    itemProgress.ts       # next item via components Data Dragon
    directOpponent.ts     # matchup direct (même position)
    playerStats.ts        # agrégats équipe + comparaisons
    objectiveTimer.ts     # drake/baron/herald timers
    alertEngine.ts        # alertes factuelles (pas de verdicts)
    eventHistory.ts       # format des events récents
  services/
    liveClient.ts         # Tauri invoke ou Vite proxy selon contexte
    ddragon.ts            # URLs CDN officielles
  mock/
    gameState.ts          # simulateur de game pour dev sans LoL
  data/
    items.json            # Data Dragon items patch 16.7.1
src-tauri/
  Cargo.toml              # deps Rust
  tauri.conf.json         # config 2 fenêtres (main + overlay)
  src/lib.rs              # commande Rust fetch_live_game_data (bypass SSL)
  capabilities/default.json
```

## Limites connues

- L'app ne peut pas **savoir** ce que l'API Live Client ne dit pas : position des joueurs sur la map, cooldowns ennemis, wave state.
- Elle ne **recommande pas** de build ou de runes (ce serait de l'invention).
- Pour un vrai "coach" qui analyse ta game, il faudrait un LLM — rejeté pour la v1 car il hallucinait sur le projet précédent.

## Licence

Privée — usage personnel.
