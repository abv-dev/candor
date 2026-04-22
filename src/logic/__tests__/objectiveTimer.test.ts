import { describe, it, expect } from 'vitest';
import { computeObjectives, formatTime } from '../objectiveTimer';
import { makeGameData, withEvents } from './fixtures';

describe('formatTime', () => {
  it('formate minutes:secondes', () => {
    expect(formatTime(0)).toBe('NOW');
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(600)).toBe('10:00');
  });

  it('retourne NOW pour <= 0', () => {
    expect(formatTime(0)).toBe('NOW');
    expect(formatTime(-5)).toBe('NOW');
  });
});

describe('computeObjectives', () => {
  it('drake first spawn à 5:00', () => {
    const data = { ...makeGameData(), gameData: { ...makeGameData().gameData, gameTime: 60 } };
    const obj = computeObjectives(data);
    expect(obj.nextDragonIn).toBe(240); // 300 - 60
  });

  it('drake respawn à +5min après kill', () => {
    let data = makeGameData();
    data = withEvents(data, [{ EventID: 1, EventName: 'DragonKill', EventTime: 400, KillerName: 'JgAlly' }]);
    data = { ...data, gameData: { ...data.gameData, gameTime: 500 } };
    const obj = computeObjectives(data);
    expect(obj.nextDragonIn).toBe(200); // 400 + 300 - 500
  });

  it('baron dispo à 20min puis respawn 6min', () => {
    const data = { ...makeGameData(), gameData: { ...makeGameData().gameData, gameTime: 1000 } };
    const obj = computeObjectives(data);
    expect(obj.nextBaronIn).toBe(200); // 1200 - 1000
  });

  it('herald désactivé une fois baron spawné', () => {
    const data = { ...makeGameData(), gameData: { ...makeGameData().gameData, gameTime: 1250 } };
    const obj = computeObjectives(data);
    expect(obj.nextHeraldIn).toBeNull();
  });

  it('primary = objectif le plus proche', () => {
    const data = { ...makeGameData(), gameData: { ...makeGameData().gameData, gameTime: 100 } };
    const obj = computeObjectives(data);
    expect(obj.primary.name).toBe('Drake');
  });

  it('baron buff actif pendant 3 min après kill', () => {
    let data = makeGameData();
    data = withEvents(data, [{ EventID: 1, EventName: 'BaronKill', EventTime: 1300, KillerName: 'JgAlly' }]);
    data = { ...data, gameData: { ...data.gameData, gameTime: 1400 } };
    const obj = computeObjectives(data);
    expect(obj.baronBuffRemaining).toBe(80); // 1300 + 180 - 1400
    expect(obj.baronBuffTeam).toBe('ORDER');
  });

  it('baron buff null une fois expiré', () => {
    let data = makeGameData();
    data = withEvents(data, [{ EventID: 1, EventName: 'BaronKill', EventTime: 1300, KillerName: 'JgAlly' }]);
    data = { ...data, gameData: { ...data.gameData, gameTime: 1600 } };
    const obj = computeObjectives(data);
    expect(obj.baronBuffRemaining).toBeNull();
  });

  it('elder timer activé après soul claim', () => {
    let data = makeGameData();
    data = withEvents(data, [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300,  KillerName: 'JgAlly', DragonType: 'Infernal' },
      { EventID: 2, EventName: 'DragonKill', EventTime: 700,  KillerName: 'JgAlly', DragonType: 'Ocean' },
      { EventID: 3, EventName: 'DragonKill', EventTime: 1100, KillerName: 'JgAlly', DragonType: 'Cloud' },
      { EventID: 4, EventName: 'DragonKill', EventTime: 1500, KillerName: 'JgAlly', DragonType: 'Mountain' },
    ]);
    data = { ...data, gameData: { ...data.gameData, gameTime: 1600 } };
    const obj = computeObjectives(data);
    // soul à 1500, Elder à 1500 + 360 = 1860, reste 260
    expect(obj.elderAt).toBe(1860);
    expect(obj.elderIn).toBe(260);
  });

  it('elder timer null tant que soul pas claim', () => {
    let data = makeGameData();
    data = withEvents(data, [
      { EventID: 1, EventName: 'DragonKill', EventTime: 300, KillerName: 'JgAlly', DragonType: 'Infernal' },
    ]);
    const obj = computeObjectives(data);
    expect(obj.elderIn).toBeNull();
  });
});
