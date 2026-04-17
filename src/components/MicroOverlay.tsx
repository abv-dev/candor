import type { AllGameData } from '../types/liveClient';
import { teamItemsValueCompare } from '../logic/goldCalc';
import { computeObjectives, formatTime } from '../logic/objectiveTimer';
import { computeAlerts } from '../logic/alertEngine';

interface Props {
  data: AllGameData;
}

function formatGameTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MicroOverlay({ data }: Props) {
  const gold = teamItemsValueCompare(data);
  const obj = computeObjectives(data);
  const alerts = computeAlerts(data).slice(0, 2);

  const stats = data.activePlayer.championStats;
  const hpPct = stats.maxHealth > 0 ? Math.round((stats.currentHealth / stats.maxHealth) * 100) : 0;

  const primaryObj = obj.primary;
  const urgent = primaryObj.inSeconds > 0 && primaryObj.inSeconds < 60;

  return (
    <div className="micro">
      <div className="micro-top">
        <span className="micro-time">{formatGameTime(data.gameData.gameTime)}</span>
        <span className={`micro-hp ${hpPct < 35 ? 'low' : hpPct < 60 ? 'med' : 'ok'}`}>♥ {hpPct}%</span>
        <span className="micro-gold">💰 {data.activePlayer.currentGold}</span>
      </div>

      <div className={`micro-big-gold ${gold.diff > 0 ? 'pos' : gold.diff < 0 ? 'neg' : ''}`}>
        <span className="micro-big-label">ITEMS</span>
        <span className="micro-big-val">
          {gold.diff > 0 ? '+' : ''}{Math.round(gold.diff)}
        </span>
      </div>

      <div className={`micro-obj ${urgent ? 'urgent' : ''}`}>
        <span className="micro-obj-name">{primaryObj.name}</span>
        <span className="micro-obj-time">
          {primaryObj.inSeconds <= 0 ? 'UP' : formatTime(primaryObj.inSeconds)}
        </span>
      </div>

      {alerts.length > 0 && (
        <div className="micro-alerts">
          {alerts.map((a) => (
            <div key={a.id} className={`micro-alert micro-alert-${a.level}`}>
              {a.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
