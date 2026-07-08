import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Music, ChevronDown, Sparkles, Youtube, Disc } from 'lucide-react';

interface Track {
  title: string;
  url: string;
  duration: string;
  type: 'synth' | 'mp3' | 'custom';
}

interface AmbientPlayerProps {
  musicUrl?: string;
}

// Custom Web Audio API Synthesizer to guarantee relaxing audio locally on any device
class AmbientSynth {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private mainGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;

  start(volume: number) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Main Gain Node
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(volume * 0.25, this.ctx.currentTime); // gentle synth volume

      // Lowpass Filter for warm, deep sound
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Low Base Harmonic Drone (perfect major and minor chord frequencies for deep zen relaxation)
      const freqs = [110, 165, 220, 330];
      freqs.forEach((f, idx) => {
        if (!this.ctx || !this.filter) return;
        
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        // Alternate between sine and triangle for a rich, warm timbral blend
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        // Slow organic amplitude modulation per voice
        const voiceVol = 0.05 + (idx * 0.02);
        oscGain.gain.setValueAtTime(voiceVol, this.ctx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(this.filter);
        osc.start();
        
        this.oscillators.push(osc);
        this.gains.push(oscGain);
      });

      // Slow Low Frequency Oscillator (LFO) to modulate filter cutoff frequency, simulating slow deep breathing
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // 10 seconds cycle
      
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(120, this.ctx.currentTime); // +/- 120 Hz depth

      this.lfo.connect(lfoGain);
      if (this.filter.frequency) {
        lfoGain.connect(this.filter.frequency);
      }
      this.lfo.start();

      // Connect Filter -> Main Gain -> Audio Output
      this.filter.connect(this.mainGain);
      this.mainGain.connect(this.ctx.destination);
    } catch (err) {
      console.warn("Failed to boot Ambient Web Audio Synthesizer:", err);
    }
  }

  setVolume(volume: number) {
    if (this.ctx && this.mainGain) {
      // Smoothly transit volume to prevent clicking sounds
      this.mainGain.gain.setTargetAtTime(volume * 0.25, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch (_) {}
    });
    this.oscillators = [];
    this.gains = [];
    
    if (this.lfo) {
      try { this.lfo.stop(); } catch (_) {}
      this.lfo = null;
    }
    
    if (this.ctx) {
      try { this.ctx.close(); } catch (_) {}
      this.ctx = null;
    }
  }
}

// Utility to parse YouTube or Spotify URLs to identify if embeddable
function getEmbedInfo(url: string | undefined) {
  if (!url) return null;
  
  // SPOTIFY
  if (url.includes('spotify.com')) {
    try {
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('/');
      const type = parts[parts.length - 2]; // e.g. playlist, track, album
      const id = parts[parts.length - 1];
      
      if (id && ['playlist', 'track', 'album', 'artist'].includes(type)) {
        return {
          type: 'spotify',
          embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
          title: `Spotify (${type === 'playlist' ? 'Playlist' : 'Música'})`
        };
      } else if (url.includes('/embed/')) {
        return {
          type: 'spotify',
          embedUrl: cleanUrl,
          title: "Playlist Spotify"
        };
      }
    } catch (e) {
      console.warn("Error parsing Spotify URL:", e);
    }
  }
  
  // YOUTUBE
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    try {
      let videoId = '';
      let playlistId = '';
      
      if (url.includes('playlist?list=')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        playlistId = urlParams.get('list') || '';
      } else if (url.includes('watch?v=')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        const parts = url.split('?')[0].split('/');
        videoId = parts[parts.length - 1];
      } else if (url.includes('youtube.com/embed/')) {
        const parts = url.split('?')[0].split('/');
        videoId = parts[parts.length - 1];
      }
      
      if (playlistId) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=0&loop=1&enablejsapi=1`,
          title: "YouTube Playlist",
          id: playlistId
        };
      } else if (videoId) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&enablejsapi=1`,
          title: "YouTube Vídeo",
          id: videoId
        };
      }
    } catch (e) {
      console.warn("Error parsing YouTube URL:", e);
    }
  }
  
  // MP3
  if (url.toLowerCase().endsWith('.mp3') || url.toLowerCase().includes('.mp3?')) {
    return {
      type: 'mp3',
      embedUrl: url,
      title: "Arquivo de Áudio (.mp3)"
    };
  }

  // Any raw audio link
  if (url.startsWith('http')) {
    return {
      type: 'mp3',
      embedUrl: url,
      title: "Rádio Web Relaxante"
    };
  }
  
  return null;
}

