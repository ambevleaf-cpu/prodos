'use client';

import React, { useState } from 'react';
import { X, Heart, Share2, Download, Trash2, MoreVertical, Grid3x3, Image as ImageIcon, Video, Calendar, Star, Search, Plus, Camera } from 'lucide-react';
import { type GalleryPhoto } from '@/lib/gallery-data';
import NextImage from 'next/image';
import { APPS_CONFIG } from '@/lib/apps.config';
import { useToast } from '@/hooks/use-toast';

interface GalleryProps {
  openApp?: (appId: string) => void;
  photos: GalleryPhoto[];
  onDeletePhoto: (photoId: string) => void;
}

export default function Gallery({ openApp, photos, onDeletePhoto }: GalleryProps) {
  const { toast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['2', '5']);
  const [view, setView] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };
  
  const handleOpenCamera = () => {
    if (openApp) {
      const cameraApp = APPS_CONFIG.find(app => app.id === 'camera');
      if (cameraApp) {
        openApp(cameraApp.id);
      }
    }
  };

  const handleShare = async () => {
    if (!selectedPhoto) return;
    try {
      await navigator.clipboard.writeText(selectedPhoto.url);
      toast({
        title: "Link Copied!",
        description: "The photo URL has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy the link to your clipboard.",
      });
    }
  };

  const handleDelete = () => {
    if (!selectedPhoto) return;
    onDeletePhoto(selectedPhoto.id);
    setSelectedPhoto(null);
    toast({
      title: "Photo Deleted",
      description: "The photo has been removed from your gallery.",
    });
  };

  const filteredPhotos = photos.filter(p => {
    if (view === 'all') return true;
    if (view === 'photos') return p.type === 'photo';
    if (view === 'videos') return p.type === 'video';
    if (view === 'favorites') return favorites.includes(p.id);
    if (view === 'recent') {
        const today = new Date();
        const photoDate = new Date(p.date);
        const diffTime = Math.abs(today.getTime() - photoDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }
    return true;
  });

  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    const photoDate = new Date(photo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[photoDate]) acc[photoDate] = [];
    acc[photoDate].push(photo);
    return acc;
  }, {} as Record<string, GalleryPhoto[]>);

  const sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());


  return (
    <div className="w-full h-full bg-black text-white flex flex-col rounded-b-lg overflow-hidden">
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in-0">
          <div className="relative w-full h-full">
            <NextImage 
              src={selectedPhoto.url} 
              alt="Selected"
              fill
              className="object-contain"
              data-ai-hint={selectedPhoto.hint}
            />
          
            <div className="absolute top-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-3 rounded-full text-white bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
                <button className="p-3 rounded-full text-white bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors">
                  <MoreVertical size={24} />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
              <div className="flex justify-center items-center gap-8">
                <button
                  onClick={() => toggleFavorite(selectedPhoto.id)}
                  className={`p-5 rounded-full text-white transition-colors duration-300 ${favorites.includes(selectedPhoto.id) ? 'bg-pink-500' : 'bg-white/10 backdrop-blur-xl hover:bg-white/20'}`}
                >
                  <Heart size={28} fill={favorites.includes(selectedPhoto.id) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare} className="p-5 rounded-full text-white bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors">
                  <Share2 size={28} />
                </button>
                <button className="p-5 rounded-full text-white bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors">
                  <Download size={28} />
                </button>
                <button onClick={handleDelete} className="p-5 rounded-full text-white bg-red-600/80 backdrop-blur-xl hover:bg-red-500 transition-colors">
                  <Trash2 size={28} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="p-4 pt-6 bg-black/60 backdrop-blur-xl border-b border-white/10 z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Gallery</h1>
              <p className="text-gray-400 text-xs mt-1">{photos.length} photos & videos</p>
            </div>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-3 rounded-2xl text-white bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>

          {searchOpen && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search photos..."
                className="w-full px-4 py-3 rounded-xl text-white bg-white/10 backdrop-blur-xl border border-white/20 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {[
              { id: 'all', icon: Grid3x3, label: 'All' },
              { id: 'photos', icon: ImageIcon, label: 'Photos' },
              { id: 'videos', icon: Video, label: 'Videos' },
              { id: 'favorites', icon: Star, label: 'Favorites' },
              { id: 'recent', icon: Calendar, label: 'Recent' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-colors duration-300 ${
                  view === id ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center h-full">
              <div className="mb-6">
                <Camera size={60} className="mx-auto text-white/20" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Photos Yet</h2>
              <p className="text-gray-400 mb-6">Start capturing moments to see them here</p>
              <button
                onClick={handleOpenCamera}
                className="px-6 py-3 rounded-full text-white font-semibold bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_8px_30px_rgba(168,85,247,0.4)]"
              >
                Take a Photo
              </button>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="mb-6">
                <h2 className="text-white text-md font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-purple-400" />
                  {date}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {groupedPhotos[date].map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="relative rounded-lg overflow-hidden group"
                      style={{ aspectRatio: '1/1' }}
                    >
                      <NextImage
                        src={photo.url}
                        alt={`Photo ${photo.id}`}
                        fill
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={photo.hint}
                      />

                      {photo.type === 'video' && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50 backdrop-blur-sm">
                          <Video size={14} className="text-white" />
                        </div>
                      )}

                      {favorites.includes(photo.id) && (
                        <div className="absolute top-2 left-2">
                          <Heart size={16} className="text-pink-500 drop-shadow-lg" fill="currentColor" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
           <button 
            onClick={handleOpenCamera}
            className="fixed bottom-12 right-12 p-4 rounded-full text-white bg-purple-600 shadow-[0_10px_40px_rgba(168,85,247,0.5)] hover:bg-purple-500 transition-all hover:scale-110"
          >
            <Plus size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
