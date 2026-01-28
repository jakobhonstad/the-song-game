import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// Shared references to game storage (will be set by main server)
let gamesMap: Map<string, any>;
let playersMap: Map<string, any>;

// Share storage with game routes by reference (not copy)
export function setGameStorage(games: Map<string, any>, players: Map<string, any>) {
  gamesMap = games;
  playersMap = players;
}

export function getGameStorage() {
  return { games: gamesMap, players: playersMap };
}

interface GameClient {
  ws: WebSocket;
  gameCode: string;
  playerId?: string;
}

const clients = new Map<WebSocket, GameClient>();

// Export function to broadcast from REST API
export function broadcastToGame(gameCode: string, message: any, except?: WebSocket) {
  const messageStr = JSON.stringify(message);
  
  let sentCount = 0;
  for (const [ws, client] of clients.entries()) {
    if (client.gameCode === gameCode && ws !== except && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
      sentCount++;
    }
  }
  console.log(`📤 Broadcast ${message.type} to game ${gameCode}: sent to ${sentCount} clients`);
}

export function initWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  console.log('✅ WebSocket server initialized');
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('📱 New WebSocket connection');
    
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await handleMessage(ws, message);
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      const client = clients.get(ws);
      if (client) {
        console.log(`📱 Client disconnected from game ${client.gameCode}`);
        clients.delete(ws);
        
        // Notify other players
        broadcastToGame(client.gameCode, {
          type: 'player-left',
          playerId: client.playerId,
        }, ws);
      }
    });
    
    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  });
}

async function handleMessage(ws: WebSocket, message: any) {
  const { type, ...data } = message;
  
  switch (type) {
    case 'join-game':
      await handleJoinGame(ws, data);
      break;
      
    case 'start-game':
      await handleStartGame(ws, data);
      break;
      
    case 'submit-answer':
      await handleSubmitAnswer(ws, data);
      break;
      
    case 'next-round':
      await handleNextRound(ws, data);
      break;
      
    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

async function handleJoinGame(ws: WebSocket, data: { gameCode: string; playerId: string }) {
  const { gameCode, playerId } = data;
  
  const game = gamesMap.get(gameCode);
  
  if (!game) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
    return;
  }
  
  clients.set(ws, { ws, gameCode, playerId });
  
  ws.send(JSON.stringify({
    type: 'joined-game',
    game,
  }));
  
  // Notify other players
  broadcastToGame(gameCode, {
    type: 'player-joined',
    players: game.players,
  }, ws);
}

async function handleStartGame(ws: WebSocket, data: { gameCode: string }) {
  const { gameCode } = data;
  
  const game = gamesMap.get(gameCode);
  
  if (!game) {
    broadcastToGame(gameCode, {
      type: 'error',
      message: 'Game not found',
    });
    return;
  }
  
  game.status = 'PLAYING';
  game.currentRound = 1;
  game.updatedAt = new Date().toISOString();
  
  // Mock songs
  const mockSongs = [
    { id: '1', title: 'Star Wars Main Theme', artist: 'John Williams', category: 'film' },
    { id: '2', title: 'The Imperial March', artist: 'John Williams', category: 'film' },
    { id: '3', title: 'Jurassic Park Theme', artist: 'John Williams', category: 'film' },
    { id: '4', title: 'Pirates of the Caribbean Theme', artist: 'Hans Zimmer', category: 'film' },
    { id: '5', title: 'The Lion King - Circle of Life', artist: 'Elton John', category: 'film' },
  ];
  
  const categorySongs = mockSongs.filter(s => s.category === game.category);
  const randomSong = categorySongs[Math.floor(Math.random() * categorySongs.length)];
  
  const round = {
    id: `round-${Date.now()}`,
    gameId: game.id,
    roundNumber: 1,
    songId: randomSong.id,
    songTitle: randomSong.title,
    songArtist: randomSong.artist,
    audioUrl: null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    answers: [],
  };
  
  broadcastToGame(gameCode, {
    type: 'game-started',
    game,
    round: {
      ...round,
      songTitle: undefined, // Don't send the answer yet!
    },
  });
}

async function handleSubmitAnswer(ws: WebSocket, data: { roundId: string; playerId: string; guess: string; timeElapsed: number }) {
  const { roundId, playerId, guess, timeElapsed } = data;
  
  const client = clients.get(ws);
  if (!client) return;
  
  const game = gamesMap.get(client.gameCode);
  if (!game) return;
  
  // Simple round lookup (in real app would be in database)
  const normalizedGuess = guess.toLowerCase().trim();
  const isCorrect = true; // For now, accept all answers (you can add logic here)
  
  const basePoints = 100;
  const timeBonus = Math.max(0, Math.floor((30000 - timeElapsed) / 300));
  const points = isCorrect ? basePoints + timeBonus : 0;
  
  // Update player score
  const player = game.players.find((p: any) => p.id === playerId);
  if (player) {
    player.score += points;
  }
  
  ws.send(JSON.stringify({
    type: 'answer-submitted',
    isCorrect,
    points,
  }));
}

async function handleNextRound(ws: WebSocket, data: { gameCode: string }) {
  const { gameCode } = data;
  
  const game = gamesMap.get(gameCode);
  
  if (!game) {
    broadcastToGame(gameCode, {
      type: 'error',
      message: 'Game not found',
    });
    return;
  }
  
  const nextRoundNumber = game.currentRound + 1;
  
  if (nextRoundNumber > game.maxRounds) {
    // Game finished
    game.status = 'FINISHED';
    
    const leaderboard = game.players.sort((a: any, b: any) => b.score - a.score);
    
    broadcastToGame(gameCode, {
      type: 'game-finished',
      leaderboard,
    });
    return;
  }
  
  game.status = 'PLAYING';
  game.currentRound = nextRoundNumber;
  game.updatedAt = new Date().toISOString();
  
  // Mock songs
  const mockSongs = [
    { id: '1', title: 'Star Wars Main Theme', artist: 'John Williams', category: 'film' },
    { id: '2', title: 'The Imperial March', artist: 'John Williams', category: 'film' },
    { id: '3', title: 'Jurassic Park Theme', artist: 'John Williams', category: 'film' },
    { id: '4', title: 'Pirates of the Caribbean Theme', artist: 'Hans Zimmer', category: 'film' },
    { id: '5', title: 'The Lion King - Circle of Life', artist: 'Elton John', category: 'film' },
  ];
  
  const categorySongs = mockSongs.filter(s => s.category === game.category);
  const randomSong = categorySongs[Math.floor(Math.random() * categorySongs.length)];
  
  const round = {
    id: `round-${Date.now()}`,
    gameId: game.id,
    roundNumber: nextRoundNumber,
    songId: randomSong.id,
    songTitle: randomSong.title,
    songArtist: randomSong.artist,
    audioUrl: null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    answers: [],
  };
  
  broadcastToGame(gameCode, {
    type: 'next-round',
    round: {
      ...round,
      songTitle: undefined, // Don't send the answer!
    },
  });
}
