This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Docs
- Admin Guide: `docs/adminGuide.md`
- Entry & Admin Guide: `docs/entry-admin-guide.md`

## Database Configuration
- The app uses centralized config with a safe fallback:
  - If `MONGODB_URI` is not set, it falls back to `mongodb://localhost:27017/unitech_grand_ocean`
  - Set `MONGODB_DB_NAME` to override the database name (default: `unitech_grand_ocean`)
- For Atlas:
  - `MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority`
- For local:
  - `MONGODB_URI=mongodb://localhost:27017/unitech_grand_ocean`
 - Environment-specific:
   - Configure `.env` using `.env.example`
   - `APP_ENV=development|test|staging|production`
   - Override with `MONGODB_URI_<ENV>` and `MONGODB_DB_NAME_<ENV>` if needed
 - Health check:
   - `GET /api/health/db` → confirms connection and current `dbName`

## Seed Sample Data
- In the Admin Units page (`/admin/units`), click `Seed Sample Data` to insert sample units/components/time-shares.
- Or call the API: `POST /api/dev/seed`

## Local Mongo (Docker)
- Start MongoDB and mongo-express via Docker:
```
npm run db:up
# mongo: localhost:27017 , mongo-express: http://localhost:8081/
```
- Stop:
```
npm run db:down
```

## Check Unit Entry (Script)
- With dev server running and `MONGODB_URI` configured:
```
pwsh ./scripts/check-unit-entry.ps1 -UnitCode TEST-UNIT-01
```
- The script posts a unit to `/api/units` and fetches it back to verify computed pricing fields.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
