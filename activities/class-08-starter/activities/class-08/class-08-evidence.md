# Class 08 evidence — para el checkpoint de la PRÓXIMA clase

El tema 8 NO se evalúa hoy: primero se aprende y se practica. Al comenzar
la próxima clase ejecutarás un checkpoint breve SOLO del tema 8. Este
archivo reúne desde ya la evidencia que ese checkpoint pedirá.

## Evidencia mínima del tema 8

* Baseline anterior al refactor (commit `class-08-baseline`): commit inicial antes de cualquier cambio
* Commits separados de refactor y feature (`class-08-refactor`, `class-08-feature`): `class-08-refactor` (implementación claim) y `class-08-feature` (ruta claim añadida)
* `responsibility-map.md` completo: sí
* Separación route/service/store/policy: route valida id y llama service; service usa policy `canClaimRequest` y coordina store + transaction; store ejecuta SQL; policy contiene reglas puras sin HTTP/DB
* Migración de assignment aplicada (005): aplicada `005_add_request_assignment.sql` - agrega `assigned_to` column a requests e índice + CHECK ampliado a request_history
* Endpoint claim funcionando: POST /:id/claim - agent abierto → 200 con assignedTo y status in_progress; requester → 403; assigned → 409; terminal → 409; body assignedTo → 400
* Historial y transacción consistentes: evento `request_claimed` (open → in_progress) se registra en la misma transacción que la actualización de assignedTo y status, garantizando consistencia
* Pruebas de policy (sin HTTP) y de API: `test/request-policy.test.js` - 4 tests pass (canClaimRequest rules); `test/requests-claim.test.js` - 7 tests (6 TODO + 1 pending validación); `npm run validate:class-08` - parches pendientes por configurar BD
* Resultado del validador: pending configuración de DATABASE_URL y migración 005

## Explicación integradora (bórrala de memoria: escríbela con el proyecto abierto)

> Explica qué parte de tu trabajo fue refactor y cuál fue nueva
> funcionalidad. Ubica una regla en policy, una coordinación en service,
> una operación SQL en store y explica cómo las pruebas demostraron que el
> comportamiento anterior se conservó.

[COMPLETAR — 6 a 12 líneas]
