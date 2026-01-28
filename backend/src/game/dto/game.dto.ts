export class CreateGameDto {
  category: string;
  maxRounds?: number;
}

export class JoinGameDto {
  code: string;
  playerName: string;
}

export class StartGameDto {
  code: string;
}

export class SubmitAnswerDto {
  gameCode: string;
  roundId: string;
  playerId: string;
  guess: string;
  timeElapsed: number;
}
