# PROVEENTO - MVP FLIGHT PLAN & ARCHITECTURE
## 1. CONTEXTO DE NEGOCIO
Proveento es un marketplace inverso B2B. Los compradores publican necesidades (Requests), los proveedores (manejados vía "Concierge" por el Admin en este MVP) envían propuestas (Proposals). 
**Regla de Negocio Crítica (Blind Broker):** El comprador JAMÁS debe ver la identidad, email, teléfono o nombre comercial del proveedor hasta que el estado de la propuesta sea "ACCEPTED".
## 2. STACK TECNOLÓGICO
- Framework: Next.js (App Router)
- Lenguaje: TypeScript (Tipado estricto obligatorio)
- UI: Tailwind CSS + Shadcn UI (Usar componentes de Shadcn para todo lo visual)
- Formularios: React Hook Form + Zod
- Base de Datos: PostgreSQL via Supabase
- ORM: Prisma
## 3. REGLAS DE DESARROLLO (CURSOR RULES)
1. Cero alucinaciones de UI: Usa SIEMPRE Shadcn UI. Si necesitas un botón, usa `<Button>`. Si necesitas un modal, usa `<Dialog>`.
2. Server Actions: Toda mutación de datos debe hacerse a través de Server Actions en la carpeta `/actions`. No usar Route Handlers (API routes) a menos que sea estrictamente necesario para webhooks.
3. Fetching: Usar Server Components para leer datos siempre que sea posible. Pasar los datos iniciales como props a los Client Components.
4. Seguridad de Ceguera: Al retornar 'Proposals' a un usuario con rol 'BUYER', el objeto 'provider' DEBE ser excluido a nivel de backend si status !== 'ACCEPTED'.
## 4. ESQUEMA DE BASE DE DATOS (PRISMA)
```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
enum Role { BUYER, ADMIN, PROVIDER }
enum RequestStatus { ACTIVE, MATCHED, CLOSED }
enum ProposalStatus { PENDING, ACCEPTED, REJECTED }
model User {
  id        String     @id @default(uuid())
  role      Role       @default(BUYER)
  email     String     @unique
  name      String
  phone     String?
  requests  Request[]
  proposals Proposal[]
}
model Request {
  id          String        @id @default(uuid())
  buyerId     String
  buyer       User          @relation(fields: [buyerId], references: [id])
  status      RequestStatus @default(ACTIVE)
  city        String
  deadline    DateTime
  items       Json          // Formato: [{ name, quantity, description }]
  createdAt   DateTime      @default(now())
  proposals   Proposal[]
}
model Proposal {
  id          String         @id @default(uuid())
  requestId   String
  request     Request        @relation(fields: [requestId], references: [id])
  providerId  String
  provider    User           @relation(fields: [providerId], references: [id])
  totalPrice  Float
  conditions  String         
  status      ProposalStatus @default(PENDING)
  createdAt   DateTime       @default(now())
}
```
## 5. FASES DE EJECUCIÓN (ROADMAP)
### FASE 1: Setup e Infraestructura
* Inicializar Next.js, instalar Tailwind y Shadcn UI.
* Configurar Prisma, definir el schema y ejecutar migración inicial a Supabase.
* Configurar autenticación básica (puede ser NextAuth o Supabase Auth).
### FASE 2: El Flujo del Comprador (Creación)
* Crear el Zod schema para la creación de una Request.
* Construir `/request/new`: Un formulario multi-paso usando React Hook Form para capturar los `items` (dinámicos), `city`, y `deadline`.
* Crear el Server Action `createRequest` que lo guarde esto en la BD.
### FASE 3: El Hack del Concierge (Panel Admin)
* Construir `/admin/dashboard`: Una tabla que liste todas las Requests activas.
* Construir `/admin/request/[id]`: Vista de detalle de la solicitud.
* Crear un formulario en esta vista para que el Admin pueda crear una `Proposal` manualmente a nombre de un `providerId` específico (simulando que el proveedor cotizó).
* Crear el Server Action `createProposalAsAdmin`.
### FASE 4: El Dashboard del Comprador (Blind Broker)
* Construir `/dashboard`: Lista de Requests del usuario autenticado.
* Construir `/request/[id]/compare`: La tabla comparativa ciega.
* Lógica: Fetching de Proposals asegurando que los datos del proveedor vienen como `null` o `"Proveedor Oculto"`.
* Botón "Aceptar Propuesta": Dispara un Server Action que cambia el `status` de la Proposal a `ACCEPTED` y el de la Request a `MATCHED`.
* Al recargar la página, mostrar condicionalmente los datos de contacto reales.
