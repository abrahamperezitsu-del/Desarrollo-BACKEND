# Tickets - Respuestas a las 13 preguntas de diagnóstico

## 1. ¿Síntoma vs causa?
**Síntoma:** Lo que el usuario/observador ve (ej. "GET /requests/not-a-number devuelve 500").  
**Causa:** El defecto raíz en el código (ej. "falta validación de formato de ID antes de llamar a Number() y ejecutar SQL").  
En los checks fallidos, el *Expected/Received* muestra el síntoma; el *Review* apunta a la causa.

## 2. ¿Por qué reproducir antes de corregir?
Para confirmar que entiendes el fallo real y no uno imaginado. Un fix sin reproducir puede resolver lo incorrecto o introducir regresiones. La validación (`npm run validate:class-07`) es el mecanismo de reproducción automatizada.

## 3. ¿Error esperado vs inesperado?
- **Esperado (4xx):** Violación de contrato del cliente (ID malformado, prioridad inválida, recurso no encontrado, transición ilegal). El servidor **sabe** por qué falla y responde con código y mensaje claros.
- **Inesperado (500):** Fallo interno (bug, DB caída, error de programación). El cliente recibe genérico "INTERNAL_ERROR"; los detalles van solo a logs.

## 4. ¿Por qué ID inválido→400 e inexistente→404?
- **400 INVALID_REQUEST_ID:** El cliente envió algo que **nunca** puede ser un ID válido (texto, decimal, cero, negativo). Es error de formato/contrato.
- **404 REQUEST_NOT_FOUND:** El cliente envió un ID sintácticamente válido (entero positivo) pero que no existe. No se revela si existe o no (misma respuesta que si no tiene permisos).

## 5. ¿Por qué validar prioridad si hay CHECK en la BD?
La BD es la **segunda** defensa (último recurso). El contrato HTTP (400 INVALID_PRIORITY) es la **primera**. Ventajas de validar en app:
- Respuesta rápida sin round-trip a BD
- Mensaje de error claro y controlado (no error de PG)
- Consistencia aunque cambie la BD
- Testabilidad sin BD real

## 6. ¿Responsabilidad del error middleware?
Centralizar **toda** la traducción error→respuesta HTTP. Elimina try/catch repetidos en rutas. Decide status code, shape del body (`{error:{code,message}, requestId}`), qué loggear y qué ocultar. Debe ser el **último** middleware registrado.

## 7. ¿Por qué después de las rutas?
Express ejecuta middlewares en orden. Un error middleware (4 params) solo ve errores lanzados **antes** de él en la cadena. Si está antes que las rutas, no captura sus errores. Debe ir al final: `app.use(errorHandler)` después de `app.use(notFound)` y todas las rutas.

## 8. ¿Qué permite un request ID?
- **Correlación:** Unir logs, métricas, trazas y respuesta al cliente en una sola petición.
- **Debugging:** Buscar en logs "todo lo de req_abc123".
- **Soporte:** El cliente reporta "error con X-Request-Id: req_abc123" y vas directo a la línea.
- **Idempotencia/Reintentos:** El cliente puede reenviar con mismo ID para detectar duplicados.

## 9. ¿Qué NUNCA va en un log?
- **Authorization header / Bearer token** (credenciales)
- Contraseñas, secrets, API keys
- Cuerpos de request con PII sensible
- Stack traces completos en producción (solo en logs internos de error)
- Connection strings de BD

El `requestLogger` usa **allowlist** explícita: `requestId, method, path, status, durationMs, userId?, errorCode?`.

## 10. ¿/health vs /ready?
| | **/health (liveness)** | **/ready (readiness)** |
|---|---|---|
| Pregunta | ¿El proceso está vivo? | ¿Puede servir tráfico útil? |
| BD | **NO** toca BD | **SÍ** chequea BD (SELECT 1) |
| Fallo BD | Sigue 200 ok | Devuelve 503 not_ready |
| Uso | Kubernetes: restart pod si falla | Kubernetes: quitar del service si falla |
| Responsabilidad | Proceso contenedor | App + dependencias |

## 11. ¿Qué hipótesis propuso la IA?
(En este caso, yo actué como la IA) Hipótesis principales:
1. "Los checks [02] y [03] fallan por validación faltante en capa HTTP/servicio, no en BD"
2. "Los checks [08], [09] fallan porque middlewares requestId/requestLogger/errorHandler no están registrados en app.js"
3. "Los checks [11], [12] fallan porque health.routes.js tiene solo esqueleto sin implementar"
4. "El orden de middlewares en app.js es crítico: requestId → requestLogger → rutas → notFound → errorHandler"

## 12. ¿Cómo la comprobaste?
Ejecutando `npm run validate:class-07` iterativamente tras cada cambio:
- Tras fix [02]: check [02] pasó
- Tras fix [03]: check [03] ya pasaba (validación existía en service)
- Tras registrar middlewares en app.js: checks [08], [09], [10] pasaron
- Tras implementar health.routes.js: checks [11], [12] pasaron
- Validación final: **12/12 PASSED**

## 13. ¿Qué duda conservas?
- **Express 4 vs 5:** El código usa error middleware (4 params) que en Express 4 requiere `next(err)` explícito, pero en Express 5 captura promesas rechazadas automáticamente. ¿La validación corre en Express 5?
- **requestId en error body:** El check [08] pasó, pero ¿se propaga correctamente el requestId cuando el error viene de `respondError()` en routes vs errorHandler centralizado? Las rutas aún usan try/catch + respondError.
- **Race condition en requestLogger:** El evento `finish` es asíncrono; ¿garantiza que `res.locals.errorCode` ya está seteado por errorHandler? En Express sí, porque errorHandler corre antes de enviar respuesta.
- **Inyección checkDatabase:** ¿Los tests de integración usan la inyección o la BD real? La validación parece sabotear el pool temporalmente.