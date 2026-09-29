# Explicación paso a paso — Clase 07

## Resumen ejecutivo

Se resolvieron los 3 incidentes reportados y se pasó el validador final (`npm run validate:class-07`) con **12/12 checks PASSED**.

- **INC-701**: Identificadores inválidos ahora responden `400 INVALID_REQUEST_ID` en lugar de `500`
- **INC-702**: Prioridades inválidas ahora responden `400 INVALID_PRIORITY` en lugar de `500`
- **OPS-703**: Implementación completa de trazabilidad (requestId), logs estructurados, error handler centralizado y endpoints health/ready

---

## Paso 1: Baseline y reproducción

```bash
npm run validate:class-07
```

Resultado inicial: **6/12 FAIL**
- [02] Invalid id returns 400 → 500
- [03] Invalid priority returns 400 → 500
- [08] Response contains request id → header/body missing
- [09] Log contains the same request id → fail
- [11] Health endpoint responds → 404
- [12] Readiness checks PostgreSQL → 404

---

## Paso 2: INC-701 — Validación de ID inválido

### Problema
`GET /requests/not-a-number` devolvía `500 INTERNAL_ERROR` porque `Number('not-a-number')` produce `NaN` que se pasaba a SQL.

### Solución
Crear middleware `validateId` en `src/modules/requests/requests.routes.js`:

```javascript
function validateId(req, res, next) {
  const raw = req.params.id;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== String(raw).trim()) {
    return next(new AppError('contract', 'INVALID_REQUEST_ID', 'The request id must be a positive integer.'));
  }
  req.validatedId = parsed;
  next();
}
```

Aplicado a: `GET /:id`, `GET /:id/history`, `PATCH /:id`

### Verificación
- `GET /requests/not-a-number` → 400 INVALID_REQUEST_ID ✓
- `GET /requests/1.5` → 400 INVALID_REQUEST_ID ✓
- `GET /requests/0` → 400 INVALID_REQUEST_ID ✓
- `GET /requests/-3` → 400 INVALID_REQUEST_ID ✓
- `GET /requests/12abc` → 400 INVALID_REQUEST_ID ✓
- `GET /requests/999999999` (existente pero no encontrado) → 404 REQUEST_NOT_FOUND ✓

---

## Paso 3: INC-702 — Validación de prioridad inválida

### Problema
`PATCH { priority: "critical" }` provocaba error 500 de PostgreSQL (CHECK constraint) en lugar de 400 contractual.

### Solución
Añadir validación en `src/modules/requests/requests.service.js`:

**En `createRequest` (línea ~97):**
```javascript
if (priority !== undefined && !PRIORITIES.includes(priority)) {
  throw new AppError('contract', 'INVALID_PRIORITY', `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
}
```

**En `patchRequest` (línea ~140):**
```javascript
if (changes.priority !== undefined && !PRIORITIES.includes(changes.priority)) {
  throw new AppError('contract', 'INVALID_PRIORITY', `Unknown priority "${changes.priority}". Valid values: ${PRIORITIES.join(', ')}.`);
}
```

### Verificación
- `POST /requests` con `priority: "critical"` → 400 INVALID_PRIORITY ✓
- `PATCH /requests/:id` con `priority: "critical"` → 400 INVALID_PRIORITY ✓
- `POST /requests` con `priority: "high"` → 201 ✓
- `PATCH /requests/:id` con `priority: "low"` → 200 ✓
- La restricción CHECK en PostgreSQL permanece intacta ✓

---

## Paso 4: OPS-703 — Request ID y trazabilidad

### 4.1 Middleware `requestId` (`src/middleware/request-id.js`)

```javascript
const REQUEST_ID_REGEX = /^[a-zA-Z0-9._-]{1,64}$/;

