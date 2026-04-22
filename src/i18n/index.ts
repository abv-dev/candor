import { useEffect, useSyncExternalStore } from 'react';

export type Lang = 'fr' | 'en';

const STORAGE_KEY = 'coach-lol-live:lang';

const dictionaries: Record<Lang, Record<string, string>> = {
  fr: {
    'home.subtitle': 'Dashboard factuel temps réel',
    'home.loading': 'Chargement...',
    'home.hero.tagline': 'Vois ta game telle qu\'elle est. Sans filtre, sans IA, sans deviner.',
    'home.cta.start': 'Démarrer',
    'home.cta.demo': 'Voir la démo',
    'home.features.title': 'Ce que tu vois',
    'home.features.dashboard.title': 'Dashboard broadcast',
    'home.features.dashboard.body': 'Scoreboard 5v5, gold par lane, events live. Tout est chiffré, rien n\'est inventé.',
    'home.features.overlay.title': 'Overlay micro',
    'home.features.overlay.body': 'Toujours au-dessus du jeu, transparent, non intrusif. Texte noir + halo blanc haut-contraste.',
    'home.features.audio.title': 'Rappels audio',
    'home.features.audio.body': 'TTS FR/EN à 30s du spawn et au spawn : Drake, Baron, Herald, Grubs.',
    'home.features.factual.title': 'Zéro IA',
    'home.features.factual.body': 'Gold calculé depuis l\'items DB officielle de Riot. Aucune reco générée, aucun build imposé.',
    'home.philo.title': 'La philo',
    'home.philo.body': 'Candor te donne les faits. Tu décides. Pas de LLM, pas de "tier list", pas de build hardcodé.',
    'home.quit_demo': 'Quitter la démo',

    'end.title': 'Partie terminée',
    'end.soul': 'Soul sécurisée',
    'end.back': "Retour à l'accueil",
    'end.note': "Résumé basé sur le dernier snapshot avant la fin de la game.",

    'waiting.title': 'En attente d\'une partie',
    'waiting.subtitle': 'Lance une game de LoL et l\'app se connecte automatiquement',

    'settings.title': 'Paramètres',
    'settings.back': 'Retour',
    'settings.audio.title': 'Rappels audio',
    'settings.audio.global': 'Activer les rappels audio',
    'settings.audio.drake': 'Drake',
    'settings.audio.baron': 'Baron',
    'settings.audio.herald': 'Herald',
    'settings.audio.grubs': 'Ancestral Grubs',
    'settings.audio.volume': 'Volume',
    'settings.audio.test': 'Tester',
    'settings.language.title': 'Langue',
    'settings.about.title': 'À propos',
    'settings.about.version': 'Version',

    'nav.settings': 'Paramètres',
    'nav.dashboard': 'Dashboard',
    'nav.micro': 'Micro',

    'common.on': 'Activé',
    'common.off': 'Désactivé',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',

    'tips.0': 'Chaque CS rapporte 21 gold. 10 CS/min = 210 gold/min.',
    'tips.1': 'Le Drake respawn 5 minutes après son kill.',
    'tips.2': 'Le Baron apparaît à 20 minutes, respawn 6 min après kill.',
    'tips.3': 'Herald disparaît à 20 min pour laisser place au Baron.',
    'tips.4': 'First Blood donne 400g bonus au killer.',
    'tips.5': 'Les wards durent 90 à 180s selon le type.',
    'tips.6': 'Tour plates tombent à 14 minutes.',
    'tips.7': 'Un kill donne 300g + bounty selon le streak.',
    'tips.8': 'Le rift herald spawn à 14 minutes.',
    'tips.9': 'Les Ancestral Voidgrubs spawn à 6 minutes.',
    'tips.10': 'Les lanes pushent naturellement vers la tour côté défense.',
    'tips.11': 'L\'aura Herald fait tomber les plates plus vite.',
  },
  en: {
    'home.subtitle': 'Real-time factual dashboard',
    'home.loading': 'Loading...',
    'home.hero.tagline': 'See your game as it is. No filter, no AI, no guesswork.',
    'home.cta.start': 'Start',
    'home.cta.demo': 'See demo',
    'home.features.title': 'What you see',
    'home.features.dashboard.title': 'Broadcast dashboard',
    'home.features.dashboard.body': '5v5 scoreboard, lane gold, live events. Everything is computed, nothing invented.',
    'home.features.overlay.title': 'Micro overlay',
    'home.features.overlay.body': 'Always on top, transparent, non-intrusive. Black text + white halo for max contrast.',
    'home.features.audio.title': 'Audio reminders',
    'home.features.audio.body': 'TTS FR/EN at 30s pre-spawn and at spawn: Drake, Baron, Herald, Grubs.',
    'home.features.factual.title': 'Zero AI',
    'home.features.factual.body': 'Gold computed from Riot\'s official items DB. No LLM recommendations, no forced builds.',
    'home.philo.title': 'The philosophy',
    'home.philo.body': 'Candor gives you the facts. You decide. No LLM, no tier list, no hardcoded build.',
    'home.quit_demo': 'Quit demo',

    'end.title': 'Game over',
    'end.soul': 'Soul secured',
    'end.back': 'Back home',
    'end.note': 'Summary from the last snapshot before the game ended.',

    'waiting.title': 'Waiting for a game',
    'waiting.subtitle': 'Start a LoL game and the app will connect automatically',

    'settings.title': 'Settings',
    'settings.back': 'Back',
    'settings.audio.title': 'Audio reminders',
    'settings.audio.global': 'Enable audio reminders',
    'settings.audio.drake': 'Drake',
    'settings.audio.baron': 'Baron',
    'settings.audio.herald': 'Herald',
    'settings.audio.grubs': 'Ancestral Grubs',
    'settings.audio.volume': 'Volume',
    'settings.audio.test': 'Test',
    'settings.language.title': 'Language',
    'settings.about.title': 'About',
    'settings.about.version': 'Version',

    'nav.settings': 'Settings',
    'nav.dashboard': 'Dashboard',
    'nav.micro': 'Micro',

    'common.on': 'On',
    'common.off': 'Off',
    'common.save': 'Save',
    'common.cancel': 'Cancel',

    'tips.0': 'Each minion gives 21 gold. 10 CS/min = 210 gold/min.',
    'tips.1': 'Drake respawns 5 minutes after its kill.',
    'tips.2': 'Baron spawns at 20 minutes, respawns 6 min after kill.',
    'tips.3': 'Herald disappears at 20 min to make room for Baron.',
    'tips.4': 'First Blood gives 400g bonus to the killer.',
    'tips.5': 'Wards last 90 to 180 seconds depending on the type.',
    'tips.6': 'Tower plates fall at 14 minutes.',
    'tips.7': 'A kill gives 300g + bounty based on streak.',
    'tips.8': 'Rift Herald spawns at 14 minutes.',
    'tips.9': 'Ancestral Voidgrubs spawn at 6 minutes.',
    'tips.10': 'Lanes naturally push toward the defensive tower.',
    'tips.11': 'The Herald aura makes plates fall faster.',
  },
};

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'fr';
  const stored = window.localStorage?.getItem(STORAGE_KEY);
  if (stored === 'fr' || stored === 'en') return stored;
  return (navigator.language || '').startsWith('en') ? 'en' : 'fr';
}

let currentLang: Lang = detectInitial();
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (currentLang === lang) return;
  currentLang = lang;
  if (typeof window !== 'undefined') {
    window.localStorage?.setItem(STORAGE_KEY, lang);
  }
  listeners.forEach((l) => l());
}

export function getLang(): Lang {
  return currentLang;
}

export function t(key: string): string {
  return dictionaries[currentLang][key] ?? key;
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useT() {
  useLang();
  return t;
}

export function getTips(): string[] {
  const tips: string[] = [];
  let i = 0;
  while (dictionaries[currentLang][`tips.${i}`]) {
    tips.push(dictionaries[currentLang][`tips.${i}`]!);
    i++;
  }
  return tips;
}

// Avoid unused warning on useEffect import (keep for future)
export { useEffect };
