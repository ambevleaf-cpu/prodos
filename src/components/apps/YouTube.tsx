'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function YouTube() {
  const [searchQuery, setSearchQuery] = useState('Next.js tutorials');
  const [submittedQuery, setSubmittedQuery] = useState('Next.js tutorials');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  };

  const embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    submittedQuery
  )}`;

  return (
    <Card className="w-full h-full flex flex-col border-none shadow-none rounded-none">
      <div className="p-2 border-b">
        <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Search YouTube..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <CardContent className="p-0 flex-grow">
        {submittedQuery ? (
          <iframe
            key={submittedQuery} // Re-renders the iframe when the query changes
            src={embedUrl}
            className="w-full h-full border-0 rounded-b-lg"
            title="YouTube video search results"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Search for a video to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
