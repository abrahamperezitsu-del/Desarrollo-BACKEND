# Preserve request status history

> Decision 002. Ubicación: `docs/decisions/002-preserve-status-history.md`.

## Context

El sistema requiere rastrear la evolución de cada solicitud a lo largo de su ciclo de vida (`open` → `in_progress` → `completed` / `canceled`). Se debe evaluar si basta con mantener el estado actual en la entidad o si es imprescindible conservar la traza completa de cada transición.

## Options

### Option 1: Keep only the current status

Benefits:

* Modelo de datos extremadamente simple con una sola columna `status` en la tabla `requests`.
* Consultas de actualización rápidas mediante un único comando `UPDATE`.
* Menor consumo de espacio en disco en la base de datos.

Costs:

* Pérdida total de trazabilidad y auditoría: es imposible saber cuándo cambió de estado una solicitud o qué estado tenía previamente.
* Imposibilidad de calcular métricas de rendimiento (ej. tiempo promedio que una solicitud permanece en `in_progress`).

### Option 2: Store every status transition

Benefits:

* Registro histórico inmutable y auditable de cada cambio de estado con su fecha exacta (`changed_at`).
* Permite reconstruir la línea del tiempo completa del recurso para los usuarios y los auditores del sistema.
* Facilita analíticas futuras sobre los tiempos de resolución de solicitudes.

Costs:

* Incremento en la complejidad de las operaciones de escritura (requiere transacciones atómicas de 2 tablas).
* Crecimiento continuo de la tabla `request_status_history` en disco.

## Decision

Se selecciona la **Opción 2: Store every status transition**.

Se toma esta decisión porque el valor del dominio reside en la auditabilidad del proceso. Para garantizar la integridad de este historial sin penalizar la simplicidad del estado actual, el estado vigente se mantiene en la tabla `requests` mientras que cada evento de cambio se registra en `request_status_history`.

## Consequences

What do we gain?
Ganamos trazabilidad completa del ciclo de vida del recurso y la capacidad de responder a consultas de auditoría mediante el endpoint `GET /requests/:id/history`.

What additional data and code appear?
Aparece la tabla `request_status_history`, el código del helper de transacción `withTransaction`, y la lógica en el Store para ejecutar escrituras dobles.

What consistency problem must be handled?
El problema de consistencia principal es la desincronización entre las dos tablas: que el estado de la tabla `requests` cambie pero no se registre en `request_status_history` (o viceversa). Esto se resuelve obligando a que ambas escrituras ocurran dentro de una misma **transacción SQL (`BEGIN` / `COMMIT` / `ROLLBACK`)**.

What queries become possible?
Es posible consultar el historial cronológico de un ticket, medir tiempos de permanencia por estado y auditar transiciones no autorizadas.

What may need to change later?
En el futuro, si la tabla de historial crece exponencialmente, se requerirá implementar estrategias de particionamiento de tablas o archivado de datos antiguos.