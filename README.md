# HumanUI Monorepo

A modern monorepo setup with Next.js, Express API, Prisma, and shared packages.

## 🏗️ Project Structure

```
humanui/
├── apps/
│   ├── admin/          # Next.js admin dashboard
│   └── api/            # Express API server
├── packages/
│   ├── db/             # Prisma database package
│   ├── entities/       # Shared entity types
│   ├── ui/             # Shared UI components
│   ├── utils/          # Shared utilities
│   └── config/         # Shared configuration
├── docker-compose.yml  # PostgreSQL & pgAdmin
└── package.json        # Root workspace config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### Option 1: Development Mode

#### 1. Install Dependencies

```bash
pnpm install
```

#### 2. Start Database

```bash
docker-compose up -d postgres pgadmin
```

#### 3. Setup Environment

Copy the example environment file:

```bash
cp env.example .env
```

#### 4. Generate Prisma Client

```bash
pnpm db:generate
```

#### 5. Push Database Schema

```bash
pnpm db:push
```

#### 6. Start Development Servers

```bash
# Start all apps in development mode
pnpm dev

# Or start individual apps
pnpm --filter @humanui/admin dev
pnpm --filter @humanui/api dev
```

### Option 2: Docker Mode (Database Only)

#### 1. Start Database Services

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d
```

#### 2. View Logs

```bash
docker-compose logs -f
```

#### 3. Stop Services

```bash
docker-compose down
```

#### 4. Run Apps Locally

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Start development servers
pnpm dev
```

## 📦 Available Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm clean` - Clean all build artifacts
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push database schema
- `pnpm db:studio` - Open Prisma Studio

### Docker Commands

- `docker-compose up -d` - Start database services
- `docker-compose down` - Stop database services
- `docker-compose logs -f` - View database logs
- `docker-compose restart` - Restart database services

### Individual Apps

- `pnpm --filter @humanui/admin dev` - Start admin dashboard
- `pnpm --filter @humanui/api dev` - Start API server

## 🌐 Access Points

- **Admin Dashboard**: http://localhost:3000
- **API Server**: http://localhost:3001
- **pgAdmin**: http://localhost:8080 (admin@humanui.com / admin)
- **Database**: localhost:5432

## 🗄️ Database

The project uses PostgreSQL with Prisma ORM. The database includes:

- **Item** model with id, name, description, timestamps
- **User** model with id, email, name, timestamps

## 📚 Packages

### @humanui/db

Database package with Prisma client and schema.

### @humanui/entities

Shared entity types and database exports.

### @humanui/ui

Shared UI components built with React and Tailwind CSS.

### @humanui/utils

Common utility functions for formatting and validation.

### @humanui/config

Shared configuration and environment variables.

## 🛠️ Development

### Adding New Packages

1. Create directory in `packages/`
2. Add `package.json` with workspace dependencies
3. Add to root `package.json` workspaces
4. Update `turbo.json` pipeline if needed

### Database Changes

1. Modify `packages/db/prisma/schema.prisma`
2. Run `pnpm db:generate` to update client
3. Run `pnpm db:push` to apply changes

### API Endpoints

The API server includes:

- `GET /health` - Health check
- `GET /api/items` - List items
- `POST /api/items` - Create item
- `GET /api/users` - List users
- `POST /api/users` - Create user

## 🔧 Tech Stack

- **Monorepo**: pnpm + Turborepo
- **Frontend**: Next.js 14 + React 18
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL + Prisma
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: pnpm
- **Development**: TypeScript, ESLint, Prettier

## 📝 License

MIT
