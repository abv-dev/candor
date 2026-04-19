import type { AllGameData } from '../types/liveClient';
import { computeObjectives } from '../logic/objectiveTimer';
import { getAudioConfig } from './audioConfig';
import { getLang } from '../i18n';

const triggered = new Set<string>();

type ObjKey = 'drake' | 'baron' | 'herald' | 'grubs';

interface ObjectivePlan {
  name: string;
  key: ObjKey;
  inSeconds: number | null;
  now: number;
}

const names: Record<Lang, Record<ObjKey, string>> = {
  fr: { drake: 'Drake', baron: 'Baron', herald: 'Herald', grubs: 'Grubs' },
  en: { drake: 'Drake', baron: 'Baron', herald: 'Herald', grubs: 'Grubs' },
};

type Lang = 'fr' | 'en';

const phrases: Record<Lang, { soon: (name: string) => string; up: (name: string) => string }> = {
  fr: {
    soon: (n) => `${n} dans 30 secondes`,
    up: (n) => `${n} disponible`,
  },
  en: {
    soon: (n) => `${n} in 30 seconds`,
    up: (n) => `${n} available`,
  },
};

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
    { name: names[lang].drake,  key: 'drake',  inSeconds: obj.nextDragonIn, now },
    { name: names[lang].baron,  key: 'baron',  inSeconds: obj.nextBaronIn, now },
    { name: names[lang].herald, key: 'herald', inSeconds: obj.nextHeraldIn, now },
    { name: names[lang].grubs,  key: 'grubs',  inSeconds: obj.nextGrubsIn, now },
  ];

  for (const p of plans) {
    if (p.inSeconds === null || p.inSeconds < 0) continue;
    if (!config[p.key]) continue;

    const spawnTime = Math.round(now + p.inSeconds);

    if (p.inSeconds <= 30 && p.inSeconds >= 28) {
      const id = `${p.key}-30-${spawnTime}`;
      if (!triggered.has(id)) {
        triggered.add(id);
        speak(ph.soon(p.name));
      }
    }

    if (p.inSeconds >= 0 && p.inSeconds <= 1) {
      const id = `${p.key}-up-${spawnTime}`;
      if (!triggered.has(id)) {
        triggered.add(id);
        speak(ph.up(p.name));
      }
    }
  }
}
