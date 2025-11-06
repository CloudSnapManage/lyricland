'use server';

import { z } from 'zod';

type SearchState = {
  lyrics: string | null;
  error: string | null;
  message?: string | null;
};

const searchSchema = z.object({
  artist: z.string().trim().min(1, { message: 'Artist is required.' }),
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
      error: validatedFields.error.flatten().fieldErrors.artist?.[0] || validatedFields.error.flatten().fieldErrors.track?.[0] || "Invalid input.",
    };
  }

  const { artist, track } = validatedFields.data;

  try {
    // 1. Try LRCLIB API
    const lrcUrl = new URL('https://api.lrclib.net/api/get');
    lrcUrl.searchParams.set('artist_name', artist);
    lrcUrl.searchParams.set('track_name', track);

    const lrcResponse = await fetch(lrcUrl);

    if (lrcResponse.ok) {
      const lrcData = await lrcResponse.json();
      if (lrcData && !lrcData.instrumental) {
        if (lrcData.plainLyrics) {
          return { lyrics: lrcData.plainLyrics, error: null };
        }
        if (lrcData.syncedLyrics) {
          // Strip LRC timestamps like [00:12.34]
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
    // Log internal error but proceed to fallback
    console.error('LRCLIB API Error:', e);
  }

  try {
    // 2. Fallback to Lyrics.ovh API
    const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(
      artist
    )}/${encodeURIComponent(track)}`;
    const ovhResponse = await fetch(ovhUrl);

    if (ovhResponse.ok) {
      const ovhData = await ovhResponse.json();
      if (ovhData.lyrics) {
        // Clean up common boilerplate from this API's response
        const cleanedLyrics = ovhData.lyrics
          .replace(/Paroles de la chanson .+\n/, '')
          .trim();
        return { lyrics: cleanedLyrics, error: null };
      }
    }
  } catch (e) {
    console.error('Lyrics.ovh API Error:', e);
    return {
      lyrics: null,
      error: 'An unexpected network error occurred. Please try again.',
    };
  }

  // 3. If all APIs fail
  return {
    lyrics: null,
    error: "Sorry, we couldn't find lyrics for that song. Please check the artist and track name.",
  };
}
