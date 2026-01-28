import { Hono } from 'hono';

const app = new Hono();

// Mock songs database
const mockSongs = [
  { id: '1', title: 'Star Wars Main Theme', artist: 'John Williams', category: 'film', audioUrl: null, imageUrl: null },
  { id: '2', title: 'The Imperial March', artist: 'John Williams', category: 'film', audioUrl: null, imageUrl: null },
  { id: '3', title: 'Jurassic Park Theme', artist: 'John Williams', category: 'film', audioUrl: null, imageUrl: null },
  { id: '4', title: 'Pirates of the Caribbean Theme', artist: 'Hans Zimmer', category: 'film', audioUrl: null, imageUrl: null },
  { id: '5', title: 'The Lion King - Circle of Life', artist: 'Elton John', category: 'film', audioUrl: null, imageUrl: null },
  { id: '6', title: 'Frozen - Let It Go', artist: 'Idina Menzel', category: 'film', audioUrl: null, imageUrl: null },
  { id: '7', title: 'Harry Potter Theme', artist: 'John Williams', category: 'film', audioUrl: null, imageUrl: null },
  { id: '8', title: 'The Avengers Theme', artist: 'Alan Silvestri', category: 'film', audioUrl: null, imageUrl: null },
  { id: '9', title: 'James Bond Theme', artist: 'Monty Norman', category: 'film', audioUrl: null, imageUrl: null },
  { id: '10', title: 'Mission Impossible Theme', artist: 'Lalo Schifrin', category: 'film', audioUrl: null, imageUrl: null },
  { id: '11', title: 'Indiana Jones Theme', artist: 'John Williams', category: 'film', audioUrl: null, imageUrl: null },
  { id: '12', title: 'Back to the Future Theme', artist: 'Alan Silvestri', category: 'film', audioUrl: null, imageUrl: null },
  { id: '13', title: 'The Godfather Theme', artist: 'Nino Rota', category: 'film', audioUrl: null, imageUrl: null },
  { id: '14', title: 'Rocky Theme - Gonna Fly Now', artist: 'Bill Conti', category: 'film', audioUrl: null, imageUrl: null },
  { id: '15', title: 'Titanic - My Heart Will Go On', artist: 'Celine Dion', category: 'film', audioUrl: null, imageUrl: null },
  { id: '16', title: 'Game of Thrones Theme', artist: 'Ramin Djawadi', category: 'tv', audioUrl: null, imageUrl: null },
  { id: '17', title: 'Friends Theme - I\'ll Be There For You', artist: 'The Rembrandts', category: 'tv', audioUrl: null, imageUrl: null },
  { id: '18', title: 'The Simpsons Theme', artist: 'Danny Elfman', category: 'tv', audioUrl: null, imageUrl: null },
  { id: '19', title: 'Breaking Bad Theme', artist: 'Dave Porter', category: 'tv', audioUrl: null, imageUrl: null },
  { id: '20', title: 'Stranger Things Theme', artist: 'Kyle Dixon & Michael Stein', category: 'tv', audioUrl: null, imageUrl: null },
];

// Get songs by category
app.get('/', async (c) => {
  const category = c.req.query('category');
  
  const songs = category 
    ? mockSongs.filter(s => s.category === category)
    : mockSongs;
  
  return c.json({ songs });
});

// Search songs (for autocomplete)
app.get('/search', async (c) => {
  const query = c.req.query('q');
  const category = c.req.query('category');
  
  if (!query) {
    return c.json({ results: [] });
  }
  
  const results = mockSongs.filter(song => {
    const matchesCategory = !category || song.category === category;
    const matchesQuery = 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }).slice(0, 10);
  
  return c.json({ results });
});

// Get random song from category
app.get('/random', async (c) => {
  const category = c.req.query('category');
  
  if (!category) {
    return c.json({ error: 'Category required' }, 400);
  }
  
  const filtered = mockSongs.filter(s => s.category === category);
  
  if (filtered.length === 0) {
    return c.json({ error: 'No songs found for this category' }, 404);
  }
  
  const song = filtered[Math.floor(Math.random() * filtered.length)];
  return c.json({ song });
});

export default app;
