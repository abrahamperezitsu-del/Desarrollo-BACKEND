# Informe de incidente de la clase 07

Completa cada sección MIENTRAS investigas. Separa los hechos de
las interpretaciones: un "creo que" pertenece a Hipótesis, no a Evidencia.

## Línea base

El estado inicial se confirmó con la suite de pruebas de Node y con el diagnóstico del entorno:

```bash
node --test --test-concurrency=1 'test/*.test.js'
# y, antes del trabajo de incidentes, npm run class-07:doctor
```

La evidencia del entorno y la restricción del ejercicio indican que la base estaba sana antes de cubrir los incidentes; la ejecución real actual del validador de clase muestra que aún quedan 6/12 checks fallando.

## Incidente 701

### Informe

> "Some request identifiers return an internal server error."
>
> Un integrador está construyendo enlaces hacia solicitudes y algunos enlaces devuelven un error 500. El soporte indica que "a veces funciona y a veces no".

### Reproducción

```http
GET /requests/not-a-number
Authorization: Bearer <token válido de cualquier usuario>
```

### Resultado esperado

```http
400 Bad Request
```

```json
{
  "error": {
    "code": "INVALID_REQUEST_ID",
    "message": "Request id must be a positive integer."
  },
  "requestId": "req_..."
}
```

### Resultado real

La validación actual devuelve:

```text
GET /requests/not-a-number -> 500 INTERNAL_ERROR
```

El validador concluye:

```text
[FAIL] Invalid id returns 400
Expected: 400 INVALID_REQUEST_ID for text, decimals, zero and negatives
Received: GET /requests/not-a-number -> 500 INTERNAL_ERROR
```

### Hipótesis

1. El valor de `req.params.id` se convierte con `Number(...)` sin validar que sea un entero positivo. Si el valor es `not-a-number`, ese cálculo produce `NaN`, y el SQL intenta ejecutarse con un valor inválido.
   - Cómo comprobarlo: inspeccionar `requests.routes.js` y el punto donde se llama a `getRequest`/`findById`, y verificar el comportamiento en `GET /requests/not-a-number`.

2. El flujo no valida el formato completo del identificador antes de ejecutar SQL, así que un valor como `12abc` o `1.5` puede pasar por un parseo ingenuo y llegar al backend como dato sucio.
   - Cómo comprobarlo: probar varios valores (`not-a-number`, `1.5`, `0`, `-3`, `12abc`) y revisar si se ejecuta la consulta antes de la validación contractual.

### Evidencia

- El validador mostró exactamente: `GET /requests/not-a-number -> 500 INTERNAL_ERROR`.
- En el código actual, `requests.routes.js` hace `Number(req.params.id)` y luego llama al servicio/almacen sin una validación previa.
- El error técnico se debe a que el valor llega a PostgreSQL como un parámetro no válido; la aplicación no intercepta la anomalía antes de que se ejecute la consulta.
- La validación de clase confirma que la respuesta del cliente debía ser 400 y no 500.

### Causa confirmada

La causa real es la falta de validación contractual del identificador antes de consultar la base de datos. El valor no numérico o no entero se convierte o se pasa al SQL sin una comprobación estricta, provocando un error interno en lugar de una respuesta `400 INVALID_REQUEST_ID`.

### Corrección

La corrección mínima debe estar en el flujo de validación del módulo de requests:

- archivo probable: `src/modules/requests/requests.service.js`
- tarea: validar que `id` sea un entero positivo y rechazarlo con `AppError('contract', 'INVALID_REQUEST_ID', ...)` antes de ejecutar cualquier consulta SQL.
- además, conservar la diferencia entre `id inválido` y `id bien formado pero inexistente`: el primero es `400`, el segundo sigue siendo `404 REQUEST_NOT_FOUND`.

### Prueba de regresión

La prueba de regresión debería cubrir los casos del stub de `test/errors.test.js`:

- `an alphabetic id answers 400 INVALID_REQUEST_ID, not 500`
- `decimal, zero and negative ids are rejected the same way`
- `a well-formed id that matches nothing still answers 404`

En la validación actual, la prueba que falla es precisamente la de `Invalid id returns 400`.

## Incidente 702

### Informe

> "Updating some priorities produces an internal server error."
>
> Un agente intenta marcar una solicitud como `critical` desde una herramienta externa y recibe un error 500 sin explicación útil.

### Reproducción

```http
PATCH /requests/:id
Authorization: Bearer <token de un agente>
Content-Type: application/json
```

```json
{
  "priority": "critical"
}
```

### Resultado esperado

```http
400 Bad Request
```

```json
{
  "error": {
    "code": "INVALID_PRIORITY",
    "message": "Priority must be low, medium or high."
  },
  "requestId": "req_..."
}
```

### Resultado real

La validación actual devuelve:

```text
PATCH { priority: "critical" } -> 500 INTERNAL_ERROR
```

El validador reporta:

```text
[FAIL] Invalid priority returns 400
Expected: PATCH { priority: "critical" } -> 400 INVALID_PRIORITY
Received: 500 INTERNAL_ERROR
```

### Hipótesis

1. La aplicación no valida el valor de `priority` antes de llegar a la base de datos.
   - Cómo comprobarlo: revisar `patchRequest` y buscar si `changes.priority` se acepta sin controlar las opciones válidas.

2. La restricción `CHECK` de PostgreSQL está actuando como segunda defensa, pero el contrato de la API debería haber rechazado el valor antes de ejecutar SQL.
   - Cómo comprobarlo: inspeccionar la definición de la tabla y la validación del servicio; el valor inválido debe responder `400` en la capa de aplicación, no `500` del motor de base de datos.

### Evidencia

- El validador confirma: `PATCH { priority: "critical" } -> 500 INTERNAL_ERROR`.
- El código del servicio acepta cambios sin validar que `priority` pertenezca a `['low', 'medium', 'high']` antes de llamar a `updateRequest`.
- La restricción de PostgreSQL está pensada para proteger integridad, no para servir como primera línea de defensa del contrato HTTP.

### Causa confirmada

La causa es que la prioridad se estaba dejando pasar a la capa de persistencia sin una validación contractual previa. El valor no válido fue recibido por la API y terminó provocando un error del motor de base de datos, que se exponía como 500.

### Corrección

La corrección mínima debe estar en el servicio de requests:

- archivo probable: `src/modules/requests/requests.service.js`
- tarea: comprobar que `priority` esté en `['low', 'medium', 'high']` antes de ejecutar `updateRequest` o `insertRequest`.
- mantener intacta la restricción `CHECK` de PostgreSQL como defensa adicional, pero sin depender de ella como única validación.

### Prueba de regresión

La prueba de regresión debe cubrir:

- `an invalid priority answers 400 INVALID_PRIORITY before touching SQL`
- `a valid priority change still works after the fix`

En la validación actual, el caso de prioridad inválida es el que falla.

## Flujo del error

Dónde se crea el error:
- En el caso de INC-701, el error nace cuando un `id` inválido o no numérico llega a la capa de datos sin validación.
- En el caso de INC-702, el error nace cuando una prioridad no permitida se envía al almacenamiento.

Cómo llega al middleware de errores:
- En una implementación correcta, Express reenvía la excepción o la promesa rechazada al middleware de errores registrado tras las rutas.
- Ese middleware debe incluir `requestId` y transformar `AppError` en una respuesta HTTP consistente.

Qué se devuelve al cliente:
- En el contrato correcto, una respuesta con formato:

```json
{
  "error": { "code": "INVALID_REQUEST_ID", "message": "..." },
  "requestId": "req_..."
}
```

o

```json
{
  "error": { "code": "INVALID_PRIORITY", "message": "..." },
  "requestId": "req_..."
}
```

Qué queda solo en el registro del servidor:
- El `error.message` real, el `stack`, detalles de SQL o información técnica interna no deben salir al cliente.
- Solo deben quedar en el log los detalles de diagnóstico del servidor, no la trama completa ni secretos.

## ID de solicitud

La prueba del ID de solicitud consiste en comprobar que la misma cadena se repite en:

- la cabecera `X-Request-Id` de la respuesta HTTP,
- el cuerpo de error como `requestId`,
- y la línea JSON del log del servidor.

Con la validación actual, ese requisito no se cumple: el validador reporta que la cabecera y el cuerpo faltan (`header missing, body missing`).

## Asistencia de IA

La IA ayudó a orientarme hacia los puntos clave del diagnóstico:
- validar la entrada antes de SQL,
- distinguir contrato de infraestructura,
- revisar que el error pase por el middleware central y no se pierda en el default handler.

La hipótesis más útil fue que el problema no era PostgreSQL en sí, sino que la aplicación estaba dejando llegar inputs inválidos a la base de datos y luego explotando en un 500.

La verificación fue directa: ejecutar el validador y comparar la salida real con el comportamiento esperado del contrato.

La parte incompleta o incorrecta en un primer enfoque era asumir que la base de datos "corrigía" el problema; el contrato debe rechazarse en la aplicación antes del SQL y la base debe actuar como defensa adicional, no como origen del error HTTP.

## Duda restante

La duda principal que persiste es cómo quedar completamente alineados con los requisitos de `requestId` y la trazabilidad a nivel de middleware y logger; la validación actual deja claro que ese flujo aún no está completo, y ese es el siguiente bloque a cerrar.

## Validación

Comando ejecutado:

```bash
npm run validate:class-07
```

Resultado comprobado en esta sesión:

```text
CLASS 07 INCIDENT VALIDATION

Baseline
[01/12] Existing contract preserved .......... PASS

Input and errors
[02/12] Invalid id returns 400 ............... FAIL
[03/12] Invalid priority returns 400 ......... FAIL
[04/12] Unknown request returns 404 .......... PASS
[05/12] Invalid transition returns 409 ....... PASS
[06/12] Unexpected errors return 500 ......... PASS
[07/12] Internal details remain hidden ....... PASS

Traceability
[08/12] Response contains request id ......... FAIL
[09/12] Log contains the same request id ..... FAIL
[10/12] Authorization header is not logged ... PASS

Operation
[11/12] Health endpoint responds ............. FAIL
[12/12] Readiness checks PostgreSQL .......... FAIL

Cleanup
Temporary validation data removed successfully.

FINAL RESULT: FAILED (6/12)
```

Conclusión: la actividad aún no está en estado de entrega final porque hay 6 checks pendientes de corrección, principalmente en validación de entrada, trazabilidad (`requestId`) y salud del servicio (`/health` y `/ready`).
