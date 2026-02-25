# Security Dashboard (Vercel All-in-One) — Frontend + Backend in ONE Vercel project

✅ Works on Vercel as:
- Vite React frontend (static build)
- Node Serverless Functions backend under `/api/*`
- MongoDB (Mongoose) for users + audit logs

## What this project DOES (safe/legal)
- Your own app authentication (register/login/refresh/logout)
- Audit logs: who logged in, when, ip, device(user-agent), endpoint access
- Admin-only pages: users list, audit logs list

❌ What it does NOT do
- It does NOT fetch Telegram users by username or any "telegram database". That’s not legal/safe.

---

## Deploy on Vercel
1) Push this repo to GitHub.
2) Import to Vercel.
3) In Vercel Project → Settings → Environment Variables add:

- `MONGO_URI` = your MongoDB Atlas connection string (NEW rotated one)
- `JWT_ACCESS_SECRET` = random strong secret
- `JWT_REFRESH_SECRET` = random strong secret
- `ADMIN_SEED_EMAIL` = admin@example.com
- `ADMIN_SEED_PASSWORD` = Admin12345!

Then deploy.

### Build settings
Vercel should auto-detect Vite.
- Build command: `npm run build`
- Output directory: `dist`

---

## Local dev
```bash
npm install
# create .env.local
npm run dev
```

Create `.env.local`:
```
MONGO_URI=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin12345!
```

Vite proxy is configured so frontend can call `/api/*` locally.

---

## API routes
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`
- GET  `/api/users/me`
- GET  `/api/users` (admin)
- GET  `/api/users/search?q=...` (admin)
- GET  `/api/audit/logs?limit=200&q=...` (admin)

