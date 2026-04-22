import type { AllGameData } from '../types/liveClient';
import { aggregateGame } from '../logic/playerStats';
import { computeObjectives } from '../logic/objectiveTimer';
import { computeAlerts } from '../logic/alertEngine';
import { recentEvents } from '../logic/eventHistory';
import { Scoreboard } from './Scoreboard';
import { PlayerGuide } from './PlayerGuide';
import { ObjectiveBar } from './ObjectiveBar';
import { LiveFeed } from './LiveFeed';
import { AlertList } from './AlertList';

interface Props {
  data: AllGameData;
}

export function Dashboard({ data }: Props) {
  const aggs = aggregateGame(data);
  const timers = computeObjectives(data);
  const alerts = computeAlerts(data);
  const events = recentEvents(data.events.Events, 12);

  return (
    <div className="dash">
      {alerts.length > 0 && (
        <div className="dash-alerts">
          <AlertList alerts={alerts} />
        </div>
      )}

      <ObjectiveBar timers={timers} />

      <Scoreboard aggs={aggs} data={data} activePlayerName={data.activePlayer.summonerName} />

      <PlayerGuide data={data} />

      <LiveFeed events={events} />
    </div>
  );
}
