# ReservasPro — Plataforma de Reservas Fullstack

> Plataforma SaaS profesional para gestión de reservas con NestJS, Prisma, PostgreSQL, Next.js, Stripe y notificaciones por email.

---

## Arquitectura

```
┌─────────────┐     HTTP/REST     ┌────────────────┐     Prisma ORM     ┌──────────────┐
│  Next.js 16  │ ◄──────────────► │  NestJS v11    │ ◄────────────────► │ PostgreSQL   │
│  (React 19)  │                  │  (API REST)    │                    │              │
│  App Router  │                  │                │                    └──────────────┘
│  TanStack Q  │                  │  Auth (JWT)    │
│  Tailwind v4 │                  │  Resources     │──► Stripe API
│  Zod         │                  │  Schedules     │
│  Recharts    │                  │  Reservations  │──► EventEmitter
└─────────────┘                   │  Payments      │        │
                                  │  Notifications │ ◄──────┘
                                  │  Stats         │──► Nodemailer
                                  └────────────────┘
```

## Características Principales

### Backend (NestJS + Prisma)
- **Autenticación JWT** con refresh token rotation (tokens hasheados en BD)
- **Control de concurrencia** con `Prisma.$transaction` + aislamiento `Serializable`
- **Pagos con Stripe** Payment Intents + validación por webhook
- **Notificaciones event-driven** con `@nestjs/event-emitter` + Nodemailer
- **RBAC** con guards y decoradores (`@Roles`, `@CurrentUser`)
- **Swagger** auto-generado en `/api/docs`
- **Rate limiting** con `@nestjs/throttler`
- **Seguridad** con Helmet, CORS, ValidationPipe (whitelist + transform)

### Frontend (Next.js + React)
- **App Router** con route groups y layouts protegidos
- **TanStack Query** para server state management
- **Tema claro/oscuro** con CSS custom properties + persistencia en localStorage
- **Zod** para validación de formularios
- **Recharts** para gráficos de estadísticas
- **Responsive** con Tailwind CSS v4
- **Sonner** para notificaciones toast

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 11, TypeScript, Prisma 6, PostgreSQL 16 |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TanStack Query |
| Auth | JWT (access + refresh), Passport, bcrypt |
| Pagos | Stripe Payment Intents + Webhooks |
| Email | Nodemailer (Ethereal en dev) |
| Infra | Docker Compose, Swagger/OpenAPI |

## Inicio Rápido

### Prerrequisitos
- Node.js 20+
- PostgreSQL 16+ (o Docker)
- (Opcional) Stripe CLI para webhooks

### 1. Levantar la Base de Datos

```bash
docker compose up -d postgres
```

### 2. Configurar el Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus valores
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

El API estará en `http://localhost:3001`  
Swagger docs en `http://localhost:3001/api/docs`

### 3. Configurar el Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará en `http://localhost:3000`

### 4. (Alternativa) Docker Compose Completo

```bash
docker compose up --build
```

## Credenciales Demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@reservations.com | Admin123! |
| Cliente | john@example.com | User123! |
| Cliente | jane@example.com | User123! |
| Cliente | bob@example.com | User123! |

## Estructura del Proyecto

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos, enums, indexes
│   │   └── seed.ts                # Datos demo
│   ├── src/
│   │   ├── common/                # Guards, filters, decorators
│   │   ├── prisma/                # PrismaService (global)
│   │   ├── auth/                  # JWT + refresh rotation
│   │   ├── users/                 # CRUD + perfiles
│   │   ├── resources/             # CRUD + filtros
│   │   ├── schedules/             # Horarios + excepciones
│   │   ├── reservations/          # Reservas + concurrencia
│   │   ├── payments/              # Stripe Payment Intents
│   │   ├── notifications/         # Event-driven emails
│   │   └── stats/                 # Dashboard + reportes
│   ├── main.ts
│   └── app.module.ts
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/             # Route group autenticado
│   │   │   │   ├── dashboard/
│   │   │   │   ├── resources/
│   │   │   │   ├── reservations/
│   │   │   │   ├── profile/
│   │   │   │   └── admin/
│   │   │   │       ├── resources/
│   │   │   │       ├── schedules/
│   │   │   │       ├── users/
│   │   │   │       └── stats/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── page.tsx           # Landing page
│   │   ├── components/
│   │   │   ├── ui/                # Button, Card, Modal, etc.
│   │   │   ├── layout/            # Navbar, Sidebar
│   │   │   └── domain/            # ResourceCard, Charts
│   │   ├── contexts/              # Auth, Theme, QueryProvider
│   │   ├── hooks/                 # useApi (TanStack Query hooks)
│   │   └── lib/                   # api, types, utils, validations
│   └── middleware.ts              # Route protection
├── docker-compose.yml
└── README.md
```

## Módulos del Backend

### Auth (`/api/auth`)
- `POST /register` — Registro de usuario
- `POST /login` — Login (devuelve access token + httpOnly refresh cookie)
- `POST /refresh` — Renovar tokens (rotation)
- `POST /logout` — Invalidar refresh token
- `GET /me` — Usuario actual

### Resources (`/api/resources`)
- `GET /` — Listado con filtros (tipo, precio, capacidad, búsqueda)
- `GET /:id` — Detalle con horarios
- `POST /` — Crear (admin)
- `PATCH /:id` — Actualizar (admin)
- `DELETE /:id` — Eliminar (admin)

### Reservations (`/api/reservations`)
- `GET /` — Mis reservas (paginadas, filtros por estado)
- `GET /:id` — Detalle con pagos
- `POST /` — Crear reserva (con transacción Serializable)
- `PATCH /:id/cancel` — Cancelar
- `GET /availability` — Verificar disponibilidad
- `GET /slots/:resourceId` — Slots del día

### Payments (`/api/payments`)
- `POST /create-intent` — Crear Payment Intent (Stripe)
- `POST /webhook` — Recibir webhook de Stripe

### Stats (`/api/stats`) — Solo admin
- `GET /dashboard` — KPIs generales
- `GET /revenue` — Ingresos por período
- `GET /top-resources` — Recursos más reservados
- `GET /trends` — Tendencia de reservas

## Control de Concurrencia

Las reservas se crean dentro de una transacción con aislamiento **Serializable**:

```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Validar horario del recurso
  // 2. Verificar excepciones (feriados)
  // 3. Detectar solapamientos: startTime < end AND endTime > start
  // 4. Crear reserva solo si no hay conflictos
}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
```

Esto garantiza que dos solicitudes concurrentes **nunca** generen doble reserva.

## Variables de Entorno

### Backend (`.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reservations
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ReservasPro
```

## Tests

```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

## Licencia

MIT
