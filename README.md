# The Song Game

Et multiplayer quiz-spill hvor du tester dine musikk- og filmkunnskaper! Spillet lar deg opprette eller bli med i et spill, og konkurrere om å gjette riktige filmer eller TV-serier basert på kjente låter og temamusikk.

## Funksjoner

- Opprett eller bli med i spill med venner
- Velg kategori: Film eller TV-serier
- Spill flere runder med 30-sekunders musikkklipp
- Svar og få poeng for riktige svar og rask respons
- Live oppdateringer via WebSocket
- Resultater og vinneroversikt

## Teknologier

- **Backend:** NestJS (TypeScript), Prisma, Socket.io, PostgreSQL
- **Frontend:** Next.js (React), Tailwind CSS, Zustand, Socket.io-client
- **Database:** PostgreSQL, Prisma ORM

## Oppsett

### 1. Klon repo

```bash
git clone https://github.com/jakobhonstad/the-song-game.git
cd the-song-game
```


### 2. Backend

```bash
cd backend
npm install
```



#### Databasealternativer (velg én)

**A. Lokal PostgreSQL**

1. Installer PostgreSQL (macOS):
	```bash
	brew install postgresql
	brew services start postgresql
	```
2. Opprett database:
	```bash
	createdb songgame
	```
3. Connection string:
	```
	postgresql://<bruker>:<passord>@localhost:5432/songgame
	```
	(Bytt ut `<bruker>` og `<passord>` med din lokale PostgreSQL-bruker og passord)

**B. Neon (cloud)**

1. Opprett konto og prosjekt på [neon.tech](https://neon.tech)
2. Opprett database (f.eks. `songgame`)
3. Finn "Connection string" i prosjektet:
	```
	postgresql://<bruker>:<passord>@ep-...neon.tech/<database>?sslmode=require
	```

#### Miljøvariabler
Opprett `.env`-fil i `backend` med:

```
DATABASE_URL="<din_connection_string>"
```
Bruk connection string fra alternativet du har valgt.

#### Database migrering og seeding
1. Kjør migrering:
	```bash
	npx prisma migrate dev
	```
2. Seed database med sanger:
	```bash
	npm run prisma:seed
	```

### 3. Frontend

```bash
cd ../frontend
npm install
```

#### Miljøvariabler
Opprett `.env.local` i `frontend` med:

```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Kjøre prosjektet

### Backend
```bash
cd backend
npm run start:dev
```

### Frontend
```bash
cd frontend
npm run dev
```

Frontend vil være tilgjengelig på [http://localhost:3000](http://localhost:3000)
Backend kjører på [http://localhost:3001](http://localhost:3001)

## Kontakt

Utvikler: Jakob Hammari Onstad
GitHub: [jakobhonstad](https://github.com/jakobhonstad)

---
> The Song Game © 2026
