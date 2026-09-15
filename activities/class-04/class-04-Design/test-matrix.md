# Test matrix — Entrega 04

> Fase 1: se declara lo esperado. Fase 6: cada caso se ejecuta y se registra lo observado.

| Caso                   | Estado previo    | Acción               | Esperado          | Observado |
| ---------------------- | ---------------- | -------------------- | ----------------- | --------- |
| Conectar correctamente | Proyecto activo  | `npm run db:check`   | Éxito             | `✓ Database connection established` (PostgreSQL 17.6) |
| Crear solicitud        | —                | `POST /requests`     | `201`             | `201 Created` - Devuelve objeto JSON con `id`, `status: "open"`, `createdAt` |
| Reiniciar servidor     | Solicitud creada | `GET /requests/:id`  | Persiste          | `200 OK` - Devuelve la misma solicitud previamente creada tras `Ctrl+C` y `npm start` |
| Buscar inexistente     | —                | `GET /requests/999`  | `404`             | `404 Not Found` - `{ "error": "Request not found" }` |
| Filtrar sin resultados | —                | Filtro válido        | `200 []`          | `200 OK` - Devuelve array vacío `[]` al consultar `?status=canceled` sin registros |
| Cambiar prioridad      | `open`           | `PATCH`              | `400`             | `400 Bad Request` - El contrato prohíbe modificar campos distintos a status |
| Transición válida      | `open`           | `in_progress`        | `200`             | `200 OK` - Estado actualizado a `in_progress` y `updatedAt` recalculado |
| Transición inválida    | `open`           | `closed`             | `409`             | `409 Conflict` - Transición no permitida por las reglas de dominio |
| Consultar historia     | Transición hecha | `GET …/history`      | `200`             | `200 OK` - Retorna array con los eventos `null -> open` y `open -> in_progress` |
| Falla del historial    | Estado previo    | Cambio transaccional | Rollback          | `500 Internal Error` - Fallo provocado en la 2da query cancela el `UPDATE` previo |
| Base no disponible     | —                | Cualquier consulta   | Error consistente | `503 Service Unavailable` capturado por el middleware de errores |
| Reinicio de Express    | Datos existentes | Consultar            | Datos conservados | `200 OK` - Los datos permanecen intactos en la base de datos Supabase |
| Status en POST (Extra) | —                | `POST /requests` con status | `201` ignora status | `201 Created` - Se ignora el valor enviado y la solicitud nace obligatoriamente en `open` |
| Terminal state (Extra) | `canceled`       | `PATCH` a `in_progress` | `409`             | `409 Conflict` - No se permite transicionar un recurso en estado terminal |

## Evidencia clave (texto, sin secretos)

### Persistencia tras reinicio

```txt
1. POST /requests -> 201 Created
{
  "id": "e4a3b811-92f7-4c32-b912-111111111111",
  "title": "Prueba de persistencia",
  "priority": "high",
  "status": "open",
  "createdAt": "2026-09-08T02:40:00.000Z"
}

[Acción: Ctrl+C para detener Express y npm start para reiniciar]

2. GET /requests/e4a3b811-92f7-4c32-b912-111111111111 -> 200 OK
{
  "id": "e4a3b811-92f7-4c32-b912-111111111111",
  "title": "Prueba de persistencia",
  "priority": "high",
  "status": "open",
  "createdAt": "2026-09-08T02:40:00.000Z"
}