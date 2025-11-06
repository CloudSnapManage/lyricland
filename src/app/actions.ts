'use server';

import { z } from 'zod';

type SearchState = {
  lyrics: string | null;
  track: string | null;
  artist: string | null;
  error: string | null;
  message?: string | null;
};

const searchSchema = z.object({
  track: z.string().trim().min(1, { message: 'Track name is required.' }),
  artist: z.string().trim().optional().transform(v => v === '' ? undefined : v),
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
    if (artist) {
      lrcUrl.searchParams.set('artist_name', artist);
    }
    
    const lrcResponse = await fetch(lrcUrl);

    if (lrcResponse.ok) {
      const lrcData = await lrcResponse.json();
      if (lrcData && lrcData.length > 0) {
        const firstResult = lrcData[0];
        if (firstResult && !firstResult.instrumental) {
          const lyrics = firstResult.plainLyrics || 
                         (firstResult.syncedLyrics ? 
                            firstResult.syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim() : 
                            null);

          if (lyrics) {
            return { lyrics: lyrics, track: firstResult.trackName, artist: firstResult.artistName, error: null };
          }
        }
      }
    }
  } catch (e) {
    console.error('LRCLIB API Error:', e);
    // Don't return, proceed to the next API or error
  }

  // Fallback to lyrics.ovh ONLY if an artist was provided
  if (artist) {
    try {
      const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(
        artist
      )}/${encodeURIComponent(track)}`;
      const ovhResponse = await fetch(ovhUrl);

      if (ovhResponse.ok) {
        const ovhData = await ovhResponse.json();
        if (ovhData.lyrics) {
          const cleanedLyrics = ovhData.lyrics
            .replace(/Paroles de la chanson .+\n/, '')
            .trim();
          return { lyrics: cleanedLyrics, track, artist, error: null };
        }
      }
    } catch (e) {
      console.error('Lyrics.ovh API Error:', e);
    }
  }

  let errorMessage = `Sorry, we couldn't find lyrics for "${track}"`;
  if(artist) {
    errorMessage += ` by ${artist}`;
  }
  errorMessage += `. Please check the spelling and try again.`;

  return {
    lyrics: null,
    track: null,
    artist: null,
    error: errorMessage,
  };
}
