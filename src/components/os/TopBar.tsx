'use client';

import { useState, useEffect } from 'react';
import { Search, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchDialog from './SearchDialog';
import NotificationCenter from './NotificationCenter';

interface TopBarProps {
  onReset: () => void;
}

export default function TopBar({ onReset }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <>
      <header className="w-full h-auto py-1 flex items-center justify-between px-4 bg-white/30 dark:bg-black/30 backdrop-blur-lg text-sm font-medium z-40">
        <div>
          <span className="font-bold">Prod</span> OS
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onReset}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 w-4" />
            </Button>
            <NotificationCenter />
          </div>
          <div className="text-right">
            <div>{currentTime}</div>
            <div className="text-xs text-muted-foreground">{currentDate}</div>
          </div>
        </div>
      </header>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
