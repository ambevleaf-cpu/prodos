import { FolderOpen, Settings2, type LucideIcon } from 'lucide-react';

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
];
