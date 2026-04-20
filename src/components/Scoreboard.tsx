import type { GameAggregates } from '../logic/playerStats';
import { TeamPanel } from './TeamPanel';

interface Props {
  aggs: GameAggregates;
  activePlayerName: string;
}

export function Scoreboard({ aggs, activePlayerName }: Props) {
  const orderAgg = aggs.myTeamId === 'ORDER' ? aggs.myTeam : aggs.enemyTeam;
  const chaosAgg = aggs.myTeamId === 'CHAOS' ? aggs.myTeam : aggs.enemyTeam;

  const gapDiff = orderAgg.itemsValue - chaosAgg.itemsValue;
  const leadingTeam: 'ORDER' | 'CHAOS' | null =
    gapDiff === 0 ? null : gapDiff > 0 ? 'ORDER' : 'CHAOS';
  const gapAbs = Math.abs(gapDiff);

  return (
    <div className="scoreboard">
      <div className="sb-banner">
        <div className={`sb-side sb-order ${leadingTeam === 'ORDER' ? 'leading' : ''}`}>
          <div className="sb-team-label">BLEU</div>
          <div className="sb-kda">{orderAgg.kills}</div>
        </div>
        <div className="sb-center">
          <div className="sb-gap-label">
            {leadingTeam === 'ORDER' && <span className="lead-arrow order">◀</span>}
            <span>{leadingTeam === null ? 'ÉGAL' : leadingTeam === 'ORDER' ? 'BLEU' : 'ROUGE'}</span>
            {leadingTeam === 'CHAOS' && <span className="lead-arrow chaos">▶</span>}
          </div>
          <div className={`sb-gap-value ${leadingTeam === 'ORDER' ? 'pos-order' : leadingTeam === 'CHAOS' ? 'pos-chaos' : ''}`}>
            {leadingTeam === null ? '0' : '+' + Math.round(gapAbs)}
          </div>
          <div className="sb-gap-sub">items value</div>
        </div>
        <div className={`sb-side sb-chaos ${leadingTeam === 'CHAOS' ? 'leading' : ''}`}>
          <div className="sb-team-label">ROUGE</div>
          <div className="sb-kda">{chaosAgg.kills}</div>
        </div>
      </div>
      <div className="sb-teams">
        <TeamPanel teamId="ORDER" agg={orderAgg} opposingAgg={chaosAgg} activePlayerName={activePlayerName} />
        <TeamPanel teamId="CHAOS" agg={chaosAgg} opposingAgg={orderAgg} activePlayerName={activePlayerName} reverse />
      </div>
    </div>
  );
}
