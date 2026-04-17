import { useEffect, useState } from 'react';
import type { AllGameData } from './types/liveClient';
import { fetchLiveData, fetchMockData, resetMock, type ConnectionState } from './services/liveClient';
import { checkAndApplyUpdate, type UpdateStatus } from './services/updater';
import { Dashboard } from './components/Dashboard';
import { MicroOverlay } from './components/MicroOverlay';
import { GameHeader } from './components/GameHeader';
import { UpdateBanner } from './components/UpdateBanner';

const POLL_INTERVAL_MS = 1000;
type ViewMode = 'dashboard' | 'micro';

function initialView(): ViewMode {
  if (typeof window === 'undefined') return 'dashboard';
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'micro' ? 'micro' : 'dashboard';
}

function isMicroWindow(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'micro';
}

function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function App() {
  const [data, setData] = useState<AllGameData | null>(null);
  const [state, setState] = useState<ConnectionState>('no-game');
  const [mockMode, setMockMode] = useState<boolean>(() => !isTauriApp());
  const [view, setView] = useState<ViewMode>(initialView);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ kind: 'idle' });
  const locked = isMicroWindow();

  useEffect(() => {
    if (!locked) {
      checkAndApplyUpdate(setUpdateStatus);
    }
  }, [locked]);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      if (cancelled) return;
      const res = mockMode ? fetchMockData() : await fetchLiveData();
      if (cancelled) return;
      setState(res.state);
      setData(res.data);
    }

    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [mockMode]);

  function toggleMock() {
    if (mockMode) resetMock();
    setMockMode((v) => !v);
  }

  function toggleView() {
    if (locked) return;
    setView((v) => (v === 'dashboard' ? 'micro' : 'dashboard'));
  }

  const gameTime = data?.gameData.gameTime ?? 0;

  if (locked || view === 'micro') {
    return (
      <div className="app app-micro">
        {!locked && (
          <GameHeader
            gameTime={gameTime}
            state={state}
            mockMode={mockMode}
            onToggleMock={toggleMock}
            view={view}
            onToggleView={toggleView}
          />
        )}
        {data ? <MicroOverlay data={data} /> : <EmptyState mockMode={mockMode} />}
      </div>
    );
  }

  return (
    <div className="app app-dashboard">
      <GameHeader
        gameTime={gameTime}
        state={state}
        mockMode={mockMode}
        onToggleMock={toggleMock}
        view={view}
        onToggleView={toggleView}
      />
      <UpdateBanner status={updateStatus} />
      {data ? <Dashboard data={data} /> : <EmptyState mockMode={mockMode} />}
    </div>
  );
}

function EmptyState({ mockMode }: { mockMode: boolean }) {
  return (
    <div className="empty">
      <p>En attente d'une game…</p>
      {!mockMode && <p className="hint">Lance une partie LoL ou active le mode MOCK.</p>}
    </div>
  );
}
