# Error map — Entrega 04

> Fase 1 · clasifica cada situación por categoría y define la respuesta externa.
> Regla transversal: la respuesta al cliente jamás incluye contraseñas, hosts,
> sentencias SQL, stack traces ni errores crudos de PostgreSQL.

## Categorías

| Categoría        | Significado                                            | Estado HTTP |
| ---------------- | ------------------------------------------------------ | ----------- |
| Contrato         | La petición está mal en sí misma (Zod/Validación)      | 400         |
| Recurso          | El recurso referido no existe                          | 404         |
| Dominio          | Petición válida que el estado actual prohíbe           | 409 / 422   |
| Persistencia     | La base rechazó algo que la app creía válido           | 409 / 500   |
| Infraestructura  | La base no está disponible / Fallo red                 | 503 / 500   |
| Interno          | Error inesperado no identificado                       | 500         |

## Situaciones concretas

| Situación                                | Categoría       | Estado | Código de error    |
| ---------------------------------------- | --------------- | ------ | ------------------ |
| Falta `title` al crear                   | Contrato        | 400    | `MISSING_FIELD`    |
| Prioridad desconocida                    | Contrato        | 400    | `INVALID_PRIORITY` |
| Filtro con valor desconocido             | Contrato        | 400    | `INVALID_FILTER`   |
| Solicitud inexistente                    | Recurso         | 404    | `REQUEST_NOT_FOUND`|
| Transición inválida                      | Dominio         | 409    | `INVALID_TRANSITION`|
| Solicitud terminal (ej. completada)      | Dominio         | 409    | `TERMINAL_STATE`   |
| Restricción CHECK rechaza un INSERT      | Persistencia    | 500    | `DB_CONSTRAINT`    |
| Base pausada / sin red                   | Infraestructura | 503    | `SERVICE_UNAVAILABLE`|
| Error de pg no identificado              | Interno         | 500    | `INTERNAL_ERROR`   |

## Qué se registra en el log interno

* **Se registra**: El *Stack trace* completo, el nombre del error (`err.name`), el mensaje original de pg, los parámetros pasados a la consulta y la IP/Ruta HTTP (para replicar el error).
* **Prohibido loggear**: Strings de conexión (ej. `DATABASE_URL`), contraseñas o tokens expuestos por error en el payload, y datos sensibles de usuarios finales.