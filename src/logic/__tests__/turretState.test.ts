import { describe, it, expect } from 'vitest';
import { computeTurretState } from '../turretState';
import { makeGameData, withEvents } from './fixtures';

describe('computeTurretState', () => {
  it('aucune tour détruite au départ', () => {
    const s = computeTurretState(makeGameData());
    expect(s.order.destroyed).toBe(0);
    expect(s.chaos.destroyed).toBe(0);
    expect(s.order.remaining).toBe(11);
    expect(s.chaos.remaining).toBe(11);
  });

  it('compte les TurretKilled par team via _T1_ / _T2_', () => {
    const data = withEvents(makeGameData(), [
      { EventID: 1, EventName: 'TurretKilled', EventTime: 400, TurretKilled: 'Turret_T1_L_03_A' },
      { EventID: 2, EventName: 'TurretKilled', EventTime: 500, TurretKilled: 'Turret_T2_R_02_A' },
      { EventID: 3, EventName: 'TurretKilled', EventTime: 600, TurretKilled: 'Turret_T2_C_01_A' },
    ]);
    const s = computeTurretState(data);
    expect(s.order.destroyed).toBe(1);
    expect(s.chaos.destroyed).toBe(2);
    expect(s.order.remaining).toBe(10);
    expect(s.chaos.remaining).toBe(9);
  });
});
