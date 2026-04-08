import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '@/context/MusicContext';
import { trackCoverSrc, type MusicTrack } from '@/data/musicPlaylist';
import { useTranslation } from 'react-i18next';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX,
  ChevronDown, ListMusic, Heart
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function albumArtKey(track: MusicTrack) {
  return `${track.id}-${track.imageName ?? ''}`;
}

function AlbumArt({ track, variant }: { track: MusicTrack; variant: 'chip' | 'hero' | 'row' }) {
  const [imgError, setImgError] = useState(false);
  const coverSrc = trackCoverSrc(track);
  const usePlaceholder = !coverSrc || imgError;

  const sizing =
    variant === 'chip'
      ? 'h-9 w-9 sm:h-10 sm:w-10 rounded-full text-sm sm:text-base'
      : variant === 'hero'
        ? 'h-40 w-40 sm:h-52 sm:w-52 rounded-full text-4xl sm:text-5xl'
        : 'h-11 w-11 shrink-0 rounded-xl text-base sm:h-12 sm:w-12 sm:text-lg';
  const hue2 = (track.coverHue + 52) % 360;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ring-1 ring-border/40 ${sizing} ${usePlaceholder ? '' : 'bg-muted'}`}
      style={
        usePlaceholder
          ? {
              backgroundImage: `linear-gradient(145deg, hsl(${track.coverHue} 72% 42%), hsl(${hue2} 58% 30%))`,
            }
          : undefined
      }
      aria-hidden={usePlaceholder}
    >
      {coverSrc && !imgError ? (
        <img
          src={coverSrc}
          alt=""
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setImgError(true)}
        />
      ) : null}

      {usePlaceholder ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.38),transparent_52%)] opacity-90" />
          {(variant === 'chip' || variant === 'hero') && (
            <div
              className="pointer-events-none absolute inset-0 z-[2] opacity-[0.2]"
              style={{
                background: `repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)`,
              }}
            />
          )}
          <span className="relative z-[3] font-bold tracking-tight text-white drop-shadow-md select-none">
            {track.title.trim().charAt(0).toUpperCase() || '♪'}
          </span>
        </>
      ) : null}
    </div>
  );
}

// Mini Vinyl Button Component
function MiniVinylButton({ onClick }: { onClick: () => void }) {
  const { isPlaying, currentTrack } = useMusic();
  const { t } = useTranslation();

  return (
    <motion.button
      onClick={onClick}
      className="relative group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={t('music.playerTitle')}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: isPlaying 
            ? 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))'
            : 'none',
          filter: 'blur(8px)',
          opacity: isPlaying ? 0.6 : 0,
        }}
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
      />

      {/* Vinyl Container */}
      <motion.div
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-lg border-2 border-white/10"
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={{ 
          duration: 3, 
          repeat: isPlaying ? Infinity : 0, 
          ease: 'linear',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <AlbumArt key={albumArtKey(currentTrack)} track={currentTrack} variant="chip" />
        </div>

        {/* Vinyl Grooves Overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `
              repeating-radial-gradient(
                circle at center,
                transparent 0px,
                transparent 1px,
                rgba(0,0,0,0.15) 1px,
                rgba(0,0,0,0.15) 2px
              )
            `,
          }}
        />
      </motion.div>

      {/* Playing Indicator Dot */}
      {isPlaying && (
        <motion.span 
          className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border-2 border-background"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
        </motion.span>
      )}

      {/* Tooltip */}
      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {isPlaying ? `${currentTrack.title} — ${currentTrack.artist}` : t('music.playerTitle')}
      </span>
    </motion.button>
  );
}

// Modal Component using Portal
function MusicModal({ onClose }: { onClose: () => void }) {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    playlist,
    trackMetaDurations,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    seekTo,
    playTrack,
    requiresUserGesture,
    resumeAudio,
    prefetchTrackMedia,
  } = useMusic();
  const { t } = useTranslation();

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Prevent scroll propagation in playlist
  useEffect(() => {
    const playlistEl = playlistRef.current;
    if (!playlistEl) return;

    const preventScroll = (e: WheelEvent) => {
      e.stopPropagation();
    };

    playlistEl.addEventListener('wheel', preventScroll, { passive: false });
    return () => {
      playlistEl.removeEventListener('wheel', preventScroll);
    };
  }, [showPlaylist]);

  useEffect(() => {
    for (const t of playlist) {
      prefetchTrackMedia(t.id);
    }
  }, [playlist, prefetchTrackMedia]);

  // Handle progress bar click/drag
  const effectiveDuration =
    duration > 0 ? duration : (trackMetaDurations[currentTrack.id] ?? currentTrack.duration);

  const handleProgressStart = useCallback((clientX: number) => {
    if (!progressRef.current || !effectiveDuration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(percent * effectiveDuration);
  }, [effectiveDuration, seekTo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressStart(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleProgressStart(e.clientX);
  }, [isDragging, handleProgressStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle volume
  const handleVolumeClick = useCallback((clientX: number) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(percent);
  }, [setVolume]);

  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleVolumeClick(e.clientX);
    
    const handleMove = (moveEvent: MouseEvent) => {
      handleVolumeClick(moveEvent.clientX);
    };
    
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // Handle track selection with immediate response
  const handleTrackSelect = (trackId: string) => {
    playTrack(trackId);
  };

  const prefetchNeighborOnHover = useCallback(
    (delta: -1 | 1) => {
      const i = playlist.findIndex((t) => t.id === currentTrack.id);
      if (i === -1) return;
      const n = playlist.length;
      const j = (i + delta + n) % n;
      prefetchTrackMedia(playlist[j].id);
    },
    [playlist, currentTrack.id, prefetchTrackMedia],
  );

  const handleEnableAudioClick = useCallback(async () => {
    await resumeAudio();
    if (!isPlaying) {
      togglePlay();
    }
  }, [isPlaying, resumeAudio, togglePlay]);

  // Toggle mute
  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.5);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="music-modal-overlay"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div 
        className="music-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className="music-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
                         radial-gradient(ellipse at 70% 80%, hsl(var(--accent) / 0.2) 0%, transparent 50%)`,
          }}
        />

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-foreground hover:bg-foreground/10 transition-colors z-20"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.button>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative shrink-0 p-6 sm:p-8">
          {/* Large Vinyl Record */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))',
                  filter: 'blur(18px)',
                  opacity: isPlaying ? 0.35 : 0.12,
                }}
                animate={isPlaying ? { rotate: 360, scale: [1, 1.05, 1] } : { rotate: 0, scale: 1 }}
                transition={{
                  rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              />

              {/* Vinyl */}
              <motion.div
                className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full shadow-2xl sm:h-52 sm:w-52"
                style={{
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
                }}
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={{
                  duration: 4,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'linear',
                }}
              >
                <AlbumArt key={albumArtKey(currentTrack)} track={currentTrack} variant="hero" />

                {/* Vinyl Grooves */}
                <div 
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background: `
                      repeating-radial-gradient(
                        circle at center,
                        transparent 0px,
                        transparent 2px,
                        rgba(0,0,0,0.1) 2px,
                        rgba(0,0,0,0.1) 3px
                      )
                    `,
                  }}
                />
              </motion.div>

              {/* Tone Arm */}
              <motion.div
                className="absolute -top-2 -right-3 sm:-top-2 sm:-right-4 w-16 sm:w-20 h-1 sm:h-1.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full origin-left shadow-lg"
                style={{ transformOrigin: '0% 50%' }}
                animate={{ rotate: isPlaying ? 30 : 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-600 shadow-md" />
              </motion.div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-5 sm:mb-6">
            <motion.h3
              key={currentTrack.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 truncate px-4"
            >
              {currentTrack.title}
            </motion.h3>
            <motion.p
              key={currentTrack.artist}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-muted-foreground text-sm sm:text-base"
            >
              {currentTrack.artist}
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div className="mb-5 sm:mb-6">
            <div
              ref={progressRef}
              onMouseDown={handleMouseDown}
              className="h-2 bg-foreground/10 rounded-full cursor-pointer overflow-hidden group relative"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-foreground/5 rounded-full" />
              
              {/* Progress */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
              />
              
              {/* Hover Handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-5 sm:mb-6">
            {/* Previous */}
            <motion.button
              onClick={prevTrack}
              onPointerEnter={() => prefetchNeighborOnHover(-1)}
              className="p-2.5 sm:p-3 rounded-full text-foreground hover:bg-foreground/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              onClick={togglePlay}
              className="p-4 sm:p-5 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-xl"
              style={{
                boxShadow: '0 10px 40px hsl(var(--primary) / 0.4)',
              }}
              whileHover={{ scale: 1.1, boxShadow: '0 15px 50px hsl(var(--primary) / 0.5)' }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />
              )}
            </motion.button>

            {/* Next */}
            <motion.button
              onClick={nextTrack}
              onPointerEnter={() => prefetchNeighborOnHover(1)}
              className="p-2.5 sm:p-3 rounded-full text-foreground hover:bg-foreground/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Volume */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <motion.button
                onClick={toggleMute}
                className="p-2 rounded-full text-foreground hover:bg-foreground/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.button>
              
              {/* Custom Volume Bar */}
              <div 
                ref={volumeRef}
                onMouseDown={handleVolumeMouseDown}
                className="flex-1 h-2 bg-foreground/10 rounded-full cursor-pointer overflow-hidden relative"
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/50 to-primary"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <motion.button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'text-red-500 bg-red-500/10' : 'text-foreground hover:bg-foreground/10'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>

              <motion.button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-2 rounded-full transition-colors ${
                  showPlaylist ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-foreground/10'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Playlist Panel */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="relative flex min-h-0 max-h-[min(44vh,400px)] flex-col border-t border-border/80 bg-muted/35"
            >
              <div
                ref={playlistRef}
                className="music-playlist-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-0 sm:px-4"
              >
                <div className="sticky top-0 z-20 -mx-1 mb-2 border-b border-border/80 bg-gradient-to-b from-background/95 via-background/88 to-transparent px-1 py-2.5 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {t('music.playlist')}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/85">
                    {t('music.trackCount', { count: playlist.length })}
                  </p>
                </div>

                <ul className="flex flex-col gap-1" role="list">
                  {playlist.map((track, index) => {
                    const isCurrentTrack = currentTrack.id === track.id;
                    return (
                      <li key={track.id}>
                        <motion.button
                          type="button"
                          onClick={() => handleTrackSelect(track.id)}
                          onPointerEnter={() => prefetchTrackMedia(track.id)}
                          onFocus={() => prefetchTrackMedia(track.id)}
                          className={`grid w-full grid-cols-[1.75rem_2.75rem_1fr_auto] items-center gap-x-3 rounded-xl px-2 py-2 text-left transition-colors sm:grid-cols-[2rem_3rem_1fr_auto] sm:px-2.5 sm:py-2.5 ${
                            isCurrentTrack
                              ? 'bg-primary/18 ring-1 ring-primary/35'
                              : 'hover:bg-foreground/[0.06]'
                          }`}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex h-full w-7 justify-center sm:w-8">
                            {isCurrentTrack && isPlaying ? (
                              <div className="flex h-9 items-end gap-0.5">
                                {[0, 1, 2].map((i) => (
                                  <motion.span
                                    key={i}
                                    className="w-0.5 rounded-full bg-primary sm:w-1"
                                    animate={{ height: [4, 14, 4] }}
                                    transition={{
                                      duration: 0.45,
                                      repeat: Infinity,
                                      delay: i * 0.12,
                                      ease: 'easeInOut',
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span
                                className={`self-center text-xs tabular-nums sm:text-sm ${
                                  isCurrentTrack ? 'font-semibold text-primary' : 'text-muted-foreground'
                                }`}
                              >
                                {index + 1}
                              </span>
                            )}
                          </div>

                          <div
                            className={`flex justify-center ${
                              isCurrentTrack && isPlaying ? 'ring-2 ring-primary/80 ring-offset-2 ring-offset-background' : ''
                            } rounded-xl`}
                          >
                            <AlbumArt key={albumArtKey(track)} track={track} variant="row" />
                          </div>

                          <div className="min-w-0 pr-1">
                            <p
                              className={`truncate text-sm font-medium leading-tight ${
                                isCurrentTrack ? 'text-primary' : 'text-foreground'
                              }`}
                            >
                              {track.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                          </div>

                          <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground sm:text-xs">
                            {formatTime(trackMetaDurations[track.id] ?? track.duration)}
                          </span>
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {requiresUserGesture && (
          <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
            <motion.button
              type="button"
              onClick={() => void handleEnableAudioClick()}
              className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-lg sm:text-sm"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {t('music.enableAudio')}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function MusicPlayer() {
  const { isPlayerOpen, togglePlayer } = useMusic();

  return (
    <>
      {/* Mini Vinyl Button */}
      <MiniVinylButton onClick={togglePlayer} />

      {/* Full Player Modal - Using Portal */}
      <AnimatePresence>
        {isPlayerOpen && <MusicModal onClose={togglePlayer} />}
      </AnimatePresence>
    </>
  );
}