export default function AmbientPlayer({ musicUrl }: AmbientPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.3); // 30% gentle volume
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<AmbientSynth | null>(null);

  // Parse custom URL
  const embedInfo = getEmbedInfo(musicUrl);

  const TRACKS: Track[] = [
    ...(embedInfo ? [{
      title: `Personalizado (${embedInfo.title})`,
      url: musicUrl || '',
      duration: 'Seu Link',
      type: 'custom' as const
    }] : []),
    {
      title: "Sintonização Bio-Zen (Garante Som)",
      url: "synth",
      duration: "Sintetizado",
      type: 'synth' as const
    },
    {
      title: "Meditação Reiki Profunda",
      url: "https://archive.org/download/reiki-and-meditation-music/01-Ambient%20Music.mp3",
      duration: "Relaxante",
      type: 'mp3' as const
    },
    {
      title: "Alinhamento de Chacras",
      url: "https://archive.org/download/meditation-music/01.%20Meditation%20Music.mp3",
      duration: "Profundo",
      type: 'mp3' as const
    }
  ];

  // If currentTrackIndex is out of range due to custom track being added/removed, reset
  useEffect(() => {
    if (currentTrackIndex >= TRACKS.length) {
      setCurrentTrackIndex(0);
    }
  }, [musicUrl, TRACKS.length, currentTrackIndex]);

  // Sync state and playback engine
  useEffect(() => {
    const activeTrack = TRACKS[currentTrackIndex];
    if (!activeTrack) return;

    if (isPlaying) {
      if (activeTrack.type === 'synth') {
        // Pause MP3 player if active
        if (audioRef.current) {
          audioRef.current.pause();
        }

        // Start synth if not running, or adjust volume
        if (!synthRef.current) {
          synthRef.current = new AmbientSynth();
          synthRef.current.start(isMuted ? 0 : volume);
        } else {
          synthRef.current.setVolume(isMuted ? 0 : volume);
        }
      } else if (activeTrack.type === 'mp3') {
        // Stop synth if running
        if (synthRef.current) {
          synthRef.current.stop();
          synthRef.current = null;
        }

        // Setup MP3 Audio source
        const trackUrl = activeTrack.url;
        if (!audioRef.current) {
          audioRef.current = new Audio(trackUrl);
          audioRef.current.loop = true;
        } else if (audioRef.current.src !== trackUrl) {
          audioRef.current.pause();
          audioRef.current.src = trackUrl;
        }

        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play()
          .catch((err) => {
            console.log("Audio play blocked. Needs user click:", err);
          });
      } else if (activeTrack.type === 'custom') {
        // Stop both synth and standard mp3 if a custom YouTube/Spotify iframe embed is running
        if (synthRef.current) {
          synthRef.current.stop();
          synthRef.current = null;
        }
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    } else {
      // Pause MP3
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Stop Synth
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    }
  }, [isPlaying, currentTrackIndex, volume, isMuted, musicUrl]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Soft autoplay check on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Autoplay the local synthesizer or custom track as a default friendly option
      setIsPlaying(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const activeTrack = TRACKS[currentTrackIndex];
  const isCustomEmbed = activeTrack?.type === 'custom' && embedInfo && (embedInfo.type === 'youtube' || embedInfo.type === 'spotify');

  return (
    <div id="ambient-music-player-widget" className="fixed bottom-6 right-6 z-40 font-sans">
      <AnimatePresence>
        {isExpanded ? (
          /* EXPANDED PLAYER WIDGET */
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-80 bg-[#1c120c] border-2 border-[#d4af37]/50 rounded-2xl p-4 shadow-2xl shadow-black/80 flex flex-col gap-3.5 text-left"
          >
            {/* Header of Player */}
            <div className="flex items-center justify-between border-b border-[#3e2719] pb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Music className={`w-4 h-4 text-[#d4af37] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                  {isPlaying && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2d9e6b] rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#d4af37] tracking-wider uppercase">Sinfonia Zen</h4>
                  <span className="text-[9px] text-[#a08e82] block">Música de Fundo Personalizada</span>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-[#2d1e16] rounded text-[#a08e82] hover:text-[#d4af37] transition-colors cursor-pointer"
                title="Minimizar Player"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* DYNAMIC PLAYER VIEWER */}
            {isCustomEmbed ? (
              /* IFRAME EMBED (SPOTIFY OR YOUTUBE) */
              <div className="space-y-2">
                <span className="text-[9px] text-[#a08e82] block uppercase tracking-wider font-bold">Canal Clínico Integrado:</span>
                {embedInfo?.type === 'spotify' ? (
                  <iframe 
                    src={embedInfo.embedUrl} 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowFullScreen={false} 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    className="rounded-xl border border-[#3e2719] bg-black/40"
                  />
                ) : (
                  <iframe 
                    src={embedInfo?.embedUrl}
                    width="100%" 
                    height="152" 
                    title="YouTube Zen Audio"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="rounded-xl border border-[#3e2719] bg-black/40"
                  />
                )}
                <span className="text-[9px] text-[#a08e82]/80 block leading-tight text-center">
                  {embedInfo?.type === 'spotify' 
                    ? "Clique no botão Play verde acima para sintonizar a playlist de música do Spotify!"
                    : "Assista as imagens relaxantes e escute o som direto do YouTube!"}
                </span>
              </div>
            ) : (
              /* NATIVE CONTROLS FOR MP3 & SYNTHESIZER */
              <div className="space-y-3.5">
                <div className="bg-black/40 rounded-xl p-3 border border-[#3e2719]/40 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#a08e82] block">Canal Ativo:</span>
                    <span className="text-xs font-semibold text-[#f7efe9] block truncate mt-0.5">{activeTrack?.title}</span>
                  </div>
                  
                  {/* Audio Equalizer Waveforms */}
                  {isPlaying ? (
                    <div className="flex items-end gap-0.5 h-6 w-8 shrink-0 pb-1 justify-end">
                      <span className="w-1 bg-[#d4af37] animate-bounce h-2" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
                      <span className="w-1 bg-[#d4af37] animate-bounce h-4" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }} />
                      <span className="w-1 bg-[#d4af37] animate-bounce h-3" style={{ animationDelay: '0.5s', animationDuration: '0.9s' }} />
                      <span className="w-1 bg-[#d4af37] animate-bounce h-5" style={{ animationDelay: '0.2s', animationDuration: '1.1s' }} />
                    </div>
                  ) : (
                    <div className="flex items-end gap-0.5 h-6 w-8 shrink-0 pb-1 justify-end opacity-40">
                      <span className="w-1 bg-[#a08e82] h-1" />
                      <span className="w-1 bg-[#a08e82] h-1" />
                      <span className="w-1 bg-[#a08e82] h-1" />
                      <span className="w-1 bg-[#a08e82] h-1" />
                    </div>
                  )}
                </div>

                {/* Controls (Play/Pause, Mute, Volume) */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                      isPlaying 
                        ? 'bg-[#1b4332] border-[#2d9e6b]/40 text-[#2d9e6b] hover:bg-[#153527]' 
                        : 'bg-[#d4af37] border-[#d4af37] text-[#1c120c] hover:bg-[#b3912b]'
                    }`}
                    title={isPlaying ? 'Pausar' : 'Iniciar'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="flex-1 flex items-center gap-2 bg-[#2d1e16] p-2 rounded-xl border border-[#3e2719]">
                    <button
                      onClick={handleMuteToggle}
                      className="text-[#a08e82] hover:text-[#d4af37] transition-colors cursor-pointer"
                      title={isMuted ? 'Ativar som' : 'Desativar som'}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-full accent-[#d4af37] bg-[#1c120c] h-1 rounded-lg cursor-pointer"
                      title="Volume"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Playlist Track Selectors */}
            <div className="space-y-1.5 pt-1 border-t border-[#3e2719]/50">
              <span className="text-[9px] text-[#a08e82] font-bold uppercase tracking-wider block">Estações de Relaxamento</span>
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                {TRACKS.map((track, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTrackChange(idx)}
                    className={`text-left text-xs p-1.5 rounded transition-all flex items-center justify-between cursor-pointer ${
                      currentTrackIndex === idx
                        ? 'bg-[#1b4332]/30 border border-[#d4af37]/30 text-[#d4af37]'
                        : 'hover:bg-[#2d1e16] text-[#a08e82] hover:text-[#f7efe9] border border-transparent'
                    }`}
                  >
                    <span className="truncate flex-1 font-medium">{track.title}</span>
                    <span className="text-[9px] opacity-80 ml-1.5 italic font-mono shrink-0">{track.duration}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <p className="text-[9px] text-center text-[#a08e82]/60 italic">
              Seu refúgio mental está ativo. Sinta a paz interior.
            </p>
          </motion.div>
        ) : (
          /* COLLAPSED FLOAT BUTTON WIDGET */
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsExpanded(true)}
            className={`flex items-center gap-2 p-3 rounded-full shadow-2xl border-2 cursor-pointer transition-all ${
              isPlaying
                ? 'bg-[#1b4332] border-[#d4af37] text-[#d4af37] shadow-[#1b4332]/40 animate-pulse'
                : 'bg-[#1c120c] border-[#d4af37]/60 text-[#a08e82] hover:text-[#d4af37] hover:border-[#d4af37] shadow-black/80'
            }`}
            title="Sinfonia Zen - Música de Fundo"
            style={{ animationDuration: isPlaying ? '3s' : '0s' }}
          >
            {/* Visual Equalizer dots when collapsed & playing */}
            {isPlaying && !isCustomEmbed ? (
              <div className="flex items-center gap-0.5 h-4 shrink-0 px-1">
                <span className="w-0.5 h-2 bg-[#d4af37] animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                <span className="w-0.5 h-3 bg-[#d4af37] animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.9s' }} />
                <span className="w-0.5 h-1.5 bg-[#d4af37] animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }} />
              </div>
            ) : isPlaying && isCustomEmbed ? (
              <div className="relative flex items-center justify-center">
                <Disc className="w-4 h-4 text-[#d4af37] animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            ) : (
              <Music className="w-4 h-4 shrink-0" />
            )}

            <span className="text-xs font-bold tracking-wide pr-1">
              {isCustomEmbed ? 'Música Ativa' : 'Música Ambiente'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
