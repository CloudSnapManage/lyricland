'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { searchLyrics } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="icon" className="h-12 w-12 rounded-full" disabled={pending}>
      {pending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
          <Search className="h-5 w-5" />
      )}
    </Button>
  );
}

export default function Home() {
  const initialState = {
    lyrics: null,
    track: null,
    artist: null,
    error: null,
    message: null,
  };
  const [state, formAction] = useActionState(searchLyrics, initialState);
  const [isLyricDialogOpen, setIsLyricDialogOpen] = useState(false);

  useEffect(() => {
    if (state.lyrics && state.track && state.artist) {
      setIsLyricDialogOpen(true);
    } else {
      setIsLyricDialogOpen(false);
    }
  }, [state.lyrics, state.track, state.artist]);

  const LyricsViewer = () => {
    if (!state.lyrics || !state.track || !state.artist) return null;
    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{state.track}</DialogTitle>
                <DialogDescription>{state.artist}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] mt-4">
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed pr-6">
                {state.lyrics}
                </pre>
            </ScrollArea>
            <div className="flex justify-end mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Close
                </Button>
              </DialogClose>
            </div>
        </DialogContent>
    );
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-background text-foreground p-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        
        <div className="flex flex-col items-center gap-4 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-24 w-24"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>

        <form action={formAction} className="w-full">
            <div className="relative">
                <Input
                    id="track"
                    name="track"
                    placeholder="Search for lyrics..."
                    className="h-16 pl-6 pr-20 rounded-full text-lg"
                    required
                />
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                    <SubmitButton />
                </div>
            </div>
        </form>
        
        <Dialog open={isLyricDialogOpen} onOpenChange={setIsLyricDialogOpen}>
            <LyricsViewer />
        </Dialog>

        {state?.error && (
            <Alert variant="destructive" className="mt-8 animate-in fade-in duration-500 max-w-md">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

      </div>
    </div>
  );
}
