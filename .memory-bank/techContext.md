# Tech Context: Inbisco MitraHub

## 1. Tech Stack & Versions
- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Framework:** Express.js `^4.21.2`
- **ORM:** Prisma ORM (`prisma` & `@prisma/client` `^6.x`)
- **Database:** PostgreSQL 15+ on Supabase (`ap-northeast-2`)
  - Runtime Pooler: Port `6543` (`?pgbouncer=true&connection_limit=1`)
  - Direct/Session Migration Pooler: Port `5432`
- **Cache Engine:** Upstash Redis (`@upstash/redis`) via Stateless HTTP REST API
- **Validation:** Zod (`^3.24.x`)
- **Security & Utilities:** `helmet`, `cors`, `morgan`

## 2. Environment Variables
File `.env` (untuk Prisma CLI & local dev) dan `.env.example` (template):
- `NODE_ENV`: `development` | `production`
- `PORT`: `5000`
- `DATABASE_URL`: Supabase Transaction Pooler URL (Port `6543`, `?pgbouncer=true&connection_limit=1`)
- `DIRECT_URL`: Supabase Session Pooler URL (Port `5432`)
- `UPSTASH_REDIS_REST_URL`: URL endpoint Upstash Redis
- `UPSTASH_REDIS_REST_TOKEN`: Token REST Upstash Redis
- `ADMIN_SECRET_KEY`: Secret token untuk header `Authorization: Bearer <token>`
- `CORS_ORIGIN`: `*` atau domain frontend Next.js

## 3. Key NPM Scripts
- `npm run dev`: Menjalankan server lokal dengan `node --watch api/index.js`
- `npm start`: Menjalankan server produksi (`node api/index.js`)
- `npm run db:generate`: `npx prisma generate`
- `npm run db:push`: `npx prisma db push`
- `npm run db:migrate`: `npx prisma migrate dev`
- `npm run db:seed`: `node prisma/seed.js`
- `npm run db:studio`: `npx prisma studio`

