import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '@/context/MusicContext';
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

// Mini Vinyl Button Component
function MiniVinylButton({ onClick }: { onClick: () => void }) {
  const { isPlaying, currentTrack } = useMusic();

  return (
    <motion.button
      onClick={onClick}
      className="relative group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Music Player"
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
        {/* Album Cover */}
        <img
          src={currentTrack.cover}
          alt={currentTrack.title}
          className="w-full h-full object-cover"
        />

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

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-black" />
          </div>
        </div>
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
        {isPlaying ? `${currentTrack.title} - ${currentTrack.artist}` : 'Music Player'}
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
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    seekTo,
    playTrack,
  } = useMusic();

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

  // Handle progress bar click/drag
  const handleProgressStart = useCallback((clientX: number) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(percent * duration);
  }, [duration, seekTo]);

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
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.button>

        <div className="relative p-6 sm:p-8 z-10">
          {/* Large Vinyl Record */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))',
                  filter: 'blur(30px)',
                  opacity: isPlaying ? 0.5 : 0.2,
                }}
                animate={isPlaying ? { rotate: 360, scale: [1, 1.05, 1] } : { rotate: 0, scale: 1 }}
                transition={{
                  rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              />

              {/* Vinyl */}
              <motion.div
                className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden shadow-2xl"
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
                {/* Album Cover */}
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />

                {/* Vinyl Grooves */}
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none"
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

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black" />
                  </div>
                </div>
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
              className="h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden group relative"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-white/5 rounded-full" />
              
              {/* Progress */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${(currentTime / duration) * 100}%`,
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
              />
              
              {/* Hover Handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-5 sm:mb-6">
            {/* Previous */}
            <motion.button
              onClick={prevTrack}
              className="p-2.5 sm:p-3 rounded-full hover:bg-white/10 transition-colors"
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
              className="p-2.5 sm:p-3 rounded-full hover:bg-white/10 transition-colors"
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
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
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
                className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden relative"
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
                  isLiked ? 'text-red-500 bg-red-500/10' : 'hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>

              <motion.button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-2 rounded-full transition-colors ${
                  showPlaylist ? 'bg-primary/20 text-primary' : 'hover:bg-white/10'
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
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 240, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="relative border-t border-white/10 overflow-hidden"
            >
              <div 
                ref={playlistRef}
                className="h-full overflow-y-auto p-4 custom-scrollbar"
                style={{ 
                  overscrollBehavior: 'contain',
                  scrollbarWidth: 'thin',
                }}
              >
                <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider sticky top-0 bg-inherit pb-2">
                  Playlist ({playlist.length} tracks)
                </h4>
                <div className="space-y-1">
                  {playlist.map((track, index) => {
                    const isCurrentTrack = currentTrack.id === track.id;
                    return (
                      <motion.button
                        key={track.id}
                        onClick={() => handleTrackSelect(track.id)}
                        className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all text-left ${
                          isCurrentTrack
                            ? 'bg-primary/20 border border-primary/30'
                            : 'hover:bg-white/5'
                        }`}
                        whileHover={{ x: 5, backgroundColor: isCurrentTrack ? '' : 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {/* Track Number / Playing Indicator */}
                        <div className="w-5 sm:w-6 flex justify-center flex-shrink-0">
                          {isCurrentTrack && isPlaying ? (
                            <div className="flex gap-0.5 items-end h-3 sm:h-4">
                              {[1, 2, 3].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-0.5 sm:w-1 bg-primary rounded-full"
                                  animate={{
                                    height: [3, 12, 3],
                                  }}
                                  transition={{
                                    duration: 0.4,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                    ease: 'easeInOut',
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className={`text-xs sm:text-sm ${isCurrentTrack ? 'text-primary' : 'text-muted-foreground'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Track Cover */}
                        <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 ${
                          isCurrentTrack && isPlaying ? 'ring-2 ring-primary' : ''
                        }`}>
                          <img
                            src={track.cover}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-xs sm:text-sm truncate ${
                            isCurrentTrack ? 'text-primary' : ''
                          }`}>
                            {track.title}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {track.artist}
                          </p>
                        </div>

                        {/* Duration */}
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                          {formatTime(track.duration)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
