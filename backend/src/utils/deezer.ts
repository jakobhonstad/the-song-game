// Function to search for a song on Deezer
export async function searchDeezer(title: string, artist: string) {
  try {
    // Deezer API search with artist and track name
    const query = encodeURIComponent(`artist:"${artist}" track:"${title}"`);
    const response = await fetch(`https://api.deezer.com/search?q=${query}`);

    const data = await response.json();
    const track = data.data?.[0]; // First result

    if (track && track.preview) {
      return {
        deezerId: track.id.toString(),
        previewUrl: track.preview, // 30-second MP3 preview URL
      };
    }
  } catch (error) {
    console.error(`Error searching Deezer for "${title}" by ${artist}:`, error);
  }

  return null;
}