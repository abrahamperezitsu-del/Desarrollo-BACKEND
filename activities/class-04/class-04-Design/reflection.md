# Reflection — Entrega 04

> Fase 6. Respuestas concretas y con evidencia.

1. **¿Qué cambió al sustituir el array?**
   Se sustituyó la volatilidad en memoria por persistencia duradera (ACID). Ahora los datos sobreviven al reinicio de la aplicación y pueden ser consultados de manera concurrente mediante SQL.

2. **¿Qué parte del contrato HTTP permaneció igual?**
   Las rutas (`/requests`), métodos HTTP (`GET`, `POST`, `PATCH`), códigos de estado (`201`, `404`, `409`) y la estructura del payload JSON recibido por el cliente permanecieron exactamente iguales.

3. **¿Qué regla protege PostgreSQL?**
   Protege la integridad estructural y de datos mediante restricciones tipadas (`UUID`), campos obligatorios (`NOT NULL`), valores válidos (`CHECK` en priority/status) e integridad referencial (`FOREIGN KEY`).

4. **¿Qué regla sigue protegiendo la aplicación?**
   La lógica de transiciones de estado permitidas (ej. no saltar de `open` a `completed`), el bloqueo de modificaciones a estados terminales (`canceled`), y el mapeo de errores de infraestructura a respuestas HTTP amigables.

5. **¿Por qué utilizaste parámetros?**
   Para evitar ataques de Inyección SQL (SQLi). Al usar `$1`, `$2`, el driver `pg` envía la consulta y los datos por separado al motor de PostgreSQL, neutralizando cualquier intento de inyección de código.

6. **¿Por qué necesitas un pool?**
   Para reutilizar un conjunto limitado de conexiones activas a la base de datos en lugar de abrir y cerrar una conexión TCP pesada en cada petición HTTP, mejorando significativamente el rendimiento.

7. **¿Por qué la transacción debe usar el mismo cliente?**
   Porque en PostgreSQL una transacción (`BEGIN` / `COMMIT`) se aísla dentro de una sesión de conexión específica. Si se usaran clientes distintos del pool, las sentencias se ejecutarían en contextos aislados fuera de la transacción.

8. **¿Qué inconsistencia evita el rollback?**
   Evita que la tabla `requests` actualice su estado a `in_progress` mientras que el registro correspondiente en `request_status_history` falle en crearse, previniendo estados huerfanos sin trazabilidad auditables.

9. **¿Por qué una fila no me da automáticamente la respuesta HTTP?**
   Porque la base de datos utiliza convenciones internas (`snake_case`, tipos de datos primitivos de SQL) que deben transformarse a la representación expuesta en el contrato de API (`camelCase`, objetos JSON estandarizados).

10. **¿Qué limitación sigue teniendo la solución?**
    Que ante una caída total de red o de la instancia de base de datos en Supabase, la aplicación depende enteramente de la disponibilidad del servidor externo, sin una capa de caché de contingencia (como Redis).

11. **¿Qué sugerencia de IA rechazaste?**
    La incorporación de un ORM completo o de la librería `@supabase/supabase-js`, ya que agregaban capas de abstracción innecesarias que ocultaban la gestión explícita de las transacciones SQL y el driver nativo `pg`.

12. **¿Cómo comprobaste que los datos sobreviven al reinicio?**
    Creando un recurso vía `POST`, cerrando completamente la instancia del proceso Node.js (`Ctrl+C`), volviéndola a iniciar con `npm start` y ejecutando un `GET /requests/:id` que retornó exitosamente la entidad creada.