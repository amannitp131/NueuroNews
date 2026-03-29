# NeuroNews

> Real-time business news intelligence that does not just summarize headlines, it predicts what happens next.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-3c873a)](#tech-stack)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-4ea94b)](#tech-stack)
[![AI](https://img.shields.io/badge/AI-Gemini%20%2B%20RAG-orange)](#ai--intelligence-layer)
[![Docker](https://img.shields.io/badge/DevOps-Docker%20Compose-2496ed)](#run-with-docker)

NeuroNews is a full-stack AI platform built for hackathon impact. It ingests live business news, personalizes intelligence by user profile, reasons over stories with retrieval-augmented generation, forecasts market outcomes, and auto-generates short-form explainer video packages.

## Why This Wins Hackathons

- Solves a real problem: information overload in business news.
- Goes beyond summarization: combines retrieval, reasoning, prediction, and actionability.
- End-to-end product: auth, profile onboarding, personalized feed, AI insights, storyline tracking.
- Judges-friendly demo flow: sign up, open article, generate insight, chat, predict, create video.
- Production-minded architecture: modular backend services, optional vector DB, Dockerized stack.

## Core Features

### 1) Personalized News Intelligence

- JWT-based signup/login with protected routes.
- Profile-driven feed ranking using interests, profession, goals, preferred sectors, and regions.
- Auto-refresh workflow that scrapes and enriches content when feeds are sparse.

### 2) Live Ingestion + NLP Enrichment

- Multi-source RSS ingestion and article extraction.
- Manual ingest and scrape triggers through API.
- On-ingest enrichment with entity extraction and sentiment scoring.
- MongoDB persistence with story arc linkage.

### 3) AI + RAG Intelligence Layer

- Semantic chunking and embedding of article corpus.
- Retrieval over Pinecone (optional) with local in-memory fallback.
- Personalized AI article summaries.
- Grounded chat over indexed news context.

### 4) Prediction Engine (Hybrid Reasoning)

- Supports article-based and raw-text predictions.
- Hybrid model combines:
  - deterministic rules
  - historical pattern matching from stored articles
  - LLM scenario reasoning
- Returns outcomes, market impact angle, confidence, and watch signals.

### 5) AI Video Package Generator

- Converts news context into a short explainer-ready package.
- Outputs hook, script, scene plan, narration prompts, and takeaways.
- Supports configurable tone and target duration.

### 6) Story Arc Tracking

- Detects and tracks evolving narratives across related articles.
- Timeline visualization for story progression.
- Sentiment trend evolution over time.

## Demo Narrative (90-Second Pitch)

1. User signs up and defines interests (for example: EV, fintech, geopolitics).
2. Dashboard loads a personalized feed with high-signal business stories.
3. User opens an article and generates AI summary plus follow-up chat.
4. User runs prediction to see possible market scenarios and confidence.
5. User generates a video package to turn insight into creator-ready content.
6. User checks story arc timeline to understand how the narrative is evolving.

## Product Screens and Modules

- Landing and authentication: `/`, `/login`, `/signup`
- Dashboard intelligence hub: `/dashboard`
- Article deep-dive: `/news/[id]`
- Story arc analytics: `/story-arcs`, `/story-arcs/builder`
- Onboarding and profile: `/onboarding`, `/profile`

## API Highlights

Base URL: `/api`

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (auth required)

### Profile

- `GET /profiles/me` (auth required)
- `POST /profiles/me` (auth required)

### News

- `GET /news/feed` (auth required)
- `GET /news/:id` (auth required)
- `POST /news/ingest` (auth required)
- `POST /news/scrape` (auth required)

### AI

- `POST /ai/summarize` (auth required)
- `POST /ai/chat` (auth required)
- `POST /ai/predict` (auth required)
- `POST /ai/video/generate` (auth required)

### Stories

- `GET /stories` (auth required)
- `GET /stories/:id` (auth required)
- `GET /stories/:id/timeline` (auth required)
- `POST /stories/track` (auth required)

## Tech Stack

- Frontend: Next.js 14, React 18, Tailwind CSS, Recharts
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- AI/LLM: Gemini generation + embeddings
- Vector Layer: Pinecone (optional) with local fallback
- DevOps: Docker Compose

## Repository Structure

```text
Economic_times/
  backend/
    docs/
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

## Run Locally

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or cloud)
- Gemini API key

### 1) Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Optional seed for fast demo data:

```bash
npm run seed
```

Backend runs on `http://localhost:5000`.

### 2) Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Run With Docker

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`

## Environment Variables

### Backend (`backend/.env`)

Required:

- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`

Common:

- `PORT` (default: `5000`)
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

Scraping and media options:

- `ECONOMIC_TIMES_RSS_URL`
- `NEWS_RSS_SOURCES` (JSON array format)
- `SCRAPER_USER_AGENT`
- `SCRAPE_FETCH_FULL_ARTICLE`
- `TTS_PROVIDER`
- `ELEVENLABS_API_KEY`
- `TTS_VOICE_ID`
- `FRAME_PROVIDER`
- `FRAME_MODEL`

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:5000/api`)

## NPM Scripts

### Backend

- `npm run dev` - start with nodemon
- `npm run start` - production start
- `npm run seed` - scrape and index seed articles

### Frontend

- `npm run dev` - Next.js dev server
- `npm run build` - production build
- `npm run start` - serve production build
- `npm run lint` - lint frontend

## Architecture Snapshot

```text
Live RSS Sources -> Scraper Service -> NLP Enrichment -> MongoDB
                                            |
                                            v
                                   Chunk + Embed Pipeline
                                            |
                                            v
                               Pinecone / Local Vector Store
                                            |
                                            v
Frontend (Next.js) <-> Backend APIs <-> Gemini Services
                                |
                                v
                 Summary / Chat / Prediction / Video Package
```

## Hackathon Judge Checklist

- Innovation: combines RAG + forecasting + media generation in one workflow.
- Technical depth: hybrid reasoning pipeline, vector retrieval, modular services.
- UX quality: personalized dashboard, deep-dive article intelligence, story timelines.
- Feasibility: deployable full-stack project with Docker and configurable providers.
- Business value: faster decision intelligence for traders, analysts, founders, and creators.

## Roadmap

- Add backend integration tests and frontend e2e smoke tests.
- Add stronger request validation and rate limiting.
- Add observability dashboards and structured logs.
- Add persistent fallback vector storage for production-grade local mode.

## License

This repository is currently intended for educational and prototype use unless a separate license is added.
