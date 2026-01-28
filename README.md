# The Song Game 🎵

En multiplayer musikk-quiz webapplikasjon bygget med moderne teknologier.

## 🚀 Teknologi Stack

### Frontend
- **Next.js 15** (App Router) - React framework med server-side rendering
- **TypeScript** - Type-safe utvikling
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Socket.IO Client** - Real-time kommunikasjon

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe API
- **Socket.IO** - Real-time spill-oppdateringer
- **Prisma ORM** - Type-safe database queries

### Database
- **PostgreSQL (Neon)** - Cloud-hosted PostgreSQL database (gratis tier)
- **Prisma** - Type-safe database client

## 🎮 Funksjoner

- **Kategorier**: Velg mellom ulike musikkategorier (Film, TV-serier, etc.)
- **Multiplayer**: Spillere logger inn med en spillkode
- **Real-time**: Live oppdateringer under spillet via WebSocket
- **Autocomplete**: Intelligente søkeforslag når spillere gjetter
- **Scoreboard**: Poeng-system og resultattavle
- **Persistent Storage**: Alle spill og resultater lagres i PostgreSQL database

## 📁 Prosjektstruktur

```
the-song-game/
├── frontend/          # Next.js applikasjon
│   ├── src/
│   │   ├── app/      # App Router pages
│   │   ├── components/
│   │   ├── lib/      # Utilities og store (Zustand)
│   │   └── types/    # TypeScript types
│   └── package.json
│
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── game/     # Game module (controller, service, gateway)
│   │   ├── songs/    # Songs module
│   │   ├── prisma/   # Prisma service
│   │   └── main.ts   # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seed.ts        # Database seeding
│   │   └── migrations/    # Database migrations
│   └── package.json
│   └── package.json
│
└── README.md
```

## 🛠️ Kom i gang

### Forutsetninger
- Node.js 18+
- npm eller pnpm
- PostgreSQL database (eller bruk Neon gratis tier)

### Installasjon

1. Klon repository:
```bash
git clone https://github.com/jakobhonstad/the-song-game.git
cd the-song-game
```

2. Sett opp backend:
```bash
cd backend
npm install

# Opprett .env fil med database connection string
echo 'DATABASE_URL="postgresql://user:password@host/dbname"' > .env

# Kjør database migrations
npx prisma migrate dev

# Seed database med sanger
npm run prisma:seed
```

3. Sett opp frontend:
```bash
cd ../frontend
npm install

# Opprett .env.local fil
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local
echo 'NEXT_PUBLIC_WS_URL=ws://localhost:3001' >> .env.local
```

4. Start utviklingsservere:
```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run start:dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

5. Åpne applikasjonen:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## 🏗️ Database Schema

Database bruker Prisma ORM med følgende modeller:
- **Game**: Spillinformasjon (kode, status, kategori, runder)
- **Player**: Spillerinformasjon (navn, score, host-status)
- **Round**: Runde-informasjon (runde nummer, sang, svar)
- **Answer**: Spiller-svar (gjett, korrekthet, poeng, tid)
- **Song**: Sang-bibliotek (tittel, artist, kategori)

## 🎯 API Endpoints

### REST API (port 3001)
- `POST /api/games` - Opprett nytt spill
- `POST /api/games/join` - Join eksisterende spill
- `GET /api/games/:code` - Hent spillinformasjon
- `POST /api/games/:code/start` - Start spillet
- `POST /api/games/:code/next-round` - Gå til neste runde
- `POST /api/games/submit-answer` - Send inn svar
- `GET /api/songs/search` - Søk etter sanger

### WebSocket Events
- `join-game` - Koble til spill-rom
- `player-joined` - Ny spiller joined
- `game-started` - Spill startet
- `next-round` - Neste runde
- `answer-submitted` - Svar sendt inn
- `round-end` - Runde ferdig
- `game-finished` - Spill ferdig

## 📝 Completed Features

- ✅ NestJS backend med TypeScript
- ✅ PostgreSQL database på Neon (gratis tier)
- ✅ Prisma ORM for database access
- ✅ Socket.IO for real-time kommunikasjon
- ✅ REST API for spill-operasjoner
- ✅ Next.js frontend med App Router
- ✅ Zustand state management
- ✅ Tailwind CSS styling med glassmorphism design
- ✅ Multiplayer lobby system
- ✅ Real-time player updates
- ✅ Game code system for joining
- ✅ Song search with autocomplete
- ✅ Two-tab testing support (Incognito mode)

## 🚧 TODO

- [ ] Implementer musikkavspilling
- [ ] Test full game flow (alle 10 runder)
- [ ] Implementer round progression
- [ ] Legg til game-finished state og final results
- [ ] Forbedre error handling
- [ ] Legg til loading states
- [ ] Deployment på Vercel (frontend) og Railway/Render (backend)
- [ ] Legg til flere sanger i databasen
- [ ] Implementer flere kategorier (TV, sport, etc.)

## 📄 Lisens

MIT
