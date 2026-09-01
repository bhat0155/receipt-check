# Receipt Recall API

[![Backend CI](https://github.com/bhat0155/receipt-check/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/bhat0155/receipt-check/actions/workflows/backend-ci.yml)

A Node.js/TypeScript backend that reads grocery receipts and warns you if anything you bought has been recalled by Health Canada.

You upload a photo of a receipt (or a single product). The service runs OCR, extracts line items with an LLM, and cross-references them against cached Health Canada recall notices.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Receipt sessions** — Persists each upload as a `ReceiptSession` row in PostgreSQL, tracking OCR/LLM output and recall matches.
- **OCR + LLM pipeline** — Extracts text from a receipt image with Google Cloud Vision, then parses line items with OpenAI's `gpt-4o-mini`.
- **Product safety check** — A single-request endpoint that identifies a product from a photo and returns an instant safe/unsafe verdict, with no session or database write.
- **Recall cache** — Fetches the Health Canada recall feed and caches it in memory for 6 hours to avoid refetching on every request.
- **File upload handling** — Accepts image uploads up to 10 MB via Multer, stored in memory.
- **Session cleanup** — `cleanup.js` deletes sessions older than 5 minutes to keep the database small.
- **Health check** — `GET /health` reports service availability for uptime monitoring.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js, TypeScript, `ts-node-dev` |
| Web framework | Express 5 |
| Database / ORM | PostgreSQL, Prisma Client |
| OCR | Google Cloud Vision API |
| LLM | OpenAI Chat Completions (`gpt-4o-mini`) |
| Uploads | Multer (in-memory storage) |
| Caching | `node-cache` |
| Testing | Jest, ts-jest, Supertest |

## Prerequisites

Before you start, make sure you have:

- Node.js 20 or later and npm
- A running PostgreSQL instance
- A Google Cloud project with the Vision API enabled and a service account JSON key
- An OpenAI API key with access to `gpt-4o-mini`

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bhat0155/receipt-check.git
   cd receipt-check
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the repo root with the variables listed in [Configuration](#configuration).

4. Push the Prisma schema to your database and generate the client:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

The server listens on `http://localhost:4000` by default (or the port set in `PORT`).

## Quick Start

Confirm the server is running:

```bash
curl http://localhost:4000/health
```

Upload a receipt image and create a session:

```bash
curl -X POST http://localhost:4000/api/receipts \
  -F "file=@receipt.jpg"
```

The response includes the session `id`. Fetch it later:

```bash
curl http://localhost:4000/api/receipts/<id>
```

Compare the parsed items against current recalls:

```bash
curl -X POST http://localhost:4000/api/receipts/<id>/check-recalls
```

Or check a single product photo directly, without creating a session:

```bash
curl -X POST http://localhost:4000/api/product-check \
  -F "file=@product.jpg"
```

## Configuration

Set these variables in a `.env` file at the repo root. Never commit real credentials.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `4000` | Port the Express server listens on. |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string used by Prisma. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes | — | Path to the Google Cloud service account JSON key with Vision API access. |
| `OPEN_AI_API_KEY` | Yes | — | OpenAI API key with access to `gpt-4o-mini`. Note the variable name in this codebase is `OPEN_AI_API_KEY`, not OpenAI's more common `OPENAI_API_KEY`. |

## API Reference

All responses are JSON. Errors follow the shape `{ "error": "message" }` with an appropriate HTTP status code.

| Method | Endpoint | Request body | Success response |
| --- | --- | --- | --- |
| `GET` | `/health` | — | `200` — `{ "status": "ok", "message": "The server is running" }` |
| `POST` | `/api/receipts` | `multipart/form-data` with a `file` field (image) | `201` — the created session, including `id` and timestamps |
| `GET` | `/api/receipts/:id` | — | `200` — the session, including `purchasedItems`, `recallMatches`, and any error fields |
| `DELETE` | `/api/receipts/:id` | — | `200` — `"Deleted the receipt session"` |
| `POST` | `/api/receipts/:id/check-recalls` | — (the session must already have `purchasedItems`) | `200` — `{ "message": "session updated", "updatedMatches": { ... } }` |
| `GET` | `/api/recalls/sample` | — | `200` — an array of up to 40 recent recall objects (`id`, `title`, `category`, `date`) |
| `POST` | `/api/product-check` | `multipart/form-data` with a `file` field (image) | `200` — `{ "product": { ... }, "verdict": "safe" \| "unsafe", "matches": [ ... ] }` |

## Project Structure

```
receipt-check/
├── src/
│   ├── controllers/    # Request handlers for receipts, recalls, and product checks
│   ├── routes/         # Express routers mounted under /api
│   ├── services/       # OCR, LLM, recall-fetching, and Prisma persistence logic
│   ├── middlewares/     # Multer upload configuration
│   ├── utils/           # Recall filtering and date-window helpers
│   ├── __tests__/       # Jest test suites
│   └── server.ts        # Express app bootstrap and /health route
├── prisma/
│   ├── schema.prisma    # ReceiptSession model and datasource
│   └── migrations/      # Prisma migration history
├── cleanup.js           # Standalone script that purges expired sessions
├── jest.config.cjs      # Jest configuration
├── package.json         # Scripts and dependencies
└── tsconfig.json        # TypeScript compiler configuration
```

## Testing

Run the test suite with Jest:

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test-watch
```

## Deployment

`.github/workflows/backend-ci.yml` runs on every push and pull request to `main`: it installs dependencies, runs `npm test`, and runs `npm run build`.

`.github/workflows/deploy.yml` runs on every push to `main`. After tests pass, it deploys over SSH to an EC2 instance: pulling the latest code, installing dependencies, running `npx prisma migrate deploy`, rebuilding, and restarting the app with PM2.

To build and run manually:

```bash
npm run build
npm start
```

Then schedule `node cleanup.js` to run periodically (for example, via cron) to purge stale sessions.

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| OCR requests fail | `GOOGLE_APPLICATION_CREDENTIALS` doesn't point to a valid key, or the Vision API isn't enabled on the project. |
| LLM requests fail | `OPEN_AI_API_KEY` is missing, invalid, or out of quota. Check server logs for the OpenAI error message. |
| Database connection errors | `DATABASE_URL` doesn't match your PostgreSQL instance. Run `npx prisma migrate deploy` to apply pending migrations. |
| Recall fetch fails | The server needs outbound HTTPS access to the Health Canada feed. Check firewall rules and server logs. |
| Recall data looks stale | The cache TTL is 6 hours. Restart the server to force a refetch. |

## Contributing

Issues and pull requests are welcome. Before opening a PR, run `npm test` and `npm run build` locally to make sure the CI checks will pass.

## License

MIT — see [LICENSE](LICENSE).

## Contact

[Ekamsingh Bhatia](https://ekamsingh.ca)
