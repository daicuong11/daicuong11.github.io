import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { musicPlaylist as playlist, type MusicTrack } from '@/data/musicPlaylist';

export const PORTFOLIO_READY_EVENT = 'portfolio:ready';

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: MusicTrack;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: MusicTrack[];
  /** Duration thật (giây) theo id bài, từ metadata MP3; thiếu key thì UI fallback `track.duration` */
  trackMetaDurations: Record<string, number>;
  isPlayerOpen: boolean;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  togglePlayer: () => void;
  playTrack: (trackId: string) => void;
  requiresUserGesture: boolean;
  resumeAudio: () => Promise<void>;
  /** Gọi từ gesture (vd. chạm màn hình loading) để mở AudioContext / bật tiếng sau autoplay muted */
  unlockFromUserGesture: () => void;
  /** Làm nóng cache /music/*.mp3 (hover playlist, mở danh sách) để đổi bài mượt hơn */
  prefetchTrackMedia: (trackId: string) => void;
}

/** Bài mặc định khi mở app (id trong playlist, ví dụ '3' → index 2) */
const FAVORITE_TRACK_INDEX = 2;
/** Attack / release dùng exponential (ADSR-lite); crossfade giữ độ dài mượt */
const FADE_IN_MS = 1400;
const FADE_OUT_MS = 900;
const CROSSFADE_MS = 2000;
const VOLUME_RAMP_MS = 140;
const GAIN_EPS = 0.0001;

const MusicContext = createContext<MusicContextType | undefined>(undefined);

type DeckId = 'A' | 'B';

type Deck = {
  id: DeckId;
  audio: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode | null;
  gainNode: GainNode | null;
  trackIndex: number;
  prepared: boolean;
  /** Tăng mỗi lần gán src mới; bỏ qua canplay của load cũ */
  loadGeneration: number;
};

function trackUrlMatchesAudio(audio: HTMLAudioElement, url: string): boolean {
  try {
    const resolved = new URL(url, window.location.href).href;
    return audio.src === resolved || audio.currentSrc === resolved || audio.src.endsWith(url);
  } catch {
    return audio.src.includes(url);
  }
}

function waitForCanPlay(audio: HTMLAudioElement): Promise<void> {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const onCanPlay = () => {
      audio.removeEventListener('error', onError);
      resolve();
    };
    const onError = () => {
      audio.removeEventListener('canplay', onCanPlay);
      reject(new Error('Audio load failed'));
    };
    audio.addEventListener('canplay', onCanPlay, { once: true });
    audio.addEventListener('error', onError, { once: true });
  });
}

/** GET đầy đủ MP3 vào HTTP cache — khi đổi bài, audio.load() thường hit cache, bớt trễ */
const warmedPlaylistMediaKeys = new Set<string>();

function playlistMediaCacheKey(url: string): string {
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

function warmPlaylistMediaUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const key = playlistMediaCacheKey(url);
  if (warmedPlaylistMediaKeys.has(key)) return;
  warmedPlaylistMediaKeys.add(key);
  void fetch(url, { credentials: 'same-origin' }).catch(() => {
    warmedPlaylistMediaKeys.delete(key);
  });
}

function scheduleWarmEntirePlaylistMedia(): void {
  const run = () => {
    for (const t of playlist) {
      warmPlaylistMediaUrl(t.url);
    }
  };
  const ric = window.requestIdleCallback;
  if (typeof ric === 'function') {
    ric(run, { timeout: 4500 });
  } else {
    window.setTimeout(run, 400);
  }
}

/**
 * Gán src và đợi media sẵn sàng trước khi play — tránh play() bắt buffer bài cũ
 * (đặc biệt khi element đã nối MediaElementSource).
 */
