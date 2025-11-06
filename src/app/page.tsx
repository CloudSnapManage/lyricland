'use client';

import { useActionState } from 'react';
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
import { Loader2, Music2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

export default function Home() {
  const initialState = {
    lyrics: null,
    error: null,
    message: 'Enter a song to find the lyrics.',
  };
  const [state, formAction] = useActionState(searchLyrics, initialState);

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
                <CardTitle className="font-headline">Find Lyrics</CardTitle>
                <CardDescription>
                  Enter a track name below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="track-main">Track Name</Label>
                  <Input
                    id="track-main"
                    name="track"
                    placeholder="e.g., Bohemian Rhapsody"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </form>
          </Card>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <span className="text-sm font-medium">Advanced Search</span>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                   <form action={formAction}>
                    <CardHeader>
                      <CardDescription>
                        For a more specific search, provide both artist and track.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="artist">Artist</Label>
                        <Input
                          id="artist"
                          name="artist"
                          placeholder="e.g., Queen"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="track">Track Name</Label>
                        <Input
                          id="track"
                          name="track"
                          placeholder="e.g., Bohemian Rhapsody"
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <SubmitButton />
                    </CardFooter>
                  </form>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="animate-in fade-in duration-500">
            {state?.lyrics && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline">Lyrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">
                    {state.lyrics}
                  </pre>
                </CardContent>
              </Card>
            )}

            {state?.error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {state?.message && !state.lyrics && !state.error && (
              <div className="text-center text-muted-foreground pt-8">
                <p>{state.message}</p>
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
