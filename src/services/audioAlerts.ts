import type { AllGameData, Team } from '../types/liveClient';
import { computeObjectives } from '../logic/objectiveTimer';
import { computeDragonState } from '../logic/dragonSoul';
import { getAudioConfig } from './audioConfig';
import { getLang } from '../i18n';

const triggered = new Set<string>();
let hasRunOnce = false;

type ObjKey = 'drake' | 'baron' | 'herald' | 'grubs';

interface ObjectivePlan {
  name: string;
  key: ObjKey;
  scheduledAt: number | null;
}

const names: Record<Lang, Record<ObjKey, string>> = {
  fr: { drake: 'Drake', baron: 'Baron', herald: 'Herald', grubs: 'Grubs' },
  en: { drake: 'Drake', baron: 'Baron', herald: 'Herald', grubs: 'Grubs' },
};

const soulTypes: Record<Lang, Record<string, string>> = {
  fr: {
    Infernal: 'infernale', Ocean: 'océan', Cloud: 'nuage',
    Mountain: 'montagne', Hextech: 'hextech', Chemtech: 'chemtech',
  },
  en: {
    Infernal: 'Infernal', Ocean: 'Ocean', Cloud: 'Cloud',
    Mountain: 'Mountain', Hextech: 'Hextech', Chemtech: 'Chemtech',
  },
};

const teamNames: Record<Lang, Record<Team, string>> = {
  fr: { ORDER: 'bleue', CHAOS: 'rouge' },
  en: { ORDER: 'blue', CHAOS: 'red' },
};

type Lang = 'fr' | 'en';

const phrases: Record<Lang, {
  soon: (name: string) => string;
  up: (name: string) => string;
  soul: (type: string, team: string) => string;
  soulPredict: (type: string) => string;
  despawnSoon: (name: string) => string;
  killed: (target: string, team: string) => string;
}> = {
  fr: {
    soon: (n) => `${n} dans 30 secondes`,
    up: (n) => `${n} disponible`,
    soul: (t, team) => `Âme ${t} pour l'équipe ${team}`,
    soulPredict: (t) => `Soul ${t} en jeu`,
    despawnSoon: (n) => `${n} disparaît dans une minute`,
    killed: (target, team) => `L'équipe ${team} a tué ${target}`,
  },
  en: {
    soon: (n) => `${n} in 30 seconds`,
    up: (n) => `${n} available`,
    soul: (t, team) => `${t} soul secured by ${team} team`,
    soulPredict: (t) => `${t} soul incoming`,
    despawnSoon: (n) => `${n} disappears in one minute`,
    killed: (target, team) => `${team} team killed ${target}`,
  },
};

const GRUBS_DESPAWN_AT = 14 * 60;
const HERALD_DESPAWN_AT = 20 * 60;

interface KillTarget {
  eventName: string;
  key: ObjKey;
  targetLabel: (lang: Lang, dragonType?: string) => string;
}

const KILL_TARGETS: KillTarget[] = [
  {
    eventName: 'DragonKill',
    key: 'drake',
    targetLabel: (lang, type) => {
      if (type && soulTypes[lang][type]) return lang === 'fr' ? `le drake ${soulTypes[lang][type]}` : `the ${soulTypes[lang][type]} drake`;
      return lang === 'fr' ? 'le drake' : 'the drake';
    },
  },
  { eventName: 'BaronKill',  key: 'baron',  targetLabel: (lang) => (lang === 'fr' ? 'le Baron' : 'Baron') },
  { eventName: 'HeraldKill', key: 'herald', targetLabel: (lang) => (lang === 'fr' ? 'le Héraut' : 'Herald') },
  { eventName: 'HordeKill',  key: 'grubs',  targetLabel: (lang) => (lang === 'fr' ? 'les Grubs' : 'the Grubs') },
];

export function speak(text: string, opts?: { test?: boolean }): void {
  const config = getAudioConfig();
  if (!opts?.test && !config.enabled) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const lang = getLang();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
  msg.rate = 1.05;
  msg.pitch = 1.0;
  msg.volume = config.volume;

  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang.startsWith(lang));
  if (voice) msg.voice = voice;

  window.speechSynthesis.speak(msg);
}

export function testAudio(): void {
  const lang = getLang();
  const sample = lang === 'fr' ? 'Test audio — Baron dans 30 secondes' : 'Audio test — Baron in 30 seconds';
  speak(sample, { test: true });
}

