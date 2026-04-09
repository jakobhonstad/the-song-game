import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, MaxLength } from 'class-validator';


export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  hostName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRounds?: number;
}

export class JoinGameDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  playerName: string;
}

export class StartGameDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class SubmitAnswerDto {
  @IsNotEmpty()
  @IsString()
  gameCode: string;

  @IsNotEmpty()
  @IsString()
  roundId: string;

  @IsNotEmpty()
  @IsString()
  playerId: string;

  @IsString()
  guess: string;

  @IsNumber()
  @Min(0)
  timeElapsed: number;
}
