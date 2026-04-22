import { describe, it, expect } from 'vitest';
import { computeDragonState } from '../dragonSoul';
import { makeGameData, withEvents } from './fixtures';

describe('computeDragonState', () => {
  it('no kills → no soul', () => {
    const state = computeDragonState(makeGameData());
    expect(state.orderKills).toBe(0);
    expect(state.chaosKills).toBe(0);
    expect(state.soulTeam).toBeNull();
  });

  it('counts kills per team based on KillerName → team mapping', () => {
    const data = withEvents(makeGameData(), [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300, KillerName: 'JgAlly', DragonType: 'Infernal' },
      { EventID: 2, EventName: 'DragonKill', EventTime: 600, KillerName: 'JgEnemy', DragonType: 'Ocean' },
      { EventID: 3, EventName: 'DragonKill', EventTime: 900, KillerName: 'JgAlly', DragonType: 'Mountain' },
    ]);
    const state = computeDragonState(data);
    expect(state.orderKills).toBe(2);
    expect(state.chaosKills).toBe(1);
    expect(state.soulTeam).toBeNull();
  });

  it('4 kills → soul; type is the 4th drake', () => {
    const data = withEvents(makeGameData(), [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300,  KillerName: 'JgAlly', DragonType: 'Infernal' },
      { EventID: 2, EventName: 'DragonKill', EventTime: 700,  KillerName: 'JgAlly', DragonType: 'Ocean' },
      { EventID: 3, EventName: 'DragonKill', EventTime: 1100, KillerName: 'JgAlly', DragonType: 'Cloud' },
      { EventID: 4, EventName: 'DragonKill', EventTime: 1500, KillerName: 'JgAlly', DragonType: 'Mountain' },
    ]);
    const state = computeDragonState(data);
    expect(state.orderKills).toBe(4);
    expect(state.soulTeam).toBe('ORDER');
    expect(state.soulType).toBe('Mountain');
  });

  it('kills by unknown KillerName (minion/exec) are ignored', () => {
    const data = withEvents(makeGameData(), [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300, KillerName: 'Minion_T100_L1', DragonType: 'Infernal' },
    ]);
    const state = computeDragonState(data);
    expect(state.orderKills).toBe(0);
    expect(state.chaosKills).toBe(0);
  });

  it('predicts soul type from mapTerrain once totalKills >= 2', () => {
    let data = withEvents(makeGameData(), [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300, KillerName: 'JgAlly', DragonType: 'Infernal' },
      { EventID: 2, EventName: 'DragonKill', EventTime: 700, KillerName: 'JgEnemy', DragonType: 'Ocean' },
    ]);
    data = { ...data, gameData: { ...data.gameData, mapTerrain: 'Hextech' } };
    const state = computeDragonState(data);
    expect(state.totalKills).toBe(2);
    expect(state.predictedSoulType).toBe('Hextech');
  });

  it('does not predict while mapTerrain is Default', () => {
    const data = withEvents(makeGameData(), [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300, KillerName: 'JgAlly', DragonType: 'Infernal' },
      { EventID: 2, EventName: 'DragonKill', EventTime: 700, KillerName: 'JgEnemy', DragonType: 'Ocean' },
    ]);
    const state = computeDragonState(data);
    expect(state.predictedSoulType).toBeNull();
  });

  it('does not predict before 2 kills', () => {
    let data = withEvents(makeGameData(), [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300, KillerName: 'JgAlly', DragonType: 'Infernal' },
    ]);
    data = { ...data, gameData: { ...data.gameData, mapTerrain: 'Hextech' } };
    const state = computeDragonState(data);
    expect(state.predictedSoulType).toBeNull();
  });
});
