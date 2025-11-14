'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import TopBar from './TopBar';
import Dock from './Dock';
import Window from './Window';
import { APPS_CONFIG } from '@/lib/apps.config';
import FileExplorer from '../apps/FileExplorer';
import Settings from '../apps/Settings';
import Calculator from '../apps/Calculator';
import CameraApp from '../apps/Camera';
import Gallery from '../apps/Gallery';
import YouTube from '../apps/YouTube';
import NotesApp from '../apps/Notes';
import Translator from '../apps/Translator';
import Clock from '../apps/Clock';
import TaskManager from '../apps/TaskManager';
import SocialMediaApp from '../apps/SocialMedia';
import VideoCallApp from '../apps/VideoCall';
import NexbroChatbot from '../apps/Nexbro';
import MindGame from '../apps/MindGame';
import TaskListWidget from './TaskListWidget';
import IncomingCallManager from './IncomingCallManager';
import { galleryPhotos as initialGalleryPhotos, type GalleryPhoto } from '@/lib/gallery-data';
import type { Task } from '@/lib/types';
import AnimatedWallpaper from './AnimatedWallpaper';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

const appComponentMap: { [key: string]: React.ComponentType<any> } = {
  fileExplorer: FileExplorer,
  settings: Settings,
  calculator: Calculator,
  camera: CameraApp,
  gallery: Gallery,
  youtube: YouTube,
  notes: NotesApp,
  translator: Translator,
  clock: Clock,
  taskManager: TaskManager,
  socialMedia: SocialMediaApp,
  videoCall: VideoCallApp,
  nexbro: NexbroChatbot,
  mindGame: MindGame,
};

