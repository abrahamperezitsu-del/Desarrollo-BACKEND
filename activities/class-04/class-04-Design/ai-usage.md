# AI usage

> Regla de la entrega: la IA revisa DESPUÉS del diseño (`class-04-design`) y no puede
> cambiar en silencio tablas, columnas, tipos, restricciones, rutas, estados, transiciones,
> códigos, estructura ni la decisión del historial. No se exigen conversaciones completas.

## My design before using AI

Antes de consultar a la IA, la Fase 1 de diseño quedó congelada y documentada en los siguientes archivos:
* `data-model.md`
* `persistence-contract.md`
* `query-matrix.md`
* `transaction-plan.md`
* `error-map.md`
* `test-matrix.md`

## What I asked the AI

* "¿Cómo estructurar el helper `withTransaction` en Node.js usando `pg` para asegurar que el `client.release()` siempre se ejecute en el `finally`?"
* "Revisa mi `requests.store.js` para confirmar que todas las consultas utilicen SQL parametrizado (`$1`, `$2`) sin concatenación de strings."
* "¿Cómo solucionar el error de resolución DNS `ENOTFOUND` al conectar Node.js con Supabase desde Windows?"

## What the AI proposed

* Encapsular el manejo de transacciones en la función `withTransaction(callback)` gestionando `BEGIN`, `COMMIT`, `ROLLBACK` y `client.release()`.
* Utilizar la URI del **Session Pooler** de Supabase en lugar de la conexión directa para resolver la compatibilidad de red IPv4 en Windows.
* Implementar una validación previa en el Service para verificar si la solicitud existe antes de consultar el historial y así devolver `404` en lugar de una lista vacía con status `200`.

## What I accepted

* **Aceptado**: El patrón de wrapper de transacción `withTransaction`.
  * *Beneficio*: Garantiza la atomicidad entre el `UPDATE` en `requests` y el `INSERT` en `request_status_history` previniendo fugas de clientes (*connection leaks*).
  * *Costo*: Involucra un nivel de abstracción funcional extra mediante callbacks.
* **Aceptado**: El uso del Session Pooler de Supabase en la variable `DATABASE_URL`.
  * *Beneficio*: Permite la conectividad fluida en entornos Windows sin fallos de DNS por IPv6.
  * *Costo*: Límite de conexiones sujetas a la configuración del pooler de Supabase.

## What I rejected or changed

* **Rechazado**: La sugerencia implícita de usar librerías como `@supabase/supabase-js` o un ORM (Prisma/Sequelize) para simplificar las consultas.
  * *Razón*: La arquitectura del proyecto exige el uso directo del driver nativo `pg`, consultas parametrizadas transparentes y el control explícito de la transacción.
* **Rechazado**: Eliminar registros de la base mediante cláusulas `DELETE`.
  * *Razón*: Viola la decisión de diseño previa (Decisión 001) que establece el uso de cancelación lógica y mantenimiento del historial.

## How I verified the result

* Ejecución exitosa de `npm run db:check` comprobando la versión de PostgreSQL 17.6.
* Verificación manual de las transacciones: provocación de un error forzado en el `INSERT` del historial para constatar que el `ROLLBACK` deshace el `UPDATE` en la tabla principal.

## What I still do not understand

* Cómo escala internamente el algoritmo de cola del Session Pooler de Supabase cuando la aplicación satura simultáneamente el número máximo de clientes en el pool.