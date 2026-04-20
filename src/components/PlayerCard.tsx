import type { AllPlayer } from '../types/liveClient';
import { ChampionImage } from './ChampionImage';
import { ItemImage } from './ItemImage';
import { playerItemsValue } from '../logic/goldCalc';
import { countCompletedItems } from '../logic/itemProgress';

interface Props {
  player: AllPlayer;
  opponent?: AllPlayer | null;
  highlight?: boolean;
  reverse?: boolean;
}

function shortPosition(pos: string): string {
  switch (pos) {
    case 'TOP': return 'TOP';
    case 'JUNGLE': return 'JG';
    case 'MIDDLE': return 'MID';
    case 'BOTTOM': return 'ADC';
    case 'UTILITY': return 'SUP';
    default: return '—';
  }
}

export function PlayerCard({ player, opponent, highlight, reverse }: Props) {
  const kda = `${player.scores.kills}/${player.scores.deaths}/${player.scores.assists}`;
  const itemsValue = playerItemsValue(player);
  const completed = countCompletedItems(player);
  const itemSlots = [...player.items].sort((a, b) => a.slot - b.slot);

  const laneDiff = opponent ? itemsValue - playerItemsValue(opponent) : 0;
  const laneLeading = opponent && Math.abs(laneDiff) >= 100 ? (laneDiff > 0 ? 'ahead' : 'behind') : null;

  return (
    <div className={`player-card ${reverse ? 'reverse' : ''} ${highlight ? 'highlight' : ''} team-${player.team.toLowerCase()}`}>
      <div className="pc-left">
        <ChampionImage name={player.championName} size={42} />
      </div>
      <div className="pc-body">
        <div className="pc-head">
          <span className="pc-name">{player.championName}</span>
          <span className="pc-pos">{shortPosition(player.position)}</span>
        </div>
        <div className="pc-stats">
          <span className="pc-kda">{kda}</span>
          <span className="pc-sep">·</span>
          <span className="pc-cs">{player.scores.creepScore} CS</span>
          <span className="pc-sep">·</span>
          <span className="pc-lvl">lvl {player.level}</span>
        </div>
        <div className="pc-items-row">
          {Array.from({ length: 6 }).map((_, i) => {
            const item = itemSlots.find((it) => it.slot === i);
            return (
              <div key={i} className="pc-item-slot">
                {item ? <ItemImage itemId={item.itemID} size={22} /> : <div className="item-img item-img-empty" />}
              </div>
            );
          })}
        </div>
      </div>
      <div className="pc-right">
        <div className="pc-worth">
          {laneLeading && (
            <span className={`pc-lane-arrow ${laneLeading}`} title={`${laneDiff > 0 ? '+' : ''}${Math.round(laneDiff)} gold vs lane`}>
              {laneLeading === 'ahead' ? '▲' : '▼'}
            </span>
          )}
          {(itemsValue / 1000).toFixed(1)}k
        </div>
        <div className="pc-items-count">{completed}/6</div>
      </div>
    </div>
  );
}
