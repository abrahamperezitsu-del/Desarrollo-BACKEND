# Responsibility map — Clase 08

Mapa de responsabilidades del handler cargado ANTES de refactorizar.
Complétalo mientras lees `GET /:id/history` en `requests.routes.js`.

## El handler analizado

Ruta/operación: `GET /requests/:id/history`

## Clasificación de bloques

Para cada bloque del handler, anota a qué categoría pertenece y qué líneas
lo forman (aprox.):

| Categoría | ¿Qué hace ese bloque aquí? | ¿A qué archivo debería moverse? |
| --- | --- | --- |
| HTTP (leer params/identidad) | Valida el parámetro id, responde HTTP. Líneas 40-45, 59-63, 96. | Debería ser manejado por el router de Express; la validación de id podría ir en un middleware. |
| Aplicación (coordinar el caso) | Ejecuta consultas SQL directamente en la ruta en lugar de coordinar a través de una service function. Líneas 48-53, 67-73. | `src/modules/requests/requests.service.js` - la service debe ser la única capa de coordinación. |
| Negocio (¿puede verse?) | Reglas de visibilidad: agente u owner. Implementado a mano en JavaScript. Líneas 59-63. | `src/modules/requests/request.policy.js` - `canViewRequest` ya existe y debería usarse aquí. |
| Persistencia (SQL) | Consultas SQL directas contra `pool`: obtener request y historial. Líneas 48-53, 67-73. | `src/modules/requests/requests.store.js` - todas las queries SQL deben estar en el store. |
| Presentación (construir respuesta) | Mapea filas SQL snake_case a respuesta HTTP camelCase. Líneas 76-93. | `src/modules/requests/request.mapper.js` - `mapHistoryEventRow` ya existe y debería reutilizarse. |
| Observabilidad (errores/requestId) | Lanza AppError con códigos y requestId en el body, manteniendo el contrato de la clase 7. | Ya está alineado con el patrón del proyecto. |

## Las preguntas del análisis

* ¿Cuántas RAZONES distintas tiene esta función para cambiar?

  5. El handler tiene responsabilidades separadas por: validación de parámetros, ejecución SQL, reglas de negocio de visibilidad, mapeo de datos y formato de respuesta. Cada una es un cambio independiente que debería vivir en su propia capa.

* ¿Qué piezas ya existentes del proyecto duplica? (pista: mira store, mapper y policy)

  El handler duplica: (1) las consultas SQL que ya están en `requests.store.js` (findById, findHistory), (2) el mapeo a formato camelCase que ya está en `request.mapper.js` (`mapHistoryEventRow`), y (3) las reglas de visibilidad que ya están en `request.policy.js` (`canViewRequest`). Estas duplicaciones violan el principio de una fuente de verdad.

* ¿Qué NO se puede probar de forma aislada mientras todo viva junto?

  El handler completo no puede probarse sin una base de datos corriendo, porque contiene queries SQL inline contra `pool`, lógica de negocio mezclada con HTTP y formato de respuesta acoplado. Cada capa individual (store, policy, mapper) puede probarse con objetos planos, pero la función completa requiere una instancia real de la base de datos.
