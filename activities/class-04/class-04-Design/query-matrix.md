# Query matrix — Entrega 04

> Fase 1 · cada operación con su SQL (parametrizado) y sus parámetros. El SQL de esta
> matriz debe coincidir con el que termine en el store — si divergen, actualiza la matriz.

| Operación          | SQL                                | Parámetros   | Resultado esperado |
| ------------------ | ---------------------------------- | ------------ | ------------------ |
| Listar             | `SELECT * FROM requests ORDER BY created_at DESC;` | —            | Filas múltiples    |
| Buscar por ID      | `SELECT * FROM requests WHERE id = $1;` | `[id]`         | Fila o ausencia (0 rows)|
| Crear              | `INSERT INTO requests (title, priority, status) VALUES ($1, $2, 'open') RETURNING *;` | `[title, priority]` | Fila creada        |
| Filtrar estado     | `SELECT * FROM requests WHERE status = $1 ORDER BY created_at DESC;` | `[status]` | Colección          |
| Actualizar         | `UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;` | `[new_status, id]` | Fila actualizada   |
| Registrar historia | `INSERT INTO request_status_history (request_id, previous_status, new_status) VALUES ($1, $2, $3);` | `[id, prev_status, new_status]` | Inserción exitosa |
| Consultar historia | `SELECT * FROM request_status_history WHERE request_id = $1 ORDER BY changed_at DESC;` | `[id]`           | Eventos            |

## Comprobación de seguridad

Revisado: Todo el SQL utiliza interpolación paramétrica de pg (`$1`, `$2`, `$3`). Ningún valor del cliente (`title`, `priority`, `status`) se concatena directamente en el string del query. Queda protegido contra SQL Injection.