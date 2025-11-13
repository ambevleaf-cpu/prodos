'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function NotesApp() {
  const embedUrl = 'https://allstudynotes.studifysuccess.com/select-class-chapter';

  return (
    <Card className="w-full h-full flex flex-col border-none shadow-none rounded-none">
      <CardContent className="p-0 flex-grow">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0 rounded-b-lg"
          title="All Study Notes"
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      </CardContent>
    </Card>
  );
}
