# Request Frontend — Entrega 05A

Frontend que consume la **Request API v5** (clase 05) con autenticación real, roles y permisos funcionando. Sin mocks.

## Stack
- **Vite** + JavaScript vanilla (ESM)
- Sin framework de UI — CSS propio, accesible y responsivo
- Configuración vía variables de entorno (`VITE_API_URL`)

## Estructura
```
frontend/
├── app/          ← Entrega 05A (ruta /app)
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   └── .env      ← VITE_API_URL=http://localhost:3000
└── learn/        ← Entrega 05B (ruta /learn)
```

## Requisitos previos
1. Backend corriendo en `http://localhost:3000` (ver `activities/class-05/request-api-v5-starter`)
2. Base de datos PostgreSQL accesible (Supabase o local)
3. Variable `FRONTEND_ORIGIN=http://localhost:5173` en el `.env` del backend para CORS

## Ejecución
```bash
# Terminal 1: Backend
cd activities/class-05/request-api-v5-starter
npm install
npm start          # Puerto 3000

# Terminal 2: Frontend
cd request-frontend-starter
npm install
npm run dev        # Puerto 5173 (Vite)
```

Abre `http://localhost:5173`.

## Cuentas de prueba
| Rol | Email | Password | Notas |
|-----|-------|----------|-------|
| requester | `alice@test.com` | `password123456789` | Crea y gestiona sus solicitudes |
| agent | `bob@test.com` | `password123456789` | Ve todas, cambia prioridad/estado |

> El registro **siempre** crea `requester`. Para promocionar a `agent` ejecuta SQL directo:
> ```sql
> UPDATE users SET role = 'agent' WHERE email = 'bob@test.com';
> ```

## Token — Dónde vive y por qué

**Estrategia elegida: memoria (variable JavaScript `accessToken` en `main.js:9`).**

- El token **no persiste** al recargar la página — es un logout automático honesto.
- No se usa `localStorage` ni `sessionStorage` en esta entrega.

### Riesgo XSS reconocido
> Si en el futuro se decide mover el token a `sessionStorage` (o `localStorage`) para persistir la sesión entre recargas, **cualquier vulnerabilidad XSS en la aplicación permitiría a un atacante robar el token y suplantar al usuario**.
>
> En entornos de producción, la recomendación es usar **cookies `HttpOnly` + `Secure` + `SameSite=Strict`** para el access token, y un refresh token rotativo también en cookie HttpOnly. Esto elimina la superficie de ataque XSS sobre el token.

## Configuración
| Variable | Dónde | Valor ejemplo |
|----------|-------|---------------|
| `VITE_API_URL` | `frontend/app/.env` | `http://localhost:3000` |
| `FRONTEND_ORIGIN` | `backend/.env` | `http://localhost:5173` |

El backend **requiere** que `FRONTEND_ORIGIN` coincida exactamente (esquema + host + puerto). Ver `src/middleware/cors.js`.

## Funcionalidades implementadas

### Autenticación
- Registro (`POST /auth/register`) — solo crea `requester`
- Login (`POST /auth/login`) — devuelve JWT
- Sesión actual (`GET /auth/me`) — muestra email y rol en topbar
- Logout local — olvida token en cliente (JWT sigue válido en servidor hasta expiración)
- Errores visibles y diferenciados: 400, 401 (credenciales / token), 409 (cuenta)

### Vista Requester
- Crear solicitud (`POST /requests`) — título, descripción, prioridad
- Listar las suyas (`GET /requests` con scoping automático)
- Filtrar por `status` y `priority`
- Ver detalle (`GET /requests/:id`)
- Ver historial (`GET /requests/:id/history`) — incluye `changedBy`
- Editar título y descripción **solo si es propia y está `open`** (`PATCH /requests/:id`)
- No muestra acciones de agent

### Vista Agent
- Listar **todas** las solicitudes
- Filtrar por `status` y `priority`
- Ver detalle e historial de cualquier solicitud
- Cambiar prioridad (`PATCH /requests/:id` con `{ priority }`)
- Cambiar estado (`PATCH /requests/:id` con `{ status }`)
  - **Solo transiciones válidas** desde el estado actual (mapa hardcodeado en frontend, validado en backend)
  - Estados terminales (`resolved`, `cancelled`) solo permiten `reopened`
- Conflictos 409 visibles: transición inválida, estado terminal

## Estados de interfaz (todos distinguibles)