export default function Desktop() {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(initialGalleryPhotos);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [useAnimatedWallpaper, setUseAnimatedWallpaper] = useState(true);
  const [callDetails, setCallDetails] = useState<{ callId: string | null, isCallActive: boolean }>({ callId: null, isCallActive: false });

  const desktopRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{ windowId: string; offsetX: number; offsetY: number } | null>(null);
  const resizeInfo = useRef<{ windowId: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const auth = useAuth();

  const handleResetDesktop = useCallback(() => {
    windows.forEach(win => {
        if (win.appId === 'videoCall') {
            setCallDetails(prev => ({ ...prev, callId: null, isCallActive: false }));
        }
    });
    setWindows([]);
    setActiveWindowId(null);
  }, [windows]);

  const handleSignOut = async () => {
    await signOut(auth);
    // The useUser hook in the Home page will detect the change and redirect to login.
  };

  const handleSetWallpaper = useCallback((photo: { url: string, hint: string, description: string }) => {
    // For now, setting a wallpaper from gallery will disable the animated one.
    // A more robust solution could allow toggling.
    setUseAnimatedWallpaper(false);
  }, []);

  const addPhotoToGallery = useCallback((photoDataUrl: string) => {
    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      url: photoDataUrl,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      type: 'photo',
      hint: 'captured photo',
    };
    setGalleryPhotos(prev => [newPhoto, ...prev]);
  }, []);

  const deletePhotoFromGallery = useCallback((photoId: string) => {
    setGalleryPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  // Task Management Logic
  const addTask = useCallback((task: Omit<Task, 'id' | 'completed' | 'starred'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      completed: false,
      starred: false,
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((id: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const toggleStar = useCallback((id: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, starred: !task.starred } : task
    ));
  }, []);
  
  const focusWindow = useCallback((windowId: string) => {
    if (activeWindowId === windowId) return;

    setWindows(prevWindows =>
      prevWindows.map(w =>
        w.id === windowId ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
      )
    );
    setActiveWindowId(windowId);
    setNextZIndex(prev => prev + 1);
  }, [activeWindowId, nextZIndex]);

  const openApp = useCallback((appId: string) => {
    const app = APPS_CONFIG.find(a => a.id === appId);
    if (!app) return;

    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w));
      setActiveWindowId(existingWindow.id);
      setNextZIndex(prev => prev + 1);
      return;
    }
    
    const newWindow: WindowInstance = {
      id: `${app.id}-${Date.now()}`,
      appId: app.id,
      title: app.title,
      x: Math.random() * 200 + 50,
      y: Math.random() * 100 + 50,
      width: ['calculator', 'nexbro'].includes(app.id) ? 450 : (['clock', 'taskManager', 'mindGame', 'settings'].includes(app.id) ? 900 : 800),
      height: ['clock', 'taskManager', 'videoCall', 'nexbro', 'mindGame', 'settings'].includes(app.id) ? 700 : 600,
      zIndex: nextZIndex,
      isMinimized: false,
      isMaximized: false,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextZIndex(prev => prev + 1);
  }, [windows, nextZIndex]);

  const closeWindow = useCallback((windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (win?.appId === 'videoCall') {
       // The hangUp logic inside VideoCallApp will handle call state changes
       setCallDetails({ callId: null, isCallActive: false });
    }
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  }, [activeWindowId, windows]);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, isMinimized: true } : w));
    setActiveWindowId(null);
  }, []);

  const toggleMaximizeWindow = useCallback((windowId: string) => {
    setWindows(prevWindows =>
      prevWindows.map(w =>
        w.id === windowId
          ? { ...w, isMaximized: !w.isMaximized, zIndex: nextZIndex }
          : w
      )
    );
    setActiveWindowId(windowId);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);


  const onDragStart = useCallback((windowId: string, e: React.MouseEvent) => {
    focusWindow(windowId);
    const window = windows.find(w => w.id === windowId);
    if (!window || window.isMaximized) return;
    dragInfo.current = {
      windowId,
      offsetX: e.clientX - window.x,
      offsetY: e.clientY - window.y,
    };
  }, [windows, focusWindow]);
  
  const onResizeStart = useCallback((windowId: string, e: React.MouseEvent) => {
    focusWindow(windowId);
    e.stopPropagation();
    const window = windows.find(w => w.id === windowId);
    if (!window || window.isMaximized) return;
    resizeInfo.current = {
      windowId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: window.width,
      startHeight: window.height,
    };
  }, [windows, focusWindow]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragInfo.current) {
      const { windowId, offsetX, offsetY } = dragInfo.current;
      setWindows(prev => prev.map(w =>
        w.id === windowId
          ? { ...w, x: e.clientX - offsetX, y: e.clientY - offsetY }
          : w
      ));
    } else if (resizeInfo.current) {
        const { windowId, startX, startY, startWidth, startHeight } = resizeInfo.current;
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);
        setWindows(prev => prev.map(w =>
          w.id === windowId
            ? { ...w, width: Math.max(300, newWidth), height: Math.max(200, newHeight) }
            : w
        ));
    }
  }, []);

  const onMouseUp = useCallback(() => {
    dragInfo.current = null;
    resizeInfo.current = null;
  }, []);

  const openWindows = windows.filter(w => !w.isMinimized);

  return (
    <div
      ref={desktopRef}
      className="h-full w-full flex flex-col"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="absolute inset-0 -z-10">
        <AnimatedWallpaper />
      </div>

      <TopBar onReset={handleResetDesktop} />
      <div className="flex-grow relative" ref={desktopRef}>
        <TaskListWidget tasks={tasks} onToggleTask={toggleTask} onOpenTaskManager={() => openApp('taskManager')} />
        <IncomingCallManager
            setCallDetails={setCallDetails}
            openVideoCallApp={() => openApp('videoCall')}
        />
        {openWindows.map(win => {
          const AppComponent = appComponentMap[win.appId];
          const appProps: { [key: string]: any } = {};

          if (win.appId === 'settings') {
            appProps.onSetWallpaper = handleSetWallpaper;
            appProps.onSignOut = handleSignOut;
          }
          if (win.appId === 'camera') {
            appProps.onCapture = addPhotoToGallery;
            appProps.openApp = openApp;
          }
          if (win.appId === 'gallery') {
            appProps.photos = galleryPhotos;
            appProps.onDeletePhoto = deletePhotoFromGallery;
            appProps.openApp = openApp;
          }
           if (win.appId === 'taskManager') {
            appProps.tasks = tasks;
            appProps.addTask = addTask;
            appProps.deleteTask = deleteTask;
            appProps.toggleTask = toggleTask;
            appProps.toggleStar = toggleStar;
          }
          if (win.appId === 'videoCall') {
            appProps.callDetails = callDetails;
            appProps.setCallDetails = setCallDetails;
          }

          return (
            <Window
              key={win.id}
              {...win}
              desktopRef={desktopRef}
              isActive={win.id === activeWindowId}
              onFocus={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => toggleMaximizeWindow(win.id)}
              onDragStart={(e) => onDragStart(win.id, e)}
              onResizeStart={(e) => onResizeStart(win.id, e)}
            >
              {AppComponent ? <AppComponent {...appProps} /> : <div>App not found</div>}
            </Window>
          );
        })}
      </div>
      <Dock onAppClick={openApp} openWindows={windows} onWindowClick={focusWindow} />
    </div>
  );
}

    