This project is still under development. There are bugs and unfinished work.
Deezer is used for song previews

# The Song Game 🎵

A multiplayer music‑quiz web app with real‑time updates.

## Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Socket.IO Client

**Backend**
- NestJS
- TypeScript
- Socket.IO
- Prisma ORM

**Database**
- PostgreSQL
- Prisma

## What it does

- Create a game and share a code
- Players join with the code
- Real‑time updates during the game
- Scores and results at the end

## Quick start

### Requirements
- Node.js 18+
- npm or pnpm
- PostgreSQL

### Setup

1. Clone the repo:
```bash
git clone https://github.com/jakobhonstad/the-song-game.git
cd the-song-game
```

2. Backend:
```bash
cd backend
npm install

# Create .env
echo 'DATABASE_URL="postgresql://user:password@host/dbname"' > .env

# Migrate
npx prisma migrate dev

# Seed songs
npm run prisma:seed
```

3. Frontend:
```bash
cd ../frontend
npm install

# Create .env.local
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local
echo 'NEXT_PUBLIC_WS_URL=ws://localhost:3001' >> .env.local
```

4. Run dev servers:
```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
cd frontend
npm run dev
```

5. Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## Project structure

```
backend/
	src/
		game/
			game.controller.ts   # REST endpoints for games
			game.gateway.ts      # WebSocket events
			game.module.ts       # Game module wiring
			game.service.ts      # Orchestrator for game logic
			game-players.service.ts  # Player/join/create logic
			game-rounds.service.ts   # Round lifecycle logic
			game-answers.service.ts  # Answer validation/scoring
			dto/
				game.dto.ts
		database/
			database.module.ts
			database.service.ts
		songs/
			songs.controller.ts
			songs.service.ts
		utils/
			deezer.ts
	prisma/
		schema.prisma
		seed.ts

frontend/
	src/
		app/                  # Route-based pages (Next.js App Router)
			page.tsx            # /
			create/page.tsx     # /create
			join/page.tsx       # /join
			game/[code]/page.tsx  # /game/:code
		components/
			game/
				GamePlay.tsx
				RoundPlay.tsx
				RoundResults.tsx
				Lobby.tsx
				GameResults.tsx
				hooks/
					useAudioPreview.ts
					useRoundTimer.ts
					useSongSearch.ts
		lib/
			store/
				game-store.ts
		types/
			game.ts
```

## Environment variables

**Backend (.env)**
- `DATABASE_URL` – PostgreSQL connection string
- `PORT` – Optional (default: 3001)

**Frontend (.env.local)**
- `NEXT_PUBLIC_API_URL` – HTTP API base URL
- `NEXT_PUBLIC_WS_URL` – WebSocket base URL

> Both point to the same port because the backend serves HTTP and WebSocket.

## Scripts

**Backend**
- `npm run start:dev`
- `npm run start`
- `npm run build`
- `npm run prisma:seed`

**Frontend**
- `npm run dev`
- `npm run build`
- `npm run start`

## API

**REST (port 3001)**
- `POST /api/games` – Create game
- `POST /api/games/join` – Join game
- `GET /api/games/:code` – Get game
- `POST /api/games/:code/start` – Start game
- `POST /api/games/:code/next-round` – Next round
- `POST /api/games/submit-answer` – Submit answer
- `POST /api/games/cleanup` – Cleanup old games
- `GET /api/songs/search` – Search songs

**Header (optional)**
- `x-player-id` – Keep the same player ID between calls

**WebSocket events**
Client → Server: `join-game`, `game-started`, `answer-submitted`, `next-round`

Server → Client: `joined-game`, `player-joined`, `game-started`, `answer-submitted`, `next-round`, `round-end`, `game-finished`

## License

Not specified.

## Developer Guide

For a full technical walkthrough in Norwegian, see `DEVELOPER_GUIDE.md`.
