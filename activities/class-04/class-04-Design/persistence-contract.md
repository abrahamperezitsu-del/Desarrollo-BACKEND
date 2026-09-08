# Persistence contract — operaciones del store

> Fase 1 · se completa antes de usar IA y antes de tocar código.
> Los contratos también existen entre módulos: este documento es la promesa del store
> hacia el service. Completa una sección por operación.

Operaciones: `findAll(filters)` · `findById(id)` · `create(input)` · `update(id, changes)` ·
`findHistory(requestId)`

---

## `findAll(filters)`

* **Entrada**: Objeto con filtros opcionales (ej. `{ status: 'open' }`). Valores restringidos por el contrato HTTP.
* **Consulta**: `SELECT * FROM requests [WHERE status = $1] ORDER BY created_at DESC`. Construcción dinámica si hay filtros.
* **Salida**: Array de objetos plana (representación de base de datos).
* **Ausencia de datos**: Devuelve un array vacío `[]`.
* **Errores posibles**: Error de conexión (pool exhausto) o error de sintaxis si el filtro está mal construido. El store lo propaga.
* **¿Necesita transacción?**: No, es una operación de solo lectura (DQL).
* **Mapeo**: En el Service/Mapper (para transformar de `snake_case` de la BD a `camelCase` del cliente).

## `findById(id)`

* **Entrada**: UUID del request en formato string.
* **Consulta**: `SELECT * FROM requests WHERE id = $1`.
* **Salida**: Objeto literal con los datos del request.
* **Ausencia de datos**: Devuelve `null`. El Service es quien decide lanzar el 404.
* **Errores posibles**: El string proporcionado no es un UUID válido (error de driver pg).
* **¿Necesita transacción?**: No, solo lectura.
* **Mapeo**: En el Mapper, de fila de BD a entidad de dominio.

## `create(input)`

* **Entrada**: Objeto validado con `title` y `priority`.
* **Consulta(s)**: 2 escrituras. 
  1) `INSERT INTO requests (title, priority) VALUES ($1, $2) RETURNING *`.
  2) `INSERT INTO request_status_history (request_id, previous_status, new_status) VALUES ($1, null, 'open')`.
* **Salida**: El objeto Request recién insertado (con su `id` y `created_at`).
* **Errores posibles**: Violación de restricción CHECK si la prioridad es inválida.
* **¿Necesita transacción?**: Sí. Registra el nacimiento en `requests` y su entrada inicial en el historial al mismo tiempo. Si el historial falla, el request no debe crearse.
* **Mapeo**: Retorna fila en bruto, el Service mapea para devolver.

## `update(id, changes)`

* **Entrada**: UUID del request, y objeto con `status` (y opcionalmente el `previous_status` extraído por el Service).
* **Consulta(s)**: 2 escrituras.
  1) `UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`.
  2) `INSERT INTO request_status_history (request_id, previous_status, new_status) VALUES ($1, $2, $3)`.
* **Salida**: Objeto Request actualizado.
* **Ausencia de datos**: Si el UPDATE retorna 0 filas, devuelve `null` (el request no existía).
* **Errores posibles**: Violación del constraint CHECK en status.
* **¿Necesita transacción?**: Sí, obligatoria. Mutar el estado y guardar el rastro son una única unidad atómica.
* **Mapeo**: Mapeado a JSON estándar por el mapper.

## `findHistory(requestId)`

* **Entrada**: UUID del request.
* **Consulta**: `SELECT * FROM request_status_history WHERE request_id = $1 ORDER BY changed_at ASC`.
* **Salida**: Array de objetos de historial de transiciones.
* **Ausencia de datos**: Array vacío `[]` (Si el `requestId` no existe, la base devuelve array vacío, el Service debe comprobar primero si el Request existe para dar 404).
* **Errores posibles**: UUID malformado.
* **¿Necesita transacción?**: No, lectura.
* **Mapeo**: `snake_case` a `camelCase`.