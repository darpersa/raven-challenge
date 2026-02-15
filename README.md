# Raven Backend - API REST con NestJS

Backend desarrollado con NestJS para el desafío Raven, proporcionando servicios de autenticación, cálculo de operaciones matemáticas y gestión de historial de tareas.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Testing](#testing)
- [Documentación API](#documentación-api)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Seguridad](#seguridad)

## ✨ Características

- 🔐 Autenticación con JWT
- 🧮 Operaciones matemáticas (suma, resta, multiplicación, división, raíz cuadrada, potenciación)
- 📊 Historial de operaciones con paginación y filtros
- 📧 Validación de emails con MailboxLayer API
- 🛡️ Protección XSS y SQL Injection
- 📝 Documentación automática con Swagger
- ✅ Cobertura de tests superior al 85%
- 🐳 Dockerización con Docker Compose

## 📦 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Docker y Docker Compose (opcional, para base de datos)
- PostgreSQL 14+ (si no usas Docker)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/darpersa/raven-challenge
cd raven-back
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=raven_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# API Externa (opcional)
MAILBOXLAYER_API_KEY=your-mailboxlayer-api-key

# Servidor
PORT=3000
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# Validación de rango de operaciones
MAX_RANGE=1000000
MIN_RANGE=-1000000
```

## ⚙️ Configuración

### Configuración de Base de Datos

#### Opción 1: Usando Docker Compose (Recomendado)

```bash
# Iniciar PostgreSQL en contenedor
cd bbdd
docker-compose up -d

# Verificar que está corriendo
docker ps
```

El script `init.sql` se ejecutará automáticamente y creará las tablas necesarias.

#### Opción 2: PostgreSQL Local

1. Instalar PostgreSQL 14+
2. Crear la base de datos:

```sql
CREATE DATABASE raven_db;
```

3. Ejecutar el script de inicialización:

```bash
psql -U postgres -d raven_db -f bbdd/init.sql
```

### Configuración de API Externa (MailboxLayer)

La validación de emails usa [MailboxLayer API](https://mailboxlayer.com/):

1. Crear cuenta gratuita en https://mailboxlayer.com/
2. Obtener API Key
3. Agregar la clave en `.env`:

```env
MAILBOXLAYER_API_KEY=tu-api-key-aqui
```

> **Nota**: Si no configuras el API key, la aplicación seguirá funcionando pero sin validación avanzada de emails.

## 🏃 Ejecución

### Modo Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000`

### Modo Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Modo Debug

```bash
npm run start:debug
```

## 📖 Ejemplos de Uso

### Usando cURL

#### 1. Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Password123!",
    "username": "Usuario Demo"
  }'
```

**Respuesta:**
```json
{
  "message": "User registered successfully",
  "userId": "usr_abc123xyz",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Password123!"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "usr_abc123xyz",
  "email": "usuario@example.com"
}
```

#### 3. Realizar Operación Matemática

```bash
# Suma
curl -X POST http://localhost:3000/api/tasks/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operandA": 10,
    "operandB": 5
  }'

# División
curl -X POST http://localhost:3000/api/tasks/divide \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operandA": 20,
    "operandB": 4
  }'

# Raíz cuadrada
curl -X POST http://localhost:3000/api/tasks/sqrt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operandA": 16
  }'
```

**Respuesta:**
```json
{
  "operation": "add",
  "operandA": 10,
  "operandB": 5,
  "result": 15,
  "userId": "usr_abc123xyz"
}
```

#### 4. Consultar Historial

```bash
# Historial básico (página 1, 10 registros)
curl -X GET "http://localhost:3000/api/history?userId=usr_abc123xyz" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Con paginación
curl -X GET "http://localhost:3000/api/history?userId=usr_abc123xyz&page=2&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Con filtros
curl -X GET "http://localhost:3000/api/history?userId=usr_abc123xyz&operation=add&startDate=2026-01-01&endDate=2026-12-31&order=DESC" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "operation": "add",
      "operandA": 10,
      "operandB": 5,
      "result": 15,
      "created_at": "2026-02-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con watch mode
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e
```

### Cobertura Actual

```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
All files               |   85.93 |    77.21 |   81.81 |   85.37 |
 src/controller         |     100 |      100 |     100 |     100 |
 src/guards             |     100 |      100 |     100 |     100 |
 src/repository         |     100 |      100 |     100 |     100 |
 src/external           |     100 |      100 |     100 |     100 |
 src/service            |   93.87 |     93.1 |     100 |   93.47 |
```

## 📚 Documentación API

La documentación interactiva de Swagger está disponible en:

```
http://localhost:3000/doc
```

Incluye:
- Esquemas de datos completos
- Pruebas interactivas de endpoints
- Autenticación Bearer JWT integrada
- Ejemplos de request/response

## 🎯 Decisiones Técnicas

### Arquitectura y Patrones

**1. Arquitectura en Capas**
- **Controllers**: Manejo de HTTP y validación de entrada
- **Services**: Lógica de negocio
- **Repositories**: Acceso a datos con TypeORM
- **DTOs**: Validación y transformación de datos

**Justificación**: Separación de responsabilidades, facilita testing y mantenimiento.

**2. Patrón Repository**
- Abstracción de la capa de datos
- Facilita cambio de ORM o base de datos
- Mejora testabilidad con mocks

**3. DTOs con Class Validator**
- Validación automática en runtime
- Type-safety con TypeScript
- Transformación de tipos (strings → numbers)
- Sanitización de datos

### Seguridad

**1. Helmet.js**
- Protección contra XSS
- Headers HTTP seguros
- Política de seguridad de contenido

**2. ValidationPipe Global**
```typescript
whitelist: true,              // Elimina propiedades no decoradas
forbidNonWhitelisted: true,   // Rechaza propiedades extra
transform: true               // Convierte tipos automáticamente
```

**3. Prevención de SQL Injection**
- TypeORM con consultas parametrizadas
- Validación estricta de entrada
- No se usa SQL crudo

**4. Autenticación JWT**
- Tokens con expiración configurable
- Secret key en variables de entorno
- Bearer authentication estándar

**5. Bcrypt para Passwords**
- Hash con salt automático
- No se almacenan contraseñas en texto plano
- Algoritmo de una vía

### Base de Datos

**PostgreSQL**
- Confiabilidad y ACID compliance
- Excelente rendimiento con índices
- Soporte JSON nativo
- Relaciones con foreign keys y cascada

**Índices Estratégicos**
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_user_email ON users(email);
```