export function resetAudioAlerts(): void {
  triggered.clear();
  hasRunOnce = false;
}

export function checkAudioAlerts(data: AllGameData): void {
  if (typeof window === 'undefined') return;
  const config = getAudioConfig();
  if (!config.enabled) return;

  const obj = computeObjectives(data);
  const now = data.gameData.gameTime;
  const lang = getLang();
  const ph = phrases[lang];

  const plans: ObjectivePlan[] = [
    { name: names[lang].drake,  key: 'drake',  scheduledAt: obj.nextDragonAt },
    { name: names[lang].baron,  key: 'baron',  scheduledAt: obj.nextBaronAt },
    { name: names[lang].herald, key: 'herald', scheduledAt: obj.nextHeraldAt },
    { name: names[lang].grubs,  key: 'grubs',  scheduledAt: obj.nextGrubsAt },
  ];

  for (const p of plans) {
    if (p.scheduledAt === null) continue;
    if (!config[p.key]) continue;

    const remaining = p.scheduledAt - now;

    if (remaining > 27 && remaining <= 30) {
      const id = `${p.key}-soon-${p.scheduledAt}`;
      if (!triggered.has(id)) {
        triggered.add(id);
        speak(ph.soon(p.name));
      }
    }

    if (remaining <= 1 && remaining > -3) {
      const id = `${p.key}-up-${p.scheduledAt}`;
      if (!triggered.has(id)) {
        triggered.add(id);
        speak(ph.up(p.name));
      }
    }
  }

  // Dragon soul — prediction after 2 drakes killed, then claim when a team reaches 4
  if (config.drake) {
    const soul = computeDragonState(data);

    if (soul.predictedSoulType) {
      const id = `soul-predict-${soul.predictedSoulType}`;
      if (!triggered.has(id)) {
        triggered.add(id);
        const typeLabel = soulTypes[lang][soul.predictedSoulType] ?? soul.predictedSoulType;
        speak(ph.soulPredict(typeLabel));
      }
    }

    if (soul.soulTeam && soul.soulType) {
      const id = `soul-claim-${soul.soulTeam}-${soul.soulType}`;
      if (!triggered.has(id)) {
        triggered.add(id);
        const typeLabel = soulTypes[lang][soul.soulType] ?? soul.soulType;
        speak(ph.soul(typeLabel, teamNames[lang][soul.soulTeam]));
      }
    }
  }

  // Despawn warnings — 1 min before objectives despawn, skipped if already killed
  if (config.grubs) {
    const grubsKilled = data.events.Events.some((e) => e.EventName === 'HordeKill');
    if (!grubsKilled) {
      const remaining = GRUBS_DESPAWN_AT - now;
      if (remaining <= 60 && remaining > 55) {
        const id = 'grubs-despawn-warn';
        if (!triggered.has(id)) {
          triggered.add(id);
          speak(ph.despawnSoon(names[lang].grubs));
        }
      }
    }
  }
  if (config.herald) {
    const heraldKilled = data.events.Events.some((e) => e.EventName === 'HeraldKill');
    if (!heraldKilled) {
      const remaining = HERALD_DESPAWN_AT - now;
      if (remaining <= 60 && remaining > 55) {
        const id = 'herald-despawn-warn';
        if (!triggered.has(id)) {
          triggered.add(id);
          speak(ph.despawnSoon(names[lang].herald));
        }
      }
    }
  }

  // Kill announcements — "Team X killed Y"
  const playerTeam = new Map<string, Team>();
  for (const p of data.allPlayers) playerTeam.set(p.summonerName, p.team);

  for (const e of data.events.Events) {
    const target = KILL_TARGETS.find((t) => t.eventName === e.EventName);
    if (!target) continue;
    if (!config[target.key]) continue;

    const id = `kill-${e.EventID}`;
    if (triggered.has(id)) continue;
    triggered.add(id);

    if (!hasRunOnce) continue; // skip historical events on first tick (app restart mid-game)

    const team = e.KillerName ? playerTeam.get(e.KillerName) : undefined;
    if (!team) continue;

    const label = target.targetLabel(lang, e.DragonType);
    speak(ph.killed(label, teamNames[lang][team]));
  }

  hasRunOnce = true;
}