async function loadTrackOnDeck(deck: Deck, trackIndex: number): Promise<void> {
  const url = playlist[trackIndex].url;
  if (deck.trackIndex === trackIndex && trackUrlMatchesAudio(deck.audio, url)) {
    return;
  }

  deck.loadGeneration += 1;
  const loadGen = deck.loadGeneration;
  const audio = deck.audio;
  audio.src = url;
  audio.preload = 'auto';
  audio.load();

  try {
    await waitForCanPlay(audio);
  } catch {
    if (deck.loadGeneration === loadGen) {
      deck.loadGeneration += 1;
    }
    throw new Error('Audio load failed');
  }

  if (deck.loadGeneration !== loadGen) {
    return;
  }
  deck.trackIndex = trackIndex;
}

function mergeMetaDuration(
  prev: Record<string, number>,
  trackId: string,
  seconds: number,
): Record<string, number> {
  if (!Number.isFinite(seconds) || seconds <= 0) return prev;
  if (prev[trackId] === seconds) return prev;
  return { ...prev, [trackId]: seconds };
}

/** Fade âm lượng element (trước khi có Web Audio) — không đụng AudioContext */
function rampElementVolume(audio: HTMLAudioElement, from: number, to: number, durationMs: number): void {
  if (durationMs <= 0) {
    audio.volume = to;
    return;
  }
  const t0 = performance.now();
  const step = () => {
    const elapsed = performance.now() - t0;
    const p = Math.min(1, elapsed / durationMs);
    audio.volume = from + (to - from) * p;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(FAVORITE_TRACK_INDEX);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(playlist[FAVORITE_TRACK_INDEX].duration);
  const [volume, setVolumeState] = useState(0.8);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [requiresUserGesture, setRequiresUserGesture] = useState(false);
  const [trackMetaDurations, setTrackMetaDurations] = useState<Record<string, number>>({});

  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const trackMetaDurationsRef = useRef<Record<string, number>>({});
  trackMetaDurationsRef.current = trackMetaDurations;

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const deckARef = useRef<Deck | null>(null);
  const deckBRef = useRef<Deck | null>(null);
  const activeDeckIdRef = useRef<DeckId>('A');

  const isTransitioningRef = useRef(false);
  const transitionGenRef = useRef(0);
  const transitionPauseTimerRef = useRef<number | null>(null);
  const transitionFinishTimerRef = useRef<number | null>(null);

  const currentTrackIndexRef = useRef(FAVORITE_TRACK_INDEX);
  const isPlayingRef = useRef(false);
  currentTrackIndexRef.current = currentTrackIndex;
  isPlayingRef.current = isPlaying;

  const restoreVolumeRef = useRef(0.8);
  const autoplaySuccessRef = useRef(false);
  const autoplayMicrotaskQueuedRef = useRef(false);
  const autoplayInFlightRef = useRef(false);
  /** Chỉ true sau gesture: đã tạo AudioContext + MediaElementSource (Chrome chặn nếu tạo sớm) */
  const useWebAudioRef = useRef(false);

  const currentTrack = playlist[currentTrackIndex];

  const getDeck = useCallback((id: DeckId) => (id === 'A' ? deckARef.current : deckBRef.current), []);

  const getActiveDeck = useCallback(() => getDeck(activeDeckIdRef.current), [getDeck]);
  const getInactiveDeck = useCallback(() => getDeck(activeDeckIdRef.current === 'A' ? 'B' : 'A'), [getDeck]);

  const ensureDeckGraph = useCallback((deck: Deck) => {
    if (!useWebAudioRef.current) return;
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || deck.prepared) return;
    deck.sourceNode = ctx.createMediaElementSource(deck.audio);
    deck.gainNode = ctx.createGain();
    deck.gainNode.gain.value = GAIN_EPS;
    deck.sourceNode.connect(deck.gainNode);
    deck.gainNode.connect(master);
    deck.prepared = true;
  }, []);

  const silenceDeckGain = useCallback((gainNode: GainNode) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = gainNode.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(GAIN_EPS, now);
  }, []);

  /** ADSR-lite attack: exponential 0 → full (mượt hơn linear cho nhạc nền) */
  const deckGainFadeIn = useCallback((gainNode: GainNode, durationMs: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = gainNode.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(GAIN_EPS, now);
    g.exponentialRampToValueAtTime(1, now + durationMs / 1000);
  }, []);

  /** Release: exponential về near-zero trước khi pause */
  const deckGainFadeOut = useCallback((gainNode: GainNode, durationMs: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = gainNode.gain;
    g.cancelScheduledValues(now);
    const cur = Math.max(g.value, GAIN_EPS);
    g.setValueAtTime(cur, now);
    g.exponentialRampToValueAtTime(GAIN_EPS, now + durationMs / 1000);
  }, []);

  const scheduleMasterVolume = useCallback((target: number, rampMs: number = VOLUME_RAMP_MS) => {
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const g = master.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(target, now + rampMs / 1000);
  }, []);

  const clearTransitionTimers = useCallback(() => {
    if (transitionPauseTimerRef.current != null) {
      window.clearTimeout(transitionPauseTimerRef.current);
      transitionPauseTimerRef.current = null;
    }
    if (transitionFinishTimerRef.current != null) {
      window.clearTimeout(transitionFinishTimerRef.current);
      transitionFinishTimerRef.current = null;
    }
  }, []);

  const syncUiFromActiveAudio = useCallback(() => {
    const active = getActiveDeck();
    if (!active) return;
    const t = active.audio.currentTime;
    setCurrentTime(Number.isFinite(t) ? t : 0);
    const d = active.audio.duration;
    if (Number.isFinite(d) && d > 0) {
      setDuration(d);
      const tr = playlist[active.trackIndex];
      if (tr) {
        setTrackMetaDurations((prev) => mergeMetaDuration(prev, tr.id, d));
      }
    }
  }, [getActiveDeck]);

  const resumeAudio = useCallback(async () => {
    if (!useWebAudioRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const active = getActiveDeck();
    if (active) ensureDeckGraph(active);
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    setRequiresUserGesture(false);
  }, [ensureDeckGraph, getActiveDeck]);

  const playDeck = useCallback(
    async (deck: Deck) => {
      if (!useWebAudioRef.current) {
        deck.audio.muted = false;
        deck.audio.volume = Math.min(1, volumeRef.current);
        await deck.audio.play();
        return;
      }
      ensureDeckGraph(deck);
      await resumeAudio();
      deck.audio.volume = 1;
      await deck.audio.play();
    },
    [ensureDeckGraph, resumeAudio],
  );

  /** Gọi trong stack gesture (pointerdown/click) — lần đầu mới tạo AudioContext */
  const migrateToWebAudioFromGesture = useCallback((): Promise<void> => {
    if (useWebAudioRef.current) return Promise.resolve();

    const deckA = deckARef.current;
    const deckB = deckBRef.current;
    if (!deckA || !deckB) return Promise.resolve();

    const activeId = activeDeckIdRef.current;
    const active = activeId === 'A' ? deckA : deckB;
    const activeTime = active.audio.currentTime;
    const wasPlaying = !active.audio.paused;

    deckA.audio.pause();
    deckB.audio.pause();

    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = volumeRef.current;
    master.connect(ctx.destination);
    audioContextRef.current = ctx;
    masterGainRef.current = master;
    useWebAudioRef.current = true;

    for (const deck of [deckA, deckB]) {
      deck.sourceNode = ctx.createMediaElementSource(deck.audio);
      deck.gainNode = ctx.createGain();
      deck.gainNode.gain.value = GAIN_EPS;
      deck.sourceNode.connect(deck.gainNode);
      deck.gainNode.connect(master);
      deck.prepared = true;
      deck.audio.volume = 1;
    }

    return ctx
      .resume()
      .then(() => {
        if (wasPlaying) {
          active.audio.currentTime = activeTime;
          return active.audio.play();
        }
        return undefined;
      })
      .then(() => {
        if (wasPlaying && active.gainNode) {
          deckGainFadeIn(active.gainNode, FADE_IN_MS);
        }
        scheduleMasterVolume(volumeRef.current, 0);
        setRequiresUserGesture(false);
      });
  }, [deckGainFadeIn, scheduleMasterVolume]);

  const preloadNextOnInactive = useCallback(
    (playingIndex: number) => {
      const inactive = getInactiveDeck();
      if (!inactive) return;
      const nextIndex = (playingIndex + 1) % playlist.length;
      if (inactive.trackIndex === nextIndex && trackUrlMatchesAudio(inactive.audio, playlist[nextIndex].url)) {
        return;
      }
      void loadTrackOnDeck(inactive, nextIndex).catch(() => undefined);
    },
    [getInactiveDeck],
  );

  const finishTransition = useCallback(
    (gen: number, newActiveId: DeckId, targetTrackIndex: number) => {
      if (gen !== transitionGenRef.current) return;
      activeDeckIdRef.current = newActiveId;
      setCurrentTrackIndex(targetTrackIndex);
      setCurrentTime(0);
      setDuration(playlist[targetTrackIndex].duration);
      isTransitioningRef.current = false;
      preloadNextOnInactive(targetTrackIndex);
      syncUiFromActiveAudio();
    },
    [preloadNextOnInactive, syncUiFromActiveAudio],
  );

  /** Chuyển bài chỉ bằng volume trên HTMLAudioElement (chưa bật Web Audio) */
  const performTransitionElement = useCallback(
    async (targetTrackIndex: number) => {
      const activePre = getActiveDeck();
      const inactivePre = getInactiveDeck();
      if (!activePre || !inactivePre) return;

      if (
        targetTrackIndex === activePre.trackIndex &&
        trackUrlMatchesAudio(activePre.audio, playlist[targetTrackIndex].url)
      ) {
        setCurrentTrackIndex(targetTrackIndex);
        syncUiFromActiveAudio();
        return;
      }

      if (isTransitioningRef.current) {
        clearTransitionTimers();
        transitionGenRef.current += 1;
        isTransitioningRef.current = false;
      }

      const active = getActiveDeck();
      const inactive = getInactiveDeck();
      if (!active || !inactive) return;

      clearTransitionTimers();
      isTransitioningRef.current = true;
      transitionGenRef.current += 1;
      const gen = transitionGenRef.current;

      const newActiveId: DeckId = activeDeckIdRef.current === 'A' ? 'B' : 'A';
      const vol = volumeRef.current;

      try {
        await loadTrackOnDeck(inactive, targetTrackIndex);
        if (gen !== transitionGenRef.current) return;

        inactive.audio.currentTime = 0;
        inactive.audio.volume = 0;
        await inactive.audio.play();
        active.audio.volume = vol;

        const steps = Math.max(12, Math.floor(CROSSFADE_MS / 60));
        const stepMs = CROSSFADE_MS / steps;

        for (let i = 1; i <= steps; i++) {
          if (gen !== transitionGenRef.current) return;
          const p = i / steps;
          active.audio.volume = vol * (1 - p);
          inactive.audio.volume = vol * p;
          await new Promise<void>((r) => window.setTimeout(r, stepMs));
        }

        active.audio.pause();
        active.audio.currentTime = 0;
        inactive.audio.volume = vol;

        if (gen !== transitionGenRef.current) return;
        finishTransition(gen, newActiveId, targetTrackIndex);
      } catch {
        isTransitioningRef.current = false;
        setRequiresUserGesture(true);
        setIsPlaying(false);
      }
    },
    [clearTransitionTimers, finishTransition, getActiveDeck, getInactiveDeck, syncUiFromActiveAudio],
  );

  const performTransition = useCallback(
    async (targetTrackIndex: number) => {
      const activePre = getActiveDeck();
      const inactivePre = getInactiveDeck();
      if (!activePre || !inactivePre) return;

      if (
        targetTrackIndex === activePre.trackIndex &&
        trackUrlMatchesAudio(activePre.audio, playlist[targetTrackIndex].url)
      ) {
        setCurrentTrackIndex(targetTrackIndex);
        syncUiFromActiveAudio();
        return;
      }

      if (isTransitioningRef.current) {
        clearTransitionTimers();
        transitionGenRef.current += 1;
        isTransitioningRef.current = false;
      }

      const active = getActiveDeck();
      const inactive = getInactiveDeck();
      if (!active || !inactive) return;

      if (!useWebAudioRef.current) {
        await performTransitionElement(targetTrackIndex);
        return;
      }

      clearTransitionTimers();
      isTransitioningRef.current = true;
      transitionGenRef.current += 1;
      const gen = transitionGenRef.current;

      const newActiveId: DeckId = activeDeckIdRef.current === 'A' ? 'B' : 'A';

      await loadTrackOnDeck(inactive, targetTrackIndex);
      if (gen !== transitionGenRef.current) {
        return;
      }

      ensureDeckGraph(active);
      ensureDeckGraph(inactive);

      try {
        inactive.audio.currentTime = 0;
        await playDeck(inactive);

        if (!active.gainNode || !inactive.gainNode) {
          throw new Error('Gain graph not ready');
        }

        deckGainFadeIn(inactive.gainNode, CROSSFADE_MS);
        deckGainFadeOut(active.gainNode, CROSSFADE_MS);

        transitionPauseTimerRef.current = window.setTimeout(() => {
          if (gen !== transitionGenRef.current) return;
          active.audio.pause();
          active.audio.currentTime = 0;
          if (active.gainNode) {
            silenceDeckGain(active.gainNode);
          }
        }, CROSSFADE_MS + 50);

        transitionFinishTimerRef.current = window.setTimeout(() => {
          finishTransition(gen, newActiveId, targetTrackIndex);
        }, CROSSFADE_MS + 80);
      } catch {
        isTransitioningRef.current = false;
        setRequiresUserGesture(true);
        setIsPlaying(false);
      }
    },
    [
      clearTransitionTimers,
      ensureDeckGraph,
      finishTransition,
      getActiveDeck,
      getInactiveDeck,
      performTransitionElement,
      playDeck,
      deckGainFadeIn,
      deckGainFadeOut,
      silenceDeckGain,
      syncUiFromActiveAudio],
  );

  const engineRef = useRef({
    ensureDeckGraph,
    playDeck,
    silenceDeckGain,
    deckGainFadeIn,
    deckGainFadeOut,
    preloadNextOnInactive,
    syncUiFromActiveAudio,
    clearTransitionTimers,
    performTransition,
  });
  engineRef.current = {
    ensureDeckGraph,
    playDeck,
    silenceDeckGain,
    deckGainFadeIn,
    deckGainFadeOut,
    preloadNextOnInactive,
    syncUiFromActiveAudio,
    clearTransitionTimers,
    performTransition,
  };

  useEffect(() => {
    isTransitioningRef.current = false;

    const audioA = new Audio(playlist[FAVORITE_TRACK_INDEX].url);
    audioA.loop = false;
    audioA.preload = 'auto';
    audioA.setAttribute('playsinline', '');

    const audioB = new Audio(playlist[(FAVORITE_TRACK_INDEX + 1) % playlist.length].url);
    audioB.loop = false;
    audioB.preload = 'auto';
    audioB.setAttribute('playsinline', '');

    const deckA: Deck = {
      id: 'A',
      audio: audioA,
      sourceNode: null,
      gainNode: null,
      trackIndex: FAVORITE_TRACK_INDEX,
      prepared: false,
      loadGeneration: 0,
    };
    const deckB: Deck = {
      id: 'B',
      audio: audioB,
      sourceNode: null,
      gainNode: null,
      trackIndex: (FAVORITE_TRACK_INDEX + 1) % playlist.length,
      prepared: false,
      loadGeneration: 0,
    };

    deckARef.current = deckA;
    deckBRef.current = deckB;
    activeDeckIdRef.current = 'A';

    const onDeckTimeOrMeta = (deck: Deck) => {
      if (activeDeckIdRef.current !== deck.id) return;
      const t = deck.audio.currentTime;
      setCurrentTime(Number.isFinite(t) ? t : 0);
      const d = deck.audio.duration;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
        const tr = playlist[deck.trackIndex];
        if (tr) {
          setTrackMetaDurations((prev) => mergeMetaDuration(prev, tr.id, d));
        }
      }
    };

    const onEnded = (deck: Deck) => {
      if (activeDeckIdRef.current !== deck.id) return;
      if (isTransitioningRef.current) return;
      const nextIndex = (currentTrackIndexRef.current + 1) % playlist.length;
      void engineRef.current.performTransition(nextIndex);
    };

    const subs: Array<{ el: HTMLAudioElement; ev: string; fn: EventListener }> = [];

    for (const deck of [deckA, deckB]) {
      const tu = () => onDeckTimeOrMeta(deck);
      const md = () => onDeckTimeOrMeta(deck);
      const en = () => onEnded(deck);
      deck.audio.addEventListener('timeupdate', tu);
      deck.audio.addEventListener('loadedmetadata', md);
      deck.audio.addEventListener('ended', en);
      subs.push({ el: deck.audio, ev: 'timeupdate', fn: tu });
      subs.push({ el: deck.audio, ev: 'loadedmetadata', fn: md });
      subs.push({ el: deck.audio, ev: 'ended', fn: en });
    }

    /** Chỉ HTMLAudioElement — không tạo AudioContext (tránh cảnh báo / chặn autoplay Chrome) */
    const runAutoplayOnce = async () => {
      if (autoplaySuccessRef.current || autoplayInFlightRef.current) return;
      autoplayInFlightRef.current = true;
      const eng = engineRef.current;

      const markSuccess = () => {
        rampElementVolume(deckA.audio, deckA.audio.volume, volumeRef.current, FADE_IN_MS);
        setIsPlaying(true);
        autoplaySuccessRef.current = true;
        setRequiresUserGesture(false);
        eng.preloadNextOnInactive(FAVORITE_TRACK_INDEX);
        eng.syncUiFromActiveAudio();
      };

      const tryAudiblePlay = async () => {
        await waitForCanPlay(deckA.audio);
        deckA.audio.muted = false;
        deckB.audio.muted = false;
        deckA.audio.volume = 0;
        await deckA.audio.play();
      };

      try {
        await tryAudiblePlay();
        markSuccess();
      } catch {
        await new Promise<void>((r) => window.setTimeout(r, 120));
        try {
          deckA.audio.muted = false;
          deckA.audio.volume = 0;
          await deckA.audio.play();
          markSuccess();
        } catch {
          try {
            deckA.audio.muted = true;
            deckA.audio.volume = 0;
            await deckA.audio.play();
            deckA.audio.muted = false;
            deckA.audio.volume = 0;
            await deckA.audio.play().catch(() => undefined);
            markSuccess();
          } catch {
            deckA.audio.muted = false;
            try {
              deckA.audio.pause();
            } catch {
              /* ignore */
            }
            setRequiresUserGesture(true);
            setIsPlaying(false);
            autoplaySuccessRef.current = false;
          }
        }
      } finally {
        autoplayInFlightRef.current = false;
      }
    };

    const scheduleAutoplay = () => {
      if (autoplayMicrotaskQueuedRef.current) return;
      autoplayMicrotaskQueuedRef.current = true;
      queueMicrotask(() => {
        autoplayMicrotaskQueuedRef.current = false;
        void runAutoplayOnce();
      });
    };

    const onPortfolioReady = () => scheduleAutoplay();
    window.addEventListener(PORTFOLIO_READY_EVENT, onPortfolioReady);
    const fallbackAutoplay = window.setTimeout(() => scheduleAutoplay(), 2800);

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      if (!autoplaySuccessRef.current) scheduleAutoplay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    scheduleAutoplay();
    scheduleWarmEntirePlaylistMedia();

    return () => {
      autoplaySuccessRef.current = false;
      autoplayMicrotaskQueuedRef.current = false;
      autoplayInFlightRef.current = false;
      useWebAudioRef.current = false;
      window.removeEventListener(PORTFOLIO_READY_EVENT, onPortfolioReady);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(fallbackAutoplay);
      engineRef.current.clearTransitionTimers();
      transitionGenRef.current += 1;
      isTransitioningRef.current = false;
      for (const s of subs) {
        s.el.removeEventListener(s.ev, s.fn);
      }
      deckA.audio.pause();
      deckB.audio.pause();
      deckA.audio.src = '';
      deckB.audio.src = '';
      void audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
      masterGainRef.current = null;
      deckA.prepared = false;
      deckB.prepared = false;
      deckA.sourceNode = null;
      deckB.sourceNode = null;
      deckA.gainNode = null;
      deckB.gainNode = null;
      deckARef.current = null;
      deckBRef.current = null;
    };
  }, []);

  const togglePlay = useCallback(() => {
    const active = getActiveDeck();
    if (!active) return;

    if (!useWebAudioRef.current) {
      if (isPlayingRef.current) {
        const startVol = active.audio.volume;
        const t0 = performance.now();
        const tick = () => {
          const elapsed = performance.now() - t0;
          const p = Math.min(1, elapsed / FADE_OUT_MS);
          active.audio.volume = startVol * (1 - p);
          if (p < 1) requestAnimationFrame(tick);
          else {
            active.audio.pause();
            setIsPlaying(false);
          }
        };
        requestAnimationFrame(tick);
      } else {
        active.audio.volume = 0;
        void active.audio
          .play()
          .then(() => {
            rampElementVolume(active.audio, 0, volumeRef.current, FADE_IN_MS);
            setIsPlaying(true);
          })
          .catch(() => {
            setRequiresUserGesture(true);
            setIsPlaying(false);
          });
      }
      return;
    }

    ensureDeckGraph(active);
    if (!active.gainNode) return;

    if (isPlayingRef.current) {
      deckGainFadeOut(active.gainNode, FADE_OUT_MS);
      window.setTimeout(() => {
        active.audio.pause();
      }, FADE_OUT_MS + 50);
      setIsPlaying(false);
    } else {
      void playDeck(active)
        .then(() => {
          deckGainFadeIn(active.gainNode!, FADE_IN_MS);
          setIsPlaying(true);
        })
        .catch(() => {
          setRequiresUserGesture(true);
          setIsPlaying(false);
        });
    }
  }, [deckGainFadeIn, deckGainFadeOut, ensureDeckGraph, getActiveDeck, playDeck]);

  const nextTrack = useCallback(() => {
    const nextIndex = (currentTrackIndexRef.current + 1) % playlist.length;
    setIsPlaying(true);
    void performTransition(nextIndex);
  }, [performTransition]);

  const prevTrack = useCallback(() => {
    const prevIndex = (currentTrackIndexRef.current - 1 + playlist.length) % playlist.length;
    setIsPlaying(true);
    void performTransition(prevIndex);
  }, [performTransition]);

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v));
      setVolumeState(clamped);
      volumeRef.current = clamped;
      restoreVolumeRef.current = clamped;
      if (!useWebAudioRef.current) {
        const active = getActiveDeck();
        if (active && isPlayingRef.current) {
          active.audio.volume = clamped;
        }
        return;
      }
      scheduleMasterVolume(clamped, VOLUME_RAMP_MS);
    },
    [getActiveDeck, scheduleMasterVolume],
  );

  const seekTo = useCallback(
    (time: number) => {
      const active = getActiveDeck();
      if (!active) return;
      const tr = playlist[currentTrackIndexRef.current];
      const metaMax =
        (tr && trackMetaDurationsRef.current[tr.id]) ?? tr?.duration ?? 0;
      const audioDur = active.audio.duration;
      const max =
        Number.isFinite(audioDur) && audioDur > 0
          ? audioDur
          : metaMax > 0
            ? metaMax
            : Number.POSITIVE_INFINITY;
      const clamped = Math.max(0, Math.min(time, max));
      active.audio.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [getActiveDeck],
  );

  const togglePlayer = useCallback(() => {
    setIsPlayerOpen((p) => !p);
  }, []);

  const playTrack = useCallback(
    (trackId: string) => {
      const idx = playlist.findIndex((t) => t.id === trackId);
      if (idx === -1) return;
      if (idx === currentTrackIndexRef.current) {
        if (!isPlayingRef.current) togglePlay();
        return;
      }
      setIsPlaying(true);
      void performTransition(idx);
    },
    [performTransition, togglePlay],
  );

  const prefetchTrackMedia = useCallback((trackId: string) => {
    const tr = playlist.find((t) => t.id === trackId);
    if (tr) warmPlaylistMediaUrl(tr.url);
  }, []);

  const unlockFromUserGesture = useCallback(() => {
    const continueWithWebAudio = () =>
      resumeAudio().then(() => {
        const active = getActiveDeck();
        if (!active?.gainNode) return undefined;

        const ctx = audioContextRef.current;
        const needPlay =
          !autoplaySuccessRef.current ||
          active.audio.paused ||
          ctx == null ||
          ctx.state !== 'running';

        if (!needPlay) {
          setRequiresUserGesture(false);
          return undefined;
        }

        return playDeck(active).then(() => {
          scheduleMasterVolume(restoreVolumeRef.current, VOLUME_RAMP_MS);
          deckGainFadeIn(active.gainNode!, FADE_IN_MS);
          setIsPlaying(true);
          setRequiresUserGesture(false);
          autoplaySuccessRef.current = true;
        });
      });

    if (!useWebAudioRef.current) {
      void migrateToWebAudioFromGesture()
        .then(() => continueWithWebAudio())
        .catch(() => setRequiresUserGesture(true));
    } else {
      void continueWithWebAudio().catch(() => setRequiresUserGesture(true));
    }
  }, [
    deckGainFadeIn,
    getActiveDeck,
    migrateToWebAudioFromGesture,
    playDeck,
    resumeAudio,
    scheduleMasterVolume,
  ]);

  const handleAutoResumeByInteraction = useCallback(() => {
    const active = getActiveDeck();
    const stuckPlayingUi =
      isPlayingRef.current && active != null && active.audio.paused;
    if (!requiresUserGesture && !stuckPlayingUi) {
      return;
    }
    unlockFromUserGesture();
  }, [getActiveDeck, requiresUserGesture, unlockFromUserGesture]);

  useEffect(() => {
    const onInteract = () => handleAutoResumeByInteraction();
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract);
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [handleAutoResumeByInteraction]);

  /** Đọc duration từ metadata cho mọi bài (playlist), không ảnh hưởng deck đang phát */
  useEffect(() => {
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    for (const track of playlist) {
      const a = document.createElement('audio');
      a.preload = 'metadata';
      a.muted = true;
      const onLoaded = () => {
        if (cancelled) return;
        const d = a.duration;
        if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY) {
          setTrackMetaDurations((prev) => mergeMetaDuration(prev, track.id, d));
        }
      };
      a.addEventListener('loadedmetadata', onLoaded);
      a.src = track.url;
      a.load();
      cleanups.push(() => {
        a.removeEventListener('loadedmetadata', onLoaded);
        a.removeAttribute('src');
        a.load();
      });
    }

    return () => {
      cancelled = true;
      for (const c of cleanups) c();
    };
  }, []);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        volume,
        playlist,
        trackMetaDurations,
        isPlayerOpen,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        seekTo,
        togglePlayer,
        playTrack,
        requiresUserGesture,
        resumeAudio,
        unlockFromUserGesture,
        prefetchTrackMedia,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
