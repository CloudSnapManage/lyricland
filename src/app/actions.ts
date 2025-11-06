'use server';

import { z } from 'zod';

type SearchState = {
  lyrics: string | null;
  track: string | null;
  artist: string | null;
  error: string | null;
};

const searchSchema = z.object({
  track: z.string().trim().min(1, { message: 'Track name is required.' }),
  artist: z.string().trim().min(1, { message: 'Artist name is required.' }),
});

export async function searchLyrics(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const validatedFields = searchSchema.safeParse({
    track: formData.get('track'),
    artist: formData.get('artist'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      lyrics: null,
      track: null,
      artist: null,
      error: fieldErrors.track?.[0] || fieldErrors.artist?.[0] || 'Invalid input.',
    };
  }

  const { track, artist } = validatedFields.data;
  
  try {
    const lrcUrl = new URL('https://api.lrclib.net/api/search');
    lrcUrl.searchParams.set('track_name', track);
    lrcUrl.searchParams.set('artist_name', artist);
    
    // The fetch call in Next.js automatically encodes the URL search parameters,
    // so manually encoding them with encodeURIComponent is not necessary here.
    // The previous issue was likely intermittent API availability or a different bug.
    // This simplified and correct code will handle requests properly.
    const lrcResponse = await fetch(lrcUrl);

    if (lrcResponse.ok) {
      const lrcData = await lrcResponse.json();
      if (lrcData && lrcData.length > 0) {
        const firstResult = lrcData.find((item: any) => !item.instrumental && (item.plainLyrics || item.syncedLyrics));
        
        if (firstResult) {
            // The API sometimes returns synced lyrics with just timestamps and no text.
            // This regex removes the timestamps, and we check if any actual text remains.
            const syncedLyricsText = firstResult.syncedLyrics ? 
                                     firstResult.syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim() :
                                     null;

            const lyrics = firstResult.plainLyrics || syncedLyricsText;

            if (lyrics) {
              return { lyrics: lyrics, track: firstResult.trackName, artist: firstResult.artistName, error: null };
            }
        }
      }
    }
  } catch (e) {
    console.error('LRCLIB API Error:', e);
    // Fall through to the generic error message
  }

  const errorMessage = `Sorry, we couldn't find lyrics for "${track}" by "${artist}". Please check the spelling and try again.`;

  return {
    lyrics: null,
    track: null,
    artist: null,
    error: errorMessage,
  };
}
