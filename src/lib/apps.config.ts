import { FolderOpen, Settings2, Calculator, Camera, GalleryHorizontal, Youtube, Notebook, Languages, type LucideIcon } from 'lucide-react';

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
    id: 'gallery',
    title: 'Gallery',
    icon: GalleryHorizontal,
  },
  {
    id: 'youtube',
    title: 'YouTube',
    icon: Youtube,
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
  }
];
