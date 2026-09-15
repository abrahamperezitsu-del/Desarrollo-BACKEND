# Comparación: Antes y Después de la Implementación del Contrato

## 1. Registro de Resultados: Antes vs. Después

### Listado de solicitudes (`GET /requests`)
* **Antes (Andamiaje inicial / Versión Lite):** 
  * Ruta original (en versión Lite): `GET /getRequests` (violaba principios REST al incluir un verbo).
  * En el andamiaje vacío: `GET /requests` respondía con `HTTP/1.1 501 Not Implemented` y el cuerpo `{"error":"Not implemented"}`.
* **Después (Implementación final):** 
  * Responde con `HTTP/1.1 200 OK` y devuelve un arreglo JSON con las solicitudes en memoria. Además, soporta filtrado opcional mediante el parámetro de consulta (ej. `?status=open`).

### Consulta de una solicitud por ID (`GET /requests/:id`)
* **Antes (Versión Lite / Andamiaje):** 
  * En la versión Lite inicial, si el ID no existía, respondía erróneamente con `200 OK` y `{"error": "Request not found"}` (falsedad semántica). En el andamiaje vacío respondía con `501 Not Implemented`.
* **Después (Implementación final):** 
  * Responde con `HTTP/1.1 200 OK` si el recurso existe. Si no se encuentra, responde correctamente con el estado semántico `HTTP/1.1 404 Not Found` y el cuerpo `{"error": "Request not found"}`.

### Creación de una solicitud (`POST /requests`)
* **Antes (Versión Lite / Andamiaje):** 
  * En la versión Lite respondía con un genérico `200 OK` al crear. En el andamiaje vacío respondía con `501 Not Implemented`.
* **Después (Implementación final):** 
  * Si la petición es válida (incluye `title`), responde con `HTTP/1.1 201 Created` y devuelve el objeto recién creado con su ID único y estado inicial asignado. Si falta el título, rechaza la operación respondiendo con `HTTP/1.1 400 Bad Request` y el mensaje `{"error": "Title is required"}`.

---

## 2. Resumen de Decisiones Arquitectónicas Aplicadas

1. **Alineación con el Contrato Escrito:** Se diseñó y documentó primero el archivo `docs/http-contract.md` para fijar las reglas del juego (códigos de estado, entradas y salidas), asegurando que el código posterior fuera una ejecución fiel de dicho contrato.
2. **Uso de Códigos de Estado HTTP Correctos:** Se corrigieron los anti-patrones del código original, adoptando `201 Created` para operaciones exitosas de escritura, `400 Bad Request` para errores de validación de datos del cliente, y `404 Not Found` para recursos ausentes.
3. **Encapsulamiento en el Router:** Toda la lógica de validación, filtrado y respuesta se concentró exclusivamente dentro del archivo `src/routes/requests.routes.js`, respetando la separación de responsabilidades establecida por la plantilla base.