| Estado | Visualización | Mensaje ejemplo |
|--------|---------------|-----------------|
| **Loading** | Spinner + texto "Cargando…" | — |
| **Empty** | Texto centrado muted | "Todavía no hay solicitudes. Crea la primera." |
| **Success** | Verde (`is-ok`) | "3 solicitud(es).", "Solicitud creada." |
| **400** | Rojo (`is-error`) | "La petición no cumplió el contrato." / "Filtro inválido." / "Campo controlado por el servidor." |
| **401** | Rojo | "Email o password incorrectos." / "Tu sesión expiró. Vuelve a entrar." |
| **403** | Rojo | "Tu rol no permite esta operación." |
| **404** | Rojo | "Esa solicitud no existe (o no es tuya)." |
| **409** | Rojo/Naranja | "Conflicto con el estado actual." / "Transición no permitida." |
| **500** | Rojo | "El servidor tuvo un problema inesperado. Intenta de nuevo." |
| **Backend caído / Red** | Rojo | "No se pudo contactar al backend. ¿Está encendido? ¿CORS?" |

Cada código tiene su propio mensaje — **no hay mensaje genérico único**.

## Matriz de escenarios probados

| Rol | Acción | Endpoint | Respuesta esperada | Verificado |
|-----|--------|----------|-------------------|------------|
| Anónimo | Registro válido | POST /auth/register | 201 + user | ✅ |
| Anónimo | Registro email duplicado | POST /auth/register | 409 ACCOUNT_CANNOT_BE_CREATED | ✅ |
| Anónimo | Login válido | POST /auth/login | 200 + token | ✅ |
| Anónimo | Login inválido | POST /auth/login | 401 INVALID_CREDENTIALS | ✅ |
| Requester | GET /auth/me | GET /auth/me | 200 + user | ✅ |
| Requester | Crear solicitud | POST /requests | 201 + request | ✅ |
| Requester | Listar propias | GET /requests | 200 + array (solo suyas) | ✅ |
| Requester | Filtrar status/priority | GET /requests?status=open | 200 + filtrado | ✅ |
| Requester | Ver detalle propia | GET /requests/:id | 200 + request | ✅ |
| Requester | Ver detalle ajena | GET /requests/:id | 404 REQUEST_NOT_FOUND | ✅ |
| Requester | Editar propia open | PATCH /requests/:id | 200 + updated | ✅ |
| Requester | Editar propia in_progress | PATCH /requests/:id | 403 FORBIDDEN | ✅ |
| Requester | Editar ajena | PATCH /requests/:id | 404 REQUEST_NOT_FOUND | ✅ |
| Requester | Cambiar prioridad | PATCH /requests/:id | 403 FORBIDDEN | ✅ |
| Requester | Cambiar estado | PATCH /requests/:id | 403 FORBIDDEN | ✅ |
| Agent | Listar todas | GET /requests | 200 + array (todas) | ✅ |
| Agent | Ver detalle cualquiera | GET /requests/:id | 200 + request | ✅ |
| Agent | Cambiar prioridad | PATCH /requests/:id | 200 + updated | ✅ |
| Agent | Cambiar estado válido | PATCH /requests/:id | 200 + updated + history | ✅ |
| Agent | Cambiar estado inválido | PATCH /requests/:id | 409 INVALID_STATUS_TRANSITION | ✅ |
| Agent | Cambiar estado terminal | PATCH /requests/:id | 409 REQUEST_IN_TERMINAL_STATUS | ✅ |
| Cualquiera | Token expirado | Cualquier protegido | 401 INVALID_TOKEN | ✅ |
| Cualquiera | Backend caído | Cualquiera | status 0 + mensaje red | ✅ |

## Build exitoso
```bash
npm run build
# Genera dist/ listo para deploy estático
```

## Reflexión sobre la integración

> **Lo que funcionó bien:**
> - El contrato HTTP inmutable (v4→v5) permitió construir el frontend sin adivinar campos.
> - La matriz de acceso fija (requester/agent) simplificó la lógica de UI condicional.
> - CORS con `FRONTEND_ORIGIN` explícito evitó sorpresas en desarrollo.
> - Errores con `code` + `message` consistentes permiten UX específica por caso.
>
> **Decisiones tomadas:**
> - **Token en memoria**: prioriza honestidad sobre conveniencia. El usuario entiende que recargar = logout. Documentado el riesgo XSS si se cambia.
> - **Transiciones en frontend**: se hardcodea el mapa `STATUS_TRANSITIONS` para mostrar solo opciones válidas en el `<select>` de agent. El backend es la autoridad final (409 si no coincide).
> - **404 unificada**: el backend devuelve 404 tanto para "no existe" como "no es tuya". El frontend refleja esa ambigüedad intencional en el mensaje.
>
> **Dificultades:**
> - Coordinar puertos (3000/5173) y CORS exacto.
> - Manejar `changedBy: null` en eventos heredados del historial.
> - Diferenciar 401 (auth) vs 403 (permiso) en UX sin duplicar lógica.

## AI Usage
Parte del código base (skeleton `main.js`, `index.html`, `styles.css`) provino del starter del curso. La implementación completa de flujos, manejo de errores diferenciados, vistas requester/agent, y documentación fue asistida por IA (modelo Nemotron 3 Ultra) y revisada manualmente.

## Licencia
Uso educativo — Curso de Backend, Clase 05.