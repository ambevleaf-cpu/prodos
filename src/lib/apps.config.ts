import { FolderOpen, Settings2, Calculator, Camera, GalleryHorizontal, Youtube, Notebook, Languages, Clock, CheckSquare, Users, Video, Bot, Brain, Info, MessageSquare, Music, Headphones, type LucideIcon } from 'lucide-react';

export interface AppConfig {
  id: string;
  title: string;
  icon: LucideIcon;
}

export const APPS_CONFIG: AppConfig[] = [
  {
    id: 'fileExplorer',
    title: 'File Explorer',
    icon: FolderOpen,
  },
  {
    id: 'messages',
    title: 'Messages',
    icon: MessageSquare,
  },
  {
    id: 'gallery',
    title: 'Gallery',
    icon: GalleryHorizontal,
  },
  {
    id: 'musicPlayer',
    title: 'Music Player',
    icon: Music,
  },
  {
    id: 'youtube',
    title: 'YouTube',
    icon: Youtube,
  },
  {
    id: 'nexbro',
    title: 'Nexbro',
    icon: Bot,
  },
  {
    id: 'buddy',
    title: 'Buddy',
    icon: Headphones,
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: Notebook,
  },
  {
    id: 'translator',
    title: 'Translator',
    icon: Languages,
  },
  {
    id: 'clock',
    title: 'Clock',
    icon: Clock,
  },
  {
    id: 'taskManager',
    title: 'Task Manager',
    icon: CheckSquare,
  },
  {
    id: 'socialMedia',
    title: 'Social Media',
    icon: Users,
  },
  {
    id: 'videoCall',
    title: 'Video Call',
    icon: Video,
  },
  {
    id: 'mindGame',
    title: 'Mind Game',
    icon: Brain,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings2,
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: Calculator,
  },
  {
    id: 'camera',
    title: 'Camera',
    icon: Camera,
  },
];
