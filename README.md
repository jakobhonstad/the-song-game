# The Song Game 🎵

En multiplayer musikk-quiz webapplikasjon bygget med moderne teknologier.

## 🚀 Teknologi Stack

### Frontend
- **Next.js 14+** (App Router) - React framework med server-side rendering
- **TypeScript** - Type-safe utvikling
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - Runtime type validation
- **WebSocket Client** - Real-time kommunikasjon

### Backend
- **Hono** - Moderne, lett web framework
- **TypeScript** - Type-safe API
- **WebSocket** - Real-time spill-oppdateringer
- **Zod** - Input validation

### Database
- **PostgreSQL** - Relasjonsdatabase
- **Prisma ORM** - Type-safe database queries

## 🎮 Funksjoner

- **Kategorier**: Velg mellom ulike musikkategorier (Film, TV-serier, etc.)
- **Multiplayer**: Spillere logger inn med en spillkode
- **Real-time**: Live oppdateringer under spillet
- **Autocomplete**: Intelligente søkeforslag når spillere gjetter
- **Scoreboard**: Poeng-system og resultattavle
- **Musikkavspilling**: Avspilling av temalåter

## 📁 Prosjektstruktur

```
the-song-game/
├── frontend/          # Next.js applikasjon
│   ├── src/
│   │   ├── app/      # App Router pages
│   │   ├── components/
│   │   ├── lib/      # Utilities og helpers
│   │   └── types/    # TypeScript types
│   └── package.json
│
├── backend/          # Hono API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   ├── db/       # Prisma setup
│   │   └── websocket/# WebSocket handler
│   └── package.json
│
└── README.md
```

## 🛠️ Kom i gang

### Forutsetninger
- Node.js 18+
- PostgreSQL 14+
- pnpm (anbefalt) eller npm

### Installasjon

1. Klon repository:
```bash
git clone https://github.com/jakobhonstad/the-song-game.git
cd the-song-game
```

2. Installer avhengigheter:
```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

3. Sett opp database:
```bash
cd backend
cp .env.example .env
# Rediger .env med dine database credentials
pnpm prisma migrate dev
```

4. Start utviklingsservere:
```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

## 📝 TODO

- [ ] Sett opp prosjektstruktur
- [ ] Implementer backend API
- [ ] Implementer WebSocket for real-time
- [ ] Lag frontend komponenter
- [ ] Implementer spillogikk
- [ ] Legge til musikkavspilling
- [ ] Lage autocomplete-funksjonen
- [ ] Implementere scoreboard
- [ ] Testing
- [ ] Deployment

## 📄 Lisens

MIT
