import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateGameCode } from '../utils/game';
import { broadcastToGame } from '../websocket/server';

// In-memory storage (shared with WebSocket)
export const games = new Map<string, any>();
export const players = new Map<string, any>();
export const rounds = new Map<string, any>();
export const answers = new Map<string, any>();

const app = new Hono();

// Validation schemas
const createGameSchema = z.object({
  category: z.string().min(1),
  hostName: z.string().min(1),
  maxRounds: z.number().int().min(1).max(20).default(10),
});

const joinGameSchema = z.object({
  code: z.string().length(6),
  playerName: z.string().min(1).max(50),
});

const submitAnswerSchema = z.object({
  roundId: z.string(),
  playerId: z.string(),
  guess: z.string().min(1),
});

// Create a new game
app.post('/', zValidator('json', createGameSchema), async (c) => {
  const { category, hostName, maxRounds } = c.req.valid('json');
  
  const code = generateGameCode();
  const hostId = `player-${Date.now()}`;
  const gameId = `game-${Date.now()}`;
  
  const hostPlayer = {
    id: hostId,
    gameId,
    name: hostName,
    score: 0,
    isHost: true,
    createdAt: new Date().toISOString(),
  };
  
  const game = {
    id: gameId,
    code,
    category,
    status: 'WAITING',
    hostId,
    currentRound: 0,
    maxRounds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    players: [hostPlayer],
  };
  
  games.set(gameId, game);
  games.set(code, game); // Also store by code for quick lookup
  players.set(hostId, hostPlayer);
  
  console.log('🎮 Game created:', { code, gameId, hostId, hostName });
  console.log('🗺️  Games Map now has keys:', Array.from(games.keys()));
  
  return c.json({ game }, 201);
});

// Get game by code
app.get('/:code', async (c) => {
  const code = c.req.param('code');
  
  console.log('🔍 GET game by code:', code);
  console.log('🗺️  Games Map keys:', Array.from(games.keys()));
  
  const game = games.get(code);
  
  if (!game) {
    console.log('❌ Game not found for code:', code);
    return c.json({ error: 'Game not found' }, 404);
  }
  
  console.log('✅ Game found:', { code: game.code, id: game.id, players: game.players.length });
  return c.json({ game });
});

// Join a game
app.post('/join', zValidator('json', joinGameSchema), async (c) => {
  const { code, playerName } = c.req.valid('json');
  
  const game = games.get(code);
  
  if (!game) {
    return c.json({ error: 'Game not found' }, 404);
  }
  
  if (game.status !== 'WAITING') {
    return c.json({ error: 'Game has already started' }, 400);
  }
  
  const playerId = `player-${Date.now()}-${Math.random()}`;
  const player = {
    id: playerId,
    gameId: game.id,
    name: playerName,
    score: 0,
    isHost: false,
    createdAt: new Date().toISOString(),
  };
  
  game.players.push(player);
  players.set(playerId, player);
  game.updatedAt = new Date().toISOString();
  
  // Notify other players via WebSocket
  console.log(`📢 Broadcasting player-joined to game ${code}, players:`, game.players.length);
  console.log('Game hostId:', game.hostId, 'Players:', game.players.map((p: any) => ({ id: p.id, name: p.name, isHost: p.isHost })));
  broadcastToGame(code, {
    type: 'player-joined',
    game: game,
  });
  
  return c.json({ player, game });
});

// Start game
app.post('/:code/start', async (c) => {
  const code = c.req.param('code');
  
  const game = games.get(code);
  
  if (!game) {
    return c.json({ error: 'Game not found' }, 404);
  }
  
  if (game.status !== 'WAITING') {
    return c.json({ error: 'Game has already started' }, 400);
  }
  
  if (game.players.length < 1) {
    return c.json({ error: 'Need at least 1 player to start' }, 400);
  }
  
  game.status = 'PLAYING';
  game.currentRound = 1;
  game.updatedAt = new Date().toISOString();
  
  // Broadcast game started to all players
  console.log(`🎬 Game started: ${code}`);
  broadcastToGame(code, {
    type: 'game-started',
    game: game,
  });
  
  return c.json({ game });
});

// Submit answer
app.post('/answers', zValidator('json', submitAnswerSchema), async (c) => {
  const { roundId, playerId, guess } = c.req.valid('json');
  
  const roundsForRound = Array.from(rounds.values()).find(r => r.id === roundId);
  
  if (!roundsForRound) {
    return c.json({ error: 'Round not found' }, 404);
  }
  
  // Check if answer is correct (case-insensitive, trim whitespace)
  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedAnswer = roundsForRound.songTitle.toLowerCase().trim();
  const isCorrect = normalizedGuess === normalizedAnswer;
  
  // Calculate points
  const points = isCorrect ? 100 : 0;
  
  const answerId = `answer-${Date.now()}`;
  const answer = {
    id: answerId,
    roundId,
    playerId,
    guess,
    isCorrect,
    points,
    submittedAt: new Date().toISOString(),
  };
  
  answers.set(answerId, answer);
  
  // Update player score
  const player = players.get(playerId);
  if (player && isCorrect) {
    player.score += points;
  }
  
  return c.json({ answer });
});

// Get leaderboard
app.get('/:code/leaderboard', async (c) => {
  const code = c.req.param('code');
  
  const game = games.get(code);
  
  if (!game) {
    return c.json({ error: 'Game not found' }, 404);
  }
  
  const leaderboard = game.players.sort((a: any, b: any) => b.score - a.score);
  
  return c.json({ leaderboard });
});

export default app;
