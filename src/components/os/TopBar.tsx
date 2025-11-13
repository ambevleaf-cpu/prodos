'use client';

import { useState, useEffect } from 'react';
import { Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchDialog from './SearchDialog';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    // The useUser hook in the Home page will detect the change and redirect to login.
  };

  return (
    <>
      <header className="w-full h-8 flex items-center justify-between px-4 bg-white/30 dark:bg-black/30 backdrop-blur-lg text-sm font-medium z-40">
        <div>
          <span className="font-bold">Prod</span> OS
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
          <span>{currentTime}</span>
        </div>
      </header>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
