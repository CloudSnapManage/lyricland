'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { searchLyrics } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, BookMarked, Trash2, Github, Heart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
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

type SavedLyric = {
  track: string;
  artist: string;
  lyrics: string;
};

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

  const LyricsViewer = ({ track, artist, lyrics }: SavedLyric) => {
    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{track}</DialogTitle>
                <DialogDescription>{artist}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] mt-4">
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed pr-6">
                {lyrics}
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
        
        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg w-24 h-24 flex flex-col items-center justify-center">
             <h1 className="text-2xl font-bold tracking-tighter">LRC</h1>
             <h2 className="text-2xl font-bold tracking-tighter">LIB</h2>
          </div>
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

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-primary/80">
            <a href="#" className="hover:underline">DOWNLOAD LRCGET</a>
            <a href="#" className="hover:underline">API DOCUMENTATION</a>
            <a href="#" className="hover:underline">DATABASE DUMPS</a>
            <a href="#" className="flex items-center gap-1 hover:underline">
                DONATION <Heart className="w-3 h-3" />
            </a>
        </div>
        
        <Button variant="outline" className="rounded-full bg-background/50 border-primary/20 text-primary/80 hover:bg-background hover:text-primary">
            <Github className="mr-2 h-4 w-4" />
            LRCLIB IS NOW OPEN-SOURCE!
        </Button>

        <Dialog open={isLyricDialogOpen} onOpenChange={setIsLyricDialogOpen}>
            {state?.lyrics && state.track && state.artist && (
              <LyricsViewer track={state.track} artist={state.artist} lyrics={state.lyrics} />
            )}
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
