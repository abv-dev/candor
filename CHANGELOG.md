# Changelog

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
- Dashboard broadcast OTP-style : scoreboard 5v5, guide joueur, live feed events
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
