import { describe, it, expect } from 'vitest';
import { aggregateTeam, aggregateGame, compareWithOpponent } from '../playerStats';
import { makeGameData, withItem } from './fixtures';

describe('aggregateTeam', () => {
  it('agrège K/D/A/CS de l\'équipe', () => {
    const data = makeGameData();
    const order = aggregateTeam(data.allPlayers, 'ORDER');
    expect(order.kills).toBe(3);
    expect(order.deaths).toBe(1);
    expect(order.assists).toBe(4);
    expect(order.cs).toBe(124);
    expect(order.players).toHaveLength(5);
  });

  it('niveau moyen', () => {
    const data = makeGameData();
    const order = aggregateTeam(data.allPlayers, 'ORDER');
    expect(order.avgLevel).toBeCloseTo((11 + 10 + 11 + 10 + 9) / 5);
  });

  it('items value = 0 sans items', () => {
    const data = makeGameData();
    const order = aggregateTeam(data.allPlayers, 'ORDER');
    expect(order.itemsValue).toBe(0);
  });
});

describe('aggregateGame', () => {
  it('identifie myTeam correctement', () => {
    const data = makeGameData();
    const aggs = aggregateGame(data);
    expect(aggs.myTeamId).toBe('ORDER');
    expect(aggs.enemyTeamId).toBe('CHAOS');
  });
});

describe('compareWithOpponent', () => {
  it('retourne null si un des deux est absent', () => {
    expect(compareWithOpponent(null, null)).toBeNull();
  });

  it('calcule les diffs CS / LVL correctement', () => {
    const data = makeGameData();
    const me = data.allPlayers.find((p) => p.summonerName === 'You')!;
    const opp = data.allPlayers.find((p) => p.summonerName === 'TopEnemy')!;
    const cmp = compareWithOpponent(me, opp);
    expect(cmp?.csDiff).toBe(124 - 98);
    expect(cmp?.levelDiff).toBe(11 - 9);
  });

  it('items value diff basé sur items seulement (pas de currentGold)', () => {
    let data = makeGameData();
    data = withItem(data, 'You', 3031, 3400, 0);
    data.activePlayer.currentGold = 9999;
    const me = data.allPlayers.find((p) => p.summonerName === 'You')!;
    const opp = data.allPlayers.find((p) => p.summonerName === 'TopEnemy')!;
    const cmp = compareWithOpponent(me, opp);
    expect(cmp?.itemsValueDiff).toBeLessThan(4000);
    expect(cmp?.itemsValueDiff).toBeGreaterThan(3000);
  });

  it('KDA formaté', () => {
    const data = makeGameData();
    const me = data.allPlayers.find((p) => p.summonerName === 'You')!;
    const opp = data.allPlayers.find((p) => p.summonerName === 'TopEnemy')!;
    const cmp = compareWithOpponent(me, opp);
    expect(cmp?.kdaMe).toBe('3/1/4');
    expect(cmp?.kdaOpp).toBe('1/3/0');
  });
});
