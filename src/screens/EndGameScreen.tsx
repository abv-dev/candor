import type { AllGameData } from '../types/liveClient';
import { aggregateGame } from '../logic/playerStats';
import { computeDragonState } from '../logic/dragonSoul';
import { computeTurretState } from '../logic/turretState';
import { useT } from '../i18n';

interface Props {
  data: AllGameData;
  onBackHome: () => void;
}

function fmtTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function EndGameScreen({ data, onBackHome }: Props) {
  const t = useT();
  const aggs = aggregateGame(data);
  const orderAgg = aggs.myTeamId === 'ORDER' ? aggs.myTeam : aggs.enemyTeam;
  const chaosAgg = aggs.myTeamId === 'CHAOS' ? aggs.myTeam : aggs.enemyTeam;
  const dragons = computeDragonState(data);
  const turrets = computeTurretState(data);

  const diff = orderAgg.itemsValue - chaosAgg.itemsValue;
  const winnerGuess = Math.abs(diff) < 500 ? null : diff > 0 ? 'ORDER' : 'CHAOS';

  return (
    <div className="end-screen">
      <div className="end-header">
        <div className="end-title">{t('end.title')}</div>
        <div className="end-duration">{fmtTime(data.gameData.gameTime)}</div>
      </div>

      <div className="end-teams">
        <div className={`end-team end-team-order ${winnerGuess === 'ORDER' ? 'end-team-lead' : ''}`}>
          <div className="end-team-label">BLEU</div>
          <div className="end-team-kda">{orderAgg.kills}/{orderAgg.deaths}/{orderAgg.assists}</div>
          <div className="end-team-stats">
            <div><span>Items</span><b>{(orderAgg.itemsValue / 1000).toFixed(1)}k</b></div>
            <div><span>CS</span><b>{orderAgg.cs}</b></div>
            <div><span>🐉</span><b>{dragons.orderKills}/4</b></div>
            <div><span>🗼 perdues</span><b>{turrets.order.destroyed}/11</b></div>
          </div>
        </div>
        <div className="end-vs">
          <div className="end-vs-val">{diff === 0 ? '0' : `${diff > 0 ? '+' : ''}${Math.round(diff)}`}</div>
          <div className="end-vs-sub">items diff</div>
        </div>
        <div className={`end-team end-team-chaos ${winnerGuess === 'CHAOS' ? 'end-team-lead' : ''}`}>
          <div className="end-team-label">ROUGE</div>
          <div className="end-team-kda">{chaosAgg.kills}/{chaosAgg.deaths}/{chaosAgg.assists}</div>
          <div className="end-team-stats">
            <div><span>Items</span><b>{(chaosAgg.itemsValue / 1000).toFixed(1)}k</b></div>
            <div><span>CS</span><b>{chaosAgg.cs}</b></div>
            <div><span>🐉</span><b>{dragons.chaosKills}/4</b></div>
            <div><span>🗼 perdues</span><b>{turrets.chaos.destroyed}/11</b></div>
          </div>
        </div>
      </div>

      {dragons.soulTeam && (
        <div className="end-soul">
          <span>👑 {t('end.soul')}</span>
          <b>{dragons.soulType} · {dragons.soulTeam === 'ORDER' ? 'BLEU' : 'ROUGE'}</b>
        </div>
      )}

      <button className="end-back-btn" onClick={onBackHome}>
        {t('end.back')}
      </button>

      <div className="end-note">{t('end.note')}</div>
    </div>
  );
}
