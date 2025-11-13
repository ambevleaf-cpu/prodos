'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import TopBar from './TopBar';
import Dock from './Dock';
import Window from './Window';
import { APPS_CONFIG, AppConfig } from '@/lib/apps.config';
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
import TaskListWidget from './TaskListWidget';
import { galleryPhotos as initialGalleryPhotos, type GalleryPhoto } from '@/lib/gallery-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Task } from '@/lib/types';


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
}

export default function Desktop() {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(initialGalleryPhotos);
  const [tasks, setTasks] = useState<Task[]>([]);

  const desktopRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{ windowId: string; offsetX: number; offsetY: number } | null>(null);
  const resizeInfo = useRef<{ windowId: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  
  const initialBgImage = PlaceHolderImages.find(p => p.id === 'desktop-background');
  const [backgroundImage, setBackgroundImage] = useState(initialBgImage?.imageUrl ?? '');
  const [backgroundAlt, setBackgroundAlt] = useState(initialBgImage?.description ?? '');
  const [backgroundHint, setBackgroundHint] = useState(initialBgImage?.imageHint ?? '');

  const handleSetWallpaper = useCallback((photo: { url: string, hint: string, description: string }) => {
    setBackgroundImage(photo.url);
    setBackgroundAlt(photo.description);
    setBackgroundHint(photo.hint);
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

    const existingWindow = windows.find(w => w.appId === app.id && !w.isMinimized);
    if (existingWindow) {
      focusWindow(existingWindow.id);
      return;
    }

    const minimizedWindow = windows.find(w => w.appId === app.id && w.isMinimized);
    if (minimizedWindow) {
      setWindows(prev => prev.map(w => w.id === minimizedWindow.id ? { ...w, isMinimized: false, zIndex: nextZIndex + 1 } : w));
      setActiveWindowId(minimizedWindow.id);
      setNextZIndex(prev => prev + 1);
      return;
    }
    
    const newWindow: WindowInstance = {
      id: `${app.id}-${Date.now()}`,
      appId: app.id,
      title: app.title,
      x: Math.random() * 200 + 50,
      y: Math.random() * 100 + 50,
      width: app.id === 'calculator' ? 450 : (app.id === 'clock' || app.id === 'taskManager' ? 900 : 800),
      height: app.id === 'clock' || app.id === 'taskManager' ? 700 : 600,
      zIndex: nextZIndex,
      isMinimized: false,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextZIndex(prev => prev + 1);
  }, [windows, nextZIndex, focusWindow]);

  const appComponentMap: { [key: string]: React.ComponentType<any> } = useMemo(() => ({
    fileExplorer: FileExplorer,
    settings: (props: any) => <Settings {...props} onSetWallpaper={handleSetWallpaper} />,
    calculator: Calculator,
    camera: (props: any) => <CameraApp {...props} onCapture={addPhotoToGallery} openApp={openApp} />,
    gallery: (props: any) => <Gallery {...props} photos={galleryPhotos} onDeletePhoto={deletePhotoFromGallery} openApp={openApp} />,
    youtube: YouTube,
    notes: NotesApp,
    translator: Translator,
    clock: Clock,
    taskManager: (props: any) => <TaskManager {...props} tasks={tasks} addTask={addTask} deleteTask={deleteTask} toggleTask={toggleTask} toggleStar={toggleStar} />,
  }), [handleSetWallpaper, addPhotoToGallery, deletePhotoFromGallery, galleryPhotos, openApp, tasks, addTask, deleteTask, toggleTask, toggleStar]);
  
  const openAppConfig = useCallback((app: AppConfig) => {
    openApp(app.id);
  }, [openApp]);


  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, isMinimized: true } : w));
    setActiveWindowId(null);
  }, []);

  const onDragStart = useCallback((windowId: string, e: React.MouseEvent) => {
    focusWindow(windowId);
    const window = windows.find(w => w.id === windowId);
    if (!window) return;
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
    if (!window) return;
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

  const openWindows = useMemo(() => windows.filter(w => !w.isMinimized), [windows]);

  return (
    <div
      ref={desktopRef}
      className="h-full w-full flex flex-col"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={backgroundAlt}
          fill
          className="-z-10 object-cover"
          data-ai-hint={backgroundHint}
          priority
        />
      )}
      <TopBar />
      <div className="flex-grow relative">
        <TaskListWidget tasks={tasks} onToggleTask={toggleTask} onOpenTaskManager={() => openApp('taskManager')} />
        {openWindows.map(win => {
          const AppComponent = appComponentMap[win.appId];
          return (
            <Window
              key={win.id}
              {...win}
              isActive={win.id === activeWindowId}
              onFocus={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onDragStart={(e) => onDragStart(win.id, e)}
              onResizeStart={(e) => onResizeStart(win.id, e)}
            >
              {AppComponent ? <AppComponent openApp={openApp} /> : <div>App not found</div>}
            </Window>
          );
        })}
      </div>
      <Dock onAppClick={openAppConfig} openWindows={windows} onWindowClick={focusWindow} />
    </div>
  );
}
