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
  artist: z.string().trim(),
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
    const params = new URLSearchParams();
    const query = [track, artist].filter(Boolean).join(' ');
    params.set('q', query);
    
    const lrcUrl = `https://lrclib.net/api/search?${params.toString()}`;
    
    const lrcResponse = await fetch(lrcUrl);

    if (!lrcResponse.ok) {
        throw new Error(`API request failed with status ${lrcResponse.status}`);
    }

    const lrcData = await lrcResponse.json();

    if (lrcData && lrcData.length > 0) {
      let foundSong = null;

      // Filter out instrumentals and songs without lyrics first
      const validSongs = lrcData.filter((item: any) => !item.instrumental && (item.plainLyrics || item.syncedLyrics));

      if (validSongs.length === 0) {
        // Fall through to generic error if no valid songs are found
      }
      // If artist is provided, try to find an exact match
      else if (artist) {
          foundSong = validSongs.find((item: any) => 
              item.trackName.toLowerCase() === track.toLowerCase() &&
              item.artistName.toLowerCase().includes(artist.toLowerCase())
          );
      }

      // If no exact match or no artist was given, use the first valid result
      if (!foundSong) {
          foundSong = validSongs[0];
      }
      
      if (foundSong) {
        let lyrics = foundSong.plainLyrics;
        
        // If plain lyrics are missing, parse synced lyrics
        if (!lyrics && foundSong.syncedLyrics) {
          lyrics = foundSong.syncedLyrics
            .split('\n')
            .map((line: string) => line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim())
            .filter(Boolean)
            .join('\n');
        }

        if (lyrics) {
          return { lyrics: lyrics, track: foundSong.trackName, artist: foundSong.artistName, error: null };
        }
      }
    }
  } catch (e) {
    console.error('API Error:', e);
    return {
        lyrics: null,
        track: null,
        artist: null,
        error: 'An unexpected error occurred while fetching lyrics. Please try again later.'
    };
  }

  const errorMessage = `Sorry, we couldn't find lyrics for "${track}"${artist ? ` by "${artist}"` : ''}. Please check the spelling and try again.`;

  return {
    lyrics: null,
    track: null,
    artist: null,
    error: errorMessage,
  };
}
