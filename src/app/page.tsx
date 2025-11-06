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
import { Loader2, Music2, Search, BookMarked, Trash2, Library, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export default function Home() {
  const initialState = {
    lyrics: null,
    track: null,
    artist: null,
    error: null,
    message: 'Enter an artist and song to find the lyrics.',
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
      const updatedLibrary = [...library, newEntry];
      setLibrary(updatedLibrary);
      localStorage.setItem('lyricsLibrary', JSON.stringify(updatedLibrary));
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
              My Library
            </h2>
            {library.length > 0 ? (
              <Card className="shadow-md">
                 <CardContent className="p-0">
                  <div className="space-y-2">
                    {library.map((item, index) => (
                      <Dialog key={index}>
                        <div className="flex items-center justify-between p-4 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{item.track}</p>
                            <p className="text-sm text-muted-foreground">{item.artist}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">View</Button>
                            </DialogTrigger>
                             <Button onClick={() => removeFromLibrary(item.track, item.artist)} variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </div>

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
                           <DialogClose asChild>
                             <Button type="button" variant="secondary" className="mt-4">
                               Close
                             </Button>
                           </DialogClose>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                 </CardContent>
              </Card>
            ) : (
               <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <p>Your saved lyrics will appear here.</p>
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
