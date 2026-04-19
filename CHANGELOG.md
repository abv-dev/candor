# Changelog

## [v0.4.1] — 2026-04-19

### Added
- **Raccourci bureau** créé automatiquement à l'install (via fragment WiX custom)

## [v0.4.0] — 2026-04-19

### Renamed
- **Coach LoL Live → Candor** (honnêteté, franchise — colle à la philo "zéro invention")
- Repo GitHub : `abv-dev/coach-lol-live` → `abv-dev/candor`
- Site : `abv-dev.github.io/candor/`
- `productName: Candor` dans le bundle Windows
- Cargo package + lib renamed (`candor` / `candor_lib`)
- Identifier conservé (`com.abv.coachlollive`) pour que les v0.3.0 installées s'upgradent sans désinstallation
- Updater endpoints : nouveau URL en priorité + ancien en fallback

## [v0.3.0] — 2026-04-19

### Added
- **i18n FR/EN** dans l'app (module `src/i18n`) avec détection auto + persistance
- **Home screen** : splash 1.8s au démarrage (logo animé + gradient halo + loader)
- **Waiting screen** : animation d'orbes bleu/or/rouge + 12 tips LoL qui tournent toutes les 6s
- **Settings screen** complète :
  - Toggle rappels audio globaux
  - Toggle par objectif (Drake, Baron, Herald, Grubs)
  - Slider volume + bouton Test
  - Switch langue FR/EN
  - Mode démo toggle
  - Section À propos (version)
- **Bouton ⚙️ settings** dans le GameHeader

### Changed
- Routing entre écrans : home → (waiting | game) ↔ settings
- Audio config persisté en localStorage
- Textes de l'interface bilingues
- Supprimé AudioToggle (intégré dans Settings)

## [v0.2.1] — 2026-04-19

### Added
- **Rappels audio TTS** pour les 4 objectifs :
  - **Drake**, **Baron**, **Herald**, **Grubs** (Ancestral Voidgrubs)
  - Déclenchés **à 30s du spawn** ("Drake dans 30 secondes") et **au spawn** ("Drake disponible")
  - Voix synthèse vocale fr-FR via Web Speech API
- **Toggle audio** dans le dashboard (🔊/🔇) avec persistance localStorage
- **Timer Grubs** (Ancestral Voidgrubs) ajouté : spawn 6:00, disparition 14:00

### Changed
- Barre d'objectifs : 4 colonnes maintenant (Grubs · Drake · Herald · Baron)

## [v0.2.0] — 2026-04-19

### Added
- **Logo** design pro (dark + gold C + blue LIVE + corner accents)
- **Flèche indicatrice** dans le scoreboard : pointe vers l'équipe qui mène en items value, colorée bleu/rouge selon team
- **Typographie esports** : Rajdhani (corps) + Oxanium (titres) via Google Fonts
- **Header premium** : logo + titre stylisé + tagline + bordure gradient bleu/or

### Changed
- **Overlay** : matche spécifiquement `League of Legends.exe` (in-game), plus `LeagueClient.exe` (lobby). L'overlay ne s'affiche QUE pendant une partie.
- **Scoreboard** : gap value affichée en entier (plus de `.1k`), couleur selon team leader

## [v0.1.6] — 2026-04-17

### Fixed
- Compile error v0.1.5 : `active-win-pos-rs` expose `process_path` (pas `process_name`)

## [v0.1.5] — 2026-04-17

### Added
- **Overlay LoL-aware** : la fenêtre overlay s'affiche uniquement quand LoL a le focus. Switch vers une autre app (browser, Discord, etc.) → overlay se cache automatiquement.
- Poll toutes les 400ms via `active-win-pos-rs` côté Rust.

### Changed
- **Tailles** : fonts du micro overlay augmentées (top 17px, gold 40px, obj 24px, alert 15px)
- **Arrondi** : timers en secondes entières, gold diff sans décimales
- **Fenêtre overlay** : 380×300 (était 300×240)

## [v0.1.4] — 2026-04-17

### Fixed
- Overlay transparent : CSS scope `:not(.micro-window)` pour garantir que le gradient de fond ne contamine pas la fenêtre overlay Tauri
- Window config : `backgroundColor: #00000000` + `focus: false` + `visibleOnAllWorkspaces: true` pour transparence native Windows

### Notes d'utilisation
- **LoL doit être en mode "Borderless" ou "Windowed"** (Settings → Video → Window Mode)
- Le mode "Fullscreen" exclusif bloque les overlays (problème de Windows, pas de l'app)

## [v0.1.3] — 2026-04-17

### Fixed
- **Updater auto** : 404 au download. Le `latest.json` pointait vers un `.msi` avec espaces dans le nom alors que GitHub remplace les espaces par des points dans les assets.

## [v0.1.2] — 2026-04-17

### Fixed
- Overlay in-game : **vraiment transparent** maintenant (le fond HTML couvrait la transparence Tauri)
- Overlay in-game : **texte noir** avec halo blanc pour rester lisible sur les fonds sombres de LoL

## [v0.1.1] — 2026-04-17

### Added
- Tests unitaires Vitest pour `playerStats` (+8 tests, 41 au total)

### Changed
- `mockMode` par défaut = `!isTauri()` : en app native Windows, l'app part en LIVE direct. En web dev, mode MOCK (simulation).

## [v0.1.0] — 2026-04-17

Version initiale.

### Added
- Frontend React 18 + Vite + TypeScript
- Backend Tauri 2 (Rust) avec 2 fenêtres : main + overlay transparent
- Dashboard esports : scoreboard 5v5, guide joueur, live feed events
- Micro overlay always-on-top 300×240 avec 5-6 infos clés
- Live Client Data API via Rust command `fetch_live_game_data` (bypass cert self-signed)
- Images champions/items depuis Data Dragon CDN officiel
- Calculs factuels : items value (pas d'estimation gold), next item via components, timers objectifs
- Alertes factuelles (HP critical, gold stash, enemy dead, drake soon)
- Updater auto via `tauri-plugin-updater` signé minisign
- CI GitHub Actions : build Windows auto sur tag `v*`
- Tests unitaires (33 tests) sur la logique métier
- Pre-commit hook (typecheck + tests)
- Dependabot config
