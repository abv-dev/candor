import type { AllGameData, Team } from '../types/liveClient';

const VALID_ELEMENTS = new Set(['Infernal', 'Ocean', 'Cloud', 'Mountain', 'Hextech', 'Chemtech']);

export interface DragonState {
  orderKills: number;
  chaosKills: number;
  totalKills: number;
  soulTeam: Team | null;
  soulType: string | null;
  predictedSoulType: string | null;
}

export function computeDragonState(data: AllGameData): DragonState {
  const playerTeam = new Map<string, Team>();
  for (const p of data.allPlayers) playerTeam.set(p.summonerName, p.team);

  const kills = data.events.Events
    .filter((e) => e.EventName === 'DragonKill')
    .sort((a, b) => a.EventTime - b.EventTime);

  let orderKills = 0;
  let chaosKills = 0;
  let soulTeam: Team | null = null;
  let soulType: string | null = null;

  for (const e of kills) {
    const team = e.KillerName ? playerTeam.get(e.KillerName) : undefined;
    if (team === 'ORDER') orderKills++;
    else if (team === 'CHAOS') chaosKills++;

    if (!soulTeam && team && (team === 'ORDER' ? orderKills : chaosKills) >= 4) {
      soulTeam = team;
      soulType = e.DragonType ?? null;
    }
  }

  const totalKills = orderKills + chaosKills;

  // Après 2 drakes killed, le rift révèle l'élément de la soul via mapTerrain.
  let predictedSoulType: string | null = null;
  if (totalKills >= 2) {
    const terrain = data.gameData.mapTerrain;
    if (terrain && VALID_ELEMENTS.has(terrain)) {
      predictedSoulType = terrain;
    }
  }

  return { orderKills, chaosKills, totalKills, soulTeam, soulType, predictedSoulType };
}
