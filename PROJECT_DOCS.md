# ReservasPro — Documentación del Proyecto

> **Plataforma SaaS de gestión de reservas** con backend NestJS, frontend Next.js, base de datos PostgreSQL y pagos con Stripe.  
> Última actualización: 13 de marzo de 2026

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos (Prisma Schema)](#base-de-datos-prisma-schema)
6. [Backend — API REST](#backend--api-rest)
7. [Frontend — Next.js](#frontend--nextjs)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)
9. [Infraestructura (Docker)](#infraestructura-docker)
10. [Variables de Entorno](#variables-de-entorno)
11. [Comandos Útiles](#comandos-útiles)
12. [Design System](#design-system)

---

## Visión General

ReservasPro es una plataforma de reservas que permite a los usuarios explorar recursos (salas de reuniones, canchas deportivas, escritorios coworking, equipos, etc.), hacer reservas por hora, y gestionar pagos. Los administradores cuentan con un panel completo para administrar recursos, horarios, reservas, usuarios y estadísticas.

### Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **CLIENT** | Explorar recursos, crear/cancelar reservas, ver historial, actualizar perfil |
| **USER** | Igual que CLIENT (rol legacy) |
| **ADMIN** | Todo lo anterior + gestionar recursos, horarios, usuarios, ver estadísticas, confirmar/cancelar reservas |

---

## Arquitectura

```mermaid
graph LR
    subgraph Cliente
        A[Next.js Frontend<br>:3000]
    end
    subgraph Servidor
        B[NestJS API<br>:3001]
        C[(PostgreSQL<br>:5432)]
        D[Stripe API]
        E[SMTP Email]
    end
    A -->|REST API + JWT| B
    B -->|Prisma ORM| C
    B -->|Webhooks| D
    B -->|Nodemailer| E
```

- **Frontend → Backend**: Comunicación via REST API con tokens JWT (access token en memoria, refresh token en cookie HTTP-only)
- **Backend → DB**: Prisma ORM sobre PostgreSQL
- **Backend → Stripe**: Integración de pagos (Payment Intents + Webhooks)
- **Backend → Email**: Notificaciones via SMTP (Nodemailer)

---

## Stack Tecnológico

### Backend
| Tecnología | Versión/Detalle |
|---|---|
| **Runtime** | Node.js |
| **Framework** | NestJS |
| **ORM** | Prisma |
| **Base de datos** | PostgreSQL 16 (Alpine) |
| **Autenticación** | JWT (access + refresh tokens) via `@nestjs/passport` |
| **Validación** | `class-validator` + `class-transformer` (ValidationPipe global) |
| **Documentación API** | Swagger (`@nestjs/swagger`) en `/api/docs` |
| **Seguridad** | Helmet, CORS, Rate Limiting (`@nestjs/throttler`: 100 req/min) |
| **Pagos** | Stripe (Payment Intents + Webhooks) |
| **Notificaciones** | Nodemailer + Event Emitter |

### Frontend
| Tecnología | Detalle |
|---|---|
| **Framework** | Next.js (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS + CSS Custom Properties |
| **HTTP Client** | Axios (con interceptores JWT) |
| **State Management** | React Context (Auth) + React Query (`@tanstack/react-query`) |
| **Notificaciones UI** | Sonner (toast notifications) |
| **Iconos** | React Icons (`react-icons`) + Material Icons Outlined |
| **Fuente** | Inter (Google Fonts) |

---

## Estructura del Proyecto

```
reservations-system/
├── docker-compose.yml          # Orquestación: Postgres + Backend + Frontend
├── README.md
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Esquema de base de datos (6 modelos)
│   └── src/
│       ├── main.ts             # Bootstrap: Swagger, CORS, Helmet, ValidationPipe
│       ├── app.module.ts       # Root module (8 feature modules)
│       ├── auth/               # Registro, login, refresh, logout, JWT strategies
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/            # RegisterDto, LoginDto, RefreshTokenDto
│       │   └── strategies/     # JWT strategy, JWT refresh strategy
│       ├── users/              # CRUD de usuarios, perfil
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   └── dto/
│       ├── resources/          # CRUD de recursos (Admin), listado público
│       │   ├── resources.controller.ts
│       │   ├── resources.service.ts
│       │   └── dto/
│       ├── schedules/          # Horarios de recursos + excepciones
│       │   ├── schedules.controller.ts
│       │   ├── schedules.service.ts
│       │   └── dto/
│       ├── reservations/       # Crear, listar, cancelar, check availability
│       │   ├── reservations.controller.ts
│       │   ├── reservations.service.ts
│       │   └── dto/
│       ├── payments/           # Stripe Payment Intents + Webhooks
│       │   ├── payments.controller.ts
│       │   ├── payments.service.ts
│       │   └── dto/
│       ├── notifications/      # Email service + templates
│       │   ├── notifications.service.ts
│       │   ├── email.service.ts
│       │   └── templates/
│       ├── stats/              # Dashboard stats, revenue, trends (Admin)
│       │   ├── stats.controller.ts
│       │   └── stats.service.ts
│       ├── prisma/             # PrismaService (singleton)
│       └── common/
│           ├── decorators/     # @CurrentUser, @Roles
│           ├── guards/         # RolesGuard
│           └── filters/        # HttpExceptionFilter (global)
│
└── frontend/
    └── src/
        ├── middleware.ts        # Redireccion de rutas protegidas
        ├── app/
        │   ├── layout.tsx       # Root layout: Inter font, providers, Material Icons
        │   ├── globals.css      # Design system: palette, shadows, radius, animations
        │   ├── page.tsx         # Landing page (pública)
        │   ├── login/page.tsx   # Login
        │   ├── register/page.tsx# Registro
        │   └── (app)/           # Rutas autenticadas (layout con Sidebar + Navbar)
        │       ├── layout.tsx   # Sidebar fijo + Navbar header + contenido con offset
        │       ├── dashboard/page.tsx     # Dashboard con stats, reservas, quick actions
        │       ├── resources/page.tsx     # Catálogo de recursos con filtros
        │       ├── reservations/page.tsx  # Mis reservas (tabla con acciones)
        │       ├── profile/page.tsx       # Perfil, notificaciones, pagos
        │       └── admin/                 # Panel administrativo
        │           ├── page.tsx           # Dashboard Admin
        │           ├── resources/         # Gestión de recursos
        │           ├── reservations/      # Gestión de reservas
        │           ├── schedules/         # Gestión de horarios
        │           ├── users/             # Gestión de usuarios
        │           └── stats/             # Estadísticas y analytics
        ├── components/
        │   ├── layout/
        │   │   ├── sidebar.tsx   # Sidebar fijo: avatar, nav con Material Icons
        │   │   └── navbar.tsx    # Header: breadcrumb, search, notificaciones, avatar
        │   ├── ui/               # Primitivos reutilizables
        │   │   ├── button.tsx
        │   │   ├── card.tsx
        │   │   ├── badge.tsx
        │   │   ├── modal.tsx
        │   │   ├── form-fields.tsx   # Input, Select, Textarea
        │   │   ├── loading-spinner.tsx
        │   │   └── empty-and-pagination.tsx
        │   └── domain/
        │       └── resource-card.tsx  # Card de recurso + ReservationCard
        ├── contexts/
        │   ├── auth-context.tsx   # AuthProvider: login, register, logout, refresh
        │   └── query-provider.tsx # React Query provider
        ├── hooks/
        │   └── use-api.ts         # Custom hooks: useResources, useReservations, etc.
        └── lib/
            ├── api.ts             # Axios instance con interceptores JWT + refresh
            ├── types.ts           # Interfaces TS: User, Resource, Reservation, etc.
            └── utils.ts           # Formateo de fechas, moneda, badges, cn()
```

---

## Base de Datos (Prisma Schema)

### Enums

| Enum | Valores |
|------|---------|
| `UserRole` | `ADMIN`, `USER`, `CLIENT` |
| `ResourceType` | `COURT`, `ROOM`, `TABLE`, `DESK`, `EQUIPMENT`, `OTHER` |
| `ReservationStatus` | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `PaymentStatus` | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |
| `DayOfWeek` | `MONDAY` – `SUNDAY` |

### Modelos

```mermaid
erDiagram
    User ||--o{ Reservation : has
    User ||--o{ Payment : has
    Resource ||--o{ Schedule : has
    Resource ||--o{ Reservation : has
    Reservation ||--o| Payment : has

    User {
        uuid id PK
        string email UK
        string password
        string fullName
        UserRole role
        string refreshToken
        boolean isActive
        datetime createdAt
    }

    Resource {
        uuid id PK
        string name
        string description
        ResourceType type
        int capacity
        float pricePerHour
        string imageUrl
        boolean isActive
    }

    Schedule {
        uuid id PK
        uuid resourceId FK
        DayOfWeek dayOfWeek
        string startTime
        string endTime
        boolean isActive
    }

    ScheduleException {
        uuid id PK
        uuid resourceId
        datetime date
        string reason
    }

    Reservation {
        uuid id PK
        uuid userId FK
        uuid resourceId FK
        datetime startTime
        datetime endTime
        ReservationStatus status
        float totalAmount
        string notes
    }

    Payment {
        uuid id PK
        uuid reservationId FK_UK
        uuid userId FK
        float amount
        string currency
        PaymentStatus status
        string stripePaymentId UK
        string stripeClientSecret
    }
```

### Índices clave
- `User`: email, role
- `Resource`: type, isActive
- `Schedule`: resourceId + dayOfWeek
- `Reservation`: resourceId + startTime + endTime (detección de conflictos), userId, status
- `Payment`: userId, status, stripePaymentId

---

## Backend — API REST

Base URL: `http://localhost:3001`  
Swagger Docs: `http://localhost:3001/api/docs`

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Registrar usuario nuevo |
| `POST` | `/api/auth/login` | ❌ | Login con email/password |
| `POST` | `/api/auth/refresh` | 🍪 Cookie | Refrescar access token |
| `POST` | `/api/auth/logout` | 🔒 JWT | Cerrar sesión |
| `POST` | `/api/auth/me` | 🔒 JWT | Obtener perfil actual |

### Users (`/api/users`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/users` | 🔒 Admin | Crear usuario |
| `GET` | `/api/users` | 🔒 Admin | Listar usuarios (paginado) |
| `GET` | `/api/users/profile` | 🔒 JWT | Mi perfil |
| `GET` | `/api/users/:id` | 🔒 Admin | Obtener usuario por ID |
| `PATCH` | `/api/users/:id` | 🔒 Admin | Actualizar usuario |
| `PATCH` | `/api/users/profile/update` | 🔒 JWT | Actualizar mi perfil (solo nombre) |
| `DELETE` | `/api/users/:id` | 🔒 Admin | Eliminar usuario |

### Resources (`/api/resources`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/resources` | 🔒 Admin | Crear recurso |
| `GET` | `/api/resources` | ❌ | Listar recursos (filtros: type, search, minPrice, maxPrice, minCapacity) |
| `GET` | `/api/resources/:id` | ❌ | Obtener recurso por ID |
| `PATCH` | `/api/resources/:id` | 🔒 Admin | Actualizar recurso |
| `DELETE` | `/api/resources/:id` | 🔒 Admin | Eliminar recurso |

### Schedules (`/api/schedules`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/schedules` | 🔒 Admin | Crear horario para recurso |
| `GET` | `/api/schedules/resource/:resourceId` | ❌ | Horarios de un recurso |
| `PATCH` | `/api/schedules/:id` | 🔒 Admin | Actualizar horario |
| `DELETE` | `/api/schedules/:id` | 🔒 Admin | Eliminar horario |
| `POST` | `/api/schedules/exceptions` | 🔒 Admin | Crear excepción de horario |
| `GET` | `/api/schedules/exceptions/:resourceId` | ❌ | Obtener excepciones |
| `DELETE` | `/api/schedules/exceptions/:id` | 🔒 Admin | Eliminar excepción |

### Reservations (`/api/reservations`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/reservations` | 🔒 JWT | Crear reserva |
| `GET` | `/api/reservations` | 🔒 JWT | Mis reservas (paginado, filtro por status) |
| `GET` | `/api/reservations/admin/all` | 🔒 Admin | Todas las reservas |
| `GET` | `/api/reservations/availability/check` | ❌ | Verificar disponibilidad |
| `GET` | `/api/reservations/availability/slots/:resourceId/:date` | ❌ | Slots ocupados por día |
| `GET` | `/api/reservations/:id` | 🔒 JWT | Detalle de reserva |
| `PATCH` | `/api/reservations/:id/status` | 🔒 Admin | Cambiar estado de reserva |
| `POST` | `/api/reservations/:id/cancel` | 🔒 JWT | Cancelar mi reserva |

### Payments (`/api/payments`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/payments/create-intent` | 🔒 JWT | Crear Payment Intent (Stripe) |
| `POST` | `/api/payments/webhook` | ❌ | Webhook de Stripe |
| `GET` | `/api/payments/my` | 🔒 JWT | Mi historial de pagos |
| `GET` | `/api/payments/admin/all` | 🔒 Admin | Todos los pagos |

### Stats (`/api/stats`) — Solo Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/stats/dashboard` | Stats del dashboard (totales, revenue, growth) |
| `GET` | `/api/stats/reservations-by-period` | Reservas agrupadas por status en rango de fechas |
| `GET` | `/api/stats/revenue` | Revenue por rango de fechas |
| `GET` | `/api/stats/top-resources` | Recursos más reservados |
| `GET` | `/api/stats/trend` | Tendencia de reservas (últimos N días) |

---

## Frontend — Next.js

### Páginas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `page.tsx` | Landing page pública |
| `/login` | `login/page.tsx` | Formulario de login |
| `/register` | `register/page.tsx` | Formulario de registro |
| `/dashboard` | `(app)/dashboard/page.tsx` | Dashboard del usuario con reservas y quick actions |
| `/resources` | `(app)/resources/page.tsx` | Catálogo de recursos con búsqueda y filtros |
| `/reservations` | `(app)/reservations/page.tsx` | Lista de mis reservas con acciones |
| `/profile` | `(app)/profile/page.tsx` | Perfil, notificaciones, métodos de pago |
| `/admin` | `(app)/admin/page.tsx` | Dashboard administrativo |
| `/admin/resources` | `(app)/admin/resources/` | CRUD de recursos |
| `/admin/reservations` | `(app)/admin/reservations/` | Gestión de reservas |
| `/admin/schedules` | `(app)/admin/schedules/` | Gestión de horarios |
| `/admin/users` | `(app)/admin/users/` | Gestión de usuarios |
| `/admin/stats` | `(app)/admin/stats/` | Estadísticas y analytics |

### Custom Hooks (`hooks/use-api.ts`)

| Hook | Descripción |
|------|-------------|
| `useResources(filters)` | Listar recursos con filtros y paginación |
| `useResource(id)` | Obtener un recurso por ID |
| `useCreateResource()` | Mutation para crear recurso |
| `useUpdateResource()` | Mutation para actualizar recurso |
| `useDeleteResource()` | Mutation para eliminar recurso |
| `useReservations(filters)` | Listar reservas del usuario |
| `useAllReservations(filters)` | Listar todas las reservas (Admin) |
| `useReservation(id)` | Obtener reserva por ID |
| `useCreateReservation()` | Mutation para crear reserva |
| `useCancelReservation()` | Mutation para cancelar reserva |
| `useUpdateReservationStatus()` | Mutation para cambiar estado (Admin) |
| `useCheckAvailability(params)` | Verificar disponibilidad |
| `useResourceSlots(resourceId, date)` | Slots ocupados por día |
| `useDashboardStats()` | Estadísticas del dashboard (Admin) |
| `useUsers(page, limit)` | Listar usuarios (Admin) |
| `useUpdateProfile()` | Mutation para actualizar perfil |
| `useSchedules(resourceId)` | Horarios de un recurso |
| `useCreateSchedule()` | Mutation para crear horario |
| `useDeleteSchedule()` | Mutation para eliminar horario |

### Componentes UI

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `Button` | `ui/button.tsx` | Botón con variantes (primary, secondary, danger, ghost), sizes, loading state |
| `Card` | `ui/card.tsx` | Card con CardHeader, CardBody, CardFooter + hover effect |
| `Badge` / `StatusBadge` | `ui/badge.tsx` | Badges con variantes de color + StatusBadge para estados de reserva |
| `Modal` | `ui/modal.tsx` | Modal dialog con overlay y tamaños |
| `Input` / `Select` / `Textarea` | `ui/form-fields.tsx` | Campos de formulario con labels y errores |
| `LoadingSpinner` / `FullPageLoader` | `ui/loading-spinner.tsx` | Spinners de carga |
| `EmptyState` / `Pagination` | `ui/empty-and-pagination.tsx` | Estado vacío con icono/acción + paginación |
| `Sidebar` | `layout/sidebar.tsx` | Sidebar fijo con avatar, nav links, Material Icons |
| `Navbar` | `layout/navbar.tsx` | Header con breadcrumb, search, notificaciones |
| `ResourceCard` | `domain/resource-card.tsx` | Card de recurso con imagen, precio, tipo, capacidad |
| `ReservationCard` | `domain/resource-card.tsx` | Card de reserva con fecha, status, monto |

---

## Autenticación y Seguridad

### Flujo de Auth

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend

    U->>F: Login (email, password)
    F->>B: POST /api/auth/login
    B->>B: Validar credenciales, hash bcrypt
    B->>F: { accessToken, user } + Set-Cookie: refreshToken (HTTP-only)
    F->>F: Guardar accessToken en memoria

    Note over F,B: En cada request subsiguiente
    F->>B: Request + Authorization: Bearer {accessToken}

    Note over F,B: Cuando expira el access token (15min)
    F->>B: POST /api/auth/refresh (cookie refreshToken)
    B->>F: { nuevo accessToken } + nueva cookie
```

### Medidas de Seguridad
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Restringido al origen del frontend
- **Rate Limiting**: 100 requests por minuto por IP (ThrottlerModule)
- **ValidationPipe**: Whitelist + forbidNonWhitelisted + transform
- **Passwords**: Hashed con bcrypt
- **JWT**: Access token (15min) en memoria + Refresh token (7 días) en cookie HTTP-only
- **Role-based access**: `@Roles()` decorator + `RolesGuard`

---

## Infraestructura (Docker)

El proyecto usa `docker-compose.yml` para orquestar 3 servicios:

| Servicio | Imagen | Puerto | Descripción |
|----------|--------|--------|-------------|
| `postgres` | `postgres:16-alpine` | `:5432` | Base de datos PostgreSQL |
| `backend` | Build local (`./backend`) | `:3001` | API NestJS |
| `frontend` | Build local (`./frontend`) | `:3000` | Next.js App |

### Volúmenes
- `pgdata`: Persistencia de datos de PostgreSQL

---

## Variables de Entorno

### Backend (`.env`)

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/reservations?schema=public` | Conexión a PostgreSQL |
| `JWT_SECRET` | — | Secreto para access tokens |
| `JWT_REFRESH_SECRET` | — | Secreto para refresh tokens |
| `JWT_EXPIRATION` | `15m` | Duración del access token |
| `JWT_REFRESH_EXPIRATION` | `7d` | Duración del refresh token |
| `STRIPE_SECRET_KEY` | — | API key de Stripe |
| `STRIPE_WEBHOOK_SECRET` | — | Secreto del webhook de Stripe |
| `SMTP_HOST` | `smtp.ethereal.email` | Host del servidor SMTP |
| `SMTP_PORT` | `587` | Puerto SMTP |
| `SMTP_USER` | — | Usuario SMTP |
| `SMTP_PASS` | — | Contraseña SMTP |
| `FRONTEND_URL` | `http://localhost:3000` | URL del frontend (para CORS y emails) |
| `PORT` | `3001` | Puerto del servidor |
| `CORS_ORIGIN` | `http://localhost:3000` | Origen permitido para CORS |

### Frontend (`.env.local`)

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL base de la API |
| `NEXT_PUBLIC_APP_NAME` | `ReservasPro` | Nombre de la aplicación |

---

## Comandos Útiles

### Desarrollo

```bash
# Backend
cd backend
npm install
npx prisma generate        # Generar Prisma Client
npx prisma migrate dev     # Ejecutar migraciones
npx prisma db seed         # Seed de datos iniciales (si existe)
npm run start:dev          # Iniciar en modo desarrollo (hot reload)

# Frontend
cd frontend
npm install
npm run dev                # Iniciar en modo desarrollo (:3000)

# Docker (todo junto)
docker-compose up -d       # Iniciar todos los servicios
docker-compose down        # Detener servicios
docker-compose logs -f     # Ver logs en tiempo real
```

### Producción

```bash
# Backend
npm run build
npm run start:prod

# Frontend
npm run build
npm run start
```

### Base de datos

```bash
npx prisma studio              # GUI para ver/editar datos
npx prisma migrate reset       # Reset completo (⚠️ borra datos)
npx prisma migrate deploy      # Aplicar migraciones en prod
npx prisma db push             # Sync schema sin migraciones
```

---

## Design System

El frontend utiliza un design system definido en `globals.css` basado en los diseños generados con **Stitch by Google**.

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `#135bec` | Color principal, botones, links |
| `--background` | `#F8F9FB` | Fondo de página |
| `--card` | `#ffffff` | Fondo de cards |
| `--border` | `#E5E7EB` | Bordes |
| `--muted-foreground` | `#6B7280` | Texto secundario |
| `--radius` | `8px` | Border radius base |
| `--radius-lg` | `12px` | Border radius para cards |
| `--sidebar-width` | `260px` | Ancho del sidebar |

### Fuente
- **Inter** (Google Fonts) — pesos 400, 500, 600, 700

### Iconos
- **Material Icons Outlined** — sidebar y acciones
- **React Icons (Feather)** — iconos inline
