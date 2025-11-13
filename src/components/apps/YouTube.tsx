'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function YouTube() {
  return (
    <Card className="w-full h-full border-none shadow-none rounded-none">
      <CardContent className="p-0 h-full">
        <iframe
          src="https://www.google.com/search?q=youtube&igu=1"
          className="w-full h-full border-0 rounded-b-lg"
          title="YouTube Search Results"
        ></iframe>
      </CardContent>
    </Card>
  );
}
