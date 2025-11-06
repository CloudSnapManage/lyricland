'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { searchLyrics } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ChevronDown, Music, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground" disabled={pending}>
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
  };
  const [state, formAction] = useActionState(searchLyrics, initialState);
  const [isLyricDialogOpen, setIsLyricDialogOpen] = useState(false);
  const [isArtistSearchOpen, setIsArtistSearchOpen] = useState(false);

  useEffect(() => {
    if (state.lyrics && state.track) {
      setIsLyricDialogOpen(true);
    } else {
      setIsLyricDialogOpen(false);
    }
  }, [state.lyrics, state.track]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-background text-foreground p-4 font-body">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        
        <div className="flex flex-col items-center gap-4 text-primary">
            <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
                stroke="currentColor"
                strokeWidth="1.5"
            >
                <path
                d="M12 1.5C5.64873 1.5 0.5 6.64873 0.5 13C0.5 19.3513 5.64873 24.5 12 24.5C18.3513 24.5 23.5 19.3513 23.5 13C23.5 10.1561 22.446 7.55416 20.6924 5.5H19.5V2.5H20.9381C21.4029 2.94028 21.8213 3.41803 22.1864 3.92601L19.5 6.61237V9.5H16.5L14.0739 6.88763C13.4344 6.67876 12.7312 6.5 12 6.5C9.09841 6.5 6.7844 8.68069 6.51706 11.5H9.5V14.5H6.51706C6.7844 17.3193 9.09841 19.5 12 19.5C14.9016 19.5 17.2156 17.3193 17.4829 14.5H14.5V11.5H17.4829C17.2156 8.68069 14.9016 6.5 12 6.5"
                transform="translate(-0.000003, -1.5)"
                />
            </svg>
            <h1 className="font-headline text-3xl font-bold text-foreground">Lyric Library</h1>
        </div>

        <Collapsible open={isArtistSearchOpen} onOpenChange={setIsArtistSearchOpen} className="w-full">
            <form action={formAction} className="w-full">
                <div className="bg-card/50 backdrop-blur-sm p-2 rounded-full flex items-center gap-2 border">
                    <div className="flex-grow pl-4">
                        <div className="relative flex items-center">
                            <Music className="h-5 w-5 absolute left-0 text-muted-foreground" />
                            <Input
                                id="track"
                                name="track"
                                placeholder="Track name..."
                                className="h-12 bg-transparent border-none pl-8 !ring-0 !ring-offset-0"
                                required
                            />
                        </div>
                        <CollapsibleContent className="transition-all data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                           <div className="relative flex items-center mt-1">
                                <User className="h-5 w-5 absolute left-0 text-muted-foreground" />
                                <Input
                                    id="artist"
                                    name="artist"
                                    placeholder="Artist name (optional)..."
                                    className="h-12 bg-transparent border-none pl-8 !ring-0 !ring-offset-0"
                                />
                            </div>
                        </CollapsibleContent>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-full transition-transform", isArtistSearchOpen && "rotate-180")}>
                            <ChevronDown className="h-5 w-5"/>
                            <span className="sr-only">Toggle artist search</span>
                        </Button>
                    </CollapsibleTrigger>
                    <SubmitButton />
                </div>
            </form>
        </Collapsible>
        
        <Dialog open={isLyricDialogOpen} onOpenChange={setIsLyricDialogOpen}>
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
        </Dialog>

        {state?.error && (
            <Alert variant="destructive" className="mt-4 animate-in fade-in duration-500 max-w-md">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

      </div>
    </div>
  );
}