### Validación de Emails

**MailboxLayer API**
- Validación de formato
- Verificación de dominio MX
- Detección de emails desechables
- Validación SMTP

**¿Por qué MailboxLayer en lugar de Abstract API o Hunter.IO?**

| Característica | MailboxLayer | Abstract API | Hunter.IO |
|----------------|--------------|--------------|-----------|
| **Plan gratuito** | 1,000 req/mes | 100 req/mes | 50 req/mes |
| **Validación SMTP** | ✅ | ✅ | ❌ |
| **Verificación MX** | ✅ | ✅ | ✅ |
| **Detección desechables** | ✅ | ✅ | ⚠️ Limitada |
| **Score de calidad** | ✅ | ❌ | ❌ |
| **Sugerencias de corrección** | ✅ | ❌ | ❌ |
| **API REST simple** | ✅ | ✅ | ✅ |
| **Sin autenticación compleja** | ✅ (solo API key) | ✅ | ⚠️ (requiere más config) |
| **Documentación** | Excelente | Buena | Regular |
| **Tiempo de respuesta** | ~200ms | ~300ms | ~500ms |
| **Enfoque principal** | Validación email | Multi-propósito | Lead generation |

**Razones de elección**:
1. **Mayor límite gratuito**: 1,000 requests vs 100 (Abstract) o 50 (Hunter)
2. **Especialización**: MailboxLayer está enfocado 100% en validación de emails
3. **Score de calidad**: Proporciona un puntaje de confiabilidad del email
4. **Sugerencias**: Ofrece correcciones automáticas de typos (ej: "gmial.com" → "gmail.com")
5. **Performance**: Respuestas más rápidas (~200ms promedio)
6. **Simplicidad**: API key única sin configuración adicional
7. **Confiabilidad**: Parte del ecosistema APILayer (mismo proveedor de CurrencyLayer, usado por muchas empresas)

**Manejo Opcional**
- La app funciona sin API key
- Degrada gracefully a validación básica
- Log de advertencia en consola

### Testing

**Estrategia de Testing**
- Tests unitarios con Jest
- Mocking de dependencias
- Coverage objetivo: >80%
- Tests de integración con supertest

**Arquitectura Testeable**
- Inyección de dependencias
- Interfaces para abstracciones
- Repositorios mockeables

### Validaciones de Negocio

**Rango de Operaciones**
```typescript
MAX_RANGE = 1_000_000
MIN_RANGE = -1_000_000
```

**Operaciones Especiales**
- División por cero: Error 400
- Raíz cuadrada negativa: Error 400
- Resultados fuera de rango: Error 400

**Justificación**: Prevenir overflow, proteger integridad de datos.

### API Design

**RESTful Endpoints**
```
POST /api/auth/register      - Registro
POST /api/auth/login         - Login
POST /api/tasks/{operation}  - Operaciones
GET  /api/history            - Historial
```

**Versionamiento**
- Prefijo global `/api`
- Preparado para `/api/v2` en futuro

**HTTP Status Codes**
- 200: OK
- 201: Created
- 400: Bad Request (validación)
- 401: Unauthorized
- 500: Internal Server Error

### TypeORM Configuration

**Sincronización**
```typescript
synchronize: false  // En producción
```
- Migraciones controladas
- Previene pérdida de datos
- Schema gestionado por SQL

**Conexión**
- Pool de conexiones automático
- Retry logic built-in
- Lazy loading de relaciones

### Docker

**Docker Compose**
- PostgreSQL aislado
- Datos persistentes con volumes
- Health checks automáticos
- Fácil setup para desarrollo

### Logging y Monitoreo

**Console Errors**
- Errores loggeados en servicios
- Stack traces en desarrollo
- Preparado para Winston/Pino

### CORS

**Configuración Flexible**
```typescript
origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
credentials: true
```

### Performance

**Optimizaciones**
- Índices en columnas frecuentes
- Paginación en historial
- Consultas eficientes con TypeORM
- Lazy loading cuando corresponde

### Escalabilidad

**Preparado para**
- Múltiples instancias (stateless)
- Load balancing
- Cache con Redis (estructura lista)
- Microservicios (módulos independientes)

## 📁 Estructura del Proyecto

```
raven-back/
├── src/
│   ├── controller/          # Controladores HTTP
│   ├── service/             # Lógica de negocio
│   ├── repository/          # Acceso a datos
│   ├── guards/              # Guards de autenticación
│   ├── models/              # Interfaces TypeScript
│   ├── dto/                 # Data Transfer Objects
│   ├── external/            # Servicios externos (Mailbox)
│   ├── app.module.ts        # Módulo principal
│   └── main.ts              # Bootstrap de aplicación
├── dto/                     # DTOs compartidos
├── utils/                   # Utilidades (JWT, passwords)
├── bbdd/
│   ├── docker-compose.yml   # Configuración Docker
│   └── init.sql             # Script inicialización DB
├── test/                    # Tests e2e
└── *.spec.ts                # Tests unitarios
