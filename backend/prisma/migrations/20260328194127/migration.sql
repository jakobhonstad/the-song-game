/*
  Warnings:

  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Round` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_roundId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_gameId_fkey";

-- DropTable
DROP TABLE "Answer";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "Player";

-- DropTable
DROP TABLE "Round";

-- DropTable
DROP TABLE "Song";

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOBBY',
    "category" TEXT NOT NULL DEFAULT 'film',
    "max_rounds" INTEGER NOT NULL DEFAULT 10,
    "current_round" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "song_id" TEXT NOT NULL,
    "song_title" TEXT NOT NULL,
    "song_artist" TEXT,
    "category" TEXT NOT NULL,
    "preview_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "guess" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "time_elapsed" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "movie" TEXT,
    "tvShow" TEXT,
    "spotify_id" TEXT,
    "preview_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_code_key" ON "game"("code");

-- CreateIndex
CREATE INDEX "game_code_idx" ON "game"("code");

-- CreateIndex
CREATE INDEX "player_game_id_idx" ON "player"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_game_id_name_key" ON "player"("game_id", "name");

-- CreateIndex
CREATE INDEX "round_game_id_idx" ON "round"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "round_game_id_round_number_key" ON "round"("game_id", "round_number");

-- CreateIndex
CREATE INDEX "answer_round_id_idx" ON "answer"("round_id");

-- CreateIndex
CREATE INDEX "answer_player_id_idx" ON "answer"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "answer_round_id_player_id_key" ON "answer"("round_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "song_spotify_id_key" ON "song"("spotify_id");

-- CreateIndex
CREATE INDEX "song_category_idx" ON "song"("category");

-- CreateIndex
CREATE INDEX "song_title_idx" ON "song"("title");

-- CreateIndex
CREATE UNIQUE INDEX "song_title_artist_key" ON "song"("title", "artist");

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
