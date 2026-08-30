// Global audio player: one story plays at a time, keeps playing while the
// user browses other screens or locks the phone, and shows lock-screen
// controls with the story's title and cloth artwork.
//
// A module-level singleton (not the useAudioPlayer hook) so playback
// survives navigation; screens subscribe with useSyncExternalStore.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { getProgress, setProgress } from './db';
import type { Story } from './types';

export interface PlayerState {
  storyId: string | null;
  title: string;
  playing: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  loop: boolean;
  loading: boolean;
}

let player: AudioPlayer | null = null;
let state: PlayerState = {
  storyId: null, title: '', playing: false, currentTime: 0,
  duration: 0, rate: 1, loop: false, loading: false,
};
const listeners = new Set<() => void>();
let lastSavedAt = 0;

function emit(partial: Partial<PlayerState>) {
  state = { ...state, ...partial };
  for (const l of listeners) l();
}

export function subscribePlayer(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function playerState(): PlayerState {
  return state;
}

let audioModeReady = false;
async function ensureAudioMode() {
  if (audioModeReady) return;
  await setAudioModeAsync({
    playsInSilentMode: true,       // a storyteller's phone may be on silent
    shouldPlayInBackground: true,  // keep playing with the screen off
  });
  audioModeReady = true;
}

/**
 * Load and play a story's audio. `uri` is the local file when downloaded,
 * or the remote URL when streaming. Resumes from the saved position.
 */
export async function playStory(story: Story, uri: string, artworkUrl?: string): Promise<void> {
  await ensureAudioMode();

  // Save progress of whatever was playing before switching.
  saveProgress();
  player?.remove();

  emit({ storyId: story.id, title: story.title, loading: true, playing: false, currentTime: 0, duration: 0 });

  const p = createAudioPlayer({ uri }, { updateInterval: 500 });
  player = p;
  p.addListener('playbackStatusUpdate', (status) => {
    if (player !== p) return; // stale listener after switching stories
    emit({
      playing: status.playing,
      currentTime: status.currentTime,
      duration: Number.isFinite(status.duration) ? status.duration : 0,
      loading: !status.isLoaded,
    });
    // Persist resume position at most every 5 seconds.
    if (status.playing && Date.now() - lastSavedAt > 5000) {
      lastSavedAt = Date.now();
      setProgress(story.id, status.currentTime);
    }
    if (status.didJustFinish && !state.loop) {
      setProgress(story.id, 0); // finished — next play starts at the top
      emit({ playing: false });
    }
  });

  // Lock-screen / notification controls with the story's artwork.
  p.setActiveForLockScreen(true, {
    title: story.title,
    artist: 'Bible Storying Kenya',
    ...(artworkUrl ? { artworkUrl } : {}),
  });

  p.loop = state.loop;
  p.playbackRate = state.rate;

  const resumeAt = getProgress(story.id);
  if (resumeAt > 2) p.seekTo(resumeAt);
  p.play();
}

export function togglePlayback(): void {
  if (!player) return;
  if (state.playing) {
    player.pause();
    saveProgress();
  } else {
    player.play();
  }
}

export function seekTo(seconds: number): void {
  player?.seekTo(Math.max(0, Math.min(seconds, state.duration || seconds)));
}

export function seekBy(deltaSeconds: number): void {
  seekTo(state.currentTime + deltaSeconds);
}

/** Cycle 1x → 1.25x → 1.5x → 0.75x → 1x (repeated listening / learning). */
export function cycleRate(): number {
  const order = [1, 1.25, 1.5, 0.75];
  const next = order[(order.indexOf(state.rate) + 1) % order.length];
  if (player) player.playbackRate = next;
  emit({ rate: next });
  return next;
}

export function toggleLoop(): boolean {
  const loop = !state.loop;
  if (player) player.loop = loop;
  emit({ loop });
  return loop;
}

export function stopPlayback(): void {
  saveProgress();
  player?.remove();
  player = null;
  emit({ storyId: null, title: '', playing: false, currentTime: 0, duration: 0, loading: false });
}

function saveProgress(): void {
  if (state.storyId && state.currentTime > 0) {
    setProgress(state.storyId, state.currentTime);
  }
}
