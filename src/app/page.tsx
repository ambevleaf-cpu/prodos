'use client';

import Desktop from '@/components/os/Desktop';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const initialBgImage = PlaceHolderImages.find(p => p.id === 'desktop-background');
  const [backgroundImage, setBackgroundImage] = useState(initialBgImage?.imageUrl ?? '');
  const [backgroundAlt, setBackgroundAlt] = useState(initialBgImage?.description ?? '');
  const [backgroundHint, setBackgroundHint] = useState(initialBgImage?.imageHint ?? '');

  const handleSetWallpaper = (photo: { url: string, hint: string, description: string }) => {
    setBackgroundImage(photo.url);
    setBackgroundAlt(photo.description);
    setBackgroundHint(photo.hint);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
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
      <Desktop onSetWallpaper={handleSetWallpaper} />
    </main>
  );
}
