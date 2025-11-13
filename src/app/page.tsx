import Desktop from '@/components/os/Desktop';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function Home() {
  const bgImage = PlaceHolderImages.find(p => p.id === 'desktop-background');

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="-z-10 object-cover"
          data-ai-hint={bgImage.imageHint}
          priority
        />
      )}
      <Desktop />
    </main>
  );
}
