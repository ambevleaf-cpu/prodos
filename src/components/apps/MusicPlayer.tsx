'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, Shuffle, Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { playlist, type Track } from '@/lib/music-data';
import { cn } from '@/lib/utils';

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(error => console.error("Audio play failed:", error));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setProgress(audio.currentTime);
      setDuration(audio.duration);
    }
  };

  const handleTrackEnd = () => {
    if (isRepeat) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    } else {
      handleNext();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };
  
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-purple-900/50 text-white rounded-b-lg overflow-hidden">
        <audio
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            onEnded={handleTrackEnd}
        />
        
        {/* Album Art & Info */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
            <div className="absolute inset-0 z-0">
                <Image
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    fill
                    className="object-cover opacity-20 blur-2xl"
                />
            </div>
            
            <Card className="w-64 h-64 md:w-80 md:h-80 relative z-10 shadow-2xl rounded-2xl overflow-hidden border-4 border-white/10">
                <Image
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    fill
                    className="object-cover"
                />
            </Card>
            <h2 className="text-3xl font-bold mt-8 z-10">{currentTrack.title}</h2>
            <p className="text-purple-300 z-10">{currentTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="bg-black/30 backdrop-blur-xl p-6 rounded-t-3xl">
            {/* Progress Bar */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-xs w-12 text-center">{formatTime(progress)}</span>
                <Slider
                    value={[progress]}
                    max={duration || 1}
                    onValueChange={handleSeek}
                    className="flex-1"
                />
                <span className="text-xs w-12 text-center">{formatTime(duration)}</span>
            </div>

            {/* Main Controls */}
            <div className="flex justify-center items-center gap-6 mb-4">
                 <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white" onClick={() => setIsShuffle(!isShuffle)}>
                    <Shuffle className={cn(isShuffle && "text-green-400")} />
                </Button>
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white" onClick={handlePrev}>
                    <SkipBack size={28} />
                </Button>
                <Button onClick={togglePlayPause} className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/50">
                    {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white" onClick={handleNext}>
                    <SkipForward size={28} />
                </Button>
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white" onClick={() => setIsRepeat(!isRepeat)}>
                    <Repeat className={cn(isRepeat && "text-green-400")} />
                </Button>
            </div>
            
            {/* Volume & Playlist */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 w-1/3">
                    <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white" onClick={() => setVolume(v => v > 0 ? 0 : 0.75)}>
                        {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </Button>
                    <Slider
                        value={[volume]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => setVolume(value[0])}
                    />
                </div>
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
                    <ListMusic />
                </Button>
            </div>
        </div>
    </div>
  );
}

    