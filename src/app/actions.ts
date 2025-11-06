'use server';

import { z } from 'zod';

type SearchState = {
  lyrics: string | null;
  error: string | null;
  message?: string | null;
};

// This schema validates the data received from the form.
const searchSchema = z.object({
  track: z.string().trim().min(1, { message: 'Track name is required.' }),
  artist: z.string().trim().optional().transform(val => val === '' ? undefined : val),
});

export async function searchLyrics(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const validatedFields = searchSchema.safeParse({
    track: formData.get('track'),
    artist: formData.get('artist'),
  });

  // If validation fails, return the error.
  if (!validatedFields.success) {
    return {
      lyrics: null,
      error: validatedFields.error.flatten().fieldErrors.track?.[0] || "Invalid input.",
    };
  }

  const { track, artist } = validatedFields.data;

  // 1. Try LRCLIB.NET using the /api/search endpoint
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
          if (firstResult.plainLyrics) {
            return { lyrics: firstResult.plainLyrics, error: null };
          }
          // Fallback for synced lyrics if plain is missing
          if (firstResult.syncedLyrics) {
            const plain = firstResult.syncedLyrics
              .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '')
              .trim();
            if (plain) {
              return { lyrics: plain, error: null };
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('LRCLIB API Error:', e);
    // Don't return, just log and proceed to the next API
  }

  // 2. Try lyrics.ovh if an artist was provided
  if (artist) {
    try {
      const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(
        artist
      )}/${encodeURIComponent(track)}`;
      const ovhResponse = await fetch(ovhUrl);

      if (ovhResponse.ok) {
        const ovhData = await ovhResponse.json();
        if (ovhData.lyrics) {
          // Clean up the lyrics from lyrics.ovh which often include a header
          const cleanedLyrics = ovhData.lyrics
            .replace(/Paroles de la chanson .+\n/, '')
            .trim();
          return { lyrics: cleanedLyrics, error: null };
        }
      }
    } catch (e) {
      console.error('Lyrics.ovh API Error:', e);
      // Don't return, proceed to the final error message
    }
  }

  // 3. If all APIs fail or no results are found
  return {
    lyrics: null,
    error: `Sorry, we couldn't find lyrics for "${track}". Please check the spelling or try adding an artist name in the advanced search.`,
  };
}
