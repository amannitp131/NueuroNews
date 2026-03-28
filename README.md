# NeuroNews

NeuroNews is a full-stack business intelligence app that turns live multi-source business news into personalized insights.

It includes:
- user authentication (signup/login + JWT)
- profile-driven personalization
- live news scraping and ingestion
- AI summary and RAG chat
- story arc tracking
- AI prediction engine (hybrid rules + LLM)
- AI video package generation for news explainers

## Complete Feature List

### Authentication and user management

- signup with hashed password storage in MongoDB
- login with JWT token generation
- session restoration on frontend via stored auth token
- current-user endpoint for auth refresh (`/api/auth/me`)
- protected routes across profile/news/ai/story APIs

### Profile and personalization

- profile capture: name, profession, interests, goals
- profile upsert endpoint for edits (`/api/profiles/me`)
- personalized feed ranking by profile interests and sectors
- personalized prompt context for AI summary and AI chat

### News ingestion and enrichment

- live multi-source RSS scraping and article extraction
- manual article ingestion API (`/api/news/ingest`)
- automatic fallback scrape when personalized feed is empty
- NLP enrichment on ingest:
  - entity extraction
  - sentiment scoring
- persistence in MongoDB with story arc linkage

### RAG and AI intelligence

- semantic chunking and embedding pipeline
- vector retrieval with Pinecone support
- local in-memory vector fallback when Pinecone is not configured
- personalized article summary endpoint (`/api/ai/summarize`)
- grounded Q&A over indexed news (`/api/ai/chat`)

### Prediction engine

- endpoint: `/api/ai/predict`
- accepts existing article (`articleId`) or raw article text
- hybrid system:
  - deterministic rule signals
  - historical pattern matching from stored ET articles
  - LLM scenario reasoning
- output includes:
  - possible future outcomes
  - market impact view
  - confidence level
  - watch signals

### Video generation engine

- endpoint: `/api/ai/video/generate`
- accepts existing article (`articleId`) or raw article text
- generates structured video package:
  - hook and script
  - scene-by-scene narration and frame prompts
  - key takeaways and disclaimer
- supports configurable tone and target duration

### Story arc intelligence

- story arc discovery and tracking
- timeline endpoint for each story (`/api/stories/:id/timeline`)
- sentiment trend tracking across story evolution
- quick arc-tracking trigger (`/api/stories/track`)

### Frontend experience

- modern responsive navigation with auth-aware links
- hero, login, and register pages
- dashboard with personalized feed cards
- world snapshot panel (macro pulse style view)
- article detail page with:
  - AI summary generation
  - impact analysis and predictions panel
  - follow-up AI Q&A chat panel
- story arc page with arc selector and timeline board
- profile editor with validation and structured inputs

### Developer and operations features

- one-command seed flow (`npm run seed`) from multiple business sources
- Docker Compose support (frontend + backend + MongoDB)
- environment-driven configuration for models/providers
- modular backend architecture (controllers/services/routes)
- dedicated backend docs for prompting, prediction, and video generation

## Tech Stack

- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS, Recharts
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- AI: Gemini APIs (generation + embeddings)
- Vector store: Pinecone (optional) with local in-memory fallback

## Repository Structure

```text
Economic_times/
  backend/
    src/
      config/
      controllers/
      data/
      middleware/
      models/
      routes/
      services/
      utils/
  frontend/
    app/
    components/
    lib/
  docker-compose.yml
  README.md
```

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Optional initial data seed:

```bash
npm run seed
```

Backend runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Docker Setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up --build
```

Services:
- frontend: `http://localhost:3000`
- backend: `http://localhost:5000`
- mongo: `localhost:27017`

## Environment Variables

### Backend (`backend/.env`)

Required for full AI features:
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`

Common:
- `PORT` (default `5000`)
- `NODE_ENV`
- `GEMINI_MODEL`
- `GEMINI_EMBEDDING_MODEL`
- `VECTOR_STORE_PROVIDER` (`local` or `pinecone`)
- `TOP_K`

Pinecone (optional):
- `PINECONE_API_KEY`
- `PINECONE_INDEX`
- `PINECONE_CLOUD`
- `PINECONE_REGION`

Scraping/media options:
- `ECONOMIC_TIMES_RSS_URL`
- `NEWS_RSS_SOURCES` (optional JSON array of `{ "name": "Source", "rssUrl": "https://..." }`)
- `SCRAPER_USER_AGENT`
- `SCRAPE_FETCH_FULL_ARTICLE`
- `TTS_PROVIDER`
- `ELEVENLABS_API_KEY`
- `TTS_VOICE_ID`
- `FRAME_PROVIDER`
- `FRAME_MODEL`

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_BASE_URL` (default used in code: `http://localhost:5000/api`)

## API Overview

Base path: `/api`

### Auth (public)

- `POST /auth/signup`
  - body: `email`, `name`, `password`
  - optional body: `profession`, `interests`, `goals`
  - returns: JWT token + user payload

- `POST /auth/login`
  - body: `email`, `password`
  - returns: JWT token + user payload

- `GET /auth/me`
  - auth: required
  - returns current user

### Profile (auth required)

- `GET /profiles/me`
- `POST /profiles/me`
  - required body fields: `name`, `profession`, `interests`
  - optional: `goals`, `preferredRegions`, `preferredSectors`

### News (auth required)

- `GET /news/feed`
  - returns personalized feed from profile interests/sectors
  - auto-scrapes multiple sources and retries when feed is sparse
  - supports optional query params: `page`, `limit`

- `GET /news/:id`
- `POST /news/ingest`
- `POST /news/scrape`

### AI (auth required)

- `POST /ai/summarize` (body: `articleId`)
- `POST /ai/chat` (body: `question`)
- `POST /ai/predict`
- `POST /ai/video/generate`

### Stories (auth required)

- `GET /stories`
- `GET /stories/:id`
- `GET /stories/:id/timeline`
- `POST /stories/track`

## Product Flow

1. User signs up or logs in.
2. User updates profile (profession, interests, goals).
3. Backend fetches/scrapes articles, enriches with NLP metadata, and links story arcs.
4. Articles are indexed for RAG (Pinecone or local vector fallback).
5. User reads feed, opens article detail, generates AI summary, and asks chat questions.

## Frontend Routes

- `/` hero page
- `/login` login page
- `/signup` register page
- `/dashboard` main intelligence view
- `/news/[id]` article + AI summary/chat
- `/story-arcs` story tracking
- `/profile` profile editor

## Scripts

### Backend

- `npm run dev` start backend with nodemon
- `npm run start` start backend in production mode
- `npm run seed` scrape + index seed articles

### Frontend

- `npm run dev` start next dev server
- `npm run build` production build
- `npm run start` serve production build

## Known Gaps / Next Improvements

- add request validation beyond required-field checks
- add automated tests (backend integration + frontend e2e/smoke)
- add rate limiting for auth and scrape routes
- add structured logging and observability
- move local vector fallback to persistent storage for production usage

## License

This project is for educational/prototype use unless a separate license is provided.
