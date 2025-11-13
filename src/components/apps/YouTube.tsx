'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function YouTube() {
  return (
    <Card className="w-full h-full border-none shadow-none rounded-none">
      <CardContent className="p-0 h-full">
        <iframe
          src="https://www.youtube.com/embed/P9C25Un7flg"
          className="w-full h-full border-0 rounded-b-lg"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </CardContent>
    </Card>
  );
}
