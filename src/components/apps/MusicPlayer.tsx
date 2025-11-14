'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, Shuffle, Repeat, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { type Track } from '@/lib/music-data';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface MusicPlayerProps {
  playlist: Track[];
  addTrack: (track: Omit<Track, 'id'>) => void;
}

export default function MusicPlayer({ playlist, addTrack }: MusicPlayerProps) {
  const { toast } = useToast();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCoverArt, setNewCoverArt] = useState('');

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
  }, [isPlaying, currentTrackIndex, playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // If the playlist changes and the current track is no longer valid, reset.
    if (currentTrackIndex >= playlist.length) {
      setCurrentTrackIndex(0);
      setIsPlaying(false);
    }
  }, [playlist, currentTrackIndex]);

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
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
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

  const handleAddSong = () => {
    if (!newTitle || !newArtist || !newUrl || !newCoverArt) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please fill out all fields to add the song.",
        });
        return;
    }
    addTrack({
        title: newTitle,
        artist: newArtist,
        url: newUrl,
        coverArt: newCoverArt,
    });
    toast({
        title: "Song Added!",
        description: `"${newTitle}" by ${newArtist} has been added to the playlist.`,
    });
    // Reset form and close dialog
    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setNewCoverArt('');
    setIsAddSongOpen(false);
  };

  if (!playlist || playlist.length === 0) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900/50 text-white rounded-b-lg overflow-hidden">
            <h2 className="text-2xl font-bold mb-4">No songs in playlist</h2>
            <Button onClick={() => setIsAddSongOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add a Song
            </Button>
            <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Add a New Song</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Song Title" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="artist">Artist</Label>
                            <Input id="artist" value={newArtist} onChange={(e) => setNewArtist(e.target.value)} placeholder="Artist Name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">Song URL (.mp3)</Label>
                            <Input id="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://example.com/song.mp3" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coverArt">Cover Art URL</Label>
                            <Input id="coverArt" value={newCoverArt} onChange={(e) => setNewCoverArt(e.target.value)} placeholder="https://example.com/cover.jpg" />
                        </div>
                    </div>
                    <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddSongOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddSong}>Add Song</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
  }


  return (
    <>
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-purple-900/50 text-white rounded-b-lg overflow-hidden">
        <audio
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            onEnded={handleTrackEnd}
            key={currentTrack.id}
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
            
            <div className="w-64 h-64 md:w-80 md:h-80 relative z-10 shadow-2xl rounded-2xl overflow-hidden border-4 border-white/10">
                <Image
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    fill
                    className="object-cover"
                />
            </div>
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
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
                        <ListMusic />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white" onClick={() => setIsAddSongOpen(true)}>
                        <Plus />
                    </Button>
                </div>
            </div>
        </div>
    </div>
    <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Add a New Song</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Song Title" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="artist">Artist</Label>
                    <Input id="artist" value={newArtist} onChange={(e) => setNewArtist(e.target.value)} placeholder="Artist Name" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="url">Song URL (.mp3)</Label>
                    <Input id="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://example.com/song.mp3" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="coverArt">Cover Art URL</Label>
                    <Input id="coverArt" value={newCoverArt} onChange={(e) => setNewCoverArt(e.target.value)} placeholder="https://example.com/cover.jpg" />
                </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSongOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSong}>Add Song</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
