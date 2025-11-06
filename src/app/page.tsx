'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { searchLyrics } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Music2, Search, BookMarked, Trash2, Library, X, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Search
        </>
      )}
    </Button>
  );
}

type SavedLyric = {
  track: string;
  artist: string;
  lyrics: string;
};

// Helper to get a consistent color from a string
const getColorFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 75%)`;
};


export default function Home() {
  const initialState = {
    lyrics: null,
    track: null,
    artist: null,
    error: null,
  };
  const [state, formAction] = useActionState(searchLyrics, initialState);
  const [library, setLibrary] = useState<SavedLyric[]>([]);

  useEffect(() => {
    try {
      const savedLibrary = localStorage.getItem('lyricsLibrary');
      if (savedLibrary) {
        setLibrary(JSON.parse(savedLibrary));
      }
    } catch (error) {
      console.error("Could not load from local storage", error);
    }
  }, []);

  const saveToLibrary = () => {
    if (state.lyrics && state.track && state.artist) {
      const newEntry = { track: state.track, artist: state.artist, lyrics: state.lyrics };
      // Prevent duplicates
      if (!library.some(item => item.track === newEntry.track && item.artist === newEntry.artist)) {
        const updatedLibrary = [...library, newEntry];
        setLibrary(updatedLibrary);
        localStorage.setItem('lyricsLibrary', JSON.stringify(updatedLibrary));
      }
    }
  };

  const removeFromLibrary = (track: string, artist: string) => {
    const updatedLibrary = library.filter(
      (item) => !(item.track === track && item.artist === artist)
    );
    setLibrary(updatedLibrary);
    localStorage.setItem('lyricsLibrary', JSON.stringify(updatedLibrary));
  };
  
  const isSaved = state.track && state.artist && library.some(
    (item) => item.track === state.track && item.artist === state.artist
  );

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-6">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <Music2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">
            Lyric Land
          </h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="shadow-lg">
            <form action={formAction}>
              <CardHeader>
                <CardTitle className="font-headline">Find & Save Lyrics</CardTitle>
                <CardDescription>
                  Enter a track and artist name below. Both fields are required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="track">Track Name</Label>
                  <Input
                    id="track"
                    name="track"
                    placeholder="e.g., Bohemian Rhapsody"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist Name</Label>
                  <Input
                    id="artist"
                    name="artist"
                    placeholder="e.g., Queen"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </form>
          </Card>

          {state?.lyrics && (
            <Card className="shadow-lg animate-in fade-in duration-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline">{state.track}</CardTitle>
                    <CardDescription>{state.artist}</CardDescription>
                  </div>
                  <Button onClick={saveToLibrary} disabled={!!isSaved} size="sm" variant="outline">
                    <BookMarked className="mr-2" />
                    {isSaved ? 'Saved' : 'Save to Library'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">
                  {state.lyrics}
                </pre>
              </CardContent>
            </Card>
          )}

          {state?.error && (
            <Alert variant="destructive" className="animate-in fade-in duration-500">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          
          <div className="pt-8">
            <h2 className="text-2xl font-headline font-bold flex items-center gap-2 mb-4">
              <Library />
              My Bookshelf
            </h2>
            {library.length > 0 ? (
                <div className="w-full bg-stone-200 dark:bg-stone-800 p-4 rounded-lg">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 items-end min-h-[240px] border-b-8 border-stone-500/50 pb-2">
                        {library.map((item, index) => (
                        <Dialog key={`${item.track}-${item.artist}`}>
                            <DialogTrigger asChild>
                                <div
                                    className="group relative h-[220px] w-full cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-2 flex flex-col justify-end p-2 rounded-t-md rounded-b-sm shadow-md text-primary-foreground"
                                    style={{ backgroundColor: getColorFromString(item.track) }}
                                >
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <BookOpen size={16} />
                                    </div>
                                    <div className="[writing-mode:vertical-rl] transform rotate-180 text-center whitespace-nowrap text-xs font-bold uppercase tracking-wider text-black/70">
                                       <p className="truncate">{item.track}</p>
                                    </div>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full text-center">
                                      <p className="text-xs font-medium text-black/60 truncate px-1">{item.artist}</p>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{item.track}</DialogTitle>
                                    <DialogDescription>{item.artist}</DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] mt-4">
                                    <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed pr-6">
                                    {item.lyrics}
                                    </pre>
                                </ScrollArea>
                                <div className="flex justify-between mt-4">
                                  <Button onClick={() => removeFromLibrary(item.track, item.artist)} variant="destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove
                                  </Button>
                                  <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        Close
                                    </Button>
                                  </DialogClose>
                                </div>
                            </DialogContent>
                        </Dialog>
                        ))}
                    </div>
                </div>
            ) : (
               <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <p>Your bookshelf is empty.</p>
                <p className="text-sm">Search for lyrics to add books to your shelf.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Powered by LRCLIB and Lyrics.ovh</p>
      </footer>
    </div>
  );
}
