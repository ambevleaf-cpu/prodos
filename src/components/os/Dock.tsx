'use client';

import { APPS_CONFIG, AppConfig } from '@/lib/apps.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { WindowInstance } from './Desktop';

interface DockProps {
  onAppClick: (app: AppConfig) => void;
  openWindows: WindowInstance[];
  onWindowClick: (windowId: string) => void;
}

export default function Dock({ onAppClick, openWindows, onWindowClick }: DockProps) {
  return (
    <TooltipProvider>
      <footer className="w-full flex justify-center p-2 z-50">
        <div className="flex items-center justify-center gap-2 bg-white/30 dark:bg-black/30 backdrop-blur-lg p-2 rounded-xl border border-white/20 dark:border-black/20 shadow-lg">
          {APPS_CONFIG.map(app => {
            const isRunning = openWindows.some(w => w.appId === app.id);
            const window = openWindows.find(w => w.appId === app.id);

            const handleClick = () => {
              if (window) {
                onWindowClick(window.id);
              } else {
                onAppClick(app);
              }
            };

            return (
              <div key={app.id} className="flex flex-col items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleClick}
                      className="h-14 w-14 rounded-lg bg-white/50 dark:bg-black/50 flex items-center justify-center text-primary transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <app.icon className="w-8 h-8" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{app.title}</p>
                  </TooltipContent>
                </Tooltip>
                {isRunning && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
              </div>
            );
          })}
        </div>
      </footer>
    </TooltipProvider>
  );
}
