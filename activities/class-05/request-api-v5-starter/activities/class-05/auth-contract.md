# Contrato de autenticación — Request API v5

Cada endpoint: método, ruta, público/protegido, body, éxito, errores.

---

## POST /auth/register

**Público.** Body: `email`, `password`.

- `email`: requerido, formato básico, `trim` + `lowercase`, único.
- `password`: 15–128 code points Unicode. Espacios permitidos. Sin reglas de composición.

**Éxito:** `201` → `{ id, email, role: "requester", createdAt }`

| Código | `error.code` | Causa |
| ------ | ------------ | ----- |
| `400` | `SERVER_CONTROLLED_FIELD` | Body contiene `role`, `id`, `createdAt`, `updatedAt`, `createdBy` o `passwordHash` |
| `400` | `INVALID_EMAIL` | Requerido o formato inválido |
| `400` | `INVALID_PASSWORD` | Menos de 15 o más de 128 caracteres |
| `409` | `ACCOUNT_CANNOT_BE_CREATED` | Email duplicado. Mensaje genérico: no confirma existencia |

---

## POST /auth/login

**Público.** Body: `email`, `password`.

**Éxito:** `200` → `{ accessToken: "<jwt>", tokenType: "Bearer", expiresIn: 3600 }`

JWT: `sub` (uuid), `role`, `iat`, `exp` (iat + 3600), `iss = backend-course-api`, `aud = backend-course-client`, `alg = HS256`.

| Código | `error.code` | Causa |
| ------ | ------------ | ----- |
| `401` | `INVALID_CREDENTIALS` | Email inexistente, password incorrecta o ambos. Mensaje idéntico en todos los casos |

**Regla:** la respuesta NUNCA revela qué dato falló.

---

## GET /auth/me

**Protegido.** Requiere `Authorization: Bearer <token>`.

**Éxito:** `200` → `{ id, email, role }`

Nunca devuelve `passwordHash`, `password` ni material criptográfico.

| Código | `error.code` | Causa |
| ------ | ------------ | ----- |
| `401` | `AUTHENTICATION_REQUIRED` | Header ausente, vacío o sin esquema `Bearer` exacto |
| `401` | `INVALID_TOKEN` | Firma alterada, expirado, issuer/audience incorrectos. Un solo error genérico |

---

## Semántica de errores

### `401` — No hay identidad confiable

Cuando el servidor **no puede establecer quién es el actor**:
- Sin header `Authorization`.
- Esquema distinto de `Bearer`.
- Token no verificable (firma, exp, issuer, audience).
- Credenciales de login incorrectas.

Significado: "no sé quién eres."

### `403` — Identidad conocida, operación prohibida

Cuando el servidor **sabe quién es el actor** pero la operación no le corresponde:
- `agent` intenta crear solicitud (`POST /requests`).
- `requester` intenta cambiar prioridad o estado.
- `requester` edita solicitud ajena.
- Body mixto con campos permitidos y prohibidos (rechazo todo-o-nada).

Significado: "sé quién eres, pero no puedes hacer esto."

### `404` — No se revela existencia

Cuando la solicitud:
- No existe.
- Existe pero no pertenece al actor.

Ambos casos responden `404 REQUEST_NOT_FOUND` **idéntico**. Un atacante no
puede inferir existencia de recursos ajenos por diferencia de respuestas.

### `409` — Conflicto de estado

Cuando los datos son correctos pero el estado actual lo impide:
- Transición inválida (ej: `open → resolved`).
- Estado terminal (`closed`, `cancelled`).
- Email duplicado en registro.