export function requestId(req, res, next) {
  const header = req.headers['x-request-id'];
  let requestId;
  
  if (typeof header === 'string' && REQUEST_ID_REGEX.test(header)) {
    requestId = header;
  } else {
    requestId = `req_${randomUUID()}`;
  }
  
  req.requestId = requestId;
  res.set('X-Request-Id', requestId);
  next();
}
```

- Acepta header del cliente solo si cumple formato seguro
- Genera `req_<uuid>` si no hay header o es inválido
- Expone en `req.requestId` y header `X-Request-Id`

### 4.2 Middleware `requestLogger` (`src/middleware/request-logger.js`)

```javascript
export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const status = res.statusCode;

    const fields = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status,
      durationMs
    };

    if (req.auth?.userId) fields.userId = req.auth.userId;
    if (res.locals.errorCode) fields.errorCode = res.locals.errorCode;

    if (status >= 500) {
      logger.error('request_failed', fields);
    } else {
      logger.info('request_completed', fields);
    }
  });

  next();
}
```

- Una línea JSON por petición terminada (evento `finish`)
- Allowlist explícita (no loggea todo el objeto request)
- NUNCA loggea `Authorization`, body, tokens, DATABASE_URL
- `userId` solo si hay `req.auth`
- `errorCode` desde `res.locals.errorCode` (seteado por error handler)

### 4.3 Middleware `errorHandler` (`src/middleware/error-handler.js`)

```javascript
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const requestId = req.requestId ?? 'unknown';

  if (error instanceof AppError) {
    res.locals.errorCode = error.code;
    return res.status(CATEGORY_STATUS[error.category] ?? 500)
      .json(errorBody(error.code, error.message, requestId));
  }

  if (error.type === 'entity.parse.failed') {
    res.locals.errorCode = 'INVALID_JSON';
    return res.status(400).json(errorBody('INVALID_JSON', 'The request body is not valid JSON.', requestId));
  }

  if (INFRASTRUCTURE_CODES.includes(error.code) || /Connection terminated/i.test(error.message ?? '')) {
    logger.error('database_unavailable', { code: error.code, message: error.message, requestId });
    res.locals.errorCode = 'DATABASE_UNAVAILABLE';
    return res.status(503).json(errorBody('DATABASE_UNAVAILABLE', 'The service cannot access its data store.', requestId));
  }

  logger.error('internal_error', { name: error.name, message: error.message, stack: error.stack, requestId });
  res.locals.errorCode = 'INTERNAL_ERROR';
  return res.status(500).json(errorBody('INTERNAL_ERROR', 'An unexpected error occurred.', requestId));
}
```

- **Único** punto de traducción error → HTTP response
- Incluye `requestId` en **TODOS** los cuerpos de error
- Detalles internos (stack, SQL, message) solo al logger, nunca al cliente
- Guarda `res.locals.errorCode` para requestLogger

### 4.4 Middleware `notFound` (`src/middleware/not-found.js`)

```javascript
export function notFound(req, res, next) {
  next(new AppError('resource', 'ROUTE_NOT_FOUND', 'The requested resource does not exist.'));
}
```

- Lanza error tipado para que errorHandler lo formatee consistentemente

### 4.5 Health/Ready routes (`src/routes/health.routes.js`)

```javascript
async function defaultCheckDatabase() {
  await pool.query('SELECT 1');
}

export function createHealthRouter({ checkDatabase = defaultCheckDatabase } = {}) {
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get('/ready', async (req, res) => {
    try {
      await checkDatabase();
      res.status(200).json({ status: 'ready', database: 'available' });
    } catch {
      res.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  return router;
}
```

- `/health`: liveness probe — nunca toca BD, responde 200 aunque BD esté caída
- `/ready`: readiness probe — `SELECT 1` barato, 200 si OK, 503 si falla
- `checkDatabase` inyectable para tests (permite simular fallo sin romper credenciales reales)

### 4.6 Actualización de `app.js` — Orden de middlewares

```javascript
app.use(corsPolicy);
app.use(requestId);           // 1º: ID disponible para todo
app.use(requestLogger);       // 2º: loggea con requestId
app.use(express.json());
app.use(healthRoutes);        // público, sin auth
app.use('/auth', authRoutes);
app.use('/requests', authenticate, requestsRoutes);
app.use(notFound);            // después de rutas
app.use(errorHandler);        // ÚLTIMO: captura todo lo anterior
```

### 4.7 Actualización de rutas para propagar errores

**`src/modules/requests/requests.routes.js`** y **`src/modules/auth/auth.routes.js`**:
- Eliminados `try/catch` + `respondError()`
- Cambiado a `try/catch` + `next(error)`
- El error handler central procesa todo

---

## Paso 5: Validación final

```bash
npm run validate:class-07 > validation-evidence.txt
```

**Resultado: FINAL RESULT: PASSED (12/12)**

```
Baseline
[01/12] Existing contract preserved .......... PASS

Input and errors
[02/12] Invalid id returns 400 ............... PASS
[03/12] Invalid priority returns 400 ......... PASS
[04/12] Unknown request returns 404 .......... PASS
[05/12] Invalid transition returns 409 ....... PASS
[06/12] Unexpected errors return 500 ......... PASS
[07/12] Internal details remain hidden ....... PASS

Traceability
[08/12] Response contains request id ......... PASS
[09/12] Log contains the same request id ..... PASS
[10/12] Authorization header is not logged ... PASS

Operation
[11/12] Health endpoint responds ............. PASS
[12/12] Readiness checks PostgreSQL .......... PASS

Cleanup
Temporary validation data removed successfully.

FINAL RESULT: PASSED
```

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/modules/requests/requests.routes.js` | Middleware `validateId`, `next(error)` en lugar de `respondError` |
| `src/modules/requests/requests.service.js` | Validación `priority` en `createRequest` y `patchRequest` |
| `src/middleware/request-id.js` | Implementación completa |
| `src/middleware/request-logger.js` | Implementación completa |
| `src/middleware/error-handler.js` | Implementación completa (reemplaza respond-error.js) |
| `src/middleware/not-found.js` | Implementación completa |
| `src/routes/health.routes.js` | Implementación `/health` y `/ready` |
| `src/app.js` | Registro middlewares en orden correcto, import healthRoutes |
| `src/modules/auth/auth.routes.js` | `next(error)` en lugar de `respondError` |

---

## Archivos de evidencia

- `validation-evidence.txt` (raíz y `activities/class-07/`)
- `activities/class-07/incident-report.md` (actualizado con implementación real)
- `explicacion.md` (este archivo)
- `tickets.md` (respuestas a 13 preguntas diagnósticas)