import type { AllGameData, GameEvent } from '../types/liveClient';

const DRAGON_RESPAWN = 5 * 60;
const BARON_RESPAWN = 6 * 60;
const HERALD_SPAWN = 14 * 60;
const BARON_FIRST_SPAWN = 20 * 60;
const DRAGON_FIRST_SPAWN = 5 * 60;

export interface ObjectiveTimers {
  nextDragonIn: number;
  nextBaronIn: number;
  nextHeraldIn: number | null;
  primary: { name: string; inSeconds: number };
}

function lastEventTime(events: GameEvent[], name: string): number | null {
  const matching = events.filter((e) => e.EventName === name);
  if (matching.length === 0) return null;
  return Math.max(...matching.map((e) => e.EventTime));
}

export function computeObjectives(data: AllGameData): ObjectiveTimers {
  const events = data.events.Events;
  const now = data.gameData.gameTime;

  const lastDragon = lastEventTime(events, 'DragonKill');
  const nextDragonIn = lastDragon === null
    ? Math.max(0, DRAGON_FIRST_SPAWN - now)
    : Math.max(0, lastDragon + DRAGON_RESPAWN - now);

  const lastBaron = lastEventTime(events, 'BaronKill');
  const nextBaronIn = lastBaron === null
    ? Math.max(0, BARON_FIRST_SPAWN - now)
    : Math.max(0, lastBaron + BARON_RESPAWN - now);

  const heraldKilled = lastEventTime(events, 'HeraldKill') !== null;
  const nextHeraldIn = heraldKilled || now >= BARON_FIRST_SPAWN
    ? null
    : Math.max(0, HERALD_SPAWN - now);

  const candidates: Array<{ name: string; inSeconds: number }> = [
    { name: 'Drake', inSeconds: nextDragonIn },
    { name: 'Baron', inSeconds: nextBaronIn },
  ];
  if (nextHeraldIn !== null) candidates.push({ name: 'Herald', inSeconds: nextHeraldIn });

  const primary = candidates.reduce((a, b) => (a.inSeconds <= b.inSeconds ? a : b));

  return { nextDragonIn, nextBaronIn, nextHeraldIn, primary };
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return 'NOW';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
