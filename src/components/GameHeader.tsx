import type { ConnectionState } from '../services/liveClient';
import logo from '../assets/logo.png';
import { useT } from '../i18n';

interface Props {
  gameTime: number;
  state: ConnectionState;
  mockMode: boolean;
  onToggleMock: () => void;
  view: 'dashboard' | 'micro';
  onToggleView: () => void;
  onOpenSettings?: () => void;
  settingsActive?: boolean;
}

function fmt(seconds: number): string {
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GameHeader({
  gameTime,
  state,
  mockMode,
  onToggleMock,
  view,
  onToggleView,
  onOpenSettings,
  settingsActive,
}: Props) {
  const t = useT();

  return (
    <header className="gh">
      <div className="gh-left">
        <img src={logo} alt="Candor" className="gh-logo" />
        <div className="gh-brand">
          <div className="gh-title">CAN<span className="gh-accent">DOR</span></div>
          <div className="gh-tagline">{t('home.subtitle')}</div>
        </div>
      </div>
      <div className="gh-center">
        <span className={`gh-live gh-live-${state}`}>
          <span className="gh-live-dot" />
          <span>{state === 'connected' ? 'LIVE' : state === 'mock' ? 'MOCK' : 'OFF'}</span>
        </span>
        <span className="gh-time">{fmt(gameTime)}</span>
      </div>
      <div className="gh-right">
        <button className={`gh-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={onToggleView}>
          {view === 'dashboard' ? '→ ' + t('nav.micro').toUpperCase() : '→ ' + t('nav.dashboard').toUpperCase()}
        </button>
        <button className="gh-btn" onClick={onToggleMock}>
          {mockMode ? 'LIVE' : 'MOCK'}
        </button>
        {onOpenSettings && (
          <button
            className={`gh-btn gh-btn-icon ${settingsActive ? 'active' : ''}`}
            onClick={onOpenSettings}
            title={t('nav.settings')}
          >
            ⚙
          </button>
        )}
      </div>
    </header>
  );
}
