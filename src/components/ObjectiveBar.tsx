import type { ObjectiveTimers } from '../logic/objectiveTimer';
import { formatTime } from '../logic/objectiveTimer';

interface Props {
  timers: ObjectiveTimers;
}

interface Item {
  label: string;
  time: number | null;
  emoji: string;
  modifier?: string;
}

export function ObjectiveBar({ timers }: Props) {
  const items: Item[] = [
    { label: 'GRUBS',  time: timers.nextGrubsIn,  emoji: '🐛' },
    { label: 'DRAKE',  time: timers.nextDragonIn, emoji: '🐉' },
    { label: 'HERALD', time: timers.nextHeraldIn, emoji: '👁' },
    { label: 'BARON',  time: timers.nextBaronIn,  emoji: '🪱' },
  ];
  if (timers.elderIn !== null) {
    items.push({ label: 'ELDER', time: timers.elderIn, emoji: '🐲', modifier: 'elder' });
  }
  if (timers.baronBuffRemaining !== null) {
    items.push({
      label: timers.baronBuffTeam === 'ORDER' ? 'BARON 🟦' : timers.baronBuffTeam === 'CHAOS' ? 'BARON 🟥' : 'BARON ⏳',
      time: timers.baronBuffRemaining,
      emoji: '⏳',
      modifier: 'baron-buff',
    });
  }

  return (
    <div className="obj-bar">
      {items.map((it) => {
        const unavail = it.time === null;
        const soon = !unavail && it.time! < 60;
        const up = !unavail && it.time! <= 0;
        const classes = ['obj', soon ? 'soon' : '', up ? 'up' : '', unavail ? 'unavail' : '', it.modifier ? `obj-${it.modifier}` : ''].filter(Boolean).join(' ');
        return (
          <div key={it.label} className={classes}>
            <span className="obj-emoji">{it.emoji}</span>
            <span className="obj-label">{it.label}</span>
            <span className="obj-time">
              {unavail ? '—' : it.modifier === 'baron-buff' ? formatTime(it.time!) : up ? 'UP' : formatTime(it.time!)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
