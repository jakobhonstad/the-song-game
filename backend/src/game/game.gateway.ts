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
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket'],
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private gameConnections = new Map<string, Set<Socket>>();

  constructor(private gameService: GameService, private prisma: PrismaService) {}

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
    if (game) {
      // Broadcast to all players in game that someone joined
      this.broadcastToGame(gameCode, 'player-joined', { game });
    }
  }

  @SubscribeMessage('game-started')
  async handleGameStarted(@MessageBody() data: { gameCode: string }, @ConnectedSocket() client: Socket) {
    const { gameCode } = data;
    const game = await this.gameService.getGame(gameCode);
    if (game) {
      this.broadcastToGame(gameCode, 'game-started', { game });
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
    const game = await this.gameService.getGame(gameCode);
    if (game) {
      this.broadcastToGame(gameCode, 'round-changed', { game });
    }
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
}
