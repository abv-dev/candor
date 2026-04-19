export interface AudioConfig {
  enabled: boolean;
  drake: boolean;
  baron: boolean;
  herald: boolean;
  grubs: boolean;
  volume: number;
}

const STORAGE_KEY = 'coach-lol-live:audio-config';
const listeners = new Set<() => void>();

const defaults: AudioConfig = {
  enabled: true,
  drake: true,
  baron: true,
  herald: true,
  grubs: true,
  volume: 0.9,
};

function load(): AudioConfig {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AudioConfig>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

let current: AudioConfig = load();

export function getAudioConfig(): AudioConfig {
  return current;
}

export function updateAudioConfig(patch: Partial<AudioConfig>): void {
  current = { ...current, ...patch };
  if (typeof window !== 'undefined') {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  listeners.forEach((l) => l());
}

export function subscribeAudioConfig(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
