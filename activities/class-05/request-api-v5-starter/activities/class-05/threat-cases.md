# Casos adversariales — Request API v5

Al menos ocho ataques con resultado exacto (`código HTTP + error.code`).
Formato: `N. Descripción → resultado`.

---

1. Registro con `"role": "agent"` → `400 SERVER_CONTROLLED_FIELD`
2. Registro con `"createdBy": "otro-uuid"` → `400 SERVER_CONTROLLED_FIELD`
3. Registro con password de 8 caracteres → `400 INVALID_PASSWORD`
4. Registro con email duplicado → `409 ACCOUNT_CANNOT_BE_CREATED`
5. Login con password incorrecta → `401 INVALID_CREDENTIALS`
6. Login con email inexistente → `401 INVALID_CREDENTIALS` (mismo mensaje)
7. Token JWT alterado (role modificado) → `401 INVALID_TOKEN`
8. Token JWT expirado → `401 INVALID_TOKEN` (mismo error genérico)
9. Header sin esquema Bearer → `401 AUTHENTICATION_REQUIRED`
10. `GET /auth/me` sin token → `401 AUTHENTICATION_REQUIRED`
11. `agent` crea solicitud (`POST /requests`) → `403 FORBIDDEN`
12. `requester` cambia estado → `403 FORBIDDEN`
13. `requester` cambia prioridad → `403 FORBIDDEN`
14. `requester` edita solicitud ajena → `404 REQUEST_NOT_FOUND`
15. `requester` edita solicitud en estado terminal → `409 REQUEST_IN_TERMINAL_STATUS`
16. Body mixto: título + estado (requester) → `403 FORBIDDEN`
17. Transición inválida: `open → resolved` → `409 INVALID_STATUS_TRANSITION`
18. Solicitud heredada (`created_by IS NULL`) vista por requester → `404 REQUEST_NOT_FOUND`
