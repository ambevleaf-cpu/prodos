'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
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
import { Search, Loader2 } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[525px]">
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
        <div className="mt-4 space-y-4">
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.results && (
            <div className="space-y-2">
              <h4 className="font-medium">Results</h4>
              {state.results.refinedQuery && (
                 <p className="text-sm text-muted-foreground italic">
                    Showing results for: "{state.results.refinedQuery}"
                 </p>
              )}
              <ul className="list-disc list-inside space-y-1 rounded-md border p-4 text-sm">
                {state.results.results.length > 0 ? (
                  state.results.results.map((result, index) => (
                    <li key={index}>{result}</li>
                  ))
                ) : (
                  <li className='list-none'>No results found.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
