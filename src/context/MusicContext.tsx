import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  url: string;
  duration: number;
}

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: Track;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Track[];
  isPlayerOpen: boolean;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  togglePlayer: () => void;
  playTrack: (trackId: string) => void;
}

// Playlist with royalty-free music
const playlist: Track[] = [
  {
    id: '1',
    title: 'Weightless',
    artist: 'Marconi Union',
    cover: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 480,
  },
  {
    id: '2',
    title: 'Daydreaming',
    artist: 'Lee',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 360,
  },
  {
    id: '3',
    title: 'A Walk',
    artist: 'Tycho',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 420,
  },
  {
    id: '4',
    title: 'Awake',
    artist: 'Tycho',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 380,
  },
  {
    id: '5',
    title: 'Time',
    artist: 'Hans Zimmer',
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 300,
  },
  {
    id: '6',
    title: 'Night Owl',
    artist: 'Galimatias',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    duration: 340,
  },
  {
    id: '7',
    title: 'Intro',
    artist: 'The xx',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 280,
  },
  {
    id: '8',
    title: 'Cold Air',
    artist: 'Dario Marianelli',
    cover: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    duration: 320,
  },
  {
    id: '9',
    title: 'Sunset Lover',
    artist: 'Petit Biscuit',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    duration: 400,
  },
  {
    id: '10',
    title: 'Luv(sic) Part 3',
    artist: 'Nujabes',
    cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
    duration: 360,
  },
];

const FAVORITE_TRACK_INDEX = 0;

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(FAVORITE_TRACK_INDEX);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(playlist[FAVORITE_TRACK_INDEX].duration);
  const [volume, setVolumeState] = useState(0.6);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  const currentTrack = playlist[currentTrackIndex];

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(currentTrack.url);
    audio.volume = 0;
    audio.loop = false;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Auto-play favorite track on mount with fade in
    const autoPlay = async () => {
      try {
        await audio.play();
        smoothFadeIn(0.6, 1500);
        setIsPlaying(true);
      } catch (error) {
        console.log('Auto-play blocked by browser policy');
      }
    };

    const timer = setTimeout(autoPlay, 800);

    return () => {
      clearTimeout(timer);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
      if (fadeRafRef.current) {
        cancelAnimationFrame(fadeRafRef.current);
      }
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Don't reload if same track
    if (audio.src === currentTrack.url) return;

    audio.src = currentTrack.url;
    audio.load();
    setCurrentTime(0);
    
    if (isPlaying) {
      audio.play().then(() => {
        smoothFadeIn(volume, 800);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  // Smooth fade using requestAnimationFrame for better performance
  const smoothFadeIn = useCallback((targetVolume: number, duration: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
    }

    const startVolume = audio.volume;
    const startTime = performance.now();

    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const newVolume = startVolume + (targetVolume - startVolume) * eased;
      
      if (audio) {
        audio.volume = Math.max(0, Math.min(1, newVolume));
      }

      if (progress < 1) {
        fadeRafRef.current = requestAnimationFrame(fade);
      }
    };

    fadeRafRef.current = requestAnimationFrame(fade);
  }, []);

  const smoothFadeOut = useCallback((callback?: () => void, duration: number = 1000) => {
    const audio = audioRef.current;
    if (!audio) {
      callback?.();
      return;
    }

    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
    }

    const startVolume = audio.volume;
    const startTime = performance.now();

    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in cubic
      const eased = progress * progress * progress;
      const newVolume = startVolume * (1 - eased);
      
      if (audio) {
        audio.volume = Math.max(0, newVolume);
      }

      if (progress < 1) {
        fadeRafRef.current = requestAnimationFrame(fade);
      } else {
        callback?.();
      }
    };

    fadeRafRef.current = requestAnimationFrame(fade);
  }, []);

  // Toggle play/pause - immediate response
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Immediate pause with quick fade
      smoothFadeOut(() => {
        audio.pause();
        setIsPlaying(false);
      }, 300);
    } else {
      // Immediate play
      audio.play().then(() => {
        smoothFadeIn(volume, 500);
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isPlaying, volume, smoothFadeIn, smoothFadeOut]);

  // Next track - immediate response
  const handleNextTrack = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const audio = audioRef.current;
    if (!audio) {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
      isTransitioningRef.current = false;
      return;
    }

    // Quick fade out then switch
    smoothFadeOut(() => {
      audio.pause();
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
      setIsPlaying(true);
      isTransitioningRef.current = false;
    }, 400);
  }, [smoothFadeOut]);

  const nextTrack = useCallback(() => {
    handleNextTrack();
  }, [handleNextTrack]);

  // Previous track - immediate response
  const prevTrack = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const audio = audioRef.current;
    if (!audio) {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      isTransitioningRef.current = false;
      return;
    }

    // Quick fade out then switch
    smoothFadeOut(() => {
      audio.pause();
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      setIsPlaying(true);
      isTransitioningRef.current = false;
    }, 400);
  }, [smoothFadeOut]);

  // Set volume - immediate
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    
    const audio = audioRef.current;
    if (audio && !isTransitioningRef.current) {
      audio.volume = clampedVolume;
    }
  }, []);

  // Seek - immediate
  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const clampedTime = Math.max(0, Math.min(time, duration || audio.duration));
    audio.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  }, [duration]);

  // Toggle player
  const togglePlayer = useCallback(() => {
    setIsPlayerOpen((prev) => !prev);
  }, []);

  // Play specific track - immediate response
  const playTrack = useCallback((trackId: string) => {
    if (isTransitioningRef.current) return;
    
    const trackIndex = playlist.findIndex((t) => t.id === trackId);
    if (trackIndex === -1) return;
    if (trackIndex === currentTrackIndex) {
      // Same track, just toggle play
      if (!isPlaying) {
        togglePlay();
      }
      return;
    }

    isTransitioningRef.current = true;

    const audio = audioRef.current;
    if (!audio) {
      setCurrentTrackIndex(trackIndex);
      setIsPlaying(true);
      isTransitioningRef.current = false;
      return;
    }

    // Fade out and switch
    smoothFadeOut(() => {
      audio.pause();
      setCurrentTrackIndex(trackIndex);
      setIsPlaying(true);
      isTransitioningRef.current = false;
    }, 400);
  }, [currentTrackIndex, isPlaying, togglePlay, smoothFadeOut]);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        volume,
        playlist,
        isPlayerOpen,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        seekTo,
        togglePlayer,
        playTrack,
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
