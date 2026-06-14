# StreamList: Architectural Overview & Tech Stack

This document serves as the technical blueprint for **StreamList**, a Netflix-style streaming web application. It outlines the core architecture, data flows, technology choices, and the rationale behind them.

## 1. System Architecture Overview

StreamList uses a decoupled **Client-Server Architecture**, specifically tailored for a modern single-page application (SPA) experience with robust backend security.

The system is broken into three main layers:
1. **Frontend (Presentation Layer)**: Next.js + React. Handles UI rendering, client-side routing, and state management.
2. **Backend (Application Layer)**: Node.js + Express. Handles business logic, authentication, and acts as an API proxy.
3. **Database (Data Layer)**: PostgreSQL + Prisma ORM. Handles persistent storage of user credentials and user-specific data (watchlists).

### Third-Party Integrations
- **TMDB (The Movie Database) API**: Provides the source of truth for all movie metadata (titles, overviews, ratings, and image paths).

---

## 2. Tech Stack & Rationale

### Frontend
- **Next.js 14 (App Router)**: Used to structure the application. While heavily relying on client-side rendering (`'use client'`) for stateful interactions (like modals and auth state), Next.js provides file-based routing and a robust built-in middleware system.
- **React 18**: Powers the component-driven UI (e.g., `MovieCard`, `MovieModal`, `Navbar`).
- **Tailwind CSS**: Utility-first CSS framework. Allows for rapid, inline styling to match modern UI aesthetics (dark mode, glassmorphism overlays, responsive grids) without managing complex stylesheets.
- **Why this stack?**: Next.js + React is the industry standard for modern web applications. It allows for extremely fast development cycles and component reusability. Tailwind ensures the app looks polished without writing boilerplate CSS.

### Backend
- **Node.js + Express (v5)**: A lightweight, unopinionated framework for building RESTful APIs.
- **JSON Web Tokens (JWT) & bcryptjs**: Used for stateless authentication and secure password hashing.
- **dotenv**: Manages environment-specific configuration (database URLs, secret keys).
- **Why this stack?**: Express is fast to set up and highly flexible. Node.js allows the entire stack (front to back) to be written in TypeScript/JavaScript, reducing context switching for developers.

### Database
- **PostgreSQL**: A highly reliable, open-source relational database.
- **Prisma (v7)**: A next-generation Node.js and TypeScript ORM (Object-Relational Mapper).
- **Why this stack?**: Relational databases are perfect for highly structured user data. Prisma provides absolute type safety from the database schema up to the Express routes, preventing runtime errors and accelerating database schema design.

---

## 3. Core Mechanisms & Inner Workings

### 3.1 Authentication Flow (Stateless JWT via Cookie)
Auth is the most critical part of the application. We use a **stateless** authentication pattern:
1. **Signup/Login**: The user submits their credentials. The backend verifies the hash via `bcrypt` and generates a JWT signed with a secret (`JWT_SECRET`).
2. **Cookie Storage**: Instead of storing the JWT in `localStorage` (which is vulnerable to XSS), the frontend sets the token in `document.cookie`.
3. **Next.js Middleware**: Every page navigation on the frontend passes through `frontend/src/middleware.ts`. If a user attempts to access `/browse` or `/mylist` without a valid cookie, the middleware intercepts the navigation and redirects them to `/login`.
4. **Backend Middleware**: Every protected API route (e.g., `/api/list/add`) runs through `backend/src/middleware/auth.ts`, which extracts the token from the `Authorization: Bearer <token>` header, decodes the `userId`, and attaches it to the request.

### 3.2 The TMDB Proxy Pattern
Instead of the frontend making fetch requests directly to the TMDB API, **all requests go through our Express backend**.
* **Flow**: Frontend -> Express Backend -> TMDB API -> Express Backend -> Frontend.
* **Why we did this**:
  1. **Security**: The TMDB API Key (`TMDB_API_KEY`) is kept safely on the backend. If the frontend queried TMDB directly, the API key would be exposed to the public in the browser's network tab.
  2. **Data Aggregation**: The backend can fetch multiple categories simultaneously (Trending, Action, Comedy) using `Promise.all` and return them in a single, unified JSON payload (`/api/movies/browse`). This reduces the number of network requests the frontend has to make, speeding up load times.

### 3.3 Watchlist Syncing & Error Handling
The watchlist uses an **optimistic UI update pattern** guarded by server validation:
1. When a user clicks "+ My List", the frontend immediately sends a `POST` request to the backend.
2. The UI *waits* for the `res.ok` (HTTP 200 OK) response.
3. Once the database confirms the save via Prisma, the frontend updates React state.
4. If the backend throws a `401 Unauthorized` (e.g., token expired), the frontend catches it, instantly clears the stale cookie, and safely redirects the user back to `/login`.

### 3.4 Database Schema Architecture
We keep the schema normalized and simple:
- **User Model**: Stores `id` (UUID), `email` (Unique), and `password` (Hashed).
- **ListItem Model**: Stores `id`, `userId`, and minimal TMDB metadata (`tmdbId`, `title`, `posterPath`).
- **Relational Integrity**: A `@relation` connects `User` to `ListItem`. A composite unique constraint `@@unique([userId, tmdbId])` ensures a user cannot accidentally add the same movie to their list twice at the database level.

---

## 4. Key Decisions & Trade-offs

- **Why didn't we use Next.js Server Actions or API routes for the backend?**
  We opted for a completely separate Express backend (`/backend`) to cleanly decouple the API from the frontend. This mimics enterprise architecture where the frontend team and backend team can deploy independently, and allows the backend to be easily scaled or swapped out later.
- **Why are images hosted externally?**
  We save `posterPath` strings to the database instead of storing actual image files. We rely on TMDB's CDN (Content Delivery Network) to serve the images. This drastically reduces our database storage costs and improves image loading speeds globally.

## Summary
StreamList is built for speed, security, and scalability. By proxying requests through a custom Node backend, securing routes with JWTs, and enforcing relational integrity with Prisma, the architecture mirrors professional-grade web applications.
