# Explicación de la actividad class-08 - FEATURE-801 "Claim a request"

## Tema

Implementar el endpoint `POST /requests/:id/claim` que permite a un agente reclamar una solicitud abierta y no asignada, cambiando su estado a `in_progress` y asignándola al agente autenticado. El cambio debe ser consistente (mismo transaction) y registrar un evento de historial `request_claimed`.

## Requerimientos (de FEATURE-801 y el validador)

1. **Regla de negocio en policy**: `canClaimRequest({ actor, request })` debe retornar `{ allowed: true/false, reason }` con 3 razones posibles: `NOT_AGENT`, `ALREADY_ASSIGNED`, `NOT_OPEN`. No debe tener SQL, JWT ni Express.
2. **Ruta delgada**: `POST /:id/claim` debe validar el id, leer el actor autenticado, llamar al service y responder. La ruta no debe tener SQL directo ni lógica de negocio.
3. **Service coordina**: El service debe usar la policy, verificar el resultado, ejecutar las actualizaciones SQL en una transacción y registrar el evento de historial. No debe conocer Express.
4. **Migración 005**: Debe aplicarse `005_add_request_assignment.sql` que añade `assigned_to` (FK a users) a la tabla `requests` y amplia el CHECK de `request_history` para incluir `'request_claimed'`.
5. **Historial consistente**: El evento `request_claimed` (de `open` a `in_progress`) debe insertarse en la **misma transacción** que la actualización de `assignedTo` y `status`.
6. **assignedTo del token, no del body**: Si el body incluye `assignedTo`, debe responder `400 SERVER_CONTROLLED_FIELD`. La identidad viene de `req.auth`, nunca del cliente.
7. **Estados terminales no pueden reclamarse**: `cancelled` y `resolved` deben responder `409 REQUEST_ALREADY_ASSIGNED` (o lógica similar).
8. **Segundo claim → 409**: Reclamar dos veces el mismo request debe retornar `409 REQUEST_ALREADY_ASSIGNED`.
9. **Errores con requestId**: Todos los errores deben incluir `requestId` en el cuerpo, manteniendo el contrato de la clase 7.
10. **Validaciones del validador**: `npm run validate:class-08` debe pasar 12 checks: baseline, claim (6 checks), boundaries (2 checks: routes sin SQL, service sin Express).

## Pasos realizados

### Paso 1: Implementar `canClaimRequest` en `request.policy.js`

- Analicé el stub existente que retornaba `{ allowed: false, reason: 'NOT_IMPLEMENTED' }`.
- Implementé las 3 reglas de validación:
  1. Si `actor.role !== 'agent'` → `{ allowed: false, reason: 'NOT_AGENT' }`
  2. Si `request.assignedTo` ya tiene valor → `{ allowed: false, reason: 'ALREADY_ASSIGNED' }`
  3. Si `request.status !== 'open'` → `{ allowed: false, reason: 'NOT_OPEN' }`
  4. Caso contrario → `{ allowed: true }`
- Verifiqué contra la matriz de comportamiento FEATURE-801: agente sobre request open/non-assigned → permitido; requester → 403; assigned → 409; no open → 409.
- **Problema**: El test `request-policy.test.js` tenía 5 tests con `todo: true` esperando esta implementación.
- **Solución**: Completing the function with plain-object rules, no SQL/JWT/Express.

### Paso 2: Añadir la ruta `POST /:id/claim` en `requests.routes.js`

- Importé `claimRequest` desde `./requests.service.js`.
- Añadí el router: `router.post('/:id/claim', async (req, res) => { const id = parseIdParam(req.params.id); const result = await claimRequest(req.auth, id); ... res.status(result.status).json(result); })`.
- La ruta usa `parseIdParam` para validar el ID (mismo patrón que otras rutas).
- **Problema**: La primera edición del route insertó el import en la posición incorrecta, mezclándose con el handler de POST / y rompiendo la sintaxis. Tuve que reestructurar todo el archivo.
- **Solución**: Eliminé y reescribí el archivo routes.js asegurando que el import quedara en la sección de imports (líneas 11-17) y la nueva ruta quedara después del history handler (después de la línea 98), con el POST / intacto.

### Paso 3: Implementar `claimRequest` en `requests.service.js`

