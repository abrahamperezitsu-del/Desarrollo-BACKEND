# FEATURE-206 — Endpoint del historial de solicitudes

Solicitado por: equipo de producto
Estado: abierto

## Historia

Como usuario autenticado,
quiero leer el historial de una solicitud
para poder entender cómo cambió con el tiempo.

## Endpoint

```http
GET /requests/:id/history
```

## Representación de referencia

```json
[
  {
    "id": 18,
    "type": "status_changed",
    "fromStatus": "open",
    "toStatus": "in_progress",
    "createdAt": "2026-09-15T18:30:00.000Z"
  },
  {
    "id": 21,
    "type": "priority_changed",
    "fromPriority": "medium",
    "toPriority": "high",
    "createdAt": "2026-09-15T18:45:00.000Z"
  }
]
```

## Reglas

1. Requiere autenticación.
2. Un solicitante puede leer el historial de SUS PROPIAS solicitudes.
3. Un solicitante no puede leer el historial de otra persona: mantén el contrato EXISTENTE
   para solicitudes ajenas (no lo cambies silenciosamente).
4. Un agente puede leer cualquier historial.
5. Una solicitud faltante responde `404`.
6. Una solicitud sin eventos responde `200` con `[]`.
7. Los eventos se ordenan del más antiguo al más reciente, con una regla estable cuando dos eventos
   comparten la misma marca de tiempo.
8. La respuesta nunca expone contraseñas, hashes, tokens ni secretos.
9. Mantén el formato de error existente y las responsabilidades existentes:
   no dupliques las reglas de autorización que ya existen.

## Fuera del alcance

Paginación, filtros del historial, WebSockets, auditoría avanzada.
