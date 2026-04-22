import type { AllGameData } from '../types/liveClient';
import { findDirectOpponent } from '../logic/directOpponent';
import { compareWithOpponent } from '../logic/playerStats';
import { countCompletedItems, findNextItemCandidates } from '../logic/itemProgress';
import { ChampionImage } from './ChampionImage';
import { ItemImage } from './ItemImage';
import itemsDbRaw from '../data/items.json';

interface ItemsDb { data: Record<string, { name: string }>; }
const db = itemsDbRaw as unknown as ItemsDb;

interface Props {
  data: AllGameData;
}

function pct(cur: number, max: number): number {
  return max > 0 ? Math.round((cur / max) * 100) : 0;
}

export function PlayerGuide({ data }: Props) {
  const matchup = findDirectOpponent(data);
  const vs = compareWithOpponent(matchup.me, matchup.opponent);
  const stats = data.activePlayer.championStats;
  const abilities = data.activePlayer.abilities;

  const nextItems = matchup.me
    ? findNextItemCandidates(matchup.me, data.activePlayer.currentGold)
    : [];

  const hpPct = pct(stats.currentHealth, stats.maxHealth);
  const manaPct = pct(stats.resourceValue, stats.resourceMax);

  return (
    <section className="guide">
      <div className="guide-title">
        <span className="guide-title-label">TON GUIDE</span>
        <span className="guide-title-sub">focus joueur</span>
      </div>

      <div className="guide-vs">
        {matchup.me && (
          <div className="gv-side gv-me">
            <ChampionImage name={matchup.me.championName} size={72} />
            <div className="gv-head">
              <div className="gv-name">{matchup.me.championName}</div>
              <div className="gv-meta">lvl {matchup.me.level} · {matchup.me.position}</div>
              <div className="gv-spells">
                <span>{matchup.me.summonerSpells.summonerSpellOne.displayName}</span>
                <span>{matchup.me.summonerSpells.summonerSpellTwo.displayName}</span>
              </div>
            </div>
            <div className="gv-kda">{matchup.me.scores.kills}/{matchup.me.scores.deaths}/{matchup.me.scores.assists}</div>
          </div>
        )}

        {vs && (
          <div className="gv-center">
            <div className="gv-diff">
              <span className="gv-diff-label">CS</span>
              <span className={`gv-diff-val ${vs.csDiff > 0 ? 'pos' : vs.csDiff < 0 ? 'neg' : ''}`}>
                {vs.csDiff > 0 ? '+' : ''}{vs.csDiff}
              </span>
            </div>
            <div className="gv-diff">
              <span className="gv-diff-label">LVL</span>
              <span className={`gv-diff-val ${vs.levelDiff > 0 ? 'pos' : vs.levelDiff < 0 ? 'neg' : ''}`}>
                {vs.levelDiff > 0 ? '+' : ''}{vs.levelDiff}
              </span>
            </div>
            <div className="gv-diff">
              <span className="gv-diff-label">ITEMS</span>
              <span className={`gv-diff-val ${vs.itemsValueDiff > 0 ? 'pos' : vs.itemsValueDiff < 0 ? 'neg' : ''}`}>
                {vs.itemsValueDiff > 0 ? '+' : ''}{(vs.itemsValueDiff / 1000).toFixed(1)}k
              </span>
            </div>
          </div>
        )}

        {matchup.opponent && (
          <div className="gv-side gv-opp">
            <ChampionImage name={matchup.opponent.championName} size={72} />
            <div className="gv-head">
              <div className="gv-name">{matchup.opponent.championName}</div>
              <div className="gv-meta">lvl {matchup.opponent.level} · {matchup.opponent.position}</div>
              <div className="gv-spells">
                <span>{matchup.opponent.summonerSpells.summonerSpellOne.displayName}</span>
                <span>{matchup.opponent.summonerSpells.summonerSpellTwo.displayName}</span>
              </div>
            </div>
            <div className="gv-kda">{matchup.opponent.scores.kills}/{matchup.opponent.scores.deaths}/{matchup.opponent.scores.assists}</div>
          </div>
        )}
      </div>

      <div className="guide-row">
        <div className="guide-block">
          <div className="gb-title">TA SANTÉ</div>
          <div className="gb-bar">
            <div className="gb-bar-fill gb-bar-hp" style={{ width: `${hpPct}%` }} />
            <span className="gb-bar-txt">{stats.currentHealth} / {stats.maxHealth}  ·  {hpPct}%</span>
          </div>
          {stats.resourceMax > 0 && (
            <div className="gb-bar">
              <div className="gb-bar-fill gb-bar-mana" style={{ width: `${manaPct}%` }} />
              <span className="gb-bar-txt">{stats.resourceValue} / {stats.resourceMax}  ·  {manaPct}%</span>
            </div>
          )}
          <div className="gb-gold">💰 {data.activePlayer.currentGold}g en poche</div>
        </div>

        <div className="guide-block">
          <div className="gb-title">TES STATS</div>
          <div className="gb-stats">
            <div><span>AD</span><b>{Math.round(stats.attackDamage)}</b></div>
            <div><span>AP</span><b>{Math.round(stats.abilityPower)}</b></div>
            <div><span>Armor</span><b>{Math.round(stats.armor)}</b></div>
            <div><span>MR</span><b>{Math.round(stats.magicResist)}</b></div>
            <div><span>AS</span><b>{stats.attackSpeed.toFixed(2)}</b></div>
            <div><span>MS</span><b>{Math.round(stats.moveSpeed)}</b></div>
          </div>
        </div>

        <div className="guide-block">
          <div className="gb-title">TES SPELLS</div>
          <div className="gb-abilities">
            {(['Q', 'W', 'E', 'R'] as const).map((k) => (
              <div key={k} className="gb-ab">
                <div className="gb-ab-key">{k}</div>
                <div className="gb-ab-lvl">{abilities[k]?.abilityLevel ?? 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="guide-row">
        <div className="guide-block guide-items">
          <div className="gb-title">INVENTAIRE ({matchup.me ? countCompletedItems(matchup.me) : 0}/6 complétés)</div>
          <div className="gb-item-grid">
            {Array.from({ length: 6 }).map((_, i) => {
              const item = matchup.me?.items.find((it) => it.slot === i);
              const entry = item ? db.data[String(item.itemID)] : null;
              return (
                <div key={i} className="gb-item">
                  {item ? (
                    <>
                      <ItemImage itemId={item.itemID} size={40} />
                      <div className="gb-item-name">{entry?.name ?? `#${item.itemID}`}</div>
                    </>
                  ) : (
                    <div className="item-img item-img-empty" style={{ width: 40, height: 40 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="guide-block guide-next">
          <div className="gb-title">NEXT ITEM PROBABLE</div>
          {nextItems.length === 0 ? (
            <div className="gb-empty">Aucun composant à l'upgrade</div>
          ) : (
            <ul className="next-list">
              {nextItems.map((it) => (
                <li key={it.id} className="next-item">
                  <ItemImage itemId={Number(it.id)} size={28} />
                  <div className="next-info">
                    <div className="next-name">{it.name}</div>
                    <div className="next-cost">
                      {it.goldStillNeeded === 0 ? '✓ Achat possible' : `${it.goldStillNeeded}g manquant`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
