# Matriz de acceso — Request API v5

Dos roles exactos: `requester` y `agent`. Sin `admin`.

## Preguntas por cada operación

Para cada fila me pregunto:
- **¿Necesito saber QUIÉN pregunta?** → Si sí, la celda Anónimo es `No`.
- **¿Necesito saber DE QUIÉN es el recurso?** → Si sí, la celda Requester se acota a `Propias` o `Propia y abierta`.

Si alguna respuesta es sí, la fila no puede decir anónimo.

## Matriz

| Operación | Anónimo | Requester | Agent |
| --------- | ------: | --------: | ----: |
| `POST /auth/register` | Sí | Sí | Sí |
| `POST /auth/login` | Sí | Sí | Sí |
| `GET /auth/me` | No | Sí | Sí |
| `GET /requests` | No | Propias | Todas |
| `GET /requests/:id` | No | Propia | Todas |
| `GET /requests/:id/history` | No | Propia | Todas |
| `POST /requests` | No | Sí | No |
| `PATCH /requests/:id` (título/descripción) | No | Propia y abierta | No |
| `PATCH /requests/:id` (prioridad) | No | No | Sí |
| `PATCH /requests/:id` (estado) | No | No | Sí |

## Justificación por operación

### `POST /auth/register` → Anónimo: Sí · Requester: Sí · Agent: Sí

**¿Quién pregunta?** Cualquiera. No hay identidad previa.
**¿De quién es el recurso?** Se crea uno nuevo, no aplica.

Cualquier persona puede registrarse. Los usuarios existentes también pueden
crearse cuentas adicionales. No hay restricción de rol previo.

### `POST /auth/login` → Anónimo: Sí · Requester: Sí · Agent: Sí

**¿Quién pregunta?** Cualquiera.
**¿De quién es el recurso?** Se busca, no se crea.

Mismo razonamiento: autenticación es un proceso público. El server no distingue
quién pide hasta que verifica las credenciales.

### `GET /auth/me` → Anónimo: No · Requester: Sí · Agent: Sí

**¿Quién pregunta?** Sí. Necesito saber quién es el actor para responder
sus datos. Sin identidad no hay respuesta.
**¿De quién es el recurso?** Es el propio actor, siempre.

Endpoint protegido. La respuesta depende del token. Sin token no hay identidad.

### `GET /requests` → Anónimo: No · Requester: Propias · Agent: Todas

**¿Quién pregunta?** Sí. Debo scoping según el rol.
**¿De quién es el recurso?** Sí. El `requester` solo ve las suyas; el `agent`
ve todas.

La celda Propias se implementa con filtro SQL `created_by = actor.userId`.
El `agent` no necesita filtro: ve todo incluyendo heredadas (`created_by IS NULL`).

### `GET /requests/:id` → Anónimo: No · Requester: Propia · Agent: Todas

**¿Quién pregunta?** Sí.
**¿De quién es el recurso?** Sí. Un `requester` solo puede ver la suya.

Si la solicitud es ajena o no existe, la respuesta es `404 REQUEST_NOT_FOUND`
en ambos casos. No se revela existencia.

### `GET /requests/:id/history` → Anónimo: No · Requester: Propia · Agent: Todas

**¿Quién pregunta?** Sí.
**¿De quién es el recurso?** Sí. Misma lógica que `GET /:id`.

El historial de una solicitud ajena es información sensible. Misma regla de
no-revelación: `404` idéntico.

### `POST /requests` → Anónimo: No · Requester: Sí · Agent: No

**¿Quién pregunta?** Sí. Debo verificar que el actor sea `requester`.
**¿De quién es el recurso?** Se crea uno nuevo. El `createdBy` se toma del
token, nunca del body.

El `agent` no crea solicitudes: las atiende. Un `agent` que intenta crear
recibe `403 FORBIDDEN`. El `requester` puede crear libremente.

### `PATCH /requests/:id` (título/descripción) → Anónimo: No · Requester: Propia y abierta · Agent: No

**¿Quién pregunta?** Sí. Debo verificar ownership + estado.
**¿De quién es el recurso?** Sí, y además debe estar en estado `open`.

Un `requester` solo edita sus propias solicitudes y solo mientras están
abiertas. Una solicitud `in_progress`, `resolved`, `closed` o `cancelled`
responde `409 REQUEST_IN_TERMINAL_STATUS`. Una solicitud ajena responde
`404 REQUEST_NOT_FOUND`. Un `agent` no edita contenido, solo prioridad
y estado.

### `PATCH /requests/:id` (prioridad) → Anónimo: No · Requester: No · Agent: Sí

**¿Quién pregunta?** Sí. Solo `agent` puede cambiar prioridad.
**¿De quién es el recurso?** No importa. El `agent` puede cambiar la
prioridad de cualquier solicitud.

El `requester` no tiene este permiso. Si lo intenta, recibe `403 FORBIDDEN`.
La prioridad es una decisión operativa, no del solicitante.

### `PATCH /requests/:id` (estado) → Anónimo: No · Requester: No · Agent: Sí

**¿Quién pregunta?** Sí. Solo `agent` puede cambiar estado.
**¿De quién es el recurso?** No importa. Pero la máquina de estados aplica
para todos.

El `agent` puede cambiar estado, pero respetando la máquina:
`open → in_progress → resolved → closed`. Las transiciones inválidas
responden `409 INVALID_STATUS_TRANSITION`. Los estados terminales
(`closed`, `cancelled`) no admiten cambios: `409 REQUEST_IN_TERMINAL_STATUS`.

## Campos controlados por el servidor

### En registro (`POST /auth/register`)

| Campo | Permitido en body | Resultado si aparece |
| ----- | ----------------- | -------------------- |
| `role` | No | `400 SERVER_CONTROLLED_FIELD` |
| `id` | No | `400 SERVER_CONTROLLED_FIELD` |
| `createdAt` | No | `400 SERVER_CONTROLLED_FIELD` |
| `passwordHash` | No | `400 SERVER_CONTROLLED_FIELD` |

Solo `email` y `password` son aceptados. El `role` siempre es `requester`
por defecto en la migración 003. El `id` lo genera la base como UUID.
Rechazar explícitamente es mejor que ignorar silenciosamente.

### En solicitudes (`POST /requests` y `PATCH /requests/:id`)

| Campo | POST permitido | PATCH permitido | Resultado si aparece |
| ----- | -------------- | --------------- | -------------------- |
| `id` | No | No | `400 SERVER_CONTROLLED_FIELD` |
| `createdBy` | No | No | `400 SERVER_CONTROLLED_FIELD` |
| `createdAt` | No | No | `400 SERVER_CONTROLLED_FIELD` |
| `updatedAt` | No | No | `400 SERVER_CONTROLLED_FIELD` |
| `status` | No | Solo agent | `400 SERVER_CONTROLLED_FIELD` (POST) |
| `changedBy` | — | No | `400 SERVER_CONTROLLED_FIELD` |

`createdBy` y `changedBy` se derivan del token JWT. Un cliente nunca define
quién creó o modificó algo. Esto impide que un atacante se atribuya
solicitudes ajenas o invoque actores inexistentes.

## Solicitudes heredadas

Las solicitudes creadas antes de la migración 004 tienen `created_by IS NULL`.
Solo `agent` puede verlas.

**¿Por qué?** El filtro del `requester` (`created_by = actor.userId`) no
puede matchear un `NULL`. No es un bug: un propietario desconocido no debería
ser accesible por un usuario regular. Los `agent` las ven porque su consulta
no aplica filtro de propiedad. Esto permite atender solicitudes históricas
sin necesidad de backfill.
