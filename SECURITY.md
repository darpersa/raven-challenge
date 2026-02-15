# Protecciones de Seguridad Implementadas

## 1. Protección contra XSS (Cross-Site Scripting)

### Helmet
- **Instalado**: `helmet`
- **Configuración**: En `main.ts` con `app.use(helmet())`
- **Protección**:
  - `X-Content-Type-Options`: Previene MIME sniffing
  - `X-Frame-Options`: Previene clickjacking
  - `X-XSS-Protection`: Activa protección XSS del navegador
  - `Strict-Transport-Security`: Fuerza HTTPS
  - `Content-Security-Policy`: Controla recursos permitidos

### Validación de Datos
- **class-validator**: Valida y sanitiza todos los inputs
- **whitelist**: Elimina propiedades no definidas en DTOs
- **forbidNonWhitelisted**: Rechaza requests con datos extra

## 2. Protección contra Inyección SQL

### TypeORM con Query Builders
- **Uso correcto de TypeORM**: Todos los repositorios usan el ORM correctamente
- **Parámetros preparados**: TypeORM automáticamente escapa valores
- **Sin queries crudas**: No se usa `query()` directo con strings concatenados

### Validación de Inputs
- **DTOs validados**: Todos los endpoints usan DTOs con validaciones
- **Tipos estrictos**: `@IsNumber()`, `@IsString()`, `@IsEmail()`, etc.
- **Whitelisting**: Solo operaciones permitidas (`add`, `subtract`, `multiply`, `divide`)

### Ejemplos de Validación

#### TaskRequestDto
```typescript
@IsIn(['add', 'subtract', 'multiply', 'divide'])
operation: string;

@IsNumber()
operandA: number;
```

#### LoginRequestDto
```typescript
@IsEmail()
email: string;

@MinLength(6)
password: string;
```

#### HistoryQueryDto
```typescript
@IsDateString()
start_date?: string;

@IsIn(['ASC', 'DESC'])
order?: string;
```

## 3. Validación Global

### ValidationPipe
Configurado en `main.ts`:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Elimina propiedades no definidas
    forbidNonWhitelisted: true,   // Rechaza propiedades extra
    transform: true,              // Transforma tipos automáticamente
  }),
);
```

### ParseIntPipe
- Usado en parámetros de ruta para asegurar números enteros
- Ejemplo: `@Param('id', ParseIntPipe) id: number`

## 4. CORS Configurado

- Configuración en `main.ts`
- Controla orígenes permitidos mediante variable de entorno
- Credenciales habilitadas para autenticación

## 5. Protección de Rutas

### Guards JWT
- `JwtValidationGuard`: Protege endpoints sensibles
- Valida tokens Bearer en headers
- Usado en operaciones de cálculo, historial y eliminación

## Beneficios de Seguridad

✅ **Contra XSS**:
- Headers de seguridad automáticos
- Validación y sanitización de inputs
- No se permite HTML/scripts en campos de texto

✅ **Contra Inyección SQL**:
- ORM con parámetros preparados
- Validación estricta de tipos
- Whitelisting de valores permitidos
- No concatenación de strings en queries

✅ **Contra CSRF**:
- Headers personalizados
- Validación de tokens JWT
- CORS configurado

✅ **Validación de Datos**:
- Email válido
- Longitud de passwords
- Formato de usernames
- Tipos numéricos correctos
- Fechas válidas

## Recomendaciones Adicionales

1. **Variables de entorno**: Configurar `ALLOWED_ORIGINS` en producción
2. **Rate limiting**: Considerar agregar `@nestjs/throttler` para limitar requests
3. **Logging**: Implementar logs de seguridad
4. **Updates**: Mantener dependencias actualizadas (`npm audit`)
