import type { AllGameData, GameEvent, Team } from '../types/liveClient';

const TOTAL_TURRETS_PER_TEAM = 11;

export interface TeamTurretState {
  destroyed: number;
  remaining: number;
}

export interface TurretState {
  order: TeamTurretState;
  chaos: TeamTurretState;
}

function teamFromTurretName(name: string | undefined): Team | null {
  if (!name) return null;
  if (name.includes('_T1_')) return 'ORDER';
  if (name.includes('_T2_')) return 'CHAOS';
  return null;
}

export function computeTurretState(data: AllGameData): TurretState {
  let orderDestroyed = 0;
  let chaosDestroyed = 0;

  for (const e of data.events.Events as GameEvent[]) {
    if (e.EventName !== 'TurretKilled') continue;
    const team = teamFromTurretName(e.TurretKilled);
    if (team === 'ORDER') orderDestroyed++;
    else if (team === 'CHAOS') chaosDestroyed++;
  }

  return {
    order: {
      destroyed: orderDestroyed,
      remaining: Math.max(0, TOTAL_TURRETS_PER_TEAM - orderDestroyed),
    },
    chaos: {
      destroyed: chaosDestroyed,
      remaining: Math.max(0, TOTAL_TURRETS_PER_TEAM - chaosDestroyed),
    },
  };
}
