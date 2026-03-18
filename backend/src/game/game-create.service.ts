import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateGameDto } from "./dto/game.dto";

function generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

@Injectable()
export class GameCreateService {
    constructor(private prisma: DatabaseService) { }

    async createGame(createGameDto: CreateGameDto, hostId: string) {
        const code = generateGameCode();

        const game = await this.prisma.game.create({
            data: {
                code,
                hostId,
                category: createGameDto.category,
                maxRounds: createGameDto.maxRounds || 10,
                players: {
                    create: {
                        id: hostId,
                        name: createGameDto.hostName,
                        isHost: true,
                    }
                }
            },
            include: {
                players: true,
                rounds: true
            }
        })
        return game;
    }
};
