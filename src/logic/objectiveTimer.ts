import type { AllGameData, GameEvent, Team } from '../types/liveClient';

const DRAGON_RESPAWN = 5 * 60;
const BARON_RESPAWN = 6 * 60;
const HERALD_SPAWN = 14 * 60;
const BARON_FIRST_SPAWN = 20 * 60;
const DRAGON_FIRST_SPAWN = 5 * 60;
const GRUBS_FIRST_SPAWN = 6 * 60;
const GRUBS_DISAPPEAR_AT = 14 * 60;
const BARON_BUFF_DURATION = 3 * 60;
const ELDER_RESPAWN = 6 * 60;

export interface ObjectiveTimers {
  nextDragonIn: number;
  nextDragonAt: number;
  nextBaronIn: number;
  nextBaronAt: number;
  nextHeraldIn: number | null;
  nextHeraldAt: number | null;
  nextGrubsIn: number | null;
  nextGrubsAt: number | null;
  // Baron buff : 3 min après kill
  baronBuffRemaining: number | null;
  baronBuffTeam: Team | null;
  // Elder dragon : 6 min après soul claim (ou kill précédent Elder)
  elderIn: number | null;
  elderAt: number | null;
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

  // Drake respawn = dernier drake (hors Elder) + 5 min. Un Elder ne redémarre pas le cycle drake.
  const lastNormalDragon = events
    .filter((e) => e.EventName === 'DragonKill' && e.DragonType !== 'Elder')
    .map((e) => e.EventTime)
    .reduce<number | null>((acc, t) => (acc === null || t > acc ? t : acc), null);
  const nextDragonAt = lastNormalDragon === null ? DRAGON_FIRST_SPAWN : lastNormalDragon + DRAGON_RESPAWN;
  const nextDragonIn = Math.max(0, nextDragonAt - now);

  const lastBaron = lastEventTime(events, 'BaronKill');
  const nextBaronAt = lastBaron === null ? BARON_FIRST_SPAWN : lastBaron + BARON_RESPAWN;
  const nextBaronIn = Math.max(0, nextBaronAt - now);

  // Baron buff : 3 min après le dernier BaronKill, si encore actif
  let baronBuffRemaining: number | null = null;
  let baronBuffTeam: Team | null = null;
  if (lastBaron !== null) {
    const buffEnd = lastBaron + BARON_BUFF_DURATION;
    if (now < buffEnd) {
      baronBuffRemaining = Math.max(0, buffEnd - now);
      const killEvent = events.find((e) => e.EventName === 'BaronKill' && e.EventTime === lastBaron);
      const killer = killEvent?.KillerName;
      const killerPlayer = killer ? data.allPlayers.find((p) => p.summonerName === killer) : undefined;
      baronBuffTeam = killerPlayer?.team ?? null;
    }
  }

  // Elder : ne spawn qu'après qu'une team ait soul. Ensuite respawn 6 min après chaque kill Elder.
  let elderAt: number | null = null;
  let elderIn: number | null = null;
  const dragonKills = events
    .filter((e) => e.EventName === 'DragonKill')
    .sort((a, b) => a.EventTime - b.EventTime);
  const playerTeam = new Map<string, Team>();
  for (const p of data.allPlayers) playerTeam.set(p.summonerName, p.team);
  let orderNormalKills = 0;
  let chaosNormalKills = 0;
  let soulSecuredAt: number | null = null;
  for (const e of dragonKills) {
    if (e.DragonType === 'Elder') continue;
    const team = e.KillerName ? playerTeam.get(e.KillerName) : undefined;
    if (team === 'ORDER') orderNormalKills++;
    else if (team === 'CHAOS') chaosNormalKills++;
    if (soulSecuredAt === null && ((team === 'ORDER' && orderNormalKills >= 4) || (team === 'CHAOS' && chaosNormalKills >= 4))) {
      soulSecuredAt = e.EventTime;
    }
  }
  if (soulSecuredAt !== null) {
    const lastElder = dragonKills
      .filter((e) => e.DragonType === 'Elder')
      .map((e) => e.EventTime)
      .reduce<number | null>((acc, t) => (acc === null || t > acc ? t : acc), null);
    elderAt = lastElder === null ? soulSecuredAt + ELDER_RESPAWN : lastElder + ELDER_RESPAWN;
    elderIn = Math.max(0, elderAt - now);
  }

  const heraldKilled = lastEventTime(events, 'HeraldKill') !== null;
  const heraldGone = heraldKilled || now >= BARON_FIRST_SPAWN;
  const nextHeraldAt = heraldGone ? null : HERALD_SPAWN;
  const nextHeraldIn = heraldGone ? null : Math.max(0, HERALD_SPAWN - now);

  // Grubs : spawn à 6:00, disparaissent à 14:00 (remplacés par Herald)
  const grubsGone = now >= GRUBS_DISAPPEAR_AT;
  const nextGrubsAt = grubsGone ? null : GRUBS_FIRST_SPAWN;
  const nextGrubsIn = grubsGone ? null : Math.max(0, GRUBS_FIRST_SPAWN - now);

  const candidates: Array<{ name: string; inSeconds: number }> = [
    { name: 'Drake', inSeconds: nextDragonIn },
    { name: 'Baron', inSeconds: nextBaronIn },
  ];
  if (nextHeraldIn !== null) candidates.push({ name: 'Herald', inSeconds: nextHeraldIn });
  if (nextGrubsIn !== null) candidates.push({ name: 'Grubs', inSeconds: nextGrubsIn });

  const primary = candidates.reduce((a, b) => (a.inSeconds <= b.inSeconds ? a : b));

  return {
    nextDragonIn, nextDragonAt,
    nextBaronIn, nextBaronAt,
    nextHeraldIn, nextHeraldAt,
    nextGrubsIn, nextGrubsAt,
    baronBuffRemaining, baronBuffTeam,
    elderIn, elderAt,
    primary,
  };
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return 'NOW';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
