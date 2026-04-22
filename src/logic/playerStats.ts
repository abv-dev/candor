import type { AllGameData, AllPlayer, Team } from '../types/liveClient';
import { playerItemsValue } from './goldCalc';
import { countCompletedItems, teamItemsCompleted } from './itemProgress';

export interface TeamAggregate {
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  itemsValue: number;
  itemsCompleted: number;
  avgLevel: number;
  goldPerMin: number;
  players: AllPlayer[];
}

export function aggregateTeam(players: AllPlayer[], team: Team, gameTime: number = 0): TeamAggregate {
  const ps = players.filter((p) => p.team === team);
  const itemsValue = ps.reduce((s, p) => s + playerItemsValue(p), 0);
  const minutes = gameTime > 0 ? gameTime / 60 : 0;
  return {
    kills:       ps.reduce((s, p) => s + p.scores.kills, 0),
    deaths:      ps.reduce((s, p) => s + p.scores.deaths, 0),
    assists:     ps.reduce((s, p) => s + p.scores.assists, 0),
    cs:          ps.reduce((s, p) => s + p.scores.creepScore, 0),
    itemsValue,
    itemsCompleted: teamItemsCompleted(ps),
    avgLevel:    ps.length ? ps.reduce((s, p) => s + p.level, 0) / ps.length : 0,
    goldPerMin:  minutes > 0 ? itemsValue / minutes : 0,
    players:     ps,
  };
}

export interface GameAggregates {
  myTeam: TeamAggregate;
  enemyTeam: TeamAggregate;
  myTeamId: Team;
  enemyTeamId: Team;
}

export function aggregateGame(data: AllGameData): GameAggregates {
  const me = data.allPlayers.find((p) => p.summonerName === data.activePlayer.summonerName);
  const myTeamId: Team = me?.team ?? 'ORDER';
  const enemyTeamId: Team = myTeamId === 'ORDER' ? 'CHAOS' : 'ORDER';
  const gameTime = data.gameData.gameTime;

  return {
    myTeam: aggregateTeam(data.allPlayers, myTeamId, gameTime),
    enemyTeam: aggregateTeam(data.allPlayers, enemyTeamId, gameTime),
    myTeamId,
    enemyTeamId,
  };
}

export interface PlayerVsPlayer {
  csDiff: number;
  levelDiff: number;
  itemsDiff: number;
  itemsValueDiff: number;
  kdaMe: string;
  kdaOpp: string;
}

export function compareWithOpponent(
  me: AllPlayer | null,
  opponent: AllPlayer | null,
): PlayerVsPlayer | null {
  if (!me || !opponent) return null;
  return {
    csDiff: me.scores.creepScore - opponent.scores.creepScore,
    levelDiff: me.level - opponent.level,
    itemsDiff: countCompletedItems(me) - countCompletedItems(opponent),
    itemsValueDiff: playerItemsValue(me) - playerItemsValue(opponent),
    kdaMe: `${me.scores.kills}/${me.scores.deaths}/${me.scores.assists}`,
    kdaOpp: `${opponent.scores.kills}/${opponent.scores.deaths}/${opponent.scores.assists}`,
  };
}
