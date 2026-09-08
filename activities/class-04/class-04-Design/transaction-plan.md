# Transaction plan — el cambio de estado con historia

> Fase 1 · se completa antes de escribir la transacción. Si una pregunta no tiene
> respuesta en papel, el código la va a improvisar.

1. **¿Qué operaciones forman la unidad?**
   El UPDATE en la tabla `requests` para cambiar su estado y fecha, y el INSERT en la tabla `request_status_history` para dejar la traza del cambio.

2. **¿Qué ocurre si falla la primera (el UPDATE)?**
   Lanza un error al driver, el motor de PG detiene la secuencia, se salta al bloque `catch`, se emite `ROLLBACK`, y nada se modifica en la BD.

3. **¿Qué ocurre si falla la segunda (el INSERT de historia)?**
   Lanza error. El bloque `catch` captura la excepción y ejecuta `ROLLBACK`. Esto revierte el UPDATE anterior que parecía exitoso, manteniendo la base de datos idéntica a antes de iniciar.

4. **¿Cuándo se ejecuta `COMMIT`?**
   Únicamente después de que el driver confirma que tanto el UPDATE como el INSERT se resolvieron exitosamente, al final del bloque `try`.

5. **¿Cuándo se ejecuta `ROLLBACK`?**
   Dentro del bloque `catch`, inmediatamente después de capturar cualquier error lanzado por las consultas internas.

6. **¿Qué cliente ejecuta las consultas?** _(¿por qué no `pool.query()`?)_
   Debe usarse un cliente exclusivo obtenido mediante `const client = await pool.connect()`. Si usáramos `pool.query()`, el pool asignaría conexiones distintas para el BEGIN, el UPDATE, el INSERT y el COMMIT, rompiendo la transacción.

7. **¿Cuándo se libera el cliente?** _(¿y si hubo error?)_
   En el bloque `finally` usando `client.release()`. Se ejecuta sin importar si hubo éxito (después del try) o si hubo error (después del catch).

8. **¿Qué inconsistencia concreta evita esta unidad?** _(descríbela con las dos tablas)_
   Evita que en la tabla `requests` un ticket aparezca con status `in_progress`, pero en la tabla `request_status_history` no exista registro de quién, cuándo, ni desde qué estado previo se realizó ese cambio. (Base de datos desincronizada).

## La creación también es una unidad

_(¿Qué dos escrituras ocurren al crear una solicitud? ¿Por qué también van juntas?)_
Al crear se ejecuta el `INSERT` en `requests` (nace la entidad) y el `INSERT` inicial en `request_status_history`. Van juntas porque un request no puede existir en la BD sin un registro histórico que pruebe cómo inició su ciclo de vida (estado 'open').