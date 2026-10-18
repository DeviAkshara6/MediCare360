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
mvn spring-boot:run
```

The API listens on `http://localhost:8080`. Laboratory PDF files are stored in MongoDB
GridFS and are limited to non-empty PDF files of 10 MB or less.

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
