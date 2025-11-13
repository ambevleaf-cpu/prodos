'use client';

import { useActionState, useEffect, useRef } from 'react';
import { handleSearch } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialState = {
  results: null,
  error: null,
  timestamp: Date.now(),
};

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [state, formAction, isPending] = useActionState(handleSearch, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Clear form on open
  useEffect(() => {
    if(open) {
      formRef.current?.reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Find files, applications, and settings using natural language.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid gap-4">
          <div className="flex w-full items-center space-x-2">
            <Input
              id="query"
              name="query"
              placeholder="e.g., 'Find my presentation from last week'"
              required
              className="flex-grow"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
        <div className="mt-4 flex-grow flex items-center justify-center">
          {isPending && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          
          {state.results && !isPending && (
             <Card className="w-full max-w-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {state.results.refinedQuery && (
                       <div>
                          <h3 className="font-semibold text-lg mb-2">Refined Query</h3>
                          <p className="text-muted-foreground bg-muted p-3 rounded-md">
                            {state.results.refinedQuery}
                          </p>
                        </div>
                    )}
                    {state.results.searchUrl && (
                       <div>
                          <h3 className="font-semibold text-lg mb-2">Search Results</h3>
                          <Link href={state.results.searchUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full">
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Open Google Search Results
                            </Button>
                          </Link>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
