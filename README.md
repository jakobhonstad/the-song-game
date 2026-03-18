# The Song Game 🎵

En multiplayer musikkquiz med sanntidsoppdateringer.

## Teknologi

**Frontend**
- Next.js 16 (App Router)
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

## Funksjoner

- Opprett spill og del kode
- Spillere kan bli med med kode
- Sanntidsoppdateringer under spillet
- Poeng og resultater

## Kom i gang

### Krav
- Node.js 18+
- npm eller pnpm
- PostgreSQL


### Oppsett

1. Klon repo:
```bash
git clone https://github.com/jakobhonstad/the-song-game.git
cd the-song-game
```

2. Installer avhengigheter:

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

3. Sett opp PostgreSQL:

- Installer PostgreSQL:
	- macOS: `brew install postgresql`
	- Ubuntu: `sudo apt install postgresql`
- Start tjenesten:
	- macOS: `brew services start postgresql`
	- Ubuntu: `sudo service postgresql start`
- Opprett database:
```bash
psql -U postgres
CREATE DATABASE songgame;
```
	- Finn connection string (typisk):
	```
	postgresql://postgres:<passord>@localhost:5432/songgame
	```
	- Legg til connection string i backend/.env:
		```
		DATABASE_URL="postgresql://postgres:<passord>@localhost:5432/songgame"
		```

4. Konfigurer miljøvariabler:

**Frontend:**
- Legg til .env.local i frontend-mappen:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**Backend:**
- Connection string i schema.prisma.

5. Initialiser database:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

6. Start prosjektet:

**Backend:**
```bash
cd backend
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Frontend kjører på http://localhost:3000 og backend på http://localhost:3001.

### Filstruktur

- backend/
	- src/
	- prisma/
	- package.json
- frontend/
	- src/
	- package.json

### Viktige filer

- frontend/.env.local (må opprettes)
- backend/prisma/schema.prisma
- backend/prisma/seed.ts

### Avhengigheter

Se package.json i både backend og frontend for fullstendig liste.

### Tips
- Restart frontend etter endring i .env.local.
- Bruk IP-adresse i .env.local hvis du tester på nettverk.

### Feilsøking
- Sjekk at backend kjører og lytter på riktig port.
- Sjekk at frontend bruker riktig API-URL.
- Sjekk at du har dynamisk route: frontend/src/app/game/[code]/page.tsx.

---
Prosjektet er under utvikling. Deezer brukes for sangpreviews.

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
				game-socket.ts
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
