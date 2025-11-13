'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCw, Settings, X, Image as ImageIcon, Zap, ZapOff, Download, Share2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CameraAppProps {
  onCapture: (photoDataUrl: string) => void;
  openApp?: (appId: string) => void;
}

export default function CameraApp({ onCapture, openApp }: CameraAppProps) {
  const { toast } = useToast();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState('user');
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [mode, setMode] = useState('photo');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false
        });
        
        setStream(mediaStream);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };
    
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, toast]);

  const capturePhoto = () => {
    if (!hasCameraPermission) {
        toast({ variant: 'destructive', title: 'Cannot capture photo', description: 'Camera permission is not granted.' });
        return;
    }
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
            ctx.translate(video.videoWidth, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        if (facingMode === 'user') {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
      const imageData = canvas.toDataURL('image/png');
      
      setTimeout(() => {
        setPhoto(imageData);
        setCapturing(false);
        if(onCapture) {
          onCapture(imageData);
          toast({
            title: "Photo Captured!",
            description: "Saved to gallery.",
          });
        }
      }, 200);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const closePhoto = () => {
    setPhoto(null);
  };
  
  const handleOpenGallery = () => {
    if(openApp) {
        openApp('gallery');
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden rounded-b-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 animate-pulse" style={{ animationDuration: '4s' }} />
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
      />
      
      <canvas ref={canvasRef} className="hidden" />

      {capturing && (
        <div className="absolute inset-0 z-40 bg-white animate-pulse" style={{ animationDuration: '200ms' }} />
      )}
      
      {!hasCameraPermission && hasCameraPermission !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20 p-4">
              <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                      Please allow camera access in your browser to use this app. You may need to refresh the page after granting permission.
                  </AlertDescription>
              </Alert>
          </div>
      )}

      {photo && (
        <div className="absolute inset-0 z-50 bg-black animate-fadeIn">
          <img src={photo} alt="Captured" className="w-full h-full object-contain" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex justify-center items-center gap-6">
              <button
                onClick={closePhoto}
                className="p-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full text-white shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300"
              >
                <X size={28} />
              </button>
              <button className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full text-white shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300">
                <Download size={28} />
              </button>
              <button className="p-5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300">
                <Share2 size={28} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent pt-4 pb-12">
        <div className="flex justify-between items-center px-6">
          <button className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl">
            <Settings size={24} />
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <Sparkles size={18} className="text-yellow-400" />
            <span className="text-white text-sm font-semibold">AI Mode</span>
          </div>
          
          <button
            onClick={() => setFlash(!flash)}
            className={`p-3 backdrop-blur-xl rounded-2xl transition-all duration-300 border hover:scale-105 shadow-xl ${
              flash 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-300 shadow-yellow-500/50' 
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {flash ? <Zap size={24} /> : <ZapOff size={24} />}
          </button>
        </div>
      </div>

      <div className="absolute top-24 left-0 right-0 z-10 flex justify-center gap-8">
        {['Photo', 'Video', 'Portrait'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m.toLowerCase())}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              mode === m.toLowerCase()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-110'
                : 'text-white/60 hover:text-white hover:scale-105'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-12 pb-10">
        <div className="flex justify-center items-center gap-16 px-6">
          <button className="group relative" onClick={handleOpenGallery}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-5 bg-white/10 backdrop-blur-xl rounded-3xl text-white hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-2xl group-hover:scale-110">
              <ImageIcon size={32} />
            </div>
          </button>

          <button
            onClick={capturePhoto}
            className="relative group"
            disabled={capturing || !hasCameraPermission}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="relative w-24 h-24 rounded-full border-4 border-white/80 flex items-center justify-center bg-transparent group-hover:border-white group-hover:scale-110 transition-all duration-300 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white via-gray-100 to-white group-hover:scale-95 transition-all duration-300 shadow-inner" />
            </div>
          </button>

          <button
            onClick={switchCamera}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-5 bg-white/10 backdrop-blur-xl rounded-3xl text-white hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-2xl group-hover:scale-110 group-hover:rotate-180">
              <RotateCw size={32} />
            </div>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/5" />
          ))}
        </div>
      </div>

      <div className="absolute top-16 left-6 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg z-10" />
      <div className="absolute top-16 right-6 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg z-10" />
      <div className="absolute bottom-36 left-6 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg z-10" />
      <div className="absolute bottom-36 right-6 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg z-10" />
    </div>
  );
}
