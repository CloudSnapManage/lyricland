'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { searchLyrics } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Music, User, Library, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" className="h-12 w-12 rounded-full shrink-0 bg-primary text-primary-foreground disabled:bg-primary/80" disabled={pending}>
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
    </Button>
  );
}

type LyricEntry = {
    lyrics: string | null;
    track: string | null;
    artist: string | null;
    error: string | null;
};

export default function Home() {
  const initialState: LyricEntry = { lyrics: null, track: null, artist: null, error: null };
  const [state, formAction] = useActionState(searchLyrics, initialState);
  
  const [isLyricDialogOpen, setIsLyricDialogOpen] = useState(false);
  const [library, setLibrary] = useState<LyricEntry[]>([]);
  const [activeBook, setActiveBook] = useState<LyricEntry | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    try {
      const savedLibrary = localStorage.getItem('lyricsLibrary');
      if (savedLibrary) {
        setLibrary(JSON.parse(savedLibrary));
      }
    } catch (e) {
      console.error("Could not load library from local storage", e)
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lyricsLibrary', JSON.stringify(library));
    } catch (e) {
      console.error("Could not save library to local storage", e)
    }
  }, [library]);

  useEffect(() => {
    if (state.lyrics && state.track) {
      setIsLyricDialogOpen(true);
    } else {
      setIsLyricDialogOpen(false);
    }
  }, [state.lyrics, state.track]);

  const saveToLibrary = () => {
    if (state.lyrics && state.track && state.artist) {
      const newEntry = { lyrics: state.lyrics, track: state.track, artist: state.artist, error: null };
      if (!library.some(item => item.track === newEntry.track && item.artist === newEntry.artist)) {
        setLibrary(prev => [...prev, newEntry]);
      }
      setIsLyricDialogOpen(false);
    }
  };
  
  const removeFromLibrary = (track: string, artist: string) => {
    setLibrary(prev => prev.filter(item => item.track !== track || item.artist !== artist));
    setActiveBook(null);
  };

  const isSaved = (track: string | null, artist: string | null) => {
    if (!track || !artist) return false;
    return library.some(item => item.track === track && item.artist === artist);
  }

  const handleDownload = (lyrics: string, track: string, artist: string) => {
    if (!lyrics || !track || !artist) return;
    
    const filename = `${track} by (${artist})Lyrics.txt`;
    const blob = new Blob([lyrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleFocus = () => setIsSearchActive(true);
  const handleBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setIsSearchActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start sm:justify-center min-h-dvh bg-background text-foreground p-4 sm:p-6 font-body">
        
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
                 <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 sm:h-16 sm:w-16 text-primary">
                    <path d="M12 1.5C5.64873 1.5 0.5 6.64873 0.5 13C0.5 19.3513 5.64873 24.5 12 24.5C18.3513 24.5 23.5 19.3513 23.5 13C23.5 10.1561 22.446 7.55416 20.6924 5.5H19.5V2.5H20.9381C21.4029 2.94028 21.8213 3.41803 22.1864 3.92601L19.5 6.61237V9.5H16.5L14.0739 6.88763C13.4344 6.67876 12.7312 6.5 12 6.5C9.09841 6.5 6.7844 8.68069 6.51706 11.5H9.5V14.5H6.51706C6.7844 17.3193 9.09841 19.5 12 19.5C14.9016 19.5 17.2156 17.3193 17.4829 14.5H14.5V11.5H17.4829C17.2156 8.68069 14.9016 6.5 12 6.5" transform="translate(-0.000003, -1.5)"/>
                </svg>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">Lyric Library</h1>
                 <p className="text-muted-foreground text-center max-w-md text-sm sm:text-base">Search for song lyrics by track and artist to add them to your personal library.</p>
            </div>

            <form action={formAction} className="w-full" onFocus={handleFocus} onBlur={handleBlur}>
                <div className="space-y-2">
                     <div className={cn("p-2 rounded-full flex items-center gap-2 border bg-card transition-shadow", isSearchActive && "shadow-lg")}>
                        <div className="relative flex-grow flex items-center pl-4">
                            <Music className="h-5 w-5 absolute left-4 text-muted-foreground" />
                            <Input
                                id="track"
                                name="track"
                                placeholder="Track name..."
                                className="h-12 bg-transparent border-none pl-10 !ring-0 !ring-offset-0"
                                required
                            />
                        </div>
                        <SubmitButton />
                    </div>
                    <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", isSearchActive ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                        <div className={cn("p-2 rounded-full flex items-center gap-2 border bg-card transition-shadow", isSearchActive && "shadow-lg")}>
                            <div className="relative flex-grow flex items-center pl-4">
                                <User className="h-5 w-5 absolute left-4 text-muted-foreground" />
                                <Input
                                    id="artist"
                                    name="artist"
                                    placeholder="Artist name (optional)..."
                                    className="h-12 bg-transparent border-none pl-10 !ring-0 !ring-offset-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {state?.error && (
                <Alert variant="destructive" className="mt-4 animate-in fade-in duration-500 max-w-md">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}

            <Dialog open={isLyricDialogOpen} onOpenChange={setIsLyricDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{state.track}</DialogTitle>
                        <DialogDescription>{state.artist}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] mt-4">
                        <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed pr-6">{state.lyrics}</pre>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => handleDownload(state.lyrics!, state.track!, state.artist!)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                        {!isSaved(state.track, state.artist) && (
                            <Button onClick={saveToLibrary}>Save to Library</Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Library Bookshelf */}
            {library.length > 0 && (
                <div className="w-full mt-8 sm:mt-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Library className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Library</h2>
                    </div>
                    <div className="bookshelf">
                        {library.map((item, index) => (
                            <div key={`${item.track}-${item.artist}-${index}`} className="book" style={{'--book-color': `hsl(${index * 35}, 60%, 70%)`} as React.CSSProperties} onClick={() => setActiveBook(item)}>
                                <div className="book-spine">
                                    <div className="book-title">{item.track}</div>
                                    <div className="book-artist">{item.artist}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Library Item Viewer */}
            <Dialog open={!!activeBook} onOpenChange={(isOpen) => !isOpen && setActiveBook(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{activeBook?.track}</DialogTitle>
                        <DialogDescription>{activeBook?.artist}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] mt-4">
                        <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed pr-6">{activeBook?.lyrics}</pre>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => handleDownload(activeBook!.lyrics!, activeBook!.track!, activeBook!.artist!)}>
                           <Download className="mr-2 h-4 w-4" />
                           Download
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setActiveBook(null)}>Close</Button>
                        <Button variant="destructive" onClick={() => activeBook && removeFromLibrary(activeBook.track!, activeBook.artist!)}>Remove from Library</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    </div>
  );
}
