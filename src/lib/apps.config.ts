import { FolderOpen, Settings2, Calculator, Camera, type LucideIcon } from 'lucide-react';

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
