import { useEffect, useRef, useState } from 'react';
import type { AllGameData } from './types/liveClient';
import { fetchLiveData, fetchMockData, resetMock, type ConnectionState } from './services/liveClient';
import { checkAndApplyUpdate, type UpdateStatus } from './services/updater';
import { checkAudioAlerts, resetAudioAlerts } from './services/audioAlerts';
import { Dashboard } from './components/Dashboard';
import { MicroOverlay } from './components/MicroOverlay';
import { GameHeader } from './components/GameHeader';
import { UpdateBanner } from './components/UpdateBanner';
import { FitToViewport } from './components/FitToViewport';
import { HomeScreen } from './screens/HomeScreen';
import { WaitingScreen } from './screens/WaitingScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { EndGameScreen } from './screens/EndGameScreen';

const POLL_INTERVAL_MS = 1000;
const APP_VERSION = '0.5.9';
type ViewMode = 'dashboard' | 'micro';
type Screen = 'home' | 'waiting' | 'game' | 'settings' | 'end';

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
  const [view, setView] = useState<ViewMode>('dashboard');
  const [screen, setScreen] = useState<Screen>('home');
  const [prevScreen, setPrevScreen] = useState<Screen>('waiting');
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ kind: 'idle' });
  const [endedGameData, setEndedGameData] = useState<AllGameData | null>(null);
  const prevDataRef = useRef<AllGameData | null>(null);
  const locked = isMicroWindow();

  useEffect(() => {
    if (!locked) checkAndApplyUpdate(setUpdateStatus);
  }, [locked]);

  useEffect(() => {
    if (locked) return;
    if (!isTauriApp()) return;
    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('set_overlay_visible', { visible: !!data }).catch(() => {});
    });
  }, [data, locked]);

  useEffect(() => {
    if (!data) resetAudioAlerts();
  }, [data]);

  useEffect(() => {
    const prev = prevDataRef.current;
    prevDataRef.current = data;

    if (prev && !data && !mockMode && screen !== 'home' && screen !== 'settings') {
      setEndedGameData(prev);
      setScreen('end');
      return;
    }

    if (screen === 'home' || screen === 'settings' || screen === 'end') return;
    const next: Screen = data ? 'game' : 'waiting';
    if (screen !== next) setScreen(next);
  }, [data, screen, mockMode]);

  useEffect(() => {
    let cancelled = false;
    resetAudioAlerts();

    async function tick() {
      if (cancelled) return;
      const res = mockMode ? fetchMockData() : await fetchLiveData();
      if (cancelled) return;
      setState(res.state);
      setData(res.data);
      if (res.data && !locked) checkAudioAlerts(res.data);
    }

    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [mockMode, locked]);

  function startFromHome() {
    if (mockMode) {
      resetMock();
      setMockMode(false);
    }
    setEndedGameData(null);
    setScreen(data ? 'game' : 'waiting');
  }

  function backToHomeFromEnd() {
    setEndedGameData(null);
    setScreen('home');
  }

  function launchDemo() {
    if (!mockMode) setMockMode(true);
    setScreen('game');
  }

  function quitDemo() {
    resetMock();
    setMockMode(false);
    setScreen('home');
  }

  function toggleView() {
    if (locked) return;
    setView((v) => (v === 'dashboard' ? 'micro' : 'dashboard'));
  }

  function openSettings() {
    if (screen === 'settings') return;
    setPrevScreen(screen);
    setScreen('settings');
  }

  function closeSettings() {
    const target = data ? 'game' : 'waiting';
    setScreen(prevScreen === 'home' ? target : prevScreen);
  }

  const gameTime = data?.gameData.gameTime ?? 0;

  // Micro overlay window (Tauri 2nd window): simpler render
  if (locked) {
    return (
      <div className="app app-micro micro-locked">
        {data ? <MicroOverlay data={data} /> : null}
      </div>
    );
  }

  if (screen === 'home') {
    return (
      <div className="app app-screen">
        <HomeScreen onStart={startFromHome} onDemo={launchDemo} version={APP_VERSION} />
      </div>
    );
  }

  if (screen === 'end' && endedGameData) {
    return (
      <div className="app app-screen">
        <GameHeader
          gameTime={endedGameData.gameData.gameTime}
          state={state}
          mockMode={mockMode}
          view={view}
          onToggleView={toggleView}
          onOpenSettings={openSettings}
        />
        <EndGameScreen data={endedGameData} onBackHome={backToHomeFromEnd} />
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div className="app app-dashboard">
        <GameHeader
          gameTime={gameTime}
          state={state}
          mockMode={mockMode}
          onQuitDemo={mockMode ? quitDemo : undefined}
          view={view}
          onToggleView={toggleView}
          onOpenSettings={closeSettings}
          settingsActive
        />
        <SettingsScreen onBack={closeSettings} version={APP_VERSION} />
      </div>
    );
  }

  if (screen === 'waiting') {
    return (
      <div className="app app-screen">
        <GameHeader
          gameTime={0}
          state={state}
          mockMode={mockMode}
          onQuitDemo={mockMode ? quitDemo : undefined}
          view={view}
          onToggleView={toggleView}
          onOpenSettings={openSettings}
        />
        <UpdateBanner status={updateStatus} />
        <WaitingScreen />
      </div>
    );
  }

  // screen === 'game'
  if (view === 'micro') {
    return (
      <div className="app app-micro">
        <GameHeader
          gameTime={gameTime}
          state={state}
          mockMode={mockMode}
          onQuitDemo={mockMode ? quitDemo : undefined}
          view={view}
          onToggleView={toggleView}
          onOpenSettings={openSettings}
        />
        {data && <MicroOverlay data={data} />}
      </div>
    );
  }

  return (
    <FitToViewport className="app app-dashboard">
      <GameHeader
        gameTime={gameTime}
        state={state}
        mockMode={mockMode}
        onQuitDemo={mockMode ? quitDemo : undefined}
        view={view}
        onToggleView={toggleView}
        onOpenSettings={openSettings}
      />
      <UpdateBanner status={updateStatus} />
      {data && <Dashboard data={data} />}
    </FitToViewport>
  );
}
