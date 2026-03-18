import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from '../game/game.service';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket'],
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private gameConnections = new Map<string, Set<Socket>>();

  constructor(private gameService: GameService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }


  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.gameConnections.forEach((clients) => clients.delete(client));
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(@MessageBody() data: { gameCode: string }, @ConnectedSocket() client: Socket) {
    const { gameCode } = data;
    console.log(`📡 [join-game] Client ${client.id} joining game: ${gameCode}`);

    // Add client to game room
    const roomName = `game-${gameCode}`;
    if (!this.gameConnections.has(gameCode)) {
      this.gameConnections.set(gameCode, new Set());
    }
    const connections = this.gameConnections.get(gameCode);
    if (connections) {
      connections.add(client);
    }
    client.join(roomName);

    // Get current game state
    const game = await this.gameService.getGame(gameCode);
    console.log(`📡 [join-game] Game retrieved:`, { code: game?.code, hasPlayers: !!game?.players });
    if (game) {
      // Send confirmation to the client that just joined
      console.log(`📡 [join-game] Emitting 'joined-game' to client ${client.id}`);
      client.emit('joined-game', game);
      // Broadcast to all players in game that someone joined
      console.log(`📡 [join-game] Broadcasting 'player-joined' to all in room ${roomName}`);
      this.broadcastToGame(gameCode, 'player-joined', { game });
    }
  }

  @SubscribeMessage('game-started')
  async handleGameStarted(@MessageBody() data: { gameCode: string }, @ConnectedSocket() client: Socket) {
    const { gameCode } = data;
    const game = await this.gameService.getGame(gameCode);
    if (game) {
      this.broadcastToGame(gameCode, 'game-started', { game, round: game.rounds?.[0] });
    }
  }

  @SubscribeMessage('answer-submitted')
  async handleAnswerSubmitted(
    @MessageBody() data: { gameCode: string; roundId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameCode } = data;
    const game = await this.gameService.getGame(gameCode);
    if (game) {
      this.broadcastToGame(gameCode, 'answer-submitted', { game });
    }
  }

  @SubscribeMessage('next-round')
  async handleNextRound(@MessageBody() data: { gameCode: string }, @ConnectedSocket() client: Socket) {
    const { gameCode } = data;
    await this.gameService.nextRound(gameCode);

    const game = await this.gameService.getGame(gameCode);
    if (!game) {
      return;
    }

    if (game.status === 'FINISHED') {
      const leaderboard = [...game.players].sort((a, b) => b.score - a.score);
      this.broadcastToGame(gameCode, 'game-finished', { game, leaderboard });
      return;
    }

    const round = game.rounds?.find((r) => r.roundNumber === game.currentRound) || null;
    this.broadcastToGame(gameCode, 'next-round', { game, round });
  }

  private broadcastToGame(gameCode: string, event: string, data: any) {
    const roomName = `game-${gameCode}`;
    const clients = this.gameConnections.get(gameCode);
    if (clients) {
      clients.forEach((client) => {
        client.emit(event, data);
      });
    }
  }

  // Public method for controller to broadcast events
  broadcastToGamePublic(gameCode: string, event: string, data: any) {
    this.broadcastToGame(gameCode, event, data);
  }
}
