# Vaktor Frontend

Frontend for Vaktor - NAVs applikasjon for håndtering av beredskapsvakter.

## Tech Stack

- **Framework**: Next.js 16 (React 18)
- **Styling**: Tailwind CSS + NAV Designsystem (Aksel)
- **Komponenter**: @navikt/ds-react
- **Dato/tid**: Luxon, Moment
- **Drag & drop**: @dnd-kit

## Kom i gang

### Forutsetninger

- Node.js 20+
- Tilgang til NAVs GitHub npm registry (for @navikt-pakker)

### Installasjon

```bash
npm install
```

### Utvikling

```bash
npm run dev
```

Åpner på [http://localhost:3000](http://localhost:3000)

### Miljøvariabler

Opprett `.env.local` med:

```
BACKEND_URL=http://localhost:8000
FAKE_TOKEN=<jwt-token-for-lokal-utvikling>
```

## Prosjektstruktur

```
src/
├── components/       # React-komponenter
│   ├── layout/       # Header, Footer, NavBar
│   └── utils/        # Gjenbrukbare hjelpkomponenter
├── context/          # React Context (Auth, Theme)
├── pages/            # Next.js sider og API-ruter
│   └── api/          # Backend proxy-endepunkter
├── types/            # TypeScript-typer
├── utils/            # Hjelpefunksjoner
└── styles/           # Globale stiler
```

## Hovedsider

| Side | Beskrivelse |
|------|-------------|
| `/` | Oversikt over vakter |
| `/dine_vakter` | Brukerens egne vakter |
| `/vaktlagets_vakter` | Vakter for brukerens vaktlag |
| `/vaktlag_admin` | Administrasjon av vaktlag |
| `/ledergodkjenning` | Godkjenning av vakter (vaktsjef/leder) |
| `/avstemming` | Avstemming for okonomi |
| `/admin` | Admin-panel |

## Bygging

```bash
npm run build
npm start
```

## Deployment

Deployes til NAIS (GCP) via GitHub Actions.

- **dev**: Push til `dev`-branch
- **prod**: Push til `main`-branch

Se `.nais/` for konfigurasjon.

## Relaterte repos

- [vaktor-plan](https://github.com/navikt/vaktor-plan) - Backend (FastAPI)
- [vaktor-lonn](https://github.com/navikt/vaktor-lonn) - Lonnberegning (Go)
