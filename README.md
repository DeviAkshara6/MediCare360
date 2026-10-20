# MediCare360 backend setup

The existing React app remains in [`project/`](./project/). The Spring Boot backend is in
[`medicare360-backend/`](./medicare360-backend/).

## Run MongoDB

Use a local MongoDB server with the default database URL, or provide a connection string
through `MONGODB_URI`. Do not commit credentials. For MongoDB Atlas, set the full URI in
your shell environment rather than in source control.

## Run the backend

From `medicare360-backend`:

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/medicare360"
$env:FRONTEND_URL="http://localhost:5173"
$env:JWT_SECRET="replace-with-a-random-secret-at-least-32-characters-long"
$env:JWT_EXPIRATION="PT2H"
mvn spring-boot:run
```

The API listens on `http://localhost:8080`. Laboratory PDF files are stored in MongoDB
GridFS and are limited to non-empty PDF files of 10 MB or less.

Authentication uses BCrypt password hashes and short-lived stateless JWTs. The JWT
secret must be a private random value of at least 32 characters; use a Render secret
environment variable in production, never source control.

On startup, the backend inserts five fictional medicines, four fictional appointments,
and five fictional laboratory records only when their respective MongoDB collection is
empty. Existing data is never deleted or overwritten, and restarting the backend does
not duplicate the sample records.

## Run the frontend

From `project`:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env.local` if the backend is not at
`http://localhost:8080/api`.

## Deployment settings

On Render, configure these backend environment variables:

- `MONGODB_URI`: the MongoDB Atlas connection string
- `FRONTEND_URL`: the exact Vercel frontend origin, for example `https://your-app.vercel.app`
- `JWT_SECRET`: a private random value of at least 32 characters
- `JWT_EXPIRATION`: optional duration such as `PT2H`
- `PORT`: optional; Render normally supplies this automatically

On Vercel, configure:

- `VITE_API_BASE_URL`: the Render API URL ending in `/api`, for example
  `https://your-backend.onrender.com/api`

Redeploy the frontend after changing `VITE_API_BASE_URL`, because Vite embeds it at build time.

The first authenticated request requires the backend to be running with a reachable
MongoDB Atlas database. I did not deploy or change production data. The repository
contains unit-level ownership tests and the frontend/backend build checks; a complete
two-browser-account verification against your Atlas/Render deployment must be run
with your deployment credentials.

## Existing records

Records created before authentication have no owner identity. They remain preserved in
MongoDB but are intentionally not returned to authenticated users, because assigning
them automatically would risk exposing one person's health data to another account.
New medicines, appointments, laboratory records, and PDFs are assigned to the logged-in
user and are isolated by owner ID. A deliberate, reviewed migration is required if
legacy records need to be assigned to a particular account.

After both services start, verify the seeded records through the frontend or these
read-only API requests:

```powershell
Invoke-RestMethod http://localhost:8080/api/medicines
Invoke-RestMethod http://localhost:8080/api/appointments
Invoke-RestMethod http://localhost:8080/api/labs
```

## Checks

```powershell
npm run typecheck
npm run lint
npm run build
mvn test
```

Supabase was present only as an unused package dependency; the application did not use
Supabase client calls. It has been removed. The browser localStorage and IndexedDB
persistence paths are no longer used for application records or PDF files.
