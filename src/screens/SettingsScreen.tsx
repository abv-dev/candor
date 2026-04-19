import { useSyncExternalStore } from 'react';
import { useT, useLang, setLang, type Lang } from '../i18n';
import { getAudioConfig, updateAudioConfig, subscribeAudioConfig, type AudioConfig } from '../services/audioConfig';
import { testAudio } from '../services/audioAlerts';

interface Props {
  onBack: () => void;
  mockMode: boolean;
  onToggleMock: () => void;
  version: string;
}

function useAudioConfig(): AudioConfig {
  return useSyncExternalStore(subscribeAudioConfig, getAudioConfig, getAudioConfig);
}

export function SettingsScreen({ onBack, mockMode, onToggleMock, version }: Props) {
  const t = useT();
  const lang = useLang();
  const audio = useAudioConfig();

  return (
    <div className="screen-settings">
      <header className="settings-header">
        <button className="settings-back" onClick={onBack}>
          ← {t('settings.back')}
        </button>
        <h1 className="settings-title">{t('settings.title')}</h1>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h2 className="settings-section-title">🔊 {t('settings.audio.title')}</h2>

          <Toggle
            label={t('settings.audio.global')}
            checked={audio.enabled}
            onChange={(v) => updateAudioConfig({ enabled: v })}
          />

          <div className={`settings-sub ${audio.enabled ? '' : 'disabled'}`}>
            <Toggle
              label={t('settings.audio.drake')}
              checked={audio.drake}
              onChange={(v) => updateAudioConfig({ drake: v })}
            />
            <Toggle
              label={t('settings.audio.baron')}
              checked={audio.baron}
              onChange={(v) => updateAudioConfig({ baron: v })}
            />
            <Toggle
              label={t('settings.audio.herald')}
              checked={audio.herald}
              onChange={(v) => updateAudioConfig({ herald: v })}
            />
            <Toggle
              label={t('settings.audio.grubs')}
              checked={audio.grubs}
              onChange={(v) => updateAudioConfig({ grubs: v })}
            />
          </div>

          <div className="settings-row">
            <label className="settings-label">{t('settings.audio.volume')}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.volume}
              onChange={(e) => updateAudioConfig({ volume: parseFloat(e.target.value) })}
              className="settings-slider"
            />
            <span className="settings-slider-val">{Math.round(audio.volume * 100)}%</span>
          </div>

          <button className="settings-btn-secondary" onClick={testAudio}>
            🔊 {t('settings.audio.test')}
          </button>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">🌐 {t('settings.language.title')}</h2>
          <div className="settings-lang-switch">
            {(['fr', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                className={`settings-lang-btn ${lang === l ? 'active' : ''}`}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">🎨 {t('settings.display.title')}</h2>
          <Toggle
            label={t('settings.display.mock')}
            checked={mockMode}
            onChange={() => onToggleMock()}
          />
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">ℹ️ {t('settings.about.title')}</h2>
          <div className="settings-about">
            <span>{t('settings.about.version')}</span>
            <span className="settings-about-v">v{version}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="settings-toggle">
      <span className="settings-toggle-label">{label}</span>
      <span className={`settings-toggle-track ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
        <span className="settings-toggle-knob" />
      </span>
    </label>
  );
}
