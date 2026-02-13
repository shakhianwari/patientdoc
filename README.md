# PatientDoc

PatientDoc is a full-stack healthcare platform in active development.
The repository currently includes:

- A React frontend with Supabase email/password authentication.
- An ASP.NET Core Web API backend with Swagger and CORS enabled.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- shadcn/ui
- React Router
- React Hook Form + Zod
- Supabase JS client (auth)

### Backend
- ASP.NET Core 8 Web API
- Serilog
- Swagger / OpenAPI
- FluentValidation package installed
- EF Core + Npgsql packages installed

### Planned
- ML service (FastAPI)
- Docker Compose setup

## Prerequisites

- Node.js 18+
- npm
- .NET 8 SDK
- Supabase project (for frontend auth)

## Quick Start

Run frontend and backend in separate terminals.

### 1. Frontend
```bash

cd frontend
npm run dev 
```

### 2. Backend

```bash
cd backend
dotnet run
```

Default URLs:
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`



## Project Structure

```text
patientdoc/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- lib/
|   |   |-- pages/
|   |   `-- main.tsx
|   `-- package.json
|-- backend/
|   |-- Controllers/
|   |-- Program.cs
|   `-- backend.csproj
`-- README.md
```
