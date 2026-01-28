import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const songs = [
  // Film soundtracks
  { title: 'My Heart Will Go On', artist: 'Celine Dion', category: 'film', movie: 'Titanic' },
  { title: 'Skyfall', artist: 'Adele', category: 'film', movie: 'Skyfall (James Bond)' },
  { title: 'Eye of the Tiger', artist: 'Survivor', category: 'film', movie: 'Rocky III' },
  { title: 'I Will Always Love You', artist: 'Whitney Houston', category: 'film', movie: 'The Bodyguard' },
  { title: 'Can You Feel the Love Tonight', artist: 'Elton John', category: 'film', movie: 'The Lion King' },
  { title: 'Let It Go', artist: 'Idina Menzel', category: 'film', movie: 'Frozen' },
  { title: 'Circle of Life', artist: 'Carmen Twillie', category: 'film', movie: 'The Lion King' },
  { title: 'A Whole New World', artist: 'Peabo Bryson & Regina Belle', category: 'film', movie: 'Aladdin' },
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', category: 'film', movie: 'A Star Is Born' },
  { title: 'Lose Yourself', artist: 'Eminem', category: 'film', movie: '8 Mile' },
  
  // TV series theme songs
  { title: 'Friends Theme', artist: 'The Rembrandts', category: 'tv', show: 'Friends' },
  { title: 'Game of Thrones Theme', artist: 'Ramin Djawadi', category: 'tv', show: 'Game of Thrones' },
  { title: 'The Simpsons Theme', artist: 'Danny Elfman', category: 'tv', show: 'The Simpsons' },
  { title: 'Breaking Bad Theme', artist: 'Dave Porter', category: 'tv', show: 'Breaking Bad' },
  { title: 'Stranger Things Theme', artist: 'Kyle Dixon & Michael Stein', category: 'tv', show: 'Stranger Things' },
  { title: 'The Office Theme', artist: 'Jay Ferguson', category: 'tv', show: 'The Office' },
  { title: 'How I Met Your Mother Theme', artist: 'The Solids', category: 'tv', show: 'How I Met Your Mother' },
  { title: 'Westworld Theme', artist: 'Ramin Djawadi', category: 'tv', show: 'Westworld' },
  { title: 'The Crown Theme', artist: 'Hans Zimmer', category: 'tv', show: 'The Crown' },
  { title: 'Peaky Blinders Theme', artist: 'Nick Cave and the Bad Seeds', category: 'tv', show: 'Peaky Blinders' },
];

// Function to get Spotify Access Token
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('⚠️ SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set. Skipping Spotify data.');
    return '';
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Function to search for a song on Spotify
async function searchSpotify(title: string, artist: string, token: string) {
  if (!token) return null;

  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const track = data.tracks?.items?.[0];

    if (track) {
      return {
        spotifyId: track.id,
        previewUrl: track.preview_url,
      };
    }
  } catch (error) {
    console.error(`Error searching for "${title}" by ${artist}:`, error);
  }

  return null;
}

async function main() {
  console.log('🎵 Start seeding songs...');
  
  // Get Spotify token
  const spotifyToken = await getSpotifyToken();
  
  if (spotifyToken) {
    console.log('✅ Spotify token obtained');
  } else {
    console.log('⚠️ No Spotify token - songs will be created without preview URLs');
  }

  for (const song of songs) {
    // Search Spotify for the song
    const spotifyData = await searchSpotify(song.title, song.artist, spotifyToken);
    
    const result = await prisma.song.upsert({
      where: { 
        title_artist: {
          title: song.title,
          artist: song.artist,
        }
      },
      update: {
        ...(spotifyData && {
          spotifyId: spotifyData.spotifyId,
          previewUrl: spotifyData.previewUrl,
        }),
      },
      create: {
        title: song.title,
        artist: song.artist,
        category: song.category,
        ...(spotifyData && {
          spotifyId: spotifyData.spotifyId,
          previewUrl: spotifyData.previewUrl,
        }),
      },
    });
    
    console.log(`✅ ${song.title} by ${song.artist} ${spotifyData?.previewUrl ? '(with preview)' : '(no preview)'}`);
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
