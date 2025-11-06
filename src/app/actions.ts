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
});

export async function searchLyrics(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const validatedFields = searchSchema.safeParse({
    track: formData.get('track'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      lyrics: null,
      track: null,
      artist: null,
      error: fieldErrors.track?.[0] || 'Invalid input.',
    };
  }

  const { track } = validatedFields.data;
  
  try {
    const lrcUrl = new URL('https://api.lrclib.net/api/search');
    lrcUrl.searchParams.set('track_name', track);
    
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
    // Don't return, proceed to the error
  }

  let errorMessage = `Sorry, we couldn't find lyrics for "${track}". Please check the spelling and try again.`;

  return {
    lyrics: null,
    track: null,
    artist: null,
    error: errorMessage,
  };
}
