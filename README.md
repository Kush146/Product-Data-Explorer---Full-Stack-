# Product Data Explorer (World of Books)

A production-minded product exploration platform: navigate Headings → Categories → Products → Product Detail powered by on-demand scraping of [World of Books](https://www.worldofbooks.com/).

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + React Query  
- **Backend:** NestJS + Prisma + PostgreSQL + BullMQ (Redis) + Playwright/Crawlee  
- **Infra:** Docker (Postgres, Redis, API, Worker, Frontend)

---

## Live links (replace with yours)

- **Frontend:** https://your-frontend.vercel.app  
- **Backend Swagger:** https://your-backend.onrender.com/docs  



## Monorepo layout


frontend/   
backend/    




## Quick start (local, without Docker)

### Prereqs
- Node 18+ (20 recommended)
- Docker Desktop (only if you want DB/Redis via Docker)
- PostgreSQL + Redis (either local installs or Docker)

### 1 Start DB & Redis (with Docker)
From repo root:
bash
docker compose up -d


### 2 Backend
bash
cd backend
cp .env.example .env           
npm i
npx prisma generate
npx prisma migrate deploy
npm run seed                    
npm run start:dev               
# in another terminal (worker for background scraping)
npm run worker            


### 3 Frontend
bash
cd frontend
cp .env.local.example .env.local
npm i
npm run dev             




## Quick start (Docker: everything)

> Requires `docker-compose.yml` at repo root with services for db, redis, backend, worker, frontend.

bash
# build and start all services
docker compose up -d --build

# first time DB init (inside backend container)
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma generate
docker compose exec backend npx ts-node prisma/seed.ts

# (only once) Playwright browsers for scraper worker
docker compose exec worker npx playwright install --with-deps


- Frontend: http://localhost:3000  
- Backend (Swagger): http://localhost:4000/docs



## Environment variables

### Backend (`backend/.env.example`)
env
# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5436/pde

# Redis
REDIS_URL=redis://localhost:6379

# Web server (Nest)
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Scrape freshness (skip if fresh unless ?force=true)
SCRAPE_TTL_HOURS=12

### Frontend (`frontend/.env.local.example`)
env
# API base (must be reachable from the browser)
NEXT_PUBLIC_API_BASE=http://localhost:4000


> If you deploy, set:
> - `NEXT_PUBLIC_API_BASE=https://<your-backend-domain>`
> - `FRONTEND_ORIGIN=https://<your-frontend-domain>`



## Scripts

### Backend
bash
npm run start:dev  
npm run worker     
npm run build       
npm run start       
npm run seed       
npm run prisma:studio


### Frontend
bash
npm run dev        
npm run build
npm run start      




## Features

- **On-demand scraping** via queue/worker; TTL caching to avoid re-scraping fresh pages.
- **Deduplication** with unique constraints (`sourceId`, `sourceUrl`) and `upsert`.
- **Paging** on product grids.
- **Product detail** shows description & related (if scraped).
- **View history** persisted (simple POST on route change).
- **Swagger docs** at `/docs`.
- **Rate limiting** via Nest Throttler.
- **CORS** locked to frontend origin.



## API (high-level)

- `GET /api/v1/navigation` → headings
- `GET /api/v1/navigation/children?navigationId=&parentId=` → categories/subcategories
- `GET /api/v1/products?categoryId=&q=&page=&pageSize=` → grid results
- `GET /api/v1/products/:id` → detail + related
- `POST /api/v1/scrape/category/:id?force=true` → enqueue refresh
- `POST /api/v1/scrape/product/:id?force=true` → enqueue refresh
- `POST /api/v1/history` → store view path

Full docs: **`/docs`** (Swagger UI).



## Deploy

### Backend → Render/Railway/Fly
- Build: `npm ci && npm run build`
- Start: `node dist/main.js`
- Environment:
  
  PORT=4000
  DATABASE_URL=postgres://...     
  REDIS_URL=redis://...          
  FRONTEND_ORIGIN=https://your-frontend.vercel.app
  SCRAPE_TTL_HOURS=12
  
- Expose `/docs` publicly.

### Frontend → Vercel
- Environment:

  NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com
  
- After deploy, open the site and verify API requests succeed (CORS from backend must allow the Vercel domain).



## Testing

### Backend (Jest)
- Unit + integration (Supertest) examples included (see `backend/test`).
bash
cd backend
npm test


### Frontend
- (Optional) Add @testing-library/React tests for components; CI currently builds the frontend.



## Ethical scraping

Please respect the target:
- Obey `robots.txt` and the site’s terms.
- Rate limit & backoff; use TTL caching (`SCRAPE_TTL_HOURS`) to avoid re-scraping fresh pages.
- Implement retries with jitter; cache results where possible.
- Don’t collect PII; use data only for this exercise.



## Troubleshooting

- **ECONNREFUSED 6379** → Start Redis (`docker compose up -d`).
- **Prisma P1001 to 5436/5432** → Start Postgres; verify `DATABASE_URL`; run `migrate deploy`.
- **Blank/unstyled frontend** → Tailwind `content` config missing; restart `npm run dev`.
- **Queued but no scrape** → Worker not running or queue name mismatch; run `npm run worker`, confirm `REDIS_URL`.
