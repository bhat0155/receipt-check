

# Receipt Recall API – Grocery receipt ingestion + food recall intelligence service.

## 2. Short Description

Receipt Recall ingests receipt images, parses line items with OCR + LLMs, then compares recent Canadian government recall notices to warn users about potentially unsafe purchases. The backend exposes REST endpoints for uploading receipts, managing parsing sessions, and querying cached recall data.

## 3. Features

- **Receipt Sessions** – Creates persistent `ReceiptSession` records in PostgreSQL to track OCR/LLM output and recall matches.
- **Vision + LLM Pipeline** – Uses Google Cloud Vision for OCR and OpenAI GPT-4o mini for item extraction + recall comparisons.
- **Recall Cache** – Fetches Health Canada recall JSON once every six hours via `node-cache` for fast reuse.
- **File Upload Middleware** – Accepts image uploads (10 MB max) via Multer’s in-memory storage.
- **Automated Cleanup** – `cleanup.js` removes sessions older than five minutes to keep the database lean.
- **Health Monitoring** – `/health` route confirms service availability for uptime checks.

## 4. Tech Stack

- Runtime: Node.js + TypeScript, Express 5, ts-node-dev.
- Data & ORM: PostgreSQL, Prisma Client.
- AI Services: Google Cloud Vision API, OpenAI Chat Completions.
- Utilities: Multer, Node-Cache, dotenv, cors.

## 5. Project Structure

```
reciept-recall/
├── src/
│   ├── controllers/        # Request handlers (receipts, recalls)
│   ├── routes/             # Express routers mounted under /api
│   ├── services/           # OCR, LLM, recall, and receipt persistence logic
│   ├── middlewares/        # Upload middleware using Multer
│   └── server.ts           # Express bootstrap + health route
├── prisma/
│   ├── schema.prisma       # ReceiptSession model + datasource
│   └── migrations/         # Migration metadata (if any)
├── cleanup.js              # Script to purge expired sessions
├── package.json            # Scripts + dependency manifest
└── tsconfig.json           # TypeScript compiler config
```

## 6. Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | Optional | Port for Express server (defaults to 4000). |
| `DATABASE_URL` | ✅ | PostgreSQL connection string used by Prisma. |
| `GOOGLE_APPLICATION_CREDENTIALS` | ✅ | Path to Google Vision JSON credentials file. |
| `OPEN_AI_API_KEY` | ✅ | OpenAI API key with access to GPT-4o mini. |

> Create a `.env` file at the repo root; never commit production secrets.

## 7. Local Setup Instructions

1. **Install dependencies** – `npm install`
2. **Configure environment** – Copy `.env.example` (or `.env`) and set the variables listed above.
3. **Prepare database** – Ensure PostgreSQL is running, then run `npx prisma db push` (or `prisma migrate dev`) to create the `reciept_sessions` table.
4. **Generate Prisma Client** – `npx prisma generate`
5. **Start the dev server** – `npm run dev` (runs `ts-node-dev` with live reload).
6. **Test the flow** – Use Postman/cURL to hit `/api/receipts` with a multipart `file` upload, then poll `/api/receipts/:id`.

## 8. Run in Production

1. Build JS artifacts (optional): `tsc -p tsconfig.json` to emit to `dist/`.
2. Run database migrations against the production DB.
3. Provide environment variables via secrets manager or `.env`.
4. Start the server with a process manager (PM2, systemd, Docker, etc.): `node dist/server.js` or `NODE_ENV=production ts-node src/server.ts`.
5. Schedule `node cleanup.js` periodically (e.g., cron) to purge stale sessions.
6. Monitor logs for OCR/LLM errors and recall cache refresh messages.

## 9. API Docs 

| Method | Endpoint | Description | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/receipts/` | Create a receipt session, upload image. | `multipart/form-data` with `file` (image). | `201` JSON of created session (`id`, timestamps). |
| `GET` | `/api/receipts/:id` | Fetch a specific receipt session. | n/a | `200` session JSON (includes `purchasedItems`, `recallMatches`, error fields). |
| `DELETE` | `/api/receipts/:id` | Delete a receipt session. | n/a | `200` `{ "message": "Deleted the receipt session" }`. |
| `POST` | `/api/receipts/:id/check-recalls` | Compare parsed items with cached recalls, update session. | JSON: none (session must already have `purchasedItems`). | `200` `{ "message": "session updated", "updatedMatches": { ... } }`. |
| `GET` | `/api/recalls/sample` | Return the latest filtered recalls (≤40 recent items). | n/a | `200` array of recall objects (`id`, `title`, `category`, `date`). |
| `GET` | `/health` | Service health check. | n/a | `200 { "status": "ok", "message": "The server is running" }`. |

Errors follow the JSON `{ "error": "message" }` pattern with appropriate HTTP status codes.


## 10. Troubleshooting

- **OCR errors** – Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to a valid Vision JSON key and the API is enabled.
- **LLM failures** – Verify `OPEN_AI_API_KEY` has quota; the backend logs will surface OpenAI error messages.
- **Database connection issues** – Confirm `DATABASE_URL` matches your PostgreSQL instance and run `npx prisma migrate deploy`.
- **Recall fetch failures** – The Health Canada feed requires outbound HTTPS access; check firewall rules and watch server logs for fetch errors.
- **Cache not updating** – `node-cache` TTL is 6 hours; restart the server or call `recallService.setRecallsInCache()` manually if data is stale.


## 11. Author

Built by **Ekam Bhatia** (`@ekambhatia`). Reach out for questions, contributions, or deployment support.
