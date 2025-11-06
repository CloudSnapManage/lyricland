'use server';

import { z } from 'zod';

type SearchState = {
  lyrics: string | null;
  error: string | null;
  message?: string | null;
};

const searchSchema = z.object({
  artist: z.string().trim().optional(),
  track: z.string().trim().min(1, { message: 'Track name is required.' }),
});

export async function searchLyrics(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const validatedFields = searchSchema.safeParse({
    artist: formData.get('artist'),
    track: formData.get('track'),
  });

  if (!validatedFields.success) {
    return {
      lyrics: null,
      error: validatedFields.error.flatten().fieldErrors.track?.[0] || "Invalid input.",
    };
  }

  const { artist, track } = validatedFields.data;

  // 1. Try LRCLIB.NET (works with or without artist)
  try {
    const lrcUrl = new URL('https://api.lrclib.net/api/get');
    if (artist) {
        lrcUrl.searchParams.set('artist_name', artist);
    }
    lrcUrl.searchParams.set('track_name', track);

    const lrcResponse = await fetch(lrcUrl);

    if (lrcResponse.ok) {
      const lrcData = await lrcResponse.json();
      // Check for various successful responses from this API
      if (lrcData && !lrcData.instrumental) {
        if (lrcData.plainLyrics) {
          return { lyrics: lrcData.plainLyrics, error: null };
        }
        if (lrcData.syncedLyrics) {
          const plain = lrcData.syncedLyrics
            .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '')
            .trim();
          if (plain) {
            return { lyrics: plain, error: null };
          }
        }
      }
    }
  } catch (e) {
    console.error('LRCLIB API Error:', e);
    // Don't return here, just log and proceed to the next API
  }
  
  // 2. Try lyrics.ovh if artist is provided
  if(artist) {
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
            return { lyrics: cleanedLyrics, error: null };
          }
        }
      } catch (e) {
        console.error('Lyrics.ovh API Error:', e);
        // Don't return here, just log and proceed to the final message
      }
  }


  // 3. If all APIs fail
  return {
    lyrics: null,
    error: `Sorry, we couldn't find lyrics for "${track}". Please check the spelling or try the advanced search with an artist.`,
  };
}