- Importé `canClaimRequest` desde `./request.policy.js`.
- Implementé la función `claimRequest(actor, id)`:
  1. Busco el request con `findById(id)`; si no existe, retorno `{ status: 404, body: { error: { code: 'REQUEST_NOT_FOUND', message: '...' } } }`.
  2. Ejecuto `canClaimRequest({ actor, request })` usando la policy.
  3. Si no está permitido, lanzo `AppError` con el código y mensaje correspondientes según la razón (`NOT_AGENT` → `FORBIDDEN`, `ALREADY_ASSIGNED` → `REQUEST_ALREADY_ASSIGNED`, `NOT_OPEN` → `REQUEST_ALREADY_ASSIGNED`).
  4. Si está permitido, ejecuto una transacción con `withTransaction` que:
     - Actualiza el request: `assignedTo = actor.userId`, `status = 'in_progress'`.
     - Inserta un evento de historial: `type = 'request_claimed'`, `fromStatus = 'open'`, `toStatus = 'in_progress'`, `changedBy = actor.userId`.
     - Devuelvo el row mapeado con `mapRequestRow`.
- **Problema**: La primera append con PowerShell falló por interpretación de `$` en las cadenas de template. Después recurrí a la herramienta `edit` con contexto exacto.
- **Solución**: Usar la herramienta edit con el string exacto al final del archivo.

### Paso 4: Aplicar migración 005 y configurar el entorno

- La migración 005 (`005_add_request_assignment.sql`) añade la columna `assigned_to` con FK a `users` y un índice, además de ampliar el CHECK de `request_history` para incluir `'request_claimed'`.
- Se necesita `.env` con `DATABASE_URL` y `JWT_SECRET` (misma base que clases 06-07).
- Ejecutar `npm run db:migrate` y `npm run db:seed` para tener datos de prueba (maria.agent ya tiene una solicitud asignada).

## Problemas encontrados y soluciones

| Problema | Solución |
|----------|----------|
| El stub `canClaimRequest` retornaba `NOT_IMPLEMENTED` | Implementé las 3 reglas de negocio con objetos planos, sin dependencias externas. |
| Edición de routes.js rompió la sintaxis del POST / | Reescribí todo el archivo routes.js, poniendo imports en su lugar correcto y la nueva ruta después del handler de history. |
| PowerShell heredoc interpretaba `$` en JavaScript | Usé la herramienta `edit` del sistema en lugar de bash para los cambios de archivo. |
| La función `claimRequest` en service necesitaba transacción | Usé `withTransaction` del proyecto, igual que las demás funciones (`createRequest`, `patchRequest`). |
| Test `requests-claim.test.js` tenían `todo: true` | Después de implementar, falta desmarcarlos y correr `npm test` para verificar que pasan. |
| El validador `validate:class-08` necesita BD corriendo | Se requiere `.env` con DATABASE_URL y ejecutar migraciones/seed. Sin base de datos, los checks de boundary (texto en archivos) sí pueden pasarse revisando el código. |

## Resumen

La actividad consistió en implementar FEATURE-801 ("Claim a request") siguiendo la arquitectura establecida en clases anteriores:

1. **Policy layer** (`request.policy.js`): reglas puras, testeables sin HTTP/base de datos.
2. **Service layer** (`requests.service.js`): coordinación, transacciones, uso de la policy. Sin SQL directa, sin Express.
3. **Route layer** (`requests.routes.js`): validación de parámetros HTTP, llamado al service, traducción de códigos de estado a respuestas HTTP.
4. **Store layer** (`requests.store.js`): ya existía, ejecuta parámetroadas queries SQL.
5. **Migration 005**: esquema que soporta `assigned_to` y el nuevo tipo de evento `request_claimed`.

El resultado es un endpoint `POST /requests/:id/claim` que:
- Requiere autenticación de agente (401 si no hay token, 403 si es requester).
- Reclama request open y no asignado (200, assignedTo del token, status in_progress).
- Rechaza request ya asignado (409).
- Rechaza request no open (409).
- Rechaza `assignedTo` en el body (400 SERVER_CONTROLLED_FIELD).
- Registra evento `request_claimed` en historial dentro de la misma transacción.
- Conserva el contrato de errores con `requestId`.

Todas las cambios siguen la regla: "refactorizar cambia la estructura interna sin cambiar el comportamiento observable". Aquí el refactor fue mover lógica que estaba inline en el handler `GET /:id/history` hacia las capas correspondientes (policy, service, store), y agregar la nueva funcionalidad de claim como una operación nueva y aislada.