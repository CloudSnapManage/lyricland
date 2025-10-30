
'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { searchLyrics } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Music, User, Library, Download, Youtube } from 'lucide-react';
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
  const formRef = useRef<HTMLFormElement>(null);


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
    const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleListenOnYouTube = (track: string, artist: string) => {
    const query = encodeURIComponent(`${track} by ${artist}`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    window.open(url, '_blank');
  };
  
  const handleFocus = () => setIsSearchActive(true);
  const handleBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setIsSearchActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start sm:justify-center min-h-dvh bg-background text-foreground p-4 sm:p-6 font-body">
        
        <div className="w-full max-w-4xl flex flex-col items-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <svg width="56" height="56" viewBox="0 0 24 24" id="music-lyric" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" className="icon flat-line h-14 w-14 sm:h-16 sm:w-16 fill-primary">
                    <path id="secondary" d="M9,10a1,1,0,0,1,1-1h7V4a1,1,0,0,0-1-1H5A1,1,0,0,0,4,4V18a1,1,0,0,0,1,1H9Z" style={{fill: 'hsl(var(--accent))', strokeWidth: 1.5}}></path>
                    <path id="primary" d="M20,13H17v6" style={{fill: 'none', stroke: 'hsl(var(--primary))', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5}}></path>
                    <path id="primary-2" data-name="primary" d="M9,19H5a1,1,0,0,1-1-1V4A1,1,0,0,1,5,3H16a1,1,0,0,1,1,1V9" style={{fill: 'none', stroke: 'hsl(var(--primary))', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5}}></path>
                    <path id="primary-3" data-name="primary" d="M15,17a2,2,0,1,0,2,2A2,2,0,0,0,15,17ZM8,11h5M8,15h3" style={{fill: 'none', stroke: 'hsl(var(--primary))', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5}}></path>
                </svg>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">Lyric Land</h1>
                 <p className="text-muted-foreground text-center max-w-md text-sm sm:text-base">Search for song lyrics by track and artist to add them to your personal library.</p>
            </div>

            <form ref={formRef} action={formAction} className="w-full max-w-2xl" onFocus={handleFocus} onBlur={handleBlur}>
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
                        <div className={cn("p-2 rounded-full flex items-center gap-2 border bg-card")}>
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
                <DialogContent className="w-[90vw] sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{state.track}</DialogTitle>
                        <DialogDescription>{state.artist}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] sm:h-[50vh] mt-4">
                        <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed pr-6">{state.lyrics}</pre>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 mt-4 flex-wrap">
                        <Button type="button" variant="ghost" onClick={() => handleListenOnYouTube(state.track!, state.artist!)}>
                            <Youtube className="mr-2 h-4 w-4" />
                            Listen
                        </Button>
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
                    <div className="flex items-center gap-2 mb-4 px-4">
                        <Library className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Library</h2>
                    </div>
                    <div className="shelf">
                        {library.map((item, index) => (
                            <div key={`${item.track}-${item.artist}-${index}`} className="book" onClick={() => setActiveBook(item)}>
                                <div className="book-cover" style={{'--book-color': `hsl(${index * 35 + 200}, 60%, 50%)`} as React.CSSProperties}>
                                    <div className="book-title">{item.track}</div>
                                    <div className="book-artist">{item.artist}</div>
                                </div>
                                <div className="book-shelf"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Library Item Viewer */}
            <Dialog open={!!activeBook} onOpenChange={(isOpen) => !isOpen && setActiveBook(null)}>
                <DialogContent className="w-[90vw] sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{activeBook?.track}</DialogTitle>
                        <DialogDescription>{activeBook?.artist}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] sm:h-[50vh] mt-4">
                        <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed pr-6">{activeBook?.lyrics}</pre>

                    </ScrollArea>
                    <div className="flex justify-end gap-2 mt-4 flex-wrap">
                         <Button type="button" variant="ghost" onClick={() => handleListenOnYouTube(activeBook!.track!, activeBook!.artist!)}>
                            <Youtube className="mr-2 h-4 w-4" />
                            Listen
                        </Button>
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
