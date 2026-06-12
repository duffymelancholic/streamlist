# StreamList

A Netflix-style movie browsing app where users can sign up, browse movies by genre, search for titles, and maintain a personal watchlist. Movie data is powered by the TMDB API.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs, stored in client cookie |
| Movie Data | TMDB API (proxied through Node backend) |

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- A TMDB API key (free at https://www.themoviedb.org/settings/api)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd streamlist
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/streamlist"
JWT_SECRET="your-secret-key-here"
TMDB_API_KEY="your-tmdb-api-key-here"
```

Run the database migration and start the server:
```bash
npx prisma migrate dev
npm run dev
```

Backend runs on **http://localhost:4000**

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

### 4. Open the app
Visit http://localhost:3000 — you will be redirected to the login page. Create an account and start browsing.

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | backend/.env | PostgreSQL connection string |
| `JWT_SECRET` | backend/.env | Secret key used to sign JWT tokens |
| `TMDB_API_KEY` | backend/.env | Your TMDB API key |

---

## Database Schema

The schema lives in `backend/prisma/schema.prisma`. To recreate the database from scratch:

```bash
cd backend
npx prisma migrate dev --name init
```

The two tables are:
- **User** — stores email and bcrypt-hashed password
- **ListItem** — stores a user's saved movies (tmdbId, title, posterPath), with a unique constraint per user+movie pair

---

## Decisions & Tradeoffs

1. **JWT in a client-side cookie vs. httpOnly cookie** — I chose a client-side cookie (set via `document.cookie`) rather than a `httpOnly` cookie because the frontend and backend run on different ports during development. Configuring `httpOnly` cookies across origins requires strict CORS `credentials: include` setup on both ends. For a production deployment on the same domain, I would switch to `httpOnly` cookies for better XSS protection.

2. **Prisma as ORM** — Prisma provides type-safe database access and handles migrations cleanly. The tradeoff is that it adds a build step (`prisma generate`) and the schema definition is more verbose than raw SQL for simple tables.

3. **All TMDB calls go through the Node backend** — The frontend never talks to TMDB directly. This keeps the TMDB API key server-side only (never exposed in the browser) and allows us to shape the data before it reaches the client.

4. **No pagination yet** — TMDB returns paginated results; for now the Browse page only loads page 1. Infinite scroll or a "Load More" button would be the next improvement.

---

## What's Not Finished
- Deploy to a live URL (setup instructions above serve as the substitute)
- Pagination / infinite scroll on Browse